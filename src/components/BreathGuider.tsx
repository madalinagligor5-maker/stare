'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function BreathGuider() {
  const [phase, setPhase] = useState<'Inspiră' | 'Menține' | 'Expiră'>('Inspiră');
  const [timer, setTimer] = useState(4);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setPhase((currentPhase) => {
            if (currentPhase === 'Inspiră') return 'Menține';
            if (currentPhase === 'Menține') return 'Expiră';
            return 'Inspiră';
          });
          return 4;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-6 text-center">
      <div className="relative flex items-center justify-center h-48 w-48">
        <motion.div
          animate={{
            scale: phase === 'Inspiră' ? 1.7 : phase === 'Menține' ? 1.7 : 1.0,
          }}
          transition={{
            duration: phase === 'Menține' ? 0 : 4,
            ease: 'easeInOut',
          }}
          className="absolute h-24 w-24 rounded-full bg-emerald-100 dark:bg-emerald-950 opacity-60"
        />
        
        <div className="h-20 w-20 rounded-full bg-emerald-600 flex flex-col items-center justify-center text-white font-bold shadow-lg z-10">
          <AnimatePresence mode="wait">
            <motion.span
              key={phase}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="text-[10px] uppercase tracking-wider font-semibold"
            >
              {phase}
            </motion.span>
          </AnimatePresence>
          <span className="text-base font-mono mt-0.5">{timer}</span>
        </div>
      </div>
      <p className="mt-4 text-[10px] text-stone-500 max-w-[280px]">
        Urmează cercul: 4 secunde Inspiră, 4 secunde Menține, 4 secunde Expiră.
      </p>
    </div>
  );
}
