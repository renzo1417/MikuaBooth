"use client";

import React, { useState, useRef } from "react";
import { FrameTemplate } from "@/lib/templates";
import { PHOTO_FILTERS, PhotoFilter } from "@/lib/filters";
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
  Trash,
  TextT,
  Palette,
  Smiley,
  Check,
  Crown,
  X,
} from "@phosphor-icons/react";
import {
  ACCESSORY_DEFINITIONS,
  getAccessoryById,
  AccessoryId,
} from "@/lib/accessories";
import { BoothShell } from "@/components/BoothShell";

interface SlotEditorProps {
  template: FrameTemplate;
  photos: Record<string, string>; // photoId -> dataUrl
  slotMap: Record<number, string>; // slotIndex -> photoId
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

type EditorTab = "filters" | "accessories" | "stickers" | "caption";

export function SlotEditor({
  template,
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
  const [activeTab, setActiveTab] = useState<EditorTab>("filters");
  const [mobileView, setMobileView] = useState<"card" | "photos" | "filters">("card");
  const [activeAccessoryId, setActiveAccessoryId] = useState<AccessoryId>("none");
  const [filterScope, setFilterScope] = useState<"all" | "slot">("all");
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number>(0);
  const [retakeModalSlot, setRetakeModalSlot] = useState<number | null>(null);
  const [draggedSlotIndex, setDraggedSlotIndex] = useState<number | null>(null);
  const [dragOverSlotIndex, setDragOverSlotIndex] = useState<number | null>(null);

  // Sticker selection & manipulation
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
  const cardContainerRef = useRef<HTMLDivElement | null>(null);
  const stickerCounterRef = useRef(0);

  // Swap two slots
  const swapSlots = (slotA: number, slotB: number) => {
    if (slotA === slotB) return;
    const newMap = { ...slotMap };
    const temp = newMap[slotA];
    newMap[slotA] = newMap[slotB];
    newMap[slotB] = temp;
    onUpdateSlotMap(newMap);
    setSelectedSlotIndex(slotB);
  };

  // Keyboard slot-swap: arrows move selection, Enter marks a swap source
  // then swaps it with the focused slot, Escape cancels a pending mark.
  const [swapSourceIndex, setSwapSourceIndex] = useState<number | null>(null);
  const [swapMessage, setSwapMessage] = useState<string | null>(null);
  const slotCardRefs = useRef(new Map<number, HTMLDivElement>());

  const focusSlotCard = (slotIdx: number) => {
    slotCardRefs.current.get(slotIdx)?.focus();
  };

  const handleSlotCardKeyDown = (e: React.KeyboardEvent, slotIdx: number) => {
    const order = template.slots.map((s) => s.index);
    const pos = order.indexOf(slotIdx);
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      const next = order[(pos + 1) % order.length];
      setSelectedSlotIndex(next);
      focusSlotCard(next);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      const prev = order[(pos - 1 + order.length) % order.length];
      setSelectedSlotIndex(prev);
      focusSlotCard(prev);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (swapSourceIndex === null) {
        setSwapSourceIndex(slotIdx);
        setSelectedSlotIndex(slotIdx);
        setSwapMessage(
          `Slot ${slotIdx + 1} marked as swap source. Focus another slot and press Enter to swap, or Escape to cancel.`
        );
      } else if (swapSourceIndex === slotIdx) {
        setSwapSourceIndex(null);
        setSwapMessage(`Swap cancelled for slot ${slotIdx + 1}.`);
      } else {
        const source = swapSourceIndex;
        swapSlots(source, slotIdx);
        setSwapSourceIndex(null);
        setSwapMessage(`Swapped slots ${source + 1} and ${slotIdx + 1}.`);
        focusSlotCard(slotIdx);
      }
    } else if (e.key === "Escape") {
      if (swapSourceIndex !== null) {
        setSwapSourceIndex(null);
        setSwapMessage("Swap cancelled.");
      }
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, slotIdx: number) => {
    e.dataTransfer.setData("text/plain", String(slotIdx));
    setDraggedSlotIndex(slotIdx);
  };

  const handleDragOver = (e: React.DragEvent, slotIdx: number) => {
    e.preventDefault();
    if (dragOverSlotIndex !== slotIdx) {
      setDragOverSlotIndex(slotIdx);
    }
  };

  const handleDrop = (e: React.DragEvent, targetSlotIdx: number) => {
    e.preventDefault();
    const sourceIdx = draggedSlotIndex;
    setDraggedSlotIndex(null);
    setDragOverSlotIndex(null);
    if (sourceIdx !== null && sourceIdx !== targetSlotIdx) {
      swapSlots(sourceIdx, targetSlotIdx);
    }
  };

  // Sticker operations (functional updates: drag fires many pointermove
  // events per second against one render snapshot, so never close over `stickers`)
  const handleAddSticker = (type: string) => {
    stickerCounterRef.current += 1;
    const def = getStickerByType(type);
    const id = `stk_${stickerCounterRef.current}`;
    setSelectedStickerId(id);
    onChangeStickers((prev) => {
      const newSticker: StickerItem = {
        id,
        type,
        x: 45 + (prev.length % 4) * 5,
        y: 40 + (prev.length % 3) * 6,
        rotation: (prev.length * 12) % 30 - 15,
        scale: 1,
        color: def.defaultColor,
      };
      return [...prev, newSticker];
    });
  };

  const handleUpdateSelectedSticker = (updates: Partial<StickerItem>) => {
    if (!selectedStickerId) return;
    const targetId = selectedStickerId;
    onChangeStickers((prev) =>
      prev.map((s) => (s.id === targetId ? { ...s, ...updates } : s))
    );
  };

  const handleDeleteSelectedSticker = () => {
    if (!selectedStickerId) return;
    const targetId = selectedStickerId;
    onChangeStickers((prev) => prev.filter((s) => s.id !== targetId));
    setSelectedStickerId(null);
  };

  // Pointer drag for stickers on the preview card
  const handleCardPointerDown = (e: React.PointerEvent) => {
    // If clicking outside stickers on card, deselect
    if ((e.target as HTMLElement).closest(".sticker-item")) return;
    setSelectedStickerId(null);
  };

  const handleStickerPointerDown = (e: React.PointerEvent, sticker: StickerItem) => {
    e.stopPropagation();
    setSelectedStickerId(sticker.id);

    const container = cardContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();

    const startX = e.clientX;
    const startY = e.clientY;
    const origStickerX = sticker.x;
    const origStickerY = sticker.y;

    const onPointerMove = (moveEvent: PointerEvent) => {
      const deltaXPercent = ((moveEvent.clientX - startX) / rect.width) * 100;
      const deltaYPercent = ((moveEvent.clientY - startY) / rect.height) * 100;

      const clampedX = Math.max(5, Math.min(95, origStickerX + deltaXPercent));
      const clampedY = Math.max(5, Math.min(95, origStickerY + deltaYPercent));

      onChangeStickers((prev) =>
        prev.map((s) =>
          s.id === sticker.id
            ? { ...s, x: Number(clampedX.toFixed(2)), y: Number(clampedY.toFixed(2)) }
            : s
        )
      );
    };

    const onPointerUp = () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  const selectedSticker = stickers.find((s) => s.id === selectedStickerId);

  // Retake callback
  const handleCompleteRetake = (slotIdx: number, newShot: CapturedShotItem) => {
    onAddNewPhoto(newShot);
    const newMap = { ...slotMap, [slotIdx]: newShot.id };
    onUpdateSlotMap(newMap);
  };

  // Filter selection
  const handleSelectFilter = (filter: PhotoFilter) => {
    if (filterScope === "all") {
      onChangeGlobalFilter(filter.id);
    } else {
      const activePhotoId = slotMap[selectedSlotIndex];
      if (activePhotoId) {
        onChangePhotoFilter(activePhotoId, filter.id);
      }
    }
  };

  const activeSlotPhotoId = slotMap[selectedSlotIndex];
  const activeSlotFilterId =
    (activeSlotPhotoId && photoFilters[activeSlotPhotoId]) || globalFilterId;

  return (
    <>
      <BoothShell
        variant="fixed"
        className="px-3 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 overflow-hidden select-none"
        header={
          <>
            <button
              onClick={onBackToCapture}
              className="kiosk-btn flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 font-mono text-xs font-bold text-[#17140F] cursor-pointer"
            >
              <ArrowLeft size={16} weight="bold" />
              <span>BACK TO BOOTH</span>
            </button>

            <div className="text-center">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#D4FF3D] border-[1.5px] border-[#17140F] px-2.5 py-[0.2rem] font-mono text-[10px] sm:text-[11px] font-bold text-[#17140F]">
                <Sparkle size={11} weight="fill" className="text-[#FF3D9A]" />
                <span>STEP 3 · STUDIO &amp; DECOR</span>
              </div>
              <h1 className="font-fredoka text-base sm:text-lg md:text-xl font-bold tracking-tight text-[#17140F] leading-tight">
                Design Your Keepsake Card
              </h1>
            </div>

            <button
              onClick={onProceedToFinish}
              className="kiosk-btn flex items-center gap-1.5 rounded-xl bg-[#FF6B4A] px-4 py-1.5 font-manrope text-xs font-extrabold text-white cursor-pointer shadow-[2px_2px_0px_#17140F]"
            >
              <span>FINISH</span>
              <ArrowRight size={15} weight="bold" />
            </button>
          </>
        }
      >

      {/* Mobile Screen Mode Switcher (< lg only) */}
      <div className="flex lg:hidden w-full items-center justify-center px-2 py-1 shrink-0">
        <div className="flex rounded-xl border-[2px] border-[#17140F] bg-[#FAF7F0] p-0.5 w-full max-w-sm">
          <button
            onClick={() => setMobileView("card")}
            className={`flex-1 py-1 font-mono text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
              mobileView === "card"
                ? "bg-[#D4FF3D] text-[#17140F] shadow-xs"
                : "text-[#17140F]/70"
            }`}
          >
            CARD
          </button>
          <button
            onClick={() => setMobileView("photos")}
            className={`flex-1 py-1 font-mono text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
              mobileView === "photos"
                ? "bg-[#D4FF3D] text-[#17140F] shadow-xs"
                : "text-[#17140F]/70"
            }`}
          >
            PHOTOS ({template.slots.length})
          </button>
          <button
            onClick={() => setMobileView("filters")}
            className={`flex-1 py-1 font-mono text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
              mobileView === "filters"
                ? "bg-[#D4FF3D] text-[#17140F] shadow-xs"
                : "text-[#17140F]/70"
            }`}
          >
            FILTERS &amp; DECOR
          </button>
        </div>
      </div>

      {/* Main 3-Zone Workspace (Left: Photos Rail, Center: Keepsake Card, Right: Tabbed Panel) */}
      <div className="flex-1 min-h-0 w-full mx-auto flex flex-col lg:grid lg:grid-cols-[250px_1fr_350px] xl:grid-cols-[270px_1fr_380px] 2xl:grid-cols-[290px_1fr_400px] gap-2.5 sm:gap-3 my-1 items-stretch overflow-hidden">
        {/* ================= ZONE 1: LEFT COLUMN - "YOUR PHOTOS" RAIL ================= */}
        <aside
          className={`${
            mobileView === "photos" ? "flex" : "hidden"
          } lg:flex w-full lg:w-[250px] xl:w-[270px] 2xl:w-[290px] h-full min-h-0 shrink-0 flex-col gap-2 rounded-2xl border-[2.5px] border-[#17140F] bg-white p-3 shadow-[3px_3px_0px_#17140F]`}
        >
          <div className="flex items-center justify-between border-b border-[#17140F]/15 pb-1.5 shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#FF6B4A]" />
              <h2 className="font-mono text-xs font-black uppercase tracking-wider text-[#17140F]">
                Your Photos
              </h2>
            </div>
            <span className="rounded-full border border-[#17140F] bg-[#D4FF3D] px-2 py-[0.2rem] font-mono text-[10px] font-extrabold text-[#17140F]">
              {template.slots.length} SLOTS
            </span>
          </div>

          <p className="font-manrope text-[10px] text-[#17140F]/70 shrink-0">
            Click photo to select or retake slot.
          </p>

          {/* Scrollable list strictly within this rail column */}
          <div className="flex-1 min-h-0 overflow-y-auto pr-1 flex flex-col gap-2 py-0.5">
            {template.slots.map((slot) => {
              const photoId = slotMap[slot.index];
              const photoSrc = photoId ? photos[photoId] : null;
              const isSelected = selectedSlotIndex === slot.index;
              const slotFilterId =
                (photoId && photoFilters[photoId]) || globalFilterId;
              const filterDef = PHOTO_FILTERS.find((f) => f.id === slotFilterId);

              return (
                <div
                  key={slot.index}
                  onClick={() => setSelectedSlotIndex(slot.index)}
                  className={`group flex shrink-0 w-full items-center gap-2 rounded-xl border-[2px] p-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? "border-[#17140F] bg-[#FFF9E6] shadow-[2px_2px_0px_#17140F] scale-[1.01]"
                      : "border-[#17140F]/20 bg-[#FAF7F0] hover:border-[#17140F]"
                  }`}
                >
                  {/* Photo Thumbnail */}
                  <div className="relative aspect-[3/4] h-14 sm:h-16 w-11 sm:w-12 shrink-0 overflow-hidden rounded-lg border border-[#17140F] bg-white">
                    {photoSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={photoSrc}
                        alt={`Slot ${slot.index + 1}`}
                        className="h-full w-full object-cover"
                        style={{ filter: filterDef?.cssFilter || "none" }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center font-mono text-[9px] text-[#17140F]/40">
                        EMPTY
                      </div>
                    )}
                    <span className="absolute top-0.5 left-0.5 rounded bg-black/70 px-1 py-[0.2rem] font-mono text-[7px] font-bold text-white">
                      #{slot.index + 1}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="flex flex-1 items-center justify-between py-0.5 min-w-0">
                    <div className="flex flex-col">
                      <span className="font-mono text-xs font-bold text-[#17140F]">
                        Slot #{slot.index + 1}
                      </span>
                      {isSelected && (
                        <span className="font-mono text-[9px] font-extrabold text-[#6C4FE0]">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSlotIndex(slot.index);
                        setRetakeModalSlot(slot.index);
                      }}
                      className="kiosk-btn flex items-center justify-center gap-1 rounded-lg bg-[#FF6B4A] px-2 py-1 font-mono text-[9px] font-bold text-white cursor-pointer shrink-0"
                    >
                      <Camera size={11} weight="bold" />
                      <span>RETAKE</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* ================= ZONE 2: CENTER - LIVE KEEPSAKE CARD PREVIEW ================= */}
        <section
          className={`${
            mobileView === "card" ? "flex" : "hidden"
          } lg:flex flex-1 min-w-0 min-h-0 h-full flex-col items-center justify-center w-full px-2 py-0.5 overflow-hidden`}
        >
          <div className="mb-1 flex items-center gap-1.5 text-[11px] font-mono text-[#17140F]/70 text-center shrink-0">
            <span className="rounded bg-white border border-[#17140F]/30 px-1.5 py-[0.2rem] font-bold text-[9px]">
              TIP
            </span>
            <span>
              {swapSourceIndex !== null
                ? `Slot ${swapSourceIndex + 1} marked — Enter swaps, Esc cancels`
                : "Click slot to retake · Drag or Enter to swap"}
            </span>
          </div>
          <div aria-live="polite" className="sr-only">
            {swapMessage}
          </div>

          {/* The Physical Card Container - Dynamically sized to fill available vertical space */}
          <div
            ref={cardContainerRef}
            onPointerDown={handleCardPointerDown}
            className="relative min-h-0 select-none overflow-hidden rounded-2xl border-[3px] border-[#17140F] p-3 shadow-[5px_5px_0px_#17140F] transition-all flex flex-col justify-between"
            style={{
              backgroundColor: template.bgColor,
              height: "100%",
              maxHeight: "100%",
              aspectRatio: `${template.cardWidth} / ${template.cardHeight}`,
              maxWidth: "100%",
              width: "auto",
              margin: "0 auto",
            }}
          >
            {/* Header Stamp */}
            <div className="mb-1.5 text-center shrink-0">
              <span
                className="block font-fredoka text-xs sm:text-sm md:text-base font-bold tracking-tight"
                style={{ color: template.textColor }}
              >
                {template.headerTitle}
              </span>
              <span
                className="block font-mono text-[8px] sm:text-[9px] font-semibold opacity-75"
                style={{ color: template.subTextColor }}
              >
                MIKUABOOTH · SEOUL PHOTO KIOSK
              </span>
            </div>

            {/* Slots Relative Area */}
            <div
              className="relative flex-1 min-h-0 w-full overflow-hidden rounded-xl border-[2px]"
              style={{
                aspectRatio: template.aspectRatio,
                borderColor: template.borderColor,
              }}
            >
              {template.slots.map((slot) => {
                const photoId = slotMap[slot.index];
                const photoSrc = photoId ? photos[photoId] : null;
                const slotFilterId =
                  (photoId && photoFilters[photoId]) || globalFilterId;
                const filterDef = PHOTO_FILTERS.find((f) => f.id === slotFilterId);

                const isSelected = selectedSlotIndex === slot.index;
                const isDragOver = dragOverSlotIndex === slot.index;

                return (
                  <div
                    key={slot.index}
                    ref={(el) => {
                      if (el) slotCardRefs.current.set(slot.index, el);
                      else slotCardRefs.current.delete(slot.index);
                    }}
                    draggable
                    onDragStart={(e) => handleDragStart(e, slot.index)}
                    onDragOver={(e) => handleDragOver(e, slot.index)}
                    onDrop={(e) => handleDrop(e, slot.index)}
                    onClick={() => setSelectedSlotIndex(slot.index)}
                    tabIndex={0}
                    role="button"
                    aria-label={`Slot ${slot.index + 1}, ${
                      photoSrc ? "filled" : "empty"
                    }. Arrow keys move selection, Enter marks for swap.`}
                    onKeyDown={(e) => handleSlotCardKeyDown(e, slot.index)}
                    className={`group absolute cursor-grab active:cursor-grabbing overflow-hidden rounded-xs border-[2px] transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6C4FE0] focus-visible:ring-offset-2 ${
                      swapSourceIndex === slot.index
                        ? "border-[#D9A441] ring-2 ring-dashed ring-[#D9A441] z-20 scale-[1.03] shadow-md"
                        : isSelected
                        ? "border-[#FF3D9A] ring-2 ring-[#FF3D9A] z-20 scale-[1.02] shadow-md"
                        : isDragOver
                        ? "border-[#D4FF3D] ring-2 ring-[#D4FF3D] z-20 scale-[1.03]"
                        : "border-[#17140F] bg-[#FAF7F0]"
                    }`}
                    style={{
                      left: `${slot.x}%`,
                      top: `${slot.y}%`,
                      width: `${slot.width}%`,
                      height: `${slot.height}%`,
                    }}
                    title={`Slot ${slot.index + 1} - Click to select, Retake, or Drag to swap`}
                  >
                    {photoSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={photoSrc}
                        alt={`Photo ${slot.index + 1}`}
                        className="h-full w-full object-cover pointer-events-none"
                        style={{ filter: filterDef?.cssFilter || "none" }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center font-mono text-[10px] text-[#17140F]/40">
                        EMPTY
                      </div>
                    )}

                    {/* Technical Slot Index Number */}
                    <span className="absolute top-1 left-1.5 rounded bg-black/60 px-1 py-[0.2rem] font-mono text-[8px] font-bold text-white backdrop-blur-xs select-none">
                      {slot.index + 1}
                    </span>

                    {/* Quick Retake Hover Button */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setRetakeModalSlot(slot.index);
                        }}
                        className="rounded-lg bg-[#FF6B4A] border border-[#17140F] px-2 py-1 font-mono text-[10px] font-bold text-white shadow-xs hover:bg-[#e04e2e] active:scale-95 cursor-pointer"
                      >
                        RETAKE
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Placed Stickers on the Card */}
              {stickers.map((sticker) => {
                const def = getStickerByType(sticker.type);
                const isSelected = sticker.id === selectedStickerId;
                const sizePx = 44 * sticker.scale;

                return (
                  <div
                    key={sticker.id}
                    onPointerDown={(e) => handleStickerPointerDown(e, sticker)}
                    className={`sticker-item absolute cursor-move z-30 transition-transform ${
                      isSelected
                        ? "ring-2 ring-dashed ring-[#FF3D9A] rounded-lg p-0.5"
                        : ""
                    }`}
                    style={{
                      left: `${sticker.x}%`,
                      top: `${sticker.y}%`,
                      transform: `translate(-50%, -50%) rotate(${sticker.rotation}deg)`,
                    }}
                  >
                    <svg
                      width={sizePx}
                      height={sizePx}
                      viewBox="0 0 24 24"
                      className="overflow-visible filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]"
                    >
                      <path
                        d={def.svgPath}
                        fill={sticker.color || def.defaultColor}
                        stroke="#17140F"
                        strokeWidth="1.8"
                        strokeLinejoin="round"
                      />
                    </svg>

                    {/* Delete badge on selected sticker */}
                    {isSelected && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSelectedSticker();
                        }}
                        aria-label="Remove sticker"
                        className="absolute -top-2.5 -right-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#17140F] text-white shadow-xs cursor-pointer z-40"
                      >
                        <X size={10} weight="bold" />
                      </button>
                    )}
                  </div>
                );
              })}

              {/* Rendered Text Caption (if enabled) */}
              {caption.enabled && caption.text.trim() && (
                <div
                  title={caption.text}
                  className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 max-w-[85%] rounded-full border-[2px] border-[#17140F] px-3.5 py-1 text-center font-fredoka text-xs font-bold shadow-xs truncate"
                  style={{
                    backgroundColor: caption.bgColor || "#FFFFFF",
                    color: caption.color || "#17140F",
                  }}
                >
                  {caption.text}
                </div>
              )}
            </div>

            {/* Footer Stamp */}
            <div className="mt-1.5 text-center shrink-0">
              <span
                className="font-fraunces text-xs font-bold italic"
                style={{ color: template.textColor }}
              >
                MikuaBooth
              </span>
              <span
                className="block font-mono text-[8px] opacity-70 tracking-widest mt-0.5"
                style={{ color: template.subTextColor }}
              >
                {template.footerStamp}
              </span>
            </div>
          </div>
        </section>

        {/* ================= ZONE 3: RIGHT COLUMN - TABBED PANEL ================= */}
        <aside
          className={`${
            mobileView === "filters" ? "flex" : "hidden"
          } lg:flex w-full lg:w-[350px] xl:w-[380px] 2xl:w-[400px] h-full min-h-0 shrink-0 flex-col rounded-2xl border-[2.5px] border-[#17140F] bg-white p-3 shadow-[3px_3px_0px_#17140F]`}
        >
          {/* Tab Navigation (Effects | Accessories | Stickers | Caption) */}
          <div className="shrink-0 grid grid-cols-4 gap-1 rounded-xl border-[1.5px] border-[#17140F] bg-[#FAF7F0] p-1">
            <button
              onClick={() => setActiveTab("filters")}
              className={`flex items-center justify-center gap-1 rounded-lg py-1.5 font-manrope text-[11px] font-bold transition-all cursor-pointer ${
                activeTab === "filters"
                  ? "bg-[#6C4FE0] text-white shadow-[2px_2px_0px_#17140F]"
                  : "text-[#17140F] hover:bg-white"
              }`}
            >
              <Palette size={13} weight="bold" />
              <span>EFFECTS</span>
            </button>

            <button
              onClick={() => setActiveTab("accessories")}
              className={`flex items-center justify-center gap-1 rounded-lg py-1.5 font-manrope text-[11px] font-bold transition-all cursor-pointer ${
                activeTab === "accessories"
                  ? "bg-[#6C4FE0] text-white shadow-[2px_2px_0px_#17140F]"
                  : "text-[#17140F] hover:bg-white"
              }`}
            >
              <Crown size={13} weight="bold" />
              <span>ACCESSORY</span>
            </button>

            <button
              onClick={() => setActiveTab("stickers")}
              className={`flex items-center justify-center gap-1 rounded-lg py-1.5 font-manrope text-[11px] font-bold transition-all cursor-pointer ${
                activeTab === "stickers"
                  ? "bg-[#6C4FE0] text-white shadow-[2px_2px_0px_#17140F]"
                  : "text-[#17140F] hover:bg-white"
              }`}
            >
              <Smiley size={13} weight="bold" />
              <span>STICKERS</span>
            </button>

            <button
              onClick={() => setActiveTab("caption")}
              className={`flex items-center justify-center gap-1 rounded-lg py-1.5 font-manrope text-[11px] font-bold transition-all cursor-pointer ${
                activeTab === "caption"
                  ? "bg-[#6C4FE0] text-white shadow-[2px_2px_0px_#17140F]"
                  : "text-[#17140F] hover:bg-white"
              }`}
            >
              <TextT size={13} weight="bold" />
              <span>CAPTION</span>
            </button>
          </div>

          {/* Quick Slot Selector & Single Retake Bar */}
          <div className="shrink-0 rounded-xl border-[1.5px] border-[#17140F] bg-[#FFF9E6] p-2 mt-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-bold text-[#17140F]">
                ACTIVE SLOT: #{selectedSlotIndex + 1}
              </span>
              <button
                onClick={() => setRetakeModalSlot(selectedSlotIndex)}
                className="kiosk-btn flex items-center gap-1 rounded-lg bg-[#FF6B4A] px-2.5 py-0.5 font-mono text-[10px] font-bold text-white cursor-pointer"
              >
                <Camera size={12} weight="bold" />
                <span>RETAKE THIS SLOT</span>
              </button>
            </div>

            {/* Mini slot pills to switch active slot */}
            <div className="mt-1.5 flex flex-wrap gap-1">
              {template.slots.map((s) => (
                <button
                  key={s.index}
                  onClick={() => setSelectedSlotIndex(s.index)}
                  className={`flex h-6 w-6 items-center justify-center rounded-md border font-mono text-[10px] font-bold cursor-pointer transition-all ${
                    selectedSlotIndex === s.index
                      ? "border-[#17140F] bg-[#17140F] text-white shadow-xs"
                      : "border-[#17140F]/30 bg-white text-[#17140F] hover:bg-[#FAF7F0]"
                  }`}
                >
                  {s.index + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Active Tab Scrollable Content Area - Scrolls strictly internally */}
          <div className="flex-1 min-h-0 overflow-y-auto mt-2 pr-1 flex flex-col gap-2.5">
            {/* TAB 1: FILTERS & EFFECTS */}
            {activeTab === "filters" && (
            <div className="flex flex-col gap-4">
              {/* Filter Scope Toggle (All vs Selected Slot) */}
              <div className="flex items-center justify-between border-b border-[#17140F]/15 pb-3">
                <span className="font-mono text-xs font-bold text-[#17140F]">
                  APPLY FILTER TO:
                </span>
                <div className="flex rounded-xl border-[2px] border-[#17140F] bg-[#FAF7F0] p-1">
                  <button
                    onClick={() => setFilterScope("all")}
                    className={`rounded-lg px-2.5 py-1 font-mono text-[11px] font-bold cursor-pointer ${
                      filterScope === "all"
                        ? "bg-[#D4FF3D] text-[#17140F] shadow-xs"
                        : "text-[#17140F]/70"
                    }`}
                  >
                    WHOLE CARD
                  </button>
                  <button
                    onClick={() => setFilterScope("slot")}
                    className={`rounded-lg px-2.5 py-1 font-mono text-[11px] font-bold cursor-pointer ${
                      filterScope === "slot"
                        ? "bg-[#D4FF3D] text-[#17140F] shadow-xs"
                        : "text-[#17140F]/70"
                    }`}
                  >
                    SLOT #{selectedSlotIndex + 1}
                  </button>
                </div>
              </div>

              {/* Filter Swatches Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {PHOTO_FILTERS.map((f) => {
                  const isCurrent =
                    filterScope === "all"
                      ? globalFilterId === f.id
                      : activeSlotFilterId === f.id;

                  return (
                    <button
                      key={f.id}
                      onClick={() => handleSelectFilter(f)}
                      className={`kiosk-btn flex flex-col items-start rounded-xl p-3 text-left transition-all cursor-pointer ${
                        isCurrent
                          ? "border-[#17140F] bg-[#D4FF3D] shadow-[3px_3px_0px_#17140F]"
                          : "border-[#17140F] bg-white hover:bg-[#FAF7F0]"
                      }`}
                    >
                      <div className="flex w-full items-center justify-between">
                        <span className="font-fredoka text-sm font-bold text-[#17140F]">
                          {f.name}
                        </span>
                        {isCurrent && <Check size={14} weight="bold" />}
                      </div>
                      <span className="mt-1 font-mono text-[10px] text-[#17140F]/70">
                        {f.shortDesc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: ACCESSORIES */}
          {activeTab === "accessories" && (
            <div className="flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-260px)] pr-1">
              <div className="flex items-center justify-between border-b border-[#17140F]/15 pb-2.5">
                <div>
                  <span className="block font-mono text-xs font-bold text-[#17140F]">
                    AR ACCESSORIES:
                  </span>
                  <span className="block font-mono text-[10px] text-[#17140F]/60">
                    Head-tracking overlays for camera &amp; retakes
                  </span>
                </div>
                <span className="rounded-md border border-[#17140F] bg-[#D4FF3D] px-2 py-0.5 font-mono text-[10px] font-extrabold text-[#17140F]">
                  6 STYLES
                </span>
              </div>

              {/* Accessory Swatches Grid (identical layout/styling to Effects) */}
              <div className="grid grid-cols-2 gap-2.5">
                {ACCESSORY_DEFINITIONS.map((acc) => {
                  const isCurrent = activeAccessoryId === acc.id;
                  return (
                    <button
                      key={acc.id}
                      onClick={() => setActiveAccessoryId(acc.id)}
                      className={`kiosk-btn flex flex-col items-start rounded-xl p-3 text-left transition-all cursor-pointer ${
                        isCurrent
                          ? "border-[#17140F] bg-[#D4FF3D] shadow-[3px_3px_0px_#17140F]"
                          : "border-[#17140F] bg-white hover:bg-[#FAF7F0]"
                      }`}
                    >
                      <div className="flex w-full items-center justify-between">
                        <div className="flex items-center gap-1.5 truncate">
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill={acc.iconColor}
                            className="flex-shrink-0"
                          >
                            <path d={acc.svgIcon} />
                          </svg>
                          <span className="font-fredoka text-sm font-bold text-[#17140F] truncate">
                            {acc.name}
                          </span>
                        </div>
                        {isCurrent && <Check size={14} weight="bold" className="shrink-0" />}
                      </div>
                      <span className="mt-1 font-mono text-[10px] text-[#17140F]/70 line-clamp-2">
                        {acc.shortDesc}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Quick Action Box for Retake with chosen accessory */}
              <div className="rounded-2xl border-[2px] border-[#17140F] bg-[#FFF9E6] p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#17140F]">
                    SELECTED LOOK:
                  </span>
                  <span className="font-mono text-xs font-extrabold text-[#6C4FE0]">
                    {getAccessoryById(activeAccessoryId).name.toUpperCase()}
                  </span>
                </div>
                <p className="font-mono text-[10px] text-[#17140F]/70">
                  Arm the camera with this accessory, then retake Slot #{selectedSlotIndex + 1} to wear it live in your photo!
                </p>
                <button
                  onClick={() => setRetakeModalSlot(selectedSlotIndex)}
                  className="kiosk-btn mt-1 flex items-center justify-center gap-2 rounded-xl bg-[#FF6B4A] py-2.5 font-mono text-xs font-bold text-white cursor-pointer"
                >
                  <Camera size={14} weight="bold" />
                  <span>RETAKE SLOT #{selectedSlotIndex + 1} WITH ACCESSORY</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: STICKERS */}
          {activeTab === "stickers" && (
            <div className="flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-260px)] pr-1">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#17140F]">
                  TAP TO STAMP STICKER:
                </span>
                <span className="font-mono text-[10px] text-[#17140F]/60">
                  {stickers.length} ON CARD
                </span>
              </div>

              {/* Vector Sticker Shapes Grid */}
              <div className="grid grid-cols-3 gap-2.5">
                {STICKER_DEFINITIONS.map((def) => (
                  <button
                    key={def.type}
                    onClick={() => handleAddSticker(def.type)}
                    className="kiosk-btn flex flex-col items-center justify-center rounded-2xl bg-white p-3 hover:bg-[#FAF7F0] cursor-pointer"
                  >
                    <svg
                      width="34"
                      height="34"
                      viewBox="0 0 24 24"
                      className="overflow-visible"
                    >
                      <path
                        d={def.svgPath}
                        fill={def.defaultColor}
                        stroke="#17140F"
                        strokeWidth="1.8"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="mt-2 font-mono text-[10px] font-bold text-[#17140F] text-center truncate w-full">
                      {def.name}
                    </span>
                  </button>
                ))}
              </div>

              {/* Controls for Selected Sticker */}
              {selectedSticker && (
                <div className="mt-2 rounded-2xl border-[2px] border-[#17140F] bg-[#FAF7F0] p-3.5 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#17140F]">
                      EDIT SELECTED STICKER
                    </span>
                    <button
                      onClick={handleDeleteSelectedSticker}
                      className="flex items-center gap-1 text-xs font-mono font-bold text-[#FF6B4A] hover:underline cursor-pointer"
                    >
                      <Trash size={14} />
                      <span>REMOVE</span>
                    </button>
                  </div>

                  {/* Size Scale */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-[#17140F]">Scale:</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          handleUpdateSelectedSticker({
                            scale: Math.max(0.6, selectedSticker.scale - 0.2),
                          })
                        }
                        className="h-7 w-7 rounded-lg border border-[#17140F] bg-white font-mono font-bold"
                      >
                        -
                      </button>
                      <span className="font-mono text-xs font-bold">
                        {Math.round(selectedSticker.scale * 100)}%
                      </span>
                      <button
                        onClick={() =>
                          handleUpdateSelectedSticker({
                            scale: Math.min(2.5, selectedSticker.scale + 0.2),
                          })
                        }
                        className="h-7 w-7 rounded-lg border border-[#17140F] bg-white font-mono font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Rotation */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-[#17140F]">Rotate:</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          handleUpdateSelectedSticker({
                            rotation: (selectedSticker.rotation - 15) % 360,
                          })
                        }
                        className="rounded-lg border border-[#17140F] bg-white px-2 py-1 font-mono text-xs font-bold"
                      >
                        ↺ -15°
                      </button>
                      <button
                        onClick={() =>
                          handleUpdateSelectedSticker({
                            rotation: (selectedSticker.rotation + 15) % 360,
                          })
                        }
                        className="rounded-lg border border-[#17140F] bg-white px-2 py-1 font-mono text-xs font-bold"
                      >
                        ↻ +15°
                      </button>
                    </div>
                  </div>

                  {/* Color Swatches */}
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-[#17140F]">Color:</span>
                    <div className="flex items-center gap-1.5">
                      {STICKER_PALETTE.map((c) => (
                        <button
                          key={c}
                          onClick={() => handleUpdateSelectedSticker({ color: c })}
                          className={`h-6 w-6 rounded-full border-[2px] border-[#17140F] cursor-pointer ${
                            selectedSticker.color === c ? "ring-2 ring-black" : ""
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CAPTION */}
          {activeTab === "caption" && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#17140F]">
                  PHOTO CARD CAPTION:
                </span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={caption.enabled}
                    onChange={(e) =>
                      onChangeCaption({ ...caption, enabled: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-[#17140F] text-[#6C4FE0]"
                  />
                  <span className="font-mono text-xs font-bold text-[#17140F]">
                    {caption.enabled ? "ENABLED" : "OFF"}
                  </span>
                </label>
              </div>

              {caption.enabled && (
                <div className="flex flex-col gap-3">
                  <input
                    type="text"
                    maxLength={32}
                    value={caption.text}
                    onChange={(e) =>
                      onChangeCaption({ ...caption, text: e.target.value })
                    }
                    placeholder="e.g. Besties Forever 2026 ♥"
                    className="rounded-xl border-[2.5px] border-[#17140F] bg-[#FAF7F0] px-4 py-2.5 font-fredoka text-sm text-[#17140F] focus:outline-none focus:ring-2 focus:ring-[#FF3D9A]"
                  />

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-[#17140F]">Color:</span>
                    <div className="flex items-center gap-1.5">
                      {STICKER_PALETTE.map((c) => (
                        <button
                          key={c}
                          onClick={() => onChangeCaption({ ...caption, color: c })}
                          className={`h-6 w-6 rounded-full border-[2px] border-[#17140F] cursor-pointer ${
                            caption.color === c ? "ring-2 ring-black" : ""
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          </div>
        </aside>
      </div>
      </BoothShell>

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
          initialAccessoryId={activeAccessoryId}
          onCaptureSlot={handleCompleteRetake}
          onClose={() => setRetakeModalSlot(null)}
        />
      )}
    </>
  );
}
