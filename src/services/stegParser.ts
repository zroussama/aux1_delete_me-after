import { Delegation } from '../types';

export interface STEGTimeRange {
  start: string;
  end: string;
}

export interface STEGAffectedArea {
  delegationId: number;
  delegationName: string;
  governorate: string;
}

export interface STEGAnnouncement {
  id: string;
  date: string;
  timeRange: STEGTimeRange;
  regionHeader?: string;
  affectedAreas: STEGAffectedArea[];
  rawText: string;
  createdAt: string;
  source: 'RSS' | 'SCRAPER' | 'APIFY' | 'MANUAL';
}

export class STEGParser {
  /**
   * Parse Arabic / French Facebook posts from official STEG page
   * Example text:
   * إشعار بانقطاع الكهرباء
   * جهة الجنوب الغربي
   * تعلم الشركة التونسية للكهرباء و الغاز أنّه قد يتمّ اللجوء إلى القطع الدوري للكهرباء اليوم الجمعة 24 جويلية 2026، خلال الفترة المتراوحة بين الساعة الثامنة مساء و الساعة الحادية عشر ليلا...
   */
  parseFacebookPost(rawText: string, delegations: Delegation[]): STEGAnnouncement | null {
    if (!rawText || rawText.trim().length === 0) return null;

    // Check if post is related to power cut announcement
    const isOutageNotice = 
      rawText.includes('إشعار بانقطاع الكهرباء') ||
      rawText.includes('انقطاع الكهرباء') ||
      rawText.includes('القطع الدوري') ||
      rawText.includes('قطع الكهرباء') ||
      rawText.includes('Coupure') ||
      rawText.includes('STEG');

    if (!isOutageNotice && !rawText.includes('تعلن الشركة التونسية')) {
      return null;
    }

    // Generate unique ID based on hash/timestamp
    const id = `steg-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Extract Date if present, or default to today YYYY-MM-DD
    const dateMatch = rawText.match(/(\d{1,2})\s*(جويلية|أوت|سبتمبر|أكتوبر|نوفمبر|ديسمبر|جانفي|فيفري|مارس|أفريل|ماي|جوان|\d{1,2})[\s\/]*(\d{4})?/);
    const date = dateMatch ? dateMatch[0] : new Date().toISOString().split('T')[0];

    // Extract Time Range (e.g. بين الساعة الحادية عشر صباحا و الساعة الخامسة مساء or 11:00 - 17:00)
    let timeRange: STEGTimeRange = { start: '11:00', end: '17:00' };

    // Helper to normalize Arabic for time matching
    const norm = (str: string) => str.replace(/[أإآ]/g, 'ا').replace(/[ًٌَُِّْ]/g, '').trim();
    const cleanText = norm(rawText);

    // Start time matching
    if (cleanText.includes('الحادية عشر صباحا') || cleanText.includes('11 صباحا') || cleanText.includes('11:00')) {
      timeRange.start = '11:00';
    } else if (cleanText.includes('الثامنة صباحا') || cleanText.includes('8 صباحا') || cleanText.includes('08:00')) {
      timeRange.start = '08:00';
    } else if (cleanText.includes('التاسعة صباحا') || cleanText.includes('9 صباحا') || cleanText.includes('09:00')) {
      timeRange.start = '09:00';
    } else if (cleanText.includes('العاشرة صباحا') || cleanText.includes('10 صباحا') || cleanText.includes('10:00')) {
      timeRange.start = '10:00';
    } else if (cleanText.includes('الثامنة مساء') || cleanText.includes('8 مساء') || cleanText.includes('20:00')) {
      timeRange.start = '20:00';
    } else if (cleanText.includes('السادسة مساء') || cleanText.includes('18:00')) {
      timeRange.start = '18:00';
    } else if (cleanText.includes('التاسعة مساء') || cleanText.includes('21:00')) {
      timeRange.start = '21:00';
    }

    // End time matching
    if (cleanText.includes('الخامسة مساء') || cleanText.includes('5 مساء') || cleanText.includes('17:00')) {
      timeRange.end = '17:00';
    } else if (cleanText.includes('الحادية عشر ليلا') || cleanText.includes('الحادية عشر مساء') || cleanText.includes('23:00')) {
      timeRange.end = '23:00';
    } else if (cleanText.includes('الرابعة مساء') || cleanText.includes('16:00')) {
      timeRange.end = '16:00';
    } else if (cleanText.includes('السادسة مساء') || cleanText.includes('18:00')) {
      timeRange.end = '18:00';
    } else if (cleanText.includes('منتصف الليل') || cleanText.includes('00:00')) {
      timeRange.end = '00:00';
    } else if (cleanText.includes('العاشرة مساء') || cleanText.includes('22:00')) {
      timeRange.end = '22:00';
    }

    // Match affected zones against delegations database
    const affectedAreas: STEGAffectedArea[] = [];
    const normalizedText = cleanText.toLowerCase();

    // Helper to normalize Arabic word
    const normalizeArabic = (text: string) => {
      return text
        .replace(/[أإآ]/g, 'ا')
        .replace(/ة/g, 'ه')
        .replace(/[ًٌَُِّْ]/g, '')
        .replace(/^[\s\-\*\•\d\.\:\-]+/, '')
        .trim();
    };

    const cleanRawText = normalizeArabic(cleanText);

    delegations.forEach(del => {
      const delNameAr = del.nameAr ? normalizeArabic(del.nameAr) : '';
      const delNameFr = del.name.toLowerCase();
      const govNameFr = del.governorate.toLowerCase();

      // Check Arabic and French names
      const matchAr = delNameAr.length >= 2 && cleanRawText.includes(delNameAr);
      const matchFr = delNameFr.length >= 3 && normalizedText.includes(delNameFr);

      if (matchAr || matchFr) {
        if (!affectedAreas.some(a => a.delegationId === del.id)) {
          affectedAreas.push({
            delegationId: del.id,
            delegationName: del.name,
            governorate: del.governorate
          });
        }
      }
    });

    // Fallback: If governorate names like "جهة زغوان", "جهة بنزرت", "جهة الوطن القبلي" are mentioned
    // and no specific delegation was caught for that governorate, add delegations of that governorate
    if (cleanRawText.includes('الوطن القبلي') || cleanRawText.includes('نابل')) {
      delegations.filter(d => d.governorate === 'Nabeul').forEach(del => {
        if (!affectedAreas.some(a => a.delegationId === del.id)) {
          affectedAreas.push({ delegationId: del.id, delegationName: del.name, governorate: del.governorate });
        }
      });
    }
    if (cleanRawText.includes('زغوان')) {
      delegations.filter(d => d.governorate === 'Zaghouan').forEach(del => {
        if (!affectedAreas.some(a => a.delegationId === del.id)) {
          affectedAreas.push({ delegationId: del.id, delegationName: del.name, governorate: del.governorate });
        }
      });
    }
    if (cleanRawText.includes('بنزرت')) {
      delegations.filter(d => d.governorate === 'Bizerte').forEach(del => {
        if (!affectedAreas.some(a => a.delegationId === del.id)) {
          affectedAreas.push({ delegationId: del.id, delegationName: del.name, governorate: del.governorate });
        }
      });
    }

    // Extract Region Header if available
    let regionHeader = 'Tunisie';
    if (rawText.includes('الجنوب الغربي')) regionHeader = 'الجنوب الغربي (Sud-Ouest)';
    else if (rawText.includes('الوسط')) regionHeader = 'الوسط (Centre)';
    else if (rawText.includes('الشمال')) regionHeader = 'الشمال (Nord)';
    else if (rawText.includes('الساحل')) regionHeader = 'الساحل (Sahel)';

    return {
      id,
      date,
      timeRange,
      regionHeader,
      affectedAreas,
      rawText,
      createdAt: new Date().toISOString(),
      source: 'MANUAL'
    };
  }
}
