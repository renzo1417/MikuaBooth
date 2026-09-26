"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  Play,
  CameraRotate,
  ArrowsHorizontal,
  SpeakerHigh,
  SpeakerSlash,
  FilmStrip,
  Crown,
  Palette,
} from "@phosphor-icons/react";
import { PHOTO_FILTERS } from "@/lib/filters";
import {
  ACCESSORY_DEFINITIONS,
  drawAccessoryOnCanvas,
  AccessoryId,
} from "@/lib/accessories";
import { useFaceLandmarks } from "@/hooks/useFaceLandmarks";
import { playCountdownPip, playShutterSound } from "@/lib/audio";
import { UseCameraCaptureReturn } from "@/hooks/useCameraCapture";
import { CapturedShotItem } from "@/components/CaptureScreen";

interface SingleSlotRetakeModalProps {
  slotIndex: number;
  camera: UseCameraCaptureReturn;
  isDemoMode: boolean;
  initialFilterId?: string;
  initialAccessoryId?: string;
  onCaptureSlot: (slotIndex: number, newShot: CapturedShotItem) => void;
  onClose: () => void;
}

export function SingleSlotRetakeModal({
  slotIndex,
  camera,
  isDemoMode,
  initialFilterId = "none",
  initialAccessoryId = "none",
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
  const [selectedAccessory, setSelectedAccessory] = useState<AccessoryId>(
    (initialAccessoryId as AccessoryId) || "none"
  );
  const [activeTab, setActiveTab] = useState<"accessories" | "filters">("accessories");
  const [isCountingDown, setIsCountingDown] = useState<boolean>(false);
  const [countdownValue, setCountdownValue] = useState<number | null>(null);
  const [isFlashing, setIsFlashing] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [videoNode, setVideoNode] = useState<HTMLVideoElement | null>(null);
  const arCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  const handleVideoNode = useCallback(
    (node: HTMLVideoElement | null) => {
      setVideoNode(node);
      videoRef(node);
    },
    [videoRef]
  );

  const { detectedFace, isModelLoading } = useFaceLandmarks({
    videoElement: videoNode,
    isReady,
    isMirrored,
    enabled: true,
    isDemoMode,
  });

  // Render live AR accessory onto the viewfinder overlay canvas
  useEffect(() => {
    const canvas = arCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (selectedAccessory === "none") return;

    if (isDemoMode) {
      drawAccessoryOnCanvas(ctx, selectedAccessory, 450, 305, 290, 0);
      return;
    }

    if (detectedFace) {
      if (videoNode && videoNode.videoWidth > 0) {
        const vw = videoNode.videoWidth;
        const vh = videoNode.videoHeight;
        const targetRatio = 3 / 4;
        const sourceRatio = vw / vh;
        let sx = 0,
          sy = 0,
          sWidth = vw,
          sHeight = vh;
        if (sourceRatio > targetRatio) {
          sWidth = vh * targetRatio;
          sx = (vw - sWidth) / 2;
        } else {
          sHeight = vw / targetRatio;
          sy = (vh - sHeight) / 2;
        }

        const rawX = detectedFace.normalizedAnchorX * vw;
        const rawY = detectedFace.normalizedAnchorY * vh;
        const croppedX = rawX - sx;
        const croppedY = rawY - sy;
        let cx = (croppedX / sWidth) * canvas.width;
        const cy = (croppedY / sHeight) * canvas.height;
        const cw = ((detectedFace.normalizedFaceWidth * vw) / sWidth) * canvas.width;
        let roll = detectedFace.rollAngle;

        if (isMirrored) {
          cx = canvas.width - cx;
          roll = -roll;
        }

        drawAccessoryOnCanvas(ctx, selectedAccessory, cx, cy, cw, roll);
      } else {
        const cx = (isMirrored ? 1 - detectedFace.normalizedAnchorX : detectedFace.normalizedAnchorX) * canvas.width;
        const cy = detectedFace.normalizedAnchorY * canvas.height;
        const cw = detectedFace.normalizedFaceWidth * canvas.width;
        const roll = isMirrored ? -detectedFace.rollAngle : detectedFace.rollAngle;
        drawAccessoryOnCanvas(ctx, selectedAccessory, cx, cy, cw, roll);
      }
    }
  }, [detectedFace, selectedAccessory, isDemoMode, isMirrored, videoNode]);

  useEffect(() => {
    if (!isDemoMode && permissionState !== "denied" && permissionState !== "unsupported") {
      startCamera();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isDemoMode, permissionState, startCamera]);

  // Focus trap: keep Tab cycling inside the dialog, Escape closes,
  // and restore focus to the invoker on unmount.
  useEffect(() => {
    const dialog = dialogRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    dialog
      ?.querySelector<HTMLElement>("button:not([disabled])")
      ?.focus();

    const getFocusable = () =>
      Array.from(
        dialog?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) ?? []
      ).filter((el) => el.offsetParent !== null);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const items = getFocusable();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [onClose]);

  const triggerRetakeCapture = useCallback(async () => {
    setIsFlashing(true);
    if (soundEnabled) playShutterSound();

    let shotUrl = "";
    try {
      if (isDemoMode || !isReady) {
        shotUrl = generateDemoFrame(slotIndex + 9, selectedFilter, selectedAccessory);
      } else {
        shotUrl = await captureFrame(selectedFilter, selectedAccessory, detectedFace);
      }
    } catch {
      shotUrl = generateDemoFrame(slotIndex + 9, selectedFilter, selectedAccessory);
    }

    setTimeout(() => setIsFlashing(false), 260);

    const shotId = `retake_${slotIndex}_${Date.now()}`;
    const newShot: CapturedShotItem = {
      id: shotId,
      dataUrl: shotUrl,
      filterId: selectedFilter,
      accessoryId: selectedAccessory,
    };

    setTimeout(() => {
      onCaptureSlot(slotIndex, newShot);
      onClose();
    }, 450);
  }, [
    captureFrame,
    detectedFace,
    generateDemoFrame,
    isDemoMode,
    isReady,
    onCaptureSlot,
    onClose,
    selectedAccessory,
    selectedFilter,
    slotIndex,
    soundEnabled,
  ]);

  const startCountdown = () => {
    if (isCountingDown) return;
    setIsCountingDown(true);
    setCountdownValue(3);
    if (soundEnabled) playCountdownPip(false);

    let step = 3;
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      step -= 1;
      if (step > 0) {
        setCountdownValue(step);
        if (soundEnabled) playCountdownPip(false);
      } else {
        if (timerRef.current) clearInterval(timerRef.current);
        setCountdownValue(null);
        setIsCountingDown(false);
        triggerRetakeCapture();
      }
    }, 900);
  };

  const activeFilter = PHOTO_FILTERS.find((f) => f.id === selectedFilter) || PHOTO_FILTERS[0];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Retake single shot for slot ${slotIndex + 1}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#17140F]/70 p-4 backdrop-blur-xs animate-fadeIn"
    >
      <div
        ref={dialogRef}
        className="relative flex w-full max-w-md flex-col items-center rounded-3xl border-[3px] border-[#17140F] bg-white p-5 shadow-[6px_6px_0px_#17140F] max-h-[92dvh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex w-full items-center justify-between border-b-[2px] border-[#17140F] pb-3">
          <div className="flex items-center gap-2">
            <span className="rounded-lg border-[2px] border-[#17140F] bg-[#D4FF3D] px-2.5 py-0.5 font-mono text-xs font-extrabold text-[#17140F]">
              SLOT #{slotIndex + 1}
            </span>
            <h2 className="font-fredoka text-xl font-bold text-[#17140F]">
              Retake Single Shot
            </h2>
          </div>

          <button
            onClick={onClose}
            className="kiosk-btn flex h-8 w-8 items-center justify-center rounded-xl bg-white text-[#17140F] cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Camera Quick Controls Bar (outside viewfinder) */}
        <div className="flex w-full max-w-[280px] items-center justify-between pt-3 pb-1">
          <span className="font-mono text-[10px] font-bold text-[#17140F]/70 uppercase">
            Camera Preview
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSoundEnabled((p) => !p)}
              className="kiosk-btn flex h-7 w-7 items-center justify-center rounded-lg border border-[#17140F] bg-white text-[#17140F] cursor-pointer shadow-xs"
              title={soundEnabled ? "Mute audio" : "Enable audio"}
            >
              {soundEnabled ? <SpeakerHigh size={13} weight="bold" /> : <SpeakerSlash size={13} />}
            </button>
            {!isDemoMode && (
              <>
                <button
                  onClick={toggleMirror}
                  className={`kiosk-btn flex h-7 w-7 items-center justify-center rounded-lg border border-[#17140F] cursor-pointer shadow-xs ${
                    isMirrored ? "bg-[#D4FF3D] text-[#17140F]" : "bg-white text-[#17140F]"
                  }`}
                  title="Toggle mirror"
                >
                  <ArrowsHorizontal size={13} weight="bold" />
                </button>
                <button
                  onClick={toggleFacingMode}
                  className="kiosk-btn flex h-7 w-7 items-center justify-center rounded-lg border border-[#17140F] bg-white text-[#17140F] cursor-pointer shadow-xs"
                  title="Switch camera"
                >
                  <CameraRotate size={13} weight="bold" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Clean Viewfinder */}
        <div className="relative my-2 aspect-[3/4] w-full max-w-[280px] overflow-hidden rounded-2xl border-[3px] border-[#17140F] bg-[#1E1B18] shadow-[4px_4px_0px_#17140F]">
          {/* Status Badge */}
          {selectedAccessory !== "none" && (
            <div className="pointer-events-none absolute top-2 left-2 z-30 flex items-center gap-1 rounded-full border border-[#17140F] bg-[#D4FF3D] px-2 py-0.5 font-mono text-[8px] font-bold text-[#17140F]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FF3D9A] animate-ping" />
              <span>{isModelLoading ? "AR..." : "AR ACTIVE"}</span>
            </div>
          )}

          {/* AR Overlay Canvas */}
          <canvas
            ref={arCanvasRef}
            width={1500}
            height={2000}
            className="pointer-events-none absolute inset-0 z-[25] h-full w-full object-cover"
          />

          {isFlashing && (
            <div className="pointer-events-none absolute inset-0 z-40 bg-white animate-shutter-flash" />
          )}

          {countdownValue !== null && (
            <div
              className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-black/30"
              aria-live="polite"
            >
              <span
                key={countdownValue}
                className="font-fredoka text-8xl font-bold text-[#D4FF3D] drop-shadow-md animate-countdown-pop"
              >
                {countdownValue}
              </span>
            </div>
          )}

          {isDemoMode ? (
            <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#17140F] via-[#332c25] to-[#17140F] p-4 text-center text-white">
              <FilmStrip size={36} className="text-[#D4FF3D] mb-2" />
              <span className="font-fredoka text-lg font-bold">Simulated Camera</span>
              <span className="font-mono text-[10px] text-white/70">
                Ready for Slot #{slotIndex + 1}
              </span>
            </div>
          ) : (
            <video
              ref={handleVideoNode}
              autoPlay
              playsInline
              muted
              className={`h-full w-full object-cover ${
                isMirrored ? "-scale-x-100" : ""
              }`}
              style={{ filter: activeFilter.cssFilter }}
            />
          )}
        </div>

        {/* Dual Tab Selector for Accessories vs Filters */}
        <div className="mb-3 flex w-full max-w-[280px] flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex rounded-xl border-[2px] border-[#17140F] bg-white p-1">
              <button
                onClick={() => setActiveTab("accessories")}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 font-mono text-[11px] font-bold cursor-pointer transition-all ${
                  activeTab === "accessories"
                    ? "bg-[#D4FF3D] text-[#17140F] shadow-xs"
                    : "text-[#17140F]/70 hover:bg-[#FAF7F0]"
                }`}
              >
                <Crown size={12} weight="bold" />
                <span>ACCESSORY</span>
              </button>
              <button
                onClick={() => setActiveTab("filters")}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 font-mono text-[11px] font-bold cursor-pointer transition-all ${
                  activeTab === "filters"
                    ? "bg-[#D4FF3D] text-[#17140F] shadow-xs"
                    : "text-[#17140F]/70 hover:bg-[#FAF7F0]"
                }`}
              >
                <Palette size={12} weight="bold" />
                <span>FILTER</span>
              </button>
            </div>
            <span className="font-mono text-[9px] text-[#17140F]/60">
              {activeTab === "accessories" ? "AR TRACK" : "COLOR"}
            </span>
          </div>

          {/* Pill swatches row */}
          <div className="flex w-full items-center gap-1 overflow-x-auto py-1">
            {activeTab === "accessories"
              ? ACCESSORY_DEFINITIONS.map((acc) => (
                  <button
                    key={acc.id}
                    disabled={isCountingDown}
                    onClick={() => setSelectedAccessory(acc.id)}
                    className={`flex flex-shrink-0 items-center gap-1 rounded-full px-2.5 py-1 font-mono text-[11px] font-bold cursor-pointer transition-all ${
                      selectedAccessory === acc.id
                        ? "bg-[#17140F] text-white shadow-xs scale-105"
                        : "bg-[#FAF7F0] border border-[#17140F]/20 text-[#17140F]"
                    }`}
                  >
                    <span>{acc.name}</span>
                  </button>
                ))
              : PHOTO_FILTERS.map((f) => (
                  <button
                    key={f.id}
                    disabled={isCountingDown}
                    onClick={() => setSelectedFilter(f.id)}
                    className={`flex flex-shrink-0 rounded-full px-2.5 py-1 font-mono text-[11px] font-bold cursor-pointer transition-all ${
                      selectedFilter === f.id
                        ? "bg-[#17140F] text-white shadow-xs scale-105"
                        : "bg-[#FAF7F0] border border-[#17140F]/20 text-[#17140F]"
                    }`}
                  >
                    {f.name}
                  </button>
                ))}
          </div>
        </div>

        {/* Shutter Button */}
        <button
          onClick={startCountdown}
          disabled={isCountingDown}
          className="kiosk-btn flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FF6B4A] py-3.5 font-manrope text-sm font-extrabold text-white cursor-pointer disabled:opacity-50"
        >
          <Play size={16} weight="fill" />
          <span>{isCountingDown ? "COUNTING DOWN..." : "CAPTURE NEW SHOT"}</span>
        </button>

        <p className="mt-2 font-mono text-[10px] text-[#17140F]/60 text-center">
          Only slot #{slotIndex + 1} will be updated. The rest stay intact!
        </p>
      </div>
    </div>
  );
}
