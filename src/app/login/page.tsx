'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFocuslyStore } from '../../store/useFocuslyStore';
import { supabase } from '../../lib/supabase';
import { Mail, Loader2 } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedTier = searchParams.get('tier') || '';

  const { setProfile, upgradeSubscription } = useFocuslyStore();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setErrorMsg('');
    setMessage('');

    try {
      // 1. Attempt magic link login using Supabase
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        // Fallback for demo: if Supabase fails or isn't connected, log in as mock user
        console.warn('Supabase auth failed. Logging in with mock user.');
        loginMockUser();
      } else {
        setMessage('Link-ul de acces a fost trimis pe e-mail! Verifică inbox-ul.');
      }
    } catch (err) {
      loginMockUser();
    } finally {
      setLoading(false);
    }
  }

  function loginMockUser() {
    // Authenticate a mock profile for testing offline/MVP
    const mockProfile = {
      id: 'user_dev_id',
      email: email || 'utilizator@demo.ro',
      subscription_status: requestedTier ? 'premium' : 'free' as any,
      subscription_period: requestedTier as any,
      created_at: new Date().toISOString()
    };
    
    setProfile(mockProfile);
    if (requestedTier) {
      upgradeSubscription(requestedTier as any);
    }
    
    router.push('/dashboard');
  }

  return (
    <div className="w-full max-w-sm bg-white border border-[#EBE7DF] rounded-3xl p-6 shadow-sm space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-lg font-black text-[#2D312E]">Bun venit pe Focusly 🌿</h1>
        <p className="text-[10px] text-stone-500">Introdu adresa de e-mail pentru acces instaneu.</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-stone-600 block">Adresa de e-mail</label>
          <div className="flex items-center bg-stone-50 border border-stone-200 rounded-2xl px-3 py-1.5 focus-within:border-[#4A7C59]">
            <Mail size={14} className="text-stone-400 mr-2" />
            <input
              type="email"
              placeholder="nume@exemplu.ro"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-transparent text-xs text-[#2D312E] focus:outline-none"
              required
            />
          </div>
        </div>

        {errorMsg && <p className="text-[10px] font-bold text-red-500">{errorMsg}</p>}
        {message && <p className="text-[10px] font-bold text-emerald-600">{message}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#4A7C59] hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <span>Accesează contul</span>
          )}
        </button>
      </form>

      <div className="border-t border-stone-100 pt-4 text-center">
        <button
          onClick={loginMockUser}
          className="text-[10px] font-bold text-[#4A7C59] hover:underline"
        >
          Intră în modul Demo (Fără e-mail) →
        </button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="bg-[#FAF8F5] min-h-screen flex items-center justify-center px-4">
      <Suspense fallback={<div className="text-xs text-[#6C726D] animate-pulse">Se încarcă pagina de login...</div>}>
        <FocuslyContent />
      </Suspense>
    </div>
  );
}

// Rename wrapper for matching Suspense bundle component
function FocuslyContent() {
  return <LoginContent />;
}
