'use client';

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Cinzel } from "next/font/google";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["700"],
});

// Sleek Clean Vector Icons
const FacebookIcon = () => (
  <svg className="w-5 h-5 2xl:w-6 2xl:h-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-5 h-5 2xl:w-6 2xl:h-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const LinkedinIcon = () => (
  <svg className="w-5 h-5 2xl:w-6 2xl:h-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
);

const navLinks = [
  { label: "Services", href: "/#services" },
  { label: "Our Work", href: "/#our-work" },
  { label: "Testimonials", href: "/#testimonials" },
  { label: "Book a Call", href: "/#book-call" },
];

const resourceLinks = [
  { label: "Real Estate", href: "/services/real-estate" },
  { label: "SaaS Videos", href: "/services/saas-videos" },
  { label: "Custom Editing", href: "/services/short-form" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative w-full bg-[#040206] text-white overflow-hidden pt-16 pb-10 2xl:pt-24 2xl:pb-14 selection:bg-purple-500/30 border-t border-purple-950/40">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] 2xl:w-[1100px] h-[250px] 2xl:h-[350px] bg-purple-600/10 blur-[160px] rounded-full pointer-events-none" />

      {/* Giant Watermark Agency Typography in Background */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none select-none opacity-[0.03] whitespace-nowrap text-[15vw] 2xl:text-[13vw] font-black uppercase tracking-tighter leading-none text-white">
        DIGITALIX STUDIOS
      </div>

      <div className="relative z-10 max-w-7xl 2xl:max-w-[1700px] mx-auto px-6 lg:px-12 2xl:px-16 w-full">
        
        {/* MAIN NAVIGATION & BRANDING GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 2xl:gap-14 pb-12 2xl:pb-16 border-b border-white/10">
          
          {/* Brand Info (Col 1-5) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-5 2xl:space-y-6">
            <div>
              <Link href="/" className="inline-flex items-center gap-3 2xl:gap-4 mb-4 2xl:mb-6 group">
                <Image
                  src="/logo.png"
                  alt="Digitalix Studios Logo"
                  width={52}
                  height={52}
                  className="w-10 h-10 2xl:w-12 2xl:h-12 object-contain transition-transform duration-500 group-hover:scale-110"
                />
                <span className={`text-xl sm:text-2xl 2xl:text-3xl font-black uppercase tracking-widest bg-gradient-to-r from-white via-purple-100 to-purple-300 bg-clip-text text-transparent ${cinzel.className}`}>
                  Digitalix Studios
                </span>
              </Link>

              <p className="text-gray-400 text-xs sm:text-sm 2xl:text-base leading-relaxed max-w-sm 2xl:max-w-md font-light">
                Crafting high-retention video edits, luxury architectural showcases, and high-converting SaaS motion graphics for world-class brands.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs 2xl:text-sm font-mono text-purple-300/90">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
              <span>Available for New Projects</span>
            </div>
          </div>

          {/* Navigation Links (Col 6-8) */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-8 2xl:gap-10">
            <div>
              <h4 className={`text-xs 2xl:text-sm font-bold uppercase tracking-widest text-purple-400 mb-4 2xl:mb-6 ${cinzel.className}`}>
                Navigation
              </h4>
              <ul className="space-y-3 2xl:space-y-4 text-xs 2xl:text-sm font-medium text-gray-400">
                {navLinks.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className={`text-xs 2xl:text-sm font-bold uppercase tracking-widest text-purple-400 mb-4 2xl:mb-6 ${cinzel.className}`}>
                Services
              </h4>
              <ul className="space-y-3 2xl:space-y-4 text-xs 2xl:text-sm font-medium text-gray-400">
                {resourceLinks.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Social Links (Col 9-12) */}
          <div className="lg:col-span-3 flex flex-col justify-start space-y-5 2xl:space-y-6">
            <div>
              <h4 className={`text-xs 2xl:text-sm font-bold uppercase tracking-widest text-purple-400 mb-4 2xl:mb-6 ${cinzel.className}`}>
                Connect With Us
              </h4>
              
              <div className="flex items-center gap-4 2xl:gap-5 text-gray-400">
                <a
                  href="https://www.linkedin.com/company/digitalix-studios/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 2xl:w-12 2xl:h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-purple-300 hover:border-purple-500/50 hover:bg-purple-950/40 hover:scale-105 transition-all duration-300"
                  aria-label="LinkedIn"
                >
                  <LinkedinIcon />
                </a>

                <a
                  href="https://www.instagram.com/digitalix_studios_/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 2xl:w-12 2xl:h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-purple-300 hover:border-purple-500/50 hover:bg-purple-950/40 hover:scale-105 transition-all duration-300"
                  aria-label="Instagram"
                >
                  <InstagramIcon />
                </a>

                <a
                  href="https://www.facebook.com/digitalixwebstudios/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 2xl:w-12 2xl:h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-purple-300 hover:border-purple-500/50 hover:bg-purple-950/40 hover:scale-105 transition-all duration-300"
                  aria-label="Facebook"
                >
                  <FacebookIcon />
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* BOTTOM BAR CREDITS */}
        <div className="pt-6 2xl:pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] 2xl:text-xs text-gray-500 gap-3">
          <p>© {currentYear} Digitalix Studios. All rights reserved.</p>
          
          <p className="text-gray-400">
            Crafted with precision by{" "}
            <a
              href="https://retnavia.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 font-bold hover:underline hover:text-purple-300 transition-colors"
            >
              Retnavia
            </a>
          </p>
        </div>

      </div>
    </footer>
  );
}
