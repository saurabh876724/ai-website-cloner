import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

let openaiClient: OpenAI | null = null;
let geminiClient: GoogleGenerativeAI | null = null;

export type Provider = 'gemini' | 'openai' | 'ollama';

export function getProvider(): Provider {
  if (process.env.USE_GEMINI === 'true' || (!process.env.USE_OLLAMA && !process.env.OPENAI_API_KEY && process.env.GEMINI_API_KEY)) {
    return 'gemini';
  }
  if (process.env.USE_OLLAMA === 'true') return 'ollama';
  return 'openai';
}

export function getModelName(): string {
  const provider = getProvider();
  if (provider === 'gemini') return process.env.GEMINI_MODEL || 'gemini-3.8-flash';
  if (provider === 'ollama') return process.env.OLLAMA_MODEL || 'qwen2.5-coder:7b';
  return process.env.OPENAI_MODEL || 'gpt-4o';
}

/**
 * Free-tier models are rate-limited and overloaded independently of each other, so a
 * comma-separated chain is tried in order when the primary cannot serve the request.
 */
export function getGeminiFallbackModels(): string[] {
  return (process.env.GEMINI_MODEL_FALLBACK || 'gemini-3.6-flash,gemini-3.1-flash-lite')
    .split(',')
    .map((m) => m.trim())
    .filter(Boolean);
}

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    if (getProvider() === 'ollama') {
      openaiClient = new OpenAI({
        baseURL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1',
        apiKey: 'ollama',
      });
    } else {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('No AI provider configured. Set GEMINI_API_KEY (with USE_GEMINI=true), OPENAI_API_KEY, or USE_OLLAMA=true in .env.local');
      }
      openaiClient = new OpenAI({ apiKey });
    }
  }
  return openaiClient;
}

function getGeminiClient(): GoogleGenerativeAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set. Get a free key at https://aistudio.google.com/app/api-keys');
    }
    geminiClient = new GoogleGenerativeAI(apiKey);
  }
  return geminiClient;
}

export interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
}

// Transient Gemini capacity/rate errors worth retrying. Backoff is capped so a
// sustained outage fails fast instead of hanging the job forever.
const GEMINI_RETRY_DELAYS_MS = [2000, 4000, 8000];
const GEMINI_FALLBACK_RETRY_DELAYS_MS = [2000, 4000];

// Authentication/configuration failures: retrying can never fix these, and burning
// backoff on them hides the real problem from the user.
const NON_RETRYABLE_STATUSES = new Set([400, 401, 403, 404, 405, 409, 422]);
const NON_RETRYABLE_REASONS = /UNAUTHENTICATED|PERMISSION_DENIED|INVALID_ARGUMENT|NOT_FOUND|API_KEY_NOT_VALID|API key not valid|quota project|FAILED_PRECONDITION/i;

const TRANSIENT_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504, 520, 529]);
const TRANSIENT_REASONS = /RESOURCE_EXHAUSTED|UNAVAILABLE|DEADLINE_EXCEEDED|INTERNAL|Too Many Requests|Service Unavailable|rate limit|overloaded|server error/i;
// Transport-level failures never reach an HTTP status and are safe to retry.
const NETWORK_TRANSIENT = /fetch failed|Failed to fetch|ECONNRESET|ECONNREFUSED|ETIMEDOUT|ENOTFOUND|EAI_AGAIN|socket hang up|network timeout|TLS/i;

export const GEMINI_UNAVAILABLE_MESSAGE =
  'Gemini is temporarily unavailable. Please try again in a moment.';

function errorText(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

/** The SDK formats failures as "...: [429 Too Many Requests] {...}" — take that status. */
function httpStatusOf(text: string): number | null {
  const match = text.match(/\[(\d{3})[^\]]*\]/) ?? text.match(/\b(4\d\d|5\d\d)\b/);
  const code = match ? Number(match[match.length - 1]) : NaN;
  return Number.isFinite(code) ? code : null;
}

/**
 * Classify a Gemini failure: retry only capacity/rate/transport errors, never
 * authentication or configuration ones.
 */
export function geminiFailureKind(err: unknown): 'transient' | 'fatal' {
  const text = errorText(err);
  const status = httpStatusOf(text);
  if (status !== null && NON_RETRYABLE_STATUSES.has(status)) return 'fatal';
  if (status !== null && TRANSIENT_STATUSES.has(status)) return 'transient';
  if (NON_RETRYABLE_REASONS.test(text)) return 'fatal';
  if (TRANSIENT_REASONS.test(text) || NETWORK_TRANSIENT.test(text)) return 'transient';
  // Nothing recognisable: treat as fatal so a configuration problem surfaces with its
  // own message instead of being retried three times and reported as an outage.
  return 'fatal';
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** One Gemini model with its own bounded retry/backoff budget. Throws the last error. */
async function generateWithGemini(
  modelName: string,
  retryDelaysMs: number[],
  system: string,
  user: string,
  temperature: number,
  maxTokens: number
): Promise<string> {
  const model = getGeminiClient().getGenerativeModel({ model: modelName, systemInstruction: system });
  let lastError: unknown = null;

  // initial call + one attempt per configured delay
  for (let retry = 0; retry <= retryDelaysMs.length; retry++) {
    if (retry > 0) {
      const delayMs = retryDelaysMs[retry - 1];
      console.log(
        `[ai] Gemini request attempt ${retry}/${retryDelaysMs.length} after ${delayMs / 1000}s backoff (model=${modelName})`
      );
      await sleep(delayMs);
    } else {
      console.log(`[ai] Gemini request started (model=${modelName})`);
    }

    try {
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: user }] }],
        generationConfig: { temperature, maxOutputTokens: maxTokens },
      });
      if (retry > 0) console.log(`[ai] Gemini recovered on retry ${retry}/${retryDelaysMs.length} (model=${modelName})`);
      return result.response.text();
    } catch (err) {
      lastError = err;
      if (geminiFailureKind(err) !== 'transient') {
        console.error(`[ai] Gemini request failed (not retryable): ${errorText(err).slice(0, 200)}`);
        break;
      }
      console.log(`[ai] Gemini transient error: ${errorText(err).slice(0, 160)}`);
    }
  }

  throw lastError instanceof Error ? lastError : new Error(errorText(lastError));
}

export async function chat(system: string, user: string, opts: ChatOptions = {}): Promise<string> {
  const provider = getProvider();
  const temperature = opts.temperature ?? 0.3;
  const maxTokens = opts.maxTokens ?? 8192;

  if (provider === 'gemini') {
    // Free-tier models hit per-model capacity limits (429/503) independently, so a
    // rate-limited primary falls through to a second model instead of failing the job.
    const primary = getModelName();
    const candidates: Array<{ model: string; retries: number[] }> = [{ model: primary, retries: GEMINI_RETRY_DELAYS_MS }];
    for (const model of getGeminiFallbackModels()) {
      if (model !== primary && !candidates.some((c) => c.model === model)) {
        candidates.push({ model, retries: GEMINI_FALLBACK_RETRY_DELAYS_MS });
      }
    }

    let lastError: unknown = null;
    for (const [index, candidate] of candidates.entries()) {
      if (index > 0) {
        console.log(`[ai] ${candidates[index - 1].model} exhausted, switching to fallback model ${candidate.model}`);
      }
      try {
        return await generateWithGemini(candidate.model, candidate.retries, system, user, temperature, maxTokens);
      } catch (err) {
        lastError = err;
        if (geminiFailureKind(err) !== 'transient') {
          // Auth/configuration failures cannot be fixed by another model either.
          throw err instanceof Error ? err : new Error(errorText(err));
        }
      }
    }

    console.error(`[ai] Gemini still unavailable after ${candidates.length} model(s): ${errorText(lastError).slice(0, 200)}`);
    throw new Error(GEMINI_UNAVAILABLE_MESSAGE);
  }

  const response = await getOpenAIClient().chat.completions.create({
    model: getModelName(),
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    temperature,
    max_tokens: maxTokens,
  });
  return response.choices[0].message.content || '';
}

/** Extract a JSON object or array from LLM output, tolerating code fences and prose. */
export function extractJson<T>(text: string): T {
  let candidate = text.trim();

  const fence = candidate.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) candidate = fence[1].trim();

  const firstBrace = candidate.search(/[{[]/);
  if (firstBrace === -1) throw new Error('No JSON found in model output');
  candidate = candidate.slice(firstBrace);

  const isOpenBrace = candidate.startsWith('{');
  const lastBrace = isOpenBrace ? candidate.lastIndexOf('}') : candidate.lastIndexOf(']');
  if (lastBrace === -1) throw new Error('Unbalanced JSON in model output');
  candidate = candidate.slice(0, lastBrace + 1);

  return JSON.parse(candidate) as T;
}
