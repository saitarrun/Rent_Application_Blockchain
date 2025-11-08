"use client";

import { CopyIcon, Check } from "lucide-react";
import { useState } from "react";
import { Button, type ButtonProps } from "./ui/button";
import { toast } from "./ToastBoundary";

export function Copy({ value, ...buttonProps }: { value: string } & ButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Button {...buttonProps} onClick={handleCopy}>
      {copied ? <Check className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
    </Button>
  );
}
