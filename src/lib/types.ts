export interface WebsiteAnalysis {
  url: string;
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
  typography: { headingSizes: string[]; bodySize: string };
  layout: {
    hasSidebar: boolean;
    hasFooter: boolean;
    gridStructure?: string;
    stickyNav: boolean;
  };
  responsive: { breakpoints: string[]; hasMobileMenu: boolean };
  spacing: string[];
  components: string[];
  rawHtmlSummary: string;
}

export interface ImplementationPlan {
  pageStructure: Array<{ section: string; component: string; purpose: string }>;
  components: Array<{ name: string; purpose: string }>;
  hierarchy: string;
  styling: {
    palette: Record<string, string>;
    fonts: string[];
    spacing: string;
    approach: string;
  };
  responsive: string;
  visualNotes: string[];
}

export interface GeneratedFile {
  path: string;
  content: string;
}

export type JobStage =
  | 'queued'
  | 'analyzing'
  | 'planning'
  | 'generating'
  | 'validating'
  | 'fixing'
  | 'ready'
  | 'error';

export interface JobStep {
  name: string;
  status: 'pending' | 'running' | 'done' | 'error';
  detail?: string;
}

export interface Job {
  id: string;
  type: 'clone' | 'modify';
  url?: string;
  projectId?: string;
  instruction?: string;
  stage: JobStage;
  steps: JobStep[];
  logs: string[];
  analysis?: WebsiteAnalysis;
  plan?: ImplementationPlan;
  buildStatus: 'unknown' | 'pass' | 'fail';
  repairAttempts: number;
  previewUrl?: string;
  previewPort?: number;
  generatedComponents: string[];
  error?: string;
  startedAt: number;
  finishedAt?: number;
}
