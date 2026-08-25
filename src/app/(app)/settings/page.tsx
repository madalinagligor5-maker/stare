'use client';

import React, { useState, useEffect } from 'react';
import { useFocuslyStore } from '../../../store/useFocuslyStore';
import { redirectToCheckout, STRIPE_PRICES } from '../../../lib/stripe';
import { CreditCard, Bell, Database, Check, Award, ArrowRight } from 'lucide-react';

export default function SettingsPage() {
  const { profile, upgradeSubscription, cancelSubscription } = useFocuslyStore();
  const [mounted, setMounted] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-[#6C726D] text-xs font-semibold">Se încarcă setările...</div>
      </div>
    );
  }

  const isPremium = profile?.subscription_status === 'premium';

  async function handleBuy(tier: 'monthly' | 'yearly' | 'lifetime') {
    setCheckoutLoading(tier);
    // Simulate redirection
    const res: any = await redirectToCheckout(STRIPE_PRICES[tier].id, profile?.email || '');
    if (res && res.url) {
      // Simulate success callback
      upgradeSubscription(tier);
      alert(`Plată simulată cu succes pentru ${STRIPE_PRICES[tier].name}! Te bucuri acum de funcțiile Premium.`);
    }
    setCheckoutLoading(null);
  }

  function handleCancel() {
    if (confirm('Sigur vrei să anulezi abonamentul premium? Vei reveni la limitele free.')) {
      cancelSubscription();
      alert('Abonamentul a fost anulat.');
    }
  }

  function handleExport() {
    if (!isPremium) {
      alert('Exportul de date în format JSON/CSV este o funcție Premium.');
      return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(localStorage.getItem('focusly-pwa-storage')));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "date_focusly.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  return (
    <div className="p-6 md:p-10 space-y-6">
      
      <header className="flex flex-col gap-0.5">
        <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Opțiuni utilizator</span>
        <h1 className="text-xl font-black text-[#2D312E] tracking-tight">Setări Cont & Abonament</h1>
      </header>

      {/* Subscription Card */}
      <section className="bg-white border border-[#EBE7DF] p-5 rounded-3xl shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <CreditCard size={16} className="text-[#4A7C59]" />
          <h2 className="text-xs font-extrabold text-[#2D312E] uppercase tracking-wider">Abonament curent</h2>
        </div>

        {isPremium ? (
          <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[9px] font-bold text-white bg-[#4A7C59] px-2 py-0.5 rounded-full uppercase tracking-wider">
                Focusly Premium ⭐
              </span>
              <p className="text-[10px] text-stone-600 mt-1">
                Abonamentul tău ({profile?.subscription_period || 'lunar'}) este activ și securizat.
              </p>
            </div>
            <button
              onClick={handleCancel}
              className="text-[#C05C54] hover:underline text-[10px] font-bold"
            >
              Anulează Abonament
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200">
              <span className="text-[9px] font-bold text-stone-600 bg-stone-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Plan Gratuit
              </span>
              <p className="text-[10px] text-stone-500 mt-1">
                Ești limitat la 5 active task-uri, 3 sesiuni de focus zilnice și resurse de bază.
              </p>
            </div>

            {/* Upgrade Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(['monthly', 'yearly', 'lifetime'] as const).map((tier) => {
                const info = STRIPE_PRICES[tier];
                return (
                  <div key={tier} className="bg-white border border-stone-200 p-4 rounded-2xl flex flex-col justify-between">
                    <div>
                      <h4 className="text-[10px] font-bold text-stone-700">{info.name}</h4>
                      <p className="text-lg font-black text-stone-850 mt-1">
                        {info.price} RON
                      </p>
                      <span className="text-[8px] text-stone-500">{info.interval}</span>
                    </div>
                    <button
                      onClick={() => handleBuy(tier)}
                      disabled={checkoutLoading !== null}
                      className="mt-3 w-full bg-[#4A7C59] hover:bg-emerald-700 text-white text-[9px] font-bold py-1.5 rounded-xl transition-all"
                    >
                      {checkoutLoading === tier ? 'Procesare...' : 'Cumpără'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Notification Preferences */}
      <section className="bg-white border border-[#EBE7DF] p-5 rounded-3xl shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-[#D97736]" />
          <h2 className="text-xs font-extrabold text-[#2D312E] uppercase tracking-wider">Setări Notificări</h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-stone-700">
            <span>Memento blând pentru check-in zilnic</span>
            <input type="checkbox" defaultChecked className="rounded border-stone-300 text-[#4A7C59]" />
          </div>
          <div className="flex items-center justify-between text-xs text-stone-700">
            <span>Avertizări sonore pentru focus</span>
            <input type="checkbox" defaultChecked className="rounded border-stone-300 text-[#4A7C59]" />
          </div>
        </div>
      </section>

      {/* Data Export */}
      <section className="bg-white border border-[#EBE7DF] p-5 rounded-3xl shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Database size={16} className="text-stone-500" />
          <h2 className="text-xs font-extrabold text-[#2D312E] uppercase tracking-wider">Date Personale & Securitate</h2>
        </div>
        <div className="flex items-center justify-between text-xs text-stone-700">
          <div>
            <p className="font-bold">Exportă datele aplicației</p>
            <p className="text-[9px] text-stone-500">Descarcă toate sarcinile, sesiunile și jurnalele tale locale în format JSON.</p>
          </div>
          <button
            onClick={handleExport}
            className="bg-stone-50 border border-stone-200 hover:bg-stone-100 text-[10px] font-bold px-4 py-2 rounded-xl"
          >
            Exportă date
          </button>
        </div>
      </section>

    </div>
  );
}
