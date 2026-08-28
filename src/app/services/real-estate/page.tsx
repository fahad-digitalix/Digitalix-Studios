'use client';

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { Cinzel } from "next/font/google";
import {
  Zap,
  Check,
  Video,
  Wand2,
  Volume2,
  Layers,
  Clock,
  ArrowRight,
  ArrowUpRight,
  PhoneCall,
  CreditCard,
  Infinity as InfinityIcon,
  RotateCcw,
  Loader2,
  Play,
  Pause,
  Music,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CloudinaryResource } from "@/lib/cloudinary";
import LazyVideo from "@/components/LazyVideo";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const cinzel = Cinzel({ subsets: ["latin"], weight: ["700", "900"] });

// --- DATA CONFIGURATIONS ---
const heroFeatures = [
  { icon: Video, title: "Premium Texting", desc: "4-5 Variations" },
  { icon: Wand2, title: "AI Staging", desc: "1-2 Concepts" },
  { icon: Volume2, title: "Sound Design", desc: "SFX & Audio Polish" },
  { icon: Music, title: "Licensed Music", desc: "Copyright cleared" },
  { icon: Layers, title: "Transitions", desc: "Seamless Flow" },
  { icon: Clock, title: "24-48hr Delivery", desc: "Per Video" },
];

interface VideoItem {
  id: string;
  video: string;
  poster: string;
}

interface FeatureItem {
  text: string;
  included: boolean;
}

interface PricingPlan {
  id: string;
  badge: string;
  originalPrice: string;
  price: string;
  videosCount: string;
  perVideoPrice: string;
  description: string;
  features: FeatureItem[];
  isPopular?: boolean;
}

const pricingPlans: PricingPlan[] = [
  {
    id: "10-vid",
    badge: "STARTER",
    originalPrice: "$500",
    price: "$300",
    videosCount: "10 Videos",
    perVideoPrice: "$30/Video",
    description: "Ideal for individual property tours & quick listings.",
    features: [
      { text: "4-5 Premium Texting Variations", included: true },
      { text: "High-Impact Speed Ramping", included: true },
      { text: "AI Virtual Staging Enhancements", included: true },
      { text: "Unlimited Free Revisions", included: true },
      { text: "24-48 Hour Fast Turnaround", included: true },
    ],
    isPopular: false,
  },
  {
    id: "20-vid",
    badge: "MOST POPULAR",
    originalPrice: "$1,000",
    price: "$500",
    videosCount: "20 Videos",
    perVideoPrice: "$25/Video",
    description: "Perfect for active agents & luxury property showcases.",
    features: [
      { text: "4-5 Premium Texting Variations", included: true },
      { text: "High-Impact Speed Ramping", included: true },
      { text: "AI Virtual Staging Enhancements", included: true },
      { text: "Unlimited Free Revisions", included: true },
      { text: "24-48 Hour Fast Turnaround", included: true },
    ],
    isPopular: true,
  },
  {
    id: "30-vid",
    badge: "PLATINUM",
    originalPrice: "$1,500",
    price: "$700",
    videosCount: "30 Videos",
    perVideoPrice: "$23.3/Video",
    description: "Complete video content solution for real estate teams.",
    features: [
      { text: "4-5 Premium Texting Variations", included: true },
      { text: "High-Impact Speed Ramping", included: true },
      { text: "AI Virtual Staging Enhancements", included: true },
      { text: "Unlimited Free Revisions", included: true },
      { text: "24-48 Hour Fast Turnaround", included: true },
    ],
    isPopular: false,
  },
];

// Interactive Clickable Video Card Component with Controlled Single-Playback State
function InteractiveVideoCard({
  item,
  isPlaying,
  onTogglePlay,
  isDragging,
}: {
  item: VideoItem;
  isPlaying: boolean;
  onTogglePlay: () => void;
  isDragging: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.muted = false;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          video.muted = true;
          video.play().catch(() => { });
        });
      }
    } else {
      video.pause();
      video.currentTime = 0;
      video.muted = true;
    }
  }, [isPlaying]);

  const handleClick = () => {
    if (isDragging) return;
    onTogglePlay();
  };

  return (
    <div
      onClick={handleClick}
      className="relative aspect-[9/16] w-[70vw] xs:w-[210px] sm:w-[240px] md:w-[270px] lg:w-[290px] xl:w-[320px] 2xl:w-[380px] rounded-[24px] xl:rounded-[32px] 2xl:rounded-[40px] overflow-hidden border border-purple-500/40 shadow-[0_10px_35px_rgba(0,0,0,0.8)] group bg-[#0d071a] transition-all duration-300 cursor-pointer select-none"
    >
      <LazyVideo
        ref={videoRef}
        src={item.video}
        poster={item.poster}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 pointer-events-none"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

      {/* Play/Pause Button Overlay strictly on Hover */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/30 transition-opacity duration-300 pointer-events-none">
        <div className="p-4 bg-purple-600/90 hover:bg-purple-500 rounded-full text-white backdrop-blur-md shadow-xl border border-purple-300/40 transform transition-transform duration-300 group-hover:scale-110">
          {isPlaying ? (
            <Pause className="w-6 h-6 fill-current" />
          ) : (
            <Play className="w-6 h-6 fill-current ml-0.5" />
          )}
        </div>
      </div>
    </div>
  );
}

// 3-in-1 Carousel Hook (Pointer Drag, Horizontal Wheel, & Buttons)
function useCarouselController() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const velXRef = useRef(0);
  const lastXRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);

  const stopMomentum = () => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  };

  const momentumLoop = () => {
    if (!containerRef.current) return;
    containerRef.current.scrollLeft -= velXRef.current;
    velXRef.current *= 0.92;
    if (Math.abs(velXRef.current) > 0.5) {
      rafIdRef.current = requestAnimationFrame(momentumLoop);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    stopMomentum();
    isDraggingRef.current = true;
    startXRef.current = e.pageX - containerRef.current.offsetLeft;
    scrollLeftRef.current = containerRef.current.scrollLeft;
    lastXRef.current = e.pageX;
    velXRef.current = 0;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.3;

    if (Math.abs(x - (startXRef.current + containerRef.current.offsetLeft)) > 4) {
      if (!isDragging) setIsDragging(true);
    }

    containerRef.current.scrollLeft = scrollLeftRef.current - walk;
    velXRef.current = e.pageX - lastXRef.current;
    lastXRef.current = e.pageX;
  };

  const handlePointerUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setTimeout(() => setIsDragging(false), 50);
    rafIdRef.current = requestAnimationFrame(momentumLoop);
  };

  const scrollByAmount = useCallback((offset: number) => {
    if (containerRef.current) {
      stopMomentum();
      containerRef.current.scrollBy({
        left: offset,
        behavior: "smooth",
      });
    }
  }, []);

  return {
    ref: containerRef,
    isDragging,
    scrollByAmount,
    events: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerLeave: handlePointerUp,
      onPointerCancel: handlePointerUp,
    }
  };
}

export default function RealEstateServicePage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const ourWorkSectionRef = useRef<HTMLDivElement>(null);
  const beforeAfterSectionRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLDivElement>(null);

  const [ourWorkList, setOurWorkList] = useState<VideoItem[]>([]);
  const [beforeAfterCards, setBeforeAfterCards] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Single playing video tracker across the entire page
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  const {
    ref: ourWorkScrollRef,
    isDragging: isOurWorkDragging,
    scrollByAmount: scrollOurWork,
    events: ourWorkEvents
  } = useCarouselController();

  const {
    ref: beforeAfterScrollRef,
    isDragging: isBeforeAfterDragging,
    scrollByAmount: scrollBeforeAfter,
    events: beforeAfterEvents
  } = useCarouselController();

  // Cloudinary Fetch and Filter Logic
  useEffect(() => {
    async function fetchRealEstateMedia() {
      try {
        const res = await fetch("/api/videos?folder=Digitalixstudio/realstate");
        const data: CloudinaryResource[] = await res.json();

        if (Array.isArray(data)) {
          const work: VideoItem[] = [];
          const beforeAfter: VideoItem[] = [];

          data.forEach((item) => {
            const fileName = item.public_id.split('/').pop()?.toLowerCase() || '';

            if (fileName.includes('realstatehome')) return;

            const videoItem: VideoItem = {
              id: item.public_id,
              video: item.secure_url,
              poster: item.secure_url.replace(/\.[^/.]+$/, ".jpg")
            };

            if (fileName.startsWith('ba')) {
              beforeAfter.push(videoItem);
            } else if (fileName.startsWith('r')) {
              work.push(videoItem);
            }
          });

          setOurWorkList(work);
          setBeforeAfterCards(beforeAfter);
        }
      } catch (err) {
        console.error("Error fetching Real Estate videos:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchRealEstateMedia();
  }, []);

  // Viewport Observer: Screen se bahar hote hi playing video auto-pause ho jaye
  useEffect(() => {
    const sections = [ourWorkSectionRef.current, beforeAfterSectionRef.current].filter(Boolean) as HTMLDivElement[];
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            // Check if playing video belongs to the section that scrolled out
            const sectionVideos = entry.target.querySelectorAll("video");
            sectionVideos.forEach((vid) => {
              if (!vid.paused) {
                setPlayingVideoId(null);
              }
            });
          }
        });
      },
      { threshold: 0.15 }
    );

    sections.forEach((sec) => observer.observe(sec));
    return () => observer.disconnect();
  }, [ourWorkList, beforeAfterCards]);

  useEffect(() => {
    const centerScroll = (el: HTMLDivElement | null) => {
      if (el && el.scrollWidth > el.clientWidth) {
        el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
      }
    };
    centerScroll(ourWorkScrollRef.current);
    centerScroll(beforeAfterScrollRef.current);
  }, [ourWorkScrollRef, beforeAfterScrollRef, ourWorkList, beforeAfterCards]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".fade-up", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: pageRef.current,
          start: "top 80%",
        },
      });
    }, pageRef);
    return () => ctx.revert();
  }, []);

  const handleTogglePlay = (id: string) => {
    setPlayingVideoId((prevId) => (prevId === id ? null : id));
  };

  return (
    <div ref={pageRef} className="w-full bg-[#06030a] text-white min-h-screen selection:bg-purple-600 selection:text-white overflow-hidden">
      {/* Background Glow */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[600px] md:w-[1000px] 2xl:w-[1400px] h-[400px] 2xl:h-[600px] bg-purple-600/10 blur-[180px] rounded-full pointer-events-none z-0" />

      {/* HERO SECTION */}
      <section className="relative z-10 w-full flex flex-col items-center justify-center pt-32 pb-16 md:pt-44 md:pb-24 2xl:pt-56 2xl:pb-32 px-4 sm:px-6 max-w-7xl 2xl:max-w-[1700px] mx-auto">
        <div className={`z-10 text-center max-w-5xl 2xl:max-w-7xl mx-auto px-4 ${cinzel.className}`}>
          {/* Badge Section */}
          <div className="flex items-center justify-center gap-3 mb-6 sm:mb-8 font-sans">
            <span className="w-8 sm:w-14 2xl:w-20 h-[1px] bg-gradient-to-r from-transparent to-purple-400/60" />
            <p className="text-xs sm:text-sm md:text-base 2xl:text-xl uppercase tracking-[0.35em] sm:tracking-[0.45em] text-purple-300/80 font-bold">
              REAL ESTATE MEDIA
            </p>
            <span className="w-8 sm:w-14 2xl:w-20 h-[1px] bg-gradient-to-l from-transparent to-purple-400/60" />
          </div>

          {/* MAIN HEADLINE */}
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[100px] 2xl:text-[130px] font-black tracking-wider uppercase bg-gradient-to-b from-white via-purple-100 to-purple-300 bg-clip-text text-transparent drop-shadow-2xl leading-[1.08] my-4">
            REAL ESTATE
          </h1>

          {/* DESCRIPTION */}
          <p className="font-sans text-slate-200 text-sm sm:text-base md:text-lg lg:text-xl 2xl:text-2xl mt-8 sm:mt-10 2xl:mt-12 font-normal tracking-wide max-w-3xl 2xl:max-w-5xl mx-auto leading-relaxed drop-shadow-sm">
            Transforming luxury properties and agent listings into high-converting, cinematic visual experiences engineered for maximum engagement.
          </p>

          {/* Action Buttons Section */}
          <div
            ref={btnRef}
            className="mt-10 sm:mt-12 lg:mt-14 2xl:mt-16 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 lg:gap-8 w-full sm:w-auto px-4 sm:px-0 font-sans"
          >
            <Link
              href="/#book-call"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-500 px-7 sm:px-9 lg:px-10 2xl:px-14 py-3.5 sm:py-4 lg:py-4.5 2xl:py-6 text-xs sm:text-sm lg:text-base 2xl:text-xl font-bold uppercase tracking-wider text-white transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl shadow-purple-500/30"
            >
              <span>Book a Call</span>
              <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5 2xl:w-7 2xl:h-7" />
            </Link>

            <div className="relative group/btn w-full sm:w-auto">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-600 via-fuchsia-500 to-purple-600 opacity-40 blur-md group-hover/btn:opacity-80 transition-opacity duration-300" />
              <Link
                href="https://wa.me/message/FGRAWQHXJE5IP1"
                target="_blank"
                className="relative w-full sm:w-auto inline-flex items-center justify-center gap-3 px-7 sm:px-9 lg:px-10 2xl:px-14 py-3.5 sm:py-4 lg:py-4.5 2xl:py-6 rounded-full text-xs sm:text-sm lg:text-base 2xl:text-xl font-bold uppercase tracking-wider text-white overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 border border-purple-400/30 bg-[#120824]/90"
              >
                <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12" />
                <span className="relative z-10">WhatsApp Us</span>
                <ArrowUpRight className="relative z-10 w-4 h-4 lg:w-5 lg:h-5 2xl:w-7 2xl:h-7 transition-transform duration-300 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 text-purple-300" />
              </Link>
            </div>
          </div>
        </div>

        {/* HERO FEATURES BAR */}
        <div className="w-full max-w-7xl 2xl:max-w-[1700px] mx-auto mt-16 md:mt-24 2xl:mt-32 px-2 sm:px-4 fade-up z-10">
          <div className="w-full py-6 2xl:py-10 px-5 sm:px-8 2xl:px-12 rounded-2xl md:rounded-full bg-[#0e0720]/90 border border-purple-400/40 backdrop-blur-xl shadow-[0_0_35px_rgba(168,85,247,0.2)]">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-6 2xl:gap-x-10 items-center justify-center">
              {heroFeatures.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="flex items-center gap-3 2xl:gap-4 justify-start sm:justify-center">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 2xl:w-14 2xl:h-14 rounded-xl 2xl:rounded-2xl bg-purple-950/90 border border-purple-400/60 flex items-center justify-center text-purple-200 shrink-0 shadow-[0_0_12px_rgba(168,85,247,0.3)]">
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5 2xl:w-7 2xl:h-7 stroke-[2.2]" />
                    </div>
                    <div className="text-left font-sans whitespace-nowrap">
                      <strong className="block text-white font-extrabold text-xs sm:text-sm lg:text-[15px] 2xl:text-lg leading-tight tracking-wide">
                        {item.title}
                      </strong>
                      <span className="text-[11px] sm:text-xs 2xl:text-sm text-purple-200/90 font-medium">
                        {item.desc}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ================= OUR WORK SECTION ================= */}
      <section
        id="our-work"
        ref={ourWorkSectionRef}
        className="relative w-full bg-[#06030a] text-white flex flex-col items-center justify-center py-16 sm:py-20 md:py-28 2xl:py-36 overflow-hidden select-none border-t border-purple-950/40"
      >
        <div className={`z-10 text-center max-w-4xl 2xl:max-w-6xl mx-auto mb-12 sm:mb-16 2xl:mb-20 px-4 ${cinzel.className}`}>
          <p className="text-[10px] sm:text-xs md:text-sm 2xl:text-lg uppercase tracking-[0.3em] sm:tracking-[0.4em] text-purple-300/70 mb-2">
            Featured Showreel & Vertical Edits
          </p>
          <h2 className="text-3xl sm:text-5xl md:text-7xl 2xl:text-8xl font-black tracking-wider uppercase bg-gradient-to-b from-white via-purple-100 to-purple-300 bg-clip-text text-transparent drop-shadow-2xl">
            OUR WORK
          </h2>
        </div>

        {/* Relative Container with Edge Action Buttons */}
        <div className="relative z-10 w-full max-w-[2200px] mx-auto px-2 sm:px-4 group/carousel">
          {/* Edge Floating Left Button */}
          <button
            onClick={() => scrollOurWork(-450)}
            aria-label="Previous Videos"
            className="absolute left-2 sm:left-6 lg:left-10 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3.5 lg:p-4 rounded-full border border-purple-400/40 bg-[#0d071a]/90 text-purple-200 hover:bg-purple-600 hover:text-white backdrop-blur-md transition-all duration-300 shadow-[0_0_25px_rgba(168,85,247,0.4)] active:scale-90 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Edge Floating Right Button */}
          <button
            onClick={() => scrollOurWork(450)}
            aria-label="Next Videos"
            className="absolute right-2 sm:right-6 lg:right-10 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3.5 lg:p-4 rounded-full border border-purple-400/40 bg-[#0d071a]/90 text-purple-200 hover:bg-purple-600 hover:text-white backdrop-blur-md transition-all duration-300 shadow-[0_0_25px_rgba(168,85,247,0.4)] active:scale-90 cursor-pointer"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {loading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
          ) : (
            <div
              ref={ourWorkScrollRef}
              {...ourWorkEvents}
              className={`flex overflow-x-auto gap-4 sm:gap-6 md:gap-8 lg:gap-10 2xl:gap-12 px-12 sm:px-20 md:px-24 2xl:px-28 pb-6 items-center ${ourWorkList.length <= 4 ? "justify-center" : "justify-start"
                } scrollbar-none cursor-grab active:cursor-grabbing select-none touch-pan-x [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}
            >
              {ourWorkList.map((item) => (
                <div key={item.id} className="shrink-0">
                  <InteractiveVideoCard
                    item={item}
                    isPlaying={playingVideoId === item.id}
                    onTogglePlay={() => handleTogglePlay(item.id)}
                    isDragging={isOurWorkDragging}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ================= BEFORE / AFTER SECTION ================= */}
      <section
        id="before-after"
        ref={beforeAfterSectionRef}
        className="relative z-10 w-full py-16 sm:py-20 md:py-28 2xl:py-36 border-t border-purple-950/40 bg-[#06030a] select-none"
      >
        <div className={`z-10 text-center max-w-4xl 2xl:max-w-6xl mx-auto mb-12 sm:mb-16 2xl:mb-20 px-4 ${cinzel.className}`}>
          <p className="text-[10px] sm:text-xs md:text-sm 2xl:text-lg uppercase tracking-[0.3em] sm:tracking-[0.4em] text-purple-300/70 mb-2">
            Transformation Showcase
          </p>
          <h2 className="text-3xl sm:text-5xl md:text-7xl 2xl:text-8xl font-black tracking-wider uppercase bg-gradient-to-b from-white via-purple-100 to-purple-300 bg-clip-text text-transparent drop-shadow-2xl">
            BEFORE / AFTER
          </h2>
        </div>

        {/* Relative Container with Edge Action Buttons */}
        <div className="relative z-10 w-full max-w-[2200px] mx-auto px-2 sm:px-4 group/carousel">
          {/* Edge Floating Left Button */}
          <button
            onClick={() => scrollBeforeAfter(-450)}
            aria-label="Previous Transformations"
            className="absolute left-2 sm:left-6 lg:left-10 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3.5 lg:p-4 rounded-full border border-purple-400/40 bg-[#0d071a]/90 text-purple-200 hover:bg-purple-600 hover:text-white backdrop-blur-md transition-all duration-300 shadow-[0_0_25px_rgba(168,85,247,0.4)] active:scale-90 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Edge Floating Right Button */}
          <button
            onClick={() => scrollBeforeAfter(450)}
            aria-label="Next Transformations"
            className="absolute right-2 sm:right-6 lg:right-10 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3.5 lg:p-4 rounded-full border border-purple-400/40 bg-[#0d071a]/90 text-purple-200 hover:bg-purple-600 hover:text-white backdrop-blur-md transition-all duration-300 shadow-[0_0_25px_rgba(168,85,247,0.4)] active:scale-90 cursor-pointer"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {loading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
          ) : (
            <div
              ref={beforeAfterScrollRef}
              {...beforeAfterEvents}
              className={`flex overflow-x-auto gap-4 sm:gap-6 md:gap-8 lg:gap-10 2xl:gap-12 px-12 sm:px-20 md:px-24 2xl:px-28 pb-6 items-center ${beforeAfterCards.length <= 4 ? "justify-center" : "justify-start"
                } scrollbar-none cursor-grab active:cursor-grabbing select-none touch-pan-x [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}
            >
              {beforeAfterCards.map((item) => (
                <div key={item.id} className="shrink-0">
                  <InteractiveVideoCard
                    item={item}
                    isPlaying={playingVideoId === item.id}
                    onTogglePlay={() => handleTogglePlay(item.id)}
                    isDragging={isBeforeAfterDragging}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* PACKAGES SECTION */}
      <PricingPackagesSection />
    </div>
  );
}

/* ================= PRICING CARD COMPONENT (Hydration Safe) ================= */
function PricingCard({ plan }: { plan: PricingPlan }) {
  const [mounted, setMounted] = useState(false);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [spotlightPos, setSpotlightPos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mounted || window.innerWidth < 1024) return;

    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = ((y - centerY) / centerY) * -6;
    const rotY = ((x - centerX) / centerX) * 6;

    setRotateX(rotX);
    setRotateY(rotY);
    setSpotlightPos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  const standardClipPath =
    "polygon(0 0, calc(100% - 28px) 0, 100% 28px, 100% 100%, 28px 100%, 0 calc(100% - 28px))";
  const popularClipPath =
    "polygon(32px 0, 100% 0, 100% calc(100% - 32px), calc(100% - 32px) 100%, 0 100%, 0 32px)";

  const currentClipPath = plan.isPopular ? popularClipPath : standardClipPath;

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: mounted
          ? `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
          : undefined,
      }}
      className={`pricing-card-inner group relative p-[1.5px] transition-transform duration-300 ease-out cursor-pointer h-full w-[290px] sm:w-[320px] lg:w-full lg:max-w-[340px] 2xl:max-w-[420px] shrink-0 lg:hover:scale-105 lg:hover:z-50 ${plan.isPopular ? "z-20" : "z-10"
        }`}
    >
      <div
        className={`absolute inset-0 transition-all duration-500 ${plan.isPopular
            ? "bg-gradient-to-br from-purple-500 via-fuchsia-500 to-purple-800 shadow-[0_0_35px_rgba(168,85,247,0.4)]"
            : "bg-gradient-to-br from-white/20 via-purple-500/20 to-white/5 group-hover:from-purple-500 group-hover:to-fuchsia-500"
          }`}
        style={{ clipPath: currentClipPath }}
      />

      <div
        className={`relative flex flex-col justify-between p-6 sm:p-7 2xl:p-10 h-full w-full backdrop-blur-xl ${plan.isPopular ? "bg-[#120723]/95" : "bg-[#0a0512]/95"
          }`}
        style={{ clipPath: currentClipPath }}
      >
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none hidden lg:block"
          style={{
            background: `radial-gradient(400px circle at ${spotlightPos.x}% ${spotlightPos.y}%, rgba(168, 85, 247, 0.25), transparent 70%)`,
          }}
        />

        <div className="absolute top-0 right-10 w-12 2xl:w-20 h-[2px] bg-purple-500/50 group-hover:bg-purple-400 group-hover:shadow-[0_0_8px_#a855f7] transition-all" />

        <div className="flex items-center justify-between mb-3 2xl:mb-5 z-10">
          <span
            className={`text-[10px] 2xl:text-xs font-bold tracking-[0.25em] uppercase px-3 2xl:px-4 py-1 2xl:py-1.5 border ${plan.isPopular
                ? "bg-purple-600/30 border-purple-400 text-purple-200"
                : "bg-white/5 border-white/10 text-gray-400"
              }`}
            style={{
              clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))",
            }}
          >
            {plan.badge}
          </span>
        </div>

        <div className="mb-4 2xl:mb-6 z-10">
          <h3 className={`text-lg sm:text-xl 2xl:text-2xl font-bold text-white mb-1 ${cinzel.className}`}>
            {plan.videosCount}
          </h3>

          <div className="flex items-baseline gap-2 my-1 2xl:my-3">
            <span className="text-xs 2xl:text-sm text-purple-300/60 line-through font-mono">
              {plan.originalPrice}
            </span>
            <span className={`text-3xl sm:text-4xl 2xl:text-5xl font-black text-white ${cinzel.className}`}>
              {plan.price}
            </span>
            <span className="text-xs 2xl:text-sm text-purple-300/80 font-mono font-medium">
              ({plan.perVideoPrice})
            </span>
          </div>

          <p className="text-xs 2xl:text-sm text-gray-400 leading-relaxed font-light min-h-[36px] 2xl:min-h-[44px]">
            {plan.description}
          </p>
        </div>

        <div className="flex-1 mb-5 2xl:mb-8 z-10">
          <div className="w-full h-[1px] bg-gradient-to-r from-purple-500/50 via-white/10 to-transparent mb-4 2xl:mb-6" />
          <ul className="space-y-2.5 2xl:space-y-4">
            {plan.features.map((feature, idx) => (
              <li
                key={idx}
                className="flex items-center gap-2 2xl:gap-3 text-xs 2xl:text-sm font-light lg:group-hover:translate-x-1 transition-transform duration-300"
              >
                <div
                  className={`w-4 h-4 2xl:w-5 2xl:h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${feature.included
                      ? "bg-purple-950/80 border-purple-500/50 group-hover:bg-purple-600 group-hover:border-purple-400"
                      : "bg-white/5 border-white/10 opacity-40"
                    }`}
                >
                  <Check
                    className={`w-2.5 h-2.5 2xl:w-3.5 2xl:h-3.5 stroke-[3] ${feature.included ? "text-purple-300 group-hover:text-white" : "text-gray-500"
                      }`}
                  />
                </div>
                <span className={feature.included ? "text-gray-200 font-medium" : "text-gray-500"}>
                  {feature.text}
                </span>
              </li>
            ))}
          </ul>
        </div>


        <div className="flex flex-col gap-2 mt-auto z-10">
          <Link
            href={`/checkout?service=realestate&plan=${plan.id}`}
            className={`w-full py-3 2xl:py-4 px-4 text-[11px] 2xl:text-sm font-bold uppercase tracking-wider transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 ${plan.isPopular
                ? "bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-600 text-white shadow-lg shadow-purple-600/30 hover:shadow-purple-500/50"
                : "bg-white text-purple-950 hover:bg-gray-100"
              }`}
            style={{
              clipPath: "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)",
            }}
          >
            <Zap className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 fill-current" />
            <span>Subscribe Now</span>
          </Link>
        </div>

        <div className="absolute bottom-0 left-10 w-12 2xl:w-20 h-[2px] bg-purple-500/50 group-hover:bg-purple-400 group-hover:shadow-[0_0_8px_#a855f7] transition-all" />
      </div>
    </div>
  );
}

/* ================= PRICING PACKAGES SECTION ================= */
function PricingPackagesSection() {
  const cardsWrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  return (
    <section id="pricing" className="relative w-full bg-[#06030a] text-white border-t border-purple-950/40 overflow-hidden flex flex-col justify-start pt-16 pb-20 md:pt-24 md:pb-32 2xl:pt-36 2xl:pb-44">
      <div className={`z-10 text-center max-w-5xl 2xl:max-w-7xl mx-auto flex flex-col items-center shrink-0 px-4 mb-10 lg:mb-16 2xl:mb-20 ${cinzel.className}`}>
        <p className="text-xs sm:text-sm 2xl:text-lg uppercase tracking-[0.25em] md:tracking-[0.4em] text-purple-300/60 mb-3">
          Flexible Options
        </p>
        <h2 className="text-2xl sm:text-4xl lg:text-6xl 2xl:text-7xl font-black tracking-wider uppercase bg-gradient-to-b from-white via-purple-100 to-purple-300 bg-clip-text text-transparent drop-shadow-lg">
          Packages
        </h2>
      </div>

      <div className="relative z-10 w-full max-w-6xl 2xl:max-w-[1600px] mx-auto px-4">
        <div
          ref={cardsWrapperRef}
          className="flex lg:grid lg:grid-cols-3 gap-6 lg:gap-6 2xl:gap-10 w-full items-stretch justify-start lg:justify-items-center overflow-x-auto lg:overflow-visible pb-8 lg:pb-0 scrollbar-none snap-x snap-mandatory px-2 lg:px-0"
        >
          {pricingPlans.map((plan) => (
            <div key={plan.id} className="snap-center shrink-0 flex justify-center">
              <PricingCard plan={plan} />
            </div>
          ))}
        </div>

        {/* Features Bar */}
        <div className="max-w-4xl 2xl:max-w-6xl mx-auto mt-16 sm:mt-20 2xl:mt-28 px-4 flex flex-col items-center">
          <div className="w-full relative p-6 sm:p-8 2xl:p-12 rounded-3xl border border-purple-500/30 bg-[#0a0514]/80 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden">
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 2xl:gap-12">
              <div className="flex items-start gap-4 2xl:gap-5">
                <div className="w-10 h-10 2xl:w-14 2xl:h-14 rounded-2xl bg-purple-950/80 border border-purple-400/40 flex items-center justify-center shrink-0 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                  <CreditCard className="w-5 h-5 2xl:w-7 2xl:h-7 stroke-[1.75]" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm 2xl:text-lg mb-1">Credit Based Count</h4>
                  <p className="text-gray-300 text-xs 2xl:text-sm leading-relaxed font-light">
                    Videos are counted as credits. <br /><strong className="text-purple-300 font-semibold">1 video = 1 credit</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 2xl:gap-5">
                <div className="w-10 h-10 2xl:w-14 2xl:h-14 rounded-2xl bg-purple-950/80 border border-purple-400/40 flex items-center justify-center shrink-0 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                  <InfinityIcon className="w-5 h-5 2xl:w-7 2xl:h-7 stroke-[1.75]" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm 2xl:text-lg mb-1">No Time Limit</h4>
                  <p className="text-gray-300 text-xs 2xl:text-sm leading-relaxed font-light">
                    Credits <strong className="text-purple-300 font-semibold">don't expire</strong>. Use them anytime you want your video to be edited.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 2xl:gap-5">
                <div className="w-10 h-10 2xl:w-14 2xl:h-14 rounded-2xl bg-purple-950/80 border border-purple-400/40 flex items-center justify-center shrink-0 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                  <RotateCcw className="w-5 h-5 2xl:w-7 2xl:h-7 stroke-[1.75]" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm 2xl:text-lg mb-1">Free Revisions</h4>
                  <p className="text-gray-300 text-xs 2xl:text-sm leading-relaxed font-light">
                    <strong className="text-purple-300 font-semibold">Unlimited Free Revisions</strong> till satisfied with final output.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div ref={buttonRef} className="z-10 mt-12 sm:mt-16 2xl:mt-24 shrink-0 relative group/btn px-4">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-600 via-fuchsia-500 to-purple-600 opacity-40 blur-md group-hover/btn:opacity-80 transition-opacity duration-300" />
            <Link
              href="/#book-call"
              className="relative inline-flex items-center gap-3 px-8 sm:px-10 2xl:px-14 py-4 2xl:py-6 rounded-full text-xs sm:text-sm 2xl:text-lg font-bold uppercase tracking-wider text-white overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 border border-purple-400/40 bg-[#120824]/90 shadow-[0_0_25px_rgba(168,85,247,0.25)]"
            >
              <PhoneCall className="relative z-10 w-4 h-4 2xl:w-6 2xl:h-6 text-purple-400" />
              <span className="relative z-10">Book A Call</span>
              <ArrowUpRight className="relative z-10 w-4 h-4 2xl:w-6 2xl:h-6 transition-transform duration-300 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 text-purple-300" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}