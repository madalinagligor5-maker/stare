'use client';

import React, { useState } from 'react';
import { BookOpen, Search, ArrowRight, ArrowLeft } from 'lucide-react';
import { useFocuslyStore } from '../../../store/useFocuslyStore';
import Link from 'next/link';

const ARTICLES = [
  {
    id: '1',
    title: 'Cum încep când am paralizie de decizie? 🌀',
    summary: 'Metoda micro-start-urilor și regula celor 2 minute pentru a învinge rezistența fizică.',
    readTimeMinutes: 2,
    premiumOnly: false,
    content: [
      'Paralizia de inițiere (ADHD Paralysis) nu este lene. Este o problemă de reglare a dopaminei în creier.',
      'Metoda Micro-Start: În loc să te gândești la întregul proiect, alege o acțiune ridicol de mică. De exemplu, doar deschide fișierul Word sau pune-ți adidașii în picioare.',
      'Regula de 2 minute: Promite-ți că vei lucra doar 2 minute. Dacă după 120 de secunde corpul tău refuză în continuare și simți un stres imens, ai voie complet să te oprești fără nicio vinovăție.',
      'Sărbătorește începerea: Simplul fapt că ai deschis fișierul este o victorie uriașă pentru creierul tău astăzi.'
    ]
  },
  {
    id: '2',
    title: 'Cum gestionez frica de respingere (RSD)? 💔',
    summary: 'Ce este Rejection Sensitive Dysphoria și cum diferențiezi faptele de frică.',
    readTimeMinutes: 3,
    premiumOnly: false,
    content: [
      'RSD (Rejection Sensitive Dysphoria) este o sensibilitate extremă la respingere, critică sau eșec, foarte comună în ADHD.',
      'Separă Faptele de Povești: Când simți că cineva te judecă sau este supărat pe tine, scrie pe foaie doar FAPTELE (ex. "Colegul a răspuns mai scurt la e-mail").',
      'Identifică povestea creată de frică: "Este supărat pe mine, voi fi concediat, nu sunt bun de nimic."',
      'Validează emoția: RSD doare fizic. Permite-ți să simți durerea fără să iei decizii pripite în acele momente.'
    ]
  },
  {
    id: '3',
    title: 'Reset senzorial în 3 minute 🧘',
    summary: 'Tehnici rapide de calmare a sistemului nervos suprastimulat.',
    readTimeMinutes: 3,
    premiumOnly: true,
    content: [
      'Suprastimularea senzorială duce la oboseală extremă și iritabilitate.',
      'Reset auditiv: Pune-ți căștile cu anulare a zgomotului sau ascultă brown noise timp de 2 minute.',
      'Reset vizual: Închide ochii sau fixează un singur obiect din cameră (o plantă, o textură) reducând stimulii vizuali.',
      'Reset somatic: Pune o lavetă rece pe ceafă sau spală-ți mâinile cu apă foarte rece ca gheața. Ajută la calmarea sistemului nervos simpatic.'
    ]
  }
];

export default function ResourcesPage() {
  const { profile } = useFocuslyStore();
  const isPremium = profile?.subscription_status === 'premium';
  
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);

  const activeArticle = ARTICLES.find((a) => a.id === selectedArticleId);

  if (activeArticle) {
    const isLocked = activeArticle.premiumOnly && !isPremium;

    return (
      <div className="p-6 md:p-10 space-y-6">
        <button
          onClick={() => setSelectedArticleId(null)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6C726D] hover:text-[#2D312E]"
        >
          <ArrowLeft size={14} />
          <span>Înapoi la resurse</span>
        </button>

        <article className="bg-white border border-[#EBE7DF] rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          <header className="space-y-2">
            <span className="text-[9px] font-bold text-stone-500 uppercase">
              Ghid practic • {activeArticle.readTimeMinutes} min lectură
            </span>
            <h1 className="text-lg md:text-xl font-black text-[#2D312E] tracking-tight">{activeArticle.title}</h1>
          </header>

          {isLocked ? (
            <div className="bg-stone-50 p-6 rounded-2xl text-center space-y-4 border border-stone-200/50">
              <span className="text-2xl">🔒</span>
              <h3 className="text-xs font-bold text-stone-850">Resursă Premium</h3>
              <p className="text-[10px] text-stone-500 max-w-xs mx-auto leading-relaxed">
                Acest mini-ghid detaliat este accesibil exclusiv abonaților Focusly Premium.
              </p>
              <Link
                href="/settings"
                className="inline-block bg-[#4A7C59] hover:bg-emerald-700 text-white text-[10px] font-bold px-6 py-2 rounded-xl transition-all shadow-sm"
              >
                Deblochează Accesul
              </Link>
            </div>
          ) : (
            <div className="space-y-4 text-xs text-stone-700 leading-relaxed">
              {activeArticle.content.map((p, idx) => (
                <p key={idx} className="border-l-2 border-emerald-500/30 pl-3 py-1">
                  {p}
                </p>
              ))}
            </div>
          )}
        </article>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 space-y-6">
      
      <header className="flex flex-col gap-0.5">
        <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Mini-ghiduri practice</span>
        <h1 className="text-xl font-black text-[#2D312E] tracking-tight">Resurse & SOS Coping</h1>
      </header>

      <section className="grid grid-cols-1 gap-4">
        {ARTICLES.map((art) => {
          const isLocked = art.premiumOnly && !isPremium;
          return (
            <button
              key={art.id}
              onClick={() => setSelectedArticleId(art.id)}
              className="bg-white border border-[#EBE7DF] rounded-3xl p-5 shadow-sm text-left transition-all hover:bg-stone-50/40 flex items-center justify-between"
            >
              <div className="flex-1 pr-4 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold text-stone-500">
                    {art.readTimeMinutes} min citit
                  </span>
                  {art.premiumOnly && (
                    <span className="text-[8px] font-extrabold text-[#D97736] bg-orange-50 px-1.5 py-0.5 rounded uppercase">
                      Premium 🔒
                    </span>
                  )}
                </div>
                <h3 className="text-xs font-bold text-stone-850">{art.title}</h3>
                <p className="text-[10px] text-stone-500 leading-relaxed line-clamp-1">{art.summary}</p>
              </div>
              <ArrowRight size={14} className="text-[#6C726D]" />
            </button>
          );
        })}
      </section>

    </div>
  );
}
