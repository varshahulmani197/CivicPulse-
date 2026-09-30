import { CategoryType, LocationCoordinates, SeverityType, Ticket } from '../types';

/**
 * Calculates distance in meters between two lat/lng points using Haversine formula
 */
export function calculateDistanceMeters(
  coord1: LocationCoordinates,
  coord2: LocationCoordinates
): number {
  const R = 6371e3; // Earth radius in metres
  const phi1 = (coord1.lat * Math.PI) / 180;
  const phi2 = (coord2.lat * Math.PI) / 180;
  const deltaPhi = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const deltaLambda = ((coord2.lng - coord1.lng) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

const HIGH_RISK_KEYWORDS = [
  'accident',
  'urgent',
  'hospital',
  'school',
  'children',
  'deadly',
  'crater',
  'live wire',
  'sparking',
  'electrocution',
  'drowning',
  'submerged',
  'open manhole',
  'missing slab',
  'burst',
  'gushing',
  'fatal',
  'blind spot',
  'emergency',
  'skid',
  'junction',
  'traffic signal',
];

const MEDIUM_RISK_KEYWORDS = [
  'pedestrian',
  'sidewalk',
  'dark',
  'waterlog',
  'garbage',
  'stench',
  'leak',
  'pothole',
  'delay',
  'broken',
  'overflowing',
  'choked',
];

export interface TriageResult {
  severity: SeverityType;
  severityReason: string;
  isDuplicate: boolean;
  duplicateMasterTicket?: Ticket;
  distanceMeters?: number;
  confidenceScore: number;
}

/**
 * Automated Severity Scoring Engine
 * Computes severity based on proximity risks, hazard keywords, and location context.
 */
export function computeAutomatedSeverity(
  title: string,
  description: string,
  proximityRisks: string[],
  category: CategoryType
): { severity: SeverityType; reason: string } {
  const combinedText = `${title} ${description}`.toLowerCase();
  
  const highHits = HIGH_RISK_KEYWORDS.filter((k) => combinedText.includes(k));
  const mediumHits = MEDIUM_RISK_KEYWORDS.filter((k) => combinedText.includes(k));

  const hasCriticalProximity = proximityRisks.some((r) =>
    ['Near School / College', 'Near Hospital / Clinic', 'Major Traffic Junction'].includes(r)
  );
  const hasPedestrianOrFlood = proximityRisks.some((r) =>
    ['Pedestrian Walkway', 'Flooding Risk'].includes(r)
  );

  // Severe rules: Open drains/manholes are naturally elevated to High or Medium
  if (category === 'open_drain' || hasCriticalProximity || highHits.length >= 2) {
    const reasons: string[] = [];
    if (hasCriticalProximity) {
      const matched = proximityRisks.filter((r) =>
        ['Near School / College', 'Near Hospital / Clinic', 'Major Traffic Junction'].includes(r)
      );
      reasons.push(`Proximity hazard: ${matched.join(', ')}`);
    }
    if (highHits.length > 0) {
      reasons.push(`High-risk indicators: [${highHits.slice(0, 3).join(', ')}]`);
    }
    if (category === 'open_drain') {
      reasons.push('Uncovered drain/manhole presents acute physical fall hazard');
    }

    return {
      severity: 'High',
      reason: reasons.join(' • ') || 'Critical safety factor detected by AI triage engine',
    };
  }

  if (hasPedestrianOrFlood || mediumHits.length >= 2 || highHits.length === 1) {
    const reasons: string[] = [];
    if (hasPedestrianOrFlood) {
      reasons.push(`Urban vulnerability zone: ${proximityRisks.join(', ')}`);
    }
    if (mediumHits.length > 0) {
      reasons.push(`Environmental disruption signals: [${mediumHits.slice(0, 3).join(', ')}]`);
    }

    return {
      severity: 'Medium',
      reason: reasons.join(' • ') || 'Moderate civic impact identified',
    };
  }

  return {
    severity: 'Low',
    reason: 'Standard maintenance priority queue based on initial keyword analysis',
  };
}

/**
 * AI Deduplication Scanner:
 * Scans existing tickets for proximity (< 350 meters) and category match.
 */
export function checkDuplicateReport(
  newCoords: LocationCoordinates,
  newCategory: CategoryType,
  newTitle: string,
  existingTickets: Ticket[]
): { isDuplicate: boolean; masterTicket?: Ticket; distanceMeters?: number; similarityPercent: number } {
  // Only check open/unresolved tickets of the same category
  const activeSameCategory = existingTickets.filter(
    (t) => t.category === newCategory && t.status !== 'Resolved'
  );

  for (const ticket of activeSameCategory) {
    const dist = calculateDistanceMeters(newCoords, ticket.coordinates);
    // If within 350 meters
    if (dist <= 350) {
      // Calculate simple token similarity
      const tokens1 = new Set(newTitle.toLowerCase().split(/\W+/).filter(Boolean));
      const tokens2 = new Set(ticket.title.toLowerCase().split(/\W+/).filter(Boolean));
      let intersection = 0;
      tokens1.forEach((tok) => {
        if (tokens2.has(tok)) intersection++;
      });
      const similarity = Math.round((intersection / Math.max(tokens1.size, tokens2.size)) * 100);

      // Distance score: closer means higher deduplication confidence
      const distanceFactor = Math.max(0, 100 - (dist / 350) * 50);
      const compositeScore = Math.round(similarity * 0.4 + distanceFactor * 0.6);

      if (compositeScore >= 45 || dist < 120) {
        return {
          isDuplicate: true,
          masterTicket: ticket,
          distanceMeters: dist,
          similarityPercent: compositeScore,
        };
      }
    }
  }

  return {
    isDuplicate: false,
    similarityPercent: 0,
  };
}

const STORAGE_KEY = 'civicpulse_blr_tickets_v1';

export function loadSavedTickets(defaultTickets: Ticket[]): Ticket[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultTickets));
      return defaultTickets;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultTickets;
  } catch {
    return defaultTickets;
  }
}

export function saveTickets(tickets: Ticket[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
}
