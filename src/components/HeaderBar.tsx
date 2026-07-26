import React, { useState, useEffect } from 'react';
import {
  Zap,
  Wifi,
  WifiOff,
  Bot,
  Sliders,
  Volume2,
  Download,
  AlertTriangle,
  Share2,
  HelpCircle,
  ShieldAlert,
  Menu,
  X
} from 'lucide-react';
import { AudioLanguage, NationalGridStats } from '../types';

interface HeaderBarProps {
  stats: NationalGridStats | null;
  isOnline: boolean;
  offlineQueueCount: number;
  activeLanguage: AudioLanguage;
  onLanguageChange: (lang: AudioLanguage) => void;
  onOpenAiAnalyst: () => void;
  onOpenConsensus?: () => void;
  onOpenReportModal: () => void;
  onOpenAudioTest: () => void;
  onOpenHowItWorks?: () => void;
  onOpenShareModal?: () => void;
  onOpenAdminSTEG?: () => void;
  onInstallPwa?: () => void;
  canInstallPwa?: boolean;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  stats,
  isOnline,
  offlineQueueCount,
  activeLanguage,
  onLanguageChange,
  onOpenAiAnalyst,
  onOpenConsensus,
  onOpenReportModal,
  onOpenAudioTest,
  onOpenHowItWorks,
  onOpenShareModal,
  onOpenAdminSTEG,
  onInstallPwa,
  canInstallPwa
}) => {
  const [localTime, setLocalTime] = useState<string>('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLocalTime(now.toLocaleTimeString('fr-TN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-xl shrink-0">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 flex items-center justify-between gap-2">
        {/* Logo & Brand */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 shrink-0">
            <img src="/logo.svg" alt="DhawTN Logo" className="w-9 h-9 sm:w-10 sm:h-10 object-contain drop-shadow-md" />
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-900" title="En direct" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm sm:text-lg font-extrabold tracking-tight text-slate-100 flex items-center gap-1.5">
                <span>DhawTN</span>
                <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold hidden sm:inline-block">
                  STEG Tracker
                </span>
              </h1>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-400 flex items-center gap-1">
              <span className="hidden sm:inline">Suivi Réseau Tunisie</span>
              <span className="sm:hidden font-mono text-slate-300 text-[10px]">{localTime}</span>
              <span className="hidden sm:inline text-slate-600">•</span>
              <span className="hidden sm:inline font-mono text-slate-300 text-[11px]">{localTime}</span>
            </p>
          </div>
        </div>

        {/* Live Ticker & Stats Summary (Desktop/Tablet) */}
        <div className="hidden lg:flex items-center gap-4 text-xs bg-slate-950/60 px-3.5 py-1.5 rounded-xl border border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-slate-400">Score Réseau:</span>
            <span className="font-bold text-emerald-400">{stats ? `${stats.nationalHealthScore}%` : '98%'}</span>
          </div>
          <div className="h-3 w-px bg-slate-800" />
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            <span className="text-slate-400">Pannes:</span>
            <span className="font-bold text-red-400">{stats ? stats.activeOutagesCount : 0}</span>
          </div>
          <div className="h-3 w-px bg-slate-800" />
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Rétablis (24h):</span>
            <span className="font-bold text-emerald-400">{stats ? stats.resolvedLast24h : 0}</span>
          </div>
        </div>

        {/* Action Controls & Utilities */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Desktop Auxiliary Buttons */}
          <div className="hidden md:flex items-center gap-1.5">
            {/* Test Audio Alert Button */}
            <button
              onClick={onOpenAudioTest}
              title="Tester le signal sonore et vocal"
              className="p-2 sm:px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700/80 transition-colors flex items-center gap-1.5"
            >
              <Volume2 className="w-4 h-4" />
              <span className="text-xs font-bold">Audio</span>
            </button>

            {/* How It Works Modal Info Button */}
            {onOpenHowItWorks && (
              <button
                onClick={onOpenHowItWorks}
                className="p-2 sm:px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700/80 transition-colors flex items-center gap-1.5"
                title="DhawTN — Aide & Fonctionnement"
              >
                <HelpCircle className="w-4 h-4" />
                <span className="text-xs font-bold">Aide</span>
              </button>
            )}

            {/* Admin STEG Modal Button */}
            {onOpenAdminSTEG && (
              <button
                onClick={onOpenAdminSTEG}
                className="p-2 sm:px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-red-400 border border-slate-700/80 transition-colors flex items-center gap-1.5"
                title="Panneau Admin STEG"
              >
                <ShieldAlert className="w-4 h-4" />
                <span className="text-xs font-bold">Admin STEG</span>
              </button>
            )}

            {/* Share CTA Button */}
            <button
              onClick={() => {
                if (onOpenShareModal) {
                  onOpenShareModal();
                } else if (navigator.share) {
                  navigator.share({
                    title: 'DhawTN - Suivi Réseau Tunisie',
                    text: '⚡ Suivi en temps réel des pannes d\'électricité et rétablissements en Tunisie pendant la canicule. Signale la lumière dans ta zone!',
                    url: window.location.href,
                  }).catch(() => {});
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Lien copié dans le presse-papier!');
                }
              }}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
              title="Partager"
            >
              <Share2 className="w-4 h-4 shrink-0" />
              <span className="text-xs font-bold">Partager</span>
            </button>
          </div>

          {/* Primary Action Button: Signalement Panne (Always visible) */}
          <button
            onClick={onOpenReportModal}
            className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs shadow-lg shadow-red-600/25 transition-all flex items-center gap-1.5 border border-red-400/30"
          >
            <Zap className="w-4 h-4 fill-white shrink-0" />
            <div className="flex flex-col items-center text-center leading-tight">
              <span className="text-xs font-extrabold">Signaler Panne</span>
            </div>
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-200 border border-slate-700/80 md:hidden flex items-center justify-center"
            aria-label="Menu Mobile"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 text-amber-400" /> : <Menu className="w-5 h-5 text-slate-300" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Slide-Down */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-950 border-t border-slate-800 p-3 space-y-2 animate-fade-in">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => {
                onOpenAudioTest();
                setIsMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 font-bold flex items-center gap-2"
            >
              <Volume2 className="w-4 h-4" />
              <span>Tester Audio</span>
            </button>

            {onOpenHowItWorks && (
              <button
                onClick={() => {
                  onOpenHowItWorks();
                  setIsMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 font-bold flex items-center gap-2"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Aide DhawTN</span>
              </button>
            )}

            <button
              onClick={() => {
                if (onOpenShareModal) onOpenShareModal();
                setIsMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 font-bold flex items-center gap-2 col-span-2 sm:col-span-1"
            >
              <Share2 className="w-4 h-4" />
              <span>Partager l'App</span>
            </button>

            {onOpenAdminSTEG && (
              <button
                onClick={() => {
                  onOpenAdminSTEG();
                  setIsMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-red-400 font-bold flex items-center gap-2 col-span-2 sm:col-span-1"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Admin STEG</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

