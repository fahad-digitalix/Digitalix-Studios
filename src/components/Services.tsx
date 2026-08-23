'use client';

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Check,
  Zap,
  ArrowUpRight,
  Video,
  TabletSmartphone,
  House,
  Play,
  Pause,
} from "lucide-react";
import { Cinzel } from "next/font/google";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import LazyVideo from "@/components/LazyVideo";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["700", "900"],
});

interface ServiceData {
  id: string;
  badge: string;
  title: string;
  icon: React.ElementType;
  brief: string;
  points: string[];
  portfolioLabel: string;
  portfolioHref: string;
  pricingHref: string;
  videoUrl: string;
}

// Cloudinary URL optimizers (only applied to cloudinary URLs).
// f_auto -> WebM/AV1 where supported, q_auto -> smart compression.
const optimizeVideo = (url: string) =>
  url.includes("res.cloudinary.com")
    ? url.replace("/upload/", "/upload/f_auto,q_auto/")
    : url;

const posterFrom = (url: string) =>
  url.includes("res.cloudinary.com")
    ? url
        .replace("/upload/", "/upload/so_0,f_auto,q_auto/")
        .replace(/\.[^/.]+$/, ".jpg")
    : undefined;

const servicesList: ServiceData[] = [
  {
    id: "real-estate",
    badge: "PREMIUM SHOWCASE",
    title: "Real Estate Media",
    icon: House,
    brief:
      "Cinematic real estate property tours engineered to captivate buyers and close high-ticket deals faster.",
    points: [
      "Premium Texting with 4 to 5 Distinct Variations",
      "30 - 60 Seconds Max High-Impact Editing",
      "Dynamic Speed Ramping & Seamless Transitions",
      "1 - 2 AI Virtual Staging Enhancements",
    ],
    portfolioLabel: "Our Work",
    portfolioHref: "/services/real-estate",
    pricingHref: "/services/real-estate#pricing",
    videoUrl:
      "https://res.cloudinary.com/dh0hbkwm/video/upload/v1786560011/realstatehome.mp4",
  },
  {
    id: "saas-launch",
    badge: "HIGH CONVERTING",
    title: "SaaS / Launch Videos",
    icon: Video,
    brief:
      "High-impact SaaS product walkthroughs and launch videos designed to drive viral reach and increase conversions.",
    points: [
      "Scripting, Professional Voiceover (VO), Storyboard & UI Animations",
      "Guaranteed 2-3 Week Fast Turnaround Delivery",
    ],
    portfolioLabel: "SaaS Portfolio",
    portfolioHref: "/services/saas-videos",
    pricingHref: "/services/saas-videos#pricing",
    videoUrl:
      "https://res.cloudinary.com/dh0hbkwm/video/upload/v1786559717/homesaas.mp4",
  },
  {
    id: "custom-editing",
    badge: "ALL-IN-ONE CREATIVE",
    title: "Custom Editing",
    icon: TabletSmartphone,
    brief:
      "Tailored video post-production catering to creators, businesses, podcasts, and corporate brands.",
    points: [
      "Short Form, Long Form & Corporate Videos",
      "Podcasts, YouTube Content & Talking Head Edits",
      "High-End Wedding & Event Highlights",
    ],
    portfolioLabel: "Our Portfolio",
    portfolioHref: "/services/short-form",
    pricingHref: "/services/short-form#pricing",
    videoUrl:
      "https://res.cloudinary.com/dh0hbkwm/video/upload/v1786560000/customhome.mp4",
  },
];

function ServiceCard({ service, index }: { service: ServiceData; index: number }) {
  const [isPlaying, setIsPlaying] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null); // element we transform
  const spotlightRef = useRef<HTMLDivElement>(null); // spotlight overlay
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafId = useRef<number | null>(null);

  const ServiceIcon = service.icon;
  const isMiddleCard = index === 1;
  const isReel = service.id === "real-estate" || service.id === "custom-editing";

  const videoSrc = optimizeVideo(service.videoUrl);
  const poster = posterFrom(service.videoUrl);

  // Auto-pause + reset when the card scrolls out of view.
  useEffect(() => {
    const cardEl = cardRef.current;
    if (!cardEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && videoRef.current) {
          videoRef.current.pause();
          videoRef.current.currentTime = 0;
          videoRef.current.muted = true;
          setIsPlaying(false);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(cardEl);
    return () => observer.disconnect();
  }, []);

  // Mouse tilt + spotlight written straight to the DOM via rAF.
  // No React state -> no per-frame re-render of the card or its video.
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) return;

    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = ((y - centerY) / centerY) * -3;
    const rotY = ((x - centerX) / centerX) * 3;
    const spotX = (x / rect.width) * 100;
    const spotY = (y / rect.height) * 100;

    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      if (tiltRef.current) {
        tiltRef.current.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
      }
      if (spotlightRef.current) {
        spotlightRef.current.style.background = `radial-gradient(600px circle at ${spotX}% ${spotY}%, rgba(168, 85, 247, 0.18), transparent 70%)`;
      }
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
    if (tiltRef.current) {
      tiltRef.current.style.transform =
        "perspective(1000px) rotateX(0deg) rotateY(0deg)";
    }
  }, []);

  // Clean up any pending rAF on unmount.
  useEffect(() => {
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.muted = false;
      video
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          // Autoplay-with-sound blocked -> retry muted.
          video.muted = true;
          video.play().catch(() => {});
          setIsPlaying(true);
        });
    }
  }, [isPlaying]);

  const clipPathShape =
    "polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px))";
  const innerClipPath =
    "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))";

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="w-full max-w-7xl 2xl:max-w-[1600px] mx-auto"
    >
      <div
        ref={tiltRef}
        className="group relative p-[1.5px] transition-transform duration-300 ease-out will-change-transform transform-gpu"
        style={{ transform: "perspective(1000px) rotateX(0deg) rotateY(0deg)" }}
      >
        {/* Outer Glow Border */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-purple-500/30 via-fuchsia-500/20 to-purple-900/40 group-hover:from-purple-500 group-hover:via-fuchsia-500 group-hover:to-purple-600 transition-all duration-500 shadow-[0_0_35px_rgba(168,85,247,0.15)]"
          style={{ clipPath: clipPathShape }}
        />

        {/* Main Glass Card Container */}
        <div
          className={`relative flex flex-col lg:flex-row justify-between items-center p-6 sm:p-8 lg:p-12 2xl:p-16 h-full w-full bg-[#0a0512]/95 backdrop-blur-2xl gap-8 lg:gap-12 2xl:gap-16 ${
            isMiddleCard ? "lg:flex-row-reverse" : ""
          }`}
          style={{ clipPath: clipPathShape }}
        >
          {/* Spotlight Effect (updated via ref, not state) */}
          <div
            ref={spotlightRef}
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none hidden lg:block"
          />

          {/* Top Accent Line */}
          <div className="absolute top-0 right-12 sm:right-16 w-16 sm:w-24 h-[2px] bg-purple-500/60 group-hover:bg-purple-400 group-hover:shadow-[0_0_12px_#a855f7] transition-all" />

          {/* LEFT COLUMN: Details & Checklist */}
          <div className="flex-1 flex flex-col justify-between z-10 w-full space-y-6">
            <div>
              {/* Badge */}
              <div className="flex items-center gap-3 mb-4">
                <span
                  className="text-[10px] sm:text-xs 2xl:text-sm font-bold tracking-[0.25em] uppercase px-3 py-1.5 bg-purple-600/30 border border-purple-400/60 text-purple-200"
                  style={{
                    clipPath:
                      "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))",
                  }}
                >
                  {service.badge}
                </span>
              </div>

              {/* Title with Icon */}
              <div className="flex items-center gap-3 sm:gap-5 mb-4">
                <div className="p-3 sm:p-4 bg-purple-950/80 border border-purple-500/50 text-purple-300 rounded-xl sm:rounded-2xl group-hover:bg-purple-600 group-hover:border-purple-400 group-hover:text-white transition-all duration-300 shrink-0 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                  <ServiceIcon className="w-6 h-6 sm:w-8 sm:h-8 2xl:w-10 2xl:h-10" />
                </div>

                <h3
                  className={`text-2xl sm:text-3xl lg:text-4xl 2xl:text-5xl font-black text-white tracking-wide uppercase ${cinzel.className}`}
                >
                  {service.title}
                </h3>
              </div>

              {/* Brief Description */}
              <p className="text-sm sm:text-base 2xl:text-lg text-slate-300 leading-relaxed font-light mb-6">
                {service.brief}
              </p>

              <div className="w-full h-[1px] bg-gradient-to-r from-purple-500/50 via-white/10 to-transparent mb-6" />

              {/* Feature Points */}
              <ul className="space-y-3 mb-8">
                {service.points.map((point, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-3.5 text-xs sm:text-sm 2xl:text-base text-slate-200 font-light group-hover:translate-x-1 transition-transform duration-300"
                  >
                    <div className="w-4 h-4 sm:w-5 sm:h-5 2xl:w-6 2xl:h-6 rounded-full bg-purple-950/80 border border-purple-500/60 flex items-center justify-center shrink-0 group-hover:bg-purple-600 group-hover:border-purple-400 transition-colors">
                      <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 2xl:w-3.5 2xl:h-3.5 text-purple-300 group-hover:text-white stroke-[3]" />
                    </div>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 w-full pt-6 border-t border-white/10">
              <a
                href={service.portfolioHref}
                className="flex-1 py-3.5 px-6 bg-white text-purple-950 font-bold text-xs sm:text-sm 2xl:text-base uppercase tracking-wider transition-all duration-300 hover:bg-purple-100 active:scale-95 flex items-center justify-center gap-2 shadow-lg"
                style={{
                  clipPath:
                    "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)",
                }}
              >
                <span>{service.portfolioLabel}</span>
                <ArrowUpRight className="w-4 h-4 2xl:w-5 2xl:h-5 stroke-[2.5]" />
              </a>

              <a
                href={service.pricingHref}
                className="flex-1 py-3.5 px-6 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-600 text-white font-bold text-xs sm:text-sm 2xl:text-base uppercase tracking-wider transition-all duration-300 shadow-lg shadow-purple-600/30 hover:shadow-purple-500/50 active:scale-95 flex items-center justify-center gap-2"
                style={{
                  clipPath:
                    "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
                }}
              >
                <Zap className="w-4 h-4 2xl:w-5 2xl:h-5 fill-current" />
                <span>Pricing / Packages</span>
              </a>
            </div>
          </div>

          {/* RIGHT COLUMN: Video Box */}
          <div
            className={`w-full flex flex-col justify-center items-center z-10 shrink-0 mx-auto lg:mx-0 ${
              isReel
                ? "lg:w-[35%] xl:w-[32%] max-w-[280px] sm:max-w-[320px] 2xl:max-w-[380px]"
                : "lg:w-[45%] xl:w-[48%] max-w-[650px] 2xl:max-w-[750px]"
            }`}
          >
            <div
              className={`relative w-full bg-black/80 border border-purple-500/40 overflow-hidden group/video shadow-[0_0_30px_rgba(0,0,0,0.8)] rounded-xl cursor-pointer ${
                isReel ? "aspect-[9/16]" : "aspect-[16/9]"
              }`}
              style={{ clipPath: innerClipPath }}
              onClick={togglePlay}
            >
              <LazyVideo
                ref={videoRef}
                src={videoSrc}
                poster={poster}
                className="w-full h-full object-cover transition-transform duration-700 group-hover/video:scale-105"
              />

              {/* Play Button Overlay */}
              <div
                className={`absolute inset-0 bg-black/40 transition-opacity duration-300 flex items-center justify-center ${
                  isPlaying ? "opacity-0 group-hover/video:opacity-100" : "opacity-100"
                }`}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlay();
                  }}
                  className="p-4 bg-purple-600/90 hover:bg-purple-500 text-white rounded-full backdrop-blur-md transition-all duration-300 transform scale-100 hover:scale-110 border border-purple-300/40 shadow-xl"
                  aria-label={isPlaying ? "Pause Video" : "Play Video"}
                >
                  {isPlaying ? (
                    <Pause className="w-7 h-7 fill-current" />
                  ) : (
                    <Play className="w-7 h-7 fill-current ml-1" />
                  )}
                </button>
              </div>

              {/* Preview Tag */}
              <div className="absolute top-3.5 left-3.5 px-3 py-1 bg-black/70 backdrop-blur-md border border-purple-500/40 text-[10px] sm:text-xs font-mono tracking-widest text-purple-300 uppercase flex items-center gap-2 rounded-md z-10">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isPlaying ? "bg-green-500 animate-pulse" : "bg-purple-500"
                  }`}
                />
                {isPlaying ? "PLAYING" : "PREVIEW"}
              </div>
            </div>
          </div>

          {/* Bottom Accent Line */}
          <div className="absolute bottom-0 left-12 sm:left-16 w-16 sm:w-24 h-[2px] bg-purple-500/60 group-hover:bg-purple-400 group-hover:shadow-[0_0_12px_#a855f7] transition-all" />
        </div>
      </div>
    </div>
  );
}

export default function ServicesSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Reuse a single global Lenis instance if one already exists (e.g. created
    // by another section on the same page). Two Lenis instances fight and jank.
    const w = window as unknown as { __lenis?: Lenis; __lenisOwner?: string };
    let ownsLenis = false;
    let lenis = w.__lenis;

    if (!lenis) {
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });
      w.__lenis = lenis;
      w.__lenisOwner = "services";
      ownsLenis = true;

      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => {
        w.__lenis?.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: -30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
          },
        }
      );

      servicesList.forEach((service) => {
        gsap.fromTo(
          `#section-${service.id}`,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: `#section-${service.id}`,
              start: "top 85%",
              once: true,
            },
          }
        );
      });
    }, containerRef);

    return () => {
      ctx.revert();
      // Only destroy Lenis if this component created it.
      if (ownsLenis && w.__lenis) {
        w.__lenis.destroy();
        w.__lenis = undefined;
        w.__lenisOwner = undefined;
      }
    };
  }, []);

  return (
    <div
      id="services"
      ref={containerRef}
      className="w-full bg-[#06030a] text-white overflow-hidden selection:bg-purple-600 selection:text-white py-12 sm:py-16 md:py-24 2xl:py-32"
    >
      {/* MAIN TOP HEADER */}
      <div
        ref={headerRef}
        className={`z-10 text-center max-w-5xl 2xl:max-w-7xl mx-auto mb-10 sm:mb-16 md:mb-20 px-4 ${cinzel.className}`}
      >
        <p className="text-[10px] sm:text-xs md:text-sm 2xl:text-base uppercase tracking-[0.3em] sm:tracking-[0.4em] text-purple-300/70 mb-2 sm:mb-3">
          TAILORED CREATIVE SOLUTIONS
        </p>
        <h2 className="text-3xl sm:text-5xl md:text-7xl 2xl:text-8xl font-black tracking-wider uppercase bg-gradient-to-b from-white via-purple-100 to-purple-300 bg-clip-text text-transparent drop-shadow-2xl">
          OUR SERVICES
        </h2>
      </div>

      {servicesList.map((service, index) => (
        <section
          key={service.id}
          id={`section-${service.id}`}
          className="relative w-full flex flex-col justify-center items-center px-4 sm:px-6 lg:px-12 2xl:px-16 py-8 sm:py-12 2xl:py-16"
        >
          {/* Ambient Lighting Background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[600px] lg:w-[900px] 2xl:w-[1200px] h-[250px] sm:h-[400px] 2xl:h-[500px] bg-purple-600/10 blur-[140px] rounded-full pointer-events-none" />

          {/* Counter Label Header */}
          <div
            className={`z-10 text-center max-w-5xl mx-auto flex flex-col items-center mb-6 sm:mb-8 ${cinzel.className}`}
          >
            <p className="text-lg sm:text-2xl md:text-3xl 2xl:text-4xl font-extrabold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.3)]">
              0{index + 1} / SERVICE SPECIFICATION
            </p>
          </div>

          {/* Interactive Card */}
          <div className="w-full z-10 flex justify-center">
            <ServiceCard service={service} index={index} />
          </div>
        </section>
      ))}
    </div>
  );
}