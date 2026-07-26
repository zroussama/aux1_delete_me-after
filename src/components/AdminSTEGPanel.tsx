import React, { useState } from 'react';
import { Upload, AlertCircle, CheckCircle, X, ShieldAlert, Trash2, Zap, FileText } from 'lucide-react';
import { STEGFeedService } from '../services/stegFeedService';
import { STEGAnnouncement } from '../services/stegParser';
import { Delegation } from '../types';

interface AdminSTEGPanelProps {
  delegations: Delegation[];
  announcements: STEGAnnouncement[];
  onAnnouncementAdded: (announcement: STEGAnnouncement) => void;
  onClearAnnouncements?: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const AdminSTEGPanel: React.FC<AdminSTEGPanelProps> = ({
  delegations,
  announcements,
  onAnnouncementAdded,
  onClearAnnouncements,
  isOpen,
  onClose
}) => {
  const [postText, setPostText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const feedService = new STEGFeedService(delegations);

  const handleSubmit = async () => {
    if (!postText.trim()) {
      setResult({ success: false, message: 'Veuillez coller le texte du post STEG' });
      return;
    }

    setIsProcessing(true);
    setResult(null);

    try {
      const announcement = feedService.manualEntry(postText);
      
      if (announcement) {
        onAnnouncementAdded(announcement);
        setResult({
          success: true,
          message: `✅ Annonce STEG ajoutée avec succès! ${announcement.affectedAreas.length} zones identifiées.`
        });
        setPostText('');
      } else {
        setResult({
          success: false,
          message: '⚠️ Impossible d\'extraire les données STEG. Assurez-vous que le texte contient un avis d\'interruption STEG.'
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: '❌ Erreur: ' + (error instanceof Error ? error.message : 'Une erreur est survenue')
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUseSample = () => {
    setPostText(`في إطار الحفاظ على سلامة و ديمومة المنظومة الكهربائية، تعلم الشركة التونسية للكهرباء و الغاز أنّه قد يتمّ اللجوء إلى القطع الدوري للكهرباء اليوم26 جويلية 2026، خلال الفترة المتراوحة بين الساعة الحادية عشر صباحا و الساعة الخامسة مساء اليوم27 جويلية، وعلى فترات متقطّعة ، حسب ما تمليه علينا وضعية الشبكة، على مستوى المناطق التالية :

جهة الوطن القبلي
جهة زغوان
جهة بنزرت

قليبية
حمام لغزاز
الميدة
بني خلاد
الهوارية
منزل تميم
دار علوش
الحمامات
منزل بوزلفة
بوعرقوب
نابل
زغوان
الفحص
صوّاف
الزريبة
بوعشير
جرادو
جبل الوسط
بير مشارقة
الناظور
سجنان
جومين
الماتلين
راس الجبل
منزل عبد الرحمان
العالية
غار الملح
منزل جميل
ماطر
تينجة
أوتيك`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-red-600/20 border border-red-500/30 text-red-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-100 flex items-center gap-2">
                <span>Panneau Admin STEG</span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-red-500/20 text-red-400 border border-red-500/30 font-bold">
                  Saisie Officielle
                </span>
              </h3>
              <p className="text-xs text-slate-400">Annonces officielles de delestage & coupures STEG Tunisie</p>
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
        <div className="p-6 space-y-5 flex-1 overflow-y-auto text-xs text-slate-300">
          {/* Active Announcements Count */}
          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Zap className="w-5 h-5 text-red-400" />
              <div>
                <span className="font-bold text-slate-200">Annonces STEG Actives en BDD</span>
                <p className="text-[11px] text-slate-400">{announcements.length} communiqués enregistrés</p>
              </div>
            </div>
            {announcements.length > 0 && onClearAnnouncements && (
              <button
                onClick={onClearAnnouncements}
                className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Vider la liste</span>
              </button>
            )}
          </div>

          {/* Input Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-300 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>Texte du Communiqué Facebook STEG</span>
              </label>
              <button
                type="button"
                onClick={handleUseSample}
                className="text-[11px] font-bold text-amber-400 hover:text-amber-300 underline"
              >
                📋 Utiliser un exemple
              </button>
            </div>
            <textarea
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder="Collez ici le texte officiel publié par la STEG..."
              rows={7}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500 transition-all leading-relaxed font-mono"
            />
          </div>

          {/* Feedback message */}
          {result && (
            <div className={`p-3.5 rounded-2xl border flex items-center gap-2.5 ${
              result.success
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-red-500/10 border-red-500/30 text-red-300'
            }`}>
              {result.success ? (
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              )}
              <span className="font-semibold">{result.message}</span>
            </div>
          )}

          {/* Currently registered announcements preview */}
          {announcements.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="font-black text-slate-200 text-xs uppercase tracking-wider text-slate-400">
                Avis Enregistrés Récoltés
              </h4>
              <div className="space-y-2.5">
                {announcements.map((ann) => (
                  <div key={ann.id} className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-extrabold text-red-400 bg-red-500/10 px-2.5 py-0.5 rounded-lg border border-red-500/20">
                        {ann.regionHeader || 'Tunisie'}
                      </span>
                      <span className="text-slate-400 font-mono">
                        ⏰ {ann.timeRange.start} - {ann.timeRange.end} ({ann.date})
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 line-clamp-2 italic bg-slate-900/40 p-2 rounded-xl border border-slate-800/80">
                      "{ann.rawText.slice(0, 140)}..."
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {ann.affectedAreas.map((area) => (
                        <span
                          key={area.delegationId}
                          className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-bold"
                        >
                          📍 {area.delegationName} ({area.governorate})
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
          >
            Fermer
          </button>
          <button
            onClick={handleSubmit}
            disabled={isProcessing || !postText.trim()}
            className={`px-5 py-2.5 rounded-2xl font-black text-xs transition-all flex items-center gap-2 shadow-lg ${
              !isProcessing && postText.trim()
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Analyser & Publier l'Annonce STEG</span>
          </button>
        </div>
      </div>
    </div>
  );
};
