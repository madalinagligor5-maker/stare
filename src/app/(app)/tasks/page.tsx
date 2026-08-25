'use client';

import React, { useState, useEffect } from 'react';
import { useFocuslyStore } from '../../../store/useFocuslyStore';
import { EnergyLevel } from '../../../types';
import { Sparkles, CalendarDays, CheckCircle2, Circle, Plus, Trash2, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function TasksPage() {
  const {
    tasks,
    addTask,
    toggleTask,
    deleteTask,
    postponeTask,
    breakDownTask,
    toggleSubTask,
    completedRoutineSteps,
    toggleRoutineStep,
    profile
  } = useFocuslyStore();

  const [mounted, setMounted] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskEnergy, setNewTaskEnergy] = useState<EnergyLevel>('medium');
  const [filterEnergy, setFilterEnergy] = useState<EnergyLevel | 'all'>('all');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [limitWarning, setLimitWarning] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-[#6C726D] text-xs font-semibold">Se încarcă task-urile...</div>
      </div>
    );
  }

  const isPremium = profile?.subscription_status === 'premium';
  const activeTasksCount = tasks.filter(t => !t.isCompleted).length;
  const todayKey = new Date().toISOString().split('T')[0];

  function handleAddTask() {
    if (!newTaskTitle.trim()) return;
    const success = addTask(newTaskTitle.trim(), newTaskEnergy, true);
    if (!success) {
      setLimitWarning(true);
    } else {
      setNewTaskTitle('');
      setLimitWarning(false);
    }
  }

  const filteredTasks = tasks.filter((t) => {
    if (filterEnergy === 'all') return true;
    return t.energyRequired === filterEnergy;
  });

  const visibleTasks = filteredTasks.slice(0, 5);
  const hiddenTasks = filteredTasks.slice(5);

  const routines = [
    {
      id: 'morning',
      title: 'Dimineață blândă 🌅',
      steps: ['Bea un pahar cu apă', 'Ia pastilele / Mănâncă ceva ușor', 'Pune haine comode']
    },
    {
      id: 'reset',
      title: 'Reset de 5 min 🍃',
      steps: ['Deschide geamul pentru aer curat', 'Respiră adânc de 3 ori', 'Pune un singur lucru la loc']
    },
    {
      id: 'evening',
      title: 'Seară liniștită 🌃',
      steps: ['Setează lumini calde', 'Închide ecranele cu 30 min înainte de somn', 'Pregătește hainele de mâine']
    }
  ];

  function renderTaskCard(t: any) {
    return (
      <div
        key={t.id}
        className={`bg-white border border-[#EBE7DF] rounded-2xl p-4 shadow-sm transition-all ${
          t.isCompleted ? 'opacity-65' : ''
        }`}
      >
        <div className="flex items-center justify-between">
          <button
            onClick={() => toggleTask(t.id)}
            className="flex items-center text-left flex-1 mr-3"
          >
            {t.isCompleted ? (
              <CheckCircle2 size={16} className="text-[#4A7C59] mr-2.5 shrink-0" />
            ) : (
              <Circle size={16} className="text-stone-400 mr-2.5 shrink-0" />
            )}
            <span className={`text-[11px] font-bold ${t.isCompleted ? 'line-through text-stone-400 font-medium' : 'text-[#2D312E]'}`}>
              {t.title}
            </span>
          </button>
          <button onClick={() => deleteTask(t.id)} className="p-1 hover:bg-stone-50 rounded-lg">
            <Trash2 size={13} className="text-[#C05C54]" />
          </button>
        </div>

        {t.subtasks.length > 0 && (
          <div className="bg-stone-50/60 border border-stone-100 rounded-xl p-3 mt-3 space-y-2">
            {t.subtasks.map((st: any) => (
              <button
                key={st.id}
                onClick={() => toggleSubTask(t.id, st.id)}
                className="flex items-center w-full text-left"
              >
                {st.isCompleted ? (
                  <CheckCircle2 size={13} className="text-[#4A7C59] mr-2 shrink-0" />
                ) : (
                  <Circle size={13} className="text-stone-400 mr-2 shrink-0" />
                )}
                <span className={`text-[10px] ${st.isCompleted ? 'line-through text-stone-400' : 'text-stone-700'}`}>
                  {st.title}
                </span>
              </button>
            ))}
          </div>
        )}

        {!t.isCompleted && (
          <div className="flex gap-2 mt-3 pt-3 border-t border-stone-100">
            {t.subtasks.length === 0 && (
              <button
                onClick={() => breakDownTask(t.id)}
                className="flex items-center justify-center gap-1 bg-stone-50 border border-stone-200/50 py-1.5 px-3 rounded-xl flex-1 text-[#4A7C59] text-[9px] font-extrabold hover:bg-emerald-50/30"
              >
                <Sparkles size={11} />
                <span>Sparge Task (2 min)</span>
              </button>
            )}
            <button
              onClick={() => postponeTask(t.id)}
              className="flex items-center justify-center gap-1 bg-stone-50 border border-stone-200/50 py-1.5 px-3 rounded-xl flex-1 text-[#D97736] text-[9px] font-extrabold hover:bg-orange-50/30"
            >
              <CalendarDays size={11} />
              <span>Amână fără vină</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 space-y-6">
      
      <header className="flex flex-col gap-0.5">
        <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Organizare adaptată</span>
        <h1 className="text-xl font-black text-[#2D312E] tracking-tight">Task-uri & Rutine blânde</h1>
      </header>

      {/* Freemium Limit Alert */}
      {limitWarning && (
        <div className="bg-orange-50 border border-orange-200 p-4 rounded-3xl flex items-start gap-3">
          <AlertCircle size={16} className="text-[#D97736] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-orange-850">Limită Premium atinsă</p>
            <p className="text-[9px] text-orange-700/80">
              Contul gratuit permite maxim 5 task-uri active concomitent. Pentru a adăuga mai multe, finalizează sarcinile curente sau upgradează la contul premium.
            </p>
            <Link href="/settings" className="text-[9px] font-bold text-[#D97736] hover:underline block mt-1">
              Vezi Abonamente Premium →
            </Link>
          </div>
        </div>
      )}

      {/* Task Creator */}
      <section className="bg-white border border-[#EBE7DF] p-5 rounded-3xl shadow-sm">
        <span className="text-[10px] font-bold text-stone-600 block mb-2">Adaugă o nouă sarcină:</span>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="Ex: Trimite mesajul scurt..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="flex-1 bg-stone-50 border border-stone-200 rounded-2xl px-4 py-2 text-xs text-[#2D312E] focus:outline-none focus:border-[#4A7C59]"
          />
          <button
            onClick={handleAddTask}
            className="bg-[#4A7C59] hover:bg-emerald-700 text-white rounded-2xl px-4 flex items-center justify-center transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>

        <div className="space-y-1.5">
          <span className="text-[9px] font-extrabold text-stone-500 uppercase block">De câtă energie ai nevoie?</span>
          <div className="flex gap-2">
            {(['low', 'medium', 'high'] as const).map((lvl) => {
              const isSelected = newTaskEnergy === lvl;
              return (
                <button
                  key={lvl}
                  onClick={() => setNewTaskEnergy(lvl)}
                  className={`flex-1 py-1.5 text-[10px] font-bold rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                      : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {lvl === 'low' ? 'Low 🔋' : lvl === 'medium' ? 'Mediu 🔋🔋' : 'Mare 🔋🔋🔋'}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="flex flex-wrap items-center gap-2">
        <span className="text-[9px] font-bold text-stone-500 mr-1 uppercase">Filtru Energie:</span>
        {([
          { id: 'all', label: 'Toate 🌟' },
          { id: 'low', label: 'Low 🔋' },
          { id: 'medium', label: 'Mediu 🔋🔋' },
          { id: 'high', label: 'High 🔋🔋🔋' }
        ] as const).map((opt) => {
          const isSelected = filterEnergy === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setFilterEnergy(opt.id)}
              className={`py-1.5 px-3 rounded-full border text-[9px] font-bold transition-all ${
                isSelected
                  ? 'bg-[#4A7C59] border-[#4A7C59] text-white shadow-sm'
                  : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </section>

      {/* Task List */}
      <section className="space-y-3">
        {filteredTasks.length === 0 ? (
          <p className="text-[10px] text-[#6C726D] text-center py-6">Nicio sarcină activă.</p>
        ) : (
          <>
            <div className="space-y-3">{visibleTasks.map(renderTaskCard)}</div>

            {/* Retractable Drawer "Pentru mai târziu" */}
            {hiddenTasks.length > 0 && (
              <div className="mt-4 border-t border-[#EBE7DF] pt-4 text-center">
                <button
                  onClick={() => setDrawerOpen(!drawerOpen)}
                  className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#6C726D] hover:text-[#2D312E]"
                >
                  <span>Sarcini în sertar ({hiddenTasks.length})</span>
                  {drawerOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>

                {drawerOpen && <div className="space-y-3 mt-3 text-left">{hiddenTasks.map(renderTaskCard)}</div>}
              </div>
            )}
          </>
        )}
      </section>

      {/* Preset Routines */}
      <section className="space-y-4">
        <h2 className="text-xs font-extrabold text-[#2D312E] uppercase tracking-wider">Rutine Zilnice</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {routines.map((r) => {
            const key = `${todayKey}_${r.id}`;
            const doneSteps = completedRoutineSteps[key] || [];

            return (
              <div key={r.id} className="bg-white border border-[#EBE7DF] p-5 rounded-3xl shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-extrabold text-[#2D312E] mb-3">{r.title}</h3>
                  <div className="space-y-2">
                    {r.steps.map((step) => {
                      const isStepDone = doneSteps.includes(step);
                      return (
                        <button
                          key={step}
                          onClick={() => toggleRoutineStep(todayKey, r.id, step)}
                          className="flex items-center text-left w-full"
                        >
                          {isStepDone ? (
                            <CheckCircle2 size={15} className="text-[#4A7C59] mr-2 shrink-0" />
                          ) : (
                            <Circle size={15} className="text-stone-400 mr-2 shrink-0" />
                          )}
                          <span className={`text-[10px] ${isStepDone ? 'line-through text-stone-400 font-medium' : 'text-stone-700'}`}>
                            {step}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
