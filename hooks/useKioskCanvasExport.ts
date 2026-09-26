"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import { FrameTemplate } from "@/lib/templates";
import { getFilterById } from "@/lib/filters";
import { StickerItem, getStickerByType } from "@/lib/stickers";

export interface CardCaption {
  enabled: boolean;
  text: string;
  color: string;
  bgColor?: string;
}

export interface UseKioskCanvasExportParams {
  template: FrameTemplate;
  photos: Record<string, string>; // photoId -> dataUrl
  slotMap: Record<number, string>; // slotIndex -> photoId
  globalFilterId: string;
  photoFilters: Record<string, string>; // photoId -> filterId
  stickers: StickerItem[];
  caption: CardCaption;
}

export function useKioskCanvasExport({
  template,
  photos,
  slotMap,
  globalFilterId,
  photoFilters,
  stickers,
  caption,
}: UseKioskCanvasExportParams) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [renderTimestamp] = useState(() => {
    const d = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  });

  const renderCanvas = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsRendering(true);

    try {
      if (typeof document !== "undefined" && document.fonts?.ready) {
        await document.fonts.ready;
      }

      const w = template.cardWidth;
      const h = template.cardHeight;
      canvas.width = w;
      canvas.height = h;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // 1. Draw Background
      ctx.fillStyle = template.bgColor;
      ctx.fillRect(0, 0, w, h);

      // 2. Draw Decorative Border Patterns
      drawBorderPattern(ctx, template, w, h);

      // 3. Draw Header Title & Badge
      drawHeader(ctx, template, w);

      // 4. Preload all placed slot photos
      const loadedPhotoMap: Record<string, HTMLImageElement> = {};
      const uniquePhotoIds = Array.from(new Set(Object.values(slotMap)));

      await Promise.all(
        uniquePhotoIds.map(
          (photoId) =>
            new Promise<void>((resolve) => {
              const src = photos[photoId];
              if (!src) return resolve();
              const img = new Image();
              img.crossOrigin = "anonymous";
              img.onload = () => {
                loadedPhotoMap[photoId] = img;
                resolve();
              };
              img.onerror = () => resolve();
              img.src = src;
            })
        )
      );

      // 5. Draw each Slot Photo
      template.slots.forEach((slot) => {
        const sx = (slot.x / 100) * w;
        const sy = (slot.y / 100) * h;
        const sw = (slot.width / 100) * w;
        const sh = (slot.height / 100) * h;

        // Slot photo frame backing
        ctx.fillStyle = "#FAF7F0";
        ctx.fillRect(sx, sy, sw, sh);

        const photoId = slotMap[slot.index];
        const img = photoId ? loadedPhotoMap[photoId] : null;

        if (img) {
          ctx.save();
          // Clip to slot bounds
          ctx.beginPath();
          ctx.rect(sx, sy, sw, sh);
          ctx.clip();

          // Apply filter
          const activeFilterId = photoFilters[photoId] || globalFilterId;
          const filter = getFilterById(activeFilterId);
          if (filter.cssFilter !== "none") {
            ctx.filter = filter.cssFilter;
          }

          // Draw image centered and covering 3:4 or slot aspect ratio
          drawImageCover(ctx, img, sx, sy, sw, sh);
          ctx.restore();
        } else {
          // Empty slot placeholder
          ctx.strokeStyle = "rgba(23, 20, 15, 0.15)";
          ctx.lineWidth = 2;
          ctx.strokeRect(sx, sy, sw, sh);

          ctx.fillStyle = "rgba(23, 20, 15, 0.3)";
          ctx.font = "bold 16px monospace";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(`SLOT #${slot.index + 1}`, sx + sw / 2, sy + sh / 2);
        }

        // Inner crisp border around photo
        ctx.strokeStyle = "#17140F";
        ctx.lineWidth = 2;
        ctx.strokeRect(sx, sy, sw, sh);

        // Technical slot indicator in corner
        ctx.fillStyle = "rgba(23, 20, 15, 0.75)";
        ctx.font = `600 ${Math.max(10, Math.round(w * 0.015))}px monospace`;
        ctx.textAlign = "left";
        ctx.fillText(`0${slot.index + 1}`, sx + 6, sy + 16);
      });

      // 6. Draw Footer Branding & Timestamp
      drawFooter(ctx, template, w, h, renderTimestamp);

      // 7. Draw Text Caption (if enabled)
      if (caption.enabled && caption.text.trim()) {
        drawCaption(ctx, caption, w, h);
      }

      // 8. Draw Stickers
      stickers.forEach((sticker) => {
        const sx = (sticker.x / 100) * w;
        const sy = (sticker.y / 100) * h;
        const baseSize = Math.round(w * 0.11) * sticker.scale;

        const def = getStickerByType(sticker.type);
        if (def) {
          ctx.save();
          ctx.translate(sx, sy);
          ctx.rotate((sticker.rotation * Math.PI) / 180);
          def.drawOnCanvas(ctx, baseSize, sticker.color || def.defaultColor);
          ctx.restore();
        }
      });
    } catch (err) {
      console.error("Error rendering kiosk canvas:", err);
    } finally {
      setIsRendering(false);
    }
  }, [
    template,
    photos,
    slotMap,
    globalFilterId,
    photoFilters,
    stickers,
    caption,
    renderTimestamp,
  ]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  /**
   * Export high quality PNG
   */
  const downloadCard = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        const dateSlug = new Date().toISOString().slice(0, 10);
        link.download = `mikuabooth-${template.id}-${dateSlug}.png`;
        link.href = url;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 2000);
      },
      "image/png",
      1.0
    );
  }, [template.id]);

  return {
    canvasRef,
    isRendering,
    downloadCard,
    renderTimestamp,
    renderCanvas,
  };
}

/**
 * Cover-fit drawing helper for canvas
 */
function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const imgRatio = img.width / img.height;
  const targetRatio = w / h;
  let sx = 0;
  let sy = 0;
  let sw = img.width;
  let sh = img.height;

  if (imgRatio > targetRatio) {
    sw = img.height * targetRatio;
    sx = (img.width - sw) / 2;
  } else {
    sh = img.width / targetRatio;
    sy = (img.height - sh) / 2;
  }

  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

/**
 * Draw decorative border pattern based on template
 */
function drawBorderPattern(
  ctx: CanvasRenderingContext2D,
  template: FrameTemplate,
  w: number,
  h: number
) {
  const margin = 14;

  if (template.borderPattern === "solid") {
    ctx.strokeStyle = template.borderColor;
    ctx.lineWidth = 4;
    ctx.strokeRect(margin, margin, w - margin * 2, h - margin * 2);
  } else if (template.borderPattern === "dots") {
    // Polka dot border frame
    ctx.fillStyle = template.borderColor;
    const dotSize = 4;
    const dotGap = 16;
    // Top & Bottom
    for (let x = margin; x <= w - margin; x += dotGap) {
      ctx.beginPath();
      ctx.arc(x, margin, dotSize, 0, Math.PI * 2);
      ctx.arc(x, h - margin, dotSize, 0, Math.PI * 2);
      ctx.fill();
    }
    // Left & Right
    for (let y = margin; y <= h - margin; y += dotGap) {
      ctx.beginPath();
      ctx.arc(margin, y, dotSize, 0, Math.PI * 2);
      ctx.arc(w - margin, y, dotSize, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (template.borderPattern === "checker") {
    // 2-row checkerboard border
    const sqSize = 10;
    ctx.fillStyle = template.borderColor;
    // Top & Bottom rows
    for (let x = 0; x < w; x += sqSize) {
      if (Math.floor(x / sqSize) % 2 === 0) {
        ctx.fillRect(x, 0, sqSize, sqSize);
        ctx.fillRect(x, h - sqSize, sqSize, sqSize);
      }
    }
    // Left & Right columns
    for (let y = 0; y < h; y += sqSize) {
      if (Math.floor(y / sqSize) % 2 === 0) {
        ctx.fillRect(0, y, sqSize, sqSize);
        ctx.fillRect(w - sqSize, y, sqSize, sqSize);
      }
    }
  } else if (template.borderPattern === "film") {
    // 35mm film sprockets along both sides
    ctx.fillStyle = "#17140F";
    ctx.fillRect(0, 0, 24, h);
    ctx.fillRect(w - 24, 0, 24, h);

    ctx.fillStyle = "#FFFFFF";
    const holeW = 12;
    const holeH = 16;
    const holeGap = 24;
    for (let y = 14; y < h - 20; y += holeGap) {
      ctx.beginPath();
      ctx.roundRect(6, y, holeW, holeH, 3);
      ctx.roundRect(w - 18, y, holeW, holeH, 3);
      ctx.fill();
    }
  } else {
    // Double line
    ctx.strokeStyle = template.borderColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(margin, margin, w - margin * 2, h - margin * 2);
    ctx.lineWidth = 1.5;
    ctx.strokeRect(margin + 6, margin + 6, w - (margin + 6) * 2, h - (margin + 6) * 2);
  }
}

/**
 * Draw Header with Wordmark and Theme Badges
 */
function drawHeader(
  ctx: CanvasRenderingContext2D,
  template: FrameTemplate,
  w: number
) {
  const isStrip = template.layout.startsWith("strip");
  const headerY = isStrip ? 54 : Math.round(w * 0.06);

  // Wordmark / Header Title
  ctx.fillStyle = template.textColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `bold ${Math.round(w * 0.046)}px var(--font-fredoka), sans-serif`;
  ctx.fillText(template.headerTitle, w / 2, headerY);

  // Subtitle / Korean Life4Cuts tribute
  ctx.fillStyle = template.subTextColor;
  ctx.font = `600 ${Math.max(11, Math.round(w * 0.02))}px monospace`;
  ctx.fillText("MIKUABOOTH · SEOUL PHOTO KIOSK", w / 2, headerY + Math.round(w * 0.035));
}

/**
 * Draw Footer with Technical Stamp & Watermark
 */
function drawFooter(
  ctx: CanvasRenderingContext2D,
  template: FrameTemplate,
  w: number,
  h: number,
  timestamp: string
) {
  const footerY = h - Math.round(w * 0.07);

  // Watermark
  ctx.fillStyle = template.textColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `bold italic ${Math.round(w * 0.036)}px var(--font-fraunces), serif`;
  ctx.fillText("MikuaBooth", w / 2, footerY - 22);

  // Stamp Details
  ctx.fillStyle = template.subTextColor;
  ctx.font = `500 ${Math.max(10, Math.round(w * 0.018))}px monospace`;
  ctx.fillText(template.footerStamp, w / 2, footerY + 2);

  // Timestamp
  ctx.font = `400 ${Math.max(9, Math.round(w * 0.016))}px monospace`;
  ctx.fillText(`DATE: ${timestamp} · AUTHENTIC KEEPSAKE`, w / 2, footerY + 22);
}

/**
 * Draw Optional Text Caption on Card
 */
function drawCaption(
  ctx: CanvasRenderingContext2D,
  caption: CardCaption,
  w: number,
  h: number
) {
  const cx = w / 2;
  const cy = h - Math.round(w * 0.16);

  ctx.save();
  ctx.font = `bold ${Math.round(w * 0.034)}px var(--font-fredoka), sans-serif`;
  const textWidth = ctx.measureText(caption.text).width;
  const pillW = textWidth + 36;
  const pillH = Math.round(w * 0.06);

  // Caption bubble
  ctx.fillStyle = caption.bgColor || "#FFFFFF";
  ctx.strokeStyle = "#17140F";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(cx - pillW / 2, cy - pillH / 2, pillW, pillH, pillH / 2);
  ctx.fill();
  ctx.stroke();

  // Caption text
  ctx.fillStyle = caption.color || "#17140F";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(caption.text, cx, cy);
  ctx.restore();
}
