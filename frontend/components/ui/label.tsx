import * as React from "react";
import { cn } from "../../lib/format";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(({ className, ...props }, ref) => (
  <label ref={ref} className={cn("text-xs font-medium uppercase tracking-wide text-slate-400", className)} {...props} />
));
Label.displayName = "Label";
