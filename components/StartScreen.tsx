"use client";

import React, { useState } from "react";
import {
  Camera,
  FilmStrip,
  ArrowRight,
  Sparkle,
  Heart,
  Star,
  HandPeace,
  ShieldCheck,
  ArrowsClockwise,
  Printer,
  SlidersHorizontal,
} from "@phosphor-icons/react";
import { BoothShell } from "@/components/BoothShell";

interface StartScreenProps {
  onStart: () => void;
  onTryDemo: () => void;
}

const SAMPLE_SWATCHES = [
  { id: "ivory", name: "Ivory", bg: "#FAF7F0", border: "#E1503A", text: "#1E1B18" },
  { id: "black", name: "Black", bg: "#1E1B18", border: "#FAF7F0", text: "#FAF7F0" },
  { id: "rust", name: "Rust", bg: "#E1503A", border: "#FAF7F0", text: "#FAF7F0" },
  { id: "sage", name: "Sage", bg: "#8A9A7E", border: "#1E1B18", text: "#1E1B18" },
  { id: "blue", name: "Blue", bg: "#6E8CA0", border: "#FAF7F0", text: "#FAF7F0" },
];

export function StartScreen({ onStart, onTryDemo }: StartScreenProps) {
  const [activeSwatch, setActiveSwatch] = useState(SAMPLE_SWATCHES[0]);

  return (
    <BoothShell
      variant="scroll"
      className="px-4 py-4 md:px-8 xl:px-12 md:py-6 select-none"
      header={
        <>
          {/* Brand Lockup */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border-[2px] border-[#1E1B18] bg-[#E1503A] text-white shadow-[2px_2px_0px_#1E1B18]">
              <Camera size={20} weight="bold" />
            </div>
            <div>
              <span className="block font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#1E1B18] leading-none">
                MikuaBooth
              </span>
              <span className="block font-mono text-[9px] font-extrabold uppercase tracking-widest text-[#1E1B18]/70 mt-1">
                SEOUL 4-CUTS &amp; FILM KIOSK
              </span>
            </div>
          </div>

          {/* Quick CTA & Live Status */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-2 rounded-full border-[2px] border-[#1E1B18] bg-white px-3 py-1 font-mono text-xs font-bold text-[#1E1B18] shadow-[2px_2px_0px_#1E1B18]">
              <span className="h-2 w-2 rounded-full bg-[#E1503A] animate-pulse" />
              <span>BOOTH ONLINE</span>
            </div>

            <button
              onClick={onStart}
              className="kiosk-btn flex items-center gap-2 rounded-xl bg-[#E1503A] text-white px-4 py-2 font-sans text-xs sm:text-sm font-extrabold cursor-pointer shadow-[2px_2px_0px_#1E1B18]"
            >
              <span>ENTER BOOTH</span>
              <ArrowRight size={14} weight="bold" />
            </button>
          </div>
        </>
      }
      footer={
        <div className="flex w-full flex-col sm:flex-row items-center justify-between border-t border-[#1E1B18]/15 pt-4 text-xs font-mono text-[#1E1B18]/70 gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} weight="bold" className="text-[#E1503A]" />
            <span>100% PRIVATE CLIENT-SIDE CANVAS · ZERO CLOUD STORAGE</span>
          </div>
          <span>AUTHENTIC SEOUL 4-CUT &amp; 6-CUT PHOTO SYSTEM</span>
        </div>
      }
    >
      <div className="my-4 flex w-full flex-col gap-14 sm:gap-20">
        
        {/* ================= SECTION 1: EDITORIAL HERO ================= */}
        <section className="flex w-full flex-col items-center justify-between gap-10 lg:flex-row lg:items-center py-2 lg:py-6">
          {/* Left: Headline & CTAs */}
          <div className="flex max-w-xl flex-col items-start text-left">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border-[2px] border-[#1E1B18] bg-[#FAF7F0] px-3.5 py-1 font-mono text-xs font-extrabold text-[#1E1B18] shadow-[2px_2px_0px_#1E1B18]">
              <Sparkle size={13} weight="fill" className="text-[#E1503A]" />
              <span>AUTHENTIC KOREAN LIFE4CUTS EXPERIENCE</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1E1B18] leading-[1.08]">
              Your Moments, <br />
              <span className="italic text-[#E1503A] underline decoration-[#D9A441] decoration-wavy decoration-2 underline-offset-8">
                Developed in Seconds.
              </span>
            </h1>

            <p className="mt-4 font-sans text-sm sm:text-base leading-relaxed text-[#1E1B18]/80 max-w-[48ch]">
              Step inside a tactile browser-based photo booth. Choose 4-shot or 6-shot formats,
              capture guided sequential snaps 1-by-1, style your physical frame colors and stamps,
              and download a keepsake strip ready to print.
            </p>

            {/* Main Action Buttons */}
            <div className="mt-6 flex w-full flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={onStart}
                className="kiosk-btn flex items-center justify-center gap-2.5 rounded-2xl bg-[#E1503A] px-7 py-4 font-sans text-base font-extrabold tracking-wide text-white cursor-pointer shadow-[4px_4px_0px_#1E1B18]"
              >
                <Camera size={20} weight="bold" />
                <span>START PHOTO BOOTH</span>
                <ArrowRight size={17} weight="bold" />
              </button>

              <button
                onClick={onTryDemo}
                className="kiosk-btn flex items-center justify-center gap-2 rounded-2xl border-[2px] border-[#1E1B18] bg-white px-6 py-4 font-sans text-base font-bold text-[#1E1B18] hover:bg-[#FAF7F0] cursor-pointer shadow-[3px_3px_0px_#1E1B18]"
              >
                <FilmStrip size={20} weight="bold" className="text-[#E1503A]" />
                <span>TRY DEMO SNAPS</span>
              </button>
            </div>

            {/* Spec Highlights */}
            <div className="mt-8 grid grid-cols-3 gap-3 w-full border-t border-[#1E1B18]/15 pt-4">
              <div>
                <span className="block font-mono text-xs font-black text-[#1E1B18]">
                  4 &amp; 6 CUTS
                </span>
                <span className="block font-sans text-[11px] text-[#1E1B18]/70">
                  Strip &amp; Quad formats
                </span>
              </div>
              <div>
                <span className="block font-mono text-xs font-black text-[#1E1B18]">
                  1-BY-1 SHOTS
                </span>
                <span className="block font-sans text-[11px] text-[#1E1B18]/70">
                  Sequential burst timer
                </span>
              </div>
              <div>
                <span className="block font-mono text-xs font-black text-[#1E1B18]">
                  300 DPI PRINT
                </span>
                <span className="block font-sans text-[11px] text-[#1E1B18]/70">
                  High-res canvas export
                </span>
              </div>
            </div>
          </div>

          {/* Right: Live Interactive Sample Strip Mockup */}
          <div className="relative flex flex-col items-center justify-center select-none pt-4 lg:pt-0 shrink-0">
            {/* Color Swatch Picker floating above */}
            <div className="mb-3 flex items-center gap-1.5 rounded-full border-[2px] border-[#1E1B18] bg-white p-1 shadow-[2px_2px_0px_#1E1B18] z-20">
              <span className="px-2 font-mono text-[10px] font-bold text-[#1E1B18]/70">
                FRAME COLOR:
              </span>
              {SAMPLE_SWATCHES.map((swatch) => (
                <button
                  key={swatch.id}
                  onClick={() => setActiveSwatch(swatch)}
                  title={swatch.name}
                  className={`h-6 w-6 rounded-full border-[1.5px] border-[#1E1B18] transition-transform cursor-pointer ${
                    activeSwatch.id === swatch.id ? "scale-110 ring-2 ring-[#E1503A]" : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: swatch.bg }}
                />
              ))}
            </div>

            {/* Backdrop Shadow Card */}
            <div className="absolute -inset-2 rounded-3xl bg-[#1E1B18] border-[2px] border-[#1E1B18] rotate-2 -z-10 translate-y-3" />

            {/* The Physical Photo Strip */}
            <div
              className="relative w-64 sm:w-72 -rotate-1 rounded-2xl border-[3px] border-[#1E1B18] p-3.5 shadow-[6px_6px_0px_#1E1B18] transition-colors duration-200 z-10"
              style={{
                backgroundColor: activeSwatch.bg,
                color: activeSwatch.text,
              }}
            >
              {/* Header Stamp */}
              <div className="mb-2 text-center border-b border-current/20 pb-1.5">
                <span className="block font-serif text-xs font-bold tracking-wider">
                  HONGDAE 4-CUTS
                </span>
                <span className="block font-mono text-[8px] opacity-70">
                  SEOUL SPECIAL · 35MM RETRO FILM
                </span>
              </div>

              {/* 4 Photo Cuts */}
              <div className="flex flex-col gap-2">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md border-[1.5px] border-[#1E1B18] bg-[#E8DDD1]">
                  <div className="h-full w-full bg-gradient-to-tr from-[#D9A441]/40 to-[#E1503A]/30 flex items-center justify-center">
                    <HandPeace size={28} weight="fill" className="text-[#1E1B18]/60" />
                  </div>
                  <span className="absolute top-1 left-1 rounded bg-black/60 px-1 font-mono text-[7px] font-bold text-white">
                    01
                  </span>
                </div>

                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md border-[1.5px] border-[#1E1B18] bg-[#D1DDD3]">
                  <div className="h-full w-full bg-gradient-to-tr from-[#8A9A7E]/50 to-[#FAF7F0] flex items-center justify-center">
                    <Sparkle size={26} weight="fill" className="text-[#1E1B18]/60" />
                  </div>
                  <span className="absolute top-1 left-1 rounded bg-black/60 px-1 font-mono text-[7px] font-bold text-white">
                    02
                  </span>
                </div>

                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md border-[1.5px] border-[#1E1B18] bg-[#D1D9E0]">
                  <div className="h-full w-full bg-gradient-to-tr from-[#6E8CA0]/50 to-[#FAF7F0] flex items-center justify-center">
                    <Heart size={26} weight="fill" className="text-[#1E1B18]/60" />
                  </div>
                  <span className="absolute top-1 left-1 rounded bg-black/60 px-1 font-mono text-[7px] font-bold text-white">
                    03
                  </span>
                </div>

                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md border-[1.5px] border-[#1E1B18] bg-[#E8D1D1]">
                  <div className="h-full w-full bg-gradient-to-tr from-[#E1503A]/40 to-[#D9A441]/40 flex items-center justify-center">
                    <Star size={26} weight="fill" className="text-[#1E1B18]/60" />
                  </div>
                  <span className="absolute top-1 left-1 rounded bg-black/60 px-1 font-mono text-[7px] font-bold text-white">
                    04
                  </span>
                </div>
              </div>

              {/* Footer Stamp */}
              <div className="mt-2.5 text-center border-t border-current/20 pt-1.5">
                <span className="font-serif text-xs font-bold italic tracking-wide">
                  MikuaBooth
                </span>
                <span className="block font-mono text-[8px] tracking-widest opacity-70">
                  2026.10.29 · KEEPSAKE ARCHIVE
                </span>
              </div>

              {/* Pinned Vector Badge Top-Right */}
              <div className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full border-[2px] border-[#1E1B18] bg-[#E1503A] text-white shadow-[2px_2px_0px_#1E1B18] rotate-12">
                <Heart size={16} weight="fill" />
              </div>
            </div>
          </div>
        </section>

        {/* ================= SECTION 2: 3-STEP BOOTH WORKFLOW ================= */}
        <section className="flex w-full flex-col gap-6">
          <div className="text-left">
            <span className="font-mono text-xs font-extrabold uppercase tracking-widest text-[#E1503A]">
              01 — 02 — 03 THE WORKFLOW
            </span>
            <h2 className="mt-1 font-serif text-3xl sm:text-4xl font-bold text-[#1E1B18]">
              Just like stepping into a Hongdae photo booth.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step 1 */}
            <div className="flex flex-col justify-between rounded-2xl border-[2.5px] border-[#1E1B18] bg-white p-5 shadow-[3px_3px_0px_#1E1B18]">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#1E1B18]/15">
                  <span className="font-mono text-xs font-black text-[#E1503A]">STEP 01</span>
                  <span className="rounded bg-[#FAF7F0] border border-[#1E1B18]/20 px-2 py-0.5 font-mono text-[10px] font-bold text-[#1E1B18]">
                    FORMAT
                  </span>
                </div>
                <h3 className="mt-3 font-serif text-xl font-bold text-[#1E1B18]">
                  Choose Shot Count
                </h3>
                <p className="mt-1.5 font-sans text-xs text-[#1E1B18]/75 leading-relaxed">
                  Select your physical layout: classic 4-cut vertical strip, 2x2 square quad, 6-cut story grid, or 3-cut pocket trio. Card styling happens right after you snap.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#1E1B18]/10 font-mono text-[10px] text-[#1E1B18]/60">
                ✦ 4-CUT · 6-CUT · 3-CUT
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col justify-between rounded-2xl border-[2.5px] border-[#1E1B18] bg-white p-5 shadow-[3px_3px_0px_#1E1B18]">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#1E1B18]/15">
                  <span className="font-mono text-xs font-black text-[#E1503A]">STEP 02</span>
                  <span className="rounded bg-[#FAF7F0] border border-[#1E1B18]/20 px-2 py-0.5 font-mono text-[10px] font-bold text-[#1E1B18]">
                    CAPTURE
                  </span>
                </div>
                <h3 className="mt-3 font-serif text-xl font-bold text-[#1E1B18]">
                  1-by-1 Sequential Snaps
                </h3>
                <p className="mt-1.5 font-sans text-xs text-[#1E1B18]/75 leading-relaxed">
                  All slots are displayed on screen. The camera focuses on Slot 1 with a 3-2-1 countdown, flashes and locks the photo, then automatically advances to Slot 2.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#1E1B18]/10 font-mono text-[10px] text-[#1E1B18]/60">
                ✦ GUIDED POSE SUGGESTIONS
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col justify-between rounded-2xl border-[2.5px] border-[#1E1B18] bg-white p-5 shadow-[3px_3px_0px_#1E1B18]">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#1E1B18]/15">
                  <span className="font-mono text-xs font-black text-[#E1503A]">STEP 03</span>
                  <span className="rounded bg-[#FAF7F0] border border-[#1E1B18]/20 px-2 py-0.5 font-mono text-[10px] font-bold text-[#1E1B18]">
                    DESIGN
                  </span>
                </div>
                <h3 className="mt-3 font-serif text-xl font-bold text-[#1E1B18]">
                  Style, Stamp &amp; Print
                </h3>
                <p className="mt-1.5 font-sans text-xs text-[#1E1B18]/75 leading-relaxed">
                  Enter the workbench. Pick warm ivory, black, or sage frame colors, apply analog film tones, stamp Y2K stickers, and export a high-resolution 300DPI PNG.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#1E1B18]/10 font-mono text-[10px] text-[#1E1B18]/60">
                ✦ CLIENT CANVAS · INSTANT EXPORT
              </div>
            </div>
          </div>
        </section>

        {/* ================= SECTION 3: CRAFT & PRIVACY PILLARS ================= */}
        <section className="flex w-full flex-col gap-6">
          <div className="text-left">
            <span className="font-mono text-xs font-extrabold uppercase tracking-widest text-[#E1503A]">
              THE ARCHITECTURE
            </span>
            <h2 className="mt-1 font-serif text-3xl sm:text-4xl font-bold text-[#1E1B18]">
              Built with tactile craft, zero slop.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="rounded-2xl border-[2.5px] border-[#1E1B18] bg-[#FAF7F0] p-4 shadow-[3px_3px_0px_#1E1B18]">
              <ShieldCheck size={28} weight="bold" className="text-[#E1503A] mb-2" />
              <h4 className="font-serif text-base font-bold text-[#1E1B18]">100% Private</h4>
              <p className="mt-1 font-sans text-xs text-[#1E1B18]/70 leading-relaxed">
                Zero cloud storage. All canvas compositing happens strictly in your browser RAM. Your photos never leave your device.
              </p>
            </div>

            <div className="rounded-2xl border-[2.5px] border-[#1E1B18] bg-[#FAF7F0] p-4 shadow-[3px_3px_0px_#1E1B18]">
              <ArrowsClockwise size={28} weight="bold" className="text-[#E1503A] mb-2" />
              <h4 className="font-serif text-base font-bold text-[#1E1B18]">Single-Slot Retakes</h4>
              <p className="mt-1 font-sans text-xs text-[#1E1B18]/70 leading-relaxed">
                Didn&apos;t like pose #3? Don&apos;t start the whole strip over. Retake any individual slot directly from the design studio.
              </p>
            </div>

            <div className="rounded-2xl border-[2.5px] border-[#1E1B18] bg-[#FAF7F0] p-4 shadow-[3px_3px_0px_#1E1B18]">
              <Printer size={28} weight="bold" className="text-[#E1503A] mb-2" />
              <h4 className="font-serif text-base font-bold text-[#1E1B18]">300 DPI Export</h4>
              <p className="mt-1 font-sans text-xs text-[#1E1B18]/70 leading-relaxed">
                Rendered at true high resolution. Perfectly formatted for physical photo printing, lockscreen backgrounds, or scrapbooks.
              </p>
            </div>

            <div className="rounded-2xl border-[2.5px] border-[#1E1B18] bg-[#FAF7F0] p-4 shadow-[3px_3px_0px_#1E1B18]">
              <SlidersHorizontal size={28} weight="bold" className="text-[#E1503A] mb-2" />
              <h4 className="font-serif text-base font-bold text-[#1E1B18]">Analog Color Science</h4>
              <p className="mt-1 font-sans text-xs text-[#1E1B18]/70 leading-relaxed">
                Curated film tones inspired by Portra 400, Tri-X monochrome, and vivid Korean instant film emulsions.
              </p>
            </div>
          </div>
        </section>

        {/* ================= SECTION 4: INVITATION SHUTTER BANNER ================= */}
        <section className="flex w-full flex-col items-center justify-between gap-6 rounded-3xl border-[3px] border-[#1E1B18] bg-[#E1503A] text-white p-6 sm:p-10 shadow-[6px_6px_0px_#1E1B18] md:flex-row text-left">
          <div className="max-w-xl">
            <span className="font-mono text-xs font-bold text-white/80 tracking-widest uppercase">
              READY FOR YOUR CLOSE-UP?
            </span>
            <h3 className="mt-1 font-serif text-3xl sm:text-4xl font-bold leading-tight">
              Step inside the booth. Take your strip.
            </h3>
            <p className="mt-2 font-sans text-xs sm:text-sm text-white/85 leading-relaxed">
              No login required. Instant webcam access, mirror toggle, guided countdowns, and physical keepsake cards.
            </p>
          </div>

          <button
            onClick={onStart}
            className="kiosk-btn shrink-0 inline-flex items-center justify-center gap-2.5 rounded-2xl bg-white px-8 py-4 font-sans text-base font-extrabold text-[#1E1B18] hover:bg-[#FAF7F0] cursor-pointer shadow-[3px_3px_0px_#1E1B18]"
          >
            <Camera size={20} weight="bold" className="text-[#E1503A]" />
            <span>START BOOTH NOW</span>
            <ArrowRight size={17} weight="bold" />
          </button>
        </section>

      </div>
    </BoothShell>
  );
}
