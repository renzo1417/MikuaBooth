"use client";

import React, { useState, useEffect } from "react";
import { FrameTemplate } from "@/lib/templates";
import { StickerItem } from "@/lib/stickers";
import { CardCaption, useKioskCanvasExport } from "@/hooks/useKioskCanvasExport";
import confetti from "canvas-confetti";
import {
  DownloadSimple,
  ArrowCounterClockwise,
  PencilSimple,
  Sparkle,
  Check,
  ShareNetwork,
} from "@phosphor-icons/react";
import { BoothShell } from "@/components/BoothShell";

interface FinishScreenProps {
  template: FrameTemplate;
  photos: Record<string, string>;
  slotMap: Record<number, string>;
  globalFilterId: string;
  photoFilters: Record<string, string>;
  stickers: StickerItem[];
  caption: CardCaption;
  onEditAgain: () => void;
  onStartOver: () => void;
}

export function FinishScreen({
  template,
  photos,
  slotMap,
  globalFilterId,
  photoFilters,
  stickers,
  caption,
  onEditAgain,
  onStartOver,
}: FinishScreenProps) {
  const { canvasRef, isRendering, downloadCard, renderTimestamp } =
    useKioskCanvasExport({
      template,
      photos,
      slotMap,
      globalFilterId,
      photoFilters,
      stickers,
      caption,
    });

  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  // Confetti on entrance (skipped when the user prefers reduced motion)
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        if (
          typeof window !== "undefined" &&
          window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ) {
          return;
        }
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#E1503A", "#D9A441", "#8A9A7E", "#1E1B18"],
          disableForReducedMotion: true,
        });
      } catch {
        // ignore
      }
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  const handleDownload = () => {
    downloadCard();
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const handleShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas || typeof navigator === "undefined" || !navigator.share) {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        setShareFeedback("Link copied to clipboard!");
        setTimeout(() => setShareFeedback(null), 2500);
      }
      return;
    }

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], `mikuabooth-${template.id}.png`, {
          type: "image/png",
        });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: "MikuaBooth Photo Card",
            text: "Check out my Korean Life4Cuts photo card!",
            files: [file],
          });
          setShareFeedback("Shared!");
        } else {
          await navigator.share({
            title: "MikuaBooth Photo Card",
            text: "Check out my Korean Life4Cuts photo card!",
            url: window.location.href,
          });
          setShareFeedback("Shared!");
        }
        setTimeout(() => setShareFeedback(null), 2500);
      }, "image/png");
    } catch {
      // User cancelled share
    }
  };

  return (
    <BoothShell
      variant="scroll"
      className="px-4 py-8 md:px-10 md:py-10 select-none"
      header={
        <>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border-[2px] border-[#1E1B18] bg-[#FAF7F0] shadow-[2px_2px_0px_#1E1B18]">
              <Sparkle size={20} weight="fill" className="text-[#E1503A]" />
            </div>
            <div>
              <h1 className="font-serif text-xl font-bold text-[#1E1B18]">
                Your Keepsake Card
              </h1>
              <span className="font-mono text-[10px] text-[#1E1B18]/70">
                {template.name} · {renderTimestamp}
              </span>
            </div>
          </div>

          <button
            onClick={onStartOver}
            className="kiosk-btn flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 font-mono text-xs font-bold text-[#1E1B18] cursor-pointer"
          >
            <ArrowCounterClockwise size={16} weight="bold" />
            <span>START OVER</span>
          </button>
        </>
      }
      footer={
        <div className="flex w-full items-center justify-between border-t border-[#1E1B18]/15 pt-4 text-xs font-mono text-[#1E1B18]/60">
          <span>NO CLOUD STORAGE · 100% PRIVATE CLIENT-SIDE CANVAS</span>
          <span>SEOUL 4-CUT EXPERIENCE</span>
        </div>
      }
    >
      {/* Main Preview Area */}
      <div className="my-auto flex w-full flex-col items-center justify-center gap-8 py-6 md:flex-row md:items-center">
        {/* Left: The Composited Canvas Card */}
        <div className="relative flex items-center justify-center">
          <div className="kiosk-box-lg relative overflow-hidden rounded-2xl bg-white p-3 md:p-4 animate-developing">
            <canvas
              ref={canvasRef}
              className={`max-h-[68vh] w-auto rounded-lg object-contain shadow-xs transition-opacity duration-200 ${
                isRendering ? "opacity-60" : "opacity-100"
              }`}
              style={{
                maxWidth: template.layout.startsWith("strip") ? "270px" : "380px",
              }}
            />
            {isRendering && (
              <div className="absolute top-4 right-4 rounded-full bg-[#1E1B18] px-3 py-1 font-mono text-[10px] text-white">
                DEVELOPING...
              </div>
            )}
          </div>
        </div>

        {/* Right: Export Actions */}
        <div className="flex w-full max-w-sm flex-col gap-4 rounded-3xl border-[3px] border-[#1E1B18] bg-white p-6 shadow-[5px_5px_0px_#1E1B18]">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#1E1B18] bg-[#FAF7F0] px-2.5 py-0.5 font-mono text-[10px] font-extrabold text-[#1E1B18]">
              <span className="h-2 w-2 rounded-full bg-[#E1503A]" />
              <span>HIGH RESOLUTION 300DPI</span>
            </div>
            <h2 className="mt-2 font-serif text-2xl font-bold text-[#1E1B18]">
              Save Your Keepsake
            </h2>
            <p className="mt-1 font-sans text-xs text-[#1E1B18]/70 leading-relaxed">
              Composited directly on client-side HTML5 Canvas. Ready for physical photo printing, social sharing, and archiving.
            </p>
          </div>

          {/* Download CTA Button */}
          <button
            onClick={handleDownload}
            disabled={isRendering}
            className="kiosk-btn flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#E1503A] py-4 font-sans text-base font-extrabold tracking-wide text-white cursor-pointer shadow-[3px_3px_0px_#1E1B18]"
          >
            {downloadSuccess ? (
              <>
                <Check size={20} weight="bold" />
                <span>SAVED TO DOWNLOADS!</span>
              </>
            ) : (
              <>
                <DownloadSimple size={20} weight="bold" />
                <span>DOWNLOAD PHOTO CARD</span>
              </>
            )}
          </button>

          {/* Secondary Actions */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onEditAgain}
              className="kiosk-btn flex items-center justify-center gap-1.5 rounded-xl bg-white py-2.5 font-mono text-xs font-bold text-[#1E1B18] cursor-pointer"
            >
              <PencilSimple size={16} weight="bold" />
              <span>EDIT STYLING</span>
            </button>

            <button
              onClick={handleShare}
              className="kiosk-btn flex items-center justify-center gap-1.5 rounded-xl bg-white py-2.5 font-mono text-xs font-bold text-[#1E1B18] cursor-pointer"
            >
              <ShareNetwork size={16} weight="bold" />
              <span>SHARE CARD</span>
            </button>
          </div>

          {shareFeedback && (
            <div className="rounded-xl border border-[#1E1B18] bg-[#FAF7F0] px-3 py-1.5 text-center font-mono text-xs font-bold text-[#1E1B18]">
              {shareFeedback}
            </div>
          )}

          <div className="border-t border-[#1E1B18]/15 pt-3">
            <button
              onClick={onStartOver}
              className="w-full text-center font-mono text-xs font-bold text-[#1E1B18]/70 hover:text-[#1E1B18] hover:underline cursor-pointer"
            >
              ↺ Take Another Booth Session
            </button>
          </div>
        </div>
      </div>
    </BoothShell>
  );
}
