export interface PhotoFilter {
  id: string;
  name: string;
  cssFilter: string;
  shortDesc: string;
}

export const PHOTO_FILTERS: PhotoFilter[] = [
  {
    id: "none",
    name: "Natural",
    cssFilter: "none",
    shortDesc: "Clean natural lens",
  },
  {
    id: "warm",
    name: "Warm Film",
    cssFilter: "sepia(0.28) contrast(1.08) saturate(1.18) brightness(1.02)",
    shortDesc: "Golden analog nostalgia",
  },
  {
    id: "bw",
    name: "B&W Film",
    cssFilter: "grayscale(1) contrast(1.22) brightness(0.96)",
    shortDesc: "High contrast silver gelatin",
  },
  {
    id: "vivid",
    name: "Vivid 90s",
    cssFilter: "saturate(1.42) contrast(1.14) hue-rotate(-6deg)",
    shortDesc: "Punchy vibrant film print",
  },
  {
    id: "pastel",
    name: "Pastel Dream",
    cssFilter: "brightness(1.06) contrast(0.96) saturate(1.25) hue-rotate(12deg)",
    shortDesc: "Soft pink & dreamy tones",
  },
  {
    id: "cyber",
    name: "Cyber Neon",
    cssFilter: "contrast(1.2) saturate(1.35) hue-rotate(140deg)",
    shortDesc: "Electric Y2K green & cyan",
  },
];

export function getFilterById(id: string): PhotoFilter {
  return PHOTO_FILTERS.find((f) => f.id === id) || PHOTO_FILTERS[0];
}
