'use client';

import React, { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Cinzel } from 'next/font/google';
import { CheckCircle2, XCircle, Clock, Loader2, Download, ShieldAlert } from 'lucide-react';
import jsPDF from 'jspdf';

const cinzel = Cinzel({ subsets: ['latin'], weight: ['700', '900'] });

const cardClipPath =
  'polygon(0 0, calc(100% - 28px) 0, 100% 28px, 100% 100%, 28px 100%, 0 calc(100% - 28px))';

interface VerifyResult {
  outcome: 'paid' | 'processing' | 'cancelled' | 'failed' | 'error';
  orderId?: string;
  package?: { id: string; title: string; service: string };
  amount?: number;
  currency?: string;
  cardBrand?: string;
  cardLast4?: string;
  error?: string;
}

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount / 100);
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#06030a] text-white flex items-center justify-center p-4 selection:bg-purple-600">
      <div className="relative max-w-lg w-full p-[1.5px]">{children}</div>
    </div>
  );
}

function LoadingCard() {
  return (
    <Shell>
      <div
        className="absolute inset-0 bg-gradient-to-br from-purple-500 via-fuchsia-500 to-purple-800 shadow-[0_0_40px_rgba(168,85,247,0.3)]"
        style={{ clipPath: cardClipPath }}
      />
      <div
        className="relative p-8 sm:p-10 bg-[#0d061c]/95 backdrop-blur-2xl text-center"
        style={{ clipPath: cardClipPath }}
      >
        <Loader2 className="w-8 h-8 text-purple-300 animate-spin mx-auto mb-6" />
        <h2 className={`text-xl sm:text-2xl font-black uppercase tracking-wider mb-2 ${cinzel.className}`}>
          Verifying Your Payment
        </h2>
        <p className="text-xs sm:text-sm text-slate-300">
          Please wait while we confirm your payment with our payment partner. Do not close this page.
        </p>
      </div>
    </Shell>
  );
}

function PaidCard({ result }: { result: VerifyResult }) {
  const downloadReceipt = () => {
    const doc = new jsPDF();
    doc.setFillColor(6, 3, 10);
    doc.rect(0, 0, 210, 45, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text('OFFICIAL PAYMENT RECEIPT', 20, 24);
    doc.setFontSize(9);
    doc.setTextColor(192, 132, 252);
    doc.text(`ORDER: ${result.orderId ?? ''}`, 20, 34);
    doc.text(
      `DATE: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`,
      145,
      34
    );

    doc.setFillColor(243, 232, 255);
    doc.rect(20, 60, 170, 10, 'F');
    doc.setTextColor(88, 28, 135);
    doc.setFontSize(10);
    doc.text('Package', 25, 67);
    doc.text('Service Track', 105, 67);
    doc.text('Amount Paid', 155, 67);

    doc.setTextColor(30, 30, 30);
    doc.setFontSize(10);
    doc.text(result.package?.title ?? '-', 25, 80);
    doc.text(result.package?.service ?? '-', 105, 80);
    doc.text(result.amount != null && result.currency ? formatAmount(result.amount, result.currency) : '-', 155, 80);

    if (result.cardBrand && result.cardLast4) {
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.text(`Paid with ${result.cardBrand.toUpperCase()} ending in ${result.cardLast4}`, 20, 95);
    }

    doc.setDrawColor(220, 220, 220);
    doc.line(20, 105, 190, 105);
    doc.setFontSize(13);
    doc.setTextColor(6, 3, 10);
    doc.text(
      `Total Paid: ${result.amount != null && result.currency ? formatAmount(result.amount, result.currency) : '-'}`,
      120,
      118
    );

    doc.save(`Receipt-${result.orderId ?? 'order'}.pdf`);
  };

  return (
    <Shell>
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
          PAYMENT CONFIRMED
        </h2>
        <p className="font-sans text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
          Your payment has been verified and your production slot is secured.
        </p>

        <div className="bg-[#140827]/90 border border-purple-500/30 rounded-2xl p-4 text-left mb-6 space-y-2.5 font-sans">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Order ID:</span>
            <span className="text-purple-300 font-mono font-bold tracking-wider">{result.orderId}</span>
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>Package:</span>
            <span className="text-white font-medium">{result.package?.title}</span>
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>Amount Paid:</span>
            <span className="text-purple-300 font-bold font-mono">
              {result.amount != null && result.currency ? formatAmount(result.amount, result.currency) : '-'}
            </span>
          </div>
          {result.cardBrand && result.cardLast4 && (
            <div className="flex justify-between text-xs text-slate-400">
              <span>Card:</span>
              <span className="text-white font-medium uppercase">
                {result.cardBrand} •••• {result.cardLast4}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 font-sans">
          <button
            onClick={downloadReceipt}
            className="w-full py-4 px-6 rounded-full bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-600 text-white font-bold uppercase tracking-wider text-xs sm:text-sm flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition shadow-lg shadow-purple-600/30"
          >
            <Download className="w-4 h-4" />
            <span>Download Receipt PDF</span>
          </button>
          <Link
            href="/"
            className="w-full py-3.5 rounded-full border border-purple-400/30 text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white hover:bg-purple-950/40 transition text-center"
          >
            Return To Home
          </Link>
        </div>
      </div>
    </Shell>
  );
}

function ProcessingCard({ result }: { result: VerifyResult }) {
  return (
    <Shell>
      <div
        className="absolute inset-0 bg-gradient-to-br from-purple-500 via-fuchsia-500 to-purple-800 shadow-[0_0_40px_rgba(168,85,247,0.3)]"
        style={{ clipPath: cardClipPath }}
      />
      <div
        className="relative p-8 sm:p-10 bg-[#0d061c]/95 backdrop-blur-2xl text-center"
        style={{ clipPath: cardClipPath }}
      >
        <div className="w-14 h-14 bg-purple-950/80 border border-purple-400/60 rounded-2xl flex items-center justify-center mx-auto mb-6 text-purple-200">
          <Clock className="w-7 h-7 text-purple-300" />
        </div>
        <h2 className={`text-2xl sm:text-3xl font-black uppercase tracking-wider mb-2 ${cinzel.className}`}>
          PAYMENT PROCESSING
        </h2>
        <p className="font-sans text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
          Your payment is still being processed by our payment partner. We&apos;ll email you at your provided
          address as soon as it&apos;s confirmed — no need to try again.
        </p>
        {result.orderId && (
          <p className="font-mono text-xs text-purple-300 mb-6">Order: {result.orderId}</p>
        )}
        <Link
          href="/"
          className="w-full py-3.5 rounded-full border border-purple-400/30 text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white hover:bg-purple-950/40 transition text-center inline-block"
        >
          Return To Home
        </Link>
      </div>
    </Shell>
  );
}

function FailedCard({ result }: { result: VerifyResult }) {
  const backHref = result.package?.id ? `/checkout?id=${result.package.id}` : '/checkout';
  return (
    <Shell>
      <div
        className="absolute inset-0 bg-gradient-to-br from-red-500/60 via-purple-700 to-purple-900"
        style={{ clipPath: cardClipPath }}
      />
      <div
        className="relative p-8 sm:p-10 bg-[#0d061c]/95 backdrop-blur-2xl text-center"
        style={{ clipPath: cardClipPath }}
      >
        <div className="w-14 h-14 bg-red-950/60 border border-red-400/40 rounded-2xl flex items-center justify-center mx-auto mb-6">
          {result.outcome === 'error' ? (
            <ShieldAlert className="w-7 h-7 text-red-300" />
          ) : (
            <XCircle className="w-7 h-7 text-red-300" />
          )}
        </div>
        <h2 className={`text-2xl sm:text-3xl font-black uppercase tracking-wider mb-2 ${cinzel.className}`}>
          {result.outcome === 'cancelled' ? 'Payment Not Completed' : 'We Couldn’t Confirm This Payment'}
        </h2>
        <p className="font-sans text-xs sm:text-sm text-slate-300 mb-8 leading-relaxed">
          {result.error ||
            'We were unable to verify this payment. If you believe you were charged, please contact support with your order details before trying again.'}
        </p>
        <Link
          href={backHref}
          className="w-full py-4 px-6 rounded-full bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-600 text-white font-bold uppercase tracking-wider text-xs sm:text-sm text-center hover:scale-[1.02] transition inline-block"
        >
          Return To Checkout
        </Link>
      </div>
    </Shell>
  );
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const paymentIntentId = searchParams.get('payment_intent');

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    if (!sessionId || !paymentIntentId) {
      setResult({ outcome: 'error', error: 'Missing payment identifier.' });
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const res = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, paymentIntentId }),
        });
        const data = await res.json();
        if (!res.ok) {
          setResult({ outcome: 'error', error: data?.error || 'Unable to verify payment.' });
        } else {
          setResult(data as VerifyResult);
        }
      } catch {
        setResult({ outcome: 'error', error: 'Unable to verify payment. Please check your connection.' });
      } finally {
        setLoading(false);
      }
    })();
  }, [sessionId, paymentIntentId]);

  if (loading || !result) return <LoadingCard />;
  if (result.outcome === 'paid') return <PaidCard result={result} />;
  if (result.outcome === 'processing') return <ProcessingCard result={result} />;
  return <FailedCard result={result} />;
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<LoadingCard />}>
      <SuccessContent />
    </Suspense>
  );
}
