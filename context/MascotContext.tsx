"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from "react";

export type MascotClipName = "idle-loop" | "wave" | "flash-reaction";

export interface MascotContextType {
  activeClip: MascotClipName;
  isOneShot: boolean;
  playOnce: (clipName: "wave" | "flash-reaction") => void;
  notifyEnded: (clipName: MascotClipName) => void;
}

const MascotContext = createContext<MascotContextType | null>(null);

export function MascotProvider({ children }: { children: React.ReactNode }) {
  const [activeClip, setActiveClip] = useState<MascotClipName>("idle-loop");
  const [isOneShot, setIsOneShot] = useState(false);
  const currentClipRef = useRef<MascotClipName>("idle-loop");

  const playOnce = useCallback((clipName: "wave" | "flash-reaction") => {
    // Newest request wins cleanly (interrupt any currently playing one-shot)
    currentClipRef.current = clipName;
    setIsOneShot(true);
    setActiveClip(clipName);
  }, []);

  const notifyEnded = useCallback((endedClip: MascotClipName) => {
    // Only revert to idle-loop if the ended clip matches what is currently playing
    if (currentClipRef.current === endedClip) {
      currentClipRef.current = "idle-loop";
      setIsOneShot(false);
      setActiveClip("idle-loop");
    }
  }, []);

  return (
    <MascotContext.Provider
      value={{
        activeClip,
        isOneShot,
        playOnce,
        notifyEnded,
      }}
    >
      {children}
    </MascotContext.Provider>
  );
}

export function useMascot(): MascotContextType {
  const context = useContext(MascotContext);
  if (!context) {
    // Return a safe no-op fallback if used outside provider
    return {
      activeClip: "idle-loop",
      isOneShot: false,
      playOnce: () => {},
      notifyEnded: () => {},
    };
  }
  return context;
}
