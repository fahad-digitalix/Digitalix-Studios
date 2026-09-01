'use client';

import Link from 'next/link';
import { Cinzel } from 'next/font/google';
import { XCircle } from 'lucide-react';

const cinzel = Cinzel({ subsets: ['latin'], weight: ['700', '900'] });

const cardClipPath =
  'polygon(0 0, calc(100% - 28px) 0, 100% 28px, 100% 100%, 28px 100%, 0 calc(100% - 28px))';

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-[#06030a] text-white flex items-center justify-center p-4 selection:bg-purple-600">
      <div className="relative max-w-lg w-full p-[1.5px]">
        <div
          className="absolute inset-0 bg-gradient-to-br from-red-500/60 via-purple-700 to-purple-900"
          style={{ clipPath: cardClipPath }}
        />
        <div
          className="relative p-8 sm:p-10 bg-[#0d061c]/95 backdrop-blur-2xl text-center"
          style={{ clipPath: cardClipPath }}
        >
          <div className="w-14 h-14 bg-red-950/60 border border-red-400/40 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-7 h-7 text-red-300" />
          </div>

          <h1 className={`text-2xl sm:text-3xl font-black uppercase tracking-wider mb-2 ${cinzel.className}`}>
            Payment Cancelled
          </h1>
          <p className="font-sans text-xs sm:text-sm text-slate-300 mb-8 leading-relaxed">
            Your payment was cancelled. No charge was made to your card. Your production slot has not been
            reserved.
          </p>

          <div className="flex flex-col gap-3 font-sans">
            <Link
              href="/checkout"
              className="w-full py-4 px-6 rounded-full bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-600 text-white font-bold uppercase tracking-wider text-xs sm:text-sm text-center hover:scale-[1.02] active:scale-95 transition shadow-lg shadow-purple-600/30"
            >
              Return To Checkout
            </Link>
            <Link
              href="/"
              className="w-full py-3.5 rounded-full border border-purple-400/30 text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white hover:bg-purple-950/40 transition text-center"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
