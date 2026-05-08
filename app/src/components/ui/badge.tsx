import * as React from "react";

import { cn } from "@/lib/utils";

function Badge({ className, variant = "default", ...props }: React.ComponentProps<"span"> & { variant?: "default" | "secondary" | "outline" }) {
  return (
    <span
      data-slot="badge"
      data-variant={variant}
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.12em] transition-colors",
        variant === "default" && "border-[#6FFF00]/35 bg-[#6FFF00]/15 text-[#D6FFAD]",
        variant === "secondary" && "border-white/10 bg-white/10 text-[#EFF4FF]/78",
        variant === "outline" && "border-white/20 bg-transparent text-[#EFF4FF]",
        className
      )}
      {...props}
    />
  );
}

export { Badge };
