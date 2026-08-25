'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useFocuslyStore } from '../../../store/useFocuslyStore';
import { Play, Pause, RotateCcw, Sparkles, AlertCircle } from 'lucide-react';
import { AmbientSounds } from '../../../components/AmbientSounds';

function FocusTimerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTaskName = searchParams.get('activeTaskName') || 'Sesiune Focusly';

  const { addFocusSession, profile } = useFocuslyStore();
  const [timerMode, setTimerMode] = useState<'pomodoro' | 'free'>('pomodoro');
  const [duration, setDuration] = useState<number>(25 * 60);
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [limitWarning, setLimitWarning] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timerMode === 'pomodoro') {
      setTimeLeft(duration);
    } else {
      setTimeLeft(0);
    }
    setIsRunning(false);
  }, [duration, timerMode]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (timerMode === 'pomodoro') {
            if (prev <= 1) {
              handleFinishSession();
              return 0;
            }
            return prev - 1;
          } else {
            return prev + 1;
          }
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timerMode]);

  function handleFinishSession() {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);

    // Save session in store and verify freemium limits
    const success = addFocusSession(activeTaskName, timerMode === 'pomodoro' ? duration : timeLeft);
    if (!success) {
      setLimitWarning(true);
      return;
    }

    // Play synthesized bell sound
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 587.33; // D5 warm tone
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 1.2);
    } catch (e) {
      console.warn('Completion sound failed', e);
    }

    alert('Sesiune încheiată cu succes! 🎉 Excelent efort.');
  }

  function handleStartStop() {
    setIsRunning(!isRunning);
  }

  function handleReset() {
    setIsRunning(false);
    if (timerMode === 'pomodoro') {
      setTimeLeft(duration);
    } else {
      setTimeLeft(0);
    }
  }

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  return (
    <div className="space-y-6">
      
      {limitWarning && (
        <div className="bg-orange-50 border border-orange-200 p-4 rounded-3xl flex items-start gap-3">
          <AlertCircle size={16} className="text-[#D97736] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-orange-850">Limită Focus Zilnică Atingasă</p>
            <p className="text-[9px] text-orange-700/80">
              Contul gratuit este limitat la 3 sesiuni de focus pe zi. Upgradează la Focusly Premium pentru a debloca sesiuni nelimitate.
            </p>
            <button
              onClick={() => router.push('/settings')}
              className="text-[9px] font-bold text-[#D97736] hover:underline block mt-1"
            >
              Vezi Opțiuni Upgrade →
            </button>
          </div>
        </div>
      )}

      {/* Select mode */}
      <div className="flex bg-white border border-[#EBE7DF] rounded-2xl p-1 shadow-sm">
        <button
          onClick={() => setTimerMode('pomodoro')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            timerMode === 'pomodoro' ? 'bg-[#4A7C59] text-white' : 'text-stone-600'
          }`}
        >
          Pomodoro Adaptat
        </button>
        <button
          onClick={() => setTimerMode('free')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            timerMode === 'free' ? 'bg-[#4A7C59] text-white' : 'text-stone-600'
          }`}
        >
          Cronometru Liber
        </button>
      </div>

      {timerMode === 'pomodoro' && (
        <div className="flex gap-2">
          {([15, 25, 45] as const).map((m) => {
            const isSelected = duration === m * 60;
            return (
              <button
                key={m}
                onClick={() => setDuration(m * 60)}
                className={`flex-1 py-1.5 text-[10px] font-bold rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                    : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                {m} min
              </button>
            );
          })}
        </div>
      )}

      {/* Big Timer Display */}
      <div className="bg-white border border-[#EBE7DF] rounded-3xl p-8 shadow-sm flex flex-col items-center py-12">
        
        <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-100 px-3.5 py-1.5 rounded-full mb-6">
          <Sparkles size={12} className="text-[#4A7C59]" />
          <span className="text-[10px] text-stone-700 font-bold text-center">
            Lucrăm împreună: {activeTaskName}
          </span>
        </div>

        <span className="text-5xl font-extrabold text-[#2D312E] tracking-widest font-mono mb-8">
          {formatTime(timeLeft)}
        </span>

        <div className="flex gap-4">
          <button
            onClick={handleStartStop}
            className="bg-[#4A7C59] hover:bg-emerald-700 h-14 w-14 rounded-full flex items-center justify-center text-white transition-all shadow-md"
          >
            {isRunning ? <Pause size={18} /> : <Play size={18} className="ml-1" />}
          </button>
          <button
            onClick={handleReset}
            className="bg-stone-50 border border-stone-200 h-14 w-14 rounded-full flex items-center justify-center text-stone-500 hover:bg-stone-100 transition-all shadow-sm"
          >
            <RotateCcw size={18} />
          </button>
        </div>

        {/* Action to manual complete stopwatch sessions */}
        {timerMode === 'free' && isRunning && (
          <button
            onClick={handleFinishSession}
            className="mt-6 bg-[#D97736] hover:bg-orange-600 text-white text-[10px] font-bold px-5 py-2 rounded-xl transition-all shadow-sm"
          >
            Finalizează Sesiunea
          </button>
        )}

        <p className="text-[10px] text-stone-500 text-center mt-8 max-w-xs">
          „Nu te uita continuu la ceas. Fă doar primul minut. Suntem cu tine.”
        </p>
      </div>

      <AmbientSounds />
    </div>
  );
}

export default function FocusPage() {
  return (
    <div className="p-6 md:p-10 space-y-6">
      <header className="flex flex-col gap-0.5">
        <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Focus asistat</span>
        <h1 className="text-xl font-black text-[#2D312E] tracking-tight">Body-doubling & Ambient Sonor</h1>
      </header>

      <Suspense fallback={<div className="text-xs text-stone-500 animate-pulse">Se încarcă spațiul de focus...</div>}>
        <FocusTimerContent />
      </Suspense>
    </div>
  );
}
