/**
 * Offline Storage & Synchronization Manager (Resilience Mode)
 * Saves outage reports in IndexedDB when offline and syncs automatically when online.
 */

import { OfflineQueueItem, OutageReport, ZoneSubscription } from '../types';

const DB_NAME = 'TunisiaPowerGridDB';
const DB_VERSION = 1;
const QUEUE_STORE = 'offline_reports_queue';
const SUBS_KEY = 'tpg_zone_subscriptions';

class OfflineStorageManager {
  private dbPromise: Promise<IDBDatabase> | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'indexedDB' in window) {
      this.initDB();
    }
  }

  private initDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(QUEUE_STORE)) {
          db.createObjectStore(QUEUE_STORE, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return this.dbPromise;
  }

  /**
   * Queue a report while offline
   */
  public async queueOfflineReport(reportData: Omit<OutageReport, 'id' | 'timestamp'>): Promise<OfflineQueueItem> {
    const item: OfflineQueueItem = {
      id: `off_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      report: reportData,
      createdAt: new Date().toISOString()
    };

    try {
      const db = await this.initDB();
      const tx = db.transaction(QUEUE_STORE, 'readwrite');
      const store = tx.objectStore(QUEUE_STORE);
      store.add(item);
      return item;
    } catch (err) {
      console.warn('Failed to save to IndexedDB, fallback to localStorage', err);
      const queue = this.getLocalStorageQueue();
      queue.push(item);
      localStorage.setItem('tpg_offline_fallback_queue', JSON.stringify(queue));
      return item;
    }
  }

  /**
   * Get all queued offline reports
   */
  public async getQueuedReports(): Promise<OfflineQueueItem[]> {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(QUEUE_STORE, 'readonly');
        const store = tx.objectStore(QUEUE_STORE);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch {
      return this.getLocalStorageQueue();
    }
  }

  /**
   * Clear synced report from queue
   */
  public async removeQueuedReport(id: string): Promise<void> {
    try {
      const db = await this.initDB();
      const tx = db.transaction(QUEUE_STORE, 'readwrite');
      const store = tx.objectStore(QUEUE_STORE);
      store.delete(id);
    } catch {
      const queue = this.getLocalStorageQueue().filter(i => i.id !== id);
      localStorage.setItem('tpg_offline_fallback_queue', JSON.stringify(queue));
    }
  }

  private getLocalStorageQueue(): OfflineQueueItem[] {
    try {
      const data = localStorage.getItem('tpg_offline_fallback_queue');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /**
   * Subscriptions management
   */
  public getSubscriptions(): ZoneSubscription[] {
    try {
      const data = localStorage.getItem(SUBS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public saveSubscription(sub: ZoneSubscription): ZoneSubscription[] {
    const existing = this.getSubscriptions();
    const updated = existing.filter(s => s.delegationId !== sub.delegationId);
    updated.push(sub);
    localStorage.setItem(SUBS_KEY, JSON.stringify(updated));
    return updated;
  }

  public removeSubscription(delegationId: number): ZoneSubscription[] {
    const existing = this.getSubscriptions();
    const updated = existing.filter(s => s.delegationId !== delegationId);
    localStorage.setItem(SUBS_KEY, JSON.stringify(updated));
    return updated;
  }
}

export const offlineStorage = new OfflineStorageManager();
