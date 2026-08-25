'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, Sparkles, Check, Flame, ShieldAlert, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="bg-[#FAF8F5] min-h-screen text-[#2D312E]">
      
      {/* Navbar */}
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌿</span>
          <span className="font-extrabold text-sm tracking-wider uppercase text-[#4A7C59]">Focusly</span>
        </div>
        <Link
          href="/login"
          className="bg-white border border-[#EBE7DF] hover:bg-stone-50 text-xs font-bold px-4 py-2 rounded-2xl transition-all shadow-sm"
        >
          Autentificare
        </Link>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-6 py-12 md:py-20 text-center space-y-6">
        <span className="text-[10px] font-bold text-[#4A7C59] bg-emerald-50 px-3.5 py-1.5 rounded-full uppercase tracking-widest">
          O aplicație concepută pentru creierul cu ADHD ✨
        </span>

        <h1 className="text-3xl md:text-5xl font-black text-[#2D312E] leading-tight max-w-2xl mx-auto">
          Fără termene limită stresante. Fără vinovăție. Doar progres blând.
        </h1>

        <p className="text-xs md:text-sm text-stone-500 max-w-xl mx-auto leading-relaxed">
          Focusly te ajută să începi task-urile când te simți blocat, să gestionezi copleșirea și să îți construiești rutine adaptate ritmului tău natural, nu împotriva lui.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/login"
            className="w-full sm:w-auto bg-[#4A7C59] hover:bg-emerald-700 text-white text-xs font-bold px-8 py-3.5 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>Începe Gratuit</span>
            <ArrowRight size={14} />
          </Link>
          <Link
            href="#pricing"
            className="w-full sm:w-auto bg-white border border-[#EBE7DF] hover:bg-stone-50 text-stone-700 text-xs font-bold px-8 py-3.5 rounded-2xl transition-all shadow-sm"
          >
            Vezi prețurile
          </Link>
        </div>
      </main>

      {/* Philosophy Cards */}
      <section className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-[#EBE7DF] p-6 rounded-3xl space-y-3">
          <div className="h-10 w-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-[#4A7C59]">
            <Heart size={18} />
          </div>
          <h3 className="text-xs font-extrabold uppercase text-stone-800">Zero Vinovăție (Zero-Guilt)</h3>
          <p className="text-[11px] text-stone-500 leading-relaxed">
            Fără mesaje roșii de atenționare sau pedepse că ai întrerupt streak-ul. Amâni blând sarcinile și le reiei când ai energie.
          </p>
        </div>

        <div className="bg-white border border-[#EBE7DF] p-6 rounded-3xl space-y-3">
          <div className="h-10 w-10 rounded-2xl bg-orange-50 flex items-center justify-center text-[#D97736]">
            <Sparkles size={18} />
          </div>
          <h3 className="text-xs font-extrabold uppercase text-stone-800">Sparge Sarcinile (Chunking)</h3>
          <p className="text-[11px] text-stone-500 leading-relaxed">
            Paralizia de inițiere este reală. Cu un singur tap spargi sarcinile mari în sub-pași minusculi de câte 2 minute pentru a porni ușor.
          </p>
        </div>

        <div className="bg-white border border-[#EBE7DF] p-6 rounded-3xl space-y-3">
          <div className="h-10 w-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Flame size={18} />
          </div>
          <h3 className="text-xs font-extrabold uppercase text-stone-800">Body-Doubling Virtual</h3>
          <p className="text-[11px] text-stone-500 leading-relaxed">
            Lucrează asistat cu mesaje blânde de prezență și fundaluri sonore sintetice (brown noise sau ploaie) concepute pentru focus.
          </p>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section id="pricing" className="max-w-5xl mx-auto px-6 py-16 text-center space-y-8">
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-stone-855">Alege ritmul tău de susținere</h2>
          <p className="text-xs text-stone-500">MVP PWA complet funcțional offline</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto text-left">
          
          {/* Monthly */}
          <div className="bg-white border border-[#EBE7DF] p-6 rounded-3xl flex flex-col justify-between shadow-sm">
            <div className="space-y-4">
              <h3 className="text-xs font-extrabold uppercase text-stone-600">Lunar</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-[#2D312E]">34 LEI</span>
                <span className="text-xs text-stone-500">/ lună</span>
              </div>
              <p className="text-[10px] text-stone-500">Perfect pentru a testa instrumentele de focus.</p>
              <ul className="space-y-2 text-[10px] text-stone-700">
                <li className="flex items-center gap-1.5"><Check size={12} className="text-[#4A7C59]" /> Sarcini și rutine nelimitate</li>
                <li className="flex items-center gap-1.5"><Check size={12} className="text-[#4A7C59]" /> Focus & Body-doubling nelimitat</li>
                <li className="flex items-center gap-1.5"><Check size={12} className="text-[#4A7C59]" /> Jurnal complet & statistici</li>
              </ul>
            </div>
            <Link
              href="/login?tier=monthly"
              className="mt-6 w-full text-center bg-[#4A7C59] hover:bg-emerald-700 text-white text-[11px] font-bold py-2.5 rounded-xl transition-all shadow-sm"
            >
              Alege Abonament
            </Link>
          </div>

          {/* Yearly - Recommended */}
          <div className="bg-white border-2 border-[#4A7C59] p-6 rounded-3xl flex flex-col justify-between shadow-md relative">
            <span className="absolute -top-3.5 left-6 bg-[#4A7C59] text-white text-[8px] font-bold py-1 px-3 rounded-full uppercase tracking-wider">
              Recomandat ⭐
            </span>
            <div className="space-y-4">
              <h3 className="text-xs font-extrabold uppercase text-stone-600">Anual</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-[#2D312E]">249 LEI</span>
                <span className="text-xs text-stone-500">/ an</span>
              </div>
              <p className="text-[10px] text-stone-500">Economisește 38% din prețul lunar.</p>
              <ul className="space-y-2 text-[10px] text-stone-700">
                <li className="flex items-center gap-1.5"><Check size={12} className="text-[#4A7C59]" /> Tot ce este în abonamentul lunar</li>
                <li className="flex items-center gap-1.5"><Check size={12} className="text-[#4A7C59]" /> Ghiduri și resurse ADHD complete</li>
                <li className="flex items-center gap-1.5"><Check size={12} className="text-[#4A7C59]" /> Sprijin și suport prioritar</li>
              </ul>
            </div>
            <Link
              href="/login?tier=yearly"
              className="mt-6 w-full text-center bg-[#4A7C59] hover:bg-emerald-700 text-white text-[11px] font-bold py-2.5 rounded-xl transition-all shadow-sm"
            >
              Alege Abonament
            </Link>
          </div>

          {/* Lifetime */}
          <div className="bg-white border border-[#EBE7DF] p-6 rounded-3xl flex flex-col justify-between shadow-sm">
            <div className="space-y-4">
              <h3 className="text-xs font-extrabold uppercase text-stone-600">Pe Viață (Lifetime)</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-[#2D312E]">449 LEI</span>
                <span className="text-xs text-stone-500">/ o singură dată</span>
              </div>
              <p className="text-[10px] text-stone-500">Plătești o singură dată, folosești mereu.</p>
              <ul className="space-y-2 text-[10px] text-stone-700">
                <li className="flex items-center gap-1.5"><Check size={12} className="text-[#4A7C59]" /> Acces pe viață la toate funcțiile</li>
                <li className="flex items-center gap-1.5"><Check size={12} className="text-[#4A7C59]" /> Fără reînnoiri sau taxe recurente</li>
                <li className="flex items-center gap-1.5"><Check size={12} className="text-[#4A7C59]" /> Toate actualizările viitoare incluse</li>
              </ul>
            </div>
            <Link
              href="/login?tier=lifetime"
              className="mt-6 w-full text-center bg-stone-850 hover:bg-stone-900 text-white text-[11px] font-bold py-2.5 rounded-xl transition-all shadow-sm"
            >
              Cumpără Acces
            </Link>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-6 py-10 border-t border-[#EBE7DF] text-center text-[10px] text-stone-500">
        © 2026 Focusly. Toate drepturile rezervate. Creat cu dragoste pentru creierele neurodivergente.
      </footer>

    </div>
  );
}
