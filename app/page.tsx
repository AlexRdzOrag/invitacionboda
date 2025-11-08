'use client';

import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const [smoothScroll, setSmoothScroll] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    let animationFrame: number;
    const smooth = () => {
      setSmoothScroll(prev => prev + (scrollY - prev) * 0.08);
      animationFrame = requestAnimationFrame(smooth);
    };
    smooth();
    return () => cancelAnimationFrame(animationFrame);
  }, [scrollY]);

  const translateValue = Math.min(smoothScroll / 2, 200);

  return (
    <main className="relative">
      {/* Scrollable height controller */}
      <div className="min-h-[200vh] bg-black"></div>

      {/* Fixed visual layer */}
      <div className="fixed inset-0 flex justify-center items-center">
        {/* Mask container (gray sides) */}
        <div className="relative w-full max-w-[430px] sm:max-w-[480px] md:max-w-[520px] bg-gray-900 min-h-screen overflow-hidden">
          {/* Decorative images above white column */}
          <div className="absolute inset-0 flex items-center justify-center z-20">
            {/* Left image */}
            <div
              className="absolute h-screen w-[390px] transition-transform duration-75 will-change-transform"
              style={{
                transform: `translateX(-${translateValue}px)`,
              }}
            >
              <Image
                src="/left.png"
                alt="Left decoration"
                width={390}
                height={844}
                className="h-full w-auto"
                priority
              />
            </div>

            {/* Right image */}
            <div
              className="absolute h-screen w-[390px] transition-transform duration-75 will-change-transform"
              style={{
                transform: `translateX(${translateValue}px)`,
              }}
            >
              <Image
                src="/right.png"
                alt="Right decoration"
                width={390}
                height={844}
                className="h-full w-auto"
                priority
              />
            </div>
          </div>

          {/* Central white column BELOW the images */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="max-w-[390px] w-full">
              <article className="bg-white shadow-lg p-6 sm:p-8 md:p-10 min-h-screen flex flex-col justify-center">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900 text-center mb-4">
                  Ismael y Reyna
                </h1>
                <h3 className="text-center text-xl mb-2">
                  27 de diciembre del 2025
                </h3>
                <h3 className="text-center text-xl">05:00pm</h3>
              </article>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
