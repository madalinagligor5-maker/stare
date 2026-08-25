'use client';

import React, { useState, useEffect } from 'react';
import { useFocuslyStore } from '../../../store/useFocuslyStore';
import { Heart, Sparkles, Smile, AlertCircle, HelpCircle } from 'lucide-react';
import Link from 'next/link';

const WELL_TAGS = ['Plimbare 🚶', 'Focus 🧘', 'Pauză utilă ☕', 'Somn bun 😴', 'Hidratare 💧'];
const BLOCK_TAGS = ['Zgomot 🔊', 'Oboseală 🥱', 'Paralizie/ADHD 🌀', 'Task prea mare 🧗', 'Frică/RSD 💔'];

export default function JournalPage() {
  const { addJournalEntry, journalEntries, profile } = useFocuslyStore();
  const [mounted, setMounted] = useState(false);
  const [wentWellText, setWentWellText] = useState('');
  const [selectedWellTags, setSelectedWellTags] = useState<string[]>([]);
  const [selectedBlockTags, setSelectedBlockTags] = useState<string[]>([]);
  const [limitWarning, setLimitWarning] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-[#6C726D] text-xs font-semibold">Se încarcă jurnalul...</div>
      </div>
    );
  }

  const isPremium = profile?.subscription_status === 'premium';

  function handleToggleWellTag(tag: string) {
    setSelectedWellTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function handleToggleBlockTag(tag: string) {
    setSelectedBlockTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function handleSaveJournal() {
    if (!wentWellText.trim() && selectedWellTags.length === 0 && selectedBlockTags.length === 0) {
      alert('Te rugăm să completezi un gând sau să bifezi etichete.');
      return;
    }

    const todayKey = new Date().toISOString().split('T')[0];
    const success = addJournalEntry({
      date: todayKey,
      wentWell: wentWellText.trim() || `Activități bifate: ${selectedWellTags.join(', ')}`,
      blockers: selectedBlockTags,
    });

    if (!success) {
      setLimitWarning(true);
    } else {
      setWentWellText('');
      setSelectedWellTags([]);
      setSelectedBlockTags([]);
      setLimitWarning(false);
      alert('Salvat cu succes offline!');
    }
  }

  return (
    <div className="p-6 md:p-10 space-y-6">
      
      <header className="flex flex-col gap-0.5">
        <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Auto-reflecție</span>
        <h1 className="text-xl font-black text-[#2D312E] tracking-tight">Jurnal de 30 Secunde & Insights</h1>
      </header>

      {limitWarning && (
        <div className="bg-orange-50 border border-orange-200 p-4 rounded-3xl flex items-start gap-3">
          <AlertCircle size={16} className="text-[#D97736] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-orange-850">Limita Jurnal Gratuit</p>
            <p className="text-[9px] text-orange-700/80">
              Contul gratuit este limitat la 3 înregistrări de jurnal. Pentru istoric nelimitat, statistici săptămânale și modele de comportament, upgradează la contul premium.
            </p>
            <Link href="/settings" className="text-[9px] font-bold text-[#D97736] hover:underline block mt-1">
              Vezi Abonamente Premium →
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Logger form */}
        <section className="bg-white border border-[#EBE7DF] p-5 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Smile size={16} className="text-[#4A7C59]" />
            <h2 className="text-xs font-extrabold text-[#2D312E] uppercase tracking-wider">Reflecție rapidă</h2>
          </div>

          <div className="space-y-1.5">
            <span className="text-[9px] font-bold text-stone-600 block">Ce a mers bine azi?</span>
            <div className="flex flex-wrap gap-1.5">
              {WELL_TAGS.map((tag) => {
                const isSelected = selectedWellTags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => handleToggleWellTag(tag)}
                    className={`py-1.5 px-3 rounded-full border text-[9px] font-bold transition-all ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[9px] font-bold text-stone-600 block">Ce te-a blocat sau obosit?</span>
            <div className="flex flex-wrap gap-1.5">
              {BLOCK_TAGS.map((tag) => {
                const isSelected = selectedBlockTags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => handleToggleBlockTag(tag)}
                    className={`py-1.5 px-3 rounded-full border text-[9px] font-bold transition-all ${
                      isSelected
                        ? 'bg-orange-50 border-orange-500 text-orange-700'
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[9px] font-bold text-stone-600 block">Adaugă detalii mărunte (fără stres):</span>
            <textarea
              placeholder="O mică victorie, o lecție simplă..."
              value={wentWellText}
              onChange={(e) => setWentWellText(e.target.value)}
              rows={3}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-[#2D312E] focus:outline-none focus:border-[#4A7C59] resize-none"
            />
          </div>

          <button
            onClick={handleSaveJournal}
            className="w-full bg-[#4A7C59] hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-sm"
          >
            Salvează Reflecția
          </button>
        </section>

        {/* Insights & History */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#D97736]" />
            <h2 className="text-xs font-extrabold text-[#2D312E] uppercase tracking-wider">Ce m-a ajutat săptămâna asta</h2>
          </div>

          {!isPremium ? (
            <div className="bg-white border border-[#EBE7DF] p-6 rounded-3xl shadow-sm text-center py-10 space-y-4">
              <AlertCircle size={24} className="text-[#D97736] mx-auto" />
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-stone-850">Dezvoltă-ți inteligența emoțională</h3>
                <p className="text-[10px] text-stone-500 leading-relaxed">
                  Secțiunea de insights, rapoarte săptămânale de focus și depistarea blockerilor necesită acces **Premium**.
                </p>
              </div>
              <Link
                href="/settings"
                className="inline-block bg-[#4A7C59] hover:bg-emerald-700 text-white text-[10px] font-bold px-5 py-2 rounded-xl transition-all shadow-sm"
              >
                Deblochează Premium
              </Link>
            </div>
          ) : (
            <div className="bg-white border border-[#EBE7DF] p-5 rounded-3xl shadow-sm space-y-4">
              <div className="border-l-2 border-[#4A7C59] pl-3 py-1">
                <h4 className="text-[10px] font-bold text-stone-800">Cei mai buni catalizatori de productivitate:</h4>
                <p className="text-[10px] text-stone-500 mt-0.5">Focus 🧘, Hidratare 💧</p>
              </div>
              <div className="border-l-2 border-[#C05C54] pl-3 py-1">
                <h4 className="text-[10px] font-bold text-stone-800">Cei mai frecvenți blocatori detectați:</h4>
                <p className="text-[10px] text-stone-500 mt-0.5">Oboseală 🥱, Paralizie/ADHD 🌀</p>
              </div>
              <div className="bg-stone-50 p-3 rounded-2xl border border-stone-100">
                <h4 className="text-[10px] font-bold text-[#4A7C59] flex items-center gap-1">
                  <Heart size={10} />
                  <span>Sfat blând Focusly:</span>
                </h4>
                <p className="text-[9px] text-stone-500 mt-1 leading-relaxed">
                  Datele tale arată că te simți mai concentrat(ă) în zilele în care bifezi „Hidratare 💧”. Asigură-te că ții un pahar de apă la vedere pe birou.
                </p>
              </div>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
