'use client';

import React, { useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { SOSModal } from './SOSModal';

export function SOSBanner() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full bg-orange-50 border border-orange-200/40 dark:bg-orange-950/10 dark:border-orange-900/30 rounded-3xl p-4 flex items-center justify-between transition-all hover:bg-orange-100/50 shadow-sm text-left"
      >
        <div className="flex-1 pr-3">
          <h3 className="text-xs font-bold text-orange-850 dark:text-orange-400 uppercase tracking-wider">Sunt copleșit(ă) 🌀</h3>
          <p className="text-[10px] text-orange-700/80 dark:text-orange-300/80 mt-0.5">
            Apasă aici pentru respirație ghidată, sunete calmante și resetare somatică instant.
          </p>
        </div>
        <div className="h-10 w-10 rounded-full bg-[#D97736] flex items-center justify-center text-white shrink-0 shadow">
          <ShieldAlert size={18} />
        </div>
      </button>

      <SOSModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
