"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ArrowLeft,
  CameraRotate,
  ArrowsHorizontal,
  SpeakerHigh,
  SpeakerSlash,
  WarningCircle,
  Play,
  FilmStrip,
  Sparkle,
  Crown,
  Palette,
  Check,
  Smiley,
  SmileyWink,
  SmileyNervous,
  HandPeace,
  HandPointing,
  Heart,
  Lightning,
  Sunglasses,
  Timer,
  Keyboard,
  type Icon,
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
import { useMascot } from "@/context/MascotContext";
import { BoothShell } from "@/components/BoothShell";

export interface CapturedShotItem {
  id: string;
  dataUrl: string;
  filterId: string;
  accessoryId?: string;
}

interface CaptureScreenProps {
  camera: UseCameraCaptureReturn;
  totalSlots?: number;
  templateName?: string;
  onComplete: (shots: CapturedShotItem[]) => void;
  onCancel: () => void;
  isDemoMode?: boolean;
}

const POSE_SUGGESTIONS: { label: string; Icon: Icon }[] = [
  { label: "Warm Big Smile", Icon: Smiley },
  { label: "Classic Peace Sign", Icon: HandPeace },
  { label: "Playful Wink", Icon: SmileyWink },
  { label: "Wild & Free Expression", Icon: Lightning },
  { label: "Finger Heart", Icon: Heart },
  { label: "Cute Cheek Poke", Icon: HandPointing },
  { label: "Surprised Gasps", Icon: SmileyNervous },
  { label: "Cool Editorial Gaze", Icon: Sunglasses },
];

const COUNTDOWN_SEC = 3;
const INTER_SHOT_MS = 1400;

export function CaptureScreen({
  camera,
  totalSlots = 4,
  templateName = "Classic Strip",
  onComplete,
  onCancel,
  isDemoMode = false,
}: CaptureScreenProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>("none");
  const [selectedAccessory, setSelectedAccessory] = useState<AccessoryId>("none");
  const { playOnce } = useMascot();
  const [activeDrawerTab, setActiveDrawerTab] = useState<"accessories" | "filters">("accessories");
  const [mobileView, setMobileView] = useState<"camera" | "photos" | "decor">("camera");
  const [currentShotIndex, setCurrentShotIndex] = useState<number>(0);
  const [capturedShots, setCapturedShots] = useState<CapturedShotItem[]>([]);
  const [isCountingDown, setIsCountingDown] = useState<boolean>(false);
  const [countdownValue, setCountdownValue] = useState<number | null>(null);
  const [isFlashing, setIsFlashing] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isSequenceRunning, setIsSequenceRunning] = useState<boolean>(false);

  const [videoNode, setVideoNode] = useState<HTMLVideoElement | null>(null);
  const arCanvasRef = useRef<HTMLCanvasElement | null>(null);

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

  const handleVideoNode = useCallback(
    (node: HTMLVideoElement | null) => {
      setVideoNode(node);
      videoRef(node);
    },
    [videoRef]
  );

  const { detectedFace, isModelReady, isModelLoading } = useFaceLandmarks({
    videoElement: videoNode,
    isReady,
    isMirrored,
    enabled: true, // Detection loop pre-warmed continuously so accessory click renders instantly
    isDemoMode,
  });

  // Render live AR accessory immediately onto the viewfinder overlay canvas
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
        // Immediate fallback while video dimensions initialize
        const cx = (isMirrored ? 1 - detectedFace.normalizedAnchorX : detectedFace.normalizedAnchorX) * canvas.width;
        const cy = detectedFace.normalizedAnchorY * canvas.height;
        const cw = detectedFace.normalizedFaceWidth * canvas.width;
        const roll = isMirrored ? -detectedFace.rollAngle : detectedFace.rollAngle;
        drawAccessoryOnCanvas(ctx, selectedAccessory, cx, cy, cw, roll);
      }
    }
  }, [detectedFace, selectedAccessory, isDemoMode, isMirrored, videoNode]);

  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startCountdownRef = useRef<() => void>(() => {});

  // Initialize camera stream when entering (unless already in demo mode)
  useEffect(() => {
    if (!isDemoMode && permissionState !== "denied" && permissionState !== "unsupported") {
      startCamera();
    }
  }, [isDemoMode, permissionState, startCamera]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, []);

  const triggerShotCapture = useCallback(async () => {
    // 1. Shutter flash & sound & mascot reaction
    setIsFlashing(true);
    playOnce("flash-reaction");
    if (soundEnabled) {
      playShutterSound();
    }

    // Capture frame with baked filter & AR accessory
    let shotUrl = "";
    try {
      if (isDemoMode || !isReady) {
        shotUrl = generateDemoFrame(currentShotIndex, selectedFilter, selectedAccessory);
      } else {
        shotUrl = await captureFrame(selectedFilter, selectedAccessory, detectedFace);
      }
    } catch {
      // Fallback to generated frame if capture error occurs
      shotUrl = generateDemoFrame(currentShotIndex, selectedFilter, selectedAccessory);
    }

    // Turn off flash after brief moment
    setTimeout(() => {
      setIsFlashing(false);
    }, 280);

    const shotId = `shot_${currentShotIndex}_${Date.now()}`;
    const newShotItem: CapturedShotItem = {
      id: shotId,
      dataUrl: shotUrl,
      filterId: selectedFilter,
      accessoryId: selectedAccessory,
    };

    const nextShots = [...capturedShots, newShotItem];
    setCapturedShots(nextShots);

    const nextIndex = currentShotIndex + 1;
    setCurrentShotIndex(nextIndex);

    // If all required slots captured, transition to slot editor
    if (nextIndex >= totalSlots) {
      setIsSequenceRunning(false);
      setIsCountingDown(false);
      setTimeout(() => {
        onComplete(nextShots);
      }, 750);
      return;
    }

    // Otherwise, pause to let user pose, then start countdown for next shot
    setTimeout(() => {
      startCountdownRef.current();
    }, INTER_SHOT_MS);
  }, [
    captureFrame,
    capturedShots,
    currentShotIndex,
    detectedFace,
    generateDemoFrame,
    isDemoMode,
    isReady,
    onComplete,
    selectedAccessory,
    selectedFilter,
    soundEnabled,
    totalSlots,
    playOnce,
  ]);

  const triggerShotCaptureRef = useRef(triggerShotCapture);
  useEffect(() => {
    triggerShotCaptureRef.current = triggerShotCapture;
  }, [triggerShotCapture]);

  const startCountdownForShot = useCallback(() => {
    setIsCountingDown(true);
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
        setIsCountingDown(false);
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

  const activeFilter = PHOTO_FILTERS.find((f) => f.id === selectedFilter) || PHOTO_FILTERS[0];

  // Instructional dynamic copy based on sequence phase
  const getInstructionCopy = () => {
    if (!isSequenceRunning) return "Smile, you're on camera! Press start when ready.";
    if (isCountingDown) return `Strike a pose for photo ${currentShotIndex + 1}!`;
    return `Captured shot ${currentShotIndex} of ${totalSlots}. Get ready for the next one!`;
  };

  return (
    <BoothShell
      as="div"
      variant="fixed"
      className="px-3 py-2 sm:px-6 sm:py-3 md:px-8 md:py-3 overflow-hidden select-none"
      header={
        <>
          <button
            onClick={onCancel}
            className="kiosk-btn inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 font-mono text-xs font-bold text-[#17140F] cursor-pointer"
            aria-label="Exit booth"
          >
            <ArrowLeft size={16} weight="bold" />
            <span>CHANGE FRAME</span>
          </button>

          {/* Live Shot Counter Top Center in JetBrains Mono */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 sm:gap-2 rounded-full border-[2px] border-[#17140F] bg-[#D4FF3D] px-3.5 py-1 font-mono text-xs font-extrabold text-[#17140F] shadow-[2px_2px_0px_#17140F]">
              <span className="text-[#FF3D9A] animate-pulse">●</span>
              <span>
                SHOT {Math.min(currentShotIndex + 1, totalSlots)} / {totalSlots}
              </span>
            </div>
            <span className="hidden sm:inline-block rounded-md border border-[#17140F]/30 bg-white px-2 py-0.5 font-mono text-[10px] text-[#17140F]/70">
              {templateName}
            </span>
          </div>

          {/* Audio and Camera Controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSoundEnabled((prev) => !prev)}
              className="kiosk-btn flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-white text-[#17140F] cursor-pointer"
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
                    isMirrored
                      ? "bg-[#D4FF3D] text-[#17140F]"
                      : "bg-white text-[#17140F]"
                  }`}
                  title="Toggle camera mirror"
                  aria-label="Toggle camera mirror"
                >
                  <ArrowsHorizontal size={17} weight="bold" />
                </button>

                <button
                  onClick={toggleFacingMode}
                  className="kiosk-btn flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-white text-[#17140F] cursor-pointer"
                  title="Switch front/back camera"
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

      {/* Mobile Mode Switcher (< lg only) */}
      <div className="flex lg:hidden w-full items-center justify-center px-2 py-1 shrink-0">
        <div className="flex rounded-xl border-[2px] border-[#17140F] bg-[#FAF7F0] p-0.5 w-full max-w-sm">
          <button
            onClick={() => setMobileView("camera")}
            className={`flex-1 py-1 font-mono text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
              mobileView === "camera"
                ? "bg-[#D4FF3D] text-[#17140F] shadow-xs"
                : "text-[#17140F]/70"
            }`}
          >
            CAMERA
          </button>
          <button
            onClick={() => setMobileView("photos")}
            className={`flex-1 py-1 font-mono text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
              mobileView === "photos"
                ? "bg-[#D4FF3D] text-[#17140F] shadow-xs"
                : "text-[#17140F]/70"
            }`}
          >
            PHOTOS ({capturedShots.length}/{totalSlots})
          </button>
          <button
            onClick={() => setMobileView("decor")}
            className={`flex-1 py-1 font-mono text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
              mobileView === "decor"
                ? "bg-[#D4FF3D] text-[#17140F] shadow-xs"
                : "text-[#17140F]/70"
            }`}
          >
            DECOR &amp; FILTERS
          </button>
        </div>
      </div>

      {/* Main 3-Zone Workspace (Left: Photos Rail, Center: Clean High-Quality Viewfinder, Right: Accessories & Effects) */}
      <div className="flex-1 min-h-0 w-full mx-auto flex flex-col lg:grid lg:grid-cols-[250px_1fr_350px] xl:grid-cols-[270px_1fr_380px] 2xl:grid-cols-[290px_1fr_400px] gap-2.5 sm:gap-3 my-1 items-stretch overflow-hidden">
        
        {/* ================= ZONE 1: LEFT COLUMN - "YOUR PHOTOS" RAIL ================= */}
        <aside
          className={`${
            mobileView === "photos" ? "flex" : "hidden"
          } lg:flex w-full min-w-0 h-full min-h-0 flex-col gap-2 rounded-2xl border-[2.5px] border-[#17140F] bg-white p-3 shadow-[3px_3px_0px_#17140F]`}
        >
          <div className="flex items-center justify-between border-b border-[#17140F]/15 pb-1.5 shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#FF6B4A]" />
              <h2 className="font-mono text-xs font-black uppercase tracking-wider text-[#17140F]">
                Your Photos
              </h2>
            </div>
            <span className="rounded-full border border-[#17140F] bg-[#D4FF3D] px-2 py-[0.2rem] font-mono text-[10px] font-extrabold text-[#17140F]">
              {capturedShots.length} / {totalSlots} SHOTS
            </span>
          </div>

          <div className="flex items-center justify-between text-[10px] font-manrope text-[#17140F]/70 shrink-0">
            <span>
              {capturedShots.length === totalSlots
                ? "Sequence complete! Processing..."
                : isSequenceRunning
                ? `Shooting shot ${currentShotIndex + 1}...`
                : `Ready to burst ${totalSlots} poses.`}
            </span>
          </div>

          {/* Scrollable list of photo slots filling vertical space comfortably */}
          <div className="flex-1 min-h-0 overflow-y-auto pr-1 flex flex-col gap-2 py-0.5">
            {Array.from({ length: totalSlots }).map((_, idx) => {
              const shot = capturedShots[idx];
              const isCurrent = idx === currentShotIndex && isSequenceRunning;
              const poseTip = POSE_SUGGESTIONS[idx % POSE_SUGGESTIONS.length];
              const PoseIcon = poseTip.Icon;

              return (
                <div
                  key={idx}
                  className={`group flex shrink-0 w-full items-center gap-2.5 rounded-xl border-[2px] p-2 transition-all ${
                    isCurrent
                      ? "border-[#FF6B4A] bg-[#FF6B4A]/10 shadow-[2px_2px_0px_#17140F] scale-[1.01]"
                      : shot
                      ? "border-[#17140F] bg-[#FFF9E6] shadow-xs"
                      : "border-[#17140F]/20 bg-[#FAF7F0]"
                  }`}
                >
                  {/* Photo Thumbnail */}
                  <div className="relative aspect-[3/4] h-14 sm:h-16 w-11 sm:w-12 shrink-0 overflow-hidden rounded-lg border-[1.5px] border-[#17140F] bg-[#1E1B18]">
                    {shot ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={shot.dataUrl}
                        alt={`Shot ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center font-mono text-[9px] font-bold text-white/50">
                        <span>0{idx + 1}</span>
                        <span className="text-[7px] text-white/30">3:4</span>
                      </div>
                    )}
                    <span className="absolute top-0.5 left-0.5 rounded bg-black/70 px-1 py-[0.2rem] font-mono text-[7px] font-bold text-white">
                      #{idx + 1}
                    </span>
                    {isCurrent && (
                      <div className="absolute inset-0 bg-[#FF6B4A]/30 flex items-center justify-center">
                        <span className="h-2 w-2 rounded-full bg-[#FF6B4A] animate-ping" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex flex-1 flex-col justify-center min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#17140F]">
                        Shot #{idx + 1}
                      </span>
                      {shot ? (
                        <span className="flex items-center gap-0.5 rounded bg-[#D4FF3D] border border-[#17140F] px-1.5 py-[0.2rem] font-mono text-[8px] font-black text-[#17140F]">
                          <Check size={9} weight="bold" /> READY
                        </span>
                      ) : isCurrent ? (
                        <span className="flex items-center gap-1 rounded bg-[#FF3D9A] border border-[#17140F] px-1.5 py-[0.2rem] font-mono text-[8px] font-black text-white animate-pulse">
                          SHOOTING
                        </span>
                      ) : (
                        <span className="font-mono text-[8px] font-bold text-[#17140F]/50">
                          QUEUED
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 font-manrope text-[10px] text-[#17140F]/70 truncate">
                      {shot ? (
                        `Filter: ${
                          PHOTO_FILTERS.find((f) => f.id === shot.filterId)?.name || "Natural"
                        }`
                      ) : (
                        <span className="inline-flex items-center gap-1">
                          <PoseIcon
                            size={12}
                            weight="bold"
                            aria-hidden="true"
                            className="shrink-0 text-[#17140F]/60"
                          />
                          <span className="truncate">{poseTip.label}</span>
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Rail Footer: Progress & Guide Info to eliminate empty space */}
          <div className="mt-auto pt-2 border-t border-[#17140F]/15 flex flex-col gap-1.5 shrink-0">
            <div className="flex items-center justify-between font-mono text-[10px] font-bold text-[#17140F]/70">
              <span>SEQUENCE PROGRESS</span>
              <span>{Math.round((capturedShots.length / totalSlots) * 100)}%</span>
            </div>
            <div className="h-2 w-full rounded-full border border-[#17140F] bg-[#FAF7F0] overflow-hidden">
              <div
                className="h-full bg-[#D4FF3D] transition-all duration-300"
                style={{ width: `${(capturedShots.length / totalSlots) * 100}%` }}
              />
            </div>
            <div className="flex items-center justify-between font-mono text-[9px] text-[#17140F]/60 pt-0.5">
              <span className="inline-flex items-center gap-1">
                <Timer size={11} weight="bold" aria-hidden="true" />
                <span>{COUNTDOWN_SEC}s countdown</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <Keyboard size={11} weight="bold" aria-hidden="true" />
                <span>SPACE to trigger</span>
              </span>
            </div>
          </div>
        </aside>

        {/* ================= ZONE 2: CENTER COLUMN - VIEWFINDER & FRAME ================= */}
        <main
          className={`${
            mobileView === "camera" ? "flex" : "hidden"
          } lg:flex flex-1 min-h-0 flex-col items-center justify-between gap-1.5 h-full px-1`}
        >
          {/* Instructional phase prompt pill */}
          <div className="flex items-center gap-1.5 rounded-full border-[2px] border-[#17140F] bg-white px-3.5 py-1 shadow-[2px_2px_0px_#17140F] shrink-0">
            <Sparkle size={14} weight="fill" className="text-[#FF6B4A]" />
            <span className="font-manrope text-xs sm:text-sm font-bold text-[#17140F]">
              {getInstructionCopy()}
            </span>
          </div>

          {/* Viewfinder lane: takes leftover column space, centers the 3:4 frame */}
          <div className="flex min-h-0 w-full flex-1 items-center justify-center">
          {/* Clean High-Quality Viewfinder - Pure camera feed with no internal graphics or HUD clutter */}
          <div className="relative aspect-[3/4] h-full max-h-full w-auto max-w-full shrink-0 overflow-hidden rounded-2xl border-[4px] border-[#17140F] bg-[#14120E] shadow-[6px_6px_0px_#17140F]">
            {/* Active Accessory Status Pill (Subtle top banner) */}
            {selectedAccessory !== "none" && (
              <div className="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 rounded-full border border-[#17140F] bg-[#D4FF3D] px-3 py-0.5 font-mono text-[9px] font-black text-[#17140F] shadow-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-[#FF3D9A] animate-ping" />
                <span>AR: {selectedAccessory.toUpperCase().replace("-", " ")}</span>
              </div>
            )}

            {/* AR Accessory Live Overlay Canvas */}
            <canvas
              ref={arCanvasRef}
              width={1500}
              height={2000}
              className="pointer-events-none absolute inset-0 z-[25] h-full w-full object-cover"
            />

            {/* White Shutter Flash Overlay */}
            {isFlashing && (
              <div className="pointer-events-none absolute inset-0 z-40 bg-white animate-shutter-flash" />
            )}

            {/* 3-2-1 Animated Countdown Overlay */}
            {countdownValue !== null && (
              <div
                className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-[1px]"
                aria-live="polite"
              >
                <span
                  key={countdownValue}
                  className="font-fredoka text-8xl sm:text-9xl md:text-[10rem] font-bold text-[#D4FF3D] drop-shadow-[0_4px_20px_rgba(0,0,0,0.95)] animate-countdown-pop"
                >
                  {countdownValue}
                </span>
              </div>
            )}

            {/* Camera Permission Denied or Unsupported Error View */}
            {permissionState === "denied" || permissionState === "unsupported" ? (
              <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center text-[#FAF7F0]">
                <WarningCircle size={44} className="text-[#D9A441] mb-2" />
                <h3 className="font-fredoka text-xl sm:text-2xl font-bold text-white">
                  Camera Offline
                </h3>
                <p className="mt-1 text-xs font-mono text-white/70 max-w-xs leading-relaxed">
                  {errorMessage || "Camera permissions were denied or no camera device was found."}
                </p>

                <div className="mt-4 flex flex-col gap-2 w-full max-w-xs">
                  <button
                    onClick={() => {
                      setDemoMode(true);
                    }}
                    className="kiosk-btn inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF6B4A] px-4 py-2.5 font-manrope text-xs font-extrabold text-white cursor-pointer"
                  >
                    <FilmStrip size={15} weight="bold" />
                    <span>CONTINUE WITH DEMO SNAPS</span>
                  </button>

                  <button
                    onClick={() => startCamera()}
                    className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 font-mono text-xs text-white hover:bg-white/20 active:scale-[0.98] cursor-pointer"
                  >
                    RETRY CAMERA
                  </button>
                </div>
              </div>
            ) : isDemoMode ? (
              /* Demo Mode Viewfinder Screen */
              <div className="relative flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#17140F] via-[#2d2822] to-[#17140F] text-[#FAF7F0] p-6 text-center">
                <div className="rounded-2xl border-[2.5px] border-[#D4FF3D] bg-[#D4FF3D]/10 p-4 mb-3 shadow-[3px_3px_0px_#D4FF3D]">
                  <FilmStrip size={38} weight="bold" className="text-[#D4FF3D]" />
                </div>
                <h3 className="font-fredoka text-xl sm:text-2xl font-bold">Simulated Kiosk Feed</h3>
                <p className="mt-1 font-manrope text-xs text-white/70 max-w-xs">
                  Ready to capture {totalSlots} expressive snaps with your active look.
                </p>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
                  <span className="rounded-full border border-[#D4FF3D]/50 bg-[#D4FF3D]/20 px-2.5 py-0.5 font-mono text-[10px] text-[#D4FF3D] font-bold">
                    FILTER: {activeFilter.name.toUpperCase()}
                  </span>
                  {selectedAccessory !== "none" && (
                    <span className="rounded-full border border-[#FF3D9A]/50 bg-[#FF3D9A]/20 px-2.5 py-0.5 font-mono text-[10px] text-[#FF3D9A] font-bold">
                      AR: {selectedAccessory.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              /* Live Camera Video Feed */
              <video
                ref={handleVideoNode}
                autoPlay
                playsInline
                muted
                className={`h-full w-full object-cover transition-[filter] duration-200 ${
                  isMirrored ? "-scale-x-100" : ""
                }`}
                style={{ filter: activeFilter.cssFilter }}
              />
            )}
            </div>
          </div>

          {/* Shutter Action Button & Timing Guide */}
          <div className="w-full max-w-sm flex flex-col items-center gap-1 pt-1 shrink-0">
            {!isSequenceRunning ? (
              <button
                onClick={startSequence}
                disabled={!isDemoMode && !isReady}
                className="kiosk-btn group relative inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF6B4A] py-2.5 sm:py-3 font-manrope text-xs sm:text-sm font-black tracking-wider text-white cursor-pointer shadow-[3px_3px_0px_#17140F] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Play size={16} weight="fill" />
                <span>START {totalSlots}-SHOT SEQUENCE</span>
                <span className="hidden sm:inline-block rounded border border-white/40 px-1.5 py-[0.2rem] font-mono text-[10px] font-normal">
                  SPACE
                </span>
              </button>
            ) : (
              <div className="flex items-center justify-center gap-2 rounded-xl border-[2px] border-[#17140F] bg-[#D4FF3D] px-4 py-2 w-full font-mono text-xs font-black text-[#17140F] shadow-[2px_2px_0px_#17140F]">
                <span className="h-2 w-2 rounded-full bg-[#FF3D9A] animate-ping" />
                <span>CAPTURING SHOT {currentShotIndex + 1} OF {totalSlots}</span>
              </div>
            )}
            <div className="font-mono text-[9px] text-[#17140F]/60 text-center">
              AUTO {COUNTDOWN_SEC}-SECOND TIMER PER SHOT · {totalSlots} SHOTS AUTOMATICALLY
            </div>
          </div>
        </main>

        {/* ================= ZONE 3: RIGHT COLUMN - ACCESSORIES & EFFECTS ================= */}
        <aside
          className={`${
            mobileView === "decor" ? "flex" : "hidden"
          } lg:flex w-full min-w-0 h-full min-h-0 flex-col gap-2 rounded-2xl border-[2.5px] border-[#17140F] bg-white p-3 shadow-[3px_3px_0px_#17140F]`}
        >
          {/* Header with Tab Switcher */}
          <div className="flex flex-col gap-1.5 border-b border-[#17140F]/15 pb-2 shrink-0">
            <div className="flex rounded-xl border-[2px] border-[#17140F] bg-[#FAF7F0] p-0.5">
              <button
                onClick={() => setActiveDrawerTab("accessories")}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 font-mono text-xs font-bold cursor-pointer transition-all ${
                  activeDrawerTab === "accessories"
                    ? "bg-[#D4FF3D] text-[#17140F] shadow-xs"
                    : "text-[#17140F]/70 hover:bg-white"
                }`}
              >
                <Crown size={14} weight="bold" />
                <span>ACCESSORIES</span>
                {selectedAccessory !== "none" && (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FF3D9A]" />
                )}
              </button>
              <button
                onClick={() => setActiveDrawerTab("filters")}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 font-mono text-xs font-bold cursor-pointer transition-all ${
                  activeDrawerTab === "filters"
                    ? "bg-[#D4FF3D] text-[#17140F] shadow-xs"
                    : "text-[#17140F]/70 hover:bg-white"
                }`}
              >
                <Palette size={14} weight="bold" />
                <span>EFFECTS</span>
                {selectedFilter !== "none" && (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FF6B4A]" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between font-mono text-[9px] text-[#17140F]/70 px-0.5">
              <span>
                {activeDrawerTab === "accessories"
                  ? "LIVE AR HEAD TRACKING"
                  : "ANALOG FILM TONES"}
              </span>
              <span className="font-bold text-[#17140F]">
                {activeDrawerTab === "accessories"
                  ? selectedAccessory.toUpperCase().replace("-", " ")
                  : activeFilter.name.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Content Area: Grid filling the space without empty gaps */}
          <div className="flex-1 min-h-0 overflow-y-auto pr-1 flex flex-col gap-2">
            {activeDrawerTab === "accessories" ? (
              <div className="grid grid-cols-2 gap-2">
                {ACCESSORY_DEFINITIONS.map((acc) => {
                  const isSelected = selectedAccessory === acc.id;
                  return (
                    <button
                      key={acc.id}
                      disabled={isSequenceRunning}
                      onClick={() => setSelectedAccessory(acc.id)}
                      className={`flex flex-col items-center justify-center text-center p-2.5 rounded-xl border-[2px] transition-all cursor-pointer ${
                        isSelected
                          ? "border-[#17140F] bg-[#FFF9E6] shadow-[2px_2px_0px_#17140F] scale-[1.02]"
                          : "border-[#17140F]/20 bg-[#FAF7F0] hover:border-[#17140F] hover:bg-white"
                      } ${isSequenceRunning ? "opacity-40 cursor-not-allowed" : ""}`}
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-[#17140F]/15 mb-1.5 shadow-xs">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill={acc.iconColor}
                          className="flex-shrink-0"
                        >
                          <path d={acc.svgIcon} />
                        </svg>
                      </div>

                      <span className="font-mono text-xs font-bold text-[#17140F]">
                        {acc.name}
                      </span>
                      <span className="rounded bg-black/5 px-1.5 py-[0.2rem] font-mono text-[8px] font-black text-[#17140F]/70 mt-0.5">
                        {acc.badge}
                      </span>
                      <span className="font-manrope text-[9px] text-[#17140F]/60 mt-1 line-clamp-1">
                        {acc.shortDesc}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {PHOTO_FILTERS.map((filter) => {
                  const isSelected = selectedFilter === filter.id;
                  return (
                    <button
                      key={filter.id}
                      disabled={isSequenceRunning}
                      onClick={() => setSelectedFilter(filter.id)}
                      className={`flex flex-col items-center justify-center text-center p-2.5 rounded-xl border-[2px] transition-all cursor-pointer ${
                        isSelected
                          ? "border-[#17140F] bg-[#FFF9E6] shadow-[2px_2px_0px_#17140F] scale-[1.02]"
                          : "border-[#17140F]/20 bg-[#FAF7F0] hover:border-[#17140F] hover:bg-white"
                      } ${isSequenceRunning ? "opacity-40 cursor-not-allowed" : ""}`}
                    >
                      <div
                        className="h-9 w-full rounded-lg border border-[#17140F]/20 mb-1.5"
                        style={{
                          background:
                            filter.id === "bw"
                              ? "linear-gradient(135deg, #333, #aaa)"
                              : filter.id === "warm"
                              ? "linear-gradient(135deg, #fce4b8, #e59866)"
                              : filter.id === "vivid"
                              ? "linear-gradient(135deg, #ff9a9e, #fecfef)"
                              : filter.id === "pastel"
                              ? "linear-gradient(135deg, #e0c3fc, #8ec5fc)"
                              : filter.id === "noir"
                              ? "linear-gradient(135deg, #000, #434343)"
                              : filter.id === "cyber"
                              ? "linear-gradient(135deg, #ff007f, #00f0ff)"
                              : filter.id === "vintage"
                              ? "linear-gradient(135deg, #d4a373, #faedcd)"
                              : "linear-gradient(135deg, #fff, #ddd)",
                        }}
                      />
                      <span className="font-mono text-xs font-bold text-[#17140F]">
                        {filter.name}
                      </span>
                      <span className="font-manrope text-[9px] text-[#17140F]/60 mt-0.5 line-clamp-1">
                        {filter.shortDesc || "Analog tone"}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Panel Footer Information */}
          <div className="mt-auto pt-2 border-t border-[#17140F]/15 flex flex-col gap-1 shrink-0">
            <div className="flex items-center justify-between rounded-lg border border-[#17140F]/15 bg-[#FAF7F0] px-2.5 py-1.5">
              <div className="flex items-center gap-1.5 font-mono text-[9px] text-[#17140F]">
                <span
                  className={`h-2 w-2 rounded-full ${
                    activeDrawerTab === "accessories"
                      ? isModelLoading
                        ? "bg-[#D9A441] animate-pulse"
                        : isModelReady
                        ? "bg-[#D4FF3D]"
                        : "bg-[#8A9A7E]"
                      : "bg-[#FF6B4A]"
                  }`}
                />
                <span>
                  {activeDrawerTab === "accessories"
                    ? isModelLoading
                      ? "Loading AR..."
                      : isModelReady
                      ? "AR Tracking Ready"
                      : "AR Initialized"
                    : `Filter: ${activeFilter.name}`}
                </span>
              </div>
              <span className="font-mono text-[8px] font-bold text-[#17140F]/60">
                BAKED INTO SNAPS
              </span>
            </div>
          </div>
        </aside>

      </div>
    </BoothShell>
  );
}
