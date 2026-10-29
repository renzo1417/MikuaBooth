"use client";

import React, { useState, useRef } from "react";
import {
  FrameTemplate,
  FRAME_COLOR_SWATCHES,
  BorderPattern,
} from "@/lib/templates";
import { PHOTO_FILTERS } from "@/lib/filters";
import {
  STICKER_DEFINITIONS,
  STICKER_PALETTE,
  StickerItem,
  getStickerByType,
} from "@/lib/stickers";
import { CardCaption } from "@/hooks/useKioskCanvasExport";
import { UseCameraCaptureReturn } from "@/hooks/useCameraCapture";
import { SingleSlotRetakeModal } from "@/components/SingleSlotRetakeModal";
import { CapturedShotItem } from "@/components/CaptureScreen";
import {
  Sparkle,
  ArrowRight,
  ArrowLeft,
  Camera,
  X,
} from "@phosphor-icons/react";
import { BoothShell } from "@/components/BoothShell";

interface SlotEditorProps {
  template: FrameTemplate;
  onUpdateTemplate: (template: FrameTemplate) => void;
  photos: Record<string, string>;
  slotMap: Record<number, string>;
  camera: UseCameraCaptureReturn;
  isDemoMode: boolean;
  onUpdateSlotMap: (newMap: Record<number, string>) => void;
  onAddNewPhoto: (newPhoto: CapturedShotItem) => void;
  globalFilterId: string;
  onChangeGlobalFilter: (filterId: string) => void;
  photoFilters: Record<string, string>;
  onChangePhotoFilter: (photoId: string, filterId: string) => void;
  stickers: StickerItem[];
  onChangeStickers: (
    update: StickerItem[] | ((prev: StickerItem[]) => StickerItem[])
  ) => void;
  caption: CardCaption;
  onChangeCaption: (caption: CardCaption) => void;
  onProceedToFinish: () => void;
  onBackToCapture: () => void;
}

type EditorTab = "frame" | "filters" | "stickers" | "caption";

export function SlotEditor({
  template,
  onUpdateTemplate,
  photos,
  slotMap,
  camera,
  isDemoMode,
  onUpdateSlotMap,
  onAddNewPhoto,
  globalFilterId,
  onChangeGlobalFilter,
  photoFilters,
  onChangePhotoFilter,
  stickers,
  onChangeStickers,
  caption,
  onChangeCaption,
  onProceedToFinish,
  onBackToCapture,
}: SlotEditorProps) {
  const [activeTab, setActiveTab] = useState<EditorTab>("frame");
  const [filterScope, setFilterScope] = useState<"all" | "slot">("all");
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number>(0);
  const [retakeModalSlot, setRetakeModalSlot] = useState<number | null>(null);
  const [draggedSlotIndex, setDraggedSlotIndex] = useState<number | null>(null);
  const [dragOverSlotIndex, setDragOverSlotIndex] = useState<number | null>(null);

  // Sticker manipulation
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
  const cardContainerRef = useRef<HTMLDivElement | null>(null);
  const stickerCounterRef = useRef(0);

  const swapSlots = (slotA: number, slotB: number) => {
    if (slotA === slotB) return;
    const newMap = { ...slotMap };
    const temp = newMap[slotA];
    newMap[slotA] = newMap[slotB];
    newMap[slotB] = temp;
    onUpdateSlotMap(newMap);
    setSelectedSlotIndex(slotB);
  };

  const handleApplyColorSwatch = (swatch: typeof FRAME_COLOR_SWATCHES[0]) => {
    onUpdateTemplate({
      ...template,
      bgColor: swatch.hex,
      textColor: swatch.textColor,
      subTextColor: swatch.subTextColor,
      borderColor: swatch.borderColor,
    });
  };

  const handleApplyBorderPattern = (pattern: BorderPattern) => {
    onUpdateTemplate({
      ...template,
      borderPattern: pattern,
    });
  };

  const handleAddSticker = (type: string) => {
    stickerCounterRef.current += 1;
    const count = stickerCounterRef.current;
    const rotation = ((count * 17) % 31) - 15;
    const newSticker: StickerItem = {
      id: `sticker_${count}`,
      type,
      x: 35 + (count % 5) * 6,
      y: 40 + (count % 4) * 8,
      rotation,
      scale: 1,
      color: STICKER_PALETTE[count % STICKER_PALETTE.length],
    };
    onChangeStickers((prev) => [...prev, newSticker]);
    setSelectedStickerId(newSticker.id);
  };

  const handleRemoveSticker = (id: string) => {
    onChangeStickers((prev) => prev.filter((s) => s.id !== id));
    if (selectedStickerId === id) setSelectedStickerId(null);
  };

  return (
    <BoothShell
      as="div"
      variant="fixed"
      className="px-3 py-2 sm:px-6 sm:py-3 md:px-8 md:py-3 overflow-hidden select-none"
      header={
        <>
          <button
            onClick={onBackToCapture}
            className="kiosk-btn inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 font-mono text-xs font-bold text-[#1E1B18] cursor-pointer"
          >
            <ArrowLeft size={16} weight="bold" />
            <span>RETAKE ALL</span>
          </button>

          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#E1503A] text-white px-3 py-0.5 font-mono text-[10px] font-bold shadow-[2px_2px_0px_#1E1B18]">
              <Sparkle size={11} weight="fill" />
              <span>STEP 2 · DESIGN YOUR CARD</span>
            </div>
            <h1 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-[#1E1B18]">
              Photo Booth Studio Workbench
            </h1>
          </div>

          <button
            onClick={onProceedToFinish}
            className="kiosk-btn inline-flex items-center gap-1.5 rounded-xl bg-[#E1503A] text-white px-3.5 py-1.5 font-sans text-xs font-bold cursor-pointer shadow-[2px_2px_0px_#1E1B18]"
          >
            <span>FINISH CARD</span>
            <ArrowRight size={15} weight="bold" />
          </button>
        </>
      }
    >
      <div className="flex-1 min-h-0 w-full mx-auto flex flex-col lg:grid lg:grid-cols-[1fr_390px] xl:grid-cols-[1fr_420px] gap-3 my-1 items-stretch overflow-hidden">
        
        {/* ================= LEFT / CENTER: INTERACTIVE CARD PREVIEW ================= */}
        <main className="flex-1 min-h-0 flex flex-col items-center justify-center p-2 rounded-2xl border-[2.5px] border-[#1E1B18] bg-white shadow-[3px_3px_0px_#1E1B18] overflow-hidden">
          
          {/* Card Workbench Canvas */}
          <div
            ref={cardContainerRef}
            className="relative flex items-center justify-center rounded-2xl border-[3px] p-3 shadow-[5px_5px_0px_#1E1B18] transition-all"
            style={{
              aspectRatio: template.aspectRatio,
              height: "100%",
              maxHeight: "calc(100vh - 190px)",
              width: "auto",
              maxWidth: "100%",
              backgroundColor: template.bgColor,
              borderColor: template.borderColor,
            }}
          >
            {/* Header Stamp */}
            <div className="absolute top-2 inset-x-0 text-center pointer-events-none select-none">
              <span
                className="block font-serif text-[10px] sm:text-xs font-bold tracking-wide"
                style={{ color: template.textColor }}
              >
                {template.headerTitle}
              </span>
            </div>

            {/* Slots Container */}
            <div className="relative w-full h-full">
              {template.slots.map((slot) => {
                const photoId = slotMap[slot.index];
                const photoSrc = photoId ? photos[photoId] : null;
                const isSelected = selectedSlotIndex === slot.index;
                const slotFilterId = (photoId && photoFilters[photoId]) || globalFilterId;
                const filterDef = PHOTO_FILTERS.find((f) => f.id === slotFilterId) || PHOTO_FILTERS[0];

                return (
                  <div
                    key={slot.index}
                    draggable
                    onDragStart={() => setDraggedSlotIndex(slot.index)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOverSlotIndex(slot.index);
                    }}
                    onDragLeave={() => setDragOverSlotIndex(null)}
                    onDrop={() => {
                      if (draggedSlotIndex !== null) {
                        swapSlots(draggedSlotIndex, slot.index);
                        setDraggedSlotIndex(null);
                        setDragOverSlotIndex(null);
                      }
                    }}
                    onClick={() => setSelectedSlotIndex(slot.index)}
                    className={`group absolute overflow-hidden rounded-lg border-[2px] transition-all cursor-pointer ${
                      isSelected
                        ? "ring-3 ring-[#E1503A] shadow-md z-20"
                        : "border-[#1E1B18] hover:border-[#E1503A] z-10"
                    } ${dragOverSlotIndex === slot.index ? "scale-95 opacity-60" : ""}`}
                    style={{
                      left: `${slot.x}%`,
                      top: `${slot.y}%`,
                      width: `${slot.width}%`,
                      height: `${slot.height}%`,
                    }}
                  >
                    {photoSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={photoSrc}
                        alt={`Slot ${slot.index + 1}`}
                        className="h-full w-full object-cover transition-[filter] duration-150"
                        style={{ filter: filterDef.cssFilter }}
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center bg-[#1E1B18]/10 font-mono text-[9px] text-[#1E1B18]/50">
                        <span>SLOT #{slot.index + 1}</span>
                      </div>
                    )}

                    {/* Corner Tag */}
                    <span className="absolute top-1 left-1 rounded bg-black/60 px-1 font-mono text-[7px] font-bold text-white">
                      #{slot.index + 1}
                    </span>

                    {/* Hover Retake Button */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setRetakeModalSlot(slot.index);
                        }}
                        className="rounded-md bg-[#E1503A] text-white px-2 py-1 font-sans text-[10px] font-bold flex items-center gap-1 shadow-xs cursor-pointer hover:scale-105"
                      >
                        <Camera size={12} weight="bold" />
                        <span>Retake</span>
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Render Draggable Stickers */}
              {stickers.map((stk) => {
                const def = getStickerByType(stk.type);
                if (!def) return null;
                const isSelected = selectedStickerId === stk.id;

                return (
                  <div
                    key={stk.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedStickerId(stk.id);
                    }}
                    className={`absolute z-30 cursor-move group/sticker ${
                      isSelected ? "ring-2 ring-[#E1503A] rounded-sm" : ""
                    }`}
                    style={{
                      left: `${stk.x}%`,
                      top: `${stk.y}%`,
                      transform: `translate(-50%, -50%) rotate(${stk.rotation}deg) scale(${stk.scale})`,
                    }}
                  >
                    <svg
                      width="38"
                      height="38"
                      viewBox="0 0 100 100"
                      className="drop-shadow-[1px_1px_0px_#1E1B18]"
                    >
                      <path d={def.svgPath} fill={stk.color || def.defaultColor} />
                    </svg>

                    {isSelected && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveSticker(stk.id);
                        }}
                        className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#E1503A] text-white border border-[#1E1B18] shadow-xs cursor-pointer"
                        title="Delete sticker"
                      >
                        <X size={10} weight="bold" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Custom Caption Banner */}
            {caption.enabled && caption.text && (
              <div
                className="absolute bottom-7 inset-x-4 mx-auto text-center rounded-sm px-2 py-0.5 border border-[#1E1B18]/30 shadow-xs max-w-[80%]"
                style={{
                  backgroundColor: caption.bgColor || "#FFFFFF",
                  color: caption.color || "#1E1B18",
                }}
              >
                <span className="font-mono text-[9px] font-bold tracking-wider truncate block">
                  {caption.text}
                </span>
              </div>
            )}

            {/* Footer Stamp */}
            <div className="absolute bottom-2 inset-x-0 text-center pointer-events-none select-none">
              <span
                className="block font-serif text-[9px] sm:text-[10px] font-bold italic"
                style={{ color: template.subTextColor }}
              >
                MikuaBooth · {template.footerStamp}
              </span>
            </div>
          </div>
        </main>

        {/* ================= RIGHT: STUDIO CONTROLS PALETTE ================= */}
        <aside className="w-full min-w-0 h-full min-h-0 flex flex-col gap-2 rounded-2xl border-[2.5px] border-[#1E1B18] bg-white p-3 shadow-[3px_3px_0px_#1E1B18] overflow-hidden">
          
          {/* Tab Navigation */}
          <div className="flex rounded-xl border-[2px] border-[#1E1B18] bg-[#FAF7F0] p-0.5 shrink-0">
            <button
              onClick={() => setActiveTab("frame")}
              className={`flex-1 py-1.5 font-mono text-xs font-bold rounded-lg cursor-pointer transition-all ${
                activeTab === "frame"
                  ? "bg-[#E1503A] text-white shadow-xs"
                  : "text-[#1E1B18]/70 hover:bg-white"
              }`}
            >
              FRAME
            </button>
            <button
              onClick={() => setActiveTab("filters")}
              className={`flex-1 py-1.5 font-mono text-xs font-bold rounded-lg cursor-pointer transition-all ${
                activeTab === "filters"
                  ? "bg-[#E1503A] text-white shadow-xs"
                  : "text-[#1E1B18]/70 hover:bg-white"
              }`}
            >
              FILTERS
            </button>
            <button
              onClick={() => setActiveTab("stickers")}
              className={`flex-1 py-1.5 font-mono text-xs font-bold rounded-lg cursor-pointer transition-all ${
                activeTab === "stickers"
                  ? "bg-[#E1503A] text-white shadow-xs"
                  : "text-[#1E1B18]/70 hover:bg-white"
              }`}
            >
              STAMPS
            </button>
            <button
              onClick={() => setActiveTab("caption")}
              className={`flex-1 py-1.5 font-mono text-xs font-bold rounded-lg cursor-pointer transition-all ${
                activeTab === "caption"
                  ? "bg-[#E1503A] text-white shadow-xs"
                  : "text-[#1E1B18]/70 hover:bg-white"
              }`}
            >
              TEXT
            </button>
          </div>

          {/* Tab Content Body */}
          <div className="flex-1 min-h-0 overflow-y-auto pr-1 flex flex-col gap-3 py-1">
            
            {/* TAB 1: FRAME COLOR & PATTERN */}
            {activeTab === "frame" && (
              <div className="flex flex-col gap-3">
                <div>
                  <span className="block font-mono text-xs font-black uppercase tracking-wider text-[#1E1B18] mb-2">
                    Physical Frame Color:
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {FRAME_COLOR_SWATCHES.map((swatch) => {
                      const isSelected = template.bgColor === swatch.hex;
                      return (
                        <button
                          key={swatch.id}
                          onClick={() => handleApplyColorSwatch(swatch)}
                          className={`flex flex-col items-center justify-center p-2 rounded-xl border-[2px] border-[#1E1B18] transition-all cursor-pointer ${
                            isSelected
                              ? "ring-2 ring-[#E1503A] shadow-[2px_2px_0px_#1E1B18] scale-[1.02]"
                              : "hover:scale-[1.01]"
                          }`}
                        >
                          <div
                            className="h-7 w-7 rounded-full border border-[#1E1B18] mb-1 shadow-xs"
                            style={{ backgroundColor: swatch.hex }}
                          />
                          <span className="font-mono text-[9px] font-bold text-[#1E1B18] truncate w-full text-center">
                            {swatch.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-[#1E1B18]/15 pt-2.5">
                  <span className="block font-mono text-xs font-black uppercase tracking-wider text-[#1E1B18] mb-2">
                    Border Texture &amp; Style:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {(["solid", "dots", "checker", "film", "double"] as BorderPattern[]).map(
                      (pattern) => (
                        <button
                          key={pattern}
                          onClick={() => handleApplyBorderPattern(pattern)}
                          className={`rounded-xl border-[2px] p-2 font-mono text-xs font-bold text-center cursor-pointer transition-all ${
                            template.borderPattern === pattern
                              ? "border-[#1E1B18] bg-[#E1503A] text-white shadow-xs"
                              : "border-[#1E1B18]/20 bg-[#FAF7F0] text-[#1E1B18] hover:bg-white"
                          }`}
                        >
                          {pattern.toUpperCase()}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: FILTERS */}
            {activeTab === "filters" && (
              <div className="flex flex-col gap-3">
                {/* Scope Toggle */}
                <div className="flex items-center gap-1 rounded-xl border border-[#1E1B18] bg-[#FAF7F0] p-1">
                  <button
                    onClick={() => setFilterScope("all")}
                    className={`flex-1 py-1 font-mono text-[11px] font-bold rounded-lg cursor-pointer ${
                      filterScope === "all" ? "bg-[#E1503A] text-white" : "text-[#1E1B18]/70"
                    }`}
                  >
                    ALL SLOTS
                  </button>
                  <button
                    onClick={() => setFilterScope("slot")}
                    className={`flex-1 py-1 font-mono text-[11px] font-bold rounded-lg cursor-pointer ${
                      filterScope === "slot" ? "bg-[#E1503A] text-white" : "text-[#1E1B18]/70"
                    }`}
                  >
                    SLOT #{selectedSlotIndex + 1} ONLY
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {PHOTO_FILTERS.map((f) => {
                    const isSelected =
                      filterScope === "all"
                        ? globalFilterId === f.id
                        : (slotMap[selectedSlotIndex] &&
                            photoFilters[slotMap[selectedSlotIndex]] === f.id) ||
                          globalFilterId === f.id;

                    return (
                      <button
                        key={f.id}
                        onClick={() => {
                          if (filterScope === "all") {
                            onChangeGlobalFilter(f.id);
                          } else {
                            const photoId = slotMap[selectedSlotIndex];
                            if (photoId) onChangePhotoFilter(photoId, f.id);
                          }
                        }}
                        className={`flex flex-col items-center p-2 rounded-xl border-[2px] transition-all cursor-pointer ${
                          isSelected
                            ? "border-[#1E1B18] bg-[#FAF7F0] ring-2 ring-[#E1503A] shadow-xs"
                            : "border-[#1E1B18]/20 bg-white hover:border-[#1E1B18]"
                        }`}
                      >
                        <span className="font-mono text-xs font-bold text-[#1E1B18]">{f.name}</span>
                        <span className="font-sans text-[10px] text-[#1E1B18]/60 mt-0.5 line-clamp-1">
                          {f.shortDesc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: STICKERS & STAMPS */}
            {activeTab === "stickers" && (
              <div className="flex flex-col gap-2.5">
                <span className="font-mono text-xs font-black uppercase tracking-wider text-[#1E1B18]">
                  Click to Stamp onto Card:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {STICKER_DEFINITIONS.map((stk) => (
                    <button
                      key={stk.type}
                      onClick={() => handleAddSticker(stk.type)}
                      className="flex flex-col items-center justify-center p-2 rounded-xl border-[2px] border-[#1E1B18]/20 bg-[#FAF7F0] hover:border-[#1E1B18] hover:bg-white transition-all cursor-pointer group"
                    >
                      <svg width="28" height="28" viewBox="0 0 100 100" className="mb-1">
                        <path d={stk.svgPath} fill={stk.defaultColor} />
                      </svg>
                      <span className="font-mono text-[10px] font-bold text-[#1E1B18]">
                        {stk.name}
                      </span>
                    </button>
                  ))}
                </div>

                {stickers.length > 0 && (
                  <div className="border-t border-[#1E1B18]/15 pt-2 flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-[#1E1B18]/70">
                      {stickers.length} STAMPS APPLIED
                    </span>
                    <button
                      onClick={() => onChangeStickers([])}
                      className="font-mono text-[10px] font-bold text-[#E1503A] hover:underline cursor-pointer"
                    >
                      CLEAR ALL STAMPS
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: DATE STAMP & CAPTION */}
            {activeTab === "caption" && (
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-2 cursor-pointer font-mono text-xs font-bold text-[#1E1B18]">
                  <input
                    type="checkbox"
                    checked={caption.enabled}
                    onChange={(e) =>
                      onChangeCaption({ ...caption, enabled: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-[#1E1B18] text-[#E1503A]"
                  />
                  <span>Enable Custom Keepsake Stamp</span>
                </label>

                {caption.enabled && (
                  <div className="flex flex-col gap-2">
                    <span className="font-mono text-[11px] text-[#1E1B18]/70">Stamp Text:</span>
                    <input
                      type="text"
                      maxLength={32}
                      value={caption.text}
                      onChange={(e) =>
                        onChangeCaption({ ...caption, text: e.target.value })
                      }
                      placeholder="e.g. HONGDAE SEOUL · 2026"
                      className="rounded-xl border-[2px] border-[#1E1B18] bg-white px-3 py-2 font-mono text-xs text-[#1E1B18] focus:outline-none focus:ring-2 focus:ring-[#E1503A]"
                    />
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Footer Action */}
          <div className="mt-auto pt-2 border-t border-[#1E1B18]/15 flex flex-col gap-1.5 shrink-0">
            <button
              onClick={onProceedToFinish}
              className="kiosk-btn flex items-center justify-center gap-2 rounded-xl bg-[#E1503A] py-3 font-sans text-sm font-extrabold text-white cursor-pointer shadow-[3px_3px_0px_#1E1B18]"
            >
              <span>PRINT &amp; EXPORT KEEPSAKE</span>
              <ArrowRight size={17} weight="bold" />
            </button>
          </div>
        </aside>

      </div>

      {/* Single Slot Retake Modal */}
      {retakeModalSlot !== null && (
        <SingleSlotRetakeModal
          slotIndex={retakeModalSlot}
          camera={camera}
          isDemoMode={isDemoMode}
          initialFilterId={
            (slotMap[retakeModalSlot] && photoFilters[slotMap[retakeModalSlot]]) ||
            globalFilterId
          }
          onCaptureSlot={(idx, newShot) => {
            onAddNewPhoto(newShot);
            onUpdateSlotMap({ ...slotMap, [idx]: newShot.id });
          }}
          onClose={() => setRetakeModalSlot(null)}
        />
      )}
    </BoothShell>
  );
}
