import type { SVGProps } from 'react';

/**
 * Empty-state art: a page being read on the left, a component graph emerging on the right.
 * Purely decorative — every shape is an abstract wireframe, never a stand-in for real site content.
 */
export function AgentRunArt({ className = '', ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 320 184"
      fill="none"
      aria-hidden
      focusable="false"
      className={className}
      {...rest}
    >
      <defs>
        <linearGradient id="art-page" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#f7f7f8" />
        </linearGradient>
        <linearGradient id="art-scan-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6366f1" stopOpacity="0" />
          <stop offset="0.65" stopColor="#6366f1" stopOpacity="0.08" />
          <stop offset="1" stopColor="#6366f1" stopOpacity="0.22" />
        </linearGradient>
        <clipPath id="art-page-clip">
          <rect x="20" y="24" width="150" height="136" rx="10" />
        </clipPath>
      </defs>

      <rect x="20" y="24" width="150" height="136" rx="10" fill="url(#art-page)" stroke="#e6e6ea" />
      <g clipPath="url(#art-page-clip)">
        <path d="M20 48h150" stroke="#e6e6ea" />
        <circle cx="32" cy="36" r="2.5" fill="#d6d6db" />
        <circle cx="41" cy="36" r="2.5" fill="#d6d6db" />
        <circle cx="50" cy="36" r="2.5" fill="#d6d6db" />
        <rect x="32" y="62" width="62" height="7" rx="3.5" fill="#e0e7ff" />
        <rect x="32" y="77" width="94" height="5" rx="2.5" fill="#ececee" />
        <rect x="32" y="87" width="76" height="5" rx="2.5" fill="#ececee" />
        <rect x="32" y="104" width="36" height="26" rx="5" fill="#f1f1f3" stroke="#e6e6ea" />
        <rect x="76" y="104" width="36" height="26" rx="5" fill="#f1f1f3" stroke="#e6e6ea" />
        <rect x="120" y="104" width="36" height="26" rx="5" fill="#f1f1f3" stroke="#e6e6ea" />
        <rect x="32" y="140" width="52" height="8" rx="4" fill="#e0e7ff" />
        <rect className="art-scan" x="20" y="24" width="150" height="40" fill="url(#art-scan-fill)" />
      </g>

      <path
        d="M178 92h46"
        stroke="#c7cbf5"
        strokeWidth="2"
        strokeDasharray="5 6"
        className="art-flow"
      />
      <path
        d="m222 86 6 6-6 6"
        stroke="#a5b4fc"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <g stroke="#e6e6ea">
        <path d="M254 60v18M254 106v26" />
      </g>
      <rect x="236" y="24" width="36" height="28" rx="8" fill="#ffffff" stroke="#e0e7ff" />
      <rect x="244" y="34" width="20" height="4" rx="2" fill="#c7cbf5" />
      <rect x="236" y="78" width="36" height="28" rx="8" fill="#eef2ff" stroke="#c7cbf5" />
      <rect x="244" y="88" width="20" height="4" rx="2" fill="#6366f1" opacity="0.5" />
      <rect x="236" y="132" width="36" height="28" rx="8" fill="#ffffff" stroke="#e0e7ff" />
      <rect x="244" y="142" width="20" height="4" rx="2" fill="#c7cbf5" />
      <path
        d="m298 34 2.2 4.8 4.8 2.2-4.8 2.2-2.2 4.8-2.2-4.8-4.8-2.2 4.8-2.2z"
        fill="#6366f1"
        opacity="0.85"
      />
    </svg>
  );
}

/** Compact wireframe badge for generated-site cards. */
export function SiteFrameGlyph({ className = '', ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 36 32" fill="none" aria-hidden focusable="false" className={className} {...rest}>
      <rect x="1" y="1" width="34" height="30" rx="6" fill="#f7f7f8" stroke="#e6e6ea" />
      <path d="M1 10h34" stroke="#e6e6ea" />
      <circle cx="7" cy="5.5" r="1.6" fill="#d6d6db" />
      <circle cx="12.5" cy="5.5" r="1.6" fill="#d6d6db" />
      <rect x="6" y="15" width="14" height="4" rx="2" fill="#c7cbf5" />
      <rect x="6" y="22" width="22" height="3" rx="1.5" fill="#e4e4e7" />
    </svg>
  );
}
