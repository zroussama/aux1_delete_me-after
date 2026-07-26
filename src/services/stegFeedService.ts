import { STEGParser, STEGAnnouncement } from './stegParser';
import { Delegation } from '../types';

export type STEGSourceType = 'RSS' | 'SCRAPER' | 'APIFY' | 'MANUAL';

export interface STEGFeedResult {
  source: STEGSourceType;
  announcements: STEGAnnouncement[];
  timestamp: string;
  success: boolean;
  error?: string;
}

const STEG_CACHE_KEY = 'steg_announcements_cache_v1';

export class STEGFeedService {
  private parser: STEGParser;
  private announcements: STEGAnnouncement[] = [];
  private lastFetchTime: number = 0;

  constructor(private delegations: Delegation[]) {
    this.parser = new STEGParser();
    this.loadFromStorage();
  }

  // Load announcements from localStorage
  private loadFromStorage(): void {
    try {
      const saved = localStorage.getItem(STEG_CACHE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.announcements = parsed.announcements || [];
        this.lastFetchTime = parsed.lastFetchTime || 0;
      }
    } catch (err) {
      console.warn('Failed to load STEG cache from localStorage', err);
    }
  }

  // Save announcements to localStorage
  private saveToStorage(): void {
    try {
      localStorage.setItem(STEG_CACHE_KEY, JSON.stringify({
        announcements: this.announcements,
        lastFetchTime: this.lastFetchTime
      }));
    } catch (err) {
      console.warn('Failed to save STEG cache to localStorage', err);
    }
  }

  // Primary method: Try sources in order
  async fetchLatestAnnouncements(): Promise<STEGFeedResult> {
    const sources: STEGSourceType[] = ['RSS', 'SCRAPER', 'APIFY'];
    
    for (const source of sources) {
      try {
        const result = await this.fetchFromSource(source);
        if (result.success && result.announcements.length > 0) {
          this.mergeAnnouncements(result.announcements);
          return result;
        }
      } catch (error) {
        console.warn(`STEG Feed Source ${source} failed:`, error);
      }
    }

    // Return cached if available
    return {
      source: 'MANUAL',
      announcements: this.announcements,
      timestamp: new Date(this.lastFetchTime || Date.now()).toISOString(),
      success: this.announcements.length > 0,
      error: this.announcements.length === 0 ? 'All live feed sources offline' : undefined
    };
  }

  private async fetchFromSource(source: STEGSourceType): Promise<STEGFeedResult> {
    switch (source) {
      case 'RSS':
        return this.fetchViaRSS();
      case 'SCRAPER':
        return this.fetchViaScraper();
      case 'APIFY':
        return this.fetchViaApify();
      default:
        throw new Error(`Unknown source: ${source}`);
    }
  }

  // SOLUTION 1: RSS Bridge (Public CORS Proxy)
  private async fetchViaRSS(): Promise<STEGFeedResult> {
    try {
      const rssUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://rss-bridge.org/bridge01/?action=display&bridge=FacebookBridge&u=steg.tunisie&format=Json');
      
      const response = await fetch(rssUrl, { timeout: 8000 } as any);
      if (!response.ok) throw new Error(`RSS fetch failed HTTP ${response.status}`);

      const data = await response.json();
      const newAnnouncements: STEGAnnouncement[] = [];

      const items = data.items || data || [];
      for (const item of items) {
        const content = item.content || item.description || item.summary || item.title || '';
        if (content.includes('تعلن الشركة التونسية') || content.includes('انقطاع الكهرباء')) {
          const parsed = this.parser.parseFacebookPost(content, this.delegations);
          if (parsed) {
            parsed.source = 'RSS';
            newAnnouncements.push(parsed);
          }
        }
      }

      return {
        source: 'RSS',
        announcements: newAnnouncements,
        timestamp: new Date().toISOString(),
        success: newAnnouncements.length > 0
      };
    } catch (error) {
      return {
        source: 'RSS',
        announcements: [],
        timestamp: new Date().toISOString(),
        success: false,
        error: error instanceof Error ? error.message : 'RSS Bridge call failed'
      };
    }
  }

  // SOLUTION 2: Local Scraper Endpoint
  private async fetchViaScraper(): Promise<STEGFeedResult> {
    try {
      const response = await fetch('/api/steg-scraper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: 'https://mbasic.facebook.com/steg.tunisie' })
      });

      if (!response.ok) throw new Error(`Scraper API returned HTTP ${response.status}`);

      const data = await response.json();
      const newAnnouncements: STEGAnnouncement[] = [];

      for (const postText of data.posts || []) {
        const parsed = this.parser.parseFacebookPost(postText, this.delegations);
        if (parsed) {
          parsed.source = 'SCRAPER';
          newAnnouncements.push(parsed);
        }
      }

      return {
        source: 'SCRAPER',
        announcements: newAnnouncements,
        timestamp: new Date().toISOString(),
        success: newAnnouncements.length > 0
      };
    } catch (error) {
      return {
        source: 'SCRAPER',
        announcements: [],
        timestamp: new Date().toISOString(),
        success: false,
        error: error instanceof Error ? error.message : 'Scraper failed'
      };
    }
  }

  // SOLUTION 3: Apify API Placeholder
  private async fetchViaApify(): Promise<STEGFeedResult> {
    return {
      source: 'APIFY',
      announcements: [],
      timestamp: new Date().toISOString(),
      success: false,
      error: 'Apify API key not configured'
    };
  }

  // SOLUTION 4: Manual Entry via Admin Panel
  manualEntry(postText: string): STEGAnnouncement | null {
    const parsed = this.parser.parseFacebookPost(postText, this.delegations);
    if (parsed) {
      parsed.source = 'MANUAL';
      this.mergeAnnouncements([parsed]);
      return parsed;
    }
    return null;
  }

  // Merge & Deduplicate Announcements
  private mergeAnnouncements(incoming: STEGAnnouncement[]) {
    const map = new Map<string, STEGAnnouncement>();

    // Put existing
    this.announcements.forEach(a => map.set(a.id, a));

    // Put incoming (if rawText matches, update)
    incoming.forEach(a => {
      // Find duplicate by similarity or raw text match
      const existingKey = Array.from(map.keys()).find(k => {
        const existing = map.get(k);
        return existing && existing.rawText.trim() === a.rawText.trim();
      });

      if (existingKey) {
        map.set(existingKey, { ...map.get(existingKey)!, ...a });
      } else {
        map.set(a.id, a);
      }
    });

    this.announcements = Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    this.lastFetchTime = Date.now();
    this.saveToStorage();
  }

  // Get active announcements
  getAnnouncements(): STEGAnnouncement[] {
    return this.announcements;
  }

  // Clear all cached STEG announcements
  clearAnnouncements(): void {
    this.announcements = [];
    this.saveToStorage();
  }
}
