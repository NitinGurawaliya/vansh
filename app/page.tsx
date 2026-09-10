"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const PAGES = [
  "/pages/page_1.jpeg",
  "/pages/page_2.jpeg",
  "/pages/page_3.jpeg",
  "/pages/page_4.jpeg",
  "/pages/page_5.jpeg",
];

const COVER_TITLE = "For You, Vansh ♡";
const COVER_SUBTITLE = "A little something before you go...";

type Direction = "next" | "previous";

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [turning, setTurning] = useState<Direction | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const musicTimer = useRef<number | null>(null);
  const touchStart = useRef<number | null>(null);

  const context = useCallback(() => {
    if (!audioContext.current) audioContext.current = new AudioContext();
    if (audioContext.current.state === "suspended") audioContext.current.resume();
    return audioContext.current;
  }, []);

  const note = useCallback((frequency: number, start: number, duration: number, volume = 0.035) => {
    const ctx = context();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(volume, start + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.03);
  }, [context]);

  const stopMusic = useCallback(() => {
    if (musicTimer.current !== null) {
      window.clearInterval(musicTimer.current);
      musicTimer.current = null;
    }
  }, []);

  const startMusic = useCallback(() => {
    stopMusic();
    const ctx = context();
    const melody = [523.25, 659.25, 783.99, 659.25, 587.33, 659.25, 523.25, 493.88];
    let step = 0;
    const playBar = () => {
      const now = ctx.currentTime;
      for (let index = 0; index < 4; index++) {
        const frequency = melody[(step + index) % melody.length];
        note(frequency, now + index * 0.48, 0.42, 0.018);
        note(frequency / 2, now + index * 0.48, 0.36, 0.009);
      }
      step = (step + 4) % melody.length;
    };
    playBar();
    musicTimer.current = window.setInterval(playBar, 1920);
  }, [context, note, stopMusic]);

  const openBook = () => { setIsOpen(true); startMusic(); };
  const closeBook = () => { setIsOpen(false); setPage(0); stopMusic(); };

  useEffect(() => () => stopMusic(), [stopMusic]);

  const turn = useCallback((direction: Direction) => {
    if (turning || (direction === "next" && page === PAGES.length - 1) || (direction === "previous" && page === 0)) return;
    setTurning(direction);
    // The new page stays below the turning sheet and is only committed at its end.
    window.setTimeout(() => { setPage((current) => current + (direction === "next" ? 1 : -1)); }, 700);
    window.setTimeout(() => setTurning(null), 730);
  }, [page, turning]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!isOpen) return;
      if (event.key === "ArrowRight") turn("next");
      if (event.key === "ArrowLeft") turn("previous");
      if (event.key === "Escape") closeBook();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, turn]);

  const touchEnd = (event: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const difference = event.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(difference) > 42) turn(difference < 0 ? "next" : "previous");
    touchStart.current = null;
  };

  return (
    <main className="scene" onTouchStart={(e) => { touchStart.current = e.touches[0].clientX; }} onTouchEnd={touchEnd}>
      {!isOpen ? (
        <button className="cover-wrap" onClick={openBook} aria-label="Open the book">
          <span className="book-cover"><span className="cover-ring">✦</span><span className="cover-title">{COVER_TITLE}</span><span className="cover-line" /><span className="cover-subtitle">{COVER_SUBTITLE}</span><span className="cover-hint">tap to open</span></span>
        </button>
      ) : (
        <section className="reader" aria-label={`Page ${page + 1} of ${PAGES.length}`}>
          <div className="book-shadow" />
          <div className={`book ${turning ? `is-turning turn-${turning}` : ""}`}>
            <div className="paper paper-back"><img src={PAGES[turning === "next" ? Math.min(page + 1, 4) : Math.max(page - 1, 0)]} alt="" /></div>
            <div className="paper paper-current"><img src={PAGES[page]} alt={`Book page ${page + 1}`} /></div>
            {turning && <div className="turning-sheet"><img src={PAGES[page]} alt="" /></div>}
            <div className="spine" />
          </div>
          <button className="tap-zone left" onClick={() => turn("previous")} aria-label="Previous page" />
          <button className="tap-zone right" onClick={() => turn("next")} aria-label="Next page" />
          {page === PAGES.length - 1 && <button className="return" onClick={closeBook}>Close this little book ♡</button>}
        </section>
      )}
    </main>
  );
}
