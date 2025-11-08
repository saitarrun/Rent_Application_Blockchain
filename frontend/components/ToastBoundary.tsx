"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export function ToastBoundary() {
  useEffect(() => {
    toast.dismiss();
  }, []);
  return null;
}

export { toast } from "sonner";
