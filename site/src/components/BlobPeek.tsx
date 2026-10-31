// An Easter egg, like the footer's: the blob peeks over the top edge of a card, behind it, and rises a little
// when you point at the card
import type { ReactNode } from "react";
import { Blob } from "./Characters";

export function BlobPeek({ children }: { children: ReactNode }) {
  return (
    <div className="group relative">
      {/* The blob, behind the card, so the card's top edge hides all but its eyes */}
      <div className="absolute -top-[30px] right-[14%] z-0 transition-transform duration-500 ease-[cubic-bezier(0.3,1.4,0.5,1)] group-hover:-translate-y-3" aria-hidden="true">
        <Blob size={72} face="ready" />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
