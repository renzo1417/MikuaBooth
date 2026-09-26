"use client";

import React, { useEffect } from "react";
import {
  Camera,
  Sparkle,
  FilmStrip,
  ArrowRight,
  Heart,
  Star,
  HandPeace,
  Sunglasses,
} from "@phosphor-icons/react";
import { useMascot } from "@/context/MascotContext";
import { BoothShell } from "@/components/BoothShell";

interface StartScreenProps {
  onStart: () => void;
  onTryDemo: () => void;
}

export function StartScreen({ onStart, onTryDemo }: StartScreenProps) {
  const { playOnce } = useMascot();

  useEffect(() => {
    const timer = setTimeout(() => {
      playOnce("wave");
    }, 1000);
    return () => clearTimeout(timer);
  }, [playOnce]);

  return (
    <BoothShell
      variant="fixed"
      className="px-4 py-3 sm:py-4 md:px-8 md:py-4 overflow-x-hidden overflow-y-auto lg:overflow-y-hidden select-none"
      header={
        <>
          {/* Brand Lockup */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border-[2px] border-[#17140F] bg-[#D4FF3D] shadow-[2px_2px_0px_#17140F]">
            <Camera size={20} weight="bold" className="text-[#17140F]" />
          </div>
          <div>
            <span className="block font-fredoka text-lg sm:text-xl font-bold tracking-tight text-[#17140F] leading-none">
              MikuaBooth
            </span>
            <span className="block font-mono text-[8px] sm:text-[9px] font-extrabold uppercase tracking-widest text-[#17140F]/70 mt-0.5">
              SEOUL 4-CUTS &amp; Y2K KIOSK
            </span>
          </div>
        </div>

        {/* Live Status Pill */}
        <div className="flex items-center gap-2 rounded-full border-[2px] border-[#17140F] bg-white px-3 py-1 font-mono text-[11px] sm:text-xs font-bold text-[#17140F] shadow-[2px_2px_0px_#17140F]">
          <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-[#D4FF3D] border border-[#17140F] animate-pulse" />
          <span>BOOTH ONLINE</span>
        </div>
        </>
      }
      footer={
        <div className="flex w-full flex-col sm:flex-row items-center justify-between border-t-[2px] border-[#17140F] pt-2 sm:pt-2.5 text-[11px] font-mono font-bold text-[#17140F]/70 gap-1 shrink-0">
          <div className="flex items-center gap-2">
            <span>ZERO CLOUD STORAGE · 100% PRIVATE CLIENT-SIDE CANVAS</span>
          </div>
          <span>SEOUL 4-CUT EXPERIENCE</span>
        </div>
      }
    >
      {/* Hero Section */}
      <section className="my-auto flex w-full flex-col items-center justify-between gap-6 py-2 sm:py-3 lg:flex-row lg:items-center lg:gap-10 shrink min-h-0">
        {/* Left: Headline & Actions */}
        <div className="flex max-w-xl flex-col items-start text-left shrink">
          {/* Tag Pill */}
          <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-full border-[2px] border-[#17140F] bg-[#D4FF3D] px-3 py-0.5 font-mono text-[11px] sm:text-xs font-extrabold text-[#17140F] shadow-[2px_2px_0px_#17140F]">
            <Sparkle size={13} weight="fill" className="text-[#FF3D9A]" />
            <span>KOREAN PHOTO BOOTH STUDIO</span>
          </div>

          {/* Main Title in Fredoka */}
          <h1 className="font-fredoka text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-[#17140F] leading-[1.05]">
            Snap, Style &amp; <br />
            <span className="text-[#6C4FE0] underline decoration-[#D4FF3D] decoration-wavy decoration-3 underline-offset-6 sm:underline-offset-8">
              Keep the Moment.
            </span>
          </h1>

          {/* Subheading in Manrope */}
          <p className="mt-2.5 sm:mt-3 font-manrope text-xs sm:text-sm md:text-base leading-relaxed text-[#17140F]/80 max-w-[46ch]">
            Step inside a tactile Life4Cuts photo booth. Pick from 3, 4, 8, or 16-slot frames,
            capture burst snaps, swap or retake individual shots, stamp custom stickers, and download
            your physical keepsake card.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-4 sm:mt-5 flex w-full flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={onStart}
              className="kiosk-btn inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#FF6B4A] px-6 py-3 font-manrope text-sm sm:text-base font-extrabold tracking-wide text-white cursor-pointer shadow-[3px_3px_0px_#17140F]"
            >
              <Camera size={18} weight="bold" />
              <span>START BOOTH</span>
              <ArrowRight size={16} weight="bold" />
            </button>

            <button
              onClick={onTryDemo}
              className="kiosk-btn inline-flex items-center justify-center gap-2 rounded-xl border-[2px] border-[#17140F] bg-white px-5 py-3 font-manrope text-sm sm:text-base font-bold text-[#17140F] hover:bg-[#FAF7F0] cursor-pointer shadow-[3px_3px_0px_#17140F]"
            >
              <FilmStrip size={18} weight="bold" className="text-[#6C4FE0]" />
              <span>DEMO SNAPS</span>
            </button>
          </div>

          {/* Feature Highlights Grid */}
          <div className="mt-4 sm:mt-5 grid grid-cols-3 gap-2 w-full border-t-[2px] border-[#17140F]/20 pt-3">
            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-xs font-black text-[#17140F]">
                3 / 4 / 8 / 16
              </span>
              <span className="font-manrope text-[11px] text-[#17140F]/70">
                Frame templates
              </span>
            </div>

            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-xs font-black text-[#17140F]">
                SINGLE RETAKES
              </span>
              <span className="font-manrope text-[11px] text-[#17140F]/70">
                Redo any slot
              </span>
            </div>

            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-xs font-black text-[#17140F]">
                Y2K STICKERS
              </span>
              <span className="font-manrope text-[11px] text-[#17140F]/70">
                Vector stamps
              </span>
            </div>
          </div>
        </div>

        {/* Right: Tactile Physical Keepsake Card Mockup (2x2 Quad Format) */}
        <div className="relative flex items-center justify-center select-none pt-2 lg:pt-0 shrink-0">
          {/* Decorative Backdrop Shape */}
          <div className="absolute -inset-3 rounded-3xl bg-[#D4FF3D] border-[2.5px] border-[#17140F] shadow-[5px_5px_0px_#17140F] -rotate-3 -z-10" />

          {/* Depth Card Behind */}
          <div className="absolute -left-3 -bottom-3 w-60 sm:w-64 md:w-72 lg:w-80 -rotate-6 rounded-2xl border-[2.5px] border-[#17140F] bg-[#6C4FE0] p-3 shadow-[4px_4px_0px_#17140F] -z-5">
            <div className="flex items-center justify-between pb-1.5 border-b border-white/20">
              <span className="font-fredoka text-[9px] font-bold text-white">
                CLUB MIKUA
              </span>
              <span className="rounded bg-[#D4FF3D] border border-[#17140F] px-1 font-mono text-[7px] font-extrabold text-[#17140F]">
                LIMITED
              </span>
            </div>
            <div className="h-12 w-full flex items-center justify-center">
              <span className="font-mono text-[8px] text-white/80">
                ★ 2000 EDITION ARCHIVE ★
              </span>
            </div>
          </div>

          {/* Primary Keepsake Card: 2x2 Quad Layout */}
          <div className="relative w-60 sm:w-64 md:w-72 lg:w-80 rotate-2 rounded-2xl border-[3px] border-[#17140F] bg-[#FAF7F0] p-3 shadow-[5px_5px_0px_#17140F] transition-transform hover:rotate-0 duration-300 z-10">
            {/* Header Stamp */}
            <div className="mb-2 text-center border-b border-[#17140F]/15 pb-1.5">
              <span className="block font-fredoka text-xs font-bold text-[#17140F]">
                HONGDAE 4-CUTS
              </span>
              <span className="block font-mono text-[7px] text-[#17140F]/60">
                MIKUABOOTH · SEOUL 2X2 QUAD
              </span>
            </div>

            {/* 2x2 Photo Cut Windows */}
            <div className="grid grid-cols-2 gap-2">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md border-[1.5px] border-[#17140F] bg-[#F2D7D0]">
                <div className="h-full w-full bg-gradient-to-tr from-[#E4A89B] to-[#D16B58] flex items-center justify-center">
                  <div className="h-7 w-7 rounded-full bg-[#17140F] flex items-center justify-center">
                    <Sparkle size={14} weight="fill" className="text-white" aria-hidden="true" />
                  </div>
                </div>
                <span className="absolute top-1 left-1 rounded bg-black/60 px-1 font-mono text-[7px] font-bold text-white">
                  01
                </span>
              </div>

              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md border-[1.5px] border-[#17140F] bg-[#D4E0D2]">
                <div className="h-full w-full bg-gradient-to-tr from-[#A6BFA2] to-[#688464] flex items-center justify-center">
                  <div className="h-7 w-7 rounded-full bg-[#17140F] flex items-center justify-center">
                    <HandPeace size={14} weight="fill" className="text-white" aria-hidden="true" />
                  </div>
                </div>
                <span className="absolute top-1 left-1 rounded bg-black/60 px-1 font-mono text-[7px] font-bold text-white">
                  02
                </span>
              </div>

              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md border-[1.5px] border-[#17140F] bg-[#D5E0EA]">
                <div className="h-full w-full bg-gradient-to-tr from-[#A0B8CD] to-[#4E6F89] flex items-center justify-center">
                  <div className="h-7 w-7 rounded-full bg-[#17140F] flex items-center justify-center">
                    <Heart size={14} weight="fill" className="text-white" aria-hidden="true" />
                  </div>
                </div>
                <span className="absolute top-1 left-1 rounded bg-black/60 px-1 font-mono text-[7px] font-bold text-white">
                  03
                </span>
              </div>

              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md border-[1.5px] border-[#17140F] bg-[#F5E6CC]">
                <div className="h-full w-full bg-gradient-to-tr from-[#E5C88F] to-[#C49746] flex items-center justify-center">
                  <div className="h-7 w-7 rounded-full bg-[#17140F] flex items-center justify-center">
                    <Sunglasses size={14} weight="fill" className="text-white" aria-hidden="true" />
                  </div>
                </div>
                <span className="absolute top-1 left-1 rounded bg-black/60 px-1 font-mono text-[7px] font-bold text-white">
                  04
                </span>
              </div>
            </div>

            {/* Card Footer Stamp */}
            <div className="mt-2.5 text-center border-t border-[#17140F]/15 pt-1.5">
              <span className="font-fraunces text-xs font-bold italic tracking-wide text-[#17140F]">
                MikuaBooth
              </span>
              <span className="block font-mono text-[7px] tracking-widest text-[#17140F]/60">
                SEOUL · MEMORY QUAD · 2000S VIBE
              </span>
            </div>

            {/* Pinned Vector Sticker: Pop Heart */}
            <div className="absolute -top-2.5 -right-2.5 flex h-8 w-8 items-center justify-center rounded-full border-[2px] border-[#17140F] bg-[#FF3D9A] text-white shadow-[2px_2px_0px_#17140F] rotate-12">
              <Heart size={16} weight="fill" />
            </div>

            {/* Pinned Sticker Badge: BESTIE */}
            <div className="absolute -bottom-2 -left-2.5 rounded-full border-[2px] border-[#17140F] bg-[#D4FF3D] px-2 py-0.5 font-mono text-[8px] font-extrabold text-[#17140F] shadow-[2px_2px_0px_#17140F] -rotate-6">
              ★ BESTIE ★
            </div>

            {/* Star badge top left */}
            <div className="absolute -top-2 -left-2 flex h-6 w-6 items-center justify-center rounded-full border-[1.5px] border-[#17140F] bg-[#D4FF3D] text-[#17140F] shadow-[1.5px_1.5px_0px_#17140F]">
              <Star size={12} weight="fill" />
            </div>
          </div>
        </div>
      </section>

    </BoothShell>
  );
}
