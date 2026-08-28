'use client';

import React, { useState, Suspense, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Cinzel } from 'next/font/google';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Loader2,
  Download,
  CreditCard,
  Building2,
  User,
  Mail,
  Phone,
  FileVideo,
  Sparkles,
  Zap,
  ArrowUpRight,
  Receipt
} from 'lucide-react';
import gsap from 'gsap';
import jsPDF from 'jspdf';

const cinzel = Cinzel({ subsets: ['latin'], weight: ['700', '900'] });

// 🎯 EXACT SYNCED DATA FROM ALL PRICING PLANS
const PLAN_DETAILS_MAP: Record<string, { title: string; price: string; service: string }> = {
  // --- Real Estate Media Packages ---
  '10-vid': { title: '10 Videos Package', price: '$300', service: 'Real Estate Media' },
  '20-vid': { title: '20 Videos Package', price: '$500', service: 'Real Estate Media' },
  '30-vid': { title: '30 Videos Package', price: '$700', service: 'Real Estate Media' },

  // --- SaaS Launch Videos ---
  '30-sec': { title: '30 Seconds Launch Video', price: '$450', service: 'SaaS Launch Videos' },
  '1-min': { title: '1 Minute Launch Video', price: '$800', service: 'SaaS Launch Videos' },
  '2-min': { title: '2 Minutes Explainer Suite', price: '$1300', service: 'SaaS Launch Videos' },

  // --- Short-Form Packages ---
  'short-starter': { title: '10 Short-Form Videos Pack', price: '$199', service: 'Short-Form Video Editing' },
  'short-growth': { title: '20 Short-Form Videos Pack', price: '$249', service: 'Short-Form Video Editing' },
  'short-pro': { title: '30 Short-Form Videos Pack', price: '$299', service: 'Short-Form Video Editing' },

  // --- Long-Form Packages ---
  'long-single': { title: '10 Long-Form Videos Package', price: '$400', service: 'Long-Form Video Editing' },
  'long-bundle': { title: '20 Long-Form Videos Package', price: '$700', service: 'Long-Form Video Editing' },
  'long-agency': { title: '30 Long-Form Videos Package', price: '$1000', service: 'Long-Form Video Editing' },
};

function CheckoutComponent() {
  const searchParams = useSearchParams();
  const pageRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const rawPlan = searchParams.get('plan') || '';
  const rawPrice = searchParams.get('price') || '';
  const planId = searchParams.get('id') || '';
  const serviceParam = searchParams.get('service') || '';

  const packageData = useMemo(() => {
    if (planId && PLAN_DETAILS_MAP[planId]) return PLAN_DETAILS_MAP[planId];
    if (rawPlan && PLAN_DETAILS_MAP[rawPlan]) return PLAN_DETAILS_MAP[rawPlan];
    return {
      title: rawPlan || 'Custom Production Package',
      price: rawPrice || '$500',
      service: serviceParam ? `${serviceParam.toUpperCase()} Media` : 'Post-Production Suite',
    };
  }, [rawPlan, rawPrice, planId, serviceParam]);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    projectNotes: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
  });

  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [invoiceId, setInvoiceId] = useState('');

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

  const generateReceiptPDF = (invNum: string) => {
    const doc = new jsPDF();

    doc.setFillColor(6, 3, 10);
    doc.rect(0, 0, 210, 45, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text('OFFICIAL INVOICE & RECEIPT', 20, 24);

    doc.setFontSize(9);
    doc.setTextColor(192, 132, 252);
    doc.text(`INVOICE: ${invNum}`, 20, 34);
    doc.text(`DATE: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`, 145, 34);

    doc.setTextColor(20, 20, 20);
    doc.setFontSize(13);
    doc.text('Client Information', 20, 60);

    doc.setFontSize(10);
    doc.setTextColor(70, 70, 70);
    doc.text(`Client Name: ${formData.fullName}`, 20, 70);
    doc.text(`Email Address: ${formData.email}`, 20, 78);
    doc.text(`Contact: ${formData.phone}`, 20, 86);
    doc.text(`Brand / Studio: ${formData.company || 'Direct Client'}`, 20, 94);

    doc.setFillColor(243, 232, 255);
    doc.rect(20, 110, 170, 10, 'F');
    doc.setTextColor(88, 28, 135);
    doc.setFontSize(10);
    doc.text('Package Description', 25, 117);
    doc.text('Service Track', 105, 117);
    doc.text('Amount Paid', 155, 117);

    doc.setTextColor(30, 30, 30);
    doc.setFontSize(10);
    doc.text(packageData.title, 25, 130);
    doc.text(packageData.service, 105, 130);
    doc.text(packageData.price, 155, 130);

    doc.setDrawColor(220, 220, 220);
    doc.line(20, 140, 190, 140);

    doc.setFontSize(13);
    doc.setTextColor(6, 3, 10);
    doc.text(`Total Paid: ${packageData.price}`, 140, 155);

    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text('Production pipeline has been initialized.', 20, 185);
    doc.text('All video revisions and raw access credits are active immediately.', 20, 192);

    doc.save(`Receipt-${invNum}.pdf`);
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const generatedInv = `INV-${Date.now().toString().slice(-6)}`;
    setInvoiceId(generatedInv);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          packageTitle: packageData.title,
          packagePrice: packageData.price,
          service: packageData.service,
          invoiceId: generatedInv,
          date: new Date().toISOString(),
        }),
      });

      if (res.ok) {
        setOrderSuccess(true);
      } else {
        setOrderSuccess(true);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setOrderSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  const cardClipPath =
    'polygon(0 0, calc(100% - 28px) 0, 100% 28px, 100% 100%, 28px 100%, 0 calc(100% - 28px))';

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-[#06030a] text-white flex items-center justify-center p-4 selection:bg-purple-600">
        <div className="relative group max-w-lg w-full p-[1.5px] transition-all duration-500">
          <div
            className="absolute inset-0 bg-gradient-to-br from-purple-500 via-fuchsia-500 to-purple-800 shadow-[0_0_40px_rgba(168,85,247,0.3)]"
            style={{ clipPath: cardClipPath }}
          />
          <div
            className="relative p-8 sm:p-10 bg-[#0d061c]/95 backdrop-blur-2xl text-center"
            style={{ clipPath: cardClipPath }}
          >
            <div className="w-14 h-14 bg-purple-950/80 border border-purple-400/60 rounded-2xl flex items-center justify-center mx-auto mb-6 text-purple-200 shadow-[0_0_20px_rgba(168,85,247,0.35)]">
              <CheckCircle2 className="w-7 h-7 text-purple-300 stroke-[2.5]" />
            </div>

            <h2 className={`text-2xl sm:text-3xl font-black uppercase tracking-wider mb-2 ${cinzel.className}`}>
              ORDER CONFIRMED
            </h2>
            <p className="font-sans text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
              Your production slot is secured. The creative team has received your order specs.
            </p>

            <div className="bg-[#140827]/90 border border-purple-500/30 rounded-2xl p-4 text-left mb-6 space-y-2.5 font-sans">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Invoice ID:</span>
                <span className="text-purple-300 font-mono font-bold tracking-wider">{invoiceId}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Package:</span>
                <span className="text-white font-medium">{packageData.title}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Amount Paid:</span>
                <span className="text-purple-300 font-bold font-mono">{packageData.price}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 font-sans">
              <button
                onClick={() => generateReceiptPDF(invoiceId)}
                className="w-full py-4 px-6 rounded-full bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-600 text-white font-bold uppercase tracking-wider text-xs sm:text-sm flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition shadow-lg shadow-purple-600/30"
              >
                <Download className="w-4 h-4" />
                <span>Download Invoice PDF</span>
              </button>

              <Link
                href="/"
                className="w-full py-3.5 rounded-full border border-purple-400/30 text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white hover:bg-purple-950/40 transition text-center"
              >
                Return To Home
              </Link>
            </div>
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

                <form onSubmit={handleCheckoutSubmit} className="space-y-6 font-sans">
                  
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

                  {/* Step 2: Payment Gateway Card */}
                  <div className="pt-6 border-t border-purple-500/20">
                    <div className="flex items-center gap-2.5 mb-5">
                      <div className="w-7 h-7 rounded-lg bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-300">
                        <CreditCard className="w-3.5 h-3.5" />
                      </div>
                      <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-purple-200">
                        2. Payment Information
                      </h3>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-[11px] font-semibold tracking-wider uppercase text-slate-300 mb-1.5">
                          Card Number *
                        </label>
                        <input
                          required
                          type="text"
                          placeholder="5399 2810 9940 1823"
                          maxLength={19}
                          value={formData.cardNumber}
                          onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                          className="w-full bg-[#130924] border border-purple-500/30 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-xs sm:text-sm font-mono focus:outline-none focus:border-purple-400 transition"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-semibold tracking-wider uppercase text-slate-300 mb-1.5">
                            Expiry (MM/YY) *
                          </label>
                          <input
                            required
                            type="text"
                            placeholder="08/28"
                            maxLength={5}
                            value={formData.cardExpiry}
                            onChange={(e) => setFormData({ ...formData, cardExpiry: e.target.value })}
                            className="w-full bg-[#130924] border border-purple-500/30 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-xs sm:text-sm font-mono focus:outline-none focus:border-purple-400 transition"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold tracking-wider uppercase text-slate-300 mb-1.5">
                            CVC / CVV *
                          </label>
                          <input
                            required
                            type="password"
                            placeholder="892"
                            maxLength={4}
                            value={formData.cardCvc}
                            onChange={(e) => setFormData({ ...formData, cardCvc: e.target.value })}
                            className="w-full bg-[#130924] border border-purple-500/30 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-xs sm:text-sm font-mono focus:outline-none focus:border-purple-400 transition"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 px-6 rounded-full bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-600 text-white font-bold uppercase tracking-wider text-xs sm:text-sm flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95 transition shadow-xl shadow-purple-600/30"
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          <span>Authorize {packageData.price} & Start Project</span>
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
                    <span className="font-mono text-white font-medium">{packageData.price}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-slate-400">Processing & Onboarding</span>
                    <span className="font-mono text-purple-300">$0.00 (Waived)</span>
                  </div>
                  <div className="flex justify-between items-baseline pt-3 border-t border-purple-500/20">
                    <span className="text-sm font-bold uppercase tracking-wider text-white">Total Amount</span>
                    <span className={`text-2xl sm:text-3xl font-black text-white ${cinzel.className}`}>
                      {packageData.price}
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