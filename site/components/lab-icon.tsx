import type { CSSProperties } from "react";
const paths: Record<string, string> = {
  home: "m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z",
  daily:
    "M8 3v4m8-4v4M4 10h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Zm3 10 2 2 5-5",
  notes: "M12 5C9 3 5 3 3 4v15c3-1 6-1 9 1m0-15c3-2 7-2 9-1v15c-3-1-6-1-9 1V5Z",
  blog: "M5 3h10l4 4v14H5V3Zm9 0v5h5M8 12h8m-8 4h5",
  explore:
    "m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.4l6.1-.9Z",
  roadmap: "M5 4v16m0-12h10a4 4 0 0 0 0-8M5 16h10a4 4 0 0 1 0 8",
  projects: "M3 5h7l2 3h9v12H3V5Zm5 7-2 3 2 3m8-6 2 3-2 3m-3-6-2 6",
  about: "M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 21v-2a8 8 0 0 1 16 0v2",
  pen: "m15 4 5 5M4 20l5-1L21 7a2 2 0 0 0-5-5L4 14v6Z",
  search: "M16 16l5 5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z",
  arrow: "M5 12h14m-5-5 5 5-5 5",
  shuffle: "M3 6h3l12 12h3m-4-4 4 4-4 4M3 18h3l4-4m4-4 4-4h3m-4-4 4 4-4 4",
  leaf: "M20 3c0 13-6 18-13 14C0 13 6 3 20 3ZM4 21 15 10",
};
export function LabIcon({
  name,
  size = 20,
  style,
}: {
  name: string;
  size?: number;
  style?: CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={style}
    >
      <path d={paths[name] || paths.notes} />
    </svg>
  );
}
