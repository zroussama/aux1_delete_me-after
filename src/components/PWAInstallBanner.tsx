import React from 'react';
import { Download, X, Zap } from 'lucide-react';

interface PWAInstallBannerProps {
  onInstall: () => void;
  onDismiss: () => void;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({ onInstall, onDismiss }) => {
  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-40 bg-slate-900/95 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-4 shadow-2xl text-slate-100 flex items-center justify-between gap-3 animate-slide-up">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
          <Zap className="w-6 h-6 fill-amber-400" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-100">Installer Tunisie Power Grid</h4>
          <p className="text-[11px] text-slate-400">Accès hors-ligne PWA & notifications en direct</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onInstall}
          className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1 shadow-md shadow-amber-500/20"
        >
          <Download className="w-3.5 h-3.5" /> Installer
        </button>
        <button
          onClick={onDismiss}
          className="p-1.5 text-slate-500 hover:text-slate-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
