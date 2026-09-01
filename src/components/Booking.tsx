"use client";

import { useEffect, useState } from "react";
import { InlineWidget } from "react-calendly";
import { Cinzel } from "next/font/google";
import { Loader2 } from "lucide-react";
import LazyMount from "@/components/LazyMount";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: "700",
});

export default function CalendlyBooking() {
  const [mounted, setMounted] = useState(false);
  const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL;

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section id="book-call" className="relative w-full py-16 bg-[#08050c] text-white flex flex-col items-center justify-center overflow-x-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-purple-600/10 blur-[160px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4">
        {/* Compact Title Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 pb-6 border-b border-purple-500/20">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-purple-400 font-semibold mb-1">
              AVAILABILITY & SLOTS
            </p>
            <h2 className={`text-3xl sm:text-4xl font-black uppercase text-white ${cinzel.className}`}>
              Book A Meeting
            </h2>
          </div>
          <p className="text-sm text-gray-400 max-w-md mt-2 md:mt-0 text-left md:text-right">
            Select an available time slot below to schedule your consultation.
          </p>
        </div>

        {/* Deck Frame */}
        <LazyMount
          className="w-full rounded-2xl overflow-hidden border border-purple-500/20 bg-[#08050c] shadow-2xl [&_iframe]:[filter:invert(0.92)_hue-rotate(180deg)]"
          placeholder={
            <div style={{ height: "700px" }} className="w-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
          }
        >
          {mounted && calendlyUrl ? (
            <InlineWidget
              url={calendlyUrl}
              styles={{
                height: "700px",
                width: "100%",
              }}
              pageSettings={{
                backgroundColor: "ffffff",
                hideEventTypeDetails: false,
                hideLandingPageDetails: false,
                primaryColor: "a855f7",
                textColor: "000000"
              }}
            />
          ) : (
            <div style={{ height: "700px" }} className="w-full flex flex-col items-center justify-center text-center p-4">
              {!mounted ? (
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
              ) : (
                <p className="text-red-400 text-sm">
                  NEXT_PUBLIC_CALENDLY_URL is not configured in .env.local
                </p>
              )}
            </div>
          )}
        </LazyMount>
      </div>
    </section>
  );
}