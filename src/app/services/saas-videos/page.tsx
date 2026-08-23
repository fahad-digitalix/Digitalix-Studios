'use client';

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Cinzel } from "next/font/google";
import {
  Zap,
  Check,
  Wand2,
  Volume2,
  Layers,
  ArrowRight,
  ArrowUpRight,
  PhoneCall,
  FileText,
  Mic,
  Monitor,
  MessageSquarePlus,
  Loader2,
  Play,
  Pause
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CloudinaryResource } from "@/lib/cloudinary";
import LazyVideo from "@/components/LazyVideo";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["700", "900"],
});

// Hero Features
const heroFeatures = [
  { icon: FileText, title: "Scripting", desc: "Engaging Hook" },
  { icon: Monitor, title: "UI/UX Motion", desc: "Visual Hierarchy" },
  { icon: Wand2, title: "2D Animation", desc: "Sleek Graphics" },
  { icon: Volume2, title: "Sound Design", desc: "SFX Polish" },
  { icon: Mic, title: "Voice Over", desc: "Studio Quality" },
  { icon: Layers, title: "Revisions", desc: "100% Satisfaction" },
];

interface WorkItem {
  id: string;
  video: string;
  poster: string;
}

// Pricing Plans Interface
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
    id: "30-sec",
    badge: "STARTER",
    originalPrice: "$600",
    price: "$450",
    videosCount: "30 Seconds",
    perVideoPrice: "30 Sec Video",
    description: "Perfect for quick social media teasers and high-impact product hooks.",
    features: [
      { text: "Full Scripting & Storyboard", included: true },
      { text: "2D / UI Motion Graphics", included: true },
      { text: "Pro Voice Over & SFX", included: true },
      { text: "2 Revisions Included", included: true },
    ],
    isPopular: false,
  },
  {
    id: "1-min",
    badge: "MOST POPULAR",
    originalPrice: "$1000",
    price: "$800",
    videosCount: "1 Minute",
    perVideoPrice: "60 Sec Video",
    description: "The sweet spot for complete product landing pages and SaaS launches.",
    features: [
      { text: "Full Scripting & Storyboard", included: true },
      { text: "Custom UI/UX Re-creation", included: true },
      { text: "Pro Voice Over & Sound Design", included: true },
      { text: "3 Revisions Included", included: true },
    ],
    isPopular: true,
  },
  {
    id: "2-min",
    badge: "ENTERPRISE",
    originalPrice: "$1600",
    price: "$1300",
    videosCount: "2 Minutes",
    perVideoPrice: "120 Sec Video",
    description: "In-depth explainer video covering complex workflows and feature suites.",
    features: [
      { text: "Comprehensive Scripting", included: true },
      { text: "Advanced Animation & FX", included: true },
      { text: "Pro Voiceover & Music Track", included: true },
      { text: "Unlimited Revisions", included: true },
    ],
    isPopular: false,
  },
];

export default function SaasLaunchVideoPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

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

  return (
    <div ref={pageRef} className="w-full bg-[#06030a] text-white min-h-screen selection:bg-purple-600 selection:text-white overflow-hidden">
      
      {/* Ambient Background Glow */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[600px] md:w-[1000px] 2xl:w-[1400px] h-[400px] 2xl:h-[600px] bg-purple-600/10 blur-[180px] rounded-full pointer-events-none z-0" />

      {/* ================= HERO SECTION ================= */}
      <section className="relative z-10 w-full flex flex-col items-center justify-center pt-32 pb-16 md:pt-44 md:pb-24 2xl:pt-56 2xl:pb-32 px-4 sm:px-6 max-w-7xl 2xl:max-w-[1700px] mx-auto">
        <div
          ref={headerRef}
          className={`z-10 text-center max-w-5xl 2xl:max-w-7xl mx-auto px-4 ${cinzel.className}`}
        >
          {/* Badge */}
          <div className="flex items-center justify-center gap-3 mb-6 sm:mb-8 font-sans">
            <span className="w-8 sm:w-14 2xl:w-20 h-[1px] bg-gradient-to-r from-transparent to-purple-400/60" />
            <p className="text-xs sm:text-sm md:text-base 2xl:text-xl uppercase tracking-[0.35em] sm:tracking-[0.45em] text-purple-300/80 font-bold">
              PRODUCT EXPLAINER
            </p>
            <span className="w-8 sm:w-14 2xl:w-20 h-[1px] bg-gradient-to-l from-transparent to-purple-400/60" />
          </div>

          {/* MAIN HEADLINE */}
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[100px] 2xl:text-[130px] font-black tracking-wider uppercase bg-gradient-to-b from-white via-purple-100 to-purple-300 bg-clip-text text-transparent drop-shadow-2xl leading-[1.08] my-4">
            SAAS LAUNCH VIDEOS
          </h1>

          {/* DESCRIPTION */}
          <p className="font-sans text-slate-200 text-sm sm:text-base md:text-lg lg:text-xl 2xl:text-2xl mt-8 sm:mt-10 2xl:mt-12 font-normal tracking-wide max-w-3xl 2xl:max-w-5xl mx-auto leading-relaxed drop-shadow-sm">
            Transforming complex software workflows into high-converting, cinematic motion graphics engineered to captivate users and boost conversions.
          </p>

          {/* Action Buttons */}
          <div className="mt-10 sm:mt-12 lg:mt-14 2xl:mt-16 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 lg:gap-8 w-full sm:w-auto px-4 sm:px-0 font-sans">
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

      {/* ================= OUR WORK GRID SECTION ================= */}
      <WorkGridSection />

      {/* ================= PACKAGES SECTION ================= */}
      <PricingPackagesSection />

    </div>
  );
}

/* ================= OUR WORK GRID SECTION ================= */

function WorkGridSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [worksList, setWorksList] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Single active video tracker across the entire grid
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSaaSVideos() {
      try {
        const res = await fetch("/api/videos?folder=Digitalixstudio/saas");
        const data: CloudinaryResource[] = await res.json();

        if (Array.isArray(data)) {
          const filtered = data
            .filter((item) => !item.public_id.toLowerCase().includes("homesaas"))
            .map((item) => ({
              id: item.public_id,
              video: item.secure_url,
              poster: item.secure_url.replace(/\.[^/.]+$/, ".jpg"),
            }));

          setWorksList(filtered);
        }
      } catch (err) {
        console.error("Error fetching SaaS videos:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchSaaSVideos();
  }, []);

  // Viewport Observer: Screen se bahar hote hi jo video chal rahi ho band ho jaye
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            setPlayingVideoId(null);
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleTogglePlay = (id: string) => {
    setPlayingVideoId((prevId) => (prevId === id ? null : id));
  };

  return (
    <section 
      ref={sectionRef}
      className="relative w-full bg-[#06030a] text-white flex flex-col items-center justify-center py-16 sm:py-20 md:py-28 2xl:py-36 border-t border-purple-950/40 overflow-hidden"
    >
      <Image
        src="/servicesvid.png"
        alt="Our Work Background"
        fill
        priority
        className="object-cover object-center z-0 pointer-events-none opacity-30 blur-sm"
      />

      <div className={`z-10 text-center max-w-5xl 2xl:max-w-7xl mx-auto mb-12 sm:mb-16 2xl:mb-20 px-4 ${cinzel.className}`}>
        <p className="text-[10px] sm:text-xs md:text-sm 2xl:text-lg uppercase tracking-[0.3em] sm:tracking-[0.4em] text-purple-300/70 mb-3">
          FEATURED SHOWREEL
        </p>
        <h2 className="text-3xl sm:text-5xl md:text-7xl 2xl:text-8xl font-black tracking-wider uppercase bg-gradient-to-b from-white via-purple-100 to-purple-300 bg-clip-text text-transparent drop-shadow-2xl">
          OUR WORK
        </h2>
      </div>

      <div className="max-w-[1500px] 2xl:max-w-[2000px] mx-auto w-full px-4 sm:px-6 lg:px-8 z-10">
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 2xl:gap-12">
            {worksList.map((item) => (
              <WorkGridCard
                key={item.id}
                item={item}
                isPlaying={playingVideoId === item.id}
                onTogglePlay={() => handleTogglePlay(item.id)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function WorkGridCard({
  item,
  isPlaying,
  onTogglePlay,
}: {
  item: WorkItem;
  isPlaying: boolean;
  onTogglePlay: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.muted = false;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          video.muted = true;
          video.play().catch(() => {});
        });
      }
    } else {
      video.pause();
      video.currentTime = 0;
      video.muted = true;
    }
  }, [isPlaying]);

  return (
    <div
      onClick={onTogglePlay}
      className="group relative w-full aspect-[16/9] sm:aspect-[16/8.5] rounded-2xl 2xl:rounded-3xl bg-[#0a0514] border border-purple-500/20 hover:border-purple-400 transition-all duration-500 overflow-hidden cursor-pointer shadow-xl hover:shadow-[0_15px_35px_rgba(168,85,247,0.3)] hover:-translate-y-1.5"
    >
      <LazyVideo
        ref={videoRef}
        src={item.video}
        poster={item.poster}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 pointer-events-none"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

      {/* Play/Pause Button Overlay strictly VISIBLE ONLY ON HOVER */}
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

/* ================= PRICING PACKAGES SECTION ================= */

function PricingCard({ plan }: { plan: PricingPlan }) {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [spotlightPos, setSpotlightPos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.innerWidth < 1024) return;

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
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
      }}
      className={`pricing-card-inner group relative p-[1.5px] transition-transform duration-300 ease-out cursor-pointer h-full w-[290px] sm:w-[320px] lg:w-full lg:max-w-[340px] 2xl:max-w-[420px] shrink-0 lg:hover:scale-105 lg:hover:z-50 ${
        plan.isPopular ? "z-20" : "z-10"
      }`}
    >
      <div
        className={`absolute inset-0 transition-all duration-500 ${
          plan.isPopular
            ? "bg-gradient-to-br from-purple-500 via-fuchsia-500 to-purple-800 shadow-[0_0_35px_rgba(168,85,247,0.4)]"
            : "bg-gradient-to-br from-white/20 via-purple-500/20 to-white/5 group-hover:from-purple-500 group-hover:to-fuchsia-500"
        }`}
        style={{ clipPath: currentClipPath }}
      />

      <div
        className={`relative flex flex-col justify-between p-6 sm:p-7 2xl:p-10 h-full w-full backdrop-blur-xl ${
          plan.isPopular ? "bg-[#120723]/95" : "bg-[#0a0512]/95"
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
            className={`text-[10px] 2xl:text-xs font-bold tracking-[0.25em] uppercase px-3 2xl:px-4 py-1 2xl:py-1.5 border ${
              plan.isPopular
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
                  className={`w-4 h-4 2xl:w-5 2xl:h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                    feature.included
                      ? "bg-purple-950/80 border-purple-500/50 group-hover:bg-purple-600 group-hover:border-purple-400"
                      : "bg-white/5 border-white/10 opacity-40"
                  }`}
                >
                  <Check
                    className={`w-2.5 h-2.5 2xl:w-3.5 2xl:h-3.5 stroke-[3] ${
                      feature.included ? "text-purple-300 group-hover:text-white" : "text-gray-500"
                    }`}
                  />
                </div>
                <span className={feature.included ? "text-gray-300" : "text-gray-500"}>
                  {feature.text}
                </span>
              </li>
            ))}
          </ul>
        </div>

<div className="flex flex-col gap-2 mt-auto z-10">
  <Link
    href={`/checkout?service=saas&plan=${plan.id}`}
    className={`w-full py-3 2xl:py-4 px-4 text-[11px] 2xl:text-sm font-bold uppercase tracking-wider transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 ${
      plan.isPopular
        ? "bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-600 text-white shadow-lg shadow-purple-600/30 hover:shadow-purple-500/50"
        : "bg-white text-purple-950 hover:bg-gray-100"
    }`}
    style={{
      clipPath: "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)",
    }}
  >
    <Zap className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 fill-current" />
    <span>Order Video</span>
  </Link>
</div>

        <div className="absolute bottom-0 left-10 w-12 2xl:w-20 h-[2px] bg-purple-500/50 group-hover:bg-purple-400 group-hover:shadow-[0_0_8px_#a855f7] transition-all" />
      </div>
    </div>
  );
}

function PricingPackagesSection() {
  const cardsWrapperRef = useRef<HTMLDivElement>(null);

  return (
    <section className="relative w-full bg-[#06030a] text-white border-t border-purple-950/40 overflow-hidden flex flex-col justify-start pt-16 pb-20 md:pt-24 md:pb-32 2xl:pt-36 2xl:pb-44">
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

        {/* Action Buttons: Book A Call + Get A Custom Quote */}
        <div className="max-w-4xl 2xl:max-w-6xl mx-auto mt-12 sm:mt-16 2xl:mt-24 px-4 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 2xl:gap-8">
          
          {/* Book A Call */}
          <div className="shrink-0 relative group/btn w-full sm:w-auto">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-600 via-fuchsia-500 to-purple-600 opacity-40 blur-md group-hover/btn:opacity-80 transition-opacity duration-300" />
            <Link
              href="/#book-call"
              className="relative w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 sm:px-10 2xl:px-14 py-4 2xl:py-6 rounded-full text-xs sm:text-sm 2xl:text-lg font-bold uppercase tracking-wider text-white overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 border border-purple-400/40 bg-[#120824]/90 shadow-[0_0_25px_rgba(168,85,247,0.25)]"
            >
              <PhoneCall className="relative z-10 w-4 h-4 2xl:w-6 2xl:h-6 text-purple-400" />
              <span className="relative z-10">Book A Call</span>
              <ArrowUpRight className="relative z-10 w-4 h-4 2xl:w-6 2xl:h-6 transition-transform duration-300 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 text-purple-300" />
            </Link>
          </div>

          {/* Get Custom Quote Button */}
          <div className="shrink-0 relative group/btn w-full sm:w-auto">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 opacity-30 blur-md group-hover/btn:opacity-70 transition-opacity duration-300" />
            <Link
              href="/#book-call"
              className="relative w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 sm:px-10 2xl:px-14 py-4 2xl:py-6 rounded-full text-xs sm:text-sm 2xl:text-lg font-bold uppercase tracking-wider text-white overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 border border-purple-400/30 bg-purple-950/60"
            >
              <MessageSquarePlus className="relative z-10 w-4 h-4 2xl:w-6 2xl:h-6 text-purple-300" />
              <span className="relative z-10">Get Custom Quote</span>
              <ArrowUpRight className="relative z-10 w-4 h-4 2xl:w-6 2xl:h-6 transition-transform duration-300 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 text-purple-300" />
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}