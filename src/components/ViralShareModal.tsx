import React, { useState } from 'react';
import { X, Share2, Copy, Check, Send, Facebook, MessageSquare, Zap } from 'lucide-react';

interface ViralShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  statsText?: string;
}

export const ViralShareModal: React.FC<ViralShareModalProps> = ({ isOpen, onClose, statsText }) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const appUrl = window.location.origin;
  const shareText = `🔌💡 Suivi Réseau Électrique Tunisie (DhawTN): Consultez et signalez l'état de l'électricité dans votre zone pendant la canicule! ${statsText ? `\n${statsText}` : ''}\n👉 Participez et vérifiez votre quartier ici: ${appUrl}`;

  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(appUrl);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Tunisia Power Grid Tracker',
          text: shareText,
          url: appUrl
        });
      } catch (err) {
        console.warn('Share cancelled', err);
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500 to-red-600 text-slate-950 shadow-lg shadow-amber-500/20">
              <Share2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-100">Partager à vos voisins & proches</h3>
              <p className="text-xs text-slate-400">Aidez à informer la communauté tunisienne</p>
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
          {/* Preview Box */}
          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-amber-400">
              <Zap className="w-4 h-4 fill-amber-400" /> Message de Partage
            </div>
            <p className="whitespace-pre-line text-[11px] leading-relaxed italic text-slate-300 bg-slate-900/50 p-2.5 rounded-xl border border-slate-800">
              {shareText}
            </p>
          </div>

          {/* Share Buttons Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* WhatsApp */}
            <a
              href={`https://api.whatsapp.com/send?text=${encodedText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-bold text-xs flex items-center justify-center gap-2 transition-all"
            >
              <Send className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp</span>
            </a>

            {/* Facebook */}
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-2xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 font-bold text-xs flex items-center justify-center gap-2 transition-all"
            >
              <Facebook className="w-4 h-4 text-blue-400" />
              <span>Facebook</span>
            </a>

            {/* Messenger */}
            <a
              href={`fb-messenger://share/?link=${encodedUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-2xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-bold text-xs flex items-center justify-center gap-2 transition-all"
            >
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              <span>Messenger</span>
            </a>

            {/* Native Share */}
            <button
              onClick={handleNativeShare}
              className="p-3.5 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold text-xs flex items-center justify-center gap-2 transition-all"
            >
              <Share2 className="w-4 h-4 text-amber-400" />
              <span>Menu Mobile</span>
            </button>
          </div>

          {/* Copy Link Button */}
          <button
            onClick={handleCopyLink}
            className={`w-full py-3 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg ${
              copied
                ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-slate-950" />
                <span>Lien copié !</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copier le texte complet</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
