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
      <defs>
        <linearGradient id="cloner-tile" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#27272a" />
          <stop offset="1" stopColor="#0f0f11" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#cloner-tile)" />
      <g fill="none" stroke="#a5b4fc" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="6.5" y="10.5" width="16" height="13" rx="2.5" />
        <path d="M6.5 14.5h16" />
      </g>
      <g stroke="#a5b4fc" strokeWidth="1.5" strokeLinecap="round" opacity="0.55">
        <path d="M9.5 18h7.5M9.5 20.5h10" />
      </g>
      <circle cx="9.3" cy="12.5" r="0.95" fill="#818cf8" />
      <path d="M24.5 3.4 25.7 6l2.6 1.2-2.6 1.2-1.2 2.6-1.2-2.6L19.7 7.2l2.6-1.2z" fill="#6366f1" />
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

export const Code = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="m9 8-5 4 5 4M15 8l5 4-5 4" />
  </svg>
);

export const Palette = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 21a9 9 0 1 1 9-9c0 2-1.5 3-3 3h-1.5a2 2 0 0 0-1.4 3.4c.5.6.1 2.6-3.1 2.6z" />
    <circle cx="7.5" cy="12" r="1" />
    <circle cx="9.5" cy="8" r="1" />
    <circle cx="14" cy="7.5" r="1" />
  </svg>
);

export const TypeIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M5 7V5h14v2M12 5v14M9 19h6" />
  </svg>
);

export const Menu = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4 7h16M4 12h16M4 17h10" />
  </svg>
);

export const Layout = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
    <path d="M3.5 9.5h17M10 9.5v10" />
  </svg>
);

export const AlignBottom = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4 20h16" />
    <rect x="4" y="12.5" width="16" height="4.5" rx="1.5" />
    <path d="M8 9V4h8v5" />
  </svg>
);

export const Pointer = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M8 3.5v11l2.8-2.4 1.7 4.4 2.6-1-1.7-4.4H18z" />
  </svg>
);

export const Tag = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12.5 3.5H20V11l-8.7 8.7a1.5 1.5 0 0 1-2.1 0l-6.6-6.6a1.5 1.5 0 0 1 0-2.1z" />
    <circle cx="16.5" cy="7" r="1.2" />
  </svg>
);

export const Quote = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M9 6.5C6.5 8 5 10.2 5 12.8V17h4.5v-4.5H7.2c.2-1.6 1-2.8 2.4-3.7zM18.5 6.5C16 8 14.5 10.2 14.5 12.8V17H19v-4.5h-2.3c.2-1.6 1-2.8 2.4-3.7z" />
  </svg>
);

export const Users = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3.5 19c.6-3 2.8-4.6 5.5-4.6S14 16 14.6 19" />
    <path d="M16 5.6a3.2 3.2 0 0 1 0 6.3M17.5 14.6c2 .6 3.2 2.2 3.6 4.4" />
  </svg>
);

export const ImageFrame = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="3.5" y="5" width="17" height="14" rx="2" />
    <circle cx="9" cy="10" r="1.6" />
    <path d="m4.5 17 4.5-4 4 3.5 2.5-2.5 3.5 3.5" />
  </svg>
);

export const Mail = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="3" y="5.5" width="18" height="13" rx="2" />
    <path d="m4 7.5 8 5.5 8-5.5" />
  </svg>
);

export const HelpCircle = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.6 9.4a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2-2.4 3.5M12 17.2h.01" />
  </svg>
);

export const ShoppingBag = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M5 8h14l-1 11.5H6z" />
    <path d="M9 8V6.2a3 3 0 0 1 6 0V8" />
  </svg>
);

export const Zap = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M13.5 3 6 13h4.5L10 21l7.5-10H13z" />
  </svg>
);

export const Shield = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 3.2 5 5.8v5.6c0 4 2.9 7.2 7 8.4 4.1-1.2 7-4.4 7-8.4V5.8z" />
    <path d="m9.5 12 1.8 1.8 3.4-3.6" />
  </svg>
);

export const Blocks = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="3.5" y="3.5" width="8" height="8" rx="1.8" />
    <rect x="12.5" y="12.5" width="8" height="8" rx="1.8" />
    <path d="M16.5 3.5a3 3 0 0 1 3 3v2h-2V6.5a3 3 0 0 0-3-3h-2v-2z" />
  </svg>
);

export const CheckCircle = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8.2 12.3 2.6 2.6 5-5.4" />
  </svg>
);

export const Scan = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4 8.5V6a2 2 0 0 1 2-2h2.5M20 8.5V6a2 2 0 0 0-2-2h-2.5M4 15.5V18a2 2 0 0 0 2 2h2.5M20 15.5V18a2 2 0 0 1-2 2h-2.5" />
    <path d="M4 12h16" />
  </svg>
);
