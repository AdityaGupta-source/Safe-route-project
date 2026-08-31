// Pure-function safety scoring: no React, so it stays unit-testable and reusable
// server-side later. See docs/ROADMAP.md §1.3 for the design this implements.

import lineChunk from '@turf/line-chunk';
import pointToLineDistance from '@turf/point-to-line-distance';
import { lineString, point as turfPoint } from '@turf/helpers';

const SEGMENT_LENGTH_KM = 0.1; // ~100m chunks
const HAZARD_RADIUS_KM = 0.03; // 30m
const SAFE_POINT_RADIUS_KM = 0.15; // 150m
const SAFE_POINT_BONUS_CAP = 30;
const BASE_WEIGHT = 1;
const TICKED_BOOST = 3;
const WORST_SEGMENT_SHARE = 0.3; // a route is only as safe as its worst block

// OSM `lit` tag coverage in Delhi NCR is ~1% (see docs/ROADMAP.md §Step 0) - when a
// tagged way IS near the segment it's an authoritative signal, so it gets most of the
// weight; street_lamp node density is a denser but weaker proxy for the ~99% of streets
// with no explicit tag.
const LIT_WAY_RADIUS_KM = 0.02; // 20m - route should closely hug the matching way
const LAMP_RADIUS_KM = 0.04; // 40m
const LIT_WAY_SHARE = 0.7;
const LAMP_DENSITY_SHARE = 0.3;
const LIGHTING_SCALE = 0.4; // adjustment range roughly ±20, alongside hazard/safe terms

/**
 * Every hazard type always counts, so a route is never sent past an unticked hazard
 * as if it weren't there - ticking a type just makes it weigh more (roadmap §3.1).
 */
export function buildHazardWeights(allTypes, tickedTypes) {
  const raw = {};
  allTypes.forEach((type) => {
    raw[type] = BASE_WEIGHT + (tickedTypes.includes(type) ? TICKED_BOOST : 0);
  });

  const total = Object.values(raw).reduce((sum, w) => sum + w, 0);
  const normalized = {};
  Object.entries(raw).forEach(([type, w]) => {
    normalized[type] = w / total;
  });
  return normalized;
}

const toLngLat = ([lat, lng]) => [lng, lat];

const EMPTY_LIGHTING = { litWays: [], lampNodes: [] };

/** Hazards within scoring distance of the route - the same set that dented its score,
 * so a route's popup never lists a hazard that had no bearing on its number. */
export function hazardsNearRoute(routeCoords, hazards) {
  if (routeCoords.length < 2) return [];
  const line = lineString(routeCoords.map(toLngLat));
  return hazards.filter(
    (hazard) => pointToLineDistance(turfPoint([hazard.lng, hazard.lat]), line, { units: 'kilometers' }) <= HAZARD_RADIUS_KM,
  );
}

/** Safe points within scoring distance of the route, mirroring hazardsNearRoute. */
export function safePointsNearRoute(routeCoords, safePoints) {
  if (routeCoords.length < 2) return [];
  const line = lineString(routeCoords.map(toLngLat));
  return safePoints.filter(
    (point) => pointToLineDistance(turfPoint([point.lng, point.lat]), line, { units: 'kilometers' }) <= SAFE_POINT_RADIUS_KM,
  );
}

/**
 * Scores a walking route 0-100 from nearby hazards (penalty, scaled by the user's
 * weights), nearby safe points (small bonus), and lighting where data exists (bonus for
 * lit, penalty for confirmed-unlit; segments with no lighting data at all are left
 * untouched rather than guessed at). Returns the overall score plus a breakdown so the
 * UI can explain *why* - a bare number doesn't build trust.
 */
export function scoreRoute(routeCoords, { hazards, safePoints, weights, lighting = EMPTY_LIGHTING }) {
  if (routeCoords.length < 2) {
    return {
      score: 100,
      breakdown: { hazardsNearby: 0, safePointsNearby: 0, litSegments: 0, segmentCount: 0, worstSegmentScore: 100 },
    };
  }

  const line = lineString(routeCoords.map(toLngLat));
  const segments = lineChunk(line, SEGMENT_LENGTH_KM, { units: 'kilometers' }).features;

  const litWayLines = lighting.litWays
    .filter((way) => way.coords.length >= 2)
    .map((way) => ({ lit: way.lit, line: lineString(way.coords.map(toLngLat)) }));

  let hazardHits = 0;
  let safeHits = 0;
  let litHits = 0;

  const segmentScores = segments.map((segment) => {
    let penalty = 0;
    hazards.forEach((hazard) => {
      const dist = pointToLineDistance(turfPoint([hazard.lng, hazard.lat]), segment, { units: 'kilometers' });
      if (dist <= HAZARD_RADIUS_KM) {
        const weight = weights[hazard.type] ?? BASE_WEIGHT;
        const proximity = 1 - dist / HAZARD_RADIUS_KM;
        penalty += weight * proximity * 100;
        hazardHits += 1;
      }
    });

    let bonus = 0;
    safePoints.forEach((safePoint) => {
      const dist = pointToLineDistance(turfPoint([safePoint.lng, safePoint.lat]), segment, { units: 'kilometers' });
      if (dist <= SAFE_POINT_RADIUS_KM) {
        bonus += (1 - dist / SAFE_POINT_RADIUS_KM) * 15;
        safeHits += 1;
      }
    });

    // Lighting: an explicit lit/unlit way nearby is authoritative when present; lamp
    // density is a softer, denser fallback signal. No signal at all -> no adjustment.
    const midpoint = turfPoint(segment.geometry.coordinates[Math.floor(segment.geometry.coordinates.length / 2)]);

    let litWayScore = null;
    let nearestWayDist = Infinity;
    litWayLines.forEach(({ lit, line: wayLine }) => {
      const dist = pointToLineDistance(midpoint, wayLine, { units: 'kilometers' });
      if (dist <= LIT_WAY_RADIUS_KM && dist < nearestWayDist) {
        nearestWayDist = dist;
        litWayScore = lit ? 100 : 0;
      }
    });

    let lampScore = 0;
    lighting.lampNodes.forEach((lamp) => {
      const dist = pointToLineDistance(turfPoint([lamp.lng, lamp.lat]), segment, { units: 'kilometers' });
      if (dist <= LAMP_RADIUS_KM) lampScore += (1 - dist / LAMP_RADIUS_KM) * 100;
    });
    lampScore = Math.min(100, lampScore);

    let combinedLight = null;
    if (litWayScore !== null) {
      combinedLight = LIT_WAY_SHARE * litWayScore + LAMP_DENSITY_SHARE * lampScore;
      litHits += 1;
    } else if (lampScore > 0) {
      combinedLight = lampScore;
      litHits += 1;
    }
    const lightingAdjustment = combinedLight !== null ? (combinedLight - 50) * LIGHTING_SCALE : 0;

    return Math.max(0, Math.min(100, 100 - penalty + Math.min(bonus, SAFE_POINT_BONUS_CAP) + lightingAdjustment));
  });

  const meanScore = segmentScores.reduce((a, b) => a + b, 0) / segmentScores.length;
  const worstScore = Math.min(...segmentScores);
  const score = Math.round((1 - WORST_SEGMENT_SHARE) * meanScore + WORST_SEGMENT_SHARE * worstScore);

  return {
    score,
    breakdown: {
      hazardsNearby: hazardHits,
      safePointsNearby: safeHits,
      litSegments: litHits,
      segmentCount: segments.length,
      worstSegmentScore: Math.round(worstScore),
    },
  };
}
