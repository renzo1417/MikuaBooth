"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";

export interface DetectedFace {
  /** Normalized 0 - 1 coordinates */
  normalizedAnchorX: number;
  normalizedAnchorY: number;
  normalizedFaceWidth: number;
  rollAngle: number; // in radians
}

export interface UseFaceLandmarksOptions {
  videoElement: HTMLVideoElement | null;
  isReady: boolean;
  isMirrored?: boolean;
  enabled?: boolean;
  isDemoMode?: boolean;
}

export interface UseFaceLandmarksReturn {
  detectedFace: DetectedFace | null;
  isModelLoading: boolean;
  isModelReady: boolean;
  error: string | null;
  toCanvasCoords: (
    face: DetectedFace,
    width: number,
    height: number,
    isMirrored?: boolean
  ) => { anchorX: number; anchorY: number; faceWidth: number; rollAngle: number };
}

// Global cached landmarker instance so we don't re-download or re-instantiate wasm
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cachedFaceLandmarker: any = null;
let landmarkerPromise: Promise<unknown> | null = null;

export function useFaceLandmarks({
  videoElement,
  isReady,
  isMirrored = true,
  enabled = true,
  isDemoMode = false,
}: UseFaceLandmarksOptions): UseFaceLandmarksReturn {
  const [detectedFace, setDetectedFace] = useState<DetectedFace | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [isModelReady, setIsModelReady] = useState(Boolean(cachedFaceLandmarker));
  const [error, setError] = useState<string | null>(null);

  const requestRef = useRef<number | null>(null);
  const lastVideoTimeRef = useRef<number>(-1);
  const frameCountRef = useRef<number>(0);

  const demoFace: DetectedFace = useMemo(
    () => ({
      normalizedAnchorX: 0.5,
      normalizedAnchorY: 0.255, // Forehead of demo portrait
      normalizedFaceWidth: 0.32,
      rollAngle: 0,
    }),
    []
  );

  const fallbackFace: DetectedFace = useMemo(
    () => ({
      normalizedAnchorX: 0.5,
      normalizedAnchorY: 0.28,
      normalizedFaceWidth: 0.35,
      rollAngle: 0,
    }),
    []
  );

  // Pre-warm and initialize MediaPipe FaceLandmarker as soon as camera is active
  useEffect(() => {
    if (isDemoMode || cachedFaceLandmarker) return;

    let isMounted = true;

    const initLandmarker = async () => {
      try {
        if (isMounted) {
          setIsModelLoading(true);
        }
        if (!landmarkerPromise) {
          landmarkerPromise = (async () => {
            const { FilesetResolver, FaceLandmarker } = await import(
              "@mediapipe/tasks-vision"
            );
            // Try local /wasm first for instant zero-latency loading, with CDN fallback
            let vision;
            try {
              const localWasmPath =
                typeof window !== "undefined"
                  ? `${window.location.origin}/wasm`
                  : "/wasm";
              vision = await FilesetResolver.forVisionTasks(localWasmPath);
            } catch {
              vision = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm"
              );
            }

            const modelAssetPath =
              "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

            // Try GPU delegate first, fallback to CPU delegate if WebGL fails
            try {
              return await FaceLandmarker.createFromOptions(vision, {
                baseOptions: {
                  modelAssetPath,
                  delegate: "GPU",
                },
                outputFaceBlendshapes: false,
                outputFacialTransformationMatrixes: false,
                runningMode: "VIDEO",
                numFaces: 1,
              });
            } catch (gpuErr) {
              console.warn(
                "MediaPipe FaceLandmarker GPU delegate failed, falling back to CPU:",
                gpuErr
              );
              return await FaceLandmarker.createFromOptions(vision, {
                baseOptions: {
                  modelAssetPath,
                  delegate: "CPU",
                },
                outputFaceBlendshapes: false,
                outputFacialTransformationMatrixes: false,
                runningMode: "VIDEO",
                numFaces: 1,
              });
            }
          })();
        }

        const landmarker = await landmarkerPromise;
        cachedFaceLandmarker = landmarker;

        if (isMounted) {
          setIsModelReady(true);
          setIsModelLoading(false);
        }
      } catch (err) {
        console.warn("MediaPipe FaceLandmarker unavailable, using graceful fallback:", err);
        landmarkerPromise = null;
        if (isMounted) {
          setError("AR face tracking unavailable in this browser/environment.");
          setIsModelLoading(false);
          setIsModelReady(false);
        }
      }
    };

    initLandmarker();

    return () => {
      isMounted = false;
    };
  }, [isDemoMode]);

  // Real-time continuous detection loop - runs whenever camera video is active
  useEffect(() => {
    if (isDemoMode) return;

    if (!isReady || !videoElement || !cachedFaceLandmarker) {
      return;
    }

    let isRunning = true;

    const detectFrame = () => {
      if (!isRunning) return;

      frameCountRef.current += 1;

      // Throttle: process every 2nd animation frame (~30fps) for high performance
      if (frameCountRef.current % 2 === 0) {
        try {
          if (
            videoElement.readyState >= 2 &&
            videoElement.videoWidth > 0 &&
            videoElement.videoHeight > 0 &&
            videoElement.currentTime !== lastVideoTimeRef.current &&
            !videoElement.paused &&
            !videoElement.ended
          ) {
            lastVideoTimeRef.current = videoElement.currentTime;

            const results = cachedFaceLandmarker.detectForVideo(
              videoElement,
              performance.now()
            );

            if (results?.faceLandmarks && results.faceLandmarks.length > 0) {
              const landmarks = results.faceLandmarks[0];

              // Landmark 10: Top of forehead center (Anchor for ears / crowns / hats / stars / hearts)
              const forehead = landmarks[10];

              // Temple landmarks to compute face width: 234 (left) and 454 (right)
              const leftTemple = landmarks[234];
              const rightTemple = landmarks[454];

              // Eye landmarks to compute head tilt / roll angle: 33 (left eye outer) and 263 (right eye outer)
              const leftEye = landmarks[33];
              const rightEye = landmarks[263];

              if (forehead && leftTemple && rightTemple && leftEye && rightEye) {
                const dxFace = rightTemple.x - leftTemple.x;
                const dyFace = rightTemple.y - leftTemple.y;
                const faceWidth = Math.sqrt(dxFace * dxFace + dyFace * dyFace);

                const dxEye = rightEye.x - leftEye.x;
                const dyEye = rightEye.y - leftEye.y;
                const rollAngle = Math.atan2(dyEye, dxEye);

                setDetectedFace({
                  normalizedAnchorX: forehead.x,
                  normalizedAnchorY: forehead.y,
                  normalizedFaceWidth: faceWidth,
                  rollAngle: rollAngle,
                });
              }
            } else {
              // No face detected in this frame
              // Keep previous face for brief moment to avoid jitter/flicker
            }
          }
        } catch {
          // Graceful handling of frame detection hiccups
        }
      }

      requestRef.current = requestAnimationFrame(detectFrame);
    };

    requestRef.current = requestAnimationFrame(detectFrame);

    return () => {
      isRunning = false;
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [enabled, isReady, videoElement, isDemoMode]);

  /**
   * Helper to convert normalized face landmark data to canvas pixel space
   */
  const toCanvasCoords = useCallback(
    (
      face: DetectedFace,
      targetWidth: number,
      targetHeight: number,
      mirrored: boolean = isMirrored
    ) => {
      const anchorX = (mirrored ? 1 - face.normalizedAnchorX : face.normalizedAnchorX) * targetWidth;
      const anchorY = face.normalizedAnchorY * targetHeight;
      const faceWidth = face.normalizedFaceWidth * targetWidth;
      const rollAngle = mirrored ? -face.rollAngle : face.rollAngle;

      return {
        anchorX,
        anchorY,
        faceWidth,
        rollAngle,
      };
    },
    [isMirrored]
  );

  const canTrack = enabled && isReady && Boolean(videoElement);
  const activeDetectedFace = isDemoMode
    ? enabled
      ? demoFace
      : null
    : canTrack
    ? detectedFace || (isModelReady ? null : fallbackFace)
    : null;

  return {
    detectedFace: activeDetectedFace,
    isModelLoading,
    isModelReady: isDemoMode ? true : isModelReady,
    error,
    toCanvasCoords,
  };
}
