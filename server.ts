import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import * as turf from '@turf/turf';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_DELEGATIONS, INITIAL_GRID_LINES, INITIAL_POWER_PLANTS } from './src/data/tunisiaGeoData.js';
import { Delegation, GridLine, OutageReport, OutageStatus, NationalGridStats } from './src/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const PORT = 3000;

// State storage
let delegations: Delegation[] = [...INITIAL_DELEGATIONS];
let gridLines: GridLine[] = [...INITIAL_GRID_LINES];
let reports: OutageReport[] = [];
const rateLimitMap = new Map<string, number>(); // deviceHash/ip -> lastReportTimestamp

// Helper to calculate distance in KM between two lat/lng points
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const from = turf.point([lon1, lat1]);
  const to = turf.point([lon2, lat2]);
  return turf.distance(from, to, { units: 'kilometers' });
}

// Helper to find delegation for a lat/lng point
function findDelegationForPoint(lat: number, lng: number): Delegation | undefined {
  const pt = turf.point([lng, lat]);
  for (const del of delegations) {
    if (del.polygon && del.polygon[0]) {
      // convert [lat, lng] array to GeoJSON [lng, lat]
      const geoPolygonCoords = del.polygon[0].map(([dLat, dLng]) => [dLng, dLat]);
      const poly = turf.polygon([geoPolygonCoords]);
      if (turf.booleanPointInPolygon(pt, poly)) {
        return del;
      }
    }
  }

  // Fallback to nearest centroid if point falls slightly outside custom box
  let closest: Delegation | undefined = undefined;
  let minDistance = Infinity;

  for (const del of delegations) {
    const dist = getDistanceKm(lat, lng, del.centroid[0], del.centroid[1]);
    if (dist < minDistance) {
      minDistance = dist;
      closest = del;
    }
  }
  return closest;
}

// Consensus Evaluation Algorithm with 45-minute window and 15-minute half-life decay
// Votes lose half their weight every 15 minutes. Window is 45 minutes.
function evaluateConsensusForDelegation(delegationId: number) {
  const now = Date.now();
  const fortyFiveMinutesAgo = now - 45 * 60 * 1000;

  const targetDel = delegations.find(d => d.id === delegationId);
  if (!targetDel) return;

  // Filter reports in last 45 minutes for this delegation
  const recentReports = reports.filter(r => {
    const rTime = new Date(r.timestamp).getTime();
    return rTime >= fortyFiveMinutesAgo && r.delegationId === delegationId;
  });

  let weightedOffScore = 0;
  let weightedOnScore = 0;
  let activeOffCount = 0;
  let activeOnCount = 0;

  recentReports.forEach(r => {
    const ageMinutes = (now - new Date(r.timestamp).getTime()) / (60 * 1000);
    const weight = Math.pow(0.5, ageMinutes / 15.0); // 15 min half-life

    if (r.status === 'OFF') {
      weightedOffScore += weight;
      activeOffCount++;
    } else {
      weightedOnScore += weight;
      activeOnCount++;
    }
  });

  targetDel.reportCount = recentReports.length;
  targetDel.activeOffCount = activeOffCount;
  targetDel.activeOnCount = activeOnCount;
  targetDel.weightedOffScore = Math.round(weightedOffScore * 10) / 10;
  targetDel.weightedOnScore = Math.round(weightedOnScore * 10) / 10;

  const totalWeighted = weightedOffScore + weightedOnScore;

  if (totalWeighted < 0.2) {
    targetDel.status = 'NO_DATA';
  } else if (weightedOffScore >= 1.4 * weightedOnScore && weightedOffScore >= 0.5) {
    targetDel.status = 'POWER_OFF';
    targetDel.lastReportTime = new Date().toISOString();
  } else if (weightedOnScore >= 1.4 * weightedOffScore && weightedOnScore >= 0.5) {
    targetDel.status = 'POWER_ON';
    targetDel.lastResolvedTime = new Date().toISOString();
  } else {
    targetDel.status = 'SECTOR_CUT';
    targetDel.lastReportTime = new Date().toISOString();
  }
}

// Evaluate all delegations periodically
function evaluateAllDelegations() {
  delegations.forEach(del => evaluateConsensusForDelegation(del.id));
}

// API ROUTES

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), totalDelegations: delegations.length });
});

// 2. Delegations list & status
app.get('/api/delegations', (req, res) => {
  res.json(delegations);
});

// 3. Grid Lines & Power Plants
app.get('/api/grid-lines', (req, res) => {
  res.json({ gridLines, powerPlants: INITIAL_POWER_PLANTS });
});

// 4. Get all Outage Reports
app.get('/api/reports', (req, res) => {
  const { governorate, status, limit } = req.query;
  let filtered = [...reports];

  if (governorate && typeof governorate === 'string') {
    filtered = filtered.filter(r => r.governorate.toLowerCase() === governorate.toLowerCase());
  }
  if (status && typeof status === 'string') {
    filtered = filtered.filter(r => r.status === status);
  }

  // Sort newest first
  filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (limit) {
    filtered = filtered.slice(0, parseInt(limit as string, 10));
  }

  res.json(filtered);
});

// 5. Submit Outage Report (ON / OFF)
app.post('/api/reports', (req, res) => {
  try {
    const { latitude, longitude, status, comment, deviceHash, source } = req.body;

    if (!latitude || !longitude || !status) {
      return res.status(400).json({ error: 'latitude, longitude and status (ON/OFF) are required' });
    }

    const deviceKey = deviceHash || req.ip || 'anonymous_client';
    const now = Date.now();
    const lastReportTime = rateLimitMap.get(deviceKey);

    // Rate limit: 1 report every 15 minutes unless simulated
    if (source !== 'SIMULATED' && lastReportTime && (now - lastReportTime) < 15 * 60 * 1000) {
      const waitMins = Math.ceil((15 * 60 * 1000 - (now - lastReportTime)) / (60 * 1000));
      return res.status(429).json({
        error: `Rate limit active. Please wait ${waitMins} minute(s) before submitting another report.`,
        remainingMs: 15 * 60 * 1000 - (now - lastReportTime)
      });
    }

    // Match point to delegation
    const delegation = findDelegationForPoint(latitude, longitude);
    if (!delegation) {
      return res.status(400).json({ error: 'Coordinates fall outside Tunisia administrative boundaries' });
    }

    const newReport: OutageReport = {
      id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      delegationId: delegation.id,
      delegationName: delegation.name,
      governorate: delegation.governorate,
      status: status === 'OFF' ? 'OFF' : 'ON',
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      deviceHash: deviceKey,
      source: source || 'USER',
      timestamp: new Date().toISOString(),
      comment: comment ? String(comment).substring(0, 280) : undefined
    };

    reports.unshift(newReport);
    rateLimitMap.set(deviceKey, now);

    // Re-evaluate spatial consensus for this delegation
    evaluateConsensusForDelegation(delegation.id);

    // If report is ON and delegation was in outage, resolve it
    if (status === 'ON' && (delegation.status === 'CONFIRMED' || delegation.status === 'UNCONFIRMED')) {
      delegation.status = 'RESOLVED';
      delegation.lastResolvedTime = new Date().toISOString();
    }

    const updatedDelegation = delegations.find(d => d.id === delegation.id);

    res.json({
      success: true,
      report: newReport,
      delegation: updatedDelegation,
      consensusTriggered: updatedDelegation?.status === 'CONFIRMED'
    });
  } catch (err: unknown) {
    console.error('Error submitting report:', err);
    res.status(500).json({ error: 'Internal server error while processing outage report' });
  }
});

// 6. National Grid Statistics
app.get('/api/stats', (req, res) => {
  const activeOutages = delegations.filter(d => d.status === 'CONFIRMED').length;
  const unconfirmed = delegations.filter(d => d.status === 'UNCONFIRMED').length;
  const resolved24h = delegations.filter(d => d.status === 'RESOLVED').length;
  const activeOffReports = reports.filter(r => r.status === 'OFF').length;

  const total = delegations.length;
  const healthPercentage = Math.round(((total - activeOutages - (unconfirmed * 0.5)) / total) * 100);

  // Group top affected governorates
  const govMap = new Map<string, number>();
  delegations.filter(d => d.status === 'CONFIRMED' || d.status === 'UNCONFIRMED').forEach(d => {
    govMap.set(d.governorate, (govMap.get(d.governorate) || 0) + 1);
  });

  const topAffectedGovernorates = Array.from(govMap.entries())
    .map(([governorate, count]) => ({ governorate, count }))
    .sort((a, b) => b.count - a.count);

  const stats: NationalGridStats = {
    totalDelegations: total,
    activeOutagesCount: activeOutages,
    unconfirmedCount: unconfirmed,
    resolvedLast24h: resolved24h,
    activeOffReports,
    nationalHealthScore: Math.max(0, Math.min(100, healthPercentage)),
    topAffectedGovernorates,
    lastUpdated: new Date().toISOString()
  };

  res.json(stats);
});

// 7. Crowdsourcing Consensus Simulator (For Testing / Demo)
app.post('/api/simulate-outage', (req, res) => {
  const { delegationId, action } = req.body;
  const del = delegations.find(d => d.id === parseInt(delegationId, 10));

  if (!del) {
    return res.status(404).json({ error: 'Delegation not found' });
  }

  if (action === 'TRIGGER_CONSENSUS_OUTAGE') {
    // Add 3 distinct OFF reports to trigger escalation rule
    const now = new Date().toISOString();
    for (let i = 1; i <= 3; i++) {
      reports.unshift({
        id: `sim_${Date.now()}_${i}`,
        delegationId: del.id,
        delegationName: del.name,
        governorate: del.governorate,
        status: 'OFF',
        latitude: del.centroid[0] + (Math.random() * 0.01 - 0.005),
        longitude: del.centroid[1] + (Math.random() * 0.01 - 0.005),
        deviceHash: `sim_device_${i}_${Date.now()}`,
        source: 'SIMULATED',
        timestamp: now,
        comment: `Signalement automatique de test (${i}/3) pour validation consensus.`
      });
    }

    evaluateConsensusForDelegation(del.id);

    return res.json({
      success: true,
      message: `Outage consensus triggered for ${del.name} (${del.governorate})! Status updated.`,
      delegation: del
    });
  } else if (action === 'RESOLVE_OUTAGE') {
    // Add 3 ON reports
    const now = new Date().toISOString();
    for (let i = 1; i <= 3; i++) {
      reports.unshift({
        id: `sim_resolve_${Date.now()}_${i}`,
        delegationId: del.id,
        delegationName: del.name,
        governorate: del.governorate,
        status: 'ON',
        latitude: del.centroid[0],
        longitude: del.centroid[1],
        deviceHash: `sim_device_restore_${i}_${Date.now()}`,
        source: 'SIMULATED',
        timestamp: now,
        comment: 'Rétablissement de l\'électricité confirmé. (الضو رجع)'
      });
    }

    evaluateConsensusForDelegation(del.id);

    return res.json({
      success: true,
      message: `Power restored for ${del.name} (${del.governorate})! Voice alert activated: "الضو رجع".`,
      delegation: del
    });
  }

  res.status(400).json({ error: 'Invalid simulation action' });
});

// 8. Gemini AI Grid Analyst Synthesis Endpoint
app.post('/api/ai-summary', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is missing on server.' });
    }

    const ai = new GoogleGenAI({ apiKey });

    const activeOutages = delegations.filter(d => d.status === 'CONFIRMED');
    const unconfirmed = delegations.filter(d => d.status === 'UNCONFIRMED');

    const prompt = `
Tu es un expert ingénieur réseau chez la STEG et analyste pour l'application "Tunisia Power Grid Tracker".
Voici la situation actuelle en temps réel sur le réseau électrique tunisien:
- Délégations en Panne Confirmée (${activeOutages.length}): ${activeOutages.map(d => `${d.name} (${d.governorate})`).join(', ') || 'Aucune'}
- Délégations en Panne Suspectée/En Cours (${unconfirmed.length}): ${unconfirmed.map(d => `${d.name} (${d.governorate})`).join(', ') || 'Aucune'}
- Nombre total de signalements citoyens récents: ${reports.length}

Rédige une synthèse analytique concise et professionnelle (en Français avec les expressions locales pertinentes) destinée aux citoyens, PME et services médicaux tunisiens.
Inclus:
1. État global de la stabilité du réseau HT/BT STEG.
2. Évaluation de la gravité (FAIBLE, MOYENNE, ÉLEVÉE, CRITIQUE).
3. Hypothèses techniques probables (surcharge estivale, panne de sous-station, tempête/chaleur extreme, maintenance).
4. Recommandations prioritaires pour préserver les appareils électroménagers et les chaînes de froid.

Réponds sous la forme d'un objet JSON strict avec les clés suivantes:
{
  "summary": "texte explicatif résumé...",
  "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "affectedRegions": ["Région 1", "Région 2"],
  "possibleCauses": ["Surcharge ligne HT", "Pic de climatisation"],
  "recommendations": ["Débrancher les appareils sensibles", "Conserver la chaîne du froid"]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('Empty response from Gemini API');
    }

    const jsonParsed = JSON.parse(responseText);
    res.json({
      ...jsonParsed,
      timestamp: new Date().toISOString()
    });
  } catch (err: unknown) {
    console.error('Gemini AI summary failed:', err);
    res.status(500).json({
      error: 'Impossible d\'analyser le réseau via Gemini AI actuellement',
      details: err instanceof Error ? err.message : String(err)
    });
  }
});

// Seed demo initial outage for realistic testing if reports empty
if (reports.length === 0) {
  // Let's seed 1 active unconfirmed report in Sousse and 1 resolved in Ariana
  const sousseDel = delegations.find(d => d.id === 12);
  if (sousseDel) {
    reports.push({
      id: 'init_sousse_1',
      delegationId: sousseDel.id,
      delegationName: sousseDel.name,
      governorate: sousseDel.governorate,
      status: 'OFF',
      latitude: sousseDel.centroid[0],
      longitude: sousseDel.centroid[1],
      deviceHash: 'init_dev_1',
      source: 'SIMULATED',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      comment: 'Coupure soudaine dans le quartier Sahloul depuis 10 min.'
    });
  }
}

// Initial evaluation and periodic decay interval (every 30 seconds)
evaluateAllDelegations();
setInterval(evaluateAllDelegations, 30000);

// Start Vite middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Tunisia Power Grid Tracker] Express server active on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
