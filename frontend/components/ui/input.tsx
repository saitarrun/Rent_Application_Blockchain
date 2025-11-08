import * as React from "react";
import { cn } from "../../lib/format";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-xl border border-slate-800/70 bg-slate-900/70 px-4 text-sm text-slate-100 placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";
