export type TemplateCategory = "All" | "K-pop" | "Y2K" | "Soft & Dreamy" | "Minimalist";

export type SlotCount = 3 | 4 | 8 | 16;

export type BorderPattern = "solid" | "dots" | "checker" | "scallop" | "double" | "film";

export interface SlotCoordinate {
  index: number;
  /** Normalized percentage 0 - 100 */
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FrameTemplate {
  id: string;
  name: string;
  tags: ("K-pop" | "Y2K" | "Soft & Dreamy" | "Minimalist")[];
  slotCount: SlotCount;
  layout: "strip-3" | "strip-4" | "grid-4" | "grid-8" | "grid-16";
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
    id: "y2k-cyber-trio",
    name: "Cyber Glitch 3",
    tags: ["Y2K"],
    slotCount: 3,
    layout: "strip-3",
    aspectRatio: "1/2.8",
    cardWidth: 600,
    cardHeight: 1680,
    bgColor: "#D4FF3D",
    borderColor: "#17140F",
    borderPattern: "checker",
    accentColor: "#6C4FE0",
    textColor: "#17140F",
    subTextColor: "rgba(23, 20, 15, 0.75)",
    headerTitle: "CYBER·2000·LIVE",
    footerStamp: "SYSTEM 03 · ISO 400 · RAW KINDS",
    badge: "NEON Y2K",
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

  // ================= 4 PHOTOS =================
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
    badge: "HOT PICK",
    slots: [
      { index: 0, x: 8, y: 5.5, width: 84, height: 20 },
      { index: 1, x: 8, y: 27.5, width: 84, height: 20 },
      { index: 2, x: 8, y: 49.5, width: 84, height: 20 },
      { index: 3, x: 8, y: 71.5, width: 84, height: 20 },
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
      { index: 0, x: 7, y: 11, width: 41, height: 38 },
      { index: 1, x: 52, y: 11, width: 41, height: 38 },
      { index: 2, x: 7, y: 52, width: 41, height: 38 },
      { index: 3, x: 52, y: 52, width: 41, height: 38 },
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
      { index: 0, x: 7, y: 11, width: 41, height: 38 },
      { index: 1, x: 52, y: 11, width: 41, height: 38 },
      { index: 2, x: 7, y: 52, width: 41, height: 38 },
      { index: 3, x: 52, y: 52, width: 41, height: 38 },
    ],
  },
  {
    id: "minimal-swiss-4",
    name: "Swiss Studio Quad",
    tags: ["Minimalist"],
    slotCount: 4,
    layout: "grid-4",
    aspectRatio: "1/1.22",
    cardWidth: 1080,
    cardHeight: 1320,
    bgColor: "#17140F",
    borderColor: "#FAF7F0",
    borderPattern: "solid",
    accentColor: "#E1503A",
    textColor: "#FAF7F0",
    subTextColor: "rgba(250, 247, 240, 0.7)",
    headerTitle: "MONO STUDIO 04",
    footerStamp: "HELVETICA RIGOR · CONTACT SHEET 04",
    badge: "ELEGANT",
    slots: [
      { index: 0, x: 7, y: 11, width: 41, height: 38 },
      { index: 1, x: 52, y: 11, width: 41, height: 38 },
      { index: 2, x: 7, y: 52, width: 41, height: 38 },
      { index: 3, x: 52, y: 52, width: 41, height: 38 },
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
  {
    id: "y2k-arcade-8",
    name: "Neo Arcade 8",
    tags: ["Y2K"],
    slotCount: 8,
    layout: "grid-8",
    aspectRatio: "1/1.55",
    cardWidth: 1080,
    cardHeight: 1680,
    bgColor: "#17140F",
    borderColor: "#D4FF3D",
    borderPattern: "double",
    accentColor: "#6C4FE0",
    textColor: "#D4FF3D",
    subTextColor: "rgba(212, 255, 61, 0.8)",
    headerTitle: "► ARCADE BURST · 8X ◄",
    footerStamp: "HIGH SCORE 99999 · TOKYO PLAYGROUND",
    badge: "RETRO ARCADE",
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
  {
    id: "dreamy-garden-8",
    name: "Secret Garden 8",
    tags: ["Soft & Dreamy"],
    slotCount: 8,
    layout: "grid-8",
    aspectRatio: "1/1.55",
    cardWidth: 1080,
    cardHeight: 1680,
    bgColor: "#EDF3EB",
    borderColor: "#8A9A7E",
    borderPattern: "dots",
    accentColor: "#D9A441",
    textColor: "#17140F",
    subTextColor: "rgba(23, 20, 15, 0.7)",
    headerTitle: "✿ BOTANICAL MEMORIES ✿",
    footerStamp: "SPRING BOUQUET · 8 CAPTURED MOMENTS",
    badge: "BOTANICAL",
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
    id: "y2k-party-matrix-16",
    name: "Mega Party Matrix 16",
    tags: ["Y2K", "K-pop"],
    slotCount: 16,
    layout: "grid-16",
    aspectRatio: "1/1.25",
    cardWidth: 1400,
    cardHeight: 1750,
    bgColor: "#D4FF3D",
    borderColor: "#17140F",
    borderPattern: "checker",
    accentColor: "#FF3D9A",
    textColor: "#17140F",
    subTextColor: "rgba(23, 20, 15, 0.8)",
    headerTitle: "★ PARTY MONTAGE 16X ★",
    footerStamp: "MIKUABOOTH PARTY ROLL · 16 ALL-STAR MOMENTS",
    badge: "PARTY SIZE",
    slots: generate16Slots(),
  },
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
  {
    id: "dreamy-polaroid-16",
    name: "Dream Collage 16",
    tags: ["Soft & Dreamy"],
    slotCount: 16,
    layout: "grid-16",
    aspectRatio: "1/1.25",
    cardWidth: 1400,
    cardHeight: 1750,
    bgColor: "#FFF2F6",
    borderColor: "#FF3D9A",
    borderPattern: "dots",
    accentColor: "#6C4FE0",
    textColor: "#17140F",
    subTextColor: "rgba(23, 20, 15, 0.7)",
    headerTitle: "♡ SWEET COLLAGE 16 ♡",
    footerStamp: "DEAR DIARY · 16 SNAPS OF PURE JOY",
    badge: "SCRAPBOOK",
    slots: generate16Slots(),
  },
];

/**
 * 4x4 matrix generator for 16 slots with even gutters
 */
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
