"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";

export const Meteors = ({ number = 20, className }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const updateSize = () => {
        setScreenSize({ width: window.innerWidth, height: window.innerHeight });
        setIsMobile(window.innerWidth < 640);
      };
      updateSize();
      window.addEventListener("resize", updateSize);
      return () => window.removeEventListener("resize", updateSize);
    }
  }, []);

  if (screenSize.width === 0) return null; // Prevent SSR errors

  const meteorCount = isMobile ? Math.floor(number / 2) : number;

  return (
    <>
      {new Array(meteorCount).fill(true).map((_, idx) => (
        <span
          key={"meteor" + idx}
          className={cn(
            "animate-meteor-effect absolute h-0.5 w-0.5 rounded-full bg-slate-500 shadow-[0_0_0_1px_#ffffff10] rotate-[215deg]",
            "before:content-[''] before:absolute before:top-1/2 before:transform before:-translate-y-1/2 before:w-[50px] before:h-[1px] before:bg-gradient-to-r before:from-[#64748b] before:to-transparent",
            className
          )}
          style={{
            top: Math.random() * screenSize.height + "px",
            left: Math.random() * screenSize.width + "px",
            animationDelay: Math.random() * (1 - 0.2) + 0.2 + "s",
            animationDuration: Math.floor(Math.random() * (10 - 4) + 4) + "s",
          }}
        ></span>
      ))}
    </>
  );
};
