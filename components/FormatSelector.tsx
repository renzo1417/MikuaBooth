"use client";

import React, { useState } from "react";
import { BOOTH_FORMATS, BoothFormat } from "@/lib/templates";
import { ArrowLeft, ArrowRight, Camera, Sparkle, FilmStrip } from "@phosphor-icons/react";
import { BoothShell } from "@/components/BoothShell";

interface FormatSelectorProps {
  onSelectFormat: (format: BoothFormat) => void;
  onBack: () => void;
  isDemoMode: boolean;
}

export function FormatSelector({
  onSelectFormat,
  onBack,
  isDemoMode,
}: FormatSelectorProps) {
  const [selectedFormatId, setSelectedFormatId] = useState<string>("classic-4");

  const selectedFormat =
    BOOTH_FORMATS.find((f) => f.id === selectedFormatId) || BOOTH_FORMATS[0];

  const handleContinue = () => {
    onSelectFormat(selectedFormat);
  };

  return (
    <BoothShell
      variant="scroll"
      className="px-4 py-5 md:px-8 xl:px-12 md:py-7 select-none"
      header={
        <>
          <button
            onClick={onBack}
            className="kiosk-btn flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 font-mono text-xs font-bold text-[#1E1B18] cursor-pointer"
          >
            <ArrowLeft size={16} weight="bold" />
            <span>BACK TO HOME</span>
          </button>

          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#E1503A] text-white px-3 py-0.5 font-mono text-[11px] font-bold shadow-[2px_2px_0px_#1E1B18]">
              <Sparkle size={12} weight="fill" />
              <span>STEP 1 · SELECT SHOT COUNT</span>
            </div>
            <h1 className="mt-1 font-serif text-2xl md:text-3xl font-bold tracking-tight text-[#1E1B18]">
              Choose Your Booth Format
            </h1>
          </div>

          <div className="hidden sm:flex items-center gap-2 rounded-xl border-[2px] border-[#1E1B18] bg-white px-3 py-1.5 font-mono text-xs font-bold text-[#1E1B18]">
            <span className="h-2.5 w-2.5 rounded-full bg-[#E1503A] animate-pulse" />
            <span>{isDemoMode ? "DEMO MODE" : "LIVE CAMERA"}</span>
          </div>
        </>
      }
      footer={
        <div className="mt-4 flex w-full flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border-[3px] border-[#1E1B18] bg-white p-3.5 sm:p-4 shadow-[4px_4px_0px_#1E1B18]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 shrink-0 rounded-xl border-[2px] border-[#1E1B18] bg-[#FAF7F0] flex items-center justify-center font-serif font-bold text-lg text-[#1E1B18]">
              {selectedFormat.slotCount}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-base font-bold text-[#1E1B18]">
                  {selectedFormat.name}
                </span>
                <span className="rounded bg-[#FAF7F0] border border-[#1E1B18]/30 px-1.5 py-0.5 font-mono text-[9px] font-extrabold text-[#1E1B18]">
                  {selectedFormat.tagline}
                </span>
              </div>
              <span className="block font-mono text-[11px] text-[#1E1B18]/70">
                You&apos;ll take {selectedFormat.slotCount} photos 1-by-1, then customize colors &amp; stamps in the studio.
              </span>
            </div>
          </div>

          <button
            onClick={handleContinue}
            className="kiosk-btn flex items-center justify-center gap-2.5 rounded-xl bg-[#E1503A] px-7 py-3 font-sans text-sm font-extrabold text-white cursor-pointer shadow-[3px_3px_0px_#1E1B18]"
          >
            <span>ENTER BOOTH</span>
            <ArrowRight size={17} weight="bold" />
          </button>
        </div>
      }
    >
      <div className="my-4 flex w-full flex-col gap-5">
        {/* Helper Note Banner */}
        <div className="flex items-center justify-between rounded-xl border-[2px] border-[#1E1B18] bg-[#FAF7F0] px-4 py-2.5 text-xs font-mono text-[#1E1B18]">
          <div className="flex items-center gap-2">
            <FilmStrip size={16} weight="bold" className="text-[#E1503A]" />
            <span>
              <strong>Pure Booth Experience:</strong> You pick the slot count now; card colors, retro border themes, film tones, and stickers are designed <em>after</em> your photos are captured.
            </span>
          </div>
        </div>

        {/* Formats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5 sm:gap-4">
          {BOOTH_FORMATS.map((fmt) => {
            const isSelected = fmt.id === selectedFormatId;
            return (
              <div
                key={fmt.id}
                onClick={() => setSelectedFormatId(fmt.id)}
                className={`group relative flex flex-col justify-between rounded-2xl border-[2.5px] border-[#1E1B18] bg-white p-3.5 transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? "ring-3 ring-[#E1503A] shadow-[4px_4px_0px_#1E1B18] -translate-y-1 bg-[#FFFDF8]"
                    : "shadow-[2.5px_2.5px_0px_#1E1B18] hover:shadow-[4px_4px_0px_#1E1B18] hover:-translate-y-0.5"
                }`}
              >
                {/* Header Badge */}
                <div className="flex items-center justify-between pb-2 border-b border-[#1E1B18]/10">
                  <span
                    className={`rounded border border-[#1E1B18] px-1.5 py-0.5 font-mono text-[9px] font-extrabold ${
                      isSelected
                        ? "bg-[#E1503A] text-white"
                        : "bg-[#FAF7F0] text-[#1E1B18]"
                    }`}
                  >
                    {fmt.badge}
                  </span>
                  <span className="font-mono text-[10px] font-bold text-[#1E1B18]/75">
                    {fmt.slotCount} SHOTS
                  </span>
                </div>

                {/* Tactile Wireframe Preview of Slots */}
                <div className="relative my-3 flex h-36 w-full items-center justify-center overflow-hidden rounded-xl border-[2px] border-[#1E1B18] bg-[#FAF7F0] p-2.5 transition-transform group-hover:scale-[1.01]">
                  <div
                    className="relative flex items-center justify-center"
                    style={{
                      aspectRatio: fmt.aspectRatio,
                      height: "100%",
                      maxWidth: fmt.layout.startsWith("strip") ? "55px" : "110px",
                    }}
                  >
                    <div className="absolute inset-0 rounded border-[1.5px] border-[#1E1B18] bg-white p-1">
                      <div
                        className="grid h-full w-full gap-1"
                        style={{
                          gridTemplateColumns: `repeat(${fmt.cols}, minmax(0, 1fr))`,
                          gridTemplateRows: `repeat(${fmt.rows}, minmax(0, 1fr))`,
                        }}
                      >
                        {Array.from({ length: fmt.slotCount }).map((_, i) => (
                          <div
                            key={i}
                            className={`flex items-center justify-center rounded-xs border border-[#1E1B18] ${
                              isSelected ? "bg-[#E1503A]/15 text-[#E1503A]" : "bg-[#FAF7F0] text-[#1E1B18]/50"
                            }`}
                          >
                            <Camera size={10} weight="bold" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="pt-1">
                  <h3 className="font-serif text-base font-bold text-[#1E1B18] leading-snug">
                    {fmt.name}
                  </h3>
                  <span className="block font-mono text-[10px] font-extrabold text-[#E1503A] mt-0.5">
                    {fmt.tagline}
                  </span>
                  <p className="mt-1.5 font-sans text-[11px] text-[#1E1B18]/70 leading-relaxed line-clamp-2">
                    {fmt.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </BoothShell>
  );
}

