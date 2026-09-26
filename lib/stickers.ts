export interface StickerItem {
  id: string;
  type: string;
  x: number; // percentage 0 - 100 relative to card
  y: number; // percentage 0 - 100 relative to card
  rotation: number; // degrees -180 to 180
  scale: number; // 0.6 to 2.5
  color: string;
}

export interface StickerDefinition {
  type: string;
  name: string;
  category: "sparkle" | "heart" | "cute" | "stamp";
  defaultColor: string;
  svgPath: string; // SVG path for icon / DOM preview
  drawOnCanvas: (ctx: CanvasRenderingContext2D, size: number, color: string) => void;
}

export const STICKER_PALETTE = [
  "#FF3D9A", // Kiosk pink
  "#D4FF3D", // Kiosk neon green
  "#FF6B4A", // Kiosk coral
  "#6C4FE0", // Kiosk violet
  "#D9A441", // Vintage gold
  "#17140F", // Ink
  "#FFFFFF", // Crisp white
  "#4ECDC4", // Mint turquoise
];

export const STICKER_DEFINITIONS: StickerDefinition[] = [
  {
    type: "sparkle-4",
    name: "Y2K Sparkle",
    category: "sparkle",
    defaultColor: "#FF3D9A",
    svgPath: "M12 2C12 7.5 16.5 12 22 12C16.5 12 12 16.5 12 22C12 16.5 7.5 12 2 12C7.5 12 12 7.5 12 2Z",
    drawOnCanvas: (ctx, size, color) => {
      const r = size / 2;
      ctx.fillStyle = color;
      ctx.beginPath();
      // 4-point star curve
      ctx.moveTo(0, -r);
      ctx.quadraticCurveTo(0, 0, r, 0);
      ctx.quadraticCurveTo(0, 0, 0, r);
      ctx.quadraticCurveTo(0, 0, -r, 0);
      ctx.quadraticCurveTo(0, 0, 0, -r);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#17140F";
      ctx.lineWidth = Math.max(2, size * 0.04);
      ctx.stroke();
    },
  },
  {
    type: "sparkle-8",
    name: "Twinkle Star",
    category: "sparkle",
    defaultColor: "#D4FF3D",
    svgPath: "M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z",
    drawOnCanvas: (ctx, size, color) => {
      const r = size / 2;
      const inner = r * 0.38;
      ctx.fillStyle = color;
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const rad = (i * Math.PI) / 4;
        const radInner = rad + Math.PI / 8;
        if (i === 0) ctx.moveTo(Math.cos(rad) * r, Math.sin(rad) * r);
        else ctx.lineTo(Math.cos(rad) * r, Math.sin(rad) * r);
        ctx.lineTo(Math.cos(radInner) * inner, Math.sin(radInner) * inner);
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#17140F";
      ctx.lineWidth = Math.max(2, size * 0.04);
      ctx.stroke();
    },
  },
  {
    type: "puffy-heart",
    name: "Pop Heart",
    category: "heart",
    defaultColor: "#FF6B4A",
    svgPath: "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z",
    drawOnCanvas: (ctx, size, color) => {
      const s = size / 24;
      ctx.fillStyle = color;
      ctx.beginPath();
      // Draw bezier heart centered
      ctx.translate(0, -size * 0.1);
      ctx.moveTo(0, 8 * s);
      ctx.bezierCurveTo(-10 * s, -3 * s, -14 * s, -14 * s, -5 * s, -14 * s);
      ctx.bezierCurveTo(0, -14 * s, 0, -8 * s, 0, -8 * s);
      ctx.bezierCurveTo(0, -8 * s, 0, -14 * s, 5 * s, -14 * s);
      ctx.bezierCurveTo(14 * s, -14 * s, 10 * s, -3 * s, 0, 8 * s);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#17140F";
      ctx.lineWidth = Math.max(2.5, size * 0.05);
      ctx.stroke();
    },
  },
  {
    type: "ribbon-bow",
    name: "Coquette Bow",
    category: "cute",
    defaultColor: "#FF3D9A",
    svgPath: "M12 10C10 7 5 7 4 9C3 11 6 13 11 11.5L9 20L12 18L15 20L13 11.5C18 13 21 11 20 9C19 7 14 7 12 10Z",
    drawOnCanvas: (ctx, size, color) => {
      const s = size / 28;
      ctx.fillStyle = color;
      ctx.strokeStyle = "#17140F";
      ctx.lineWidth = Math.max(2, size * 0.04);
      // Left loop
      ctx.beginPath();
      ctx.ellipse(-7 * s, -2 * s, 6 * s, 4 * s, -Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Right loop
      ctx.beginPath();
      ctx.ellipse(7 * s, -2 * s, 6 * s, 4 * s, Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Tails
      ctx.beginPath();
      ctx.moveTo(-2 * s, 2 * s);
      ctx.lineTo(-7 * s, 12 * s);
      ctx.lineTo(-3 * s, 10 * s);
      ctx.lineTo(0, 3 * s);
      ctx.lineTo(3 * s, 10 * s);
      ctx.lineTo(7 * s, 12 * s);
      ctx.lineTo(2 * s, 2 * s);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Center knot
      ctx.beginPath();
      ctx.arc(0, 0, 3.5 * s, 0, Math.PI * 2);
      ctx.fillStyle = "#FFFFFF";
      ctx.fill();
      ctx.stroke();
    },
  },
  {
    type: "cherry",
    name: "Twin Cherries",
    category: "cute",
    defaultColor: "#FF6B4A",
    svgPath: "M12 3C15 6 18 8 18 13A4 4 0 1 1 12 13M12 3C9 6 6 8 6 13A4 4 0 1 0 12 13",
    drawOnCanvas: (ctx, size, color) => {
      const s = size / 30;
      // Stems
      ctx.strokeStyle = "#17140F";
      ctx.lineWidth = Math.max(2.5, size * 0.05);
      ctx.beginPath();
      ctx.moveTo(0, -10 * s);
      ctx.quadraticCurveTo(-6 * s, -4 * s, -7 * s, 4 * s);
      ctx.moveTo(0, -10 * s);
      ctx.quadraticCurveTo(6 * s, -4 * s, 7 * s, 4 * s);
      ctx.stroke();
      // Leaf
      ctx.fillStyle = "#D4FF3D";
      ctx.beginPath();
      ctx.ellipse(3 * s, -11 * s, 5 * s, 2.5 * s, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Cherries
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(-7 * s, 6 * s, 6 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(7 * s, 6 * s, 6 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Highlights
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.arc(-9 * s, 4 * s, 1.8 * s, 0, Math.PI * 2);
      ctx.arc(5 * s, 4 * s, 1.8 * s, 0, Math.PI * 2);
      ctx.fill();
    },
  },
  {
    type: "daisy",
    name: "Daisy Flower",
    category: "cute",
    defaultColor: "#FFFFFF",
    svgPath: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0-6a3 3 0 0 0-3 3v1a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z",
    drawOnCanvas: (ctx, size, color) => {
      const r = size * 0.45;
      const petalR = size * 0.16;
      ctx.fillStyle = color;
      ctx.strokeStyle = "#17140F";
      ctx.lineWidth = Math.max(2, size * 0.04);
      // 6 Petals
      for (let i = 0; i < 6; i++) {
        const ang = (i * Math.PI) / 3;
        const px = Math.cos(ang) * (r * 0.65);
        const py = Math.sin(ang) * (r * 0.65);
        ctx.beginPath();
        ctx.arc(px, py, petalR, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      // Center
      ctx.fillStyle = "#D9A441";
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.38, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    },
  },
  {
    type: "butterfly",
    name: "Y2K Butterfly",
    category: "cute",
    defaultColor: "#6C4FE0",
    svgPath: "M12 12C14 7 20 4 21 8C22 12 18 16 12 14C6 16 2 12 3 8C4 4 10 7 12 12Z",
    drawOnCanvas: (ctx, size, color) => {
      const s = size / 26;
      ctx.fillStyle = color;
      ctx.strokeStyle = "#17140F";
      ctx.lineWidth = Math.max(2, size * 0.04);
      // Top wings
      ctx.beginPath();
      ctx.ellipse(-7 * s, -5 * s, 6 * s, 4.5 * s, -Math.PI / 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(7 * s, -5 * s, 6 * s, 4.5 * s, Math.PI / 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Bottom wings
      ctx.beginPath();
      ctx.ellipse(-5 * s, 4 * s, 4 * s, 3.5 * s, -Math.PI / 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(5 * s, 4 * s, 4 * s, 3.5 * s, Math.PI / 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Body
      ctx.fillStyle = "#17140F";
      ctx.beginPath();
      ctx.ellipse(0, 0, 1.8 * s, 6 * s, 0, 0, Math.PI * 2);
      ctx.fill();
    },
  },
  {
    type: "stamp-bestie",
    name: "BESTIE Stamp",
    category: "stamp",
    defaultColor: "#D4FF3D",
    svgPath: "M2 6h20v12H2z",
    drawOnCanvas: (ctx, size, color) => {
      const w = size * 1.5;
      const h = size * 0.65;
      ctx.fillStyle = color;
      ctx.strokeStyle = "#17140F";
      ctx.lineWidth = Math.max(2.5, size * 0.05);
      // Rounded pill badge
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, h / 2);
      ctx.fill();
      ctx.stroke();
      // Text
      ctx.fillStyle = "#17140F";
      ctx.font = `bold ${Math.round(size * 0.28)}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("★ BESTIE ★", 0, 1);
    },
  },
  {
    type: "stamp-kpop",
    name: "추억 Stamp",
    category: "stamp",
    defaultColor: "#FF3D9A",
    svgPath: "M4 4h16v16H4z",
    drawOnCanvas: (ctx, size, color) => {
      const s = size * 0.8;
      ctx.fillStyle = color;
      ctx.strokeStyle = "#17140F";
      ctx.lineWidth = Math.max(2.5, size * 0.05);
      ctx.beginPath();
      ctx.roundRect(-s / 2, -s / 2, s, s, s * 0.2);
      ctx.fill();
      ctx.stroke();
      // Inner dashed border
      ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 2]);
      ctx.strokeRect(-s * 0.4, -s * 0.4, s * 0.8, s * 0.8);
      ctx.setLineDash([]);
      // Text
      ctx.fillStyle = "#FFFFFF";
      ctx.font = `bold ${Math.round(size * 0.26)}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("추 억", 0, 1);
    },
  },
];

export function getStickerByType(type: string): StickerDefinition {
  return STICKER_DEFINITIONS.find((s) => s.type === type) || STICKER_DEFINITIONS[0];
}
