# Build: MikuaBooth — a Next.js Photo Booth Web App

## Context
This is a Next.js (App Router, TypeScript) project that's already scaffolded — build inside it, don't re-init. The product is "MikuaBooth," a browser-based photo booth inspired by Korean "Life4Cuts" booths: the user takes a short burst of webcam photos, then gets a styled photo card as the result (not a single flat photo — a designed keepsake).

Before writing any UI code, run this through my **tasteskill** and use it to guide spacing, type scale, component polish, and motion. Treat the palette/fonts below as brand tokens — tasteskill should refine execution, not override the concept.

## Design direction — avoid AI-slop, on purpose
This must NOT look like a generic AI-generated app. Specifically avoid:
- Purple-to-blue gradients, glassmorphism cards, or blurred floating panels
- Default shadcn look left unstyled, everything in the same rounded-2xl + soft-shadow treatment
- Centering every element in one narrow max-w-md card with no layout confidence
- Flat system-ui/Inter-everywhere text with no type hierarchy
- Emoji used as primary icons (📸 buttons etc.)
- Generic Framer-Motion fade/slide-up on everything with the same easing

Instead: warm, tactile, editorial — like a physical photo booth, not a SaaS dashboard. Use intentional asymmetry, a strong serif/sans type pairing, subtle grain/texture instead of blur for depth, and shutter/flash/film-style micro-interactions.

### Palette
| Token | Hex | Use |
|---|---|---|
| `--bg` | `#F6F1E7` | App background — warm ivory, not white |
| `--surface` | `#FFFFFF` | Cards, panels |
| `--ink` | `#221F1B` | Primary text, near-black warm charcoal |
| `--accent` | `#E1503A` | Shutter button, primary CTA — warm film-red |
| `--accent-gold` | `#D9A441` | Secondary accent, active states, one frame-color option |
| `--sage` | `#8A9A7E` | Alt frame-color option |
| `--dusty-blue` | `#6E8CA0` | Alt frame-color option |
| `--frame-black` | `#1E1B18` | Alt frame-color option |

Frame color picker should offer: ivory, black, rust (`--accent`), sage, dusty blue — as physical swatches, not a color wheel.

### Type
- **Display/headlines:** `Fraunces` (variable, via `next/font/google`) — warm, editorial serif, used big and confident for the wordmark and screen titles.
- **UI/body:** `Geist Sans` (via the `geist` package, Next.js/Vercel's own font) — fallback `Inter` if unavailable.
- **Countdown numbers, shot counter, timestamp stamp:** `JetBrains Mono` — gives the camera UI a technical, film-camera feel and contrasts nicely with the serif.

## Flow

**1. Start screen**
- Full-bleed, warm ivory background with subtle grain texture.
- Large `Fraunces` wordmark "MikuaBooth," short one-line tagline, and a single confident CTA button ("Start Booth") in `--accent`.
- Optional: soft idle camera preview or a simple illustrated frame in the background — not a stock photo.

**2. Capture screen**
- Request webcam permission on entry; handle denied/no-camera states with a clear, on-brand message (not a browser-default alert).
- Live mirrored video preview fills most of the viewport, framed like a booth window (subtle vignette/border, not a plain `<video>` tag floating on the page).
- Shot counter top corner in `JetBrains Mono` (e.g. "1 / 4").
- Optional filter strip above/below the preview (None / B&W / Warm Film / Vivid) — applied live via CSS filter, then baked into the captured frame.
- On start: 3-2-1 countdown, large animated number overlay per shot.
- On 0: white shutter-flash overlay + capture frame to canvas; short pause (~1.5s), then auto-advance to next shot until 4 are captured.
- Back/cancel button to return to start.

**3. Result screen — the photo card**
- Canvas-composited photo card showing the 4 shots arranged in a strip/grid layout, with the chosen frame color as the card background, plus a small `MikuaBooth` watermark and `JetBrains Mono` timestamp at the bottom — like a real Life4Cuts strip.
- Card should animate in with a "developing" reveal (fade/contrast settle), not a generic slide-in.
- Frame color swatches re-render the card live when tapped.
- Actions: **Download** (PNG), **Retake** (back to capture screen), optional **Share** (Web Share API where supported).

## Features checklist
- [ ] `getUserMedia` webcam access, mirrored preview, graceful permission/error states
- [ ] 3-2-1 countdown with animated overlay
- [ ] 4-shot auto sequence with shutter flash + live shot counter
- [ ] Optional pre-capture filter selection (applied to preview and baked into captured frames)
- [ ] Canvas compositing: builds the final photo card (layout + frame color + watermark + timestamp)
- [ ] Frame color picker, live re-render
- [ ] Download as PNG
- [ ] Retake / start over
- [ ] Fully responsive (desktop + mobile; front/back camera toggle on mobile if available)
- [ ] Accessible: keyboard-operable controls, `aria-live` on the countdown, respects `prefers-reduced-motion`
- [ ] No backend needed — everything client-side

## Technical notes
- Next.js App Router + TypeScript, Tailwind CSS for styling.
- Fonts loaded via `next/font/google` (Fraunces, JetBrains Mono) and the `geist` package (Geist Sans) — no external font `<link>` tags.
- Keep camera/capture logic in a dedicated hook (e.g. `useCameraCapture`) separate from the compositing logic (e.g. `useDrawPhotoCard`), so the canvas rendering is testable on its own.
- Shot count (4) and countdown length (3s) should be simple constants, easy to tweak later.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
