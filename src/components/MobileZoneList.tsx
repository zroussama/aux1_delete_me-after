import React, { useState, useEffect } from 'react';
import { Search, MapPin, Zap, Lock, ChevronDown, ChevronUp, Volume2, Shield } from 'lucide-react';
import { Delegation, PowerStatus } from '../types';
import { userZoneService, UserSession } from '../services/userZoneService';

interface MobileZoneListProps {
  delegations: Delegation[];
  selectedGovernorate: string;
  onGovernorateChange: (gov: string) => void;
  onSubmitVote: (delegation: Delegation, status: PowerStatus) => Promise<void>;
  onSelectOnMap: (delegation: Delegation) => void;
  onSpeakRestored: (delegationName: string) => void;
  onOpenZoneSelection: () => void;
}

export const MobileZoneList: React.FC<MobileZoneListProps> = ({
  delegations,
  selectedGovernorate,
  onGovernorateChange,
  onSubmitVote,
  onSelectOnMap,
  onSpeakRestored,
  onOpenZoneSelection
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedDelId, setExpandedDelId] = useState<number | null>(null);
  const [lockedZones, setLockedZones] = useState<Record<number, number>>({});
  const [loadingVoteId, setLoadingVoteId] = useState<number | null>(null);
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [userLockStatus, setUserLockStatus] = useState<{ isLocked: boolean; remainingSeconds: number }>({
    isLocked: false,
    remainingSeconds: 0
  });

  useEffect(() => {
    const session = userZoneService.getUserSession();
    if (session) {
      setUserSession(session);
      const lockStatus = userZoneService.getUserLockStatus();
      setUserLockStatus(lockStatus);
    }
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('tpg_locked_zones');
      if (stored) {
        const parsed = JSON.parse(stored);
        const now = Date.now();
        const valid: Record<number, number> = {};
        Object.entries(parsed).forEach(([id, unlockAt]) => {
          if (Number(unlockAt) > now) {
            valid[Number(id)] = Number(unlockAt);
          }
        });
        setLockedZones(valid);
      }
    } catch (e) {
      console.warn('Failed to parse lock timer', e);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      let changed = false;
      const updated = { ...lockedZones };
      Object.entries(updated).forEach(([id, unlockAt]) => {
        if (Number(unlockAt) <= now) {
          delete updated[Number(id)];
          changed = true;
        }
      });
      if (changed) {
        setLockedZones(updated);
        localStorage.setItem('tpg_locked_zones', JSON.stringify(updated));
      }

      const lockStatus = userZoneService.getUserLockStatus();
      setUserLockStatus(lockStatus);
      setUserSession(userZoneService.getUserSession());
    }, 1000);
    return () => clearInterval(timer);
  }, [lockedZones]);

  const canVoteInDelegation = (delegationId: number): boolean => {
    return userZoneService.canUserVoteInDelegation(delegationId);
  };

  const handleVote = async (del: Delegation, status: PowerStatus, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!canVoteInDelegation(del.id)) {
      alert(`🔒 Vous ne pouvez voter que dans votre zone: ${userSession?.delegationName || 'Non définie'}`);
      return;
    }

    if (userLockStatus.isLocked) {
      const mins = Math.ceil(userLockStatus.remainingSeconds / 60);
      alert(`🔒 Vous avez déjà voté récemment. Attendez encore ${mins} min.`);
      return;
    }

    const unlockAt = lockedZones[del.id];
    if (unlockAt && unlockAt > Date.now()) {
      const remainingMins = Math.ceil((unlockAt - Date.now()) / 60000);
      alert(`🔒 Cette zone est verrouillée pendant encore ${remainingMins} min.`);
      return;
    }

    setLoadingVoteId(del.id);
    try {
      await onSubmitVote(del, status);

      const newUnlockAt = Date.now() + 10 * 60 * 1000; // 10 minutes lock
      const newLocked = { ...lockedZones, [del.id]: newUnlockAt };
      setLockedZones(newLocked);
      localStorage.setItem('tpg_locked_zones', JSON.stringify(newLocked));

      userZoneService.applyVoteLock();
      setUserLockStatus(userZoneService.getUserLockStatus());
      setUserSession(userZoneService.getUserSession());
    } finally {
      setLoadingVoteId(null);
    }
  };

  const filteredDelegations = delegations.filter(del => {
    const matchesGov = selectedGovernorate === 'ALL' ||
      del.governorate.toLowerCase() === selectedGovernorate.toLowerCase();
    const matchesSearch = del.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      del.governorate.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGov && matchesSearch;
  });

  const sortedDelegations = [...filteredDelegations].sort((a, b) => {
    if (a.id === userSession?.delegationId) return -1;
    if (b.id === userSession?.delegationId) return 1;
    return a.name.localeCompare(b.name);
  });

  const governorateOptions = Array.from(new Set(delegations.map(d => d.governorate))).sort();

  return (
    <div className="w-full max-w-3xl mx-auto px-3 sm:px-4 py-4 space-y-4 pb-24">
      {/* Community Info Box (Famma-Dhaw style explanation) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-amber-400 flex items-center gap-2">
            <span>⚡ Tableau de bord communautaire Canicule</span>
          </h2>
          <button
            onClick={onOpenZoneSelection}
            className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 font-bold transition-all flex items-center gap-1 text-[11px]"
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>{userSession?.delegationName ? `Zone: ${userSession.delegationName}` : 'Changer ma zone'}</span>
          </button>
        </div>
        <p className="text-slate-300 leading-relaxed">
          <strong>C'est quoi ?</strong> Tableau de bord fait par les habitants partout en Tunisie. Chacun signale en un tap s'il a la lumière ou pas. Les compteurs reflètent les signalements des <strong>45 dernières minutes</strong> avec pondération exponentielle (un vote perd la moitié de son poids toutes les 15 min).
        </p>
      </div>

      {/* User Zone Lock Banner */}
      <div className="bg-gradient-to-r from-amber-500/15 to-slate-900 border border-amber-500/30 rounded-2xl p-3 text-xs flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <p className="font-bold text-amber-300">
              Votre zone de résidence: <span className="text-slate-100">{userSession?.delegationName || 'Non choisie'}</span>
            </p>
            <p className="text-[10px] text-slate-400">
              {userSession?.delegationName
                ? `Vous pouvez voter uniquement pour ${userSession.delegationName}`
                : 'Sélectionnez votre zone ci-dessous pour pouvoir participer.'}
            </p>
          </div>
        </div>

        {userLockStatus.isLocked && (
          <span className="shrink-0 px-2 py-1 rounded-lg bg-amber-500/20 text-amber-400 font-mono text-[11px] font-bold border border-amber-500/30 flex items-center gap-1">
            <Lock className="w-3 h-3" />
            {Math.floor(userLockStatus.remainingSeconds / 60)}m {userLockStatus.remainingSeconds % 60}s
          </span>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-2 sticky top-14 z-30 bg-slate-950/95 backdrop-blur-md pt-2 pb-2 border-b border-slate-800">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cherche ta zone (ex: Ariana, Bardo, Sousse, Djerba)..."
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 shadow-xl transition-all"
          />
        </div>

        {/* Governorate Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 text-xs">
          <button
            onClick={() => onGovernorateChange('ALL')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all text-xs ${
              selectedGovernorate === 'ALL'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            Toutes ({delegations.length})
          </button>
          {governorateOptions.map(gov => (
            <button
              key={gov}
              onClick={() => onGovernorateChange(gov)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all text-xs ${
                selectedGovernorate === gov
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {gov}
            </button>
          ))}
        </div>
      </div>

      {/* Delegations Accordion Cards */}
      <div className="space-y-3">
        {sortedDelegations.map(del => {
          const isExpanded = expandedDelId === del.id;
          const unlockAt = lockedZones[del.id];
          const isLocked = unlockAt && unlockAt > Date.now();
          const remainingSecs = isLocked ? Math.ceil((unlockAt - Date.now()) / 1000) : 0;
          const remainingMinsStr = `${Math.floor(remainingSecs / 60)}:${String(remainingSecs % 60).padStart(2, '0')}`;
          const isUserZone = del.id === userSession?.delegationId;
          const canVote = canVoteInDelegation(del.id);

          let statusBadge = { label: '⚪ Aucune info', bg: 'bg-slate-800 text-slate-400 border-slate-700' };
          if (del.status === 'POWER_OFF' || del.status === 'CONFIRMED') {
            statusBadge = { label: '⛔ Coupé', bg: 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse' };
          } else if (del.status === 'POWER_ON' || del.status === 'RESOLVED') {
            statusBadge = { label: '✅ Ça marche', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
          } else if (del.status === 'SECTOR_CUT' || del.status === 'UNCONFIRMED') {
            statusBadge = { label: '⚠️ Coupé par secteurs', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
          }

          const offScore = Math.round((del.weightedOffScore || 0) * 10) / 10;
          const onScore = Math.round((del.weightedOnScore || 0) * 10) / 10;
          const totalScore = offScore + onScore;
          const offPercent = totalScore > 0 ? Math.round((offScore / totalScore) * 100) : 0;

          return (
            <div
              key={del.id}
              className={`bg-slate-900/90 border rounded-2xl overflow-hidden shadow-xl transition-all ${
                isExpanded ? 'border-amber-500/50 shadow-amber-500/10' : 'border-slate-800/80 hover:border-slate-700'
              } ${isUserZone ? 'border-amber-500/40 ring-1 ring-amber-500/20' : ''}`}
            >
              {/* Card Header */}
              <div
                onClick={() => setExpandedDelId(isExpanded ? null : del.id)}
                className="p-3.5 flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl bg-slate-950 border ${
                    isUserZone ? 'border-amber-500/50 text-amber-400' : 'border-slate-800 text-slate-400'
                  }`}>
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-100 flex items-center gap-1.5">
                      <span>{del.name}</span>
                      {isUserZone && (
                        <span className="text-[8px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold">
                          VOTRE ZONE
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-slate-400">{del.governorate}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-xl text-[11px] font-black border ${statusBadge.bg}`}>
                    {statusBadge.label}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="p-4 bg-slate-950/60 border-t border-slate-800/80 space-y-4 text-xs animate-fade-in">
                  {/* Gauge Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                      <span>Signalements 45 dernières min:</span>
                      <span className="font-mono text-slate-300">
                        {offScore > 0 || onScore > 0 ? `${offPercent}% Coupé (Score: ${offScore} OFF / ${onScore} ON)` : 'Aucun vote récent'}
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
                      <div className="bg-red-500 h-full transition-all duration-500" style={{ width: `${totalScore > 0 ? offPercent : 50}%` }} />
                      <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${totalScore > 0 ? 100 - offPercent : 50}%` }} />
                    </div>
                  </div>

                  {/* 1-Tap Quick Voting Buttons */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-300">Votre statut dans cette zone:</span>
                      {isLocked && (
                        <span className="text-amber-400 flex items-center gap-1 font-mono text-[10px]">
                          <Lock className="w-3 h-3" /> Verrouillé ({remainingMinsStr})
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        onClick={e => handleVote(del, 'OFF', e)}
                        disabled={isLocked || userLockStatus.isLocked || loadingVoteId === del.id}
                        className={`p-3 rounded-2xl border font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg ${
                          isLocked || userLockStatus.isLocked
                            ? 'bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                            : 'bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white border-red-400/30 shadow-red-600/20 active:scale-95'
                        }`}
                      >
                        <Zap className="w-4 h-4 fill-white shrink-0" />
                        <span>🔌 Pas de lumière</span>
                      </button>

                      <button
                        onClick={e => handleVote(del, 'ON', e)}
                        disabled={isLocked || userLockStatus.isLocked || loadingVoteId === del.id}
                        className={`p-3 rounded-2xl border font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg ${
                          isLocked || userLockStatus.isLocked
                            ? 'bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                            : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 border-emerald-400/30 shadow-emerald-600/20 active:scale-95'
                        }`}
                      >
                        <Zap className="w-4 h-4 fill-slate-950 shrink-0" />
                        <span>💡 J'ai la lumière</span>
                      </button>
                    </div>

                    {!canVote && (
                      <p className="text-[10px] text-amber-400 text-center font-medium">
                        Vous êtes assigné à la zone {userSession?.delegationName}. Vous pouvez uniquement voter dans votre propre zone.
                      </p>
                    )}
                  </div>

                  {/* Utilities */}
                  <div className="pt-2 flex items-center justify-between text-[11px] border-t border-slate-800/60">
                    <button
                      onClick={() => onSelectOnMap(del)}
                      className="text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <MapPin className="w-3.5 h-3.5" /> Voir sur la carte
                    </button>
                    <button
                      onClick={() => onSpeakRestored(del.name)}
                      className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Volume2 className="w-3.5 h-3.5" /> Écouter "الضو رجع"
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {sortedDelegations.length === 0 && (
          <div className="p-8 text-center text-xs text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">
            Aucune zone trouvée pour "{searchQuery}". Essayez un autre terme.
          </div>
        )}
      </div>
    </div>
  );
};
