import React, { useState } from 'react';
import { X, Bot, RefreshCw, AlertTriangle, ShieldCheck, Cpu, Lightbulb, Sparkles } from 'lucide-react';
import { AiGridAnalysis } from '../types';

interface AiGridAnalystModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiGridAnalystModal: React.FC<AiGridAnalystModalProps> = ({
  isOpen,
  onClose
}) => {
  const [analysis, setAnalysis] = useState<AiGridAnalysis | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFetchAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Erreur lors de l\'analyse par l\'IA');
      }
      const data: AiGridAnalysis = await res.json();
      setAnalysis(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Impossible de contacter l\'IA Diagnostic');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-100 flex items-center gap-1.5">
                <span>IA Diagnostic Réseau STEG</span>
                <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
              </h3>
              <p className="text-xs text-slate-400">Analyse Algorithmique Propulsée par Gemini AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {!analysis && !loading && (
            <div className="text-center py-8 space-y-4">
              <div className="inline-flex p-4 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Cpu className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-200">Lancer l'Analyse Prédictive en Temps Réel</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  L'Agent IA examine les données de charge du réseau haute tension STEG, les données météo et les signalements récents des 24 gouvernorats.
                </p>
              </div>
              <button
                onClick={handleFetchAnalysis}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20 transition-all inline-flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 fill-slate-950" />
                <span>Générer le Diagnostic IA</span>
              </button>
            </div>
          )}

          {loading && (
            <div className="text-center py-12 space-y-3">
              <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-300">Analyse du réseau électrique tunisien par l'IA...</p>
              <p className="text-[11px] text-slate-500">Connexion sécurisée aux modèles Gemini server-side</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-xs text-red-300 space-y-2">
              <div className="flex items-center gap-2 font-bold text-red-400">
                <AlertTriangle className="w-4 h-4" /> Échec du diagnostic IA
              </div>
              <p>{error}</p>
              <button
                onClick={handleFetchAnalysis}
                className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-xl font-bold text-[11px] transition-colors"
              >
                Réessayer
              </button>
            </div>
          )}

          {analysis && !loading && (
            <div className="space-y-5 animate-fade-in">
              {/* Severity Banner */}
              <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                analysis.severity === 'CRITICAL' || analysis.severity === 'HIGH'
                  ? 'bg-red-500/15 text-red-300 border-red-500/30'
                  : analysis.severity === 'MEDIUM'
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
              }`}>
                <div className="flex items-center gap-2 font-bold text-xs">
                  <ShieldCheck className="w-5 h-5" />
                  <span>Niveau de Risque Réseau: {analysis.severity}</span>
                </div>
                <span className="text-[10px] opacity-75 font-mono">
                  {new Date(analysis.timestamp).toLocaleTimeString('fr-TN')}
                </span>
              </div>

              {/* Executive Summary */}
              <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-2">
                <h4 className="text-xs font-bold text-amber-400">Synthèse Exécutive</h4>
                <p className="text-xs text-slate-200 leading-relaxed">{analysis.summary}</p>
              </div>

              {/* Causes & Recommendations Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-2">
                  <h5 className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5" /> Causes Probables Identifiées
                  </h5>
                  <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
                    {analysis.possibleCauses?.map((cause, i) => (
                      <li key={i}>{cause}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-2">
                  <h5 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5" /> Recommandations Citoyennes
                  </h5>
                  <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
                    {analysis.recommendations?.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          {analysis && (
            <button
              onClick={handleFetchAnalysis}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Actualiser
            </button>
          )}
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors ml-auto"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
