"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ArrowLeft,
  CameraRotate,
  ArrowsHorizontal,
  SpeakerHigh,
  SpeakerSlash,
  WarningCircle,
  FilmStrip,
  Camera,
  Smiley,
  HandPeace,
  SmileyWink,
  Sunglasses,
  Heart,
  Lightning,
  HandPointing,
  type Icon,
} from "@phosphor-icons/react";
import { FrameTemplate } from "@/lib/templates";
import { PHOTO_FILTERS } from "@/lib/filters";
import { playCountdownPip, playShutterSound } from "@/lib/audio";
import { UseCameraCaptureReturn } from "@/hooks/useCameraCapture";
import { BoothShell } from "@/components/BoothShell";

export interface CapturedShotItem {
  id: string;
  dataUrl: string;
  filterId: string;
}

interface CaptureScreenProps {
  camera: UseCameraCaptureReturn;
  template: FrameTemplate;
  onComplete: (shots: CapturedShotItem[]) => void;
  onCancel: () => void;
  isDemoMode?: boolean;
}

const POSE_SUGGESTIONS: { label: string; icon: Icon }[] = [
  { label: "Warm Big Smile", icon: Smiley },
  { label: "Classic Peace Sign", icon: HandPeace },
  { label: "Playful Wink", icon: SmileyWink },
  { label: "Cool Editorial Gaze", icon: Sunglasses },
  { label: "Finger Heart", icon: Heart },
  { label: "Wild & Free Energy", icon: Lightning },
  { label: "Cute Cheek Poke", icon: HandPointing },
  { label: "Bestie Laugh", icon: Smiley },
];

const COUNTDOWN_SEC = 3;
const INTER_SHOT_MS = 1400;

export function CaptureScreen({
  camera,
  template,
  onComplete,
  onCancel,
  isDemoMode = false,
}: CaptureScreenProps) {
  const totalSlots = template.slotCount;
  const [currentShotIndex, setCurrentShotIndex] = useState<number>(0);
  const [capturedShots, setCapturedShots] = useState<CapturedShotItem[]>([]);
  const [isSequenceRunning, setIsSequenceRunning] = useState<boolean>(false);
  const [countdownValue, setCountdownValue] = useState<number | null>(null);
  const [isFlashing, setIsFlashing] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [selectedFilter] = useState<string>("none");

  const {
    videoRef,
    isReady,
    isMirrored,
    permissionState,
    errorMessage,
    startCamera,
    toggleMirror,
    toggleFacingMode,
    setDemoMode,
    captureFrame,
    generateDemoFrame,
  } = camera;

  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startCountdownRef = useRef<() => void>(() => {});

  // Start camera on mount unless already in demo mode
  useEffect(() => {
    if (!isDemoMode && permissionState !== "denied" && permissionState !== "unsupported") {
      startCamera();
    }
  }, [isDemoMode, permissionState, startCamera]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, []);

  const triggerShotCapture = useCallback(async () => {
    // 1. Flash & Shutter Sound
    setIsFlashing(true);
    if (soundEnabled) {
      playShutterSound();
    }

    // 2. Capture frame from camera or fallback
    let shotUrl = "";
    try {
      if (isDemoMode || !isReady) {
        shotUrl = generateDemoFrame(currentShotIndex, selectedFilter, "none");
      } else {
        shotUrl = await captureFrame(selectedFilter, "none", null);
      }
    } catch {
      shotUrl = generateDemoFrame(currentShotIndex, selectedFilter, "none");
    }

    setTimeout(() => {
      setIsFlashing(false);
    }, 240);

    const shotId = `shot_${currentShotIndex}_${Date.now()}`;
    const newShotItem: CapturedShotItem = {
      id: shotId,
      dataUrl: shotUrl,
      filterId: selectedFilter,
    };

    const nextShots = [...capturedShots, newShotItem];
    setCapturedShots(nextShots);

    const nextIndex = currentShotIndex + 1;
    setCurrentShotIndex(nextIndex);

    // If all slots captured, finish sequence and advance to design studio
    if (nextIndex >= totalSlots) {
      setIsSequenceRunning(false);
      setTimeout(() => {
        onComplete(nextShots);
      }, 700);
      return;
    }

    // Inter-shot pose break, then trigger countdown for next slot
    setTimeout(() => {
      startCountdownRef.current();
    }, INTER_SHOT_MS);
  }, [
    captureFrame,
    capturedShots,
    currentShotIndex,
    generateDemoFrame,
    isDemoMode,
    isReady,
    onComplete,
    selectedFilter,
    soundEnabled,
    totalSlots,
  ]);

  const triggerShotCaptureRef = useRef(triggerShotCapture);
  useEffect(() => {
    triggerShotCaptureRef.current = triggerShotCapture;
  }, [triggerShotCapture]);

  const startCountdownForShot = useCallback(() => {
    setCountdownValue(COUNTDOWN_SEC);
    if (soundEnabled) playCountdownPip(false);

    let step = COUNTDOWN_SEC;
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

    countdownTimerRef.current = setInterval(() => {
      step -= 1;
      if (step > 0) {
        setCountdownValue(step);
        if (soundEnabled) playCountdownPip(false);
      } else {
        if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
        setCountdownValue(null);
        triggerShotCaptureRef.current();
      }
    }, 950);
  }, [soundEnabled]);

  useEffect(() => {
    startCountdownRef.current = startCountdownForShot;
  }, [startCountdownForShot]);

  const startSequence = useCallback(() => {
    if (isSequenceRunning) return;
    setIsSequenceRunning(true);
    setCurrentShotIndex(0);
    setCapturedShots([]);
    startCountdownForShot();
  }, [isSequenceRunning, startCountdownForShot]);

  // Keyboard shortcut: Space to start sequence, Esc to cancel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !isSequenceRunning && (isReady || isDemoMode)) {
        e.preventDefault();
        startSequence();
      } else if (e.code === "Escape") {
        e.preventDefault();
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSequenceRunning, isReady, isDemoMode, onCancel, startSequence]);

  const currentPose = POSE_SUGGESTIONS[currentShotIndex % POSE_SUGGESTIONS.length];
  const CurrentPoseIcon = currentPose.icon;
  const activeFilterDef = PHOTO_FILTERS.find((f) => f.id === selectedFilter) || PHOTO_FILTERS[0];

  return (
    <BoothShell
      as="div"
      variant="fixed"
      className="px-3 py-2 sm:px-6 sm:py-3 md:px-8 md:py-3 overflow-hidden select-none"
      header={
        <>
          <button
            onClick={onCancel}
            disabled={isSequenceRunning}
            className="kiosk-btn inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 font-mono text-xs font-bold text-[#1E1B18] cursor-pointer disabled:opacity-40"
            aria-label="Change booth format"
          >
            <ArrowLeft size={16} weight="bold" />
            <span>CHANGE FORMAT</span>
          </button>

          {/* Live Shot Counter Header */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 sm:gap-2 rounded-full border-[2px] border-[#1E1B18] bg-[#E1503A] text-white px-3.5 py-1 font-mono text-xs font-extrabold shadow-[2px_2px_0px_#1E1B18]">
              <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
              <span>
                SHOT {Math.min(currentShotIndex + 1, totalSlots)} OF {totalSlots}
              </span>
            </div>
            <span className="hidden sm:inline-block rounded-md border border-[#1E1B18]/30 bg-white px-2.5 py-1 font-mono text-[11px] font-bold text-[#1E1B18]">
              {template.name}
            </span>
          </div>

          {/* Audio and Camera Toggles */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSoundEnabled((prev) => !prev)}
              className="kiosk-btn flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-white text-[#1E1B18] cursor-pointer"
              title={soundEnabled ? "Mute audio" : "Enable audio"}
              aria-label={soundEnabled ? "Mute audio" : "Enable audio"}
            >
              {soundEnabled ? <SpeakerHigh size={17} weight="bold" /> : <SpeakerSlash size={17} />}
            </button>

            {!isDemoMode && (
              <>
                <button
                  onClick={toggleMirror}
                  className={`kiosk-btn flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl cursor-pointer ${
                    isMirrored ? "bg-[#FAF7F0] text-[#E1503A]" : "bg-white text-[#1E1B18]"
                  }`}
                  title="Toggle mirror view"
                  aria-label="Toggle camera mirror"
                >
                  <ArrowsHorizontal size={17} weight="bold" />
                </button>

                <button
                  onClick={toggleFacingMode}
                  className="kiosk-btn flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-white text-[#1E1B18] cursor-pointer"
                  title="Switch front/rear camera"
                  aria-label="Switch front or rear camera"
                >
                  <CameraRotate size={17} weight="bold" />
                </button>
              </>
            )}
          </div>
        </>
      }
    >
      {/* Full-screen Shutter Flash Effect */}
      {isFlashing && (
        <div className="pointer-events-none fixed inset-0 z-50 bg-white animate-shutter-flash" />
      )}

      {/* Main Booth Chamber */}
      <div className="flex-1 min-h-0 w-full flex flex-col items-center justify-between gap-2.5 py-1 overflow-hidden">
        
        {/* Dynamic Pose Guidance Pill */}
        <div className="flex items-center gap-2 rounded-full border-[2px] border-[#1E1B18] bg-white px-4 py-1 shadow-[2px_2px_0px_#1E1B18] shrink-0">
          <CurrentPoseIcon size={16} weight="bold" className="text-[#E1503A]" />
          <span className="font-sans text-xs sm:text-sm font-extrabold text-[#1E1B18]">
            {isSequenceRunning
              ? `Slot ${currentShotIndex + 1}: Strike your pose — ${currentPose.label}!`
              : `Pose Idea for Shot 1: ${currentPose.label}`}
          </span>
        </div>

        {/* ================= PHYSICAL BOOTH CARD WITH EMBEDDED SLOTS ================= */}
        <div className="flex-1 min-h-0 w-full flex items-center justify-center px-2">
          {permissionState === "denied" || permissionState === "unsupported" ? (
            /* Permission Denied Fallback Chamber */
            <div className="flex flex-col items-center justify-center p-6 text-center rounded-2xl border-[3px] border-[#1E1B18] bg-white shadow-[5px_5px_0px_#1E1B18] max-w-sm">
              <WarningCircle size={44} className="text-[#D9A441] mb-2" />
              <h3 className="font-serif text-xl font-bold text-[#1E1B18]">Camera Offline</h3>
              <p className="mt-1 text-xs font-mono text-[#1E1B18]/70 leading-relaxed">
                {errorMessage || "Camera permissions were denied or no camera device was found."}
              </p>
              <div className="mt-4 flex flex-col gap-2 w-full">
                <button
                  onClick={() => setDemoMode(true)}
                  className="kiosk-btn inline-flex items-center justify-center gap-2 rounded-xl bg-[#E1503A] px-4 py-2.5 font-sans text-xs font-extrabold text-white cursor-pointer"
                >
                  <FilmStrip size={15} weight="bold" />
                  <span>CONTINUE WITH DEMO SNAPS</span>
                </button>
                <button
                  onClick={() => startCamera()}
                  className="kiosk-btn rounded-xl bg-white border border-[#1E1B18] px-4 py-2 font-mono text-xs text-[#1E1B18] cursor-pointer"
                >
                  RETRY CAMERA
                </button>
              </div>
            </div>
          ) : (
            /* Multi-Slot Physical Photo Booth Card */
            <div
              className="relative flex items-center justify-center rounded-2xl border-[3px] border-[#1E1B18] bg-[#FAF7F0] p-3 shadow-[6px_6px_0px_#1E1B18] transition-all"
              style={{
                aspectRatio: template.aspectRatio,
                height: "100%",
                maxHeight: "calc(100vh - 195px)",
                width: "auto",
                maxWidth: "100%",
              }}
            >
              {/* Outer Card Header Stamp */}
              <div className="absolute top-2 inset-x-0 text-center pointer-events-none select-none">
                <span className="block font-serif text-[10px] sm:text-xs font-bold text-[#1E1B18] tracking-wide">
                  {template.headerTitle}
                </span>
              </div>

              {/* Individual Multi-Slots Container */}
              <div className="relative w-full h-full">
                {template.slots.map((slot) => {
                  const shot = capturedShots[slot.index];
                  const isActiveSlot = slot.index === currentShotIndex;
                  const pose = POSE_SUGGESTIONS[slot.index % POSE_SUGGESTIONS.length];
                  const PoseIcon = pose.icon;

                  return (
                    <div
                      key={slot.index}
                      className={`absolute overflow-hidden rounded-lg border-[2px] border-[#1E1B18] transition-all ${
                        isActiveSlot
                          ? "ring-4 ring-[#E1503A] shadow-[2px_2px_0px_#1E1B18] z-20"
                          : "bg-[#1E1B18]/10 z-10"
                      }`}
                      style={{
                        left: `${slot.x}%`,
                        top: `${slot.y}%`,
                        width: `${slot.width}%`,
                        height: `${slot.height}%`,
                      }}
                    >
                      {/* 1. Captured Photo (Locked in place) */}
                      {shot ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={shot.dataUrl}
                          alt={`Captured shot ${slot.index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      ) : isActiveSlot ? (
                        /* 2. Active Slot: Live Camera Stream with Countdown Overlay */
                        <div className="relative h-full w-full bg-[#1E1B18] flex items-center justify-center">
                          {isDemoMode ? (
                            <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#1E1B18] to-[#2d2822] text-[#FAF7F0] p-2 text-center">
                              <FilmStrip size={26} weight="bold" className="text-[#D9A441] mb-1" />
                              <span className="font-mono text-[10px] font-bold text-[#D9A441]">
                                DEMO FEED #{slot.index + 1}
                              </span>
                            </div>
                          ) : (
                            <video
                              ref={videoRef}
                              autoPlay
                              playsInline
                              muted
                              className={`h-full w-full object-cover ${
                                isMirrored ? "-scale-x-100" : ""
                              }`}
                              style={{ filter: activeFilterDef.cssFilter }}
                            />
                          )}

                          {/* Active Red Record Dot */}
                          <div className="absolute top-1.5 left-1.5 z-30 flex items-center gap-1 rounded-full bg-black/60 px-1.5 py-0.5 font-mono text-[8px] font-bold text-white">
                            <span className="h-2 w-2 rounded-full bg-[#E1503A] animate-ping" />
                            <span>REC</span>
                          </div>

                          {/* 3-2-1 Animated Countdown Overlay */}
                          {countdownValue !== null && (
                            <div
                              className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center bg-black/35 backdrop-blur-[1px]"
                              aria-live="polite"
                            >
                              <span
                                key={countdownValue}
                                className="font-serif text-5xl sm:text-6xl md:text-7xl font-bold text-[#FAF7F0] drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] animate-countdown-pop"
                              >
                                {countdownValue}
                              </span>
                            </div>
                          )}

                          {/* Framing Crosshair Guides */}
                          <div className="pointer-events-none absolute inset-2 border border-white/20 rounded-sm" />
                        </div>
                      ) : (
                        /* 3. Upcoming Queued Slot */
                        <div className="flex h-full w-full flex-col items-center justify-center bg-[#FAF7F0] p-2 text-center text-[#1E1B18]">
                          <PoseIcon size={18} weight="bold" className="text-[#1E1B18]/40 mb-1" />
                          <span className="font-mono text-[9px] font-bold text-[#1E1B18]/60">
                            SHOT 0{slot.index + 1}
                          </span>
                          <span className="font-sans text-[8px] text-[#1E1B18]/50 truncate max-w-full px-1">
                            {pose.label}
                          </span>
                        </div>
                      )}

                      {/* Technical Corner Badge */}
                      <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1 font-mono text-[7px] font-bold text-white">
                        #{slot.index + 1}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Outer Card Footer Stamp */}
              <div className="absolute bottom-2 inset-x-0 text-center pointer-events-none select-none">
                <span className="block font-serif text-[9px] sm:text-[10px] font-bold italic text-[#1E1B18]/70">
                  MikuaBooth · {template.footerStamp}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Shutter Button & Sequence Controls */}
        <div className="w-full max-w-sm flex flex-col items-center gap-1.5 pt-1 shrink-0">
          {!isSequenceRunning ? (
            <button
              onClick={startSequence}
              disabled={!isDemoMode && !isReady}
              className="kiosk-btn group relative inline-flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#E1503A] py-3 sm:py-3.5 font-sans text-sm sm:text-base font-extrabold tracking-wide text-white cursor-pointer shadow-[4px_4px_0px_#1E1B18] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Camera size={20} weight="bold" />
              <span>START {totalSlots}-SHOT BURST</span>
              <span className="hidden sm:inline-block rounded border border-white/40 px-1.5 py-0.5 font-mono text-[10px] font-bold">
                SPACE
              </span>
            </button>
          ) : (
            <div className="flex items-center justify-center gap-2.5 rounded-xl border-[2px] border-[#1E1B18] bg-[#FAF7F0] px-4 py-2.5 w-full font-mono text-xs font-black text-[#1E1B18] shadow-[2px_2px_0px_#1E1B18]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#E1503A] animate-ping" />
              <span>CAPTURING SHOT {currentShotIndex + 1} OF {totalSlots}...</span>
            </div>
          )}

          <div className="flex items-center gap-2 font-mono text-[10px] text-[#1E1B18]/70">
            <span>AUTOMATIC {COUNTDOWN_SEC}s COUNTDOWN PER SHOT</span>
            <span>·</span>
            <span>1 SHOT AT A TIME</span>
          </div>
        </div>

      </div>
    </BoothShell>
  );
}
