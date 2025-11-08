"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button, type ButtonProps } from "./ui/button";
import { toast } from "./ToastBoundary";
import { popSuccess, popError } from "../lib/txFeedback";

export function TxButton({ txAction, children, pendingLabel, ...props }: ButtonProps & { txAction: () => Promise<unknown>; pendingLabel?: string }) {
  const [pending, setPending] = useState(false);

  const handleClick = async () => {
    try {
      setPending(true);
      await txAction();
      popSuccess("Transaction submitted");
    } catch (error: any) {
      if (error?.name !== "UserRejectedRequestError") {
        popError(error?.shortMessage ?? error?.message ?? "Transaction failed");
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <Button {...props} onClick={handleClick} disabled={pending || props.disabled}>
      {pending ? (
        <span className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          {pendingLabel ?? "Processing"}
        </span>
      ) : (
        children
      )}
    </Button>
  );
}
