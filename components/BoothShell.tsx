"use client";

import React, { ReactNode } from "react";

export type BoothShellVariant = "fixed" | "scroll";

interface BoothShellProps {
  /** Top bar content (left/center/right items). Shell owns the unified border + max width. */
  header?: ReactNode;
  /** Bottom content (branding strip or sticky CTA bar). Shell owns the unified max width. */
  footer?: ReactNode;
  children: ReactNode;
  /** "fixed" fills the viewport (Start/Capture/Editor); "scroll" grows with content (Browse/Finish). */
  variant?: BoothShellVariant;
  as?: "main" | "div";
  /** Per-screen outer tweaks: padding, overflow behavior, select-none. */
  className?: string;
}

const SHELL_MAX = "max-w-[1560px]";

export function BoothShell({
  header,
  footer,
  children,
  variant = "fixed",
  as = "main",
  className = "",
}: BoothShellProps) {
  const Tag = (as === "div" ? "div" : "main") as "main";

  return (
    <Tag
      className={
        `relative flex w-full flex-col items-center justify-between ` +
        (variant === "fixed" ? `h-[100dvh] max-h-[100dvh] ` : `min-h-[100dvh] `) +
        className
      }
    >
      {header ? (
        <header
          className={`flex w-full ${SHELL_MAX} items-center justify-between border-b-[2px] border-[#17140F] pb-2 sm:pb-2.5 shrink-0`}
        >
          {header}
        </header>
      ) : null}

      <div
        className={`w-full ${SHELL_MAX} ${
          variant === "fixed" ? "flex min-h-0 flex-1 flex-col" : "flex-1"
        }`}
      >
        {children}
      </div>

      {footer ? (
        <footer className={`w-full ${SHELL_MAX} shrink-0`}>{footer}</footer>
      ) : null}
    </Tag>
  );
}
