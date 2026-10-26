import type { SVGProps } from "react";

const PATHS = {
  arrow: "M5 12h14M13 6l6 6-6 6",
  arrowDown: "M12 5v14M6 13l6 6 6-6",
  arrowUpRight: "M7 17 17 7M8 7h9v9",
  chevronLeft: "M15 6l-6 6 6 6",
  chevronRight: "M9 6l6 6-6 6",
  chevronDown: "M6 9l6 6 6-6",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm10 2-4.35-4.35",
  pin: "M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Zm0-9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13v4l3 2",
  truck: "M3 6h11v10H3zM14 10h4l3 3v3h-7M7.5 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm10 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z",
  phone: "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z",
  mail: "M3 6h18v12H3zM3 7l9 6 9-6",
  plus: "M12 5v14M5 12h14",
  close: "M6 6l12 12M18 6 6 18",
  menu: "M4 7h16M4 12h16M4 17h16",
  camera: "M4 8h3l2-3h6l2 3h3v11H4zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
  crosshair: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 2v4m0 12v4M2 12h4m12 0h4",
  check: "M5 12.5 10 17l9-10",
  checkCircle: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm-4-9 3 3 5-6",
  leaf: "M5 19C5 10 11 5 20 4c0 9-5 15-14 15Zm0 0 8-8",
  calendar: "M4 6h16v14H4zM4 10h16M8 3v4m8-4v4",
  users: "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 10a7 7 0 0 1 14 0M17 11a3 3 0 1 0 0-6m5 16a6 6 0 0 0-4-5.6",
  play: "M8 5v14l11-7z",
  pause: "M8 5v14M16 5v14",
  alert: "M12 3 2 21h20L12 3Zm0 7v5m0 3v.01",
  upload: "M12 16V4m-5 5 5-5 5 5M4 20h16",
  recycle:
    "M7 19H4.5a1.5 1.5 0 0 1-1.3-2.25L5.5 13M9.5 6.5l1.2-2.1a1.5 1.5 0 0 1 2.6 0l2.2 3.9M17 13l2.3 4a1.5 1.5 0 0 1-1.3 2.25H11M8 10 5.5 13l-3-1M13.5 8.3 16 8l.6-3.2M14 22l-3-2.75L14 16.5",
  trash: "M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3",
  map: "M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Zm0 0v14m6-12v14",
  route: "M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm12-10a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM6 15V9a3 3 0 0 1 3-3h1m8 3v6a3 3 0 0 1-3 3h-1",
  home: "M4 11 12 4l8 7v9h-5v-6H9v6H4z",
  info: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-11v6m0-9v.01",
  building: "M4 21h16M6 21V8l6-4 6 4v13M10 21v-5h4v5M9 11h.01M15 11h.01",
  scale: "M12 4v16M5 20h14M6 8h12M6 8l-3 6a3 3 0 0 0 6 0L6 8Zm12 0-3 6a3 3 0 0 0 6 0l-3-6Z",
  list: "M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01",
  printer: "M7 9V3h10v6M7 17H4v-7h16v7h-3M7 14h10v7H7z",
  ticket: "M4 7h16v3a2 2 0 0 0 0 4v3H4v-3a2 2 0 0 0 0-4V7Zm9 0v10",
  sprout: "M12 21v-8m0 0C12 9 9 7 5 7c0 4 3 6 7 6Zm0 0c0-4 3-7 7-7 0 4-3 7-7 7",
  heart: "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z",
  gps: "M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm0-3a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12 2v3m0 14v3M2 12h3m14 0h3",
  shield: "M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6l-8-3Zm-3 9 2 2 4-4",
  external: "M14 4h6v6m0-6-9 9M18 14v6H4V6h6",
  link: "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1",
  whatsapp:
    "M4 20l1.3-3.9A8.5 8.5 0 1 1 8 19.1L4 20Zm5.2-11.7c.3-.3.8-.3 1 .1l.8 1.6c.1.3 0 .6-.2.8l-.5.5a6 6 0 0 0 2.6 2.6l.5-.5c.2-.2.5-.3.8-.2l1.6.8c.4.2.4.7.1 1l-.7.7c-.6.6-1.6.7-2.4.3a10 10 0 0 1-4.5-4.5c-.4-.8-.3-1.8.3-2.4l.6-.8Z",
  archive: "M3 5h18v4H3zM5 9v10h14V9M10 13h4",
  expand: "M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5",
} as const;

// Marcas de redes sociales (relleno)
const BRANDS = {
  facebook: "M13.5 21v-8h2.7l.4-3.2h-3.1V7.8c0-.9.3-1.5 1.6-1.5h1.6V3.4A22 22 0 0 0 14.4 3c-2.3 0-3.9 1.4-3.9 4v2.8H8V13h2.6v8h2.9Z",
  instagram:
    "M12 7.4A4.6 4.6 0 1 0 12 16.6 4.6 4.6 0 0 0 12 7.4Zm0 7.6a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm5.9-7.8a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0ZM21 8.3c0-1.5-.4-2.8-1.5-3.8S17.2 3 15.7 3H8.3C6.8 3 5.5 3.4 4.5 4.5S3 6.8 3 8.3v7.4c0 1.5.4 2.8 1.5 3.8s2.3 1.5 3.8 1.5h7.4c1.5 0 2.8-.4 3.8-1.5s1.5-2.3 1.5-3.8V8.3Zm-2 9.5a3 3 0 0 1-1.7 1.7c-1.2.5-3.9.4-5.3.4s-4.1.1-5.3-.4a3 3 0 0 1-1.7-1.7c-.5-1.2-.4-3.9-.4-5.3s-.1-4.1.4-5.3A3 3 0 0 1 6.7 5.5c1.2-.5 3.9-.4 5.3-.4s4.1-.1 5.3.4A3 3 0 0 1 19 7.2c.5 1.2.4 3.9.4 5.3s.1 4.1-.4 5.3Z",
  tiktok:
    "M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.1v12.4a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V9.7a5.7 5.7 0 1 0 4.9 5.7V9a7.4 7.4 0 0 0 4.3 1.4V7.3a4.3 4.3 0 0 1-3.2-1.5Z",
} as const;

export type IconName = keyof typeof PATHS | keyof typeof BRANDS;

export function Icon({ name, size = 20, ...props }: { name: IconName; size?: number } & SVGProps<SVGSVGElement>) {
  const brand = name in BRANDS;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={brand ? "currentColor" : "none"}
      stroke={brand ? "none" : "currentColor"}
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable={false}
      {...props}
    >
      <path d={brand ? BRANDS[name as keyof typeof BRANDS] : PATHS[name as keyof typeof PATHS]} />
    </svg>
  );
}
