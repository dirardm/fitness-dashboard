export interface WorkoutData {
  Date: string;
  Time: string;
  Duration: string;
  Distance: number;
  'Avg speed': number;
  'Max speed': number;
  Calories: number;
  Steps: number;
  'Avg HR': number;
  'Max HR': number;
  'Avg cadence': number;
  'Max cadence': number;
  'Perceived Effort': number;
  'Zone 1 %': string;
  'Zone 2 %': string;
  'Zone 3 %': string;
  'Zone 4 %': string;
  'Zone 5 %': string;
  'Workout Type': string;
  Source: string;
}

export interface SleepData {
  'Night from': string;
  'Night to': string;
  From: string;
  To: string;
  'Total sleep time (min)': number;
  'Light sleep (min)': number;
  'Deep sleep (min)': number;
  'REM (min)': number;
  'avg HR': number;
  'avg HR Variability': number;
  'Respiratory rate': number;
  Fragmentation: number;
  'Preceded workout': string;
  'Workout date': string;
}

export interface HeartRateData {
  Time: number;
  [date: string]: number;
}

export interface TransformedHeartRateData {
  date: string;
  time: number;
  heartRate: number;
}

export interface CorrelationData {
  x: string;
  y: string;
  correlation: number;
  significance: string;
}

export interface Insight {
  title: string;
  description: string;
  type: 'positive' | 'negative' | 'neutral';
  impact: 'high' | 'medium' | 'low';
}

export interface AnalyticsData {
  correlations: CorrelationData[];
  insights: Insight[];
  trends: {
    sleepQualityTrend: number;
    workoutIntensityTrend: number;
    heartRateTrend: number;
  };
}

export interface AIInsight {
  category: 'workout' | 'sleep' | 'recovery' | 'overall';
  type: 'positive' | 'negative' | 'recommendation';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  dataPoints: string[];
}
