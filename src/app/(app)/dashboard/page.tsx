'use client';

import React, { useState, useEffect } from 'react';
import { useFocuslyStore } from '../../../store/useFocuslyStore';
import { SOSBanner } from '../../../components/SOSBanner';
import { BreathGuider } from '../../../components/BreathGuider';
import { Sparkles, HelpCircle, Heart, Flame } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const { tasks, checkIns, addCheckIn } = useFocuslyStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-[#6C726D] text-xs font-semibold">Se încarcă spațiul tău...</div>
      </div>
    );
  }

  const todayKey = new Date().toISOString().split('T')[0];
  const todayCheckIn = checkIns.find((c) => c.date === todayKey);
  const anchorTasks = tasks.filter((t) => t.isAnchorTask && !t.isCompleted).slice(0, 3);
  const completedTodayCount = tasks.filter((t) => t.isCompleted && t.completedAt && new Date(t.completedAt).toISOString().split('T')[0] === todayKey).length;

  function handleCheckIn(type: 'energy' | 'focus' | 'mood', value: any) {
    const existing = todayCheckIn || {
      date: todayKey,
      energy: 'medium',
      focus: 'ok',
      mood: 'neutral',
    };
    addCheckIn({
      ...existing,
      [type]: value,
    });
  }

  function handleStartFocus(taskTitle: string) {
    router.push(`/focus?activeTaskName=${encodeURIComponent(taskTitle)}`);
  }

  return (
    <div className="p-6 md:p-10 space-y-6">
      
      {/* Greetings */}
      <header className="flex flex-col gap-0.5">
        <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Focusly PWA</span>
        <h1 className="text-lg font-black text-[#2D312E] tracking-tight">O luăm pas cu pas, în ritmul tău.</h1>
      </header>

      {/* SOS Banner */}
      <SOSBanner />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Check-In */}
        <section className="bg-white border border-[#EBE7DF] p-5 rounded-3xl shadow-sm space-y-4">
          <h2 className="text-[10px] font-extrabold text-[#2D312E] uppercase tracking-wider">Verificarea stării de azi</h2>
          
          <div className="space-y-1.5">
            <span className="text-[9px] font-extrabold text-stone-500 uppercase">Baterie Energie:</span>
            <div className="flex gap-2">
              {(['low', 'medium', 'high'] as const).map((lvl) => {
                const label = lvl === 'low' ? 'Low 🔋' : lvl === 'medium' ? 'Medie 🔋🔋' : 'Mare 🔋🔋🔋';
                const isSelected = todayCheckIn?.energy === lvl;
                return (
                  <button
                    key={lvl}
                    onClick={() => handleCheckIn('energy', lvl)}
                    className={`flex-1 py-1.5 px-1 text-[9px] font-bold rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[9px] font-extrabold text-stone-500 uppercase">Focus Mental:</span>
            <div className="flex gap-2">
              {(['scattered', 'ok', 'in_flow'] as const).map((lvl) => {
                const label = lvl === 'scattered' ? 'Împrăștiat 🌀' : lvl === 'ok' ? 'Ok 🧘' : 'În flux ⚡';
                const isSelected = todayCheckIn?.focus === lvl;
                return (
                  <button
                    key={lvl}
                    onClick={() => handleCheckIn('focus', lvl)}
                    className={`flex-1 py-1.5 px-1 text-[9px] font-bold rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[9px] font-extrabold text-stone-500 uppercase">Dispoziție:</span>
            <div className="flex gap-2">
              {(['overwhelmed', 'neutral', 'good'] as const).map((lvl) => {
                const label = lvl === 'overwhelmed' ? 'Copleșit 🌀' : lvl === 'neutral' ? 'Neutru 🧘' : 'Bine ☀️';
                const isSelected = todayCheckIn?.mood === lvl;
                return (
                  <button
                    key={lvl}
                    onClick={() => handleCheckIn('mood', lvl)}
                    className={`flex-1 py-1.5 px-1 text-[9px] font-bold rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Breath Micro Card */}
        <section className="bg-white border border-[#EBE7DF] p-5 rounded-3xl shadow-sm flex flex-col justify-center">
          <h2 className="text-[10px] font-extrabold text-[#2D312E] uppercase tracking-wider mb-2">Respirație scurtă (1 Minut)</h2>
          <BreathGuider />
        </section>
      </div>

      {/* Anchor Tasks */}
      <section className="bg-white border border-[#EBE7DF] p-6 rounded-3xl shadow-sm">
        <h2 className="text-[#2D312E] text-xs font-extrabold uppercase tracking-wider mb-4">Ce fac acum? (Sarcină Ancoră)</h2>
        {anchorTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <HelpCircle size={24} className="text-stone-400 mb-2" />
            <p className="text-[10px] text-stone-500 font-medium">
              Niciun task setat ca ancoră de focus momentan. Mergi la tab-ul de task-uri.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {anchorTasks.map((t) => (
              <div key={t.id} className="flex items-center justify-between border border-stone-100 dark:border-stone-850 p-4 rounded-2xl">
                <div>
                  <span className="text-[8px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {t.energyRequired === 'low' ? 'Low Energy' : t.energyRequired === 'medium' ? 'Medium' : 'High Energy'}
                  </span>
                  <h4 className="text-xs font-bold text-[#2D312E] dark:text-stone-200 mt-2">{t.title}</h4>
                </div>
                <button
                  onClick={() => handleStartFocus(t.title)}
                  className="bg-[#4A7C59] hover:bg-emerald-700 text-white text-[10px] font-bold px-3.5 py-1.5 rounded-xl transition-all shadow-sm flex items-center gap-1"
                >
                  <Flame size={12} />
                  <span>Pornește Focus</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Progress banner */}
      <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-3xl flex items-center gap-3">
        <Heart size={16} className="text-[#4A7C59]" />
        <p className="text-[10px] font-bold text-[#4A7C59]">
          {completedTodayCount > 0
            ? `Ai finalizat ${completedTodayCount} acțiuni bune astăzi. Ritmul tău este minunat.`
            : 'Fără rușine, fără streak-uri de păstrat. Fiecare pas contează.'}
        </p>
      </div>

    </div>
  );
}
