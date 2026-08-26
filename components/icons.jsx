// Yengil SVG ikonkalar (stroke-based, tashqi kutubxonasiz).
const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export const Icon = {
  home: (p) => (
    <svg {...base} {...p}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M9 21v-6h6v6" />
    </svg>
  ),
  book: (p) => (
    <svg {...base} {...p}>
      <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" />
      <path d="M4 19a2 2 0 0 0 2 2h13" />
    </svg>
  ),
  credit: (p) => (
    <svg {...base} {...p}>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </svg>
  ),
  certificate: (p) => (
    <svg {...base} {...p}>
      <circle cx="12" cy="9" r="6" />
      <path d="M8.5 13.5 7 22l5-3 5 3-1.5-8.5" />
    </svg>
  ),
  check: (p) => (
    <svg {...base} {...p}>
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
  shield: (p) => (
    <svg {...base} {...p}>
      <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  registry: (p) => (
    <svg {...base} {...p}>
      <path d="M4 4h16v16H4z" />
      <path d="M4 9h16M9 4v16" />
    </svg>
  ),
  chart: (p) => (
    <svg {...base} {...p}>
      <path d="M3 3v18h18" />
      <path d="M7 15l3-4 3 3 4-6" />
    </svg>
  ),
  bell: (p) => (
    <svg {...base} {...p}>
      <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6" />
      <path d="M10.5 20a1.5 1.5 0 0 0 3 0" />
    </svg>
  ),
  folder: (p) => (
    <svg {...base} {...p}>
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </svg>
  ),
  users: (p) => (
    <svg {...base} {...p}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M3 20a6 6 0 0 1 12 0" />
      <path d="M16 4.5a3.5 3.5 0 0 1 0 7M21 20a6 6 0 0 0-4-5.7" />
    </svg>
  ),
  award: (p) => (
    <svg {...base} {...p}>
      <circle cx="12" cy="8" r="5" />
      <path d="M9 12.5 8 21l4-2.2L16 21l-1-8.5" />
    </svg>
  ),
  search: (p) => (
    <svg {...base} {...p}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4-4" />
    </svg>
  ),
  calendar: (p) => (
    <svg {...base} {...p}>
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M3 9h18M8 2v4M16 2v4" />
    </svg>
  ),
  download: (p) => (
    <svg {...base} {...p}>
      <path d="M12 3v12" />
      <path d="m7 11 5 5 5-5" />
      <path d="M4 21h16" />
    </svg>
  ),
  qr: (p) => (
    <svg {...base} {...p}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <path d="M14 14h3v3M21 21v.01M17 21h4v-4" />
    </svg>
  ),
  mobile: (p) => (
    <svg {...base} {...p}>
      <rect x="6" y="2" width="12" height="20" rx="2.5" />
      <path d="M11 18h2" />
    </svg>
  ),
  trendUp: (p) => (
    <svg {...base} {...p}>
      <path d="m3 17 6-6 4 4 8-8" />
      <path d="M21 9V4h-5" />
    </svg>
  ),
  building: (p) => (
    <svg {...base} {...p}>
      <path d="M4 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16" />
      <path d="M14 9h4a2 2 0 0 1 2 2v10M3 21h18" />
      <path d="M7 7h2M7 11h2M7 15h2" />
    </svg>
  ),
  globe: (p) => (
    <svg {...base} {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.5 3.5 6 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-6-3.5-9s1-6.5 3.5-9" />
    </svg>
  ),
  key: (p) => (
    <svg {...base} {...p}>
      <circle cx="7.5" cy="15.5" r="4.5" />
      <path d="m10.5 12.5 9-9M17 6l2 2M14 9l2 2" />
    </svg>
  ),
  clock: (p) => (
    <svg {...base} {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  ),
  alert: (p) => (
    <svg {...base} {...p}>
      <path d="M12 3 2 20h20z" />
      <path d="M12 10v4M12 17v.01" />
    </svg>
  ),
  sun: (p) => (
    <svg {...base} {...p}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  ),
  moon: (p) => (
    <svg {...base} {...p}>
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8" />
    </svg>
  ),
  flag: (p) => (
    <svg {...base} {...p}>
      <path d="M4 21V4a1 1 0 0 1 1-1h13l-2 4 2 4H5" />
    </svg>
  ),
  plus: (p) => (
    <svg {...base} {...p}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  minus: (p) => (
    <svg {...base} {...p}>
      <path d="M5 12h14" />
    </svg>
  ),
  expand: (p) => (
    <svg {...base} {...p}>
      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
    </svg>
  ),
  // Sidebar bandlariga mos maxsus ikonkalar
  briefcase: (p) => (
    <svg {...base} {...p}>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    </svg>
  ),
  flask: (p) => (
    <svg {...base} {...p}>
      <path d="M10 2v6.3L4.6 18a2 2 0 0 0 1.8 3h11.2a2 2 0 0 0 1.8-3L14 8.3V2" />
      <path d="M8.5 2h7" />
      <path d="M7.2 15h9.6" />
    </svg>
  ),
  megaphone: (p) => (
    <svg {...base} {...p}>
      <path d="m3 11 18-5v12L3 14v-3z" />
      <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
    </svg>
  ),
  clipboard: (p) => (
    <svg {...base} {...p}>
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="m9 14 2 2 4-4" />
    </svg>
  ),
  fileSign: (p) => (
    <svg {...base} {...p}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M8 16.5c1.2-1.4 2-1.4 3 0s1.8 1.4 3 0" />
    </svg>
  ),
  laptop: (p) => (
    <svg {...base} {...p}>
      <rect x="4" y="4" width="16" height="11" rx="2" />
      <path d="M2 19h20" />
    </svg>
  ),
  mail: (p) => (
    <svg {...base} {...p}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-10 6L2 7" />
    </svg>
  ),
  gradCap: (p) => (
    <svg {...base} {...p}>
      <path d="M22 9.5 12 4.5l-10 5 10 5 10-5z" />
      <path d="M6 12v4.8c0 1.2 2.7 2.7 6 2.7s6-1.5 6-2.7V12" />
      <path d="M22 9.5V15" />
    </svg>
  ),
  listCheck: (p) => (
    <svg {...base} {...p}>
      <path d="m3 7 1.7 1.7L8 5.4" />
      <path d="m3 17 1.7 1.7L8 15.4" />
      <path d="M12 6.5h9" />
      <path d="M12 16.5h9" />
      <path d="M12 11.5h9" />
    </svg>
  ),
  phone: (p) => (
    <svg {...base} {...p}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.2 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
};

export default Icon;
