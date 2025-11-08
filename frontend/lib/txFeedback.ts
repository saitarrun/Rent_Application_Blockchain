"use client";

import confetti from "canvas-confetti";
import { toast } from "sonner";

export function popSuccess(message: string) {
  toast.success(message, { duration: 2500 });
  try {
    confetti({
      particleCount: 80,
      spread: 65,
      startVelocity: 35,
      scalar: 0.9,
      origin: { y: 0.2 }
    });
  } catch {
    // noop in non-browser
  }
}

export function popError(message: string) {
  toast.error(message, { duration: 3500 });
}

