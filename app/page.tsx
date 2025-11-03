'use client';

import Image from "next/image";
import { useScrollPosition } from "./hooks/useScrollPosition";

export default function Home() {
  const scrollPosition = useScrollPosition();
  const translateValue = Math.min(scrollPosition / 3, 150); // Slower movement, larger max distance
  const opacity = Math.min(scrollPosition / 300, 1); // Content reveal based on scroll

  return (
    <div className="min-h-[200vh] bg-black">
      <div className="fixed inset-0">
        {/* Content layer - white column */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="max-w-[390px] w-full">
            <article className="bg-white shadow-lg p-6 sm:p-8 md:p-10 min-h-screen flex flex-col justify-center">
              <div 
                className="transition-opacity duration-300"
                style={{ opacity: opacity }}
              >
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900 text-center mb-4">
                  Ismael y Reyna
                </h1>
                <h3 className="text-center text-xl mb-2">27 de diciembre del 2025</h3>
                <h3 className="text-center text-xl">05:00pm</h3>
              </div>
            </article>
          </div>
        </div>

        {/* Decorative images layer - above the column */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden z-20">
          {/* Left image */}
          <div 
            className="absolute h-screen w-[390px] transition-transform duration-300"
            style={{ transform: `translateX(-${translateValue}px)` }}
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
            className="absolute h-screen w-[390px] transition-transform duration-300"
            style={{ transform: `translateX(${translateValue}px)` }}
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
      </div>
    </div>
  );
}
