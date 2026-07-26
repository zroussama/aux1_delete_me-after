import React, { useState } from 'react';
import { X, Volume2, Play, Sparkles, Check } from 'lucide-react';
import { AudioLanguage } from '../types';
import { audioAlertService } from '../services/audioAlertService';

interface AudioTestControlProps {
  isOpen: boolean;
  onClose: () => void;
  activeLanguage: AudioLanguage;
  onLanguageChange: (lang: AudioLanguage) => void;
}

export const AudioTestControl: React.FC<AudioTestControlProps> = ({
  isOpen,
  onClose,
  activeLanguage,
  onLanguageChange
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleTestAudio = (lang: AudioLanguage) => {
    setIsPlaying(true);
    audioAlertService.speakRestorationAlert(lang, 'Sousse Ville');
    setTimeout(() => setIsPlaying(false), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Volume2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Alerte Sonore & Vocale (الضو رجع)</h3>
              <p className="text-xs text-slate-400">Rétablissement du courant électrique</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Audio Wave Visualizer */}
          <div className="p-6 bg-slate-950/80 rounded-2xl border border-slate-800 flex flex-col items-center justify-center space-y-3">
            <div className="flex items-center gap-1.5 h-10">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 rounded-full bg-amber-400 transition-all duration-300 ${
                    isPlaying ? 'animate-bounce' : 'h-3 opacity-40'
                  }`}
                  style={{
                    animationDelay: `${i * 0.08}s`,
                    height: isPlaying ? `${Math.floor(Math.random() * 24) + 12}px` : '12px'
                  }}
                />
              ))}
            </div>
            <p className="text-xs font-bold text-amber-300 text-center">
              {isPlaying ? '🔊 Lecture de l\'annonce vocale...' : 'Cliquez sur une langue pour tester le carillon et la voix'}
            </p>
          </div>

          {/* Language Test Cards */}
          <div className="space-y-2.5">
            <button
              onClick={() => {
                onLanguageChange('AR_TN');
                handleTestAudio('AR_TN');
              }}
              className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                activeLanguage === 'AR_TN'
                  ? 'bg-amber-500/15 border-amber-500 text-amber-200'
                  : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div>
                <p className="text-xs font-black text-amber-400">🇹🇳 Darija Tunisienne (الدارجة التونسية)</p>
                <p className="text-sm font-bold text-slate-100 mt-1">"الضو رجع! الحمد لله، رجع الضو"</p>
              </div>
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
                <Play className="w-4 h-4 fill-amber-300" />
              </div>
            </button>

            <button
              onClick={() => {
                onLanguageChange('FR');
                handleTestAudio('FR');
              }}
              className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                activeLanguage === 'FR'
                  ? 'bg-amber-500/15 border-amber-500 text-amber-200'
                  : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div>
                <p className="text-xs font-black text-sky-400">🇫🇷 Français</p>
                <p className="text-xs font-semibold text-slate-200 mt-1">"Le courant électrique est rétabli dans votre zone !"</p>
              </div>
              <div className="p-2 rounded-xl bg-sky-500/20 text-sky-300">
                <Play className="w-4 h-4 fill-sky-300" />
              </div>
            </button>

            <button
              onClick={() => {
                onLanguageChange('EN');
                handleTestAudio('EN');
              }}
              className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                activeLanguage === 'EN'
                  ? 'bg-amber-500/15 border-amber-500 text-amber-200'
                  : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div>
                <p className="text-xs font-black text-emerald-400">🇬🇧 English</p>
                <p className="text-xs font-semibold text-slate-200 mt-1">"Power has been restored to your area!"</p>
              </div>
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
                <Play className="w-4 h-4 fill-emerald-300" />
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
