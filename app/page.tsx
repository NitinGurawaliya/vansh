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
  const songRef = useRef<HTMLAudioElement | null>(null);
  const touchStart = useRef<number | null>(null);

  const stopMusic = useCallback(() => {
    songRef.current?.pause();
  }, []);

  const startMusic = useCallback(() => {
    const song = songRef.current;
    if (!song) return;
    const playSegment = () => {
      song.currentTime = 16;
      song.play().catch(() => undefined);
    };
    if (song.readyState >= HTMLMediaElement.HAVE_METADATA) playSegment();
    else song.addEventListener("loadedmetadata", playSegment, { once: true });
  }, []);

  const openBook = () => { setIsOpen(true); startMusic(); };
  const closeBook = () => { setIsOpen(false); setPage(0); stopMusic(); };

  useEffect(() => () => stopMusic(), [stopMusic]);

  const turn = useCallback((direction: Direction) => {
    if (turning || (direction === "next" && page === PAGES.length - 1) || (direction === "previous" && page === 0)) return;
    setTurning(direction);
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

  useEffect(() => {
    PAGES.forEach((src) => { const image = new Image(); image.src = src; });
  }, []);

  const touchEnd = (event: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const difference = event.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(difference) > 42) turn(difference < 0 ? "next" : "previous");
    touchStart.current = null;
  };

  return (
    <main className="scene" onTouchStart={(e) => { touchStart.current = e.touches[0].clientX; }} onTouchEnd={touchEnd}>
      <audio ref={songRef} src="/music/dil-to-bachcha-hai.mp3" preload="auto" onTimeUpdate={(event) => {
        if (event.currentTarget.currentTime >= 124) event.currentTarget.currentTime = 16;
      }} />
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
            {turning && <div className="turning-sheet" onAnimationEnd={() => {
              setPage((current) => current + (turning === "next" ? 1 : -1));
              setTurning(null);
            }}><img src={PAGES[page]} alt="" /></div>}
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
