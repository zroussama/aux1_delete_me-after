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
  ShieldAlert
} from 'lucide-react';
import { AudioLanguage, NationalGridStats } from '../types';

interface HeaderBarProps {
  stats: NationalGridStats | null;
  isOnline: boolean;
  offlineQueueCount: number;
  activeLanguage: AudioLanguage;
  onLanguageChange: (lang: AudioLanguage) => void;
  onOpenAiAnalyst: () => void;
  onOpenConsensus: () => void;
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
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-red-600 shadow-lg shadow-amber-500/20 text-slate-950 font-black">
            <Zap className="w-6 h-6 text-slate-950 fill-amber-300 animate-pulse" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-slate-100 flex items-center gap-1.5">
                <span>Tunisia Power Grid</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold hidden sm:inline-block">
                  STEG Tracker
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <span>Suivi Réseau & Pannes Tunisie</span>
              <span className="text-slate-600">•</span>
              <span className="font-mono text-slate-300 text-[11px]">{localTime}</span>
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
          {/* Audio Alert Language Selector */}
          <div className="relative flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={() => onLanguageChange('AR_TN')}
              title="Alerte Vocale en Darija Tunisienne (الضو رجع)"
              className={`px-2 py-1 text-xs font-bold rounded-md transition-all ${
                activeLanguage === 'AR_TN'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🇹🇳 الضو
            </button>
            <button
              onClick={() => onLanguageChange('FR')}
              title="Alerte Vocale en Français"
              className={`px-2 py-1 text-xs font-bold rounded-md transition-all ${
                activeLanguage === 'FR'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🇫🇷 FR
            </button>
            <button
              onClick={() => onLanguageChange('EN')}
              title="Alerte Vocale en Anglais"
              className={`px-2 py-1 text-xs font-bold rounded-md transition-all ${
                activeLanguage === 'EN'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🇬🇧 EN
            </button>
          </div>

          {/* Test Audio Alert Button */}
          <button
            onClick={onOpenAudioTest}
            title="Tester le signal sonore et vocal de rétablissement (الضو رجع)"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700/80 transition-colors"
          >
            <Volume2 className="w-4 h-4" />
          </button>

          {/* Consensus Engine Info */}
          <button
            onClick={onOpenConsensus}
            title="Moteur de Consensus & Anti-Spam"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition-colors hidden sm:flex items-center gap-1.5 text-xs font-medium"
          >
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span className="hidden md:inline">Consensus</span>
          </button>

          {/* Gemini AI Grid Analyst */}
          <button
            onClick={onOpenAiAnalyst}
            className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600/20 to-blue-600/20 hover:from-cyan-600/30 hover:to-blue-600/30 text-cyan-300 border border-cyan-500/30 transition-all flex items-center gap-1.5 text-xs font-semibold"
          >
            <Bot className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">IA Diagnostic</span>
          </button>

          {/* Offline / Online Status Indicator */}
          <div className="flex items-center">
            {isOnline ? (
              <div
                className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20"
                title="Connecté au serveur en temps réel"
              >
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">En Ligne</span>
              </div>
            ) : (
              <div
                className="flex items-center gap-1 text-[11px] font-medium text-amber-400 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20"
                title="Mode Hors-Ligne PWA - Les signalements seront synchronisés automatiquement"
              >
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Hors-Ligne ({offlineQueueCount})</span>
              </div>
            )}
          </div>

          {/* PWA Install Button */}
          {canInstallPwa && onInstallPwa && (
            <button
              onClick={onInstallPwa}
              className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1 shadow-lg shadow-emerald-500/20"
              title="Installer la PWA Tunisie Power Grid"
            >
              <Download className="w-4 h-4" />
            </button>
          )}

          {/* How It Works Modal Info Button */}
          {onOpenHowItWorks && (
            <button
              onClick={onOpenHowItWorks}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700/80 transition-colors"
              title="C'est quoi & Comment ça marche ?"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          )}

          {/* Admin STEG Modal Button */}
          {onOpenAdminSTEG && (
            <button
              onClick={onOpenAdminSTEG}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-red-400 border border-slate-700/80 transition-colors"
              title="Panneau Admin STEG (Avis Officiels)"
            >
              <ShieldAlert className="w-4 h-4" />
            </button>
          )}

          {/* Share CTA Button */}
          <button
            onClick={() => {
              if (onOpenShareModal) {
                onOpenShareModal();
              } else if (navigator.share) {
                navigator.share({
                  title: 'Tunisie Power Grid - Famma Dhaw',
                  text: '⚡ Suivi en temps réel des pannes d\'électricité et rétablissements en Tunisie pendant la canicule. Signale la lumière dans ta zone!',
                  url: window.location.href,
                }).catch(() => {});
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert('Lien copié dans le presse-papier! Partagez avec vos voisins.');
              }
            }}
            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition-all flex items-center gap-1 shadow-md shadow-emerald-500/20"
            title="Partager le tableau de bord communautaire"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Partager</span>
          </button>

          {/* Primary Action Button: Signalement Panne */}
          <button
            onClick={onOpenReportModal}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs shadow-lg shadow-red-600/25 transition-all flex items-center gap-1.5 border border-red-400/30"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>Signaler Panne</span>
          </button>
        </div>
      </div>

      {/* STEG Community Disclaimer Bar */}
      <div className="bg-slate-950 border-t border-slate-800/80 px-3 py-1 text-center text-[11px] text-amber-400/90 font-medium flex items-center justify-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        <span>Données communautaires non officielles · Croisez avec les communiqués officiels STEG</span>
      </div>
    </header>
  );
};
