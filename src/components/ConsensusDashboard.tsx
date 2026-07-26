import React from 'react';
import { X, Sliders, ShieldCheck, Zap, Radio, CheckCircle, AlertTriangle, Layers, MapPin, Activity } from 'lucide-react';
import { Delegation } from '../types';

interface ConsensusDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  delegations: Delegation[];
  onSimulateOutage: (delId: number, action: 'TRIGGER_CONSENSUS_OUTAGE' | 'RESOLVE_OUTAGE') => void;
}

export const ConsensusDashboard: React.FC<ConsensusDashboardProps> = ({
  isOpen,
  onClose,
  delegations,
  onSimulateOutage
}) => {
  if (!isOpen) return null;

  const activeOutages = delegations.filter(d => d.status === 'CONFIRMED');
  const unconfirmedOutages = delegations.filter(d => d.status === 'UNCONFIRMED');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-100">Moteur de Consensus & Anti-Spam PostGIS</h3>
              <p className="text-xs text-slate-400">Algorithme d'Escalation Spatiale & Crowdsourcing Citoyen</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Rule Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                <MapPin className="w-4 h-4" /> 1. Contraction Spatiale
              </div>
              <p className="text-xs font-bold text-slate-200">PostGIS ST_Contains</p>
              <p className="text-[11px] text-slate-400">
                Chaque point GPS est automatiquement assigné au polygone de la délégation administrative (GADM L3).
              </p>
            </div>

            <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-red-400">
                <Zap className="w-4 h-4" /> 2. Règle d'Escalade
              </div>
              <p className="text-xs font-bold text-slate-200">≥ 3 Signalements / 1km</p>
              <p className="text-[11px] text-slate-400">
                Si 3 appareils distincts confirment la coupure en 15 minutes, la zone passe en statut "Panne Confirmée".
              </p>
            </div>

            <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <ShieldCheck className="w-4 h-4" /> 3. Anti-Spam Redis
              </div>
              <p className="text-xs font-bold text-slate-200">1 Signalement / 15 min</p>
              <p className="text-[11px] text-slate-400">
                Chaque IP/Appareil est soumis à un limiteur de fréquence strict pour neutraliser les faux signalements.
              </p>
            </div>
          </div>

          {/* Active Outages Status Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-cyan-400" /> Zones sous Surveillance du Consensus
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {activeOutages.length} Confirmées | {unconfirmedOutages.length} Suspectées
              </span>
            </h4>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {delegations
                .filter(d => d.status === 'CONFIRMED' || d.status === 'UNCONFIRMED')
                .map(del => (
                  <div
                    key={del.id}
                    className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-between text-xs gap-3"
                  >
                    <div>
                      <p className="font-bold text-slate-200">{del.name} ({del.governorate})</p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {del.activeOffCount || 0} signalements actifs / 3 requis
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        del.status === 'CONFIRMED'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {del.status === 'CONFIRMED' ? '🔴 CONFIRMÉE' : '🟠 SUSPECTÉE'}
                      </span>

                      <button
                        onClick={() => onSimulateOutage(del.id, 'RESOLVE_OUTAGE')}
                        className="px-2.5 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-bold text-[10px] transition-colors"
                      >
                        Rétablir (الضو رجع)
                      </button>
                    </div>
                  </div>
                ))}

              {activeOutages.length === 0 && unconfirmedOutages.length === 0 && (
                <div className="p-6 text-center text-xs text-slate-500 bg-slate-950/40 rounded-2xl border border-slate-800">
                  🟢 Aucune panne active actuellement détectée sur le réseau.
                </div>
              )}
            </div>
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
