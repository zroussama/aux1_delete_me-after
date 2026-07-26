import React from 'react';
import { X, Info, Zap, Lock, Users } from 'lucide-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Info className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-100">فمّا ضو؟ — C'est quoi & Comment ça marche ?</h3>
              <p className="text-xs text-slate-400">Suivi citoyen du réseau électrique en Tunisie</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300 leading-relaxed">
          {/* C'est quoi Section */}
          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
            <h4 className="text-sm font-black text-amber-400 flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" /> C'est quoi ?
            </h4>
            <p>
              Un tableau de bord et une carte faits par les habitants, partout en Tunisie, pendant la canicule. Chacun signale en <strong>1 tap</strong> s'il a la lumière ou pas dans sa zone. Les compteurs reflètent les signalements des <strong>45 dernières minutes</strong>.
            </p>
          </div>

          {/* Comment ça marche Section */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-cyan-400 flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" /> Comment ça marche ?
            </h4>

            {/* Step 1: Voter */}
            <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-100">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-black">1</span>
                <span>Voter en 1 Tap dans votre zone</span>
              </div>
              <p>
                Sélectionnez votre zone de résidence. Puis choisissez votre statut actuel :
              </p>
              <div className="flex items-center gap-2 pt-1">
                <span className="px-3 py-1.5 bg-red-500/20 border border-red-500/30 text-red-300 rounded-xl font-bold">
                  🔌 Pas de lumière
                </span>
                <span className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-xl font-bold">
                  💡 J'ai la lumière
                </span>
              </div>
              <p className="text-[11px] text-slate-400 pt-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Après votre vote, votre zone se verrouille <strong>10 minutes</strong> pour éviter le spam.</span>
              </p>
            </div>

            {/* Step 2: Le Statut */}
            <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-100">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-black">2</span>
                <span>Calcul du Statut en Temps Réel</span>
              </div>
              <p>
                Les signalements récents comptent plus que les anciens (un vote perd la moitié de son poids toutes les 15 min), donc le tableau reflète l'instant présent.
              </p>

              <div className="space-y-1.5 pt-2">
                <div className="flex items-center gap-2 text-red-400 font-bold">
                  <span>⛔ Coupé</span>
                  <span className="text-slate-400 font-normal text-[11px]">— La majorité n'a plus d'électricité</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <span>✅ Ça marche</span>
                  <span className="text-slate-400 font-normal text-[11px]">— Le courant fonctionne normalement</span>
                </div>
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <span>⚠️ Coupé par secteurs</span>
                  <span className="text-slate-400 font-normal text-[11px]">— Quand les voisins sont partagés (coupure rue par rue)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 font-bold">
                  <span>⚪ Aucune info</span>
                  <span className="text-slate-400 font-normal text-[11px]">— Aucun vote enregistré sur les 45 dernières min</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors shadow-lg shadow-amber-500/20"
          >
            J'ai Compris !
          </button>
        </div>
      </div>
    </div>
  );
};
