"use client";

import React, { useState, useMemo } from "react";
import {
  FRAME_TEMPLATES,
  TEMPLATE_CATEGORIES,
  FrameTemplate,
  TemplateCategory,
  SlotCount,
} from "@/lib/templates";
import { Sparkle, ArrowRight, ArrowLeft, Check, Camera } from "@phosphor-icons/react";
import { BoothShell } from "@/components/BoothShell";

interface TemplateBrowserProps {
  onSelectTemplate: (template: FrameTemplate) => void;
  onBack: () => void;
}

export function TemplateBrowser({
  onSelectTemplate,
  onBack,
}: TemplateBrowserProps) {
  const [activeCategory, setActiveCategory] = useState<TemplateCategory>("All");
  const [activeSlotCount, setActiveSlotCount] = useState<SlotCount | "all">("all");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("kpop-life4cuts-classic");

  const slotOptions: { label: string; count: SlotCount | "all" }[] = [
    { label: "All Formats", count: "all" },
    { label: "3 Photos", count: 3 },
    { label: "4 Photos", count: 4 },
    { label: "8 Photos", count: 8 },
    { label: "16 Photos", count: 16 },
  ];

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return FRAME_TEMPLATES.filter((t) => {
      const matchCategory =
        activeCategory === "All" ||
        t.tags.some((tag) => tag === activeCategory);
      const matchSlot =
        activeSlotCount === "all" || t.slotCount === activeSlotCount;
      return matchCategory && matchSlot;
    });
  }, [activeCategory, activeSlotCount]);

  const selectedTemplate =
    FRAME_TEMPLATES.find((t) => t.id === selectedTemplateId) || FRAME_TEMPLATES[0];

  const handleContinue = () => {
    onSelectTemplate(selectedTemplate);
  };

  return (
    <BoothShell
      variant="scroll"
      className="px-4 py-6 md:px-8 xl:px-12 md:py-8"
      header={
        <>
          <button
            onClick={onBack}
            className="kiosk-btn flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 font-mono text-xs font-bold text-[#17140F] cursor-pointer"
          >
            <ArrowLeft size={16} weight="bold" />
            <span>BACK</span>
          </button>

          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#D4FF3D] border-[2px] border-[#17140F] px-3 py-0.5 font-mono text-[11px] font-bold text-[#17140F]">
              <Sparkle size={12} weight="fill" className="text-[#FF3D9A]" />
              <span>STEP 1 · CHOOSE YOUR FRAME</span>
            </div>
            <h1 className="mt-1 font-fredoka text-2xl md:text-3xl font-bold tracking-tight text-[#17140F]">
              Frame Kiosk Studio
            </h1>
          </div>

          <div className="hidden sm:flex items-center gap-2 rounded-xl border-[2px] border-[#17140F] bg-white px-3 py-1.5 font-mono text-xs font-bold text-[#17140F]">
            <span className="h-2.5 w-2.5 rounded-full bg-[#FF3D9A] animate-pulse" />
            <span>{filteredTemplates.length} DESIGNS</span>
          </div>
        </>
      }
      footer={
        <div className="mt-5 flex w-full flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border-[3px] border-[#17140F] bg-white p-3.5 sm:p-4 shadow-[4px_4px_0px_#17140F]">
          <div className="flex items-center gap-3">
            <div
              className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 rounded-xl border-[2px] border-[#17140F] flex items-center justify-center font-fredoka font-bold text-base sm:text-lg text-[#17140F]"
              style={{ backgroundColor: selectedTemplate.bgColor }}
            >
              {selectedTemplate.slotCount}
            </div>
            <div>
              <span className="block font-fredoka text-sm sm:text-base font-bold text-[#17140F]">
                {selectedTemplate.name}
              </span>
              <span className="block font-mono text-[11px] sm:text-xs text-[#17140F]/70">
                Ready for {selectedTemplate.slotCount} guided burst snaps
              </span>
            </div>
          </div>

          <button
            onClick={handleContinue}
            className="kiosk-btn flex items-center justify-center gap-2.5 rounded-xl bg-[#FF6B4A] px-7 py-3 font-manrope text-sm font-extrabold text-white cursor-pointer"
          >
            <span>CONTINUE TO BOOTH</span>
            <ArrowRight size={17} weight="bold" />
          </button>
        </div>
      }
    >
      {/* Main Section */}
      <div className="my-5 flex w-full flex-col gap-5">
        {/* Category Style Chips (K-pop, Y2K, Soft & Dreamy, Minimalist) */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-extrabold uppercase tracking-wider text-[#17140F]">
              Style Moodboard:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {TEMPLATE_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`kiosk-btn rounded-xl px-4 py-2 font-manrope text-xs sm:text-sm font-extrabold cursor-pointer transition-all ${
                    isActive
                      ? "bg-[#6C4FE0] text-white shadow-[3px_3px_0px_#17140F] scale-[1.02]"
                      : "bg-white text-[#17140F] hover:bg-[#FAF7F0]"
                  }`}
                >
                  {cat === "All" && "✦ "}
                  {cat === "K-pop" && "♥ "}
                  {cat === "Y2K" && "★ "}
                  {cat === "Soft & Dreamy" && "☁ "}
                  {cat === "Minimalist" && "▪ "}
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Slot Count Segmented Control */}
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border-[2.5px] border-[#17140F] bg-[#FAF7F0] p-1.5">
          <span className="px-2.5 font-mono text-xs font-extrabold text-[#17140F]/70">
            SLOT COUNT:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {slotOptions.map((opt) => {
              const isActive = activeSlotCount === opt.count;
              return (
                <button
                  key={String(opt.count)}
                  onClick={() => setActiveSlotCount(opt.count)}
                  className={`rounded-xl border-[2px] px-3 py-1 font-mono text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "border-[#17140F] bg-[#D4FF3D] text-[#17140F] shadow-[2px_2px_0px_#17140F]"
                      : "border-transparent bg-transparent text-[#17140F]/80 hover:bg-white"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Frame Templates Grid - Extended width & responsive 5/6 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3.5 sm:gap-4">
          {filteredTemplates.map((template) => {
            const isSelected = template.id === selectedTemplateId;
            return (
              <div
                key={template.id}
                onClick={() => setSelectedTemplateId(template.id)}
                className={`group relative flex flex-col justify-between rounded-2xl border-[2.5px] border-[#17140F] bg-white p-3 transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? "ring-3 ring-[#FF6B4A] shadow-[4px_4px_0px_#17140F] -translate-y-1 bg-[#FFFDF8]"
                    : "shadow-[2.5px_2.5px_0px_#17140F] hover:shadow-[4px_4px_0px_#17140F] hover:-translate-y-0.5"
                }`}
              >
                {/* Template Badge Header */}
                <div className="flex items-center justify-between pb-2">
                  <span className="rounded border border-[#17140F] bg-[#D4FF3D] px-1.5 py-0.5 font-mono text-[9px] font-extrabold text-[#17140F]">
                    {template.badge}
                  </span>
                  <span className="font-mono text-[10px] font-bold text-[#17140F]/75">
                    {template.slotCount} PHOTOS
                  </span>
                </div>

                {/* Compact Miniature Frame Layout Preview (Short, elegant height) */}
                <div
                  className="relative my-1 flex h-28 sm:h-32 w-full items-center justify-center overflow-hidden rounded-xl border-[2px] border-[#17140F] p-2 transition-transform group-hover:scale-[1.01]"
                  style={{
                    backgroundColor: template.bgColor,
                  }}
                >
                  {/* Miniature Slots */}
                  <div
                    className="relative h-auto w-full"
                    style={{
                      aspectRatio: template.aspectRatio,
                      maxWidth: template.layout.startsWith("strip") ? "68px" : "105px",
                    }}
                  >
                    {/* Outer decorative card border simulation */}
                    <div
                      className="absolute inset-0 rounded border-[1.5px]"
                      style={{ borderColor: template.borderColor }}
                    />

                    {/* Slots map */}
                    {template.slots.map((s) => (
                      <div
                        key={s.index}
                        className="absolute rounded-xs border border-[#17140F] bg-white flex items-center justify-center shadow-xs"
                        style={{
                          left: `${s.x}%`,
                          top: `${s.y}%`,
                          width: `${s.width}%`,
                          height: `${s.height}%`,
                        }}
                      >
                        <Camera size={8} className="text-[#17140F]/40" />
                      </div>
                    ))}
                  </div>

                  {/* Selected Tick Indicator */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#FF6B4A] border-[1.5px] border-[#17140F] text-white shadow-xs">
                      <Check size={12} weight="bold" />
                    </div>
                  )}
                </div>

                {/* Info & Details */}
                <div className="pt-2">
                  <h3 className="font-fredoka text-sm sm:text-base font-bold text-[#17140F] truncate">
                    {template.name}
                  </h3>
                  <div className="mt-1 flex flex-wrap items-center gap-1">
                    {template.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="rounded bg-[#FAF7F0] border border-[#17140F]/20 px-1.5 py-[0.2rem] font-mono text-[8px] font-semibold text-[#17140F]/80"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="my-10 flex flex-col items-center justify-center rounded-2xl border-[2.5px] border-dashed border-[#17140F]/40 p-8 text-center">
            <span className="font-fredoka text-lg font-bold text-[#17140F]">
              No frame templates match this filter
            </span>
            <button
              onClick={() => {
                setActiveCategory("All");
                setActiveSlotCount("all");
              }}
              className="kiosk-btn mt-3 rounded-xl bg-[#D4FF3D] px-4 py-2 font-mono text-xs font-bold text-[#17140F]"
            >
              RESET FILTERS
            </button>
          </div>
        )}
      </div>

    </BoothShell>
  );
}
