import React from 'react';
import {
  X,
  Zap,
  MapPin,
  Bell,
  BellOff,
  Volume2,
  Clock,
  ShieldAlert,
  Activity,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw
} from 'lucide-react';
import { Delegation, OutageReport, AudioLanguage } from '../types';

interface DelegationDetailDrawerProps {
  delegation: Delegation | null;
  onClose: () => void;
  reports: OutageReport[];
  isSubscribed: boolean;
  onToggleSubscription: (del: Delegation) => void;
  onSpeakAlert: (delName: string) => void;
  onReportForDelegation: (del: Delegation) => void;
  onSimulateOutage: (delId: number, action: 'TRIGGER_CONSENSUS_OUTAGE' | 'RESOLVE_OUTAGE') => void;
  activeLanguage: AudioLanguage;
}

export const DelegationDetailDrawer: React.FC<DelegationDetailDrawerProps> = ({
  delegation,
  onClose,
  reports,
  isSubscribed,
  onToggleSubscription,
  onSpeakAlert,
  onReportForDelegation,
  onSimulateOutage,
  activeLanguage
}) => {
  if (!delegation) return null;

  const delegationReports = reports.filter(r => r.delegationId === delegation.id);

  let statusBadgeColor = 'bg-sky-500/10 text-sky-400 border-sky-500/30';
  let statusText = 'Réseau Électrique Normal';

  if (delegation.status === 'CONFIRMED') {
    statusBadgeColor = 'bg-red-500/15 text-red-400 border-red-500/40 animate-pulse';
    statusText = 'PANNE CONFIRMÉE (Consensus STEG)';
  } else if (delegation.status === 'UNCONFIRMED') {
    statusBadgeColor = 'bg-amber-500/15 text-amber-400 border-amber-500/40';
    statusText = 'PANNE EN COURS DE VALIDATION';
  } else if (delegation.status === 'RESOLVED') {
    statusBadgeColor = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40';
    statusText = 'COURANT RÉTABLI (الضو رجع)';
  }

  const activeOffCount = delegation.activeOffCount || 0;
  const consensusProgress = Math.min(100, Math.round((activeOffCount / 3) * 100));

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full max-w-md bg-slate-900/95 backdrop-blur-xl border-l border-slate-800 shadow-2xl flex flex-col text-slate-100 animate-slide-in">
      {/* Drawer Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-100">{delegation.name}</h3>
            <p className="text-xs text-slate-400">Gouvernorat de {delegation.governorate}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Status Badge */}
        <div className={`p-4 rounded-2xl border flex items-center justify-between ${statusBadgeColor}`}>
          <div className="flex items-center gap-2.5">
            <Zap className="w-5 h-5 shrink-0" />
            <div>
              <p className="text-xs font-bold">{statusText}</p>
              <p className="text-[11px] opacity-80">
                {delegation.stegSubstation || 'Sous-station STEG locale'}
              </p>
            </div>
          </div>
        </div>

        {/* Spatial Consensus Rule Meter */}
        <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-cyan-400" /> Seuil de Consensus Spatial
            </span>
            <span className="font-mono font-bold text-amber-400">{activeOffCount} / 3 Signalements</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                consensusProgress >= 100
                  ? 'bg-red-500 shadow-lg shadow-red-500/50'
                  : consensusProgress > 0
                  ? 'bg-amber-500'
                  : 'bg-slate-700'
              }`}
              style={{ width: `${consensusProgress}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-400">
            {activeOffCount >= 3
              ? '✅ Consensus atteint: 3+ signalements citoyens enregistrés dans un rayon de 1 km.'
              : `Encore ${3 - activeOffCount} signalement(s) nécessaire(s) pour confirmer automatiquement la panne.`}
          </p>
        </div>

        {/* Subscription / Audio Alert Controls */}
        <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-amber-400" /> Abonnement aux Alertes
            </h4>
            <button
              onClick={() => onToggleSubscription(delegation)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                isSubscribed
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {isSubscribed ? (
                <>
                  <Bell className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                  <span>Abonné</span>
                </>
              ) : (
                <>
                  <BellOff className="w-3.5 h-3.5 text-slate-400" />
                  <span>Suivre cette Zone</span>
                </>
              )}
            </button>
          </div>

          {/* Test Vocal Restored Audio Button */}
          <button
            onClick={() => onSpeakAlert(delegation.name)}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-emerald-500/20 hover:from-amber-500/30 hover:to-emerald-500/30 border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition-all"
          >
            <Volume2 className="w-4 h-4 text-amber-400" />
            <span>Ecouter l'Alerte Vocale "الضو رجع" ({activeLanguage === 'AR_TN' ? 'Darija' : activeLanguage})</span>
          </button>
        </div>

        {/* Real-time Crowdsource Demo Simulation Actions */}
        <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800/80 space-y-2">
          <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-cyan-400" /> Démonstrateur de Consensus en Direct
          </h4>
          <p className="text-[11px] text-slate-400">
            Simulez la détection de panne ou le rétablissement de l'électricité dans cette zone:
          </p>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => onSimulateOutage(delegation.id, 'TRIGGER_CONSENSUS_OUTAGE')}
              className="py-2 px-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Play className="w-3.5 h-3.5 text-red-400" />
              <span>Simuler Panne (3x)</span>
            </button>

            <button
              onClick={() => onSimulateOutage(delegation.id, 'RESOLVE_OUTAGE')}
              className="py-2 px-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
              <span>Rétablir (الضو رجع)</span>
            </button>
          </div>
        </div>

        {/* Timeline of Recent Reports */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-400" /> Historique des Signalements ({delegationReports.length})
          </h4>

          {delegationReports.length === 0 ? (
            <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 text-center text-xs text-slate-500">
              Aucun signalement récent dans cette délégation.
            </div>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {delegationReports.map(rep => (
                <div
                  key={rep.id}
                  className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-bold flex items-center gap-1 ${rep.status === 'OFF' ? 'text-red-400' : 'text-emerald-400'}`}>
                      {rep.status === 'OFF' ? '🔴 Panne de courant' : '🟢 Électricité active'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(rep.timestamp).toLocaleTimeString('fr-TN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {rep.comment && <p className="text-slate-300 text-[11px] italic">"{rep.comment}"</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Drawer Footer Action */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/80">
        <button
          onClick={() => onReportForDelegation(delegation)}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all"
        >
          <Zap className="w-4 h-4 fill-slate-950" />
          <span>Signaler dans la délégation {delegation.name}</span>
        </button>
      </div>
    </div>
  );
};
