import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Delegation, GridLine, OutageReport, PowerPlant } from '../types';
import { TUNISIA_MAP_CENTER, TUNISIA_MAP_DEFAULT_ZOOM } from '../data/tunisiaGeoData';
import { Layers, Crosshair, Filter, Zap, Activity, Info, MapPin, Navigation, Radio } from 'lucide-react';
import { userZoneService } from '../services/userZoneService';
import { STEGAnnouncement } from '../services/stegParser';

interface PowerMapProps {
  delegations: Delegation[];
  gridLines: GridLine[];
  powerPlants: PowerPlant[];
  reports: OutageReport[];
  userLocation: [number, number] | null;
  selectedDelegationId: number | null;
  onSelectDelegation: (delegation: Delegation) => void;
  onSelectReport: (report: OutageReport) => void;
  onLocateMe: () => void;
  selectedGovernorate: string;
  onGovernorateChange: (gov: string) => void;
  selectedStatusFilter: string;
  onStatusFilterChange: (status: string) => void;
  stegAnnouncements?: STEGAnnouncement[];
}

export const PowerMap: React.FC<PowerMapProps> = ({
  delegations,
  gridLines,
  powerPlants,
  reports,
  userLocation,
  selectedDelegationId,
  onSelectDelegation,
  onSelectReport,
  onLocateMe,
  selectedGovernorate,
  onGovernorateChange,
  selectedStatusFilter,
  onStatusFilterChange,
  stegAnnouncements = []
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Set of affected STEG delegation IDs
  const stegAffectedIds = new Set(
    stegAnnouncements.flatMap(a => a.affectedAreas.map(area => area.delegationId))
  );

  // Layer groups refs
  const delegationLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const microZoneLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const gridLineLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const reportLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const userLocationLayerRef = useRef<L.LayerGroup | null>(null);

  // Function to center/fit map on STEG cut zones
  const handleFocusStegZones = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.invalidateSize();
    const affectedDels = delegations.filter(d => stegAffectedIds.has(d.id));
    if (affectedDels.length > 0) {
      const bounds = L.latLngBounds([]);
      affectedDels.forEach(d => {
        const polyBounds = L.polygon(d.polygon).getBounds();
        if (polyBounds.isValid()) {
          bounds.extend(polyBounds);
        }
      });
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12, animate: true, duration: 1.2 });
      }
    }
  };

  // Automatically fly/fit to STEG cut zones if newly added
  useEffect(() => {
    if (stegAffectedIds.size > 0 && mapInstanceRef.current) {
      handleFocusStegZones();
    }
  }, [stegAnnouncements.length]);

  // ResizeObserver to ensure Leaflet container size stays accurate
  useEffect(() => {
    if (!mapContainerRef.current) return;
    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });
    resizeObserver.observe(mapContainerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Layer Visibility Toggles
  const [showMicroZones, setShowMicroZones] = useState<boolean>(true);
  const [showHvGrid, setShowHvGrid] = useState<boolean>(true);
  const [showPowerPlants, setShowPowerPlants] = useState<boolean>(true);
  const [showDelegations, setShowDelegations] = useState<boolean>(true);
  const [showReports, setShowReports] = useState<boolean>(true);
  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState<boolean>(false);

  // Active user session zone info
  const userSession = userZoneService.getUserSession();

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Default center: User location if present, else Tunisia Center
    const initialCenter = userLocation || TUNISIA_MAP_CENTER;
    const initialZoom = userLocation ? 13 : TUNISIA_MAP_DEFAULT_ZOOM;

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      zoomControl: false,
      attributionControl: false
    });

    // CARTO Dark Tile Layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    // Zoom control on top right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Create layer groups
    delegationLayerGroupRef.current = L.layerGroup().addTo(map);
    microZoneLayerGroupRef.current = L.layerGroup().addTo(map);
    gridLineLayerGroupRef.current = L.layerGroup().addTo(map);
    reportLayerGroupRef.current = L.layerGroup().addTo(map);
    userLocationLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Governorate / Location Focus FitBounds Effect
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.invalidateSize();
    if (selectedGovernorate !== 'ALL') {
      // Filter delegations in selected governorate
      const govDelegations = delegations.filter(
        d => d.governorate.toLowerCase() === selectedGovernorate.toLowerCase()
      );

      if (govDelegations.length > 0) {
        const bounds = L.latLngBounds([]);
        govDelegations.forEach(del => {
          const polyBounds = L.polygon(del.polygon).getBounds();
          if (polyBounds.isValid()) {
            bounds.extend(polyBounds);
          }
        });

        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13, animate: true, duration: 1.2 });
        }
      }
    } else if (userLocation) {
      // Focus on hyper-local user location
      map.flyTo(userLocation, 13, { duration: 1.2 });
    }
  }, [selectedGovernorate, userLocation, delegations]);

  // Handle fly/fit to selected delegation
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedDelegationId) return;

    map.invalidateSize();
    const targetDel = delegations.find(d => d.id === selectedDelegationId);
    if (targetDel) {
      const polyBounds = L.polygon(targetDel.polygon).getBounds();
      if (polyBounds.isValid()) {
        map.fitBounds(polyBounds, { padding: [50, 50], maxZoom: 13, animate: true, duration: 1.2 });
      } else {
        map.flyTo(targetDel.centroid, 13, { duration: 1.2 });
      }
    }
  }, [selectedDelegationId, delegations]);

  // Render Delegation Boundaries (Subtle & Clean)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = delegationLayerGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();
    if (!showDelegations) return;

    delegations.forEach(del => {
      // Filter by governorate
      if (selectedGovernorate !== 'ALL' && del.governorate.toLowerCase() !== selectedGovernorate.toLowerCase()) {
        return;
      }
      // Filter by status
      if (selectedStatusFilter !== 'ALL' && del.status !== selectedStatusFilter) {
        return;
      }

      const isSelected = del.id === selectedDelegationId;
      const isUserZone = del.id === userSession?.delegationId;
      const isStegCut = stegAffectedIds.has(del.id) || del.status === 'POWER_OFF' || del.status === 'CONFIRMED';

      let strokeColor = isStegCut ? '#ef4444' : isSelected ? '#f59e0b' : isUserZone ? '#eab308' : '#334155';
      let fillColor = isStegCut ? '#450a0a' : isSelected ? '#f59e0b' : '#0284c7';
      let fillOpacity = isStegCut ? 0.65 : isSelected ? 0.3 : 0.05;
      let weight = isStegCut ? 2.5 : isSelected ? 3 : isUserZone ? 2.5 : 1.2;

      const polygon = L.polygon(del.polygon, {
        color: strokeColor,
        fillColor,
        fillOpacity,
        weight,
        dashArray: isStegCut ? '4, 4' : isUserZone && !isSelected ? '4, 4' : undefined
      });

      polygon.on('click', () => {
        onSelectDelegation(del);
      });

      polygon.bindTooltip(
        `<div style="font-family: system-ui, sans-serif; font-size: 11px; color: #f8fafc; background: #0f172a; padding: 6px 10px; border-radius: 8px; border: 1px solid ${isStegCut ? '#ef4444' : '#334155'}; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
          <strong>${del.nameAr || del.name}</strong> (${del.governorate})
          ${isStegCut ? ' <span style="color: #ef4444; font-weight: bold;">⚡ [DÉLESTAGE STEG]</span>' : ''}
          ${isUserZone ? ' <span style="color: #f59e0b; font-weight: bold;">[VOTRE ZONE]</span>' : ''}<br/>
          <span style="color: #94a3b8;">${isStegCut ? 'Zone d\'interruption programmée STEG' : 'Secteur administratif'}</span>
        </div>`,
        { sticky: true, opacity: 0.95 }
      );

      group.addLayer(polygon);
    });
  }, [delegations, selectedDelegationId, showDelegations, selectedGovernorate, selectedStatusFilter, onSelectDelegation, userSession, stegAnnouncements]);

  // Render Precision Micro-Outage & Restoration Circles (~2 km² Radius Grid) + STEG Ping Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = microZoneLayerGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();
    if (!showMicroZones) return;

    // 1. Render Pulsing Red Pings for STEG Cut Areas
    delegations.forEach(del => {
      if (stegAffectedIds.has(del.id)) {
        if (selectedGovernorate !== 'ALL' && del.governorate.toLowerCase() !== selectedGovernorate.toLowerCase()) return;

        const pingIcon = L.divIcon({
          className: 'steg-ping-marker',
          html: `
            <div class="steg-ping-ring"></div>
            <div class="steg-ping-dot"></div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const stegMarker = L.marker(del.centroid, { icon: pingIcon });

        stegMarker.bindTooltip(
          `<div style="font-family: system-ui, sans-serif; font-size: 11px; color: #f8fafc; background: #020617; padding: 8px 12px; border-radius: 12px; border: 1.5px solid #ef4444; box-shadow: 0 8px 24px rgba(239, 68, 68, 0.5);">
            <div style="font-weight: 900; color: #ef4444; font-size: 12px; display: flex; align-items: center; gap: 4px;">
              ⚡ DÉLESTAGE STEG (PING ROUGE)
            </div>
            <div style="font-size: 12px; font-weight: 800; color: #ffffff; margin-top: 2px;">
              ${del.nameAr || del.name} — ${del.governorate}
            </div>
            <div style="font-size: 10px; color: #fca5a5; margin-top: 3px; font-weight: bold;">
              ⏰ Coupure programmée aujourd'hui
            </div>
          </div>`,
          { sticky: true, opacity: 0.98 }
        );

        stegMarker.on('click', () => onSelectDelegation(del));
        group.addLayer(stegMarker);
      }
    });

    // Filter reports by governorate if active
    const activeReports = reports.filter(rep => {
      if (selectedGovernorate === 'ALL') return true;
      return rep.governorate.toLowerCase() === selectedGovernorate.toLowerCase();
    });

    // 2. Render precision 1km (2 km² area) circles around active reports
    activeReports.forEach(rep => {
      const isOff = rep.status === 'OFF';
      const color = isOff ? '#ef4444' : '#10b981';
      const fillColor = isOff ? '#f87171' : '#34d399';

      // Outer Pulsing Aura Circle for Outages
      if (isOff) {
        const auraCircle = L.circle([rep.latitude, rep.longitude], {
          radius: 1200, // ~1.2km radius outer coverage
          color: '#dc2626',
          weight: 1,
          fillColor: '#dc2626',
          fillOpacity: 0.12,
          className: 'animate-ping'
        });
        group.addLayer(auraCircle);
      }

      // Core ~1km (2 km² coverage) Micro-Zone Circle
      const microCircle = L.circle([rep.latitude, rep.longitude], {
        radius: 900, // 900m radius (~2.5 km² area coverage)
        color,
        weight: 2,
        fillColor,
        fillOpacity: isOff ? 0.35 : 0.2,
        dashArray: isOff ? '6, 4' : undefined
      });

      microCircle.on('click', () => onSelectReport(rep));

      microCircle.bindTooltip(
        `<div style="font-family: system-ui, sans-serif; font-size: 11px; color: #f8fafc; background: #0f172a; padding: 8px; border-radius: 10px; border: 1px solid ${color}; box-shadow: 0 4px 14px rgba(0,0,0,0.6);">
          <div style="font-weight: 800; color: ${color}; font-size: 12px; margin-bottom: 2px;">
            ${isOff ? '⛔ Coupure Micro-Secteur (~2 km²)' : '💡 Alimenté Micro-Secteur (~2 km²)'}
          </div>
          <div>Délégation: <strong>${rep.delegationName}</strong> (${rep.governorate})</div>
          <div style="font-size: 10px; color: #94a3b8; margin-top: 4px;">
            Heure: ${new Date(rep.timestamp).toLocaleTimeString('fr-TN', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>`,
        { sticky: true, opacity: 0.95 }
      );

      group.addLayer(microCircle);
    });

    // 3. Fallback micro-zones for Delegations with confirmed outage state but no exact report points
    delegations.forEach(del => {
      if (selectedGovernorate !== 'ALL' && del.governorate.toLowerCase() !== selectedGovernorate.toLowerCase()) return;

      const hasExactReports = activeReports.some(r => r.delegationId === del.id);
      if (!hasExactReports && (del.status === 'POWER_OFF' || del.status === 'CONFIRMED' || del.status === 'SECTOR_CUT')) {
        const isFullCut = del.status === 'POWER_OFF' || del.status === 'CONFIRMED';
        const color = isFullCut ? '#ef4444' : '#f59e0b';

        const fallbackCircle = L.circle(del.centroid, {
          radius: 1100, // ~1.1km center radius
          color,
          weight: 2,
          fillColor: color,
          fillOpacity: 0.3,
          dashArray: '5, 5'
        });

        fallbackCircle.bindTooltip(
          `<div style="font-family: system-ui, sans-serif; font-size: 11px; color: #f8fafc; background: #0f172a; padding: 8px; border-radius: 10px; border: 1px solid ${color};">
            <strong style="color: ${color};">${isFullCut ? '⛔ Coupure Confirmée' : '⚠️ Coupure par Secteurs'}</strong><br/>
            <span>Zone: <strong>${del.name}</strong></span>
          </div>`,
          { sticky: true }
        );

        group.addLayer(fallbackCircle);
      }
    });
  }, [reports, delegations, showMicroZones, selectedGovernorate, onSelectReport, stegAnnouncements]);

  // Render Grid Lines (225kV & 150kV) & Power Plants
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = gridLineLayerGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    if (showHvGrid) {
      gridLines.forEach(line => {
        const linePath = line.path;
        const color = line.voltage === '225kV' ? '#84cc16' : '#f59e0b';

        const polyline = L.polyline(linePath, {
          color,
          weight: line.voltage === '225kV' ? 3.5 : 2.5,
          opacity: 0.85,
          dashArray: line.status === 'DISRUPTED' ? '6, 6' : undefined
        });

        polyline.bindPopup(
          `<div style="font-family: system-ui, sans-serif; font-size: 12px; color: #f8fafc; background: #0f172a; padding: 10px; border-radius: 8px;">
            <strong style="color: #a3e635;">Ligne Haute Tension STEG</strong><br/>
            <span>${line.name}</span><br/>
            <span>Tension: <strong>${line.voltage}</strong></span>
          </div>`
        );

        group.addLayer(polyline);
      });
    }

    if (showPowerPlants) {
      powerPlants.forEach(pp => {
        const iconHtml = `<div style="
          background: #0f172a;
          border: 2px solid ${pp.type === 'SOLAR' ? '#f59e0b' : pp.type === 'WIND' ? '#38bdf8' : '#ef4444'};
          color: #f8fafc;
          border-radius: 50%;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 13px;
          box-shadow: 0 0 12px ${pp.type === 'SOLAR' ? 'rgba(245,158,11,0.5)' : 'rgba(239,68,68,0.5)'};
        ">⚡</div>`;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-powerplant-icon',
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const marker = L.marker(pp.location, { icon: customIcon });
        marker.bindPopup(
          `<div style="font-family: system-ui, sans-serif; font-size: 12px; color: #f8fafc; background: #0f172a; padding: 10px; border-radius: 8px;">
            <strong style="color: #f59e0b;">${pp.name}</strong><br/>
            <span>Capacité: <strong>${pp.capacityMW} MW</strong></span><br/>
            <span>Gouvernorat: ${pp.governorate}</span>
          </div>`
        );

        group.addLayer(marker);
      });
    }
  }, [gridLines, powerPlants, showHvGrid, showPowerPlants]);

  // Render Outage Reports Markers (Pins)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = reportLayerGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();
    if (!showReports) return;

    reports.forEach(rep => {
      if (selectedGovernorate !== 'ALL' && rep.governorate.toLowerCase() !== selectedGovernorate.toLowerCase()) {
        return;
      }

      const isOff = rep.status === 'OFF';
      const color = isOff ? '#ef4444' : '#10b981';

      const iconHtml = `<div style="
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: ${color};
        border: 2px solid #ffffff;
        box-shadow: 0 0 8px ${color};
      "></div>`;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'report-pin-icon',
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      const marker = L.marker([rep.latitude, rep.longitude], { icon: customIcon });
      marker.on('click', () => onSelectReport(rep));

      marker.bindTooltip(
        `<div style="font-family: system-ui, sans-serif; font-size: 11px; color: #f8fafc; background: #0f172a; padding: 4px 8px; border-radius: 6px;">
          <span>${isOff ? '🔴 Signalement Coupure' : '🟢 Électricité Présente'}</span><br/>
          <small style="color: #94a3b8;">${rep.delegationName}</small>
        </div>`
      );

      group.addLayer(marker);
    });
  }, [reports, showReports, selectedGovernorate, onSelectReport]);

  // Render User Location & "VOTRE ZONE 📍" Badge Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = userLocationLayerRef.current;
    if (!map || !group) return;

    group.clearLayers();

    if (userLocation) {
      const zoneName = userSession?.delegationName || 'Votre Quartier';

      const iconHtml = `<div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        transform: translate(-50%, -100%);
      ">
        <div style="
          background: #f59e0b;
          color: #020617;
          font-weight: 900;
          font-size: 10px;
          padding: 3px 8px;
          border-radius: 12px;
          border: 2px solid #ffffff;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.6);
          font-family: system-ui, sans-serif;
          white-space: nowrap;
          margin-bottom: 2px;
          display: flex;
          align-items: center;
          gap: 3px;
        ">
          📍 VOTRE ZONE (${zoneName})
        </div>
        <div style="
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #3b82f6;
          border: 3px solid #ffffff;
          box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.35);
        "></div>
      </div>`;

      const userIcon = L.divIcon({
        html: iconHtml,
        className: 'user-location-badge-pin',
        iconSize: [120, 50],
        iconAnchor: [60, 50]
      });

      const marker = L.marker(userLocation, { icon: userIcon });
      marker.bindTooltip(`📍 Votre position active (${zoneName})`, { permanent: false });
      group.addLayer(marker);

      // Radar radius circle around user
      const radarCircle = L.circle(userLocation, {
        radius: 1000,
        color: '#3b82f6',
        weight: 1.5,
        fillColor: '#3b82f6',
        fillOpacity: 0.08,
        dashArray: '4, 4'
      });
      group.addLayer(radarCircle);
    }
  }, [userLocation, userSession]);

  // Unique Governorates list for filter dropdown
  const governoratesList = Array.from(new Set(delegations.map(d => d.governorate))).sort();

  return (
    <div className="relative w-full h-[calc(100vh-105px)] bg-slate-950 overflow-hidden">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Filter Bar (Top Left) */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-2 max-w-[calc(100%-80px)] sm:max-w-xl">
        <div className="flex flex-wrap items-center gap-2">
        {/* Governorate Filter Dropdown */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 text-xs shadow-xl">
          <Filter className="w-3.5 h-3.5 text-amber-400" />
          <select
            value={selectedGovernorate}
            onChange={e => onGovernorateChange(e.target.value)}
            className="bg-transparent text-slate-100 font-medium outline-none cursor-pointer text-xs"
          >
            <option value="ALL" className="bg-slate-900 text-slate-100">Tous les Gouvernorats (24)</option>
            {governoratesList.map(gov => (
              <option key={gov} value={gov} className="bg-slate-900 text-slate-100">{gov}</option>
            ))}
          </select>
        </div>

        {/* Status Filter Dropdown */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 text-xs shadow-xl hidden sm:flex">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <select
            value={selectedStatusFilter}
            onChange={e => onStatusFilterChange(e.target.value)}
            className="bg-transparent text-slate-100 font-medium outline-none cursor-pointer text-xs"
          >
            <option value="ALL" className="bg-slate-900 text-slate-100">Tous les Statuts</option>
            <option value="CONFIRMED" className="bg-slate-900 text-red-400">🔴 Pannes Confirmées</option>
            <option value="UNCONFIRMED" className="bg-slate-900 text-amber-400">🟠 Pannes Suspectées</option>
            <option value="RESOLVED" className="bg-slate-900 text-emerald-400">🟢 Rétablis (الضو رجع)</option>
            <option value="NONE" className="bg-slate-900 text-slate-300">🔵 Normal</option>
          </select>
        </div>

        {/* Layers Menu Button */}
        <div className="relative">
          <button
            onClick={() => setIsLayerMenuOpen(!isLayerMenuOpen)}
            className="p-2 bg-slate-900/90 backdrop-blur-md hover:bg-slate-800 text-slate-200 rounded-xl border border-slate-700/80 shadow-xl transition-all flex items-center gap-1.5 text-xs font-semibold"
            title="Calques de la Carte"
          >
            <Layers className="w-4 h-4 text-amber-400" />
            <span className="hidden md:inline">Calques</span>
          </button>

          {isLayerMenuOpen && (
            <div className="absolute top-11 left-0 w-60 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl p-3 shadow-2xl z-30 space-y-2.5">
              <h4 className="text-xs font-bold text-slate-300 border-b border-slate-800 pb-1.5">
                Calques Cartographiques
              </h4>

              <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  Zones Pannes ~2 km²
                </span>
                <input
                  type="checkbox"
                  checked={showMicroZones}
                  onChange={e => setShowMicroZones(e.target.checked)}
                  className="rounded accent-amber-500"
                />
              </label>

              <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-lime-400" />
                  Réseau HT (225kV / 150kV)
                </span>
                <input
                  type="checkbox"
                  checked={showHvGrid}
                  onChange={e => setShowHvGrid(e.target.checked)}
                  className="rounded accent-amber-500"
                />
              </label>

              <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  Centrales STEG & Solaire
                </span>
                <input
                  type="checkbox"
                  checked={showPowerPlants}
                  onChange={e => setShowPowerPlants(e.target.checked)}
                  className="rounded accent-amber-500"
                />
              </label>

              <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                  Limites Administratives
                </span>
                <input
                  type="checkbox"
                  checked={showDelegations}
                  onChange={e => setShowDelegations(e.target.checked)}
                  className="rounded accent-amber-500"
                />
              </label>

              <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  Pins de Signalement
                </span>
                <input
                  type="checkbox"
                  checked={showReports}
                  onChange={e => setShowReports(e.target.checked)}
                  className="rounded accent-amber-500"
                />
              </label>
            </div>
          )}
        </div>
        </div>

        {/* STEG Live Announcement Banner Overlay (Positioned directly BELOW filters) */}
        {stegAnnouncements && stegAnnouncements.length > 0 && stegAffectedIds.size > 0 && (
          <div className="w-full bg-slate-950/95 backdrop-blur-md border border-red-500/70 rounded-2xl p-2.5 sm:p-3 shadow-2xl shadow-red-950/60 flex items-center justify-between gap-3 text-slate-100 animate-fade-in transition-all">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="p-2 rounded-xl bg-red-600 text-white shrink-0 animate-pulse">
                <Zap className="w-4 h-4 fill-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-red-400 uppercase tracking-wide">Avis STEG Actif</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 font-bold border border-red-500/30">
                    🔴 {stegAffectedIds.size} Zones Soirée/Journée
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 truncate font-mono">
                  ⏰ {stegAnnouncements[0].timeRange.start} - {stegAnnouncements[0].timeRange.end} | Cap Bon, Zaghouan, Bizerte...
                </p>
              </div>
            </div>
            <button
              onClick={handleFocusStegZones}
              className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shrink-0 shadow-lg shadow-red-600/30 transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse text-white" />
              <span className="hidden sm:inline">Pinger & Centrer</span>
              <span className="sm:hidden">Pinger</span>
            </button>
          </div>
        )}
      </div>

      {/* Floating Action Buttons (Bottom Right) */}
      <div className="absolute bottom-6 right-6 z-20 flex flex-col gap-2">
        {userLocation && (
          <button
            onClick={() => {
              if (mapInstanceRef.current && userLocation) {
                mapInstanceRef.current.flyTo(userLocation, 14, { duration: 1.2 });
              }
            }}
            className="p-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5 text-xs"
            title="Focus sur Ma Zone 📍"
          >
            <MapPin className="w-4 h-4 fill-slate-950" />
            <span className="hidden sm:inline">Ma Zone</span>
          </button>
        )}

        <button
          onClick={onLocateMe}
          className="p-3.5 bg-slate-900/90 hover:bg-slate-800 text-blue-400 rounded-2xl border border-slate-700/80 shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center group"
          title="Ma Position GPS"
        >
          <Crosshair className="w-5 h-5 group-hover:rotate-45 transition-transform" />
        </button>
      </div>

      {/* Map Legend (Bottom Left - Desktop) */}
      <div className="absolute bottom-6 left-6 z-20 hidden lg:block bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl border border-slate-800 text-xs text-slate-300 shadow-2xl max-w-xs">
        <h5 className="font-bold text-slate-200 mb-2 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-amber-400" /> Couverture Micro-Secteurs (~2 km²)
        </h5>
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/80 border border-red-400 animate-pulse" />
            <span>Coupure (~1km rayon)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 border border-emerald-400" />
            <span>Courant Rétabli</span>
          </div>
          <div className="flex items-center gap-1.5 col-span-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 border border-white" />
            <span>VOTRE ZONE (📍 Badge)</span>
          </div>
          <div className="flex items-center gap-1.5 col-span-2">
            <span className="w-5 h-1 bg-lime-400 rounded-full" />
            <span>Ligne HT 225kV STEG</span>
          </div>
        </div>
      </div>
    </div>
  );
};

