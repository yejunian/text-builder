import React from "react";

import { cn } from "@/lib/utils";

export default function Mustached({
  children,
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span {...props} className={cn("font-mono", className)}>
      {"{{"}
      {children}
      {"}}"}
    </span>
  );
}
