"use client";

import { secondaryButtonClass } from "@/components/form";

export function PrintButton() {
  return (
    <button className={secondaryButtonClass} onClick={() => window.print()}>
      Print or save as PDF
    </button>
  );
}