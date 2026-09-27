import { chat, extractJson } from './ai';
import { ImplementationPlan, WebsiteAnalysis } from './types';

/** Compact view of the analysis so we never ship raw HTML to the model. */
function compactAnalysis(a: WebsiteAnalysis): string {
  return JSON.stringify(
    {
      title: a.title,
      description: a.description.slice(0, 200),
      navigation: a.navigation.map((n) => n.label),
      headings: a.headings.slice(0, 15),
      sections: a.sections.map((s) => ({ type: s.type, heading: s.heading, textSample: s.text.slice(0, 150) })),
      buttons: a.buttons.slice(0, 10),
      imageCount: a.images.length,
      imageAlts: a.images.slice(0, 8).map((i) => i.alt || i.src.slice(-40)),
      colors: a.colors.slice(0, 8),
      fonts: a.fonts.slice(0, 3),
      typography: a.typography,
      layout: a.layout,
      responsive: a.responsive,
      spacing: a.spacing,
      detectedComponents: a.components,
      structureOutline: a.rawHtmlSummary,
    },
    null,
    1
  );
}

export async function planImplementation(analysis: WebsiteAnalysis): Promise<ImplementationPlan> {
  const output = await chat(
    `You are a senior frontend architect. You convert a website analysis into a concise implementation specification for a Next.js (App Router) + TypeScript + Tailwind CSS clone.
Return ONLY a valid JSON object, no markdown fences, no commentary.`,
    `Create an implementation plan for recreating this website as a NEW original implementation (not a copy).

WEBSITE ANALYSIS:
${compactAnalysis(analysis)}

Return JSON with exactly this shape:
{
  "pageStructure": [ { "section": "hero", "component": "Hero", "purpose": "one-line purpose" } ],
  "components": [ { "name": "Navbar", "purpose": "one-line purpose" } ],
  "hierarchy": "one paragraph: how components nest inside page.tsx",
  "styling": {
    "palette": { "primary": "#hex or css color", "background": "...", "text": "...", "accent": "..." },
    "fonts": ["font family stack"],
    "spacing": "one-line spacing rhythm, e.g. sections py-16/py-24",
    "approach": "one-line: Tailwind utility strategy"
  },
  "responsive": "one-line mobile-first strategy",
  "visualNotes": ["up to 6 short notes on distinctive visual traits to reproduce"]
}

Rules:
- Use 4-10 reusable components (Navbar, Hero, Footer plus one per major section).
- pageStructure order must match the original page order.
- palette values must come from the analyzed colors where possible.`,
    { temperature: 0.4, maxTokens: 4000 }
  );

  const plan = extractJson<ImplementationPlan>(output);
  if (!Array.isArray(plan.components) || !Array.isArray(plan.pageStructure)) {
    throw new Error('AI planner returned an invalid plan structure');
  }
  return plan;
}
