'use client';

import React, { useEffect, useRef, useState, useMemo, memo } from "react";
import Link from "next/link";
import { ArrowUpRight, Play, Pause, Loader2 } from "lucide-react";
import { Cinzel } from "next/font/google";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { motion, PanInfo } from "framer-motion";
import { CloudinaryResource } from "@/lib/cloudinary";
import LazyVideo from "@/components/LazyVideo";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["700"],
});

type WorkCardItem = {
  id: string;
  uniqueKey: string;
  video: string;
  poster: string;
};

// Cloudinary URL optimizers.
// f_auto -> serves WebM/AV1 to supporting browsers, q_auto -> smart compression,
// w_640 -> downscales from the 1276px original (card is only ~44vw wide).
const optimizeVideo = (url: string) =>
  url.replace("/upload/", "/upload/f_auto,q_auto,w_640/");

// so_0 grabs the first frame as a still image for the poster.
const optimizePoster = (url: string) =>
  url
    .replace("/upload/", "/upload/so_0,f_auto,q_auto,w_640/")
    .replace(/\.[^/.]+$/, ".jpg");

export default function OurWorkSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  const [worksList, setWorksList] = useState<WorkCardItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  // Which card is currently PLAYING. null = nothing plays. Only ever the center card.
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  // Whether the whole section is currently on screen. When false, nothing plays.
  const [sectionInView, setSectionInView] = useState<boolean>(true);

  // Cloudinary se videos fetch aur dupe logic
  useEffect(() => {
    let isMounted = true;

    async function fetchWorkVideos() {
      try {
        const res = await fetch("/api/videos?folder=Digitalixstudio/ourwork");
        if (!res.ok) throw new Error("Failed to fetch videos");

        const data: CloudinaryResource[] = await res.json();

        if (Array.isArray(data) && data.length > 0 && isMounted) {
          const formatted: WorkCardItem[] = data.map((item) => ({
            id: item.public_id,
            uniqueKey: `${item.public_id}-set1`,
            video: optimizeVideo(item.secure_url),
            poster: optimizePoster(item.secure_url),
          }));

          // 4 videos ko repeat karke 8 items ka smooth loop
          const duplicated: WorkCardItem[] = [
            ...formatted,
            ...formatted.map((item) => ({
              ...item,
              uniqueKey: `${item.id}-set2`,
            })),
          ];

          setWorksList(duplicated);
          setActiveIndex(Math.floor(duplicated.length / 2));
        }
      } catch (err) {
        console.error("Failed to load our work videos:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchWorkVideos();

    return () => {
      isMounted = false;
    };
  }, []);

  // GSAP & Smooth Scroll Trigger
  useEffect(() => {
    if (loading || worksList.length === 0) return;

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenis.on("scroll", ScrollTrigger.update);
    const updateTicker = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(updateTicker);
    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play reverse play reverse",
        },
      });

      if (headerRef.current) {
        tl.fromTo(
          headerRef.current,
          { opacity: 0, y: -25 },
          { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }
        );
      }

      if (buttonRef.current) {
        tl.fromTo(
          buttonRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
          "-=0.3"
        );
      }
    }, sectionRef);

    return () => {
      ctx.revert();
      gsap.ticker.remove(updateTicker);
      lenis.destroy();
    };
  }, [loading, worksList.length]);

  // Track whether the section is in view. When it leaves, stop any playback.
  useEffect(() => {
    const sectionEl = sectionRef.current;
    if (!sectionEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const inView = entry.isIntersecting;
        setSectionInView(inView);
        if (!inView) setPlayingKey(null); // section scrolled away -> pause everything
      },
      { threshold: 0.35 }
    );

    observer.observe(sectionEl);
    return () => observer.disconnect();
  }, []);

  const totalCards = worksList.length;

  // Moving the carousel always stops playback — the new center starts paused.
  const nextVideo = () => {
    if (totalCards === 0) return;
    setPlayingKey(null);
    setActiveIndex((prev) => (prev + 1) % totalCards);
  };

  const prevVideo = () => {
    if (totalCards === 0) return;
    setPlayingKey(null);
    setActiveIndex((prev) => (prev - 1 + totalCards) % totalCards);
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 40;
    const velocityThreshold = 250;

    if (info.offset.x < -swipeThreshold || info.velocity.x < -velocityThreshold) {
      nextVideo();
    } else if (info.offset.x > swipeThreshold || info.velocity.x > velocityThreshold) {
      prevVideo();
    }
  };

  // Clicking a SIDE card: bring it to center, but DO NOT auto-play (starts paused).
  const focusCard = (index: number) => {
    if (index === activeIndex) return;
    setPlayingKey(null); // stop whatever was playing before
    setActiveIndex(index);
  };

  // Clicking the play/pause button on the CENTER card: toggle playback.
  const toggleCenterPlayback = (uniqueKey: string) => {
    setPlayingKey((prev) => (prev === uniqueKey ? null : uniqueKey));
  };

  return (
    <section
      id="our-work"
      ref={sectionRef}
      className="relative w-full bg-[#06030a] text-white flex flex-col items-center justify-center py-12 sm:py-16 md:py-24 overflow-hidden selection:bg-purple-500/30"
    >
      {/* Curved Screen ClipPath */}
      <svg className="absolute w-0 h-0 overflow-hidden" aria-hidden="true">
        <defs>
          <clipPath id="curvedScreenClip" clipPathUnits="objectBoundingBox">
            <path d="M 0.02 0.06 Q 0.5 0.14 0.98 0.06 C 0.99 0.06 1 0.08 1 0.11 L 1 0.89 C 1 0.92 0.99 0.94 0.98 0.94 Q 0.5 0.86 0.02 0.94 C 0.01 0.94 0 0.92 0 0.89 L 0 0.11 C 0 0.08 0.01 0.06 0.02 0.06 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[700px] md:w-[1100px] h-[220px] sm:h-[400px] md:h-[600px] bg-purple-600/15 blur-[120px] sm:blur-[170px] rounded-full pointer-events-none" />

      {/* Header */}
      <div
        ref={headerRef}
        className={`z-10 text-center max-w-4xl mx-auto mb-8 sm:mb-12 md:mb-16 px-4 ${cinzel.className}`}
      >
        <p className="text-[10px] sm:text-xs md:text-sm uppercase tracking-[0.3em] sm:tracking-[0.4em] text-purple-300/70 mb-1.5 sm:mb-2">
          Featured Showreel & Cinematic Edits
        </p>
        <h2 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-wider uppercase bg-gradient-to-b from-white via-purple-100 to-purple-300 bg-clip-text text-transparent drop-shadow-2xl">
          OUR WORK
        </h2>
      </div>

      {/* Carousel */}
      {loading ? (
        <div className="flex justify-center items-center h-[220px] sm:h-[340px] md:h-[440px]">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      ) : (
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.15}
          onDragEnd={handleDragEnd}
          className="relative z-10 w-full h-[220px] sm:h-[340px] md:h-[440px] flex items-center justify-center cursor-grab active:cursor-grabbing px-2 select-none"
          style={{ perspective: "1200px" }}
        >
          <div className="relative w-full max-w-[1280px] h-full flex items-center justify-center">
            {worksList.map((item, index) => {
              let offset = index - activeIndex;
              const half = totalCards / 2;

              if (offset > half) offset -= totalCards;
              if (offset < -half) offset += totalCards;

              const isCenter = offset === 0;

              return (
                <WorkCard
                  key={item.uniqueKey}
                  item={item}
                  offset={offset}
                  isCenter={isCenter}
                  // A card is allowed to play ONLY if it's the center card,
                  // it's the one marked playing, AND the section is on screen.
                  isPlaying={isCenter && playingKey === item.uniqueKey && sectionInView}
                  onFocus={() => focusCard(index)}
                  onTogglePlay={() => toggleCenterPlayback(item.uniqueKey)}
                />
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Button */}
      <div ref={buttonRef} className="z-10 mt-10 sm:mt-14 md:mt-20 shrink-0 relative group/btn px-4">
        <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-600 via-fuchsia-500 to-purple-600 opacity-40 blur-md group-hover/btn:opacity-80 transition-opacity duration-300" />
        <Link
          href="/#book-call"
          className="relative inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider text-white overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 border border-purple-400/30 bg-[#120824]/90"
        >
          <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12" />
          <span className="relative z-10">Craft Your Next Story</span>
          <ArrowUpRight className="relative z-10 w-3.5 sm:w-4 h-3.5 sm:h-4 transition-transform duration-300 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 text-purple-300" />
        </Link>
      </div>
    </section>
  );
}

/* Individual Work Card */
type WorkCardProps = {
  item: WorkCardItem;
  offset: number;
  isCenter: boolean;
  isPlaying: boolean;
  onFocus: () => void;      // bring a side card to center (no autoplay)
  onTogglePlay: () => void; // play/pause the center card
};

const WorkCard = memo(function WorkCard({
  item,
  offset,
  isCenter,
  isPlaying,
  onFocus,
  onTogglePlay,
}: WorkCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const absOffset = Math.abs(offset);

  // Only the center card and its immediate neighbours mount a real <video>.
  // Everything else is a static poster image — cheap and identical-looking at
  // that angle/opacity.
  const shouldRenderVideo = absOffset <= 1;

  // Single source of truth for playback.
  // A video plays ONLY when this exact card is the center AND marked playing.
  // In every other case (not center, not playing, section off-screen) -> pause.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isCenter && isPlaying) {
      video.muted = false;
      const p = video.play();
      if (p !== undefined) {
        p.catch(() => {
          // Autoplay-with-sound blocked -> retry muted so it still plays.
          video.muted = true;
          video.play().catch(() => {});
        });
      }
    } else {
      video.pause();
      // Reset non-center videos to the first frame so they show a clean poster.
      if (!isCenter) {
        try {
          video.currentTime = 0;
        } catch {
          /* no-op */
        }
      }
    }
  }, [isCenter, isPlaying]);

  // Card Transform Positioning
  const cardStyle = useMemo((): React.CSSProperties => {
    const sign = Math.sign(offset);

    if (absOffset === 0) {
      return {
        transform: "translateX(0%) scale(1) translateZ(0px) rotateY(0deg)",
        zIndex: 40,
        opacity: 1,
        filter: "brightness(100%)",
        pointerEvents: "auto",
      };
    } else if (absOffset === 1) {
      return {
        transform: `translateX(${sign * 62}%) scale(0.82) translateZ(-100px) rotateY(${sign * -22}deg)`,
        zIndex: 25,
        opacity: 0.85,
        filter: "brightness(75%)",
        pointerEvents: "auto",
      };
    } else if (absOffset === 2) {
      return {
        transform: `translateX(${sign * 112}%) scale(0.68) translateZ(-220px) rotateY(${sign * -35}deg)`,
        zIndex: 15,
        opacity: 0.45,
        filter: "brightness(50%)",
        pointerEvents: "auto",
      };
    }

    return {
      transform: `translateX(${sign * 160}%) scale(0.5) rotateY(${sign * -45}deg)`,
      zIndex: 0,
      opacity: 0,
      pointerEvents: "none",
    };
  }, [offset, absOffset]);

  // Clicking anywhere on a side card just focuses it (brings to center).
  const handleCardClick = () => {
    if (!isCenter) onFocus();
  };

  // Clicking the play/pause button (center only) toggles playback,
  // and must not also trigger the card-focus handler.
  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCenter) onTogglePlay();
  };

  return (
    <div
      onClick={handleCardClick}
      className="group absolute w-[72vw] sm:w-[50vw] md:w-[44vw] max-w-[580px] aspect-[16/9] transition-all duration-500 ease-out cursor-pointer transform-gpu select-none"
      style={{
        ...cardStyle,
        // Reflection mirrors the whole card (incl. video) — expensive. Center only.
        WebkitBoxReflect: isCenter
          ? "below 8px linear-gradient(transparent 65%, rgba(0, 0, 0, 0.45))"
          : "none",
        willChange: absOffset <= 1 ? "transform" : "auto",
      }}
    >
      <div
        className={`relative w-full h-full transition-all duration-500 ${
          isCenter ? "drop-shadow-[0_15px_30px_rgba(168,85,247,0.45)]" : "hover:opacity-100"
        }`}
      >
        <div className="relative w-full h-full">
          <div
            className="relative w-full h-full bg-[#0a0514] overflow-hidden"
            style={{ clipPath: "url(#curvedScreenClip)" }}
          >
            {shouldRenderVideo ? (
              <LazyVideo
                ref={videoRef}
                src={item.video}
                poster={item.poster}
                className="w-full h-full object-cover scale-105 pointer-events-none"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.poster}
                alt=""
                loading="lazy"
                className="w-full h-full object-cover scale-105 pointer-events-none"
              />
            )}

            {/* Gradient Dimmer */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/60 pointer-events-none" />

            {/* Play/Pause control.
                - Center + paused: overlay visible, button clickable (invites play).
                - Center + playing: overlay hidden, appears on hover to allow pause.
                - Side cards: only a hover hint; clicking the card focuses it. */}
            {shouldRenderVideo && (
              <div
                className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
                  isCenter && isPlaying
                    ? "opacity-0 group-hover:opacity-100 bg-black/25"
                    : isCenter
                    ? "opacity-100 bg-black/25"
                    : "opacity-0 group-hover:opacity-100 bg-black/35 backdrop-blur-[2px]"
                }`}
              >
                <button
                  type="button"
                  aria-label={isCenter && isPlaying ? "Pause video" : "Play video"}
                  onClick={handleButtonClick}
                  className={`p-3.5 sm:p-4 bg-purple-600/90 hover:bg-purple-500 rounded-full text-white backdrop-blur-md shadow-xl border border-purple-300/40 transform transition-transform duration-300 group-hover:scale-110 active:scale-95 ${
                    isCenter ? "pointer-events-auto cursor-pointer" : "pointer-events-none"
                  }`}
                >
                  {isCenter && isPlaying ? (
                    <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current ml-0.5" />
                  )}
                </button>
              </div>
            )}
          </div>

          {/* SVG Border Effect — gradient on center, cheap flat stroke elsewhere. */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-20"
            viewBox="0 0 1000 562.5"
            preserveAspectRatio="none"
          >
            {isCenter && (
              <defs>
                <linearGradient
                  id={`borderGrad-${item.uniqueKey}`}
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#d8b4fe" stopOpacity="0.9" />
                  <stop offset="50%" stopColor="#a855f7" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#c026d3" stopOpacity="0.9" />
                </linearGradient>
              </defs>
            )}
            <path
              d="M 20 34 Q 500 78 980 34 C 990 34 1000 45 1000 62 L 1000 500 C 1000 517 990 528 980 528 Q 500 484 20 528 C 10 528 0 517 0 500 L 0 62 C 0 45 10 34 20 34 Z"
              fill="none"
              stroke={isCenter ? `url(#borderGrad-${item.uniqueKey})` : "#a855f7"}
              strokeOpacity={isCenter ? 1 : 0.35}
              strokeWidth={isCenter ? "4" : "2.5"}
            />
          </svg>
        </div>
      </div>
    </div>
  );
});

WorkCard.displayName = "WorkCard";