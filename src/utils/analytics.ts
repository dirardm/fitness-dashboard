import { WorkoutData, SleepData } from '../types';

export function pearsonCorrelation(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length);
  if (n < 3) return 0;
  const xs = x.slice(0, n);
  const ys = y.slice(0, n);
  const xMean = xs.reduce((a, b) => a + b, 0) / n;
  const yMean = ys.reduce((a, b) => a + b, 0) / n;
  const num = xs.reduce((sum, xi, i) => sum + (xi - xMean) * (ys[i] - yMean), 0);
  const denom = Math.sqrt(
    xs.reduce((sum, xi) => sum + (xi - xMean) ** 2, 0) *
    ys.reduce((sum, yi) => sum + (yi - yMean) ** 2, 0)
  );
  return denom === 0 ? 0 : num / denom;
}

export interface CorrelationMatrix {
  labels: string[];
  matrix: number[][];
}

export function computeCorrelationMatrix(
  workoutData: WorkoutData[],
  sleepData: SleepData[]
): CorrelationMatrix {
  const wByDate: Record<string, WorkoutData> = {};
  workoutData.forEach(w => { if (w.Date) wByDate[w.Date] = w; });

  const sByDate: Record<string, SleepData> = {};
  sleepData.forEach(s => { if (s['Night from']) sByDate[s['Night from']] = s; });

  const commonDates = Object.keys(wByDate).filter(d => sByDate[d]);

  if (commonDates.length < 3) {
    return { labels: [], matrix: [] };
  }

  const metrics: Record<string, number[]> = {
    'Calories': commonDates.map(d => wByDate[d].Calories || 0),
    'Avg HR': commonDates.map(d => wByDate[d]['Avg HR'] || 0),
    'Sleep hrs': commonDates.map(d => (sByDate[d]['Total sleep time (min)'] || 0) / 60),
    'Deep hrs': commonDates.map(d => (sByDate[d]['Deep sleep (min)'] || 0) / 60),
    'HRV': commonDates.map(d => sByDate[d]['avg HR Variability'] || 0),
    'Rest HR': commonDates.map(d => sByDate[d]['avg HR'] || 0),
  };

  const labels = Object.keys(metrics);
  const values = Object.values(metrics);
  const n = labels.length;

  const matrix = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => pearsonCorrelation(values[i], values[j]))
  );

  return { labels, matrix };
}

export interface ACWRPoint {
  date: string;
  acwr: number;
  acute: number;
  chronic: number;
}

function parseWorkoutDate(dateStr: string): number {
  try {
    const [d, m, y] = dateStr.split('/').map(Number);
    return new Date(y, m - 1, d).getTime();
  } catch { return 0; }
}

export function calculateACWR(workoutData: WorkoutData[]): ACWRPoint[] {
  const validData = workoutData.filter(w => w.Date && typeof w.Date === 'string');
  if (validData.length < 14) return [];

  const loadByDate: Record<string, number> = {};
  validData.forEach(w => {
    loadByDate[w.Date] = (loadByDate[w.Date] || 0) + (w.Calories || 0);
  });

  const allDates = Object.keys(loadByDate).sort((a, b) => parseWorkoutDate(a) - parseWorkoutDate(b));

  if (allDates.length < 14) return [];

  const results: ACWRPoint[] = [];

  for (let i = 6; i < allDates.length; i++) {
    const acuteWindow = allDates.slice(Math.max(0, i - 6), i + 1);
    const chronicStart = Math.max(0, i - 27);
    const chronicWindow = allDates.slice(chronicStart, i + 1);

    const acute = acuteWindow.reduce((s, d) => s + (loadByDate[d] || 0), 0);
    const chronicAvg = chronicWindow.reduce((s, d) => s + (loadByDate[d] || 0), 0) / 4;

    const acwr = chronicAvg > 0 ? acute / chronicAvg : 0;

    results.push({
      date: allDates[i],
      acwr: Math.round(acwr * 100) / 100,
      acute: Math.round(acute),
      chronic: Math.round(chronicAvg),
    });
  }

  return results;
}

export interface PersonalRecord {
  metric: string;
  value: number;
  date: string;
  unit: string;
  formatted: string;
}

export function findPersonalRecords(workoutData: WorkoutData[]): PersonalRecord[] {
  const validData = workoutData.filter(w => w.Date && typeof w.Date === 'string');
  if (validData.length === 0) return [];

  const records: PersonalRecord[] = [];

  const maxCal = validData.reduce((best, w) => (w.Calories || 0) > (best.Calories || 0) ? w : best, validData[0]);
  if (maxCal.Calories) {
    records.push({ metric: 'Max Calories', value: maxCal.Calories, date: maxCal.Date, unit: 'kcal', formatted: `${maxCal.Calories.toLocaleString()} kcal` });
  }

  const withDist = validData.filter(w => (w.Distance || 0) > 0);
  if (withDist.length > 0) {
    const maxDist = withDist.reduce((best, w) => (w.Distance || 0) > (best.Distance || 0) ? w : best, withDist[0]);
    records.push({ metric: 'Longest Distance', value: maxDist.Distance, date: maxDist.Date, unit: 'km', formatted: `${maxDist.Distance.toFixed(2)} km` });
  }

  const parseDuration = (dur: string): number => {
    try {
      const [h, m, s] = dur.split(':').map(Number);
      return h * 3600 + m * 60 + (s || 0);
    } catch { return 0; }
  };

  const withDur = validData.filter(w => w.Duration && typeof w.Duration === 'string');
  if (withDur.length > 0) {
    const maxDur = withDur.reduce((best, w) => parseDuration(w.Duration) > parseDuration(best.Duration) ? w : best, withDur[0]);
    const secs = parseDuration(maxDur.Duration);
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    records.push({ metric: 'Longest Session', value: secs, date: maxDur.Date, unit: '', formatted: `${h}h ${m}m` });
  }

  const withHR = validData.filter(w => (w['Avg HR'] || 0) > 0);
  if (withHR.length > 0) {
    const maxHR = withHR.reduce((best, w) => (w['Avg HR'] || 0) > (best['Avg HR'] || 0) ? w : best, withHR[0]);
    records.push({ metric: 'Peak Avg HR', value: maxHR['Avg HR'], date: maxHR.Date, unit: 'BPM', formatted: `${maxHR['Avg HR']} BPM` });
  }

  return records;
}

export interface AnomalyPoint {
  date: string;
  value: number;
  metric: string;
  zScore: number;
  direction: 'high' | 'low';
}

export function detectAnomalies(workoutData: WorkoutData[], threshold = 2.0): AnomalyPoint[] {
  const validData = workoutData.filter(w => w.Date && typeof w.Date === 'string' && (w.Calories || 0) > 0);
  if (validData.length < 5) return [];

  const calories = validData.map(w => w.Calories || 0);
  const mean = calories.reduce((a, b) => a + b, 0) / calories.length;
  const std = Math.sqrt(calories.reduce((s, c) => s + (c - mean) ** 2, 0) / calories.length);

  if (std === 0) return [];

  return validData
    .map((w, i) => {
      const z = (calories[i] - mean) / std;
      return { date: w.Date, value: calories[i], metric: 'Calories', zScore: Math.abs(z), direction: z > 0 ? 'high' as const : 'low' as const };
    })
    .filter(p => p.zScore >= threshold)
    .sort((a, b) => b.zScore - a.zScore)
    .slice(0, 6);
}

export interface WeeklyTrendPoint {
  week: string;
  workouts: number;
  calories: number;
  avgSleep: number;
  avgHRV: number;
}

function getWeekKey(dateStr: string): string {
  try {
    const [d, m, y] = dateStr.split('/').map(Number);
    const date = new Date(y, m - 1, d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date);
    monday.setDate(diff);
    return monday.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  } catch { return ''; }
}

export function calculateWeeklyTrends(workoutData: WorkoutData[], sleepData: SleepData[]): WeeklyTrendPoint[] {
  const weeklyW: Record<string, { workouts: number; calories: number }> = {};
  workoutData.filter(w => w.Date).forEach(w => {
    const key = getWeekKey(w.Date);
    if (!key) return;
    if (!weeklyW[key]) weeklyW[key] = { workouts: 0, calories: 0 };
    weeklyW[key].workouts++;
    weeklyW[key].calories += w.Calories || 0;
  });

  const weeklyS: Record<string, { sleep: number; hrv: number; count: number }> = {};
  sleepData.filter(s => s['Night from']).forEach(s => {
    const key = getWeekKey(s['Night from']);
    if (!key) return;
    if (!weeklyS[key]) weeklyS[key] = { sleep: 0, hrv: 0, count: 0 };
    weeklyS[key].sleep += s['Total sleep time (min)'] || 0;
    weeklyS[key].hrv += s['avg HR Variability'] || 0;
    weeklyS[key].count++;
  });

  const allWeeks = Array.from(new Set([...Object.keys(weeklyW), ...Object.keys(weeklyS)]));

  return allWeeks.map(week => ({
    week,
    workouts: weeklyW[week]?.workouts || 0,
    calories: weeklyW[week]?.calories || 0,
    avgSleep: weeklyS[week] ? weeklyS[week].sleep / weeklyS[week].count / 60 : 0,
    avgHRV: weeklyS[week] ? weeklyS[week].hrv / weeklyS[week].count : 0,
  })).slice(-12);
}

export function calculateSleepQualityScore(sleepData: SleepData[]): { score: number; trend: number; label: string } {
  if (sleepData.length === 0) return { score: 0, trend: 0, label: 'No data' };

  const scores = sleepData.map(s => {
    const duration = Math.min(40, ((s['Total sleep time (min)'] || 0) / 480) * 40);
    const deep = Math.min(20, ((s['Deep sleep (min)'] || 0) / 90) * 20);
    const rem = Math.min(20, ((s['REM (min)'] || 0) / 90) * 20);
    const hrv = Math.min(20, ((s['avg HR Variability'] || 0) / 80) * 20);
    return duration + deep + rem + hrv;
  });

  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;

  const recent = scores.slice(-7);
  const prev = scores.slice(-14, -7);
  const trend = recent.length > 0 && prev.length > 0
    ? (recent.reduce((a, b) => a + b, 0) / recent.length) - (prev.reduce((a, b) => a + b, 0) / prev.length)
    : 0;

  let label = 'Poor';
  if (avg > 75) label = 'Excellent';
  else if (avg > 60) label = 'Good';
  else if (avg > 40) label = 'Fair';

  return { score: Math.round(avg), trend: Math.round(trend * 10) / 10, label };
}
