export type TemplateCategory = "All" | "K-pop" | "Y2K" | "Soft & Dreamy" | "Minimalist";

export type SlotCount = 3 | 4 | 6 | 8 | 16;

export type BorderPattern = "solid" | "dots" | "checker" | "scallop" | "double" | "film";

export interface SlotCoordinate {
  index: number;
  /** Normalized percentage 0 - 100 */
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FrameColorSwatch {
  id: string;
  name: string;
  hex: string;
  textColor: string;
  subTextColor: string;
  borderColor: string;
}

export const FRAME_COLOR_SWATCHES: FrameColorSwatch[] = [
  {
    id: "ivory",
    name: "Warm Ivory",
    hex: "#FAF7F0",
    textColor: "#1E1B18",
    subTextColor: "rgba(30, 27, 24, 0.7)",
    borderColor: "#E1503A",
  },
  {
    id: "frame-black",
    name: "Film Black",
    hex: "#1E1B18",
    textColor: "#FAF7F0",
    subTextColor: "rgba(250, 247, 240, 0.7)",
    borderColor: "#FAF7F0",
  },
  {
    id: "rust-accent",
    name: "Film Rust",
    hex: "#E1503A",
    textColor: "#FAF7F0",
    subTextColor: "rgba(250, 247, 240, 0.8)",
    borderColor: "#FAF7F0",
  },
  {
    id: "sage",
    name: "Sage Green",
    hex: "#8A9A7E",
    textColor: "#17140F",
    subTextColor: "rgba(23, 20, 15, 0.75)",
    borderColor: "#17140F",
  },
  {
    id: "dusty-blue",
    name: "Dusty Blue",
    hex: "#6E8CA0",
    textColor: "#FAF7F0",
    subTextColor: "rgba(250, 247, 240, 0.8)",
    borderColor: "#FAF7F0",
  },
  {
    id: "gold",
    name: "Vintage Gold",
    hex: "#D9A441",
    textColor: "#1E1B18",
    subTextColor: "rgba(30, 27, 24, 0.75)",
    borderColor: "#1E1B18",
  },
  {
    id: "y2k-violet",
    name: "Club Violet",
    hex: "#6C4FE0",
    textColor: "#FFFFFF",
    subTextColor: "rgba(255, 255, 255, 0.8)",
    borderColor: "#D4FF3D",
  },
  {
    id: "cyber-neon",
    name: "Cyber Neon",
    hex: "#D4FF3D",
    textColor: "#17140F",
    subTextColor: "rgba(23, 20, 15, 0.8)",
    borderColor: "#17140F",
  },
];

export interface BoothFormat {
  id: string;
  name: string;
  slotCount: SlotCount;
  layout: "strip-3" | "strip-4" | "grid-4" | "strip-6" | "grid-6" | "grid-8" | "grid-16";
  badge: string;
  tagline: string;
  description: string;
  aspectRatio: string;
  cols: number;
  rows: number;
}

export const BOOTH_FORMATS: BoothFormat[] = [
  {
    id: "classic-4",
    name: "4-Cut Classic Strip",
    slotCount: 4,
    layout: "strip-4",
    badge: "SIGNATURE",
    tagline: "1×4 Vertical Strip",
    description: "The quintessential Seoul Life4Cuts vertical bookmark format.",
    aspectRatio: "1/3.4",
    cols: 1,
    rows: 4,
  },
  {
    id: "quad-4",
    name: "4-Cut Quad",
    slotCount: 4,
    layout: "grid-4",
    badge: "POPULAR",
    tagline: "2×2 Square Keepsake",
    description: "Balanced 2×2 grid layout, perfect for Instagram, lockscreens, and photo albums.",
    aspectRatio: "1/1.22",
    cols: 2,
    rows: 2,
  },
  {
    id: "grid-6",
    name: "6-Cut Editorial Grid",
    slotCount: 6,
    layout: "grid-6",
    badge: "EDITORIAL",
    tagline: "2×3 Story Grid",
    description: "Magazine-style 6-shot montage capturing your complete sequence of poses.",
    aspectRatio: "1/1.38",
    cols: 2,
    rows: 3,
  },
  {
    id: "strip-6",
    name: "6-Cut Film Strip",
    slotCount: 6,
    layout: "strip-6",
    badge: "PANORAMIC",
    tagline: "1×6 Long Film Strip",
    description: "A continuous 6-shot cinema strip, like vintage photo booth rolls.",
    aspectRatio: "1/4.2",
    cols: 1,
    rows: 6,
  },
  {
    id: "trio-3",
    name: "3-Cut Pocket Trio",
    slotCount: 3,
    layout: "strip-3",
    badge: "COMPACT",
    tagline: "1×3 Pocket Strip",
    description: "Pocket-sized 3-shot mini strip for quick, effortless memories.",
    aspectRatio: "1/2.8",
    cols: 1,
    rows: 3,
  },
];

export interface FrameTemplate {
  id: string;
  name: string;
  tags: ("K-pop" | "Y2K" | "Soft & Dreamy" | "Minimalist")[];
  slotCount: SlotCount;
  layout: "strip-3" | "strip-4" | "grid-4" | "strip-6" | "grid-6" | "grid-8" | "grid-16";
  aspectRatio: string; // e.g. "1/3", "3/4", "9/16", "1/1"
  cardWidth: number; // reference canvas dimensions
  cardHeight: number;
  bgColor: string;
  borderColor: string;
  borderPattern: BorderPattern;
  accentColor: string;
  textColor: string;
  subTextColor: string;
  headerTitle: string;
  footerStamp: string;
  slots: SlotCoordinate[];
  badge: string;
}

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  "All",
  "K-pop",
  "Y2K",
  "Soft & Dreamy",
  "Minimalist",
];

export const FRAME_TEMPLATES: FrameTemplate[] = [
  // ================= 4 PHOTOS (FLAGSHIP) =================
  {
    id: "kpop-life4cuts-classic",
    name: "Hongdae Life4Cuts",
    tags: ["K-pop"],
    slotCount: 4,
    layout: "strip-4",
    aspectRatio: "1/3.4",
    cardWidth: 640,
    cardHeight: 2180,
    bgColor: "#FAF7F0",
    borderColor: "#E1503A",
    borderPattern: "solid",
    accentColor: "#D9A441",
    textColor: "#221F1B",
    subTextColor: "rgba(34, 31, 27, 0.7)",
    headerTitle: "HONGDAE 4-CUTS",
    footerStamp: "SEOUL MEMORY · 35MM RETRO FILM STRIP",
    badge: "SIGNATURE",
    slots: [
      { index: 0, x: 8, y: 5.5, width: 84, height: 20 },
      { index: 1, x: 8, y: 27.5, width: 84, height: 20 },
      { index: 2, x: 8, y: 49.5, width: 84, height: 20 },
      { index: 3, x: 8, y: 71.5, width: 84, height: 20 },
    ],
  },
  {
    id: "minimal-swiss-4",
    name: "Studio Quad 4",
    tags: ["Minimalist"],
    slotCount: 4,
    layout: "grid-4",
    aspectRatio: "1/1.22",
    cardWidth: 1080,
    cardHeight: 1320,
    bgColor: "#1E1B18",
    borderColor: "#FAF7F0",
    borderPattern: "solid",
    accentColor: "#E1503A",
    textColor: "#FAF7F0",
    subTextColor: "rgba(250, 247, 240, 0.7)",
    headerTitle: "MONO STUDIO 04",
    footerStamp: "HELVETICA RIGOR · CONTACT SHEET 04",
    badge: "ELEGANT",
    slots: [
      { index: 0, x: 7, y: 10, width: 41, height: 38 },
      { index: 1, x: 52, y: 10, width: 41, height: 38 },
      { index: 2, x: 7, y: 51, width: 41, height: 38 },
      { index: 3, x: 52, y: 51, width: 41, height: 38 },
    ],
  },
  {
    id: "y2k-sticker-quad",
    name: "Y2K Sticker Quad",
    tags: ["Y2K"],
    slotCount: 4,
    layout: "grid-4",
    aspectRatio: "1/1.22",
    cardWidth: 1080,
    cardHeight: 1320,
    bgColor: "#6C4FE0",
    borderColor: "#D4FF3D",
    borderPattern: "checker",
    accentColor: "#FF3D9A",
    textColor: "#FFFFFF",
    subTextColor: "rgba(255, 255, 255, 0.8)",
    headerTitle: "★ Y2K STICKER BOX ★",
    footerStamp: "CLUB MIKUA · 2000 EDITION · DIGITAL KEEPSAKE",
    badge: "TRENDING",
    slots: [
      { index: 0, x: 7, y: 10, width: 41, height: 38 },
      { index: 1, x: 52, y: 10, width: 41, height: 38 },
      { index: 2, x: 7, y: 51, width: 41, height: 38 },
      { index: 3, x: 52, y: 51, width: 41, height: 38 },
    ],
  },
  {
    id: "dreamy-lavender-4",
    name: "Dreamy Cloud 4",
    tags: ["Soft & Dreamy"],
    slotCount: 4,
    layout: "grid-4",
    aspectRatio: "1/1.22",
    cardWidth: 1080,
    cardHeight: 1320,
    bgColor: "#EAE6F8",
    borderColor: "#6C4FE0",
    borderPattern: "dots",
    accentColor: "#FF6B4A",
    textColor: "#17140F",
    subTextColor: "rgba(23, 20, 15, 0.7)",
    headerTitle: "☁ SOFT & DREAMY ☁",
    footerStamp: "PASTEL MEMORY · SWEET MOMENTS",
    badge: "COZY",
    slots: [
      { index: 0, x: 7, y: 10, width: 41, height: 38 },
      { index: 1, x: 52, y: 10, width: 41, height: 38 },
      { index: 2, x: 7, y: 51, width: 41, height: 38 },
      { index: 3, x: 52, y: 51, width: 41, height: 38 },
    ],
  },

  // ================= 6 PHOTOS =================
  {
    id: "editorial-grid-6",
    name: "Seoul Editorial 6",
    tags: ["Minimalist", "K-pop"],
    slotCount: 6,
    layout: "grid-6",
    aspectRatio: "1/1.38",
    cardWidth: 1080,
    cardHeight: 1480,
    bgColor: "#FAF7F0",
    borderColor: "#1E1B18",
    borderPattern: "solid",
    accentColor: "#E1503A",
    textColor: "#1E1B18",
    subTextColor: "rgba(30, 27, 24, 0.7)",
    headerTitle: "SEOUL EDITORIAL · 6-CUT",
    footerStamp: "MIKUABOOTH 35MM · 6 MOMENTS IN TIME",
    badge: "NEW",
    slots: [
      { index: 0, x: 7, y: 8, width: 41, height: 26 },
      { index: 1, x: 52, y: 8, width: 41, height: 26 },
      { index: 2, x: 7, y: 36.5, width: 41, height: 26 },
      { index: 3, x: 52, y: 36.5, width: 41, height: 26 },
      { index: 4, x: 7, y: 65, width: 41, height: 26 },
      { index: 5, x: 52, y: 65, width: 41, height: 26 },
    ],
  },
  {
    id: "y2k-matrix-6",
    name: "Neo Cyber 6",
    tags: ["Y2K"],
    slotCount: 6,
    layout: "grid-6",
    aspectRatio: "1/1.38",
    cardWidth: 1080,
    cardHeight: 1480,
    bgColor: "#1E1B18",
    borderColor: "#D4FF3D",
    borderPattern: "checker",
    accentColor: "#6C4FE0",
    textColor: "#D4FF3D",
    subTextColor: "rgba(212, 255, 61, 0.8)",
    headerTitle: "► CYBER REEL · 6X ◄",
    footerStamp: "MATRIX SYSTEM 06 · DIGITAL PHOTO ROLL",
    badge: "NEON Y2K",
    slots: [
      { index: 0, x: 7, y: 8, width: 41, height: 26 },
      { index: 1, x: 52, y: 8, width: 41, height: 26 },
      { index: 2, x: 7, y: 36.5, width: 41, height: 26 },
      { index: 3, x: 52, y: 36.5, width: 41, height: 26 },
      { index: 4, x: 7, y: 65, width: 41, height: 26 },
      { index: 5, x: 52, y: 65, width: 41, height: 26 },
    ],
  },
  {
    id: "strip-panoramic-6",
    name: "Panorama Strip 6",
    tags: ["K-pop"],
    slotCount: 6,
    layout: "strip-6",
    aspectRatio: "1/4.2",
    cardWidth: 600,
    cardHeight: 2520,
    bgColor: "#FAF7F0",
    borderColor: "#E1503A",
    borderPattern: "film",
    accentColor: "#D9A441",
    textColor: "#1E1B18",
    subTextColor: "rgba(30, 27, 24, 0.7)",
    headerTitle: "★ PANORAMA 6-CUT ★",
    footerStamp: "KOREAN PHOTO ARCHIVE · 6 EXPOSURES",
    badge: "PANORAMIC",
    slots: [
      { index: 0, x: 8, y: 4.5, width: 84, height: 13.5 },
      { index: 1, x: 8, y: 19.5, width: 84, height: 13.5 },
      { index: 2, x: 8, y: 34.5, width: 84, height: 13.5 },
      { index: 3, x: 8, y: 49.5, width: 84, height: 13.5 },
      { index: 4, x: 8, y: 64.5, width: 84, height: 13.5 },
      { index: 5, x: 8, y: 79.5, width: 84, height: 13.5 },
    ],
  },

  // ================= 3 PHOTOS =================
  {
    id: "kpop-trio-pink",
    name: "Bubblegum Pop Trio",
    tags: ["K-pop", "Soft & Dreamy"],
    slotCount: 3,
    layout: "strip-3",
    aspectRatio: "1/2.8",
    cardWidth: 600,
    cardHeight: 1680,
    bgColor: "#FFF0F5",
    borderColor: "#FF3D9A",
    borderPattern: "dots",
    accentColor: "#FF6B4A",
    textColor: "#17140F",
    subTextColor: "rgba(23, 20, 15, 0.7)",
    headerTitle: "★ K-POP POP TRIO ★",
    footerStamp: "MIKUABOOTH · 3-CUT SEOUL · SPECIAL STAMP",
    badge: "POPSICLE",
    slots: [
      { index: 0, x: 8, y: 7, width: 84, height: 26 },
      { index: 1, x: 8, y: 35.5, width: 84, height: 26 },
      { index: 2, x: 8, y: 64, width: 84, height: 26 },
    ],
  },
  {
    id: "minimal-tokyo-3",
    name: "Tokyo Archive 3",
    tags: ["Minimalist"],
    slotCount: 3,
    layout: "strip-3",
    aspectRatio: "1/2.8",
    cardWidth: 600,
    cardHeight: 1680,
    bgColor: "#F6F1E7",
    borderColor: "#17140F",
    borderPattern: "solid",
    accentColor: "#E1503A",
    textColor: "#17140F",
    subTextColor: "rgba(34, 31, 27, 0.65)",
    headerTitle: "ARCHIVE TRIO",
    footerStamp: "35MM MONOCHROME · SHIBUYA STUDIO",
    badge: "ARCHIVE",
    slots: [
      { index: 0, x: 8, y: 7, width: 84, height: 26 },
      { index: 1, x: 8, y: 35.5, width: 84, height: 26 },
      { index: 2, x: 8, y: 64, width: 84, height: 26 },
    ],
  },

  // ================= 8 PHOTOS =================
  {
    id: "kpop-idol-diary-8",
    name: "Idol Photocard 8",
    tags: ["K-pop"],
    slotCount: 8,
    layout: "grid-8",
    aspectRatio: "1/1.55",
    cardWidth: 1080,
    cardHeight: 1680,
    bgColor: "#FFF5EA",
    borderColor: "#FF6B4A",
    borderPattern: "scallop",
    accentColor: "#FF3D9A",
    textColor: "#17140F",
    subTextColor: "rgba(23, 20, 15, 0.7)",
    headerTitle: "♥ IDOL PHOTO DIARY ♥",
    footerStamp: "K-POP FANCLUB EXCLUSIVE · 8 SNAPS",
    badge: "IDOL PICK",
    slots: [
      { index: 0, x: 6, y: 8, width: 41, height: 19 },
      { index: 1, x: 53, y: 8, width: 41, height: 19 },
      { index: 2, x: 6, y: 29.5, width: 41, height: 19 },
      { index: 3, x: 53, y: 29.5, width: 41, height: 19 },
      { index: 4, x: 6, y: 51, width: 41, height: 19 },
      { index: 5, x: 53, y: 51, width: 41, height: 19 },
      { index: 6, x: 6, y: 72.5, width: 41, height: 19 },
      { index: 7, x: 53, y: 72.5, width: 41, height: 19 },
    ],
  },

  // ================= 16 PHOTOS =================
  {
    id: "minimal-contact-16",
    name: "Proof Sheet 16",
    tags: ["Minimalist"],
    slotCount: 16,
    layout: "grid-16",
    aspectRatio: "1/1.25",
    cardWidth: 1400,
    cardHeight: 1750,
    bgColor: "#FAF7F0",
    borderColor: "#17140F",
    borderPattern: "film",
    accentColor: "#E1503A",
    textColor: "#17140F",
    subTextColor: "rgba(23, 20, 15, 0.65)",
    headerTitle: "PROOF SHEET · 35MM ISO 400",
    footerStamp: "KODAK TX 400 · 16 EXPOSURES INDEX",
    badge: "PRO FILM",
    slots: generate16Slots(),
  },
];

function generate16Slots(): SlotCoordinate[] {
  const slots: SlotCoordinate[] = [];
  const startX = 5;
  const startY = 8;
  const slotW = 20.2;
  const slotH = 19.5;
  const gapX = 2.8;
  const gapY = 2.5;

  let idx = 0;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      slots.push({
        index: idx,
        x: Number((startX + c * (slotW + gapX)).toFixed(2)),
        y: Number((startY + r * (slotH + gapY)).toFixed(2)),
        width: slotW,
        height: slotH,
      });
      idx++;
    }
  }
  return slots;
}

export function getTemplateById(id: string): FrameTemplate {
  return FRAME_TEMPLATES.find((t) => t.id === id) || FRAME_TEMPLATES[0];
}

export function getDefaultTemplateForFormat(format: BoothFormat): FrameTemplate {
  const match = FRAME_TEMPLATES.find((t) => t.layout === format.layout);
  if (match) return match;
  return FRAME_TEMPLATES.find((t) => t.slotCount === format.slotCount) || FRAME_TEMPLATES[0];
}
