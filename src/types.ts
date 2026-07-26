/**
 * Tunisia Power Grid Tracker - Types Definition
 */

export type PowerStatus = 'ON' | 'OFF';

export type OutageStatus = 
  | 'POWER_OFF' 
  | 'POWER_ON' 
  | 'SECTOR_CUT' 
  | 'NO_DATA' 
  | 'CONFIRMED' 
  | 'UNCONFIRMED' 
  | 'RESOLVED' 
  | 'NONE';

export type VoltageLevel = '225kV' | '150kV' | '90kV' | '30kV';

export type GridObjectType = 'TRANSMISSION_LINE' | 'SUBSTATION' | 'POWER_PLANT';

export type AudioLanguage = 'AR_TN' | 'FR' | 'EN';

export type RegionZone = 'NORTH' | 'COAST' | 'CENTER' | 'SOUTH';

export interface OutageReport {
  id: string;
  delegationId: number;
  delegationName: string;
  governorate: string;
  status: PowerStatus;
  latitude: number;
  longitude: number;
  deviceHash: string;
  source: 'USER' | 'OFFLINE_SYNC' | 'SIMULATED';
  timestamp: string; // ISO string
  comment?: string;
  resolvedAt?: string;
}

export interface Delegation {
  id: number;
  name: string;
  nameAr?: string;
  governorate: string;
  region: RegionZone;
  status: OutageStatus;
  centroid: [number, number]; // [lat, lng]
  bounds?: [[number, number], [number, number]];
  polygon: [number, number][][]; // GeoJSON format polygon coordinates [[[lat, lng]...]]
  reportCount: number;
  activeOffCount: number;
  activeOnCount?: number;
  weightedOffScore?: number;
  weightedOnScore?: number;
  lastReportTime?: string;
  lastResolvedTime?: string;
  stegSubstation?: string;
}

export interface GridLine {
  id: string;
  name: string;
  voltage: VoltageLevel;
  type: GridObjectType;
  status: 'OPERATIONAL' | 'DEGRADED' | 'DISRUPTED';
  path: [number, number][]; // LineString points [lat, lng]
  lengthKm?: number;
  operator: 'STEG';
}

export interface PowerPlant {
  id: string;
  name: string;
  type: 'THERMAL_GAS' | 'SOLAR' | 'WIND' | 'HYDRO';
  capacityMW: number;
  location: [number, number];
  status: 'ONLINE' | 'PARTIAL' | 'OFFLINE';
  governorate: string;
}

export interface ConsensusCluster {
  id: string;
  delegationId: number;
  delegationName: string;
  governorate: string;
  center: [number, number];
  reportCount: number;
  radiusKm: number;
  timeWindowMinutes: number;
  status: OutageStatus;
  firstReportAt: string;
  lastReportAt: string;
  triggeredAt?: string;
}

export interface ZoneSubscription {
  delegationId: number;
  delegationName: string;
  governorate: string;
  subscribedAt: string;
  notifyPush: boolean;
  notifySound: boolean;
  language: AudioLanguage;
}

export interface NationalGridStats {
  totalDelegations: number;
  activeOutagesCount: number;
  unconfirmedCount: number;
  resolvedLast24h: number;
  activeOffReports: number;
  nationalHealthScore: number; // 0-100%
  topAffectedGovernorates: { governorate: string; count: number }[];
  lastUpdated: string;
}

export interface OfflineQueueItem {
  id: string;
  report: Omit<OutageReport, 'id' | 'timestamp'>;
  createdAt: string;
}

export interface AiGridAnalysis {
  summary: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  affectedRegions: string[];
  possibleCauses: string[];
  recommendations: string[];
  timestamp: string;
}
