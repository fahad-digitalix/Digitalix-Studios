'use client';

import React, { useState, Suspense, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Cinzel } from 'next/font/google';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  Loader2,
  CreditCard,
  User,
} from 'lucide-react';
import gsap from 'gsap';
import { getPackageById } from '@/lib/packages';

const cinzel = Cinzel({ subsets: ['latin'], weight: ['700', '900'] });

function CheckoutComponent() {
  const searchParams = useSearchParams();
  const pageRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const rawPlan = searchParams.get('plan') || '';
  const planId = searchParams.get('id') || '';

  // Prices are resolved from the trusted package catalog only, for display.
  // The server independently re-resolves the price when creating a payment —
  // nothing shown here is ever trusted for the actual charge.
  const packageData = useMemo(() => {
    return getPackageById(planId) || getPackageById(rawPlan);
  }, [rawPlan, planId]);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    projectNotes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const submittingRef = useRef(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.fade-checkout', {
        y: 35,
        opacity: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: 'power3.out',
      });
    }, pageRef);
    return () => ctx.revert();
  }, []);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current || !packageData) return;
    submittingRef.current = true;
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: packageData.id,
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data?.checkoutUrl) {
        setError(data?.error || 'Unable to start payment. Please try again.');
        setLoading(false);
        submittingRef.current = false;
        return;
      }

      // Leaving the page for ZionPe's hosted checkout — no need to reset
      // loading/submittingRef, the redirect takes over.
      window.location.href = data.checkoutUrl;
    } catch (err) {
      console.error('Payment initiation error:', err);
      setError('Network error. Please check your connection and try again.');
      setLoading(false);
      submittingRef.current = false;
    }
  };

  const cardClipPath =
    'polygon(0 0, calc(100% - 28px) 0, 100% 28px, 100% 100%, 28px 100%, 0 calc(100% - 28px))';

  if (!packageData) {
    return (
      <div className="min-h-screen bg-[#06030a] text-white flex items-center justify-center p-4 selection:bg-purple-600">
        <div className="relative max-w-lg w-full p-[1.5px]">
          <div
            className="absolute inset-0 bg-gradient-to-br from-purple-500 via-fuchsia-500 to-purple-800 shadow-[0_0_35px_rgba(168,85,247,0.3)]"
            style={{ clipPath: cardClipPath }}
          />
          <div
            className="relative p-8 sm:p-10 bg-[#0d061c]/95 backdrop-blur-2xl text-center"
            style={{ clipPath: cardClipPath }}
          >
            <h2 className={`text-xl sm:text-2xl font-black uppercase tracking-wider mb-2 ${cinzel.className}`}>
              Package Not Found
            </h2>
            <p className="font-sans text-xs sm:text-sm text-slate-300">
              We couldn&apos;t find the package you selected. Please go back and choose a package again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={pageRef}
      className="w-full bg-[#06030a] text-white min-h-screen selection:bg-purple-600 selection:text-white overflow-hidden pb-24"
    >
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[600px] md:w-[1000px] 2xl:w-[1400px] h-[400px] 2xl:h-[600px] bg-purple-600/10 blur-[180px] rounded-full pointer-events-none z-0" />

      {/* HEADER SECTION */}
      <section className="relative z-10 w-full flex flex-col items-center justify-center pt-36 sm:pt-40 md:pt-48 pb-12 sm:pb-16 px-4 max-w-5xl mx-auto">
        <div ref={headerRef} className={`z-10 text-center max-w-4xl mx-auto px-4 ${cinzel.className}`}>
          
          <div className="flex items-center justify-center gap-3 mb-3 sm:mb-4 font-sans">
            <span className="w-6 sm:w-12 h-[1px] bg-gradient-to-r from-transparent to-purple-400/60" />
            <p className="text-[10px] sm:text-xs md:text-sm uppercase tracking-[0.3em] sm:tracking-[0.45em] text-purple-300/80 font-bold">
              FINAL STEP
            </p>
            <span className="w-6 sm:w-12 h-[1px] bg-gradient-to-l from-transparent to-purple-400/60" />
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-wider uppercase bg-gradient-to-b from-white via-purple-100 to-purple-300 bg-clip-text text-transparent drop-shadow-2xl leading-[1.12]">
            SECURE CHECKOUT
          </h1>

          <p className="font-sans text-slate-300 text-xs sm:text-sm md:text-base mt-4 sm:mt-6 font-normal tracking-wide max-w-2xl mx-auto leading-relaxed">
            Enter your project details to lock in your production queue and download your official receipt.
          </p>
        </div>
      </section>

      {/* CHECKOUT GRID */}
      <section className="relative z-10 max-w-6xl 2xl:max-w-[1500px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 2xl:gap-12 items-start">
          
          {/* Left: Input Form */}
          <div className="lg:col-span-7 fade-checkout">
            <div className="relative group p-[1.5px] transition-all duration-300">
              <div
                className="absolute inset-0 bg-gradient-to-br from-white/15 via-purple-500/20 to-white/5"
                style={{ clipPath: cardClipPath }}
              />
              <div
                className="relative p-6 sm:p-8 2xl:p-10 bg-[#0d071a]/95 backdrop-blur-2xl"
                style={{ clipPath: cardClipPath }}
              >
                <div className="absolute top-0 right-10 w-16 h-[2px] bg-purple-500/50" />

                <form onSubmit={handlePayment} className="space-y-6 font-sans">
                  
                  {/* Step 1: Customer Details */}
                  <div>
                    <div className="flex items-center gap-2.5 mb-5">
                      <div className="w-7 h-7 rounded-lg bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-300">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-purple-200">
                        1. Client & Project Profile
                      </h3>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-[11px] font-semibold tracking-wider uppercase text-slate-300 mb-1.5">
                          Full Name *
                        </label>
                        <input
                          required
                          type="text"
                          placeholder="Julian Vance"
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          className="w-full bg-[#130924] border border-purple-500/30 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-purple-400 transition"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-semibold tracking-wider uppercase text-slate-300 mb-1.5">
                            Work Email *
                          </label>
                          <input
                            required
                            type="email"
                            placeholder="julian@strata.agency"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full bg-[#130924] border border-purple-500/30 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-purple-400 transition"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold tracking-wider uppercase text-slate-300 mb-1.5">
                            WhatsApp / Phone *
                          </label>
                          <input
                            required
                            type="tel"
                            placeholder="+1 (415) 890-2341"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full bg-[#130924] border border-purple-500/30 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-purple-400 transition"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold tracking-wider uppercase text-slate-300 mb-1.5">
                          Company / Channel Handle
                        </label>
                        <input
                          type="text"
                          placeholder="Aethel Media / @julianvance"
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                          className="w-full bg-[#130924] border border-purple-500/30 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-purple-400 transition"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold tracking-wider uppercase text-slate-300 mb-1.5">
                          Raw Footage Link / Edit Brief
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Paste Google Drive / Dropbox footage folder or primary delivery instructions..."
                          value={formData.projectNotes}
                          onChange={(e) => setFormData({ ...formData, projectNotes: e.target.value })}
                          className="w-full bg-[#130924] border border-purple-500/30 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-purple-400 transition resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Secure Card Payment */}
                  <div className="pt-6 border-t border-purple-500/20">
                    <div className="flex items-center gap-2.5 mb-5">
                      <div className="w-7 h-7 rounded-lg bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-300">
                        <CreditCard className="w-3.5 h-3.5" />
                      </div>
                      <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-purple-200">
                        2. Secure Card Payment
                      </h3>
                    </div>

                    <div className="flex items-start gap-3 bg-[#130924] border border-purple-500/30 rounded-xl px-4 py-4">
                      <Lock className="w-4 h-4 text-purple-300 mt-0.5 shrink-0" />
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        You&apos;ll be redirected to our secure payment partner to enter your card details.
                        DigitalXT never sees or stores your card number, expiry, or CVC.
                      </p>
                    </div>

                    {error && (
                      <p className="mt-3 text-xs sm:text-sm text-red-400 font-medium">{error}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 px-6 rounded-full bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-600 text-white font-bold uppercase tracking-wider text-xs sm:text-sm flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95 transition shadow-xl shadow-purple-600/30 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Preparing secure payment...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          <span>Pay {packageData.priceDisplay} Securely</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Right: Plan Summary Card */}
          <div className="lg:col-span-5 fade-checkout">
            <div className="relative group p-[1.5px] transition-all duration-300">
              <div
                className="absolute inset-0 bg-gradient-to-br from-purple-500 via-fuchsia-500 to-purple-800 opacity-90 shadow-[0_0_35px_rgba(168,85,247,0.3)]"
                style={{ clipPath: cardClipPath }}
              />
              <div
                className="relative p-6 sm:p-8 2xl:p-10 bg-[#120723]/95 backdrop-blur-2xl"
                style={{ clipPath: cardClipPath }}
              >
                <div className="absolute top-0 right-10 w-16 h-[2px] bg-purple-400" />

                <div className="flex items-center justify-between mb-4">
                  <span
                    className="text-[10px] 2xl:text-xs font-bold tracking-[0.25em] uppercase px-3 py-1 border bg-purple-600/30 border-purple-400 text-purple-200"
                    style={{
                      clipPath:
                        'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
                    }}
                  >
                    PLAN BREAKDOWN
                  </span>
                </div>

                <h3 className={`text-xl sm:text-2xl 2xl:text-3xl font-bold text-white mb-1 ${cinzel.className}`}>
                  {packageData.title}
                </h3>
                <p className="font-sans text-xs text-purple-300/80 mb-6 font-medium">{packageData.service}</p>

                <div className="font-sans py-4 border-y border-purple-500/30 space-y-3">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-slate-400">Selected Allocation</span>
                    <span className="font-mono text-white font-medium">{packageData.priceDisplay}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-slate-400">Processing & Onboarding</span>
                    <span className="font-mono text-purple-300">$0.00 (Waived)</span>
                  </div>
                  <div className="flex justify-between items-baseline pt-3 border-t border-purple-500/20">
                    <span className="text-sm font-bold uppercase tracking-wider text-white">Total Amount</span>
                    <span className={`text-2xl sm:text-3xl font-black text-white ${cinzel.className}`}>
                      {packageData.priceDisplay}
                    </span>
                  </div>
                </div>

                <div className="font-sans mt-6 space-y-3">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-purple-300/70">
                    Standard Inclusions
                  </p>
                  <div className="flex items-center gap-2.5 text-xs text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Unlimited free revisions until final sign-off</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Direct priority editor queue assignment</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Credits never expire — deploy anytime</span>
                  </div>
                </div>

                <div className="font-sans mt-8 p-4 rounded-2xl bg-purple-950/60 border border-purple-500/30 flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-purple-300 shrink-0" />
                  <p className="text-[11px] text-slate-300 leading-snug font-light">
                    Direct notification sent to the agency leads upon confirmation with instant receipt generation.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#06030a] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      }
    >
      <CheckoutComponent />
    </Suspense>
  );
}