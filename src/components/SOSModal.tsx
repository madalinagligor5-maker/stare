'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Wind, Zap } from 'lucide-react';
import { BreathGuider } from './BreathGuider';
import { AmbientSounds } from './AmbientSounds';

interface SOSModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SOSModal({ isOpen, onClose }: SOSModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            className="relative bg-[#FAF8F5] dark:bg-stone-950 w-full max-w-lg rounded-3xl shadow-xl overflow-hidden border border-[#EBE7DF] dark:border-stone-900 z-10 max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#EBE7DF] dark:border-stone-900 bg-white dark:bg-stone-900/55">
              <div className="flex items-center gap-2">
                <Heart size={16} className="text-[#C05C54]" />
                <h2 className="text-xs font-extrabold text-[#2D312E] dark:text-stone-250 uppercase tracking-wider">
                  Sunt Copleșit(ă) - Calmare Urgentă
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-900 transition-colors"
              >
                <X size={16} className="text-[#6C726D]" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Breath */}
              <div className="bg-white dark:bg-stone-900 p-5 rounded-3xl border border-stone-100 dark:border-stone-900 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Wind size={16} className="text-[#4A7C59]" />
                  <h4 className="text-xs font-bold text-[#2D312E] dark:text-stone-200">
                    1. Respirație Reglată (Box Breathing)
                  </h4>
                </div>
                <BreathGuider />
              </div>

              {/* Ambient Audio */}
              <AmbientSounds />

              {/* Physical/Somatic guidelines */}
              <div className="bg-white dark:bg-stone-900 p-5 rounded-3xl border border-stone-100 dark:border-stone-900 shadow-sm space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <Zap size={16} className="text-[#D97736]" />
                  <h4 className="text-xs font-bold text-[#2D312E] dark:text-stone-200">
                    2. Resetare Somatică Rapidă
                  </h4>
                </div>

                <div className="border-l-2 border-[#D97736] pl-3 py-1">
                  <h5 className="text-[11px] font-bold text-stone-800 dark:text-stone-200">
                    Apă rece pe față (Reflexul de scufundare)
                  </h5>
                  <p className="text-[10px] text-stone-500 mt-1">
                    Mergi la baie și stropește-ți fața cu apă foarte rece timp de 15 secunde. Acesta stimulează nervul vag, scăzând instantaneu ritmul cardiac și copleșirea.
                  </p>
                </div>

                <div className="border-l-2 border-[#4A7C59] pl-3 py-1">
                  <h5 className="text-[11px] font-bold text-stone-800 dark:text-stone-200">
                    Scutură tensiunea acumulată
                  </h5>
                  <p className="text-[10px] text-stone-500 mt-1">
                    Ridică-te și scutură-ți brațele, umerii și picioarele timp de 30 de secunde. Ajută la disiparea adrenalinei de luptă/fugă din corp.
                  </p>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
