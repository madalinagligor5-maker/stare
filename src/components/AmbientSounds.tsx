'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';

export function AmbientSounds() {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  function getAudioContext() {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtxRef.current;
  }

  function createBrownNoiseBuffer(ctx: AudioContext) {
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5;
    }
    return noiseBuffer;
  }

  function createRainBuffer(ctx: AudioContext) {
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    return noiseBuffer;
  }

  async function playSound(type: 'brown' | 'rain') {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    stopSound();

    const gainNode = ctx.createGain();
    gainNode.gain.value = 0.15;
    gainNode.connect(ctx.destination);
    gainNodeRef.current = gainNode;

    const source = ctx.createBufferSource();
    source.loop = true;

    if (type === 'brown') {
      source.buffer = createBrownNoiseBuffer(ctx);
      source.connect(gainNode);
    } else {
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 750;
      filter.Q.value = 0.8;

      source.buffer = createRainBuffer(ctx);
      source.connect(filter);
      filter.connect(gainNode);
    }

    source.start(0);
    noiseSourceRef.current = source;
    setPlayingId(type);
  }

  function stopSound() {
    if (noiseSourceRef.current) {
      try {
        noiseSourceRef.current.stop();
        noiseSourceRef.current.disconnect();
      } catch (e) {}
      noiseSourceRef.current = null;
    }
    if (gainNodeRef.current) {
      gainNodeRef.current.disconnect();
      gainNodeRef.current = null;
    }
    setPlayingId(null);
  }

  function handleToggle(id: 'brown' | 'rain') {
    if (playingId === id) {
      stopSound();
    } else {
      playSound(id);
    }
  }

  useEffect(() => {
    return () => {
      stopSound();
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  return (
    <div className="bg-stone-50 border border-stone-200/60 dark:bg-stone-900 dark:border-stone-850 p-5 rounded-3xl">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={16} className="text-[#4A7C59]" />
        <h3 className="text-xs font-bold text-[#2D312E] dark:text-stone-200">Generator Audio Sintetic (Offline-First)</h3>
      </div>
      <div className="flex flex-wrap gap-2.5">
        <button
          onClick={() => handleToggle('brown')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-xs font-semibold transition-all ${
            playingId === 'brown'
              ? 'bg-emerald-50 text-[#4A7C59] border-emerald-500/20 dark:bg-emerald-950/20'
              : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50 dark:bg-stone-850 dark:border-stone-700 dark:text-stone-300'
          }`}
        >
          <span>🎧 Brown Noise</span>
          {playingId === 'brown' ? <Volume2 size={13} /> : <VolumeX size={13} />}
        </button>

        <button
          onClick={() => handleToggle('rain')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-xs font-semibold transition-all ${
            playingId === 'rain'
              ? 'bg-emerald-50 text-[#4A7C59] border-emerald-500/20 dark:bg-emerald-950/20'
              : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50 dark:bg-stone-850 dark:border-stone-700 dark:text-stone-300'
          }`}
        >
          <span>🌧️ Ploaie Sintetică</span>
          {playingId === 'rain' ? <Volume2 size={13} /> : <VolumeX size={13} />}
        </button>
      </div>
    </div>
  );
}
