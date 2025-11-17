'use client';

import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const [smoothScroll, setSmoothScroll] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(800);
  const [timeLeft, setTimeLeft] = useState<{days:number;hours:number;minutes:number;seconds:number;expired:boolean}>({days:0,hours:0,minutes:0,seconds:0,expired:false});
  const [isStarted, setIsStarted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prefersReducedMotion = useRef(false);
  const easeRef = useRef(0.18); // adaptive easing factor for smoothing
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // Detect reduced motion preference
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Adjust easing factor based on device width (slightly softer on mobile to reduce jank)
    easeRef.current = window.matchMedia('(max-width: 640px)').matches ? 0.14 : 0.20;

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setViewportHeight(window.innerHeight);
    const handleResize = () => {
      setViewportHeight(window.innerHeight);
      // Recalculate easing on orientation change / resize for consistency
      easeRef.current = window.matchMedia('(max-width: 640px)').matches ? 0.14 : 0.20;
    };
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Countdown to wedding date (assumption: user meant 2025, not 2005)
  useEffect(() => {
    const target = new Date('2025-12-27T17:00:00');
    const tick = () => {
      const now = new Date();
      const diff = target.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft({days:0,hours:0,minutes:0,seconds:0,expired:true});
        return;
      }
      const days = Math.floor(diff / (1000*60*60*24));
      const hours = Math.floor((diff / (1000*60*60)) % 24);
      const minutes = Math.floor((diff / (1000*60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft({days,hours,minutes,seconds,expired:false});
    };
    tick(); // initial
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  // Background music autoplay
  useEffect(() => {
    const basePath = process.env.NODE_ENV === 'production' ? '/invitacionboda' : '';
    const audio = new Audio(`${basePath}/cancion.mpeg`);
    audio.loop = true;
    audio.volume = 0.3;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  const handleStart = () => {
    setIsStarted(true);
    if (audioRef.current) {
      audioRef.current.play().catch((error) => {
        console.log('Music playback failed:', error);
      });
    }
  };

  useEffect(() => {
    if (prefersReducedMotion.current) {
      setSmoothScroll(scrollY);
      return; // No RAF smoothing if user prefers reduced motion
    }
    // Cancel any previous frame
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const step = () => {
      setSmoothScroll(prev => {
        const diff = scrollY - prev;
        // If very small diff, snap to avoid micro-jitter
        if (Math.abs(diff) < 0.5) return scrollY;
        return prev + diff * easeRef.current;
      });
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [scrollY]);

  // Curtains open slower - up to 200px, then stay open
  const translateValue = Math.min(smoothScroll / 3, 200);

  // Content scrolls up after curtains open
  // Timing configuration for section transitions
  const TIMING = {
    firstHoldEnd: 600,              // When contentScroll begins
    firstFadeOutStartContent: 400,  // Content scroll value where first starts fading
    firstFadeOutEndContent: 800,    // Content scroll value where first fully gone
    gapAfterFirst: 80,              // Reduced gap before second starts
    secondFadeDuration: 400,        // Fade in duration for second
    secondHoldDuration: 250,        // Hold second fully visible
    secondFadeOutDuration: 400,     // Fade out duration for second
    gapAfterSecond: 300,            // Gap after second disappears before third starts
    thirdFadeDuration: 400,         // Fade in duration for third
    thirdHoldDuration: 250,         // Hold third fully visible
    thirdFadeOutDuration: 400,      // Fade out duration for third
    gapAfterThird: 300,             // Gap after third disappears before fourth starts
    fourthFadeDuration: 400,        // Fade in duration for fourth
    fourthHoldDuration: 250,        // Hold fourth fully visible
    fourthFadeOutDuration: 400,     // Fade out duration for fourth
    gapAfterFourth: 300,            // Gap after fourth disappears before fifth starts
    fifthFadeDuration: 400,         // Fade in duration for fifth
    fifthHoldDuration: 250,         // Hold fifth fully visible
    fifthFadeOutDuration: 400,      // Fade out duration for fifth
    gapAfterFifth: 300,             // Gap after fifth disappears before sixth starts
    sixthFadeDuration: 400          // Fade in duration for sixth (RSVP)
  } as const;

  const contentScroll = Math.max(smoothScroll - TIMING.firstHoldEnd, 0);

  // First section opacity
  let textOpacity: number;
  if (smoothScroll < 250) {
    textOpacity = smoothScroll / 250; // Fade in
  } else if (contentScroll < TIMING.firstFadeOutStartContent) {
    textOpacity = 1; // Hold
  } else if (contentScroll < TIMING.firstFadeOutEndContent) {
    const progress = (contentScroll - TIMING.firstFadeOutStartContent) /
      (TIMING.firstFadeOutEndContent - TIMING.firstFadeOutStartContent);
    textOpacity = 1 - progress; // Fade out
  } else {
    textOpacity = 0; // Gone
  }

  // Calculate when section 1 is completely out of viewport
  // Section 1 fades out when contentScroll is 400-800, so it's gone at contentScroll 800
  const section1Gone = contentScroll >= 800;
  const buffer = 200; // Buffer after section 1 is gone
  
  // Second section fades in only after section 1 is completely faded out
  // Calculate scroll thresholds for second & third based on TIMING
  const firstGoneScroll = TIMING.firstHoldEnd + TIMING.firstFadeOutEndContent; // 600 + 800 = 1400
  const secondFadeInStart = firstGoneScroll + TIMING.gapAfterFirst; // earlier start
  const secondFadeInEnd = secondFadeInStart + TIMING.secondFadeDuration;
  const secondHoldEnd = secondFadeInEnd + TIMING.secondHoldDuration;
  const secondFadeOutStart = secondHoldEnd; // start fade out
  const secondFadeOutEnd = secondFadeOutStart + TIMING.secondFadeOutDuration;
  const thirdFadeInStart = secondFadeOutEnd + TIMING.gapAfterSecond;
  const thirdFadeInEnd = thirdFadeInStart + TIMING.thirdFadeDuration;

  // Second section opacity
  let secondOpacity: number;
  if (smoothScroll < secondFadeInStart) {
    secondOpacity = 0;
  } else if (smoothScroll < secondFadeInEnd) {
    secondOpacity = (smoothScroll - secondFadeInStart) / TIMING.secondFadeDuration; // fade in
  } else if (smoothScroll < secondFadeOutStart) {
    secondOpacity = 1; // hold
  } else if (smoothScroll < secondFadeOutEnd) {
    const progress = (smoothScroll - secondFadeOutStart) / TIMING.secondFadeOutDuration;
    secondOpacity = 1 - progress; // fade out
  } else {
    secondOpacity = 0; // gone
  }

  // Third section opacity (no overlap with second fade out now; has its own gap)
  let thirdOpacity: number;
  if (smoothScroll < thirdFadeInStart) {
    thirdOpacity = 0;
  } else if (smoothScroll < thirdFadeInEnd) {
    thirdOpacity = (smoothScroll - thirdFadeInStart) / TIMING.thirdFadeDuration; // fade in
  } else if (smoothScroll < thirdFadeInEnd + TIMING.thirdHoldDuration) {
    thirdOpacity = 1; // hold
  } else {
    const thirdFadeOutStart = thirdFadeInEnd + TIMING.thirdHoldDuration;
    const thirdFadeOutEnd = thirdFadeOutStart + TIMING.thirdFadeOutDuration;
    if (smoothScroll < thirdFadeOutEnd) {
      const progress = (smoothScroll - thirdFadeOutStart) / TIMING.thirdFadeOutDuration;
      thirdOpacity = 1 - progress; // fade out
    } else {
      thirdOpacity = 0; // gone
    }
  }

  // Fourth section timing & opacity
  const thirdFadeOutStart = thirdFadeInEnd + TIMING.thirdHoldDuration;
  const thirdFadeOutEnd = thirdFadeOutStart + TIMING.thirdFadeOutDuration;
  const fourthFadeInStart = thirdFadeOutEnd + TIMING.gapAfterThird;
  const fourthFadeInEnd = fourthFadeInStart + TIMING.fourthFadeDuration;

  let fourthOpacity: number;
  if (smoothScroll < fourthFadeInStart) {
    fourthOpacity = 0;
  } else if (smoothScroll < fourthFadeInEnd) {
    fourthOpacity = (smoothScroll - fourthFadeInStart) / TIMING.fourthFadeDuration; // fade in
  } else if (smoothScroll < fourthFadeInEnd + TIMING.fourthHoldDuration) {
    fourthOpacity = 1; // hold
  } else {
    const fourthFadeOutStart = fourthFadeInEnd + TIMING.fourthHoldDuration;
    const fourthFadeOutEnd = fourthFadeOutStart + TIMING.fourthFadeOutDuration;
    if (smoothScroll < fourthFadeOutEnd) {
      const progress = (smoothScroll - fourthFadeOutStart) / TIMING.fourthFadeOutDuration;
      fourthOpacity = 1 - progress; // fade out
    } else {
      fourthOpacity = 0; // gone
    }
  }

  // Fifth section timing & opacity
  const fourthFadeOutStart = fourthFadeInEnd + TIMING.fourthHoldDuration;
  const fourthFadeOutEnd = fourthFadeOutStart + TIMING.fourthFadeOutDuration;
  const fifthFadeInStart = fourthFadeOutEnd + TIMING.gapAfterFourth;
  const fifthFadeInEnd = fifthFadeInStart + TIMING.fifthFadeDuration;
  const fifthHoldEnd = fifthFadeInEnd + TIMING.fifthHoldDuration;
  const fifthFadeOutStart = fifthHoldEnd;
  const fifthFadeOutEnd = fifthFadeOutStart + TIMING.fifthFadeOutDuration;
  const sixthFadeInStart = fifthFadeOutEnd + TIMING.gapAfterFifth;
  const sixthFadeInEnd = sixthFadeInStart + TIMING.sixthFadeDuration;

  let fifthOpacity: number;
  if (smoothScroll < fifthFadeInStart) {
    fifthOpacity = 0;
  } else if (smoothScroll < fifthFadeInEnd) {
    fifthOpacity = (smoothScroll - fifthFadeInStart) / TIMING.fifthFadeDuration; // fade in
  } else if (smoothScroll < fifthHoldEnd) {
    fifthOpacity = 1; // hold
  } else if (smoothScroll < fifthFadeOutEnd) {
    const progress = (smoothScroll - fifthFadeOutStart) / TIMING.fifthFadeOutDuration;
    fifthOpacity = 1 - progress; // fade out
  } else {
    fifthOpacity = 0;
  }

  // Sixth (RSVP) section opacity
  let sixthOpacity: number;
  if (smoothScroll < sixthFadeInStart) {
    sixthOpacity = 0;
  } else if (smoothScroll < sixthFadeInEnd) {
    sixthOpacity = (smoothScroll - sixthFadeInStart) / TIMING.sixthFadeDuration; // fade in
  } else {
    sixthOpacity = 1;
  }

  return (
    <main className="relative">
      {/* Welcome overlay */}
      {!isStarted && (
        <div className="fixed inset-0 z-[100] backdrop-blur-sm flex items-center justify-center">
          <div className="text-center flex flex-col items-center gap-4">
            <p className="text-3xl text-yellow-600 drop-shadow-lg">
              Presiona para abrir
            </p>
            <button
              onClick={handleStart}
              className="w-20 h-20 bg-white rounded-full hover:bg-gray-100 transition-all duration-200 shadow-lg hover:scale-110"
              aria-label="Abrir invitación"
            />
          </div>
        </div>
      )}

      {/** Debug info temporarily disabled
      <div className="fixed top-4 left-4 bg-black bg-opacity-75 text-white p-4 text-xs z-50 font-mono">
        <p>smoothScroll: {Math.round(smoothScroll)}</p>
        <p>contentScroll: {Math.round(contentScroll)}</p>
        <p>viewportHeight: {viewportHeight}</p>
        <p>section1 opacity: {textOpacity.toFixed(2)}</p>
        <p>section2 opacity: {secondOpacity.toFixed(2)}</p>
        <p>third opacity: {thirdOpacity.toFixed(2)}</p>
        <p>fourth opacity: {fourthOpacity.toFixed(2)}</p>
        <p>fifth opacity: {fifthOpacity.toFixed(2)}</p>
        <p>secondFadeInStart: {secondFadeInStart}</p>
        <p>secondFadeOutEnd: {secondFadeOutEnd}</p>
        <p>thirdFadeInStart: {thirdFadeInStart}</p>
        <p>fourthFadeInStart: {fourthFadeInStart}</p>
        <p>fifthFadeInStart: {fifthFadeInStart}</p>
      </div>
      */}

  {/* Scroll height control - increased to allow full fade + fifth section */}
  <div className="min-h-[800vh] bg-black"></div>

      {/* Fixed visual layer */}
      <div className="fixed inset-0 flex justify-center items-center overflow-hidden">
        {/* Gray mask area */}
        <div className="relative w-full max-w-[430px] sm:max-w-[480px] md:max-w-[520px] bg-gray-900 min-h-screen overflow-hidden">
          {/* Decorative curtains */}
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            {/* Left curtain */}
            <div
              className="absolute h-screen w-[390px] transition-transform duration-75 will-change-transform"
              style={{
                transform: `translateX(-${translateValue}px)`,
              }}
            >
              <img
                src={`${process.env.NODE_ENV === 'production' ? '/invitacionboda' : ''}/left.png`}
                alt="Left decoration"
                width={390}
                height={844}
                className="h-full w-auto"
              />
            </div>

            {/* Right curtain */}
            <div
              className="absolute h-screen w-[390px] transition-transform duration-75 will-change-transform"
              style={{
                transform: `translateX(${translateValue}px)`,
              }}
            >
              <img
                src={`${process.env.NODE_ENV === 'production' ? '/invitacionboda' : ''}/right.png`}
                alt="Right decoration"
                width={390}
                height={844}
                className="h-full w-auto"
              />
            </div>
          </div>

          {/* White scrolling content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 overflow-hidden">
            {/* White background column */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white shadow-lg max-w-[390px] w-full min-h-screen"></div>
            </div>

            {/* Section 1: Names and date - Scrolls up on top with transparent background */}
            <div 
              className="absolute inset-0 flex items-center justify-center z-10"
              style={{
                transform: `translateY(-${contentScroll}px)`,
                transition: 'transform 0.1s ease-out'
              }}
            >
              <article className="p-6 sm:p-8 md:p-10 max-w-[390px] w-full min-h-screen flex flex-col justify-center">
                <div>
                  <h1 
                    className="text-4xl sm:text-5xl md:text-6xl font-great-vibes text-gray-900 text-center mb-4 transition-opacity duration-150"
                    style={{ opacity: textOpacity }}
                  >
                    Ismael y Reyna
                  </h1>
                  <h3 
                    className="text-center text-2xl mb-2 transition-opacity duration-150"
                    style={{ opacity: textOpacity }}
                  >
                    27 de diciembre del 2025
                  </h3>
                  <h3 
                    className="text-center text-2xl transition-opacity duration-150"
                    style={{ opacity: textOpacity }}
                  >
                    05:00pm
                  </h3>
                </div>
              </article>
            </div>

            {/* Section 2: Invitation message - Fixed in background */}
            <div className="absolute inset-0 flex items-center justify-center z-0">
              <article className="p-6 sm:p-8 md:p-10 max-w-[390px] w-full min-h-screen flex flex-col justify-center">
                <div 
                  className="mb-6 flex flex-col items-center space-y-3 transition-opacity duration-150"
                  style={{ opacity: secondOpacity }}
                  aria-live="polite"
                >
                  <h2 className="text-gray-900 font-semibold text-3xl">Cuenta regresiva</h2>
                  {timeLeft.expired ? (
                    <div className="text-green-700 font-medium text-2xl">¡El gran día ha llegado! 💍</div>
                  ) : (
                    <div className="flex justify-center gap-3 text-sm">
                      <div className="flex flex-col items-center"><span className="text-2xl font-semibold">{timeLeft.days}</span><span className="uppercase tracking-wide text-gray-600 text-lg">Días</span></div>
                      <div className="flex flex-col items-center"><span className="text-2xl font-semibold">{timeLeft.hours.toString().padStart(2,'0')}</span><span className="uppercase tracking-wide text-gray-600 text-lg">Horas</span></div>
                      <div className="flex flex-col items-center"><span className="text-2xl font-semibold">{timeLeft.minutes.toString().padStart(2,'0')}</span><span className="uppercase tracking-wide text-gray-600 text-lg">Min</span></div>
                      <div className="flex flex-col items-center"><span className="text-2xl font-semibold">{timeLeft.seconds.toString().padStart(2,'0')}</span><span className="uppercase tracking-wide text-gray-600 text-lg">Seg</span></div>
                    </div>
                  )}
                </div>
                <p 
                  className="text-gray-800 text-center text-2xl leading-relaxed transition-opacity duration-150"
                  style={{ opacity: secondOpacity }}
                >
                  Nos complace hacerte partícipe de este momento tan especial. <br /> Queremos invitarte a nuestra boda; un evento lleno de amor y alegría donde tu presencia será profundamente apreciada. <br /> Esperamos compartir contigo este día inolvidable y celebrar juntos el inicio de una nueva etapa en nuestras vidas.
                </p>
              </article>
            </div>

            {/* Section 3: Family details - styled to match site */}
            <div className="absolute inset-0 flex items-center justify-center z-0">
              <article className="p-6 sm:p-8 md:p-10 max-w-[390px] w-full min-h-screen flex flex-col justify-center">
                <section
                  aria-labelledby="parents-title"
                  className="transition-opacity duration-150"
                  style={{ opacity: thirdOpacity }}
                >
                  <h2 id="parents-title" className="text-3xl text-gray-900 text-center">
                    Padres
                  </h2>
                  <div className="mt-3 h-0.5 w-16 bg-gray-200 mx-auto rounded"></div>
                  <p className="mt-3 text-center text-gray-600 text-xl">
                    Con la bendición y recuerdo de nuestros padres
                  </p>

                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
                    <ul className="space-y-1 text-gray-800">
                      <li className="text-xl">Trinidad Ortiz Piña <span aria-label="fallecido" title="fallecido">✝️</span></li>
                      <li className="text-xl">Guadalupe García Rosas <span aria-label="fallecido" title="fallecido">✝️</span></li>
                    </ul>
                    <ul className="space-y-1 text-gray-800">
                      <li className="text-xl">Rosa Mendez Moreno <span aria-label="fallecida" title="fallecida">✝️</span></li>
                      <li className="text-xl">Daniel Rodríguez Castellanos</li>
                    </ul>
                  </div>

                  <section
                    aria-labelledby="godparents-title"
                    className="mt-10 transition-opacity duration-150"
                    style={{ opacity: thirdOpacity }}
                  >
                    <h2 id="godparents-title" className="text-3xl text-gray-900 text-center">
                      Padrinos
                    </h2>
                    <div className="mt-3 h-0.5 w-16 bg-gray-200 mx-auto rounded"></div>
                    
                    <div className="mt-6 flex flex-col items-center space-y-2 text-center">
                      <p className="text-xl text-gray-800">Luis Alberto Hernández</p>
                      <p className="text-xl text-gray-800">Lucía Sánchez</p>
                    </div>
                  </section>
                </section>
              </article>
            </div>

            {/* Section 4: Church location - appears after section 3 fades out */}
            <div className="absolute inset-0 flex items-center justify-center z-0">
              <article className="p-6 sm:p-8 md:p-10 max-w-[390px] w-full min-h-screen flex flex-col justify-center">
                <section
                  aria-labelledby="church-title"
                  className="transition-opacity duration-150"
                  style={{ opacity: fourthOpacity }}
                >
                  <h2 id="church-title" className="text-3xl text-gray-900 text-center">
                    Ceremonia Religiosa
                  </h2>
                  <div className="mt-3 h-0.5 w-16 bg-gray-200 mx-auto rounded"></div>

                  {/* Church Image - Placeholder for now */}
                  <div className="mt-6 rounded-lg overflow-hidden shadow-md">
                    <img
                      src={`${process.env.NODE_ENV === 'production' ? '/invitacionboda' : ''}/iglesia.jpg`}
                      alt="Parroquia San Luis Obispo"
                      width={390}
                      height={260}
                      className="w-full h-auto object-cover"
                    />
                  </div>

                  {/* Church Name & Address */}
                  <div className="mt-6 text-center space-y-2">
                    <h3 className="text-2xl text-gray-900">
                      Parroquia &quot;San Luis Obispo&quot;
                    </h3>
                    <p className="text-xl text-gray-700">
                      Manzana 028<br />
                      55995 San Luis Tecuautitlán, Méx.
                    </p>
                  </div>

                  {/* Google Maps Link - Styled as Button */}
                  <div className="mt-6 flex justify-center">
                    <a
                      href="https://maps.app.goo.gl/SjobZHExmQxnLz7j6?g_st=awb"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white text-xl rounded-lg hover:bg-gray-800 transition-colors duration-200 shadow-md"
                      aria-label="Ver ubicación en Google Maps"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                      </svg>
                      Ver en Google Maps
                    </a>
                  </div>
                </section>
              </article>
            </div>

            {/* Section 5: Event venue location - appears after section 4 fades out */}
            <div className="absolute inset-0 flex items-center justify-center z-0">
              <article className="p-6 sm:p-8 md:p-10 max-w-[390px] w-full min-h-screen flex flex-col justify-center">
                <section
                  aria-labelledby="venue-title"
                  className="transition-opacity duration-150"
                  style={{ opacity: fifthOpacity }}
                >
                  <h2 id="venue-title" className="text-3xl text-gray-900 text-center">
                    Ubicación del Evento
                  </h2>
                  <div className="mt-3 h-0.5 w-16 bg-gray-200 mx-auto rounded"></div>

                  {/* Venue Image - Placeholder for now */}
                  <div className="mt-6 rounded-lg overflow-hidden shadow-md">
                    <img
                      src={`${process.env.NODE_ENV === 'production' ? '/invitacionboda' : ''}/thumbnail.jpeg`}
                      alt="Auditorio Municipal San Luis"
                      width={390}
                      height={260}
                      className="w-full h-auto object-cover"
                    />
                  </div>

                  {/* Venue Name & Address */}
                  <div className="mt-6 text-center space-y-2">
                    <h3 className="text-2xl text-gray-900">
                      Auditorio Municipal San Luis
                    </h3>
                    <p className="text-xl text-gray-700">
                      Manzana 022<br />
                      55995 San Luis Tecuautitlán, Méx.
                    </p>
                  </div>

                  {/* Google Maps Link - Styled as Button */}
                  <div className="mt-6 flex justify-center">
                    <a
                      href="https://maps.app.goo.gl/eSR2TcBj1gnWZsXm9"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white text-xl rounded-lg hover:bg-gray-800 transition-colors duration-200 shadow-md"
                      aria-label="Ver ubicación en Google Maps"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                      </svg>
                      Ver en Google Maps
                    </a>
                  </div>

                  {/* Gift Message */}
                  <div className="mt-8 text-center">
                    <p className="text-2xl italic text-gray-700">
                      El mejor regalo es tu presencia
                    </p>
                  </div>
                </section>
              </article>
            </div>

            {/* Section 6: RSVP WhatsApp - appears after section 5 fades out */}
            <div className="absolute inset-0 flex items-center justify-center z-0">
              <article className="p-6 sm:p-8 md:p-10 max-w-[390px] w-full min-h-screen flex flex-col justify-center">
                <section
                  aria-labelledby="rsvp-title"
                  className="transition-opacity duration-150"
                  style={{ opacity: sixthOpacity }}
                >
                  <h2 id="rsvp-title" className="text-3xl text-gray-900 text-center mb-8">
                    Desea confirmar su asistencia?
                  </h2>
                  <div className="flex justify-center">
                    <a
                      href="https://wa.me/525550726143?text=Hola!%20Quiero%20confirmar%20mi%20asistencia%20a%20la%20boda."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-8 py-4 bg-green-600 text-white text-2xl rounded-full hover:bg-green-700 transition-colors duration-200 shadow-lg font-semibold"
                      aria-label="Confirmar asistencia por WhatsApp"
                    >
                      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M20.52 3.48A11.87 11.87 0 0012 0C5.37 0 0 5.37 0 12c0 2.11.55 4.16 1.6 5.97L0 24l6.22-1.63A11.93 11.93 0 0012 24c6.63 0 12-5.37 12-12 0-3.19-1.24-6.19-3.48-8.52zM12 22c-1.85 0-3.67-.5-5.24-1.44l-.37-.22-3.69.97.99-3.59-.24-.37A9.94 9.94 0 012 12C2 6.48 6.48 2 12 2c2.54 0 4.93.99 6.73 2.77A9.93 9.93 0 0122 12c0 5.52-4.48 10-10 10zm5.2-7.6c-.28-.14-1.65-.81-1.9-.9-.25-.09-.43-.14-.61.14-.18.28-.7.9-.86 1.08-.16.18-.32.2-.6.07-.28-.14-1.18-.44-2.25-1.41-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.34.42-.51.14-.17.18-.29.28-.48.09-.19.05-.36-.02-.5-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.62-.47-.16-.01-.36-.01-.56-.01-.19 0-.5.07-.76.34-.26.27-1 1-.97 2.43.03 1.43 1.03 2.81 1.18 3 .15.19 2.03 3.1 4.93 4.23.69.3 1.23.48 1.65.61.69.22 1.32.19 1.82.12.56-.08 1.65-.67 1.88-1.32.23-.65.23-1.2.16-1.32-.07-.12-.25-.19-.53-.33z"/>
                      </svg>
                      Confirmar por WhatsApp
                    </a>
                  </div>
                </section>
              </article>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}