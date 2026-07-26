import React, { useState, useEffect } from 'react';
import { Zap, X, MapPin, AlertTriangle, CheckCircle2, ShieldCheck, Clock, Send, Radio } from 'lucide-react';
import { PowerStatus, Delegation } from '../types';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitReport: (data: {
    status: PowerStatus;
    latitude: number;
    longitude: number;
    comment: string;
  }) => Promise<void>;
  userLocation: [number, number] | null;
  delegations: Delegation[];
  isOnline: boolean;
  isSubmitting: boolean;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  onSubmitReport,
  userLocation,
  delegations,
  isOnline,
  isSubmitting
}) => {
  const [status, setStatus] = useState<PowerStatus>('OFF');
  const [lat, setLat] = useState<number>(36.8065);
  const [lng, setLng] = useState<number>(10.1815);
  const [comment, setComment] = useState<string>('');
  const [detectedDelegation, setDetectedDelegation] = useState<string>('Tunis Centre');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (userLocation) {
      setLat(userLocation[0]);
      setLng(userLocation[1]);
    }
  }, [userLocation]);

  useEffect(() => {
    // Detect closest delegation name
    if (delegations.length > 0) {
      let closestName = delegations[0].name;
      let minDistance = Infinity;

      delegations.forEach(del => {
        const dist = Math.hypot(del.centroid[0] - lat, del.centroid[1] - lng);
        if (dist < minDistance) {
          minDistance = dist;
          closestName = `${del.name} (${del.governorate})`;
        }
      });
      setDetectedDelegation(closestName);
    }
  }, [lat, lng, delegations]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    try {
      await onSubmitReport({
        status,
        latitude: lat,
        longitude: lng,
        comment
      });
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Erreur lors de l\'envoi du signalement');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400">
              <Zap className="w-6 h-6 fill-red-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Signalement de Réseau Électrique</h3>
              <p className="text-xs text-slate-400">Crowdsourcing Citoyen Temps Réel - Tunisie</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl text-xs text-red-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Power Status Toggle (ON / OFF) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Statut de l'Électricité dans votre zone
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setStatus('OFF')}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${
                  status === 'OFF'
                    ? 'bg-red-500/15 border-red-500 text-red-300 shadow-lg shadow-red-500/20 scale-[1.02]'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="p-2 rounded-full bg-red-500/20 text-red-400">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <span className="text-sm font-black">PANNE (OFF)</span>
                <span className="text-[11px] text-red-400/80">Pas de courant</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('ON')}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${
                  status === 'ON'
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-500/20 scale-[1.02]'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="p-2 rounded-full bg-emerald-500/20 text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <span className="text-sm font-black">RÉTABLI (ON)</span>
                <span className="text-[11px] text-emerald-400/80">Le courant est là</span>
              </button>
            </div>
          </div>

          {/* Location Detection */}
          <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" /> Zone Détectée:
              </span>
              <span className="font-bold text-amber-300">{detectedDelegation}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span>Coordonnées GPS:</span>
              <span>{lat.toFixed(4)}, {lng.toFixed(4)}</span>
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Détails complémentaires (Optionnel)
            </label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Ex: Coupure soudaine, baisses de tension fréquentes, bruit de transformateur..."
              maxLength={280}
              rows={3}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors resize-none"
            />
          </div>

          {/* Spatial Consensus Rule Box */}
          <div className="p-3.5 bg-cyan-950/20 border border-cyan-500/20 rounded-2xl text-[11px] text-cyan-200/90 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-cyan-400">
              <ShieldCheck className="w-4 h-4 text-cyan-400" /> Algorithme de Consensus PostGIS
            </div>
            <p>
              Pour éviter les faux signalements, une zone passe en <strong>"Panne Confirmée"</strong> dès que{' '}
              <strong className="text-amber-300">3 signalements distincts</strong> sont enregistrés dans un rayon de 1 km en 15 minutes.
            </p>
          </div>

          {!isOnline && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 flex items-center gap-2">
              <Radio className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
              <span>
                Vous êtes hors-ligne. Votre signalement sera sauvegardé localement (IndexedDB) et envoyé automatiquement dès le retour de la connexion.
              </span>
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors flex flex-col items-center justify-center leading-tight"
            >
              <span>Annuler</span>
              <span className="text-[9px] font-normal text-slate-400">إلغاء</span>
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 py-3 rounded-2xl font-black text-xs shadow-xl transition-all flex items-center justify-center gap-2 ${
                status === 'OFF'
                  ? 'bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-red-600/20'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 shadow-emerald-600/20'
              }`}
            >
              {isSubmitting ? (
                <span>Validation...</span>
              ) : (
                <>
                  <Send className="w-4 h-4 shrink-0" />
                  <div className="flex flex-col items-center leading-tight text-center">
                    <span>Envoyer Signalement</span>
                    <span className="text-[9px] font-medium opacity-90">إرسال البلاغ</span>
                  </div>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
