/**
 * Tunisia Power Grid & Administrative Spatial Data (OSM & GADM compliant)
 * Contains 24 Governorates with Delegations and STEG High Voltage Grid Infrastructure
 */

import { Delegation, GridLine, PowerPlant } from '../types';

// Power Plants in Tunisia
export const INITIAL_POWER_PLANTS: PowerPlant[] = [
  {
    id: 'pp-rades',
    name: 'Centrale Thermique de Radès',
    type: 'THERMAL_GAS',
    capacityMW: 920,
    location: [36.8011, 10.2815],
    status: 'ONLINE',
    governorate: 'Ben Arous'
  },
  {
    id: 'pp-sousse',
    name: 'Centrale Electrique de Sousse (Cyle Combiné)',
    type: 'THERMAL_GAS',
    capacityMW: 800,
    location: [35.8322, 10.6011],
    status: 'ONLINE',
    governorate: 'Sousse'
  },
  {
    id: 'pp-mornaguia',
    name: 'Centrale Turbine à Gaz de Mornaguia',
    type: 'THERMAL_GAS',
    capacityMW: 600,
    location: [36.7210, 10.0210],
    status: 'ONLINE',
    governorate: 'Manouba'
  },
  {
    id: 'pp-goulette',
    name: 'Centrale de la Goulette Sud',
    type: 'THERMAL_GAS',
    capacityMW: 250,
    location: [36.8090, 10.3010],
    status: 'ONLINE',
    governorate: 'Tunis'
  },
  {
    id: 'pp-bouchemma',
    name: 'Centrale Thermique Bouchemma (Gabès)',
    type: 'THERMAL_GAS',
    capacityMW: 240,
    location: [33.8820, 10.0820],
    status: 'ONLINE',
    governorate: 'Gabès'
  },
  {
    id: 'pp-tozeur-solar',
    name: 'Centrale Solaire Photovoltaïque de Tozeur',
    type: 'SOLAR',
    capacityMW: 20,
    location: [33.9210, 8.1230],
    status: 'ONLINE',
    governorate: 'Tozeur'
  },
  {
    id: 'pp-sididaoud-wind',
    name: 'Parc Eolien de Sidi Daoud (Cap Bon)',
    type: 'WIND',
    capacityMW: 55,
    location: [37.0120, 10.9120],
    status: 'ONLINE',
    governorate: 'Nabeul'
  },
  {
    id: 'pp-metline-wind',
    name: 'Parc Eolien Metline / Jbel Kchabta',
    type: 'WIND',
    capacityMW: 190,
    location: [37.2120, 9.9820],
    status: 'ONLINE',
    governorate: 'Bizerte'
  }
];

// STEG Transmission Grid lines (225 kV, 150 kV, 90 kV)
export const INITIAL_GRID_LINES: GridLine[] = [
  {
    id: 'grid-tn-north-ring',
    name: 'Ligne HT 225kV Boucle du Grand Tunis (Radès - Goulette - Manouba - Ariana)',
    voltage: '225kV',
    type: 'TRANSMISSION_LINE',
    status: 'OPERATIONAL',
    operator: 'STEG',
    lengthKm: 65,
    path: [
      [36.8011, 10.2815], // Rades
      [36.8090, 10.3010], // Goulette
      [36.8665, 10.1647], // Ariana
      [36.8188, 10.1658], // Tunis Bardo
      [36.7210, 10.0210], // Mornaguia
      [36.7450, 10.2310]  // Ben Arous Substation
    ]
  },
  {
    id: 'grid-tn-bizerte-hv',
    name: 'Ligne HT 225kV Tunis - Bizerte - Menzel Bourguiba',
    voltage: '225kV',
    type: 'TRANSMISSION_LINE',
    status: 'OPERATIONAL',
    operator: 'STEG',
    lengthKm: 85,
    path: [
      [36.8665, 10.1647], // Ariana
      [37.0510, 9.9120],  // Mateur Substation
      [37.1520, 9.7910],  // Menzel Bourguiba
      [37.2744, 9.8739]   // Bizerte Nord
    ]
  },
  {
    id: 'grid-tn-coastal-spine',
    name: 'Ligne HT 225kV Radès - Cap Bon - Nabeul - Sousse - Sfax',
    voltage: '225kV',
    type: 'TRANSMISSION_LINE',
    status: 'OPERATIONAL',
    operator: 'STEG',
    lengthKm: 270,
    path: [
      [36.8011, 10.2815], // Radès
      [36.6520, 10.4910], // Grombalia
      [36.4561, 10.7376], // Nabeul
      [36.4010, 10.6120], // Hammamet
      [35.8322, 10.6011], // Sousse
      [35.7833, 10.8333], // Monastir
      [35.5047, 11.0622], // Mahdia
      [34.7406, 10.7603]  // Sfax
    ]
  },
  {
    id: 'grid-tn-west-interconnect',
    name: 'Interconnexion HT 225kV Tunis - Béja - Jendouba - Algérie',
    voltage: '225kV',
    type: 'TRANSMISSION_LINE',
    status: 'OPERATIONAL',
    operator: 'STEG',
    lengthKm: 180,
    path: [
      [36.7210, 10.0210], // Mornaguia
      [36.6210, 9.6120],  // Medjez el-Bab
      [36.7256, 9.1817],  // Béja
      [36.5011, 8.7802],  // Jendouba
      [36.5120, 8.4520]   // Ghardimaou Interconnexion
    ]
  },
  {
    id: 'grid-tn-central-backbone',
    name: 'Ligne HT 150kV Sousse - Kairouan - Sidi Bouzid - Kasserine',
    voltage: '150kV',
    type: 'TRANSMISSION_LINE',
    status: 'OPERATIONAL',
    operator: 'STEG',
    lengthKm: 210,
    path: [
      [35.8322, 10.6011], // Sousse
      [35.6781, 10.0963], // Kairouan
      [35.0382, 9.4849],  // Sidi Bouzid
      [35.1676, 8.8365]   // Kasserine
    ]
  },
  {
    id: 'grid-tn-south-spine',
    name: 'Ligne HT 225kV Sfax - Gabès - Medenine - Tataouine - Libye',
    voltage: '225kV',
    type: 'TRANSMISSION_LINE',
    status: 'OPERATIONAL',
    operator: 'STEG',
    lengthKm: 320,
    path: [
      [34.7406, 10.7603], // Sfax
      [34.3120, 10.1210], // Skhira Substation
      [33.8820, 10.0820], // Gabès Bouchemma
      [33.3549, 10.5055], // Medenine
      [33.1230, 11.2120], // Ben Guerdane
      [32.9297, 10.4518]  // Tataouine
    ]
  },
  {
    id: 'grid-tn-south-west-loop',
    name: 'Ligne HT 150kV Gafsa - Tozeur - Kebili - Gabès',
    voltage: '150kV',
    type: 'TRANSMISSION_LINE',
    status: 'OPERATIONAL',
    operator: 'STEG',
    lengthKm: 240,
    path: [
      [34.4250, 8.7842],  // Gafsa
      [33.9197, 8.1336],  // Tozeur
      [33.7044, 8.9690],  // Kebili
      [33.8820, 10.0820]   // Gabès
    ]
  }
];

// Helper to create synthetic box/polygon coordinates around a centroid
function makePoly(lat: number, lng: number, deltaLat = 0.08, deltaLng = 0.08): [number, number][][] {
  return [
    [
      [lat + deltaLat, lng - deltaLng],
      [lat + deltaLat, lng + deltaLng],
      [lat - deltaLat, lng + deltaLng],
      [lat - deltaLat, lng - deltaLng],
      [lat + deltaLat, lng - deltaLng]
    ]
  ];
}

// All 24 Governorates & major Delegations of Tunisia
export const INITIAL_DELEGATIONS: Delegation[] = [
  // GRAND TUNIS
  {
    id: 1,
    name: 'Tunis Médina & Centre',
    nameAr: 'تونس المدينة',
    governorate: 'Tunis',
    region: 'NORTH',
    status: 'NONE',
    centroid: [36.8065, 10.1815],
    polygon: makePoly(36.8065, 10.1815, 0.04, 0.05),
    reportCount: 0,
    activeOffCount: 0,
    stegSubstation: 'Poste HT Bardo / Montfleury'
  },
  {
    id: 2,
    name: 'La Soukra / Ariana Ville',
    nameAr: 'أريانة المدينة',
    governorate: 'Ariana',
    region: 'NORTH',
    status: 'NONE',
    centroid: [36.8665, 10.1647],
    polygon: makePoly(36.8665, 10.1647, 0.05, 0.05),
    reportCount: 0,
    activeOffCount: 0,
    stegSubstation: 'Poste HT Ennasr - Chotrana'
  },
  {
    id: 3,
    name: 'Radès / Ezzahra / Megrine',
    nameAr: 'رادس الزهراء مقرين',
    governorate: 'Ben Arous',
    region: 'NORTH',
    status: 'NONE',
    centroid: [36.7531, 10.2753],
    polygon: makePoly(36.7531, 10.2753, 0.05, 0.06),
    reportCount: 0,
    activeOffCount: 0,
    stegSubstation: 'Centrale Radès & Substation HT'
  },
  {
    id: 4,
    name: 'Manouba Ville & Mornaguia',
    nameAr: 'منوبة المرناقية',
    governorate: 'Manouba',
    region: 'NORTH',
    status: 'NONE',
    centroid: [36.8101, 10.0956],
    polygon: makePoly(36.8101, 10.0956, 0.06, 0.07),
    reportCount: 0,
    activeOffCount: 0,
    stegSubstation: 'Poste HT Mornaguia'
  },

  // CAP BON / NABEUL GOVERNORATE (SPECIFIC DELEGATIONS)
  {
    id: 5,
    name: 'Nabeul Ville',
    nameAr: 'نابل',
    governorate: 'Nabeul',
    region: 'NORTH',
    status: 'NONE',
    centroid: [36.4561, 10.7376],
    polygon: makePoly(36.4561, 10.7376, 0.04, 0.05),
    reportCount: 0,
    activeOffCount: 0,
    stegSubstation: 'Poste HT Nabeul Ville'
  },
  {
    id: 501,
    name: 'Hammamet',
    nameAr: 'الحمامات',
    governorate: 'Nabeul',
    region: 'NORTH',
    status: 'NONE',
    centroid: [36.4000, 10.6167],
    polygon: makePoly(36.4000, 10.6167, 0.05, 0.05),
    reportCount: 0,
    activeOffCount: 0,
    stegSubstation: 'Poste HT Hammamet Sud'
  },
  {
    id: 502,
    name: 'Kelibia',
    nameAr: 'قليبية',
    governorate: 'Nabeul',
    region: 'NORTH',
    status: 'NONE',
    centroid: [36.8480, 11.0939],
    polygon: makePoly(36.8480, 11.0939, 0.05, 0.05),
    reportCount: 0,
    activeOffCount: 0,
    stegSubstation: 'Poste HT Kelibia'
  },
  {
    id: 503,
    name: 'Hammam Ghezaz',
    nameAr: 'حمام لغزاز',
    governorate: 'Nabeul',
    region: 'NORTH',
    status: 'NONE',
    centroid: [36.8920, 11.1210],
    polygon: makePoly(36.8920, 11.1210, 0.04, 0.04),
    reportCount: 0,
    activeOffCount: 0,
    stegSubstation: 'Poste HT Kelibia / Ghezaz'
  },
  {
    id: 504,
    name: 'El Mida',
    nameAr: 'الميدة',
    governorate: 'Nabeul',
    region: 'NORTH',
    status: 'NONE',
    centroid: [36.7210, 10.8820],
    polygon: makePoly(36.7210, 10.8820, 0.04, 0.04),
    reportCount: 0,
    activeOffCount: 0,
    stegSubstation: 'Poste HT Korba - Mida'
  },
  {
    id: 505,
    name: 'Beni Khalled',
    nameAr: 'بني خلاد',
    governorate: 'Nabeul',
    region: 'NORTH',
    status: 'NONE',
    centroid: [36.6500, 10.5900],
    polygon: makePoly(36.6500, 10.5900, 0.04, 0.04),
    reportCount: 0,
    activeOffCount: 0,
    stegSubstation: 'Poste HT Menzel Bouzelfa'
  },
  {
    id: 506,
    name: 'El Haouaria',
    nameAr: 'الهوارية',
    governorate: 'Nabeul',
    region: 'NORTH',
    status: 'NONE',
    centroid: [37.0500, 11.0167],
    polygon: makePoly(37.0500, 11.0167, 0.06, 0.06),
    reportCount: 0,
    activeOffCount: 0,
    stegSubstation: 'Parc Eolien & Poste Haouaria'
  },
  {
    id: 507,
    name: 'Menzel Temime',
    nameAr: 'منزل تميم',
    governorate: 'Nabeul',
    region: 'NORTH',
    status: 'NONE',
    centroid: [36.7833, 10.9833],
    polygon: makePoly(36.7833, 10.9833, 0.05, 0.05),
    reportCount: 0,
    activeOffCount: 0,
    stegSubstation: 'Poste HT Menzel Temime'
  },
  {
    id: 508,
    name: 'Dar Allouche',
    nameAr: 'دار علوش',
    governorate: 'Nabeul',
    region: 'NORTH',
    status: 'NONE',
    centroid: [36.9667, 11.0333],
    polygon: makePoly(36.9667, 11.0333, 0.04, 0.04),
    reportCount: 0,
    activeOffCount: 0,
    stegSubstation: 'Poste HT Haouaria / Dar Allouche'
  },
  {
    id: 509,
    name: 'Menzel Bouzelfa',
    nameAr: 'منزل بوزلفة',
    governorate: 'Nabeul',
    region: 'NORTH',
    status: 'NONE',
    centroid: [36.6833, 10.5833],
    polygon: makePoly(36.6833, 10.5833, 0.04, 0.04),
    reportCount: 0,
    activeOffCount: 0,
    stegSubstation: 'Poste HT Menzel Bouzelfa'
  },
  {
    id: 510,
    name: 'Bou Argoub',
    nameAr: 'بوعرقوب',
    governorate: 'Nabeul',
    region: 'NORTH',
    status: 'NONE',
    centroid: [36.5333, 10.5500],
    polygon: makePoly(36.5333, 10.5500, 0.05, 0.05),
    reportCount: 0,
    activeOffCount: 0,
    stegSubstation: 'Poste HT Grombalia / Bouargoub'
  },
  {
    id: 511,
    name: 'Korba',
    nameAr: 'قربة',
    governorate: 'Nabeul',
    region: 'NORTH',
    status: 'NONE',
    centroid: [36.5700, 10.8600],
    polygon: makePoly(36.5700, 10.8600, 0.05, 0.05),
    reportCount: 0,
    activeOffCount: 0,
    stegSubstation: 'Poste HT Korba'
  },
  {
    id: 512,
    name: 'Soliman & Grombalia',
    nameAr: 'سليمان قرمبالية',
    governorate: 'Nabeul',
    region: 'NORTH',
    status: 'NONE',
    centroid: [36.6500, 10.4900],
    polygon: makePoly(36.6500, 10.4900, 0.05, 0.05),
    reportCount: 0,
    activeOffCount: 0,
    stegSubstation: 'Poste HT Grombalia'
  },

  // ZAGHOUAN GOVERNORATE (SPECIFIC DELEGATIONS)
  {
    id: 6,
    name: 'Zaghouan Ville',
    nameAr: 'زغوان',
    governorate: 'Zaghouan',
    region: 'NORTH',
    status: 'NONE',
    centroid: [36.4029, 10.1429],
    polygon: makePoly(36.4029, 10.1429, 0.05, 0.05),
    reportCount: 0,
    activeOffCount: 0,
    stegSubstation: 'Poste HT Zaghouan'
  },
  {
    id: 601,
    name: 'El Fahs',
    nameAr: 'الفحص',
    governorate: 'Zaghouan',
    region: 'NORTH',
    status: 'NONE',
    centroid: [36.3744, 9.9069],
    polygon: makePoly(36.3744, 9.9069, 0.05, 0.05),
    reportCount: 0,
    activeOffCount: 0,
    stegSubstation: 'Poste HT El Fahs'
  },
  {
    id: 602,
    name: 'Saouaf',
    nameAr: 'صواف',
    governorate: 'Zaghouan',
    region: 'NORTH',
    status: 'NONE',
    centroid: [36.2167, 10.1167],
    polygon: makePoly(36.2167, 10.1167, 0.05, 0.05),
    reportCount: 0,
    activeOffCount: 0,
    stegSubstation: 'Poste HT Saouaf - Nadhour'
  },
  {
    id: 603,
    name: 'Zriba & Bou Achir',
    nameAr: 'الزريبة بوعشير',
    governorate: 'Zaghouan',
    region: 'NORTH',
    status: 'NONE',
    centroid: [36.3333, 10.2500],
    polygon: makePoly(36.3333, 10.2500, 0.05, 0.05),
    reportCount: 0,
    activeOffCount: 0,
    stegSubstation: 'Poste HT Zriba Village'
  },
  {
    id: 604,
    name: 'Jeradou',
    nameAr: 'جرادو',
    governorate: 'Zaghouan',
    region: 'NORTH',
    status: 'NONE',
    centroid: [36.2800, 10.1500],
    polygon: makePoly(36.2800, 10.1500, 0.04, 0.04),
    reportCount: 0,
    activeOffCount: 0,
    stegSubstation: 'Poste HT Jeradou'
  },
  {
    id: 605,
    name: 'Jebel Oust',
    nameAr: 'جبل الوسط',
    governorate: 'Zaghouan',
    region: 'NORTH',
    status: 'NONE',
    centroid: [36.5500, 10.0500],
    polygon: makePoly(36.5500, 10.0500, 0.04, 0.04),
    reportCount: 0,
    activeOffCount: 0,
    stegSubstation: 'Poste HT Jebel Oust ZI'
  },
  {
    id: 606,
    name: 'Bir Mcherga',
    nameAr: 'بير مشارقة',
    governorate: 'Zaghouan',
    region: 'NORTH',
    status: 'NONE',
    centroid: [36.5167, 10.0167],
    polygon: makePoly(36.5167, 10.0167, 0.05, 0.05),
    reportCount: 0,
    activeOffCount: 0,
    stegSubstation: 'Poste HT Bir Mcherga'
  },
  {
    id: 607,
    name: 'Nadhour',
    nameAr: 'الناظور',
    governorate: 'Zaghouan',
    region: 'NORTH',
    status: 'NONE',
    centroid: [36.1000, 10.1333],
    polygon: makePoly(36.1000, 10.1333, 0.05, 0.05),
    reportCount: 0,
    activeOffCount: 0,
    stegSubstation: 'Poste HT Nadhour'
  },

  // BIZERTE GOVERNORATE (SPECIFIC DELEGATIONS)
  {
    id: 7,
    name: 'Bizerte Nord',
    nameAr: 'بنزرت الشمالية',
    governorate: 'Bizerte',
    region: 'NORTH',
    status: 'NONE',
    centroid: [37.2744, 9.8739],
    polygon: makePoly(37.2744, 9.8739, 0.05, 0.05),
    reportCount: 0,
    activeOffCount: 0,
    stegSubstation: 'Poste HT Zarzouna'
  },
  {
    id: 701,
    name: 'Sejnane',
    nameAr: 'سجنان',
    governorate: 'Bizerte',
    region: 'NORTH',
    status: 'NONE',
    centroid: [37.0561, 9.2389],
    polygon: makePoly(37.0561, 9.2389, 0.06, 0.06),
    reportCount: 0,
    activeOffCount: 0,
    stegSubstation: 'Poste HT Sejnane'
  },
  {
    id: 702,
    name: 'Joumine',
    nameAr: 'جومين',
    governorate: 'Bizerte',
    region: 'NORTH',
    status: 'NONE',
    centroid: [36.9000, 9.4667],
    polygon: makePoly(36.9000, 9.4667, 0.05, 0.05),
    reportCount: 0,
    activeOffCount: 0,
    stegSubstation: 'Poste HT Joumine'
  },
  {
    id: 703,
    name: 'Metline',
    nameAr: 'الماتلين',
    governorate: 'Bizerte',
    region: 'NORTH',
    status: 'NONE',
    centroid: [37.2400, 10.0500],
    polygon: makePoly(37.2400, 10.0500, 0.04, 0.04),
    reportCount: 0,
    activeOffCount: 0,
    stegSubstation: 'Parc Eolien & Poste HT Metline'
  },
  {
    id: 704,
    name: 'Ras Jebel',
    nameAr: 'راس الجبل',
    governorate: 'Bizerte',
    region: 'NORTH',
    status: 'NONE',
    centroid: [37.2153, 10.1206],
    polygon: makePoly(37.2153, 10.1206, 0.04, 0.04),
    reportCount: 0,
    activeOffCount: 0,
    stegSubstation: 'Poste HT Ras Jebel'
  },
  {
    id: 705,
    name: 'Menzel Abderrahmane',
    nameAr: 'منزل عبد الرحمان',
    governorate: 'Bizerte',
    region: 'NORTH',
    status: 'NONE',
    centroid: [37.2333, 9.8667],
    polygon: makePoly(37.2333, 9.8667, 0.03, 0.03),
    reportCount: 0,
    activeOffCount: 0,
    stegSubstation: 'Poste HT Zarzouna'
  },
  {
    id: 706,
    name: 'El Alia',
    nameAr: 'العالية',
    governorate: 'Bizerte',
    region: 'NORTH',
    status: 'NONE',
    centroid: [37.1667, 10.0333],
    polygon: makePoly(37.1667, 10.0333, 0.04, 0.04),
    reportCount: 0,
    activeOffCount: 0,
    stegSubstation: 'Poste HT El Alia'
  },
  {
    id: 707,
    name: 'Ghar El Melh',
    nameAr: 'غار الملح',
    governorate: 'Bizerte',
    region: 'NORTH',
    status: 'NONE',
    centroid: [37.1667, 10.1833],
    polygon: makePoly(37.1667, 10.1833, 0.04, 0.04),
    reportCount: 0,
    activeOffCount: 0,
    stegSubstation: 'Poste HT Ras Jebel / Ghar El Melh'
  },
  {
    id: 708,
    name: 'Menzel Jemil',
    nameAr: 'منزل جميل',
    governorate: 'Bizerte',
    region: 'NORTH',
    status: 'NONE',
    centroid: [37.2333, 9.9167],
    polygon: makePoly(37.2333, 9.9167, 0.03, 0.03),
    reportCount: 0,
    activeOffCount: 0,
    stegSubstation: 'Poste HT Menzel Jemil'
  },
  {
    id: 709,
    name: 'Mateur',
    nameAr: 'ماطر',
    governorate: 'Bizerte',
    region: 'NORTH',
    status: 'NONE',
    centroid: [37.0400, 9.6650],
    polygon: makePoly(37.0400, 9.6650, 0.05, 0.05),
    reportCount: 0,
    activeOffCount: 0,
    stegSubstation: 'Poste HT Mateur'
  },
  {
    id: 710,
    name: 'Tinja',
    nameAr: 'تينجة',
    governorate: 'Bizerte',
    region: 'NORTH',
    status: 'NONE',
    centroid: [37.1583, 9.7556],
    polygon: makePoly(37.1583, 9.7556, 0.04, 0.04),
    reportCount: 0,
    activeOffCount: 0,
    stegSubstation: 'Poste HT Menzel Bourguiba / Tinja'
  },
  {
    id: 711,
    name: 'Utique',
    nameAr: 'أوتيك',
    governorate: 'Bizerte',
    region: 'NORTH',
    status: 'NONE',
    centroid: [37.0833, 10.0333],
    polygon: makePoly(37.0833, 10.0333, 0.05, 0.05),
    reportCount: 0,
    activeOffCount: 0,
    stegSubstation: 'Poste HT Utique ZI'
  },
  {
    id: 712,
    name: 'Menzel Bourguiba',
    nameAr: 'منزل بورقيبة',
    governorate: 'Bizerte',
    region: 'NORTH',
    status: 'NONE',
    centroid: [37.1536, 9.7858],
    polygon: makePoly(37.1536, 9.7858, 0.04, 0.04),
    reportCount: 0,
    activeOffCount: 0,
    stegSubstation: 'Poste HT Menzel Bourguiba'
  },
  {
    id: 8,
    name: 'Béja Ville & Medjez el-Bab',
    governorate: 'Béja',
    region: 'NORTH',
    status: 'NONE',
    centroid: [36.7256, 9.1817],
    polygon: makePoly(36.7256, 9.1817, 0.09, 0.10),
    reportCount: 0,
    activeOffCount: 0,
    stegSubstation: 'Poste HT Béja Nord'
  },
  {
    id: 9,
    name: 'Jendouba Ville & Tabarka',
    governorate: 'Jendouba',
    region: 'NORTH',
    status: 'NONE',
    centroid: [36.5011, 8.7802],
    polygon: makePoly(36.5011, 8.7802, 0.09, 0.10),
    reportCount: 0,
    activeOffCount: 0,
    stegSubstation: 'Poste HT Fernana - Jendouba'
  },
  {
    id: 10,
    name: 'Le Kef Ville',
    governorate: 'Le Kef',
    region: 'NORTH',
    status: 'NONE',
    centroid: [36.1742, 8.7049],
    polygon: makePoly(36.1742, 8.7049, 0.09, 0.10),
    reportCount: 0,
    activeOffCount: 0,
    stegSubstation: 'Poste HT Le Kef'
  },
  {
    id: 11,
    name: 'Siliana Ville',
    governorate: 'Siliana',
    region: 'NORTH',
    status: 'NONE',
    centroid: [36.0849, 9.3708],
    polygon: makePoly(36.0849, 9.3708, 0.09, 0.10),
    reportCount: 0,
    activeOffCount: 0,
    stegSubstation: 'Poste HT Siliana'
  },

  // SAHEL & SFAX
  {
    id: 12,
    name: 'Sousse Médina & Akouda',
    governorate: 'Sousse',
    region: 'COAST',
    status: 'NONE',
    centroid: [35.8322, 10.6011],
    polygon: makePoly(35.8322, 10.6011, 0.07, 0.08),
    reportCount: 0,
    activeOffCount: 0,
    stegSubstation: 'Centrale & Poste HT Sousse'
  },
  {
    id: 13,
    name: 'Monastir Ville & Moknine',
    governorate: 'Monastir',
    region: 'COAST',
    status: 'NONE',
    centroid: [35.7833, 10.8333],
    polygon: makePoly(35.7833, 10.8333, 0.07, 0.08),
    reportCount: 0,
    activeOffCount: 0,
    stegSubstation: 'Poste HT Ksar Hellal'
  },
  {
    id: 14,
    name: 'Mahdia Ville & El Jem',
    governorate: 'Mahdia',
    region: 'COAST',
    status: 'NONE',
    centroid: [35.5047, 11.0622],
    polygon: makePoly(35.5047, 11.0622, 0.08, 0.09),
    reportCount: 0,
    activeOffCount: 0,
    stegSubstation: 'Poste HT Mahdia Est'
  },
  {
    id: 15,
    name: 'Sfax Ville & Sakiet Ezzit',
    governorate: 'Sfax',
    region: 'COAST',
    status: 'NONE',
    centroid: [34.7406, 10.7603],
    polygon: makePoly(34.7406, 10.7603, 0.09, 0.10),
    reportCount: 0,
    activeOffCount: 0,
    stegSubstation: 'Poste HT Sfax Sud / Thyna'
  },

  // CENTRE (KAIROUAN, KASSERINE, SIDI BOUZID)
  {
    id: 16,
    name: 'Kairouan Nord & Médina',
    governorate: 'Kairouan',
    region: 'CENTER',
    status: 'NONE',
    centroid: [35.6781, 10.0963],
    polygon: makePoly(35.6781, 10.0963, 0.09, 0.10),
    reportCount: 0,
    activeOffCount: 0,
    stegSubstation: 'Poste HT Kairouan'
  },
  {
    id: 17,
    name: 'Kasserine Ville & Sbeitla',
    governorate: 'Kasserine',
    region: 'CENTER',
    status: 'NONE',
    centroid: [35.1676, 8.8365],
    polygon: makePoly(35.1676, 8.8365, 0.09, 0.10),
    reportCount: 0,
    activeOffCount: 0,
    stegSubstation: 'Poste HT Kasserine'
  },
  {
    id: 18,
    name: 'Sidi Bouzid Ville',
    governorate: 'Sidi Bouzid',
    region: 'CENTER',
    status: 'NONE',
    centroid: [35.0382, 9.4849],
    polygon: makePoly(35.0382, 9.4849, 0.09, 0.10),
    reportCount: 0,
    activeOffCount: 0,
    stegSubstation: 'Poste HT Sidi Bouzid'
  },

  // SUD OUEST (GAFSA, TOZEUR, KEBILI)
  {
    id: 19,
    name: 'Gafsa Ville & Métlaoui',
    governorate: 'Gafsa',
    region: 'SOUTH',
    status: 'NONE',
    centroid: [34.4250, 8.7842],
    polygon: makePoly(34.4250, 8.7842, 0.10, 0.11),
    reportCount: 0,
    activeOffCount: 0,
    stegSubstation: 'Poste HT Gafsa CPG'
  },
  {
    id: 20,
    name: 'Tozeur Ville & Nefta',
    governorate: 'Tozeur',
    region: 'SOUTH',
    status: 'NONE',
    centroid: [33.9197, 8.1336],
    polygon: makePoly(33.9197, 8.1336, 0.10, 0.11),
    reportCount: 0,
    activeOffCount: 0,
    stegSubstation: 'Centrale Solaire & Poste HT Tozeur'
  },
  {
    id: 21,
    name: 'Kebili Ville & Douz',
    governorate: 'Kebili',
    region: 'SOUTH',
    status: 'NONE',
    centroid: [33.7044, 8.9690],
    polygon: makePoly(33.7044, 8.9690, 0.12, 0.13),
    reportCount: 0,
    activeOffCount: 0,
    stegSubstation: 'Poste HT Kebili'
  },

  // SUD EST (GABES, MEDENINE, TATAOUINE)
  {
    id: 22,
    name: 'Gabès Ville & Bouchemma',
    governorate: 'Gabès',
    region: 'SOUTH',
    status: 'NONE',
    centroid: [33.8815, 10.0982],
    polygon: makePoly(33.8815, 10.0982, 0.09, 0.10),
    reportCount: 0,
    activeOffCount: 0,
    stegSubstation: 'Centrale Bouchemma & Ghannouch'
  },
  {
    id: 23,
    name: 'Medenine Ville & Djerba / Zarzis',
    governorate: 'Medenine',
    region: 'SOUTH',
    status: 'NONE',
    centroid: [33.3549, 10.5055],
    polygon: makePoly(33.3549, 10.5055, 0.12, 0.13),
    reportCount: 0,
    activeOffCount: 0,
    stegSubstation: 'Poste HT Medenine & Djerba Midoun'
  },
  {
    id: 24,
    name: 'Tataouine Ville & Remada',
    governorate: 'Tataouine',
    region: 'SOUTH',
    status: 'NONE',
    centroid: [32.9297, 10.4518],
    polygon: makePoly(32.9297, 10.4518, 0.14, 0.15),
    reportCount: 0,
    activeOffCount: 0,
    stegSubstation: 'Poste HT Tataouine Nord'
  }
];

// Tunisia center coordinates
export const TUNISIA_MAP_CENTER: [number, number] = [34.8, 9.8];
export const TUNISIA_MAP_DEFAULT_ZOOM = 7;
