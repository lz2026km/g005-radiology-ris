import type { PatientRecord, MatchCandidate, MatchResult, MatchConfig } from './types';

const DEFAULT_MATCH_CONFIG: MatchConfig = {
  exactMatchFields: ['name', 'dateOfBirth', 'gender', 'phone', 'nationalId'],
  probabilisticFields: ['name', 'dateOfBirth', 'gender', 'phone'],
  thresholdExact: 100,
  thresholdProbabilistic: 80,
  thresholdPossible: 50,
  blockingKeys: ['name', 'dateOfBirth', 'phone'],
  weightName: 35,
  weightDob: 30,
  weightGender: 10,
  weightPhone: 25,
  weightId: 0,
};

let matchConfig: MatchConfig = { ...DEFAULT_MATCH_CONFIG };

export function getMatchConfig(): MatchConfig {
  return { ...matchConfig };
}

export function setMatchConfig(config: Partial<MatchConfig>): void {
  matchConfig = { ...matchConfig, ...config };
}

function normalizeName(name: string): string {
  return name.replace(/\s+/g, '').toLowerCase();
}

function jaroWinkler(s1: string, s2: string): number {
  const a = normalizeName(s1);
  const b = normalizeName(s2);
  if (a === b) return 1;
  const len = Math.max(a.length, b.length);
  if (len === 0) return 1;
  let matches = 0;
  const matchDist = Math.floor(Math.max(a.length, b.length) / 2) - 1;
  const aMatch = new Array(a.length).fill(false);
  const bMatch = new Array(b.length).fill(false);
  for (let i = 0; i < a.length; i++) {
    const start = Math.max(0, i - matchDist);
    const end = Math.min(b.length, i + matchDist + 1);
    for (let j = start; j < end; j++) {
      if (bMatch[j] || a[i] !== b[j]) continue;
      aMatch[i] = true;
      bMatch[j] = true;
      matches++;
      break;
    }
  }
  if (matches === 0) return 0;
  let transpositions = 0;
  let k = 0;
  for (let i = 0; i < a.length; i++) {
    if (!aMatch[i]) continue;
    while (!bMatch[k]) k++;
    if (a[i] !== b[k]) transpositions++;
    k++;
  }
  const m = matches;
  const jaro = (m / a.length + m / b.length + (m - transpositions / 2) / m) / 3;
  const prefix = (() => { let p = 0; while (p < Math.min(4, a.length, b.length) && a[p] === b[p]) p++; return p; })();
  return jaro + prefix * 0.1 * (1 - jaro);
}

function compareDob(dob1: string | undefined, dob2: string | undefined): number {
  if (!dob1 || !dob2) return 0;
  return dob1 === dob2 ? 1 : 0;
}

function compareGender(g1: string | undefined, g2: string | undefined): number {
  if (!g1 || !g2) return 0;
  return g1[0] === g2[0] ? 1 : 0;
}

function comparePhone(p1: string | undefined, p2: string | undefined): number {
  if (!p1 || !p2) return 0;
  const digits1 = p1.replace(/\D/g, '');
  const digits2 = p2.replace(/\D/g, '');
  if (digits1.length < 7 || digits2.length < 7) return 0;
  return digits1.slice(-8) === digits2.slice(-8) ? 1 : 0;
}

export function calculateMatchScore(record1: PatientRecord, record2: PatientRecord, config: MatchConfig = matchConfig): number {
  let score = 0;
  const breakdown: Record<string, number> = {};

  const nameScore = jaroWinkler(record1.name, record2.name) * config.weightName;
  score += nameScore;
  breakdown.name = nameScore;

  const dobScore = compareDob(record1.dateOfBirth, record2.dateOfBirth) * config.weightDob;
  score += dobScore;
  breakdown.dob = dobScore;

  const genderScore = compareGender(record1.gender, record2.gender) * config.weightGender;
  score += genderScore;
  breakdown.gender = genderScore;

  const phoneScore = comparePhone(record1.phone, record2.phone) * config.weightPhone;
  score += phoneScore;
  breakdown.phone = phoneScore;

  return score;
}

export function findMatches(candidates: PatientRecord[], query: PatientRecord, config: MatchConfig = matchConfig): MatchResult {
  const scoredCandidates: MatchCandidate[] = candidates
    .filter(c => c.id !== query.id)
    .map(c => {
      const score = calculateMatchScore(query, c, config);
      const matchedFields: string[] = [];
      const scoreBreakdown: Record<string, number> = {};
      if (jaroWinkler(query.name, c.name) > 0.9) { matchedFields.push('name'); scoreBreakdown.name = jaroWinkler(query.name, c.name) * config.weightName; }
      if (query.dateOfBirth && c.dateOfBirth && query.dateOfBirth === c.dateOfBirth) { matchedFields.push('dateOfBirth'); scoreBreakdown.dob = config.weightDob; }
      if (query.gender && c.gender && query.gender[0] === c.gender[0]) { matchedFields.push('gender'); scoreBreakdown.gender = config.weightGender; }
      return { record: c, score, matchedFields, scoreBreakdown };
    })
    .sort((a, b) => b.score - a.score);

  if (scoredCandidates.length > 0 && scoredCandidates[0].score >= config.thresholdExact) {
    return { primaryRecord: query, candidates: scoredCandidates.slice(0, 5), threshold: config.thresholdExact, matchType: 'exact', consensus: true };
  }

  const aboveProbabilistic = scoredCandidates.filter(c => c.score >= config.thresholdProbabilistic);
  if (aboveProbabilistic.length > 0) {
    return { primaryRecord: query, candidates: aboveProbabilistic.slice(0, 5), threshold: config.thresholdProbabilistic, matchType: 'probabilistic', consensus: aboveProbabilistic.length === 1 };
  }

  const abovePossible = scoredCandidates.filter(c => c.score >= config.thresholdPossible);
  return { primaryRecord: query, candidates: abovePossible.slice(0, 5), threshold: config.thresholdPossible, matchType: 'none', consensus: false };
}
