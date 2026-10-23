"use client";

import React from "react";

/**
 * Custom geometric marks for the front showcase.
 * Drawn on a 24x24 grid with 1.5 stroke so they sit visually with the
 * system type instead of reading as stock icon-library glyphs.
 */

type MarkProps = {
  className?: string;
};

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function MarkLedger({ className }: MarkProps) {
  return (
    <svg {...base} className={className}>
      <rect x="3.25" y="3.25" width="17.5" height="17.5" rx="2.5" />
      <path d="M3.25 9.25h17.5" />
      <path d="M9.75 9.25v11.5" />
      <path d="M13 13h4.5M13 16.25h3" />
    </svg>
  );
}

export function MarkContacts({ className }: MarkProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="9" cy="8.5" r="3.25" />
      <path d="M3.5 19.25c0-3.05 2.46-5.5 5.5-5.5s5.5 2.45 5.5 5.5" />
      <path d="M16.25 6.4a2.6 2.6 0 0 1 0 5" />
      <path d="M17.6 14.1c1.74.62 2.9 2.3 2.9 4.4" />
    </svg>
  );
}

export function MarkFunnel({ className }: MarkProps) {
  return (
    <svg {...base} className={className}>
      <path d="M3.5 4.75h17l-6.25 7.1v6.4l-4.5 2.1v-8.5z" />
      <path d="M8.1 9.1h7.8" />
    </svg>
  );
}

export function MarkSchedule({ className }: MarkProps) {
  return (
    <svg {...base} className={className}>
      <rect x="3.25" y="5.25" width="17.5" height="15.5" rx="2.5" />
      <path d="M3.25 10.25h17.5" />
      <path d="M8 3.25v3.5M16 3.25v3.5" />
      <path d="M8.4 14.4l1.9 1.9 3.4-3.4" />
    </svg>
  );
}

export function MarkTemplate({ className }: MarkProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4.25 6.25a2 2 0 0 1 2-2h11.5a2 2 0 0 1 2 2v7.5a2 2 0 0 1-2 2H9.5L5.4 19.4a.6.6 0 0 1-.98-.46V6.25z" />
      <path d="M8.4 8.6h7.2M8.4 12.1h4.4" />
    </svg>
  );
}

export function MarkTimeline({ className }: MarkProps) {
  return (
    <svg {...base} className={className}>
      <path d="M8.25 4.25v15.5" />
      <circle cx="8.25" cy="8" r="1.9" />
      <circle cx="8.25" cy="16" r="1.9" />
      <path d="M12.4 8h7.35M12.4 16h5.35" />
    </svg>
  );
}

export function MarkGauge({ className }: MarkProps) {
  return (
    <svg {...base} className={className}>
      <path d="M3.75 17.5a8.25 8.25 0 1 1 16.5 0" />
      <path d="M12 17.5l3.6-5.2" />
      <path d="M3.75 17.5h3.1M17.15 17.5h3.1" />
    </svg>
  );
}

export function MarkArrowUpRight({ className }: MarkProps) {
  return (
    <svg {...base} className={className}>
      <path d="M7.5 16.5l9-9" />
      <path d="M9.75 7.5h6.75v6.75" />
    </svg>
  );
}

export function MarkSearch({ className }: MarkProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="10.75" cy="10.75" r="6.5" />
      <path d="M15.6 15.6l4.15 4.15" />
    </svg>
  );
}

export function MarkPlus({ className }: MarkProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 5.5v13M5.5 12h13" />
    </svg>
  );
}

export function MarkExport({ className }: MarkProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 3.75v11.5" />
      <path d="M8.1 11.6L12 15.5l3.9-3.9" />
      <path d="M4.25 17.25v1.5a2 2 0 0 0 2 2h11.5a2 2 0 0 0 2-2v-1.5" />
    </svg>
  );
}

export function MarkCheck({ className }: MarkProps) {
  return (
    <svg {...base} className={className}>
      <path d="M5.25 12.4l4.3 4.3 9.2-9.2" />
    </svg>
  );
}

export function MarkSettings({ className }: MarkProps) {
  return (
    <svg {...base} className={className}>
      <path d="M3.5 7.25h5.1M12.4 7.25h8.1" />
      <path d="M3.5 16.75h8.1M15.4 16.75h5.1" />
      <rect x="8.6" y="5.1" width="3.8" height="4.3" rx="1" />
      <rect x="11.6" y="14.6" width="3.8" height="4.3" rx="1" />
    </svg>
  );
}

export function MarkWorkspace({ className }: MarkProps) {
  return (
    <svg {...base} className={className}>
      <path d="M3.75 20.25V6.75l7-3v16.5" />
      <path d="M10.75 20.25h9.5V10.5l-9.5-3.75" />
      <path d="M6.6 9.4h1.4M6.6 12.9h1.4M6.6 16.4h1.4" />
      <path d="M14 13.4h2.9M14 16.9h2.9" />
    </svg>
  );
}

export function MarkSignOut({ className }: MarkProps) {
  return (
    <svg {...base} className={className}>
      <path d="M14.25 3.75h-8a2 2 0 0 0-2 2v12.5a2 2 0 0 0 2 2h8" />
      <path d="M12.75 12h7.5" />
      <path d="M17.35 8.9L20.25 12l-2.9 3.1" />
    </svg>
  );
}

export function MarkClose({ className }: MarkProps) {
  return (
    <svg {...base} className={className}>
      <path d="M6.4 6.4l11.2 11.2M17.6 6.4L6.4 17.6" />
    </svg>
  );
}

export function MarkChevronDown({ className }: MarkProps) {
  return (
    <svg {...base} className={className}>
      <path d="M7.25 10.4L12 15.15l4.75-4.75" />
    </svg>
  );
}

export function MarkAlert({ className }: MarkProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 3.75l8.75 15.5H3.25L12 3.75z" />
      <path d="M12 9.4v4.1" />
      <path d="M12 16.35v.9" />
    </svg>
  );
}

export function MarkClock({ className }: MarkProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="8.25" />
      <path d="M12 7.5V12l3.4 2.1" />
    </svg>
  );
}

export function MarkTrash({ className }: MarkProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4.25 6.75h15.5" />
      <path d="M9.25 6.75V4.6a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1v2.15" />
      <path d="M6.5 6.75l.85 12.05a1.6 1.6 0 0 0 1.6 1.45h6.1a1.6 1.6 0 0 0 1.6-1.45l.85-12.05" />
      <path d="M10.4 10.5v6.2M13.6 10.5v6.2" />
    </svg>
  );
}

export function MarkList({ className }: MarkProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4.25 6.75h15.5M4.25 12h15.5M4.25 17.25h15.5" />
    </svg>
  );
}

export function MarkArrowRight({ className }: MarkProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4.5 12h14.5" />
      <path d="M13.6 6.9L18.75 12l-5.15 5.1" />
    </svg>
  );
}

export function MarkArrowLeft({ className }: MarkProps) {
  return (
    <svg {...base} className={className}>
      <path d="M19.5 12H5" />
      <path d="M10.4 6.9L5.25 12l5.15 5.1" />
    </svg>
  );
}

export function MarkEdit({ className }: MarkProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4.25 19.75h3.4l10.1-10.1a2.05 2.05 0 0 0 0-2.9l-.6-.6a2.05 2.05 0 0 0-2.9 0L4.25 16.35z" />
      <path d="M13.6 7.4l3 3" />
    </svg>
  );
}

export function MarkPhone({ className }: MarkProps) {
  return (
    <svg {...base} className={className}>
      <path d="M6.9 3.9h3.1l1.55 3.9-1.95 1.3a10.4 10.4 0 0 0 5.3 5.3l1.3-1.95 3.9 1.55v3.1a2 2 0 0 1-2.2 2A16.6 16.6 0 0 1 4.9 6.1a2 2 0 0 1 2-2.2z" />
    </svg>
  );
}

export function MarkNote({ className }: MarkProps) {
  return (
    <svg {...base} className={className}>
      <path d="M6.25 3.75h8.1l3.4 3.4v13.1H6.25z" />
      <path d="M14.2 3.85v3.45h3.45" />
      <path d="M9 12.2h6M9 15.7h4" />
    </svg>
  );
}

export function MarkMessage({ className }: MarkProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4.25 5.75h15.5v9.5h-8.1L7 19.6v-4.35H4.25z" />
      <path d="M8.2 9h7.6M8.2 11.9h4.6" />
    </svg>
  );
}

export function MarkTrend({ className }: MarkProps) {
  return (
    <svg {...base} className={className}>
      <path d="M3.75 17.4l5.1-5.3 3.4 3.1 6.6-7.1" />
      <path d="M14.5 8.1h4.35v4.35" />
    </svg>
  );
}

export function MarkCheckCircle({ className }: MarkProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="8.25" />
      <path d="M8.15 12.25l2.6 2.6 5.1-5.15" />
    </svg>
  );
}

export function MarkMail({ className }: MarkProps) {
  return (
    <svg {...base} className={className}>
      <rect x="3.25" y="5.75" width="17.5" height="12.5" rx="1.75" />
      <path d="M3.9 6.9L12 13l8.1-6.1" />
    </svg>
  );
}

export function MarkBuilding({ className }: MarkProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4.25 20.25V4.75a1 1 0 0 1 1-1h7.5a1 1 0 0 1 1 1v15.5" />
      <path d="M13.75 9.75h5a1 1 0 0 1 1 1v9.5" />
      <path d="M2.75 20.25h18.5" />
      <path d="M7.25 8h3M7.25 11.5h3M7.25 15h3M16.25 13.5h1.5M16.25 17h1.5" />
    </svg>
  );
}

export function MarkArchive({ className }: MarkProps) {
  return (
    <svg {...base} className={className}>
      <rect x="3.25" y="4.25" width="17.5" height="4" rx="1" />
      <path d="M4.75 8.25v10.5a1.5 1.5 0 0 0 1.5 1.5h11.5a1.5 1.5 0 0 0 1.5-1.5V8.25" />
      <path d="M9.75 12.25h4.5" />
    </svg>
  );
}

export function MarkRestore({ className }: MarkProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4.25 11.5a7.75 7.75 0 1 1 2.4 5.6" />
      <path d="M4.25 6.75v4.75h4.75" />
    </svg>
  );
}

export function MarkChevronRight({ className }: MarkProps) {
  return (
    <svg {...base} className={className}>
      <path d="M10.4 7.25L15.15 12l-4.75 4.75" />
    </svg>
  );
}

export function MarkUpload({ className }: MarkProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 20.25V8.75" />
      <path d="M8.1 12.6L12 8.7l3.9 3.9" />
      <path d="M4.25 6.75v-1.5a2 2 0 0 1 2-2h11.5a2 2 0 0 1 2 2v1.5" />
    </svg>
  );
}

export function MarkSpreadsheet({ className }: MarkProps) {
  return (
    <svg {...base} className={className}>
      <rect x="3.75" y="4.25" width="16.5" height="15.5" rx="1.75" />
      <path d="M3.75 9.25h16.5M3.75 14.5h16.5M9.5 9.25v10.5M15 9.25v10.5" />
    </svg>
  );
}

export function MarkCalendar({ className }: MarkProps) {
  return (
    <svg {...base} className={className}>
      <rect x="3.25" y="5.25" width="17.5" height="15.5" rx="2" />
      <path d="M3.25 10.25h17.5M8 3.25v3.5M16 3.25v3.5" />
    </svg>
  );
}

export function MarkMore({ className }: MarkProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="5.6" r="1.15" />
      <circle cx="12" cy="12" r="1.15" />
      <circle cx="12" cy="18.4" r="1.15" />
    </svg>
  );
}

export function MarkCopy({ className }: MarkProps) {
  return (
    <svg {...base} className={className}>
      <rect x="8.75" y="8.75" width="11.5" height="11.5" rx="1.75" />
      <path d="M15.25 8.75v-2.5a1.75 1.75 0 0 0-1.75-1.75H5.5a1.75 1.75 0 0 0-1.75 1.75v8a1.75 1.75 0 0 0 1.75 1.75h1.75" />
    </svg>
  );
}

export function MarkExternal({ className }: MarkProps) {
  return (
    <svg {...base} className={className}>
      <path d="M13.75 4.25h6v6" />
      <path d="M19.75 4.25l-8.5 8.5" />
      <path d="M17.25 14v4.25a1.75 1.75 0 0 1-1.75 1.75H5.75A1.75 1.75 0 0 1 4 18.25V8.5a1.75 1.75 0 0 1 1.75-1.75H10" />
    </svg>
  );
}

export function MarkGithub({ className }: MarkProps) {
  return (
    <svg {...base} className={className}>
      <path d="M9.25 20.25v-3.1c-2.55.55-3.1-1.2-3.1-1.2-.4-1-.98-1.28-.98-1.28-.8-.55.06-.54.06-.54.88.06 1.35.9 1.35.9.79 1.35 2.07.96 2.57.73.08-.57.31-.96.56-1.18-1.98-.23-4.06-.99-4.06-4.4 0-.97.35-1.77.92-2.39-.09-.23-.4-1.14.09-2.37 0 0 .75-.24 2.46.91a8.5 8.5 0 0 1 4.48 0c1.71-1.15 2.46-.91 2.46-.91.49 1.23.18 2.14.09 2.37.57.62.92 1.42.92 2.39 0 3.42-2.09 4.17-4.08 4.39.32.28.6.82.6 1.66v4.02" />
    </svg>
  );
}

export function MarkFilter({ className }: MarkProps) {
  return (
    <svg {...base} className={className}>
      <path d="M3.75 6.25h16.5l-6.4 7.35v5.4l-3.7 1.75v-7.15z" />
    </svg>
  );
}

export function MarkLock({ className }: MarkProps) {
  return (
    <svg {...base} className={className}>
      <rect x="4.75" y="10.25" width="14.5" height="9.5" rx="1.75" />
      <path d="M8.25 10.25V7.6a3.75 3.75 0 0 1 7.5 0v2.65" />
      <path d="M12 14v2.25" />
    </svg>
  );
}

export function MarkDatabase({ className }: MarkProps) {
  return (
    <svg {...base} className={className}>
      <ellipse cx="12" cy="6.25" rx="7.5" ry="2.75" />
      <path d="M4.5 6.25v11.5c0 1.52 3.36 2.75 7.5 2.75s7.5-1.23 7.5-2.75V6.25" />
      <path d="M4.5 12c0 1.52 3.36 2.75 7.5 2.75s7.5-1.23 7.5-2.75" />
    </svg>
  );
}

export function MarkShield({ className }: MarkProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 3.25l7.5 2.9v6.1c0 4.3-3.05 7.3-7.5 8.5-4.45-1.2-7.5-4.2-7.5-8.5V6.15z" />
      <path d="M8.9 11.9l2.35 2.35 4.1-4.15" />
    </svg>
  );
}

export function MarkInfo({ className }: MarkProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="8.25" />
      <path d="M12 10.9v5.3" />
      <path d="M12 7.85v.9" />
    </svg>
  );
}

export function MarkUser({ className }: MarkProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="8.5" r="3.6" />
      <path d="M4.75 20.25c0-3.85 3.25-6.5 7.25-6.5s7.25 2.65 7.25 6.5" />
    </svg>
  );
}

export function MarkMessageText({ className }: MarkProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4.25 5.75h15.5v10.5H10.5L6.35 20v-3.75H4.25z" />
      <path d="M8.4 9.25h7.2M8.4 12.4h4.4" />
    </svg>
  );
}
