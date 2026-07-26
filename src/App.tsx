import React, { useState, useEffect, useCallback } from 'react';
import {
  Delegation,
  GridLine,
  OutageReport,
  PowerPlant,
  NationalGridStats,
  AudioLanguage,
  PowerStatus
} from './types';
import { HeaderBar } from './components/HeaderBar';
import { PowerMap } from './components/PowerMap';
import { MobileZoneList } from './components/MobileZoneList';
import { ZoneSelectionModal } from './components/ZoneSelectionModal';
import { ViralShareModal } from './components/ViralShareModal';
import { HowItWorksModal } from './components/HowItWorksModal';
import { AdminSTEGPanel } from './components/AdminSTEGPanel';
import { ReportModal } from './components/ReportModal';
import { DelegationDetailDrawer } from './components/DelegationDetailDrawer';
import { ConsensusDashboard } from './components/ConsensusDashboard';
import { AiGridAnalystModal } from './components/AiGridAnalystModal';
import { AudioTestControl } from './components/AudioTestControl';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { LiveWallStreetTicker } from './components/LiveWallStreetTicker';
import { audioAlertService } from './services/audioAlertService';
import { offlineStorage } from './services/offlineStorage';
import { userZoneService, UserSession } from './services/userZoneService';
import { STEGFeedService } from './services/stegFeedService';
import { STEGAnnouncement } from './services/stegParser';
import { List, Map } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  // State
  const [delegations, setDelegations] = useState<Delegation[]>([]);
  const [gridLines, setGridLines] = useState<GridLine[]>([]);
  const [powerPlants, setPowerPlants] = useState<PowerPlant[]>([]);
  const [reports, setReports] = useState<OutageReport[]>([]);
  const [stats, setStats] = useState<NationalGridStats | null>(null);

  // Active View Tab (MAP = primary interactive map view, LIST = fast list view)
  const [activeTab, setActiveTab] = useState<'LIST' | 'MAP'>('MAP');

  // User & Geolocation & Zone State
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [isZoneSelectionOpen, setIsZoneSelectionOpen] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [offlineQueueCount, setOfflineQueueCount] = useState<number>(0);

  // Selected State
  const [selectedDelegation, setSelectedDelegation] = useState<Delegation | null>(null);
  const [selectedGovernorate, setSelectedGovernorate] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');

  // Modals & Drawers Visibility
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isConsensusOpen, setIsConsensusOpen] = useState<boolean>(false);
  const [isAiAnalystOpen, setIsAiAnalystOpen] = useState<boolean>(false);
  const [isAudioTestOpen, setIsAudioTestOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState<boolean>(false);
  const [isAdminStegOpen, setIsAdminStegOpen] = useState<boolean>(false);
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(false);
  const [stegAnnouncements, setStegAnnouncements] = useState<STEGAnnouncement[]>([]);
  const [isSubmittingReport, setIsSubmittingReport] = useState<boolean>(false);

  // Audio Language Preference
  const [activeLanguage, setActiveLanguage] = useState<AudioLanguage>('AR_TN');

  // Subscriptions State
  const [subscribedDelegations, setSubscribedDelegations] = useState<number[]>([]);

  // PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPwaBanner, setShowPwaBanner] = useState<boolean>(false);

  // Fetch data from API
  const fetchGridData = useCallback(async () => {
    try {
      const [delRes, gridRes, repRes, statRes] = await Promise.all([
        fetch('/api/delegations'),
        fetch('/api/grid-lines'),
        fetch('/api/reports'),
        fetch('/api/stats')
      ]);

      if (delRes.ok) {
        const delData = await delRes.json();
        setDelegations(delData);
      }
      if (gridRes.ok) {
        const gridData = await gridRes.json();
        setGridLines(gridData.gridLines || []);
        setPowerPlants(gridData.powerPlants || []);
      }
      if (repRes.ok) {
        const repData = await repRes.json();
        setReports(repData);
      }
      if (statRes.ok) {
        const statData = await statRes.json();
        setStats(statData);
      }
    } catch (err) {
      console.warn('Network error or server unreachable:', err);
    }
  }, []);

  // Sync offline queue
  const syncOfflineQueue = useCallback(async () => {
    if (!navigator.onLine) return;

    const queue = await offlineStorage.getQueuedReports();
    setOfflineQueueCount(queue.length);

    if (queue.length === 0) return;

    for (const item of queue) {
      try {
        const res = await fetch('/api/reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...item.report, source: 'OFFLINE_SYNC' })
        });
        if (res.ok) {
          await offlineStorage.removeQueuedReport(item.id);
        }
      } catch (err) {
        console.warn('Failed to sync report item:', err);
      }
    }

    const updatedQueue = await offlineStorage.getQueuedReports();
    setOfflineQueueCount(updatedQueue.length);
    fetchGridData();
  }, [fetchGridData]);

  // Initial load
  useEffect(() => {
    fetchGridData();
    const interval = setInterval(fetchGridData, 5000); // 5s fast polling for real-time votes

    const subs = offlineStorage.getSubscriptions();
    setSubscribedDelegations(subs.map(s => s.delegationId));

    offlineStorage.getQueuedReports().then(q => setOfflineQueueCount(q.length));

    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineQueue();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPwaBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [fetchGridData, syncOfflineQueue]);

  // Admin route check (/admin or #admin or ?admin=true)
  useEffect(() => {
    const checkIsAdmin = () => {
      const isPathAdmin = window.location.pathname.startsWith('/admin') ||
                          window.location.hash.includes('admin') ||
                          window.location.search.includes('admin=true');
      setIsAdminRoute(isPathAdmin);
      if (isPathAdmin) {
        setIsAdminStegOpen(true);
      }
    };
    checkIsAdmin();
    window.addEventListener('popstate', checkIsAdmin);
    return () => window.removeEventListener('popstate', checkIsAdmin);
  }, []);

  // Load STEG announcements when delegations are ready & sync affected zones
  useEffect(() => {
    if (delegations.length > 0) {
      const feedService = new STEGFeedService(delegations);
      const annList = feedService.getAnnouncements();
      setStegAnnouncements(annList);

      if (annList.length > 0) {
        const affectedIds = new Set(annList.flatMap(a => a.affectedAreas.map(area => area.delegationId)));
        if (affectedIds.size > 0) {
          setDelegations(prev =>
            prev.map(del => {
              if (affectedIds.has(del.id) && del.status === 'NONE') {
                return { ...del, status: 'POWER_OFF', activeOffCount: Math.max(del.activeOffCount, 5) };
              }
              return del;
            })
          );
        }
      }
    }
  }, []);

  // Update delegations state when a new announcement is added manually
  const handleAnnouncementAdded = (newAnn: STEGAnnouncement) => {
    setStegAnnouncements(prev => [newAnn, ...prev]);
    const affectedIds = new Set(newAnn.affectedAreas.map(area => area.delegationId));
    if (affectedIds.size > 0) {
      setDelegations(prev =>
        prev.map(del => {
          if (affectedIds.has(del.id)) {
            return { ...del, status: 'POWER_OFF', activeOffCount: Math.max(del.activeOffCount, 5) };
          }
          return del;
        })
      );
    }
  };

  // User Zone Session setup
  useEffect(() => {
    if (delegations.length > 0) {
      userZoneService.initializeUserSession(
        delegations,
        (foundDel) => {
          setUserLocation([foundDel.centroid[0], foundDel.centroid[1]]);
          setUserSession(userZoneService.getUserSession());
        },
        () => {
          setIsZoneSelectionOpen(true);
        }
      );
    }
  }, [delegations]);

  // Geolocation trigger
  const handleLocateUser = () => {
    if (!('geolocation' in navigator)) {
      alert('La géolocalisation n\'est pas supportée par votre navigateur.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      pos => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(coords);
      },
      err => {
        console.warn('Geolocation error:', err);
        setUserLocation([36.8065, 10.1815]);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    handleLocateUser();
  }, []);

  // Quick vote handler from zone list
  const handleZoneQuickVote = async (del: Delegation, status: PowerStatus) => {
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: del.centroid[0],
          longitude: del.centroid[1],
          status,
          comment: status === 'OFF' ? 'Signalement pas de lumière 1-tap' : 'Signalement j\'ai la lumière 1-tap',
          deviceHash: `dev_${Math.random().toString(36).substring(2, 9)}`,
          source: 'USER'
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Erreur lors du vote');
      }

      const resData = await res.json();
      await fetchGridData();

      if (status === 'ON') {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        audioAlertService.speakRestorationAlert(activeLanguage, del.name);
      }
    } catch (err: any) {
      alert(err.message || 'Impossible d\'envoyer le signalement.');
    }
  };

  // Submit Outage Report (from Modal)
  const handleSubmitReport = async (data: {
    status: PowerStatus;
    latitude: number;
    longitude: number;
    comment: string;
  }) => {
    setIsSubmittingReport(true);

    try {
      if (!isOnline) {
        await offlineStorage.queueOfflineReport({
          delegationId: selectedDelegation?.id || 1,
          delegationName: selectedDelegation?.name || 'Tunis',
          governorate: selectedDelegation?.governorate || 'Tunis',
          status: data.status,
          latitude: data.latitude,
          longitude: data.longitude,
          deviceHash: `off_dev_${Date.now()}`,
          source: 'OFFLINE_SYNC',
          comment: data.comment
        });

        const q = await offlineStorage.getQueuedReports();
        setOfflineQueueCount(q.length);
        alert('Votre signalement a été enregistré en mode hors-ligne. Il sera transmis au retour de la connexion.');
        return;
      }

      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: data.latitude,
          longitude: data.longitude,
          status: data.status,
          comment: data.comment,
          deviceHash: `dev_${Math.random().toString(36).substring(2, 9)}`,
          source: 'USER'
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Erreur lors de l\'envoi du signalement');
      }

      const resData = await res.json();
      if (resData.delegation) {
        setSelectedDelegation(resData.delegation);
      }

      await fetchGridData();

      if (data.status === 'ON') {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        audioAlertService.speakRestorationAlert(activeLanguage, resData.delegation?.name);
      }
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const handleToggleSubscription = (del: Delegation) => {
    const isSub = subscribedDelegations.includes(del.id);
    if (isSub) {
      offlineStorage.removeSubscription(del.id);
      setSubscribedDelegations(subscribedDelegations.filter(id => id !== del.id));
    } else {
      offlineStorage.saveSubscription({
        delegationId: del.id,
        delegationName: del.name,
        governorate: del.governorate,
        subscribedAt: new Date().toISOString(),
        notifyPush: true,
        notifySound: true,
        language: activeLanguage
      });
      setSubscribedDelegations([...subscribedDelegations, del.id]);
    }
  };

  const handleSimulateOutage = async (delId: number, action: 'TRIGGER_CONSENSUS_OUTAGE' | 'RESOLVE_OUTAGE') => {
    try {
      const res = await fetch('/api/simulate-outage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delegationId: delId, action })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.delegation) {
          setSelectedDelegation(data.delegation);
        }
        await fetchGridData();

        if (action === 'RESOLVE_OUTAGE') {
          confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
          audioAlertService.speakRestorationAlert(activeLanguage, data.delegation?.name);
          audioAlertService.sendPushNotification(
            'الضو رجع! - Le courant est rétabli',
            `L'électricité a été rétablie dans la délégation de ${data.delegation?.name}.`
          );
        }
      }
    } catch (err) {
      console.warn('Simulation failed:', err);
    }
  };

  const handleInstallPwa = () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === 'accepted') {
        setShowPwaBanner(false);
      }
      setDeferredPrompt(null);
    });
  };

  return (
    <div className="h-[100dvh] w-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-hidden">
      {/* Header Bar */}
      <HeaderBar
        stats={stats}
        isOnline={isOnline}
        offlineQueueCount={offlineQueueCount}
        activeLanguage={activeLanguage}
        onLanguageChange={setActiveLanguage}
        onOpenAiAnalyst={() => setIsAiAnalystOpen(true)}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenAudioTest={() => setIsAudioTestOpen(true)}
        onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        onOpenAdminSTEG={isAdminRoute ? () => setIsAdminStegOpen(true) : undefined}
        onInstallPwa={handleInstallPwa}
        canInstallPwa={!!deferredPrompt}
      />

      {/* Wall Street Live News Ticker Tape & Disclaimer */}
      <LiveWallStreetTicker
        reports={reports}
        delegations={delegations}
        announcements={stegAnnouncements}
        stats={stats}
        onSelectDelegation={(del) => {
          setSelectedDelegation(del);
          setActiveTab('MAP');
        }}
      />

      {/* Primary View Tab Switcher Bar */}
      <div className="bg-slate-900/95 border-b border-slate-800 px-3 py-1.5 flex items-center justify-center z-20 shrink-0">
        <div className="bg-slate-950 p-1 rounded-2xl border border-slate-800/80 flex items-center gap-1 max-w-md w-full shadow-inner">
          <button
            onClick={() => setActiveTab('MAP')}
            className={`flex-1 py-1.5 px-3 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 ${
              activeTab === 'MAP'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25 scale-[1.01]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Map className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Carte du Réseau</span>
          </button>

          <button
            onClick={() => setActiveTab('LIST')}
            className={`flex-1 py-1.5 px-3 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 ${
              activeTab === 'LIST'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25 scale-[1.01]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <List className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Signalements 1-Tap</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 min-h-0 relative flex flex-col overflow-hidden">
        {activeTab === 'LIST' ? (
          <MobileZoneList
            delegations={delegations}
            selectedGovernorate={selectedGovernorate}
            onGovernorateChange={setSelectedGovernorate}
            onSubmitVote={handleZoneQuickVote}
            onSelectOnMap={del => {
              setSelectedDelegation(del);
              setActiveTab('MAP');
            }}
            onSpeakRestored={delName => audioAlertService.speakRestorationAlert(activeLanguage, delName)}
            onOpenZoneSelection={() => setIsZoneSelectionOpen(true)}
          />
        ) : (
          <PowerMap
            delegations={delegations}
            gridLines={gridLines}
            powerPlants={powerPlants}
            reports={reports}
            userLocation={userLocation}
            selectedDelegationId={selectedDelegation?.id || null}
            onSelectDelegation={del => setSelectedDelegation(del)}
            onSelectReport={rep => {
              const matchDel = delegations.find(d => d.id === rep.delegationId);
              if (matchDel) setSelectedDelegation(matchDel);
            }}
            onLocateMe={handleLocateUser}
            selectedGovernorate={selectedGovernorate}
            onGovernorateChange={setSelectedGovernorate}
            selectedStatusFilter={selectedStatusFilter}
            onStatusFilterChange={setSelectedStatusFilter}
            stegAnnouncements={stegAnnouncements}
          />
        )}
      </main>

      {/* Delegation Detail Drawer */}
      <DelegationDetailDrawer
        delegation={selectedDelegation}
        onClose={() => setSelectedDelegation(null)}
        reports={reports}
        isSubscribed={selectedDelegation ? subscribedDelegations.includes(selectedDelegation.id) : false}
        onToggleSubscription={handleToggleSubscription}
        onSpeakAlert={delName => audioAlertService.speakRestorationAlert(activeLanguage, delName)}
        onReportForDelegation={del => {
          setSelectedDelegation(del);
          setIsReportModalOpen(true);
        }}
        onSimulateOutage={handleSimulateOutage}
        activeLanguage={activeLanguage}
      />

      {/* Zone Selection Modal */}
      <ZoneSelectionModal
        isOpen={isZoneSelectionOpen}
        onClose={() => setIsZoneSelectionOpen(false)}
        delegations={delegations}
        onZoneSelected={() => {
          setUserSession(userZoneService.getUserSession());
          fetchGridData();
        }}
        onSelectOnMap={() => setActiveTab('MAP')}
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmitReport={handleSubmitReport}
        userLocation={userLocation}
        delegations={delegations}
        isOnline={isOnline}
        isSubmitting={isSubmittingReport}
      />

      {/* Gemini AI Grid Analyst Modal */}
      <AiGridAnalystModal
        isOpen={isAiAnalystOpen}
        onClose={() => setIsAiAnalystOpen(false)}
      />

      {/* Audio Test Modal */}
      <AudioTestControl
        isOpen={isAudioTestOpen}
        onClose={() => setIsAudioTestOpen(false)}
        activeLanguage={activeLanguage}
        onLanguageChange={setActiveLanguage}
      />

      {/* Viral Share Modal */}
      <ViralShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        statsText={stats ? `${stats.activeOutagesCount} pannes en cours · Health Score ${stats.nationalHealthScore}%` : undefined}
      />

      {/* How It Works Modal */}
      <HowItWorksModal
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
      />

      {/* Admin STEG Panel Modal */}
      <AdminSTEGPanel
        isOpen={isAdminStegOpen}
        onClose={() => setIsAdminStegOpen(false)}
        delegations={delegations}
        announcements={stegAnnouncements}
        onAnnouncementAdded={handleAnnouncementAdded}
        onClearAnnouncements={() => {
          const feedService = new STEGFeedService(delegations);
          feedService.clearAnnouncements();
          setStegAnnouncements([]);
        }}
      />

      {/* PWA Install Banner */}
      {showPwaBanner && (
        <PWAInstallBanner
          onInstall={handleInstallPwa}
          onDismiss={() => setShowPwaBanner(false)}
        />
      )}
    </div>
  );
}

