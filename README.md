# MikuaBooth

A browser-based photo booth inspired by Korean Life4Cuts booths. Take a burst of webcam snaps, arrange them on a styled keepsake card, add filters / AR accessories / stickers, then download as PNG.

Everything runs client-side. No backend, no uploads — photos never leave the browser.

## Features

- **5-screen kiosk flow:** Start → Template Browser → Capture → Slot Editor → Finish
- **13 frame templates** across `K-pop / Y2K / Soft & Dreamy / Minimalist`, with 3, 4, 8, and 16-photo layouts (`lib/templates.ts`)
- **Webcam capture** via `getUserMedia`: mirrored preview, front/back toggle + mirror toggle on mobile, HD with graceful fallback, clear denied / no-camera states
- **Countdown + auto sequence:** 3-2-1 overlay per shot (`aria-live`), shutter flash, auto-advance
- **6 live photo filters** baked into captures: Natural, Warm Film, B&W Film, Vivid 90s, Pastel Dream, Cyber Neon (`lib/filters.ts`)
- **6 AR face accessories** tracked with MediaPipe Face Landmarker (bunny ears, cat ears, flower crown, heart, star, party hat), baked into the capture (`lib/accessories.ts`, `hooks/useFaceLandmarks.ts`)
- **Demo Snaps mode:** full flow works with generated avatar frames, no camera needed
- **Slot editor:** drag-style slot reassignment, single-slot retake, global + per-photo filters, canvas stickers (9 types, recolorable), optional text caption pill
- **Canvas compositing:** high-res PNG export with header, border patterns (solid / dots / checker / film / double), watermark, timestamp stamp (`hooks/useKioskCanvasExport.ts`)
- **Extras:** Blip mascot companion (`context/MascotContext.tsx`), shutter sounds (`lib/audio.ts`), confetti on finish, Web Share API where supported
- **Responsive + accessible:** mobile-first, keyboard-operable controls, `prefers-reduced-motion` respected
- **Privacy-first:** all rendering in `<canvas>` / data URLs in memory; nothing uploaded

## Tech stack

- Next.js 16 (App Router) + TypeScript + React 19
- Tailwind CSS v4
- Fonts via `next/font/google`: Fraunces, JetBrains Mono, Geist, Fredoka, Manrope
- `@mediapipe/tasks-vision` (Face Landmarker, WASM served locally from `public/wasm`)
- `@phosphor-icons/react`, `canvas-confetti`

## Project structure

```text
app/
  page.tsx          # screen state machine (start/browse/capture/editor/finish)
  layout.tsx        # fonts, metadata, viewport
  globals.css       # brand tokens, kiosk utilities, developing/countdown/flash keyframes
components/
  StartScreen.tsx / TemplateBrowser.tsx / CaptureScreen.tsx
  SlotEditor.tsx / FinishScreen.tsx / SingleSlotRetakeModal.tsx
  MascotWidget.tsx / AnalogGrain.tsx / BoothShell.tsx
hooks/
  useCameraCapture.ts      # getUserMedia, mirrored preview, captureFrame, demo frames
  useFaceLandmarks.ts      # MediaPipe face tracking
  useKioskCanvasExport.ts  # card compositing + PNG download
lib/
  templates.ts / filters.ts / stickers.ts / accessories.ts / audio.ts
context/
  MascotContext.tsx
public/
  wasm/    # MediaPipe vision WASM (self-hosted, no CDN needed)
  mascot/  # Blip mascot assets
```

Key separation: camera logic lives in `useCameraCapture`, compositing lives in `useKioskCanvasExport`, so canvas rendering is testable without a camera.

## Prerequisites

- Node.js 20+ (Next 16 requirement) and npm 10+
- A Chromium / Firefox / Safari recent version
- A webcam for live mode (optional — Demo Snaps works without one)
- `http://localhost` works for camera in dev; **deployed previews must be HTTPS** or `getUserMedia` will be blocked by the browser

Check versions:

```bash
node -v
npm -v
```

## Setup

```bash
# 1. Clone
git clone https://github.com/<you>/mikuabooth.git
cd mikuabooth

# 2. Install
npm install

# 3. Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Other scripts:

```bash
npm run build   # production build
npm start       # serve production build (run build first)
npm run lint    # eslint
```

No environment variables needed. No `.env` file required.

## Usage

1. **Start:** click `Start Booth` (live camera) or `Try Demo Snaps` (no camera).
2. **Browse:** pick a frame template (filter by category). Slot count (3/4/8/16) is set by the template.
3. **Capture:** allow camera access, pick a filter + accessory, press shutter. 3-2-1 countdown runs per shot until all slots are filled.
4. **Edit:** reassign photos to slots, retake a single slot, adjust global/per-photo filters, add stickers, add an optional caption.
5. **Finish:** preview the developing reveal, download PNG (`mikuabooth-<template-id>-<date>.png`), share (where supported), edit again, or start over.

## Camera troubleshooting

| Symptom | Fix |
|---|---|
| Permission denied screen | Enable camera in browser site settings, reload, or use Demo Snaps |
| No camera found | Use Demo Snaps, or attach/enable a device |
| Black video on deploy preview | Serve over HTTPS; `getUserMedia` is blocked on insecure origins |
| Wrong lens on mobile | Use the front/back toggle in the capture toolbar |
| Mirrored selfies | Toggle mirror; the baked capture matches the preview setting |

## Customization

Shot count and countdown are plain constants in `components/CaptureScreen.tsx` — search for `COUNTDOWN_SECONDS` / slot logic. To extend content:

- **New frame:** add a `FrameTemplate` entry in `lib/templates.ts` (id, slotCount, layout, card size, colors, `slots` as % coordinates). 16-slot grids can reuse `generate16Slots()`.
- **New filter:** add a `PhotoFilter` in `lib/filters.ts` with a CSS filter string — it applies live and is baked into both captures and canvas export via `ctx.filter`.
- **New sticker:** add a `StickerDefinition` in `lib/stickers.ts` with an SVG path for the UI preview and a `drawOnCanvas` routine for export.
- **New accessory:** add an `AccessoryDefinition` in `lib/accessories.ts` with a canvas `draw(anchorX, anchorY, faceWidth, rollAngle)` routine.
- **Brand tokens:** edit `:root` in `app/globals.css` (`--bg #F6F1E7`, `--ink #221F1B`, `--accent #E1503A`, etc.).

## Deployment

Any Next.js host works. Vercel example:

```bash
npm run build
```

Then deploy the repo via Vercel, or:

```bash
npx vercel --prod
```

Ensure the production URL is HTTPS so camera access works.

## Browser support

- Desktop Chrome / Edge / Firefox / Safari (latest)
- Mobile Safari + Chrome with front/back toggle
- Face accessories require WebAssembly + `requestAnimationFrame`; they degrade gracefully to fixed placement if tracking fails

## Privacy

Photos are captured to in-memory data URLs and drawn to `<canvas>` locally. This repo contains no API routes, no database, and no analytics. Closing the tab discards the session.

## Contributing

Issues and PRs welcome. Keep it client-side and dependency-light:

1. Fork + branch (`feat/my-template`)
2. `npm install`, `npm run dev`
3. Make the change, run `npm run lint` and `npm run build`
4. Open a PR describing the template / filter / fix with a screenshot of the exported card

## License

MIT — add a `LICENSE` file with your name/year before publishing. No backend keys or secrets are required to run this project.
