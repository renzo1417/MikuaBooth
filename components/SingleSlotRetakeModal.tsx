"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  CameraRotate,
  ArrowsHorizontal,
  SpeakerHigh,
  SpeakerSlash,
  FilmStrip,
  Camera,
} from "@phosphor-icons/react";
import { PHOTO_FILTERS } from "@/lib/filters";
import { playCountdownPip, playShutterSound } from "@/lib/audio";
import { UseCameraCaptureReturn } from "@/hooks/useCameraCapture";
import { CapturedShotItem } from "@/components/CaptureScreen";

interface SingleSlotRetakeModalProps {
  slotIndex: number;
  camera: UseCameraCaptureReturn;
  isDemoMode: boolean;
  initialFilterId?: string;
  onCaptureSlot: (slotIndex: number, newShot: CapturedShotItem) => void;
  onClose: () => void;
}

export function SingleSlotRetakeModal({
  slotIndex,
  camera,
  isDemoMode,
  initialFilterId = "none",
  onCaptureSlot,
  onClose,
}: SingleSlotRetakeModalProps) {
  const {
    videoRef,
    isReady,
    isMirrored,
    permissionState,
    startCamera,
    toggleMirror,
    toggleFacingMode,
    captureFrame,
    generateDemoFrame,
  } = camera;

  const [selectedFilter, setSelectedFilter] = useState<string>(initialFilterId);
  const [isCountingDown, setIsCountingDown] = useState<boolean>(false);
  const [countdownValue, setCountdownValue] = useState<number | null>(null);
  const [isFlashing, setIsFlashing] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  const handleVideoNode = useCallback(
    (node: HTMLVideoElement | null) => {
      videoRef(node);
    },
    [videoRef]
  );

  const handleTriggerRetake = useCallback(() => {
    if (isCountingDown) return;
    setIsCountingDown(true);
    setCountdownValue(3);
    if (soundEnabled) playCountdownPip(false);

    let step = 3;
    timerRef.current = setInterval(async () => {
      step -= 1;
      if (step > 0) {
        setCountdownValue(step);
        if (soundEnabled) playCountdownPip(false);
      } else {
        if (timerRef.current) clearInterval(timerRef.current);
        setCountdownValue(null);
        setIsCountingDown(false);

        // Flash & sound
        setIsFlashing(true);
        if (soundEnabled) playShutterSound();

        let shotUrl = "";
        try {
          if (isDemoMode || !isReady) {
            shotUrl = generateDemoFrame(slotIndex, selectedFilter, "none");
          } else {
            shotUrl = await captureFrame(selectedFilter, "none", null);
          }
        } catch {
          shotUrl = generateDemoFrame(slotIndex, selectedFilter, "none");
        }

        setTimeout(() => setIsFlashing(false), 240);

        const newShotItem: CapturedShotItem = {
          id: `retake_${slotIndex}_${Date.now()}`,
          dataUrl: shotUrl,
          filterId: selectedFilter,
        };

        onCaptureSlot(slotIndex, newShotItem);
        onClose();
      }
    }, 950);
  }, [
    captureFrame,
    generateDemoFrame,
    isCountingDown,
    isDemoMode,
    isReady,
    onCaptureSlot,
    onClose,
    selectedFilter,
    slotIndex,
    soundEnabled,
  ]);

  useEffect(() => {
    if (!isDemoMode && permissionState !== "denied" && permissionState !== "unsupported") {
      startCamera();
    }
  }, [isDemoMode, permissionState, startCamera]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Keyboard navigation & trap focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === " " && !isCountingDown && (isReady || isDemoMode)) {
        e.preventDefault();
        handleTriggerRetake();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleTriggerRetake, isCountingDown, isDemoMode, isReady, onClose]);

  const activeFilterDef = PHOTO_FILTERS.find((f) => f.id === selectedFilter) || PHOTO_FILTERS[0];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="retake-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4"
    >
      <div
        ref={dialogRef}
        className="relative flex w-full max-w-md flex-col rounded-2xl border-[3px] border-[#1E1B18] bg-[#FAF7F0] p-4 shadow-[6px_6px_0px_#1E1B18] animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1E1B18]/15 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#E1503A]" />
            <h3 id="retake-dialog-title" className="font-serif text-lg font-bold text-[#1E1B18]">
              Retake Slot #{slotIndex + 1}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="kiosk-btn flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#1E1B18] cursor-pointer"
            aria-label="Close retake modal"
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        {/* Viewfinder Window */}
        <div className="relative my-3 aspect-[3/4] w-full max-w-[260px] mx-auto overflow-hidden rounded-xl border-[2.5px] border-[#1E1B18] bg-[#1E1B18] shadow-md">
          {/* Flash */}
          {isFlashing && (
            <div className="pointer-events-none absolute inset-0 z-40 bg-white animate-shutter-flash" />
          )}

          {/* Countdown */}
          {countdownValue !== null && (
            <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
              <span className="font-serif text-7xl font-bold text-[#FAF7F0] drop-shadow-md animate-countdown-pop">
                {countdownValue}
              </span>
            </div>
          )}

          {/* Video or Demo */}
          {isDemoMode ? (
            <div className="flex h-full w-full flex-col items-center justify-center text-center p-4 text-[#FAF7F0]">
              <FilmStrip size={32} weight="bold" className="text-[#D9A441] mb-2" />
              <span className="font-mono text-xs font-bold text-[#D9A441]">SIMULATED FEED</span>
            </div>
          ) : (
            <video
              ref={handleVideoNode}
              autoPlay
              playsInline
              muted
              className={`h-full w-full object-cover ${isMirrored ? "-scale-x-100" : ""}`}
              style={{ filter: activeFilterDef.cssFilter }}
            />
          )}

          {/* Top toolbar */}
          <div className="absolute top-2 right-2 flex items-center gap-1 z-20">
            <button
              onClick={() => setSoundEnabled((prev) => !prev)}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/60 text-white cursor-pointer"
            >
              {soundEnabled ? <SpeakerHigh size={14} weight="bold" /> : <SpeakerSlash size={14} />}
            </button>
            {!isDemoMode && (
              <>
                <button
                  onClick={toggleMirror}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/60 text-white cursor-pointer"
                >
                  <ArrowsHorizontal size={14} weight="bold" />
                </button>
                <button
                  onClick={toggleFacingMode}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/60 text-white cursor-pointer"
                >
                  <CameraRotate size={14} weight="bold" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Filter tone bar */}
        <div className="flex items-center justify-center gap-1.5 overflow-x-auto py-1">
          {PHOTO_FILTERS.slice(0, 4).map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFilter(f.id)}
              className={`rounded-lg border px-2.5 py-1 font-mono text-[10px] font-bold transition-all cursor-pointer ${
                selectedFilter === f.id
                  ? "border-[#1E1B18] bg-[#E1503A] text-white"
                  : "border-[#1E1B18]/20 bg-white text-[#1E1B18]"
              }`}
            >
              {f.name}
            </button>
          ))}
        </div>

        {/* Action button */}
        <button
          onClick={handleTriggerRetake}
          disabled={isCountingDown || (!isReady && !isDemoMode)}
          className="kiosk-btn mt-3 flex items-center justify-center gap-2 rounded-xl bg-[#E1503A] py-3 font-sans text-sm font-extrabold text-white cursor-pointer shadow-[3px_3px_0px_#1E1B18] disabled:opacity-40"
        >
          <Camera size={18} weight="bold" />
          <span>{isCountingDown ? "SNAPPING..." : `SNAP SLOT #${slotIndex + 1}`}</span>
        </button>
      </div>
    </div>
  );
}
