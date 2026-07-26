import { Delegation } from '../types';
import * as turf from '@turf/turf';

export interface UserSession {
  id: string;
  delegationId: number | null;
  delegationName: string | null;
  governorate: string | null;
  latitude: number | null;
  longitude: number | null;
  isLocationVerified: boolean;
  role: 'RESIDENT' | 'ADMIN' | 'MODERATOR';
  lastVoteTime: number | null;
  voteCount: number;
  isLocked: boolean;
  lockExpiry: number | null;
}

class UserZoneService {
  private sessionKey = 'tpg_user_session';

  getUserSession(): UserSession | null {
    try {
      const stored = localStorage.getItem(this.sessionKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse user session:', e);
    }
    return null;
  }

  saveUserSession(session: UserSession): void {
    localStorage.setItem(this.sessionKey, JSON.stringify(session));
  }

  clearUserSession(): void {
    localStorage.removeItem(this.sessionKey);
    localStorage.removeItem('tpg_locked_zones');
  }

  isUserInDelegation(delegationId: number): boolean {
    const session = this.getUserSession();
    if (!session) return false;
    return session.delegationId === delegationId;
  }

  canUserVoteInDelegation(delegationId: number): boolean {
    const session = this.getUserSession();
    if (!session) return true; // Allow initial vote if session not restricted

    if (session.role === 'ADMIN' || session.role === 'MODERATOR') {
      return true;
    }

    if (session.delegationId === null) {
      return true; // Unset zone can vote once and gets bound
    }

    return session.delegationId === delegationId;
  }

  getUserLockStatus(): { isLocked: boolean; remainingSeconds: number } {
    const session = this.getUserSession();
    if (!session || !session.lockExpiry) {
      return { isLocked: false, remainingSeconds: 0 };
    }

    const now = Date.now();
    if (session.lockExpiry <= now) {
      session.isLocked = false;
      session.lockExpiry = null;
      this.saveUserSession(session);
      return { isLocked: false, remainingSeconds: 0 };
    }

    const remainingSeconds = Math.ceil((session.lockExpiry - now) / 1000);
    return { isLocked: true, remainingSeconds };
  }

  applyVoteLock(): void {
    const session = this.getUserSession() || {
      id: `usr_${Date.now()}`,
      delegationId: null,
      delegationName: null,
      governorate: null,
      latitude: null,
      longitude: null,
      isLocationVerified: false,
      role: 'RESIDENT',
      lastVoteTime: null,
      voteCount: 0,
      isLocked: false,
      lockExpiry: null
    };

    session.isLocked = true;
    session.lockExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes lock
    session.lastVoteTime = Date.now();
    session.voteCount = (session.voteCount || 0) + 1;
    this.saveUserSession(session);
  }

  findDelegationByLocation(
    latitude: number,
    longitude: number,
    delegations: Delegation[]
  ): Delegation | null {
    const point = turf.point([longitude, latitude]);

    for (const delegation of delegations) {
      if (delegation.polygon && delegation.polygon[0]) {
        const polygonCoords = delegation.polygon[0].map(([lat, lng]) => [lng, lat]);
        const polygon = turf.polygon([polygonCoords]);

        if (turf.booleanPointInPolygon(point, polygon)) {
          return delegation;
        }
      }
    }

    return this.findNearestDelegation(latitude, longitude, delegations);
  }

  findNearestDelegation(
    latitude: number,
    longitude: number,
    delegations: Delegation[]
  ): Delegation | null {
    let nearest: Delegation | null = null;
    let minDistance = Infinity;

    for (const delegation of delegations) {
      const [delLat, delLng] = delegation.centroid;
      const distance = this.getDistanceKm(latitude, longitude, delLat, delLng);

      if (distance < minDistance) {
        minDistance = distance;
        nearest = delegation;
      }
    }

    return nearest;
  }

  private getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  async initializeUserSession(
    delegations: Delegation[],
    onLocationFound?: (delegation: Delegation) => void,
    onLocationError?: () => void
  ): Promise<UserSession> {
    const existingSession = this.getUserSession();
    if (existingSession && existingSession.delegationId !== null) {
      return existingSession;
    }

    try {
      const position = await this.getCurrentPosition();
      const { latitude, longitude } = position.coords;

      const delegation = this.findDelegationByLocation(latitude, longitude, delegations);

      if (delegation) {
        const session: UserSession = {
          id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          delegationId: delegation.id,
          delegationName: delegation.name,
          governorate: delegation.governorate,
          latitude,
          longitude,
          isLocationVerified: true,
          role: 'RESIDENT',
          lastVoteTime: null,
          voteCount: 0,
          isLocked: false,
          lockExpiry: null
        };

        this.saveUserSession(session);
        onLocationFound?.(delegation);
        return session;
      }
    } catch (error) {
      console.warn('Geolocation failed or denied:', error);
      onLocationError?.();
    }

    return this.createManualSession();
  }

  createManualSession(): UserSession {
    const session: UserSession = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      delegationId: null,
      delegationName: null,
      governorate: null,
      latitude: null,
      longitude: null,
      isLocationVerified: false,
      role: 'RESIDENT',
      lastVoteTime: null,
      voteCount: 0,
      isLocked: false,
      lockExpiry: null
    };

    this.saveUserSession(session);
    return session;
  }

  private getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 60000
      });
    });
  }

  setUserZone(delegationId: number, delegations: Delegation[]): UserSession {
    const delegation = delegations.find(d => d.id === delegationId);
    if (!delegation) {
      throw new Error('Delegation not found');
    }

    const session = this.getUserSession() || this.createManualSession();

    session.delegationId = delegation.id;
    session.delegationName = delegation.name;
    session.governorate = delegation.governorate;
    session.isLocationVerified = false;

    this.saveUserSession(session);
    return session;
  }
}

export const userZoneService = new UserZoneService();
