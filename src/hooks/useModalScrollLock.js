"use client";

import { useEffect } from "react";

let openModalCount = 0;
let previousOverflow = "";
let previousPaddingRight = "";

export default function useModalScrollLock(isOpen) {
  useEffect(() => {
    if (!isOpen || typeof document === "undefined") return undefined;

    const { body, documentElement } = document;
    if (openModalCount === 0) {
      previousOverflow = body.style.overflow;
      previousPaddingRight = body.style.paddingRight;
      const scrollbarWidth = window.innerWidth - documentElement.clientWidth;
      body.style.overflow = "hidden";
      if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;
      body.classList.add("modal-open");
    }
    openModalCount += 1;

    return () => {
      openModalCount = Math.max(0, openModalCount - 1);
      if (openModalCount === 0) {
        body.style.overflow = previousOverflow;
        body.style.paddingRight = previousPaddingRight;
        body.classList.remove("modal-open");
      }
    };
  }, [isOpen]);
}
