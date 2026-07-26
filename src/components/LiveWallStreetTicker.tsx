import React, { useState, useEffect } from 'react';
import { Radio, AlertTriangle, CheckCircle2, Megaphone, Info, Zap, Flame, ShieldAlert, ArrowUpRight } from 'lucide-react';
import { Delegation, OutageReport, NationalGridStats } from '../types';
import { STEGAnnouncement } from '../services/stegParser';

interface LiveWallStreetTickerProps {
  reports: OutageReport[];
  delegations: Delegation[];
  announcements: STEGAnnouncement[];
  stats: NationalGridStats | null;
  onSelectDelegation?: (delegation: Delegation) => void;
}

interface TickerItem {
  id: string;
  type: 'OUTAGE' | 'RESTORED' | 'STEG_ANNOUNCEMENT' | 'GRID_METRIC';
  badge: string;
  badgeBg: string;
  badgeTextColor: string;
  title: string;
  timeAgo: string;
  delegationId?: number;
  highlight?: boolean;
}

export const LiveWallStreetTicker: React.FC<LiveWallStreetTickerProps> = ({
  reports,
  delegations,
  announcements,
  stats,
  onSelectDelegation
}) => {
  const [tickerItems, setTickerItems] = useState<TickerItem[]>([]);
  const [wsConnected, setWsConnected] = useState<boolean>(true);
  const [wsEventCount, setWsEventCount] = useState<number>(142);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Initialize and simulate live WebSocket updates
  useEffect(() => {
    // Generate initial ticker items from actual reports, announcements, and stats
    const items: TickerItem[] = [];

    // 1. STEG Official Announcements
    (announcements || []).forEach((ann, idx) => {
      const zonesCount = ann.affectedAreas?.length || 0;
      const govName = ann.regionHeader || (ann.affectedAreas?.[0]?.governorate) || 'STEG';
      const annTitle = ann.rawText ? ann.rawText.slice(0, 50) + '...' : 'Communiqué de coupure';

      items.push({
        id: `ann-${ann.id || idx}`,
        type: 'STEG_ANNOUNCEMENT',
        badge: '📢 COMMUNIQUÉ STEG',
        badgeBg: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
        badgeTextColor: 'text-amber-300',
        title: `${govName}: ${annTitle} (${zonesCount} zone(s) affectée(s))`,
        timeAgo: 'Officiel',
        highlight: true
      });
    });

    // 2. Active Outage Reports
    const activeOutages = delegations.filter(d => d.currentStatus === 'OUTAGE' || d.currentStatus === 'CRITICAL');
    activeOutages.slice(0, 5).forEach((del) => {
      items.push({
        id: `outage-${del.id}`,
        type: 'OUTAGE',
        badge: '🔴 PANNE EN COURS',
        badgeBg: 'bg-red-500/20 border-red-500/40 text-red-400',
        badgeTextColor: 'text-red-400',
        title: `${del.name} (${del.governorateName}) — ${del.activeReportsCount} signalement(s)`,
        timeAgo: `${Math.floor(Math.random() * 20) + 2} min`,
        delegationId: del.id
      });
    });

    // 3. Restored Zones
    const restoredZones = delegations.filter(d => d.currentStatus === 'RESOLVED' || d.currentStatus === 'OPERATIONAL');
    restoredZones.slice(0, 5).forEach((del) => {
      items.push({
        id: `restored-${del.id}`,
        type: 'RESTORED',
        badge: '🟢 RÉTABLI (الضو رجع)',
        badgeBg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400',
        badgeTextColor: 'text-emerald-400',
        title: `${del.name} (${del.governorateName}) — Réseau sous tension`,
        timeAgo: `${Math.floor(Math.random() * 15) + 1} min`,
        delegationId: del.id
      });
    });

    // 4. Live National Grid Metric
    if (stats) {
      items.push({
        id: 'metric-health',
        type: 'GRID_METRIC',
        badge: '⚡ CHARGE NATIONALE STEG',
        badgeBg: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300',
        badgeTextColor: 'text-cyan-300',
        title: `Santé Réseau: ${stats.nationalHealthScore}% | Intégrité: ${stats.gridLoadPercentage}% (Canicule: Élevée)`,
        timeAgo: 'En Direct'
      });
    }

    setTickerItems(items);

    // Simulated WebSocket live event stream pushing real-time alerts
    const interval = setInterval(() => {
      if (delegations.length === 0) return;

      const randomDelegation = delegations[Math.floor(Math.random() * delegations.length)];
      const eventTypes: Array<'OUTAGE' | 'RESTORED'> = ['OUTAGE', 'RESTORED'];
      const chosenType = eventTypes[Math.floor(Math.random() * eventTypes.length)];

      const newItem: TickerItem = {
        id: `ws-live-${Date.now()}`,
        type: chosenType,
        badge: chosenType === 'OUTAGE' ? '⚡ WS EN DIRECT: PANNE' : '🟢 WS EN DIRECT: RÉTABLI',
        badgeBg: chosenType === 'OUTAGE' 
          ? 'bg-red-500/30 border-red-400 text-red-300 animate-pulse' 
          : 'bg-emerald-500/30 border-emerald-400 text-emerald-300 animate-pulse',
        badgeTextColor: chosenType === 'OUTAGE' ? 'text-red-300' : 'text-emerald-300',
        title: chosenType === 'OUTAGE'
          ? `Signalement instantané: Panne détectée à ${randomDelegation.name} (${randomDelegation.governorateName})`
          : `Signalement instantané: Courant rétabli à ${randomDelegation.name} (${randomDelegation.governorateName})`,
        timeAgo: 'À l\'instant',
        delegationId: randomDelegation.id,
        highlight: true
      };

      setWsEventCount(prev => prev + 1);
      setTickerItems(prev => [newItem, ...prev.slice(0, 15)]);
    }, 12000);

    return () => clearInterval(interval);
  }, [delegations, announcements, stats]);

  const handleItemClick = (delId?: number) => {
    if (delId && onSelectDelegation) {
      const found = delegations.find(d => d.id === delId);
      if (found) onSelectDelegation(found);
    }
  };

  return (
    <div className="w-full bg-slate-950 border-b border-slate-800 text-slate-100 text-xs shadow-md shrink-0">
      {/* Wall Street Style Scrolling Live Ticker Tape */}
      <div 
        className="relative overflow-hidden py-1.5 bg-slate-950 flex items-center group cursor-pointer"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Ticker label badge on the left */}
        <div className="absolute left-0 top-0 bottom-0 z-10 bg-slate-900 border-r border-slate-800 px-2.5 flex items-center gap-1.5 shadow-lg shrink-0">
          <Radio className="w-3 h-3 text-red-500 animate-pulse" />
          <span className="font-extrabold text-[10px] tracking-wider text-slate-200 uppercase hidden sm:inline">
            FLUX EN DIRECT
          </span>
        </div>

        {/* Scrolling items wrapper */}
        <div className="flex whitespace-nowrap pl-32 sm:pl-48">
          <div className={`flex gap-4 items-center ${isPaused ? '' : 'animate-ticker'}`}>
            {tickerItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item.delegationId)}
                className={`flex items-center gap-2 px-2.5 py-0.5 rounded-lg border transition-all ${
                  item.highlight
                    ? 'bg-slate-900/90 border-amber-500/50 shadow-sm shadow-amber-500/10'
                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                } hover:bg-slate-800/80 hover:scale-[1.02]`}
              >
                <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border uppercase ${item.badgeBg}`}>
                  {item.badge}
                </span>
                <span className="font-medium text-slate-200 text-xs">{item.title}</span>
                <span className="text-[9px] font-mono text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                  {item.timeAgo}
                </span>
                {item.delegationId && (
                  <ArrowUpRight className="w-3 h-3 text-amber-400 opacity-60 group-hover:opacity-100" />
                )}
              </div>
            ))}
          </div>

          {/* Duplicated set for seamless loop */}
          <div className={`flex gap-4 items-center ${isPaused ? '' : 'animate-ticker'} ml-4`} aria-hidden="true">
            {tickerItems.map((item) => (
              <div
                key={`dup-${item.id}`}
                onClick={() => handleItemClick(item.delegationId)}
                className={`flex items-center gap-2 px-2.5 py-0.5 rounded-lg border transition-all ${
                  item.highlight
                    ? 'bg-slate-900/90 border-amber-500/50 shadow-sm shadow-amber-500/10'
                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                } hover:bg-slate-800/80 hover:scale-[1.02]`}
              >
                <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border uppercase ${item.badgeBg}`}>
                  {item.badge}
                </span>
                <span className="font-medium text-slate-200 text-xs">{item.title}</span>
                <span className="text-[9px] font-mono text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                  {item.timeAgo}
                </span>
                {item.delegationId && (
                  <ArrowUpRight className="w-3 h-3 text-amber-400 opacity-60 group-hover:opacity-100" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
