import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: false,
  width: 16,
  height: 16,
};

export function LogoMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden focusable="false" className={className}>
      <rect width="32" height="32" rx="8" fill="#18181b" />
      <path
        d="M9 20.5 15 11l3 5 2-3 3.5 7.5z"
        fill="none"
        stroke="#a5b4fc"
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
      <circle cx="22.5" cy="10" r="2" fill="#6366f1" />
    </svg>
  );
}

export const Globe = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
  </svg>
);

export const Sparkles = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 4l1.6 4.2L18 10l-4.4 1.8L12 16l-1.6-4.2L6 10l4.4-1.8L12 4z" />
    <path d="M18.5 16.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8z" />
  </svg>
);

export const Check = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export const Close = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

export const Spinner = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 3a9 9 0 1 0 9 9" />
  </svg>
);

export const ExternalLink = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M14 4h6v6M20 4l-8.5 8.5" />
    <path d="M18 14v5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 19V8a1.5 1.5 0 0 1 1.5-1.5H10" />
  </svg>
);

export const Terminal = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="3" y="4" width="18" height="16" rx="2.5" />
    <path d="M7 9l3 3-3 3M12.5 15H17" />
  </svg>
);

export const ChevronDown = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const AlertTriangle = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M10.3 4.3 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0z" />
    <path d="M12 9v4M12 17h.01" />
  </svg>
);

export const Clock = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3.5 2" />
  </svg>
);

export const Wrench = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M14.5 6.5a3.5 3.5 0 0 1 4.9 4.4l-8.3 8.3a2.4 2.4 0 0 1-3.4-3.4l8.3-8.3a3.5 3.5 0 0 0-4.4-4.9l2.4 2.4-1.7 1.7-2.4-2.4" />
  </svg>
);

export const Cube = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
    <path d="M4 7.5 12 12l8-4.5M12 12v9" />
  </svg>
);

export const Layers = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 3 3 7.5 12 12l9-4.5L12 3z" />
    <path d="m3 12.5 9 4.5 9-4.5M3 16.5 12 21l9-4.5" />
  </svg>
);

export const Activity = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M3 12h4l2.5-6 4 12L16 12h5" />
  </svg>
);

export const Rocket = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M13.5 4.5C16 2 20 2.5 20 2.5s.5 4-2 6.5l-3.5 3.5-4-4 3-4z" />
    <path d="M10.5 8.5 6 10l-1.5 4 3.5.5M15 15l.5 3.5 4-1.5-1.5-4.5" />
    <path d="M8 16l-2 2" />
  </svg>
);

export const Hammer = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M14.5 3.5 20 9l-2.5 2.5L19 13l-2.5 2.5-1.5-1.5-6 6a2 2 0 0 1-3-3l6-6L10 9.5 12.5 7 14 8.5z" />
  </svg>
);

export const Brain = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M9.5 4.5A2.5 2.5 0 0 0 7 7a2.5 2.5 0 0 0-1.5 4.5A2.5 2.5 0 0 0 7 16a2.5 2.5 0 0 0 2.5 2.5c.8 0 1.5-.4 2-1V5.5c-.5-.6-1.2-1-2-1z" />
    <path d="M14.5 4.5A2.5 2.5 0 0 1 17 7a2.5 2.5 0 0 1 1.5 4.5A2.5 2.5 0 0 1 17 16a2.5 2.5 0 0 1-2.5 2.5c-.8 0-1.5-.4-2-1" />
  </svg>
);

export const ArrowRight = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const Refresh = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M20 11a8 8 0 1 0-.6 4" />
    <path d="M20 5v6h-6" />
  </svg>
);

export const Grid = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
  </svg>
);
