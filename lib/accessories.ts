export type AccessoryId =
  | "none"
  | "bunny-ears"
  | "cat-ears"
  | "flower-crown"
  | "heart"
  | "star"
  | "party-hat";

export interface AccessoryDefinition {
  id: AccessoryId;
  name: string;
  shortDesc: string;
  badge: string;
  svgIcon: string; // Mini SVG path for button preview
  iconColor: string;
  draw: (
    ctx: CanvasRenderingContext2D,
    anchorX: number,
    anchorY: number,
    faceWidth: number,
    rollAngle: number
  ) => void;
}

/**
 * 6 Starter AR Head-Tracking Accessories + None
 */
export const ACCESSORY_DEFINITIONS: AccessoryDefinition[] = [
  {
    id: "none",
    name: "None",
    shortDesc: "Clean camera look",
    badge: "NATURAL",
    iconColor: "#17140F",
    svgIcon: "M18.36 5.64a9 9 0 1 1-12.73 12.73 9 9 0 0 1 12.73-12.73zm-1.41 1.41a7 7 0 0 0-9.9 9.9l9.9-9.9z",
    draw: () => {
      // No-op
    },
  },
  {
    id: "bunny-ears",
    name: "Bunny Ears",
    shortDesc: "Cute rabbit ears",
    badge: "KAWAII",
    iconColor: "#FF3D9A",
    svgIcon: "M9 3C7 3 6 8 6 13c0 3 1.5 6 3 6s3-3 3-6C12 8 11 3 9 3zm6 0c-2 0-3 5-3 10 0 3 1.5 6 3 6s3-3 3-6c0-5-1-10-3-10z",
    draw: (ctx, anchorX, anchorY, faceWidth, rollAngle) => {
      ctx.save();
      ctx.translate(anchorX, anchorY);
      ctx.rotate(rollAngle);

      // Scale based on face width
      const scale = faceWidth / 220;
      ctx.scale(scale, scale);

      const drawSingleEar = (isLeft: boolean) => {
        ctx.save();
        ctx.translate(isLeft ? -42 : 42, -18);
        ctx.rotate((isLeft ? -10 : 10) * (Math.PI / 180));

        // Outer ear (Warm Ivory / White)
        ctx.fillStyle = "#FAF7F0";
        ctx.strokeStyle = "#17140F";
        ctx.lineWidth = 5;
        ctx.lineJoin = "round";

        ctx.beginPath();
        ctx.moveTo(0, 10);
        ctx.bezierCurveTo(-26, -20, -28, -100, 0, -135);
        ctx.bezierCurveTo(28, -100, 26, -20, 0, 10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Inner ear (Pastel Kiosk Pink)
        ctx.fillStyle = "#FF3D9A";
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-14, -22, -16, -85, 0, -115);
        ctx.bezierCurveTo(16, -85, 14, -22, 0, 0);
        ctx.closePath();
        ctx.fill();

        // Delicate inner stroke
        ctx.strokeStyle = "#17140F";
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.restore();
      };

      // Draw Left & Right Bunny Ears
      drawSingleEar(true);
      drawSingleEar(false);

      // Small central head fluff
      ctx.fillStyle = "#FAF7F0";
      ctx.strokeStyle = "#17140F";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, -6, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    },
  },
  {
    id: "cat-ears",
    name: "Cat Ears",
    shortDesc: "Playful anime kitty",
    badge: "PLAYFUL",
    iconColor: "#FF6B4A",
    svgIcon: "M4 19L6 5l8 6 6-6 2 14H4z",
    draw: (ctx, anchorX, anchorY, faceWidth, rollAngle) => {
      ctx.save();
      ctx.translate(anchorX, anchorY);
      ctx.rotate(rollAngle);

      const scale = faceWidth / 220;
      ctx.scale(scale, scale);

      const drawEar = (isLeft: boolean) => {
        ctx.save();
        ctx.translate(isLeft ? -56 : 56, -6);
        ctx.rotate((isLeft ? -16 : 16) * (Math.PI / 180));

        // Outer ear triangle
        ctx.fillStyle = "#17140F";
        ctx.strokeStyle = "#17140F";
        ctx.lineWidth = 4;
        ctx.lineJoin = "round";

        ctx.beginPath();
        ctx.moveTo(-32, 12);
        ctx.quadraticCurveTo(-16, -30, 0, -65);
        ctx.quadraticCurveTo(24, -25, 28, 12);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Inner pink ear
        ctx.fillStyle = "#FF6B4A";
        ctx.beginPath();
        ctx.moveTo(-18, 8);
        ctx.quadraticCurveTo(-8, -20, 0, -48);
        ctx.quadraticCurveTo(14, -18, 16, 8);
        ctx.closePath();
        ctx.fill();

        // White ear fluff tuft
        ctx.fillStyle = "#FAF7F0";
        ctx.beginPath();
        ctx.arc(-2, 4, 7, 0, Math.PI * 2);
        ctx.arc(6, 2, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      };

      drawEar(true);
      drawEar(false);

      ctx.restore();
    },
  },
  {
    id: "flower-crown",
    name: "Flower Crown",
    shortDesc: "Daisy & rose garland",
    badge: "SPRING",
    iconColor: "#8A9A7E",
    svgIcon: "M12 2a4 4 0 0 0-4 4 4 4 0 0 0 4 4 4 4 0 0 0 4-4 4 4 0 0 0-4-4zm-7 7a4 4 0 0 0-4 4 4 4 0 0 0 4 4 4 4 0 0 0 4-4 4 4 0 0 0-4-4zm14 0a4 4 0 0 0-4 4 4 4 0 0 0 4 4 4 4 0 0 0 4-4 4 4 0 0 0-4-4z",
    draw: (ctx, anchorX, anchorY, faceWidth, rollAngle) => {
      ctx.save();
      ctx.translate(anchorX, anchorY);
      ctx.rotate(rollAngle);

      const scale = faceWidth / 220;
      ctx.scale(scale, scale);

      // Curved garland arch behind flowers
      ctx.strokeStyle = "#688464";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(0, 30, 85, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();

      // Flower positions across forehead curve
      const flowers = [
        { x: -75, y: 0, r: 16, color: "#FFD166", petals: 5 },
        { x: -42, y: -16, r: 20, color: "#FF3D9A", petals: 6 },
        { x: 0, y: -24, r: 24, color: "#FFFFFF", petals: 6, center: "#D9A441" },
        { x: 42, y: -16, r: 20, color: "#FF6B4A", petals: 6 },
        { x: 75, y: 0, r: 16, color: "#D4FF3D", petals: 5 },
      ];

      // Draw leaves between flowers
      const leaves = [
        { x: -60, y: -8, rot: -0.4 },
        { x: -22, y: -22, rot: -0.2 },
        { x: 22, y: -22, rot: 0.2 },
        { x: 60, y: -8, rot: 0.4 },
      ];

      leaves.forEach((l) => {
        ctx.save();
        ctx.translate(l.x, l.y);
        ctx.rotate(l.rot);
        ctx.fillStyle = "#8A9A7E";
        ctx.strokeStyle = "#17140F";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.ellipse(0, 0, 10, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      });

      // Draw flowers
      flowers.forEach((fl) => {
        ctx.save();
        ctx.translate(fl.x, fl.y);
        const petalR = fl.r * 0.45;
        const dist = fl.r * 0.55;

        ctx.fillStyle = fl.color;
        ctx.strokeStyle = "#17140F";
        ctx.lineWidth = 2.5;

        for (let i = 0; i < fl.petals; i++) {
          const ang = (i * Math.PI * 2) / fl.petals;
          const px = Math.cos(ang) * dist;
          const py = Math.sin(ang) * dist;
          ctx.beginPath();
          ctx.arc(px, py, petalR, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }

        // Flower center
        ctx.fillStyle = fl.center || "#17140F";
        ctx.beginPath();
        ctx.arc(0, 0, fl.r * 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.restore();
      });

      ctx.restore();
    },
  },
  {
    id: "heart",
    name: "Pop Heart",
    shortDesc: "Floating heart above head",
    badge: "LOVELY",
    iconColor: "#FF3D9A",
    svgIcon: "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z",
    draw: (ctx, anchorX, anchorY, faceWidth, rollAngle) => {
      ctx.save();
      ctx.translate(anchorX, anchorY);
      ctx.rotate(rollAngle);

      const scale = faceWidth / 220;
      ctx.scale(scale, scale);

      // Float distance above forehead
      ctx.translate(0, -68);

      // Subtle pulse shadow / glow
      ctx.fillStyle = "rgba(255, 61, 154, 0.25)";
      ctx.beginPath();
      ctx.arc(0, 0, 48, 0, Math.PI * 2);
      ctx.fill();

      // Main Pop Heart
      const s = 1.9;
      ctx.fillStyle = "#FF3D9A";
      ctx.strokeStyle = "#17140F";
      ctx.lineWidth = 4.5;
      ctx.lineJoin = "round";

      ctx.beginPath();
      ctx.moveTo(0, 16 * s);
      ctx.bezierCurveTo(-18 * s, 0, -24 * s, -18 * s, -10 * s, -22 * s);
      ctx.bezierCurveTo(-2 * s, -24 * s, 0, -14 * s, 0, -14 * s);
      ctx.bezierCurveTo(0, -14 * s, 2 * s, -24 * s, 10 * s, -22 * s);
      ctx.bezierCurveTo(24 * s, -18 * s, 18 * s, 0, 0, 16 * s);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Glossy highlight
      ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
      ctx.beginPath();
      ctx.ellipse(-12, -22, 7, 4, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();

      // Satellite sparkles
      const drawSparkle = (x: number, y: number, r: number) => {
        ctx.fillStyle = "#D4FF3D";
        ctx.strokeStyle = "#17140F";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(x, y - r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.quadraticCurveTo(x, y, x, y + r);
        ctx.quadraticCurveTo(x, y, x - r, y);
        ctx.quadraticCurveTo(x, y, x, y - r);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      };

      drawSparkle(-44, -20, 11);
      drawSparkle(42, -14, 13);
      drawSparkle(28, 16, 7);

      ctx.restore();
    },
  },
  {
    id: "star",
    name: "Y2K Star",
    shortDesc: "Twinkling star cluster",
    badge: "Y2K ICON",
    iconColor: "#D4FF3D",
    svgIcon: "M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6.4-4.8-6.4 4.8 2.4-7.2-6-4.8h7.6z",
    draw: (ctx, anchorX, anchorY, faceWidth, rollAngle) => {
      ctx.save();
      ctx.translate(anchorX, anchorY);
      ctx.rotate(rollAngle);

      const scale = faceWidth / 220;
      ctx.scale(scale, scale);

      ctx.translate(0, -64);

      // Central large 4-point star
      const drawCurvedStar = (x: number, y: number, r: number, color: string) => {
        ctx.fillStyle = color;
        ctx.strokeStyle = "#17140F";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x, y - r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.quadraticCurveTo(x, y, x, y + r);
        ctx.quadraticCurveTo(x, y, x - r, y);
        ctx.quadraticCurveTo(x, y, x, y - r);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      };

      // Orbit ring
      ctx.strokeStyle = "rgba(23, 20, 15, 0.4)";
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.ellipse(0, 0, 52, 22, -0.2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Main star
      drawCurvedStar(0, 0, 36, "#D4FF3D");

      // Inner center pop
      ctx.fillStyle = "#FF3D9A";
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();

      // Satellite stars
      drawCurvedStar(-46, -16, 14, "#6C4FE0");
      drawCurvedStar(48, 12, 16, "#FF6B4A");
      drawCurvedStar(28, -32, 10, "#FFFFFF");

      ctx.restore();
    },
  },
  {
    id: "party-hat",
    name: "Party Hat",
    shortDesc: "Celebration birthday cone",
    badge: "PARTY",
    iconColor: "#6C4FE0",
    svgIcon: "M12 2L4 21h16L12 2zm0 4.5l4.5 11.5h-9L12 6.5z",
    draw: (ctx, anchorX, anchorY, faceWidth, rollAngle) => {
      ctx.save();
      ctx.translate(anchorX, anchorY);
      ctx.rotate(rollAngle);

      const scale = faceWidth / 220;
      ctx.scale(scale, scale);

      // Slightly jaunty tilt
      ctx.rotate(8 * (Math.PI / 180));
      ctx.translate(0, -10);

      // Hat Cone Body
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, -95);
      ctx.lineTo(-44, 4);
      ctx.quadraticCurveTo(0, 16, 44, 4);
      ctx.closePath();
      ctx.clip();

      // Cone base color (Kiosk Violet)
      ctx.fillStyle = "#6C4FE0";
      ctx.fillRect(-60, -110, 120, 130);

      // Vibrant diagonal stripes (Neon Green & Coral)
      const stripes = [
        { y: -75, color: "#D4FF3D" },
        { y: -50, color: "#FF3D9A" },
        { y: -25, color: "#D4FF3D" },
        { y: 0, color: "#FF6B4A" },
      ];

      stripes.forEach((st) => {
        ctx.fillStyle = st.color;
        ctx.beginPath();
        ctx.moveTo(-50, st.y);
        ctx.lineTo(50, st.y - 20);
        ctx.lineTo(50, st.y - 6);
        ctx.lineTo(-50, st.y + 14);
        ctx.closePath();
        ctx.fill();
      });

      ctx.restore();

      // Cone Outline
      ctx.strokeStyle = "#17140F";
      ctx.lineWidth = 4.5;
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(0, -95);
      ctx.lineTo(-44, 4);
      ctx.quadraticCurveTo(0, 16, 44, 4);
      ctx.closePath();
      ctx.stroke();

      // Bottom scalloped frill
      ctx.fillStyle = "#FAF7F0";
      for (let x = -40; x <= 40; x += 16) {
        ctx.beginPath();
        ctx.arc(x, 6, 7, 0, Math.PI);
        ctx.fill();
        ctx.stroke();
      }

      // Top Fluffy Pom-Pom
      ctx.fillStyle = "#FFD166";
      ctx.beginPath();
      ctx.arc(0, -98, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Star sparkle on pom-pom
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.arc(-3, -101, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    },
  },
];

export function getAccessoryById(id: string): AccessoryDefinition {
  return ACCESSORY_DEFINITIONS.find((a) => a.id === id) || ACCESSORY_DEFINITIONS[0];
}

/**
 * Universal accessory drawing helper on any 2D canvas
 */
export function drawAccessoryOnCanvas(
  ctx: CanvasRenderingContext2D,
  accessoryId: string,
  anchorX: number,
  anchorY: number,
  faceWidth: number,
  rollAngle: number = 0
) {
  if (!accessoryId || accessoryId === "none") return;
  const def = getAccessoryById(accessoryId);
  def.draw(ctx, anchorX, anchorY, faceWidth, rollAngle);
}
