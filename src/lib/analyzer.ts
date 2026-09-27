import puppeteer from 'puppeteer';
import { WebsiteAnalysis } from './types';

const ANALYZE_TIMEOUT_MS = 45000;

interface RawPageData {
  title: string;
  description: string;
  navigation: Array<{ label: string; href: string }>;
  sections: Array<{ type: string; heading?: string; text: string }>;
  headings: Array<{ level: number; text: string }>;
  paragraphs: string[];
  buttons: string[];
  links: Array<{ text: string; href: string }>;
  images: Array<{ src: string; alt?: string }>;
  colors: string[];
  fonts: string[];
  headingSizes: string[];
  bodySize: string;
  spacing: string[];
  layout: { hasSidebar: boolean; hasFooter: boolean; gridStructure?: string; stickyNav: boolean };
  responsive: { breakpoints: string[]; hasMobileMenu: boolean };
  components: string[];
  rawHtmlSummary: string;
}

export async function analyzeWebsite(url: string): Promise<WebsiteAnalysis> {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`Invalid URL: ${url}`);
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error(`Unsupported protocol: ${parsed.protocol} (only http/https)`);
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'
  );

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: ANALYZE_TIMEOUT_MS });
    // Give client-rendered pages a moment to hydrate
    await new Promise((r) => setTimeout(r, 2500));

    const raw = await page.evaluate(collectPageData);
    return shapeAnalysis(url, raw);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('net::')) {
      throw new Error(`Website unreachable (${msg.split(' ')[0]}). Check the URL and that the site is public.`);
    }
    if (msg.includes('timeout') || msg.includes('Timeout')) {
      throw new Error('Website took too long to load (timeout after 45s).');
    }
    throw new Error(`Analysis failed: ${msg}`);
  } finally {
    await browser.close();
  }
}

/** Runs inside the browser: one round-trip collects everything we need. */
function collectPageData(): RawPageData {
  const text = (el: Element | null, max = 300) =>
    (el?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, max);

  const title = document.title;
  const description =
    document.querySelector('meta[name="description"]')?.getAttribute('content') || '';

  // Navigation: links inside nav/header/menu containers
  const navigation: Array<{ label: string; href: string }> = [];
  document.querySelectorAll('nav a, header a, [class*="menu"] a, [class*="navbar"] a').forEach((a) => {
    const label = text(a, 60);
    const href = (a as HTMLAnchorElement).getAttribute('href') || '';
    if (label && href && navigation.length < 15) navigation.push({ label, href });
  });

  // Headings
  const headings: Array<{ level: number; text: string }> = [];
  document.querySelectorAll('h1, h2, h3, h4').forEach((h) => {
    const t = text(h, 120);
    if (t) headings.push({ level: Number(h.tagName[1]), text: t });
  });

  // Paragraphs
  const paragraphs: string[] = [];
  document.querySelectorAll('p').forEach((p) => {
    const t = text(p, 300);
    if (t.length > 40 && paragraphs.length < 25) paragraphs.push(t);
  });

  // Buttons
  const buttons: string[] = [];
  document.querySelectorAll('button, a[class*="btn"], [role="button"]').forEach((b) => {
    const t = text(b, 60);
    if (t && !buttons.includes(t) && buttons.length < 20) buttons.push(t);
  });

  // Links (general)
  const links: Array<{ text: string; href: string }> = [];
  document.querySelectorAll('a[href]').forEach((a) => {
    const t = text(a, 60);
    const href = (a as HTMLAnchorElement).getAttribute('href') || '';
    if (t && href.startsWith('http') && links.length < 40) links.push({ text: t, href });
  });

  // Images
  const images: Array<{ src: string; alt?: string }> = [];
  document.querySelectorAll('img').forEach((img) => {
    const el = img as HTMLImageElement;
    if (el.src && !el.src.startsWith('data:') && images.length < 25) {
      images.push({ src: el.src, alt: el.alt || undefined });
    }
  });

  // Colors by frequency
  const colorCount = new Map<string, number>();
  document.querySelectorAll('body *').forEach((el) => {
    if (colorCount.size > 4000) return;
    const style = window.getComputedStyle(el);
    for (const c of [style.backgroundColor, style.color]) {
      if (!c || c === 'rgba(0, 0, 0, 0)' || c === 'transparent') continue;
      colorCount.set(c, (colorCount.get(c) || 0) + 1);
    }
  });
  const colors = [...colorCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([c]) => c);

  // Fonts and sizes
  const fontSet = new Map<string, number>();
  const headingSizes = new Set<string>();
  let bodySize = '16px';
  document.querySelectorAll('h1, h2, h3, p, a, button').forEach((el) => {
    const style = window.getComputedStyle(el);
    fontSet.set(style.fontFamily.split(',')[0].replace(/["']/g, ''), (fontSet.get(style.fontFamily.split(',')[0]) || 0) + 1);
    if (/^H[1-3]$/.test(el.tagName)) headingSizes.add(style.fontSize);
    if (el.tagName === 'P') bodySize = style.fontSize;
  });
  const fonts = [...fontSet.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([f]) => f);

  // Spacing samples from major blocks
  const spacing: string[] = [];
  document.querySelectorAll('section, header, footer, main > div').forEach((el) => {
    const style = window.getComputedStyle(el);
    const sample = `${style.paddingTop}/${style.paddingBottom}`;
    if (!spacing.includes(sample) && spacing.length < 6) spacing.push(sample);
  });

  // Layout
  const navEl = document.querySelector('nav, header, [class*="navbar"]');
  const stickyNav = navEl
    ? ['sticky', 'fixed'].includes(window.getComputedStyle(navEl).position)
    : false;
  let gridStructure: string | undefined;
  const gridEl = document.querySelector('[class*="grid"], [style*="grid"]');
  if (gridEl) gridStructure = window.getComputedStyle(gridEl).gridTemplateColumns.slice(0, 80);

  // Responsive hints
  const breakpoints: string[] = [];
  try {
    for (let i = 0; i < Math.min(document.styleSheets.length, 6); i++) {
      const rules = document.styleSheets[i].cssRules;
      for (let j = 0; j < Math.min(rules.length, 80); j++) {
        const rule = rules[j];
        if (rule instanceof CSSMediaRule && /width/.test(rule.conditionText || '')) {
          const cond = rule.conditionText.replace(/\s+/g, ' ');
          if (!breakpoints.includes(cond) && breakpoints.length < 6) breakpoints.push(cond);
        }
      }
    }
  } catch {
    // cross-origin stylesheets are inaccessible; fine
  }
  const hasMobileMenu = !!document.querySelector(
    '[class*="hamburger"], [aria-label*="menu" i], button[class*="menu"], [class*="mobile-menu"]'
  );

  // Sections: semantic blocks + top-level content divs
  const sections: Array<{ type: string; heading?: string; text: string }> = [];
  const seen = new Set<Element>();
  document.querySelectorAll('header, nav, section, article, aside, footer, main > div, body > div').forEach((el) => {
    if (seen.has(el) || sections.length >= 14) return;
    const t = text(el, 400);
    if (t.length < 30) return;
    seen.add(el);
    const heading = text(el.querySelector('h1, h2, h3'), 100) || undefined;
    sections.push({
      type: el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? `.${el.className.trim().split(/\s+/)[0]}` : ''),
      heading,
      text: t,
    });
  });

  // Component heuristics
  const components: string[] = [];
  const has = (sel: string) => document.querySelectorAll(sel).length > 0;
  if (navigation.length) components.push('Navbar');
  if (has('footer')) components.push('Footer');
  if (document.querySelector('h1')) components.push('Hero');
  if (has('[class*="card"], [class*="tile"]')) components.push('Cards');
  if (has('form input, form textarea')) components.push('ContactForm');
  if (has('[class*="price"], [class*="pricing"]')) components.push('PricingTable');
  if (has('[class*="testimonial"], [class*="review"]')) components.push('Testimonials');
  if (has('[class*="faq"], details')) components.push('FAQ');
  if (has('[class*="carousel"], [class*="slider"], [class*="swiper"]')) components.push('Carousel');
  if (images.length > 3) components.push('ImageGallery');
  if (has('[class*="stat"], [class*="counter"]')) components.push('Stats');

  // Compact structural outline instead of full HTML
  const outline: string[] = [];
  const walk = (el: Element, depth: number) => {
    if (depth > 3 || outline.length > 60) return;
    const cls = typeof el.className === 'string' ? el.className.trim().split(/\s+/).slice(0, 2).join('.') : '';
    outline.push(`${'  '.repeat(depth)}<${el.tagName.toLowerCase()}${cls ? ` class="${cls}"` : ''}>`);
    Array.from(el.children).slice(0, 8).forEach((child) => walk(child, depth + 1));
  };
  Array.from(document.body.children).slice(0, 6).forEach((el) => walk(el, 0));

  return {
    title,
    description,
    navigation,
    sections,
    headings: headings.slice(0, 30),
    paragraphs,
    buttons,
    links,
    images,
    colors,
    fonts,
    headingSizes: [...headingSizes],
    bodySize,
    spacing,
    layout: {
      hasSidebar: has('aside, [class*="sidebar"]'),
      hasFooter: has('footer'),
      gridStructure,
      stickyNav,
    },
    responsive: { breakpoints, hasMobileMenu },
    components,
    rawHtmlSummary: outline.join('\n'),
  };
}

function shapeAnalysis(url: string, raw: RawPageData): WebsiteAnalysis {
  return {
    url,
    title: raw.title,
    description: raw.description,
    navigation: raw.navigation,
    sections: raw.sections,
    headings: raw.headings,
    paragraphs: raw.paragraphs,
    buttons: raw.buttons,
    links: raw.links,
    images: raw.images,
    colors: raw.colors,
    fonts: raw.fonts,
    typography: { headingSizes: raw.headingSizes, bodySize: raw.bodySize },
    layout: raw.layout,
    responsive: raw.responsive,
    spacing: raw.spacing,
    components: raw.components,
    rawHtmlSummary: raw.rawHtmlSummary,
  };
}
