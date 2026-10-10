"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { getFilterById } from "@/lib/filters";
import { drawAccessoryOnCanvas } from "@/lib/accessories";
import { DetectedFace } from "@/hooks/useFaceLandmarks";

export interface UseCameraCaptureReturn {
  videoRef: (node: HTMLVideoElement | null) => void;
  permissionState: "prompt" | "granted" | "denied" | "unsupported";
  errorMessage: string | null;
  isReady: boolean;
  facingMode: "user" | "environment";
  isMirrored: boolean;
  isDemoMode: boolean;
  startCamera: (mode?: "user" | "environment") => Promise<void>;
  stopCamera: () => void;
  toggleFacingMode: () => Promise<void>;
  toggleMirror: () => void;
  setDemoMode: (enabled: boolean) => void;
  captureFrame: (
    filterId: string,
    accessoryId?: string,
    faceData?: DetectedFace | null
  ) => Promise<string>;
  generateDemoFrame: (
    shotIndex: number,
    filterId: string,
    accessoryId?: string
  ) => string;
}

export function useCameraCapture(): UseCameraCaptureReturn {
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [permissionState, setPermissionState] = useState<
    "prompt" | "granted" | "denied" | "unsupported"
  >("prompt");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [isMirrored, setIsMirrored] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const videoRef = useCallback((node: HTMLVideoElement | null) => {
    videoElementRef.current = node;
    if (node && streamRef.current) {
      node.srcObject = streamRef.current;
      node.playsInline = true;
      node.muted = true;
      node
        .play()
        .then(() => {
          setIsReady(true);
          setPermissionState("granted");
        })
        .catch(() => {});
    }
  }, [setIsReady, setPermissionState]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoElementRef.current) {
      videoElementRef.current.srcObject = null;
    }
    setIsReady(false);
  }, []);

  const startCamera = useCallback(async (overrideMode?: "user" | "environment") => {
    const activeMode = overrideMode ?? facingMode;
    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setPermissionState("unsupported");
      setErrorMessage("Camera access is not supported by your browser or environment.");
      return;
    }

    try {
      stopCamera();
      setErrorMessage(null);

      // Request High-Definition video stream with graceful fallbacks
      let stream: MediaStream;
      const hdConstraints: MediaStreamConstraints = {
        audio: false,
        video: {
          facingMode: activeMode,
          width: { ideal: 1920, min: 1280 },
          height: { ideal: 1080, min: 720 },
          frameRate: { ideal: 30, max: 60 },
        },
      };

      try {
        stream = await navigator.mediaDevices.getUserMedia(hdConstraints);
      } catch {
        // Fallback for webcams that don't satisfy strict min bounds
        const fallbackConstraints: MediaStreamConstraints = {
          audio: false,
          video: {
            facingMode: activeMode,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        };
        stream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
      }
      streamRef.current = stream;

      if (videoElementRef.current) {
        const video = videoElementRef.current;
        video.srcObject = stream;
        video.playsInline = true;
        video.muted = true;

        await new Promise<void>((resolve) => {
          let resolved = false;
          const onReady = () => {
            if (resolved) return;
            resolved = true;
            video
              .play()
              .then(() => {
                setIsReady(true);
                setPermissionState("granted");
                resolve();
              })
              .catch((err) => {
                console.warn("Video play error:", err);
                setIsReady(true);
                setPermissionState("granted");
                resolve();
              });
          };

          if (video.readyState >= 1) {
            onReady();
          } else {
            video.onloadedmetadata = () => onReady();
            // Fallback timeout in case onloadedmetadata doesn't fire
            setTimeout(onReady, 1000);
          }
        });
      }
    } catch (err: unknown) {
      console.warn("Camera start error:", err);
      const error = err as Error;
      if (
        error.name === "NotAllowedError" ||
        error.name === "PermissionDeniedError"
      ) {
        setPermissionState("denied");
        setErrorMessage("Camera permission was denied. You can enable it in browser settings or try Demo Snaps mode.");
      } else if (
        error.name === "NotFoundError" ||
        error.name === "DevicesNotFoundError"
      ) {
        setPermissionState("unsupported");
        setErrorMessage("No camera hardware was detected on this device.");
      } else {
        setPermissionState("denied");
        setErrorMessage(error.message || "Failed to start camera feed.");
      }
      setIsReady(false);
    }
  }, [facingMode, stopCamera]);

  const toggleFacingMode = useCallback(async () => {
    const nextMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(nextMode);
    setIsMirrored(nextMode === "user");
    // Restart the stream so the new facingMode takes effect.
    await startCamera(nextMode);
  }, [facingMode, startCamera]);

  const toggleMirror = useCallback(() => {
    setIsMirrored((prev) => !prev);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  /**
   * Generates a stylized simulated photo for testing/demo mode
   */
  const generateDemoFrame = useCallback(
    (shotIndex: number, filterId: string, accessoryId: string = "none"): string => {
      if (typeof window === "undefined") return "";

      const canvas = document.createElement("canvas");
      canvas.width = 900;
      canvas.height = 1200; // 3:4 ratio
      const ctx = canvas.getContext("2d");
      if (!ctx) return "";

      const filter = getFilterById(filterId);
      if (filter.cssFilter !== "none") {
        ctx.filter = filter.cssFilter;
      }

      // Artistic gradient background
      const palettes = [
        ["#F2D7D0", "#E4A89B", "#D16B58"], // Warm peach / terracotta
        ["#D4E0D2", "#A6BFA2", "#688464"], // Sage olive
        ["#D5E0EA", "#A0B8CD", "#4E6F89"], // Dusty vintage blue
        ["#F5E6CC", "#E5C88F", "#C49746"], // Golden hour
        ["#FAD0EC", "#E599D0", "#B24C98"], // K-pop lilac pink
        ["#E2F0D9", "#C1E1B2", "#7FA66F"], // Fresh matcha
        ["#FFE5CC", "#FFB380", "#E66020"], // Tangerine pop
        ["#D4F0F0", "#80D4D4", "#2A9D8F"], // Mint aqua
      ];
      const palette = palettes[shotIndex % palettes.length];

      const grad = ctx.createLinearGradient(0, 0, 900, 1200);
      grad.addColorStop(0, palette[0]);
      grad.addColorStop(0.5, palette[1]);
      grad.addColorStop(1, palette[2]);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 900, 1200);

      // Subtle geometric art / silhouette background halo
      ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
      ctx.beginPath();
      ctx.arc(450, 480, 280, 0, Math.PI * 2);
      ctx.fill();

      // Portrait silhouette
      ctx.fillStyle = "#17140F";
      ctx.beginPath();
      ctx.arc(450, 450, 145, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(450, 780, 290, 200, 0, 0, Math.PI, true);
      ctx.fill();

      // Facial expressions and accessories based on shotIndex % 8
      const poseType = shotIndex % 8;
      ctx.fillStyle = "#FAF7F0";

      if (poseType === 0) {
        // Wink eye & smile
        ctx.fillRect(380, 430, 36, 12);
        ctx.beginPath();
        ctx.arc(520, 436, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(450, 490, 40, 0.2, Math.PI - 0.2);
        ctx.lineWidth = 10;
        ctx.strokeStyle = "#FAF7F0";
        ctx.stroke();
      } else if (poseType === 1) {
        // Big round eyes & cheerful open smile
        ctx.beginPath();
        ctx.arc(400, 436, 16, 0, Math.PI * 2);
        ctx.arc(500, 436, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(450, 480, 50, 0, Math.PI);
        ctx.fill();
        // Star cheek
        ctx.fillStyle = "#D4FF3D";
        ctx.fillRect(360, 470, 16, 16);
      } else if (poseType === 2) {
        // Heart cheeks & blush
        ctx.beginPath();
        ctx.arc(400, 430, 20, 0, Math.PI * 2);
        ctx.arc(500, 430, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#FF3D9A";
        ctx.beginPath();
        ctx.arc(360, 490, 26, 0, Math.PI * 2);
        ctx.arc(540, 490, 26, 0, Math.PI * 2);
        ctx.fill();
      } else if (poseType === 3) {
        // Cool sunglasses
        ctx.fillStyle = "#17140F";
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.roundRect(360, 415, 75, 45, 10);
        ctx.roundRect(465, 415, 75, 45, 10);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(435, 435);
        ctx.lineTo(465, 435);
        ctx.stroke();
        // Smirk
        ctx.fillStyle = "#FAF7F0";
        ctx.beginPath();
        ctx.arc(460, 490, 25, 0.2, Math.PI - 0.5);
        ctx.lineWidth = 8;
        ctx.strokeStyle = "#FAF7F0";
        ctx.stroke();
      } else if (poseType === 4) {
        // Kitty whiskers and ears
        ctx.beginPath();
        ctx.arc(400, 435, 16, 0, Math.PI * 2);
        ctx.arc(500, 435, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#FF6B4A";
        ctx.beginPath();
        ctx.arc(450, 475, 12, 0, Math.PI * 2);
        ctx.fill();
        // Whiskers
        ctx.strokeStyle = "#FAF7F0";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(330, 470);
        ctx.lineTo(380, 475);
        ctx.moveTo(330, 490);
        ctx.lineTo(380, 485);
        ctx.moveTo(520, 475);
        ctx.lineTo(570, 470);
        ctx.moveTo(520, 485);
        ctx.lineTo(570, 490);
        ctx.stroke();
      } else if (poseType === 5) {
        // Double peace sign sparkles
        ctx.beginPath();
        ctx.arc(400, 430, 18, 0, Math.PI * 2);
        ctx.arc(500, 430, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(450, 480, 36, 0, Math.PI);
        ctx.fill();
        // Little sparkles
        ctx.fillStyle = "#D4FF3D";
        ctx.beginPath();
        ctx.arc(280, 380, 24, 0, Math.PI * 2);
        ctx.arc(620, 380, 24, 0, Math.PI * 2);
        ctx.fill();
      } else if (poseType === 6) {
        // Soft smile with flower cheeks
        ctx.beginPath();
        ctx.arc(400, 435, 16, 0, Math.PI * 2);
        ctx.arc(500, 435, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(450, 485, 30, 0, Math.PI);
        ctx.fill();
        ctx.fillStyle = "#FFD166";
        ctx.beginPath();
        ctx.arc(360, 490, 20, 0, Math.PI * 2);
        ctx.arc(540, 490, 20, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Star eyes
        ctx.fillStyle = "#FF3D9A";
        ctx.beginPath();
        ctx.arc(400, 430, 20, 0, Math.PI * 2);
        ctx.arc(500, 430, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#FAF7F0";
        ctx.beginPath();
        ctx.arc(450, 485, 45, 0, Math.PI);
        ctx.fill();
      }

      // Draw active accessory on demo avatar head if selected
      if (accessoryId && accessoryId !== "none") {
        drawAccessoryOnCanvas(ctx, accessoryId, 450, 305, 290, 0);
      }

      // Stamp indicator in JetBrains Mono
      ctx.font = "bold 32px monospace";
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.textAlign = "center";
      ctx.fillText(`SNAP #${shotIndex + 1} · MIKUABOOTH`, 450, 1080);

      return canvas.toDataURL("image/jpeg", 0.95);
    },
    []
  );

  /**
   * Captures current frame from live video feed into 3:4 aspect ratio canvas,
   * baking the active filter and any AR tracked face accessory directly into pixel data.
   */
  const captureFrame = useCallback(
    async (
      filterId: string,
      accessoryId: string = "none",
      faceData?: DetectedFace | null
    ): Promise<string> => {
      const video = videoElementRef.current;
      if (!video || !isReady || video.videoWidth === 0) {
        throw new Error("Video stream not ready for capture");
      }

      const canvas = document.createElement("canvas");
      // Output high-resolution 3:4 portrait photo (1500x2000)
      const targetWidth = 1500;
      const targetHeight = 2000;
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not initialize 2D canvas context");

      // Enable high-quality smoothing for crisp downsampling/scaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Apply baked analog filter
      const filter = getFilterById(filterId);
      if (filter.cssFilter !== "none") {
        ctx.filter = filter.cssFilter;
      }

      // Calculate source crop for 3:4 portrait
      const vw = video.videoWidth;
      const vh = video.videoHeight;
      const targetRatio = 3 / 4;
      const sourceRatio = vw / vh;

      let sx = 0;
      let sy = 0;
      let sWidth = vw;
      let sHeight = vh;

      if (sourceRatio > targetRatio) {
        // Video is wider than 3:4; crop horizontal sides
        sWidth = vh * targetRatio;
        sx = (vw - sWidth) / 2;
      } else {
        // Video is taller than 3:4; crop vertical top/bottom
        sHeight = vw / targetRatio;
        sy = (vh - sHeight) / 2;
      }

      ctx.save();
      if (isMirrored) {
        // Flip horizontally to match live preview
        ctx.translate(targetWidth, 0);
        ctx.scale(-1, 1);
      }

      ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);
      ctx.restore();

      // Reset filter before drawing vector accessories so accessory colors remain vibrant
      ctx.filter = "none";

      // Draw tracked accessory directly into canvas pixel data
      if (accessoryId && accessoryId !== "none") {
        if (faceData) {
          // Map raw video normalized landmark coords to cropped 3:4 canvas
          const rawX = faceData.normalizedAnchorX * vw;
          const rawY = faceData.normalizedAnchorY * vh;
          const croppedX = rawX - sx;
          const croppedY = rawY - sy;
          let canvasX = (croppedX / sWidth) * targetWidth;
          const canvasY = (croppedY / sHeight) * targetHeight;
          const canvasFaceWidth =
            ((faceData.normalizedFaceWidth * vw) / sWidth) * targetWidth;
          let canvasRoll = faceData.rollAngle;

          if (isMirrored) {
            canvasX = targetWidth - canvasX;
            canvasRoll = -canvasRoll;
          }

          drawAccessoryOnCanvas(
            ctx,
            accessoryId,
            canvasX,
            canvasY,
            canvasFaceWidth,
            canvasRoll
          );
        } else {
          // Graceful fallback placement if no face landmark frame was caught at shutter click
          const fallbackX = targetWidth / 2;
          const fallbackY = targetHeight * 0.28;
          const fallbackWidth = targetWidth * 0.36;
          drawAccessoryOnCanvas(
            ctx,
            accessoryId,
            fallbackX,
            fallbackY,
            fallbackWidth,
            0
          );
        }
      }

      return canvas.toDataURL("image/jpeg", 0.98);
    },
    [isReady, isMirrored]
  );

  return {
    videoRef,
    permissionState,
    errorMessage,
    isReady,
    facingMode,
    isMirrored,
    isDemoMode,
    startCamera,
    stopCamera,
    toggleFacingMode,
    toggleMirror,
    setDemoMode: setIsDemoMode,
    captureFrame,
    generateDemoFrame,
  };
}
