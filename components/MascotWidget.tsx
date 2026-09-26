"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useMascot, MascotClipName } from "@/context/MascotContext";

interface MascotWidgetProps {
  /** Optional override to force the canvas chroma-key fallback path (useful for testing on Chrome/Edge) */
  forceCanvasFallback?: boolean;
}

// Detect WebKit / Safari engines (which do not support alpha in WebM)
function detectWebKitOrSafari(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
  return isIOS || isSafari;
}

export function MascotWidget({ forceCanvasFallback = false }: MascotWidgetProps) {
  const { activeClip, isOneShot, notifyEnded } = useMascot();

  const [useCanvasFallback, setUseCanvasFallback] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [mounted, setMounted] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fallbackVideoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Detect environment on mount
  useEffect(() => {
    setMounted(true);
    const isWebKit = detectWebKitOrSafari();
    setUseCanvasFallback(forceCanvasFallback || isWebKit);

    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mql.matches);

    const handleMqlChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mql.addEventListener("change", handleMqlChange);
    return () => mql.removeEventListener("change", handleMqlChange);
  }, [forceCanvasFallback]);

  // Handle video element playback when activeClip changes (Native WebM path)
  useEffect(() => {
    if (prefersReducedMotion || useCanvasFallback) return;

    const video = videoRef.current;
    if (!video) return;

    video.currentTime = 0;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay may be deferred until user interaction on strict policies
      });
    }
  }, [activeClip, prefersReducedMotion, useCanvasFallback]);

  // Handle fallback video element playback when activeClip changes (Safari canvas fallback)
  useEffect(() => {
    if (prefersReducedMotion || !useCanvasFallback) return;

    const fallbackVideo = fallbackVideoRef.current;
    if (!fallbackVideo) return;

    fallbackVideo.currentTime = 0;
    const playPromise = fallbackVideo.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Suppress benign unhandled play rejection
      });
    }
  }, [activeClip, prefersReducedMotion, useCanvasFallback]);

  // Reduced motion timer: if a one-shot was requested, return to idle after duration
  useEffect(() => {
    if (!prefersReducedMotion || !isOneShot) return;

    const duration = activeClip === "wave" ? 3800 : 3800;
    const timer = setTimeout(() => {
      notifyEnded(activeClip);
    }, duration);

    return () => clearTimeout(timer);
  }, [prefersReducedMotion, isOneShot, activeClip, notifyEnded]);

  // Canvas Chroma-Key Render Loop (Safari / WebKit fallback)
  const renderCanvasFrame = useCallback(() => {
    const video = fallbackVideoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    if (video.readyState >= 2 && !video.paused && !video.ended) {
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (ctx) {
        const cw = canvas.width;
        const ch = canvas.height;

        ctx.drawImage(video, 0, 0, cw, ch);
        const frame = ctx.getImageData(0, 0, cw, ch);
        const data = frame.data;
        const len = data.length;

        // Key out neutral grey background using YUV chrominance distance
        // U = -0.14713 * R - 0.28886 * G + 0.436 * B
        // V =  0.615 * R - 0.51499 * G - 0.10001 * B
        // For neutral grey (R ≈ G ≈ B), U ≈ 0, V ≈ 0, so chroma dist ≈ 0.
        // Soft-edge tolerance: low = 5.0, high = 10.0 (squared: 25.0 to 100.0)
        for (let i = 0; i < len; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          const u = -0.14713 * r - 0.28886 * g + 0.436 * b;
          const v = 0.615 * r - 0.51499 * g - 0.10001 * b;
          const distSq = u * u + v * v;

          if (distSq <= 25.0) {
            // Background: fully transparent
            data[i + 3] = 0;
          } else if (distSq < 100.0) {
            // Soft-edge feathering
            const dist = Math.sqrt(distSq);
            const factor = (dist - 5.0) / 5.0;
            data[i + 3] = Math.round(data[i + 3] * factor);
          }
          // distSq >= 100.0 remains 100% opaque
        }

        ctx.putImageData(frame, 0, 0);
      }
    }

    animFrameIdRef.current = requestAnimationFrame(renderCanvasFrame);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || !useCanvasFallback) {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      return;
    }

    animFrameIdRef.current = requestAnimationFrame(renderCanvasFrame);
    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [prefersReducedMotion, useCanvasFallback, renderCanvasFrame]);

  // Source path helpers
  const webmSrc = `/mascot/${activeClip}.webm`;
  const mp4FallbackSrc = `/mascot/raw/${activeClip}.mp4`;
  const posterSrc = `/mascot/poster/${activeClip}.png`;
  const preloadMode = activeClip === "idle-loop" ? "auto" : "metadata";

  const handleEnded = () => {
    if (isOneShot) {
      notifyEnded(activeClip);
    }
  };

  if (!mounted) {
    // Avoid hydration mismatch while reading user-agent / matchMedia
    return null;
  }

  return (
    <aside
      aria-label="MikuaBooth Blip Mascot"
      className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 z-30 pointer-events-none select-none"
    >
      <div
        className="relative w-24 sm:w-28 md:w-36 lg:w-40 aspect-[16/9] transition-transform duration-300 ease-out"
        style={{
          // Warm ink drop-shadow to ground the mascot without an opaque badge background
          filter: "drop-shadow(0 8px 18px rgba(34, 31, 27, 0.16))",
        }}
      >
        {prefersReducedMotion ? (
          /* Reduced Motion: Static transparent poster PNG */
          <img
            key={`reduced-${activeClip}`}
            src={posterSrc}
            alt="Blip, the MikuaBooth mascot"
            className="w-full h-full object-contain"
            width={320}
            height={180}
          />
        ) : useCanvasFallback ? (
          /* Safari/WebKit Fallback: Visible Canvas driven by Offscreen Video */
          <>
            <video
              ref={fallbackVideoRef}
              key={`fallback-vid-${activeClip}`}
              src={mp4FallbackSrc}
              poster={posterSrc}
              preload={preloadMode}
              autoPlay
              loop={!isOneShot}
              muted
              playsInline
              onEnded={handleEnded}
              className="hidden pointer-events-none"
              tabIndex={-1}
              aria-hidden="true"
            />
            <canvas
              ref={canvasRef}
              width={320}
              height={180}
              className="w-full h-full object-contain pointer-events-none"
              aria-hidden="true"
            />
          </>
        ) : (
          /* Native Path: WebM with alpha channel (Chrome, Firefox, Edge) */
          <video
            ref={videoRef}
            key={`native-vid-${activeClip}`}
            src={webmSrc}
            poster={posterSrc}
            preload={preloadMode}
            autoPlay
            loop={!isOneShot}
            muted
            playsInline
            onEnded={handleEnded}
            className="w-full h-full object-contain pointer-events-none"
            aria-hidden="true"
          />
        )}
      </div>
    </aside>
  );
}
