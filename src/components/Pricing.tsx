'use client';

import React, { useState, useEffect, useRef } from "react";
import { Check, Sparkles, Zap } from "lucide-react";
import { Cinzel } from "next/font/google";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["700"],
});

interface PricingPlan {
  id: string;
  badge: string;
  title: string;
  price: string;
  description: string;
  features: string[];
  isPopular?: boolean;
}

const pricingPlans: PricingPlan[] = [
  {
    id: "short-form",
    badge: "CLASSIC",
    title: "Short-Form Videos",
    price: "$0.2",
    description: "Video editing for short form videos up to 120 seconds runtime.",
    features: [
      "24/7 customer support",
      "Free unlimited revisions",
      "4K Quality",
      "1 day turn around time",
    ],
    isPopular: false,
  },
  {
    id: "dedicated-editors",
    badge: "MOST POPULAR",
    title: "Dedicated Editors",
    price: "$1200",
    description: "Personalized video editor with 40 hr/week dedication to your projects.",
    features: [
      "Videos Tracking Sheet",
      "Urgent Requests",
      "4K Quality",
      "Personal Content Manager",
    ],
    isPopular: true,
  },
  {
    id: "long-form",
    badge: "CLASSIC",
    title: "Long-Form Videos",
    price: "$150",
    description: "Video editing for long form videos up to 60 minutes runtime.",
    features: [
      "24/7 Support",
      "Horizontal size",
      "4K Quality",
      "1 day turn around",
    ],
    isPopular: false,
  },
];

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

  // Custom Geometric Clip Paths for Unique Shapes
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
      className={`pricing-card-inner group relative p-[1.5px] transition-transform duration-300 ease-out cursor-pointer h-full w-[290px] sm:w-[320px] lg:w-full lg:max-w-[340px] shrink-0 lg:hover:scale-105 lg:hover:z-50 ${
        plan.isPopular ? "z-20" : "z-10"
      }`}
    >
      {/* Outer Border Glow Wrapper with Custom Clip-Path */}
      <div
        className={`absolute inset-0 transition-all duration-500 ${
          plan.isPopular
            ? "bg-gradient-to-br from-purple-500 via-fuchsia-500 to-purple-800 shadow-[0_0_35px_rgba(168,85,247,0.4)]"
            : "bg-gradient-to-br from-white/20 via-purple-500/20 to-white/5 group-hover:from-purple-500 group-hover:to-fuchsia-500"
        }`}
        style={{
          clipPath: currentClipPath,
        }}
      />

      {/* Main Card Content Layer */}
      <div
        className={`relative flex flex-col justify-between p-6 sm:p-7 h-full w-full backdrop-blur-xl ${
          plan.isPopular ? "bg-[#120723]/95" : "bg-[#0a0512]/95"
        }`}
        style={{
          clipPath: currentClipPath,
        }}
      >
        {/* Dynamic Spotlight Glow */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none hidden lg:block"
          style={{
            background: `radial-gradient(400px circle at ${spotlightPos.x}% ${spotlightPos.y}%, rgba(168, 85, 247, 0.25), transparent 70%)`,
          }}
        />

        {/* Top Decorative Tech Notch */}
        <div className="absolute top-0 right-10 w-12 h-[2px] bg-purple-500/50 group-hover:bg-purple-400 group-hover:shadow-[0_0_8px_#a855f7] transition-all" />

        {/* Header Badge */}
        <div className="flex items-center justify-between mb-4 z-10">
          <span
            className={`text-[10px] font-bold tracking-[0.25em] uppercase px-3 py-1 border ${
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
          {plan.isPopular && (
            <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
          )}
        </div>

        {/* Title & Price */}
        <div className="mb-4 z-10">
          <h3 className={`text-lg sm:text-xl font-bold text-white mb-1 ${cinzel.className}`}>
            {plan.title}
          </h3>

          <div className="flex items-baseline gap-1 my-2">
            <span className={`text-3xl sm:text-4xl font-black text-white ${cinzel.className}`}>
              {plan.price}
            </span>
            <span className="text-xs text-gray-400 font-light">/ project</span>
          </div>

          <p className="text-xs text-gray-400 leading-relaxed font-light min-h-[36px]">
            {plan.description}
          </p>
        </div>

        {/* Features Checklist */}
        <div className="flex-1 mb-5 z-10">
          <div className="w-full h-[1px] bg-gradient-to-r from-purple-500/50 via-white/10 to-transparent mb-4" />
          <ul className="space-y-2.5">
            {plan.features.map((feature, idx) => (
              <li
                key={idx}
                className="flex items-center gap-2 text-xs text-gray-300 font-light lg:group-hover:translate-x-1 transition-transform duration-300"
              >
                <div className="w-4 h-4 rounded-full bg-purple-950/80 border border-purple-500/50 flex items-center justify-center shrink-0 group-hover:bg-purple-600 group-hover:border-purple-400 transition-colors">
                  <Check className="w-2.5 h-2.5 text-purple-300 group-hover:text-white stroke-[3]" />
                </div>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 mt-auto z-10">
          <button
            className="w-full py-2.5 px-4 bg-white/5 border border-white/10 hover:border-purple-400/50 hover:bg-white/10 text-white font-bold text-[11px] uppercase tracking-wider transition-all duration-300 active:scale-95"
            style={{
              clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
            }}
          >
            Customize Package
          </button>

          <button
            className={`w-full py-2.5 px-4 text-[11px] font-bold uppercase tracking-wider transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 ${
              plan.isPopular
                ? "bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-600 text-white shadow-lg shadow-purple-600/30 hover:shadow-purple-500/50"
                : "bg-white text-purple-950 hover:bg-gray-100"
            }`}
            style={{
              clipPath: "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)",
            }}
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Subscribe Now</span>
          </button>
        </div>

        {/* Bottom Corner Accent Notch */}
        <div className="absolute bottom-0 left-10 w-12 h-[2px] bg-purple-500/50 group-hover:bg-purple-400 group-hover:shadow-[0_0_8px_#a855f7] transition-all" />
      </div>
    </div>
  );
}

export default function PricingSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardsWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context(() => {
      const cards = cardsWrapperRef.current ? Array.from(cardsWrapperRef.current.children) : [];

      gsap.set([subtitleRef.current, titleRef.current], {
        opacity: 0,
        y: 20,
      });

      const mm = gsap.matchMedia();

      // Desktop Animations (Large Screens >= 1024px)
      mm.add("(min-width: 1024px)", () => {
        gsap.set(cards, {
          y: 60,
          opacity: 0,
        });

        const mainTl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 65%",
            once: true,
          },
        });

        mainTl.to([subtitleRef.current, titleRef.current], {
          opacity: 1,
          y: 0,
          stagger: 0.12,
          duration: 0.6,
          ease: "power3.out",
        });

        mainTl.to(
          cards,
          {
            y: (i) => (i === 1 ? -15 : 10),
            rotate: (i) => (i === 0 ? -3 : i === 2 ? 3 : 0),
            opacity: 1,
            stagger: 0.15,
            duration: 0.8,
            ease: "back.out(1.2)",
          },
          "-=0.3"
        );
      });

      // Mobile & Tablet Animations (< 1024px)
      mm.add("(max-width: 1023px)", () => {
        gsap.to([subtitleRef.current, titleRef.current], {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.12,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            once: true,
          },
        });

        gsap.fromTo(
          cards,
          { opacity: 0, y: 30, rotate: 0 },
          {
            opacity: 1,
            y: 0,
            rotate: 0,
            duration: 0.6,
            stagger: 0.12,
            ease: "power2.out",
            scrollTrigger: {
              trigger: cardsWrapperRef.current,
              start: "top 85%",
              once: true,
            },
          }
        );
      });

    }, sectionRef);

    return () => {
      ctx.revert();
      lenis.destroy();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-[#06030a] text-white overflow-hidden flex flex-col justify-start pt-16 pb-20 md:pt-24 md:pb-32"
    >
      {/* Background Ambient Purple Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] lg:w-[850px] lg:h-[550px] bg-purple-600/15 blur-[120px] lg:blur-[180px] rounded-full pointer-events-none" />

      {/* Heading Zone */}
      <div className={`z-10 text-center max-w-5xl mx-auto flex flex-col items-center shrink-0 px-4 mb-10 lg:mb-16 ${cinzel.className}`}>
        <p
          ref={subtitleRef}
          className="text-xs sm:text-sm uppercase tracking-[0.25em] md:tracking-[0.4em] text-purple-300/60 mb-3"
        >
          Flexible Pricing For Every Creator
        </p>
        <h2
          ref={titleRef}
          className="text-2xl sm:text-4xl lg:text-6xl font-black tracking-wider uppercase bg-gradient-to-b from-white via-purple-100 to-purple-300 bg-clip-text text-transparent drop-shadow-lg"
        >
          Choose Your Package
        </h2>
      </div>

      {/* Responsive Cards Container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4">
        <div
          ref={cardsWrapperRef}
          className="flex lg:grid lg:grid-cols-3 gap-6 lg:gap-6 w-full items-stretch justify-start lg:justify-items-center overflow-x-auto lg:overflow-visible pb-8 lg:pb-0 scrollbar-none snap-x snap-mandatory px-2 lg:px-0"
        >
          {pricingPlans.map((plan) => (
            <div key={plan.id} className="snap-center shrink-0 flex justify-center">
              <PricingCard plan={plan} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}