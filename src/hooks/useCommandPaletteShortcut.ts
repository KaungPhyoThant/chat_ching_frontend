"use client";

import { useEffect } from "react";
import { useUIStore } from "@/store/ui-store";

/** Registers ⌘K / Ctrl+K to toggle the global command palette. */
export function useCommandPaletteShortcut() {
  const toggle = useUIStore((s) => s.toggleCommandPalette);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isModK =
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "k" &&
        !event.altKey &&
        !event.shiftKey;

      if (isModK) {
        event.preventDefault();
        toggle();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggle]);
}
