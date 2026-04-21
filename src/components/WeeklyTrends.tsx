import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  useTheme,
} from '@mui/material';
import { WorkoutData, SleepData } from '../types';
import { calculateWeeklyTrends, calculateSleepQualityScore } from '../utils/analytics';
import { mocha } from '../theme';

interface WeeklyTrendsProps {
  workoutData: WorkoutData[];
  sleepData: SleepData[];
}

interface SparklineProps {
  values: number[];
  color: string;
  height?: number;
}

const Sparkline: React.FC<SparklineProps> = ({ values, color, height = 36 }) => {
  if (values.length < 2) return null;
  const w = 96;
  const h = height;
  const pad = 3;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const xs = values.map((_, i) => pad + (i / (values.length - 1)) * (w - pad * 2));
  const ys = values.map(v => h - pad - ((v - min) / range) * (h - pad * 2));
  const points = xs.map((x, i) => `${x},${ys[i]}`).join(' ');

  return (
    <svg width={w} height={h} style={{ overflow: 'visible' }}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Last point dot */}
      <circle
        cx={xs[xs.length - 1]}
        cy={ys[ys.length - 1]}
        r={3}
        fill={color}
      />
    </svg>
  );
};

const WeeklyTrends: React.FC<WeeklyTrendsProps> = ({ workoutData, sleepData }) => {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';
  const weeks = calculateWeeklyTrends(workoutData, sleepData);
  const sleepQuality = calculateSleepQualityScore(sleepData);

  if (weeks.length === 0) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Weekly Trends</Typography>
        <Typography variant="body2" color="text.secondary">Upload data to see weekly trends.</Typography>
      </Paper>
    );
  }

  const latestWeek = weeks[weeks.length - 1];
  const prevWeek = weeks.length > 1 ? weeks[weeks.length - 2] : null;

  const delta = (curr: number, prev: number | null) => {
    if (prev === null || prev === 0) return null;
    const pct = ((curr - prev) / prev) * 100;
    return pct;
  };

  const stats = [
    {
      label: 'Workouts / week',
      value: latestWeek.workouts,
      formatted: `${latestWeek.workouts}`,
      delta: prevWeek ? delta(latestWeek.workouts, prevWeek.workouts) : null,
      sparkValues: weeks.map(w => w.workouts),
      color: dark ? mocha.mauve : '#7c3aed',
    },
    {
      label: 'Calories / week',
      value: latestWeek.calories,
      formatted: latestWeek.calories > 0 ? latestWeek.calories.toLocaleString() : '—',
      delta: prevWeek ? delta(latestWeek.calories, prevWeek.calories) : null,
      sparkValues: weeks.map(w => w.calories),
      color: dark ? mocha.peach : '#f97316',
    },
    {
      label: 'Avg sleep',
      value: latestWeek.avgSleep,
      formatted: latestWeek.avgSleep > 0 ? `${latestWeek.avgSleep.toFixed(1)}h` : '—',
      delta: prevWeek ? delta(latestWeek.avgSleep, prevWeek.avgSleep) : null,
      sparkValues: weeks.map(w => w.avgSleep),
      color: dark ? mocha.teal : '#0d9488',
    },
    {
      label: 'Avg HRV',
      value: latestWeek.avgHRV,
      formatted: latestWeek.avgHRV > 0 ? latestWeek.avgHRV.toFixed(0) : '—',
      delta: prevWeek ? delta(latestWeek.avgHRV, prevWeek.avgHRV) : null,
      sparkValues: weeks.map(w => w.avgHRV),
      color: dark ? mocha.green : '#10b981',
    },
  ];

  const sleepQualityColor = sleepQuality.score > 75
    ? (dark ? mocha.green : '#10b981')
    : sleepQuality.score > 60
    ? (dark ? mocha.teal : '#0d9488')
    : sleepQuality.score > 40
    ? (dark ? mocha.yellow : '#eab308')
    : (dark ? mocha.red : '#ef4444');

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Weekly Trends</Typography>

      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        {stats.map(stat => (
          <Grid size={{ xs: 6, sm: 3 }} key={stat.label}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ py: 2, px: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  {stat.label}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 0.5, mb: 0.5 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: stat.color, letterSpacing: '-0.03em' }}>
                    {stat.formatted}
                  </Typography>
                  {stat.delta !== null && (
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: '0.7rem',
                        color: stat.delta >= 0 ? (dark ? mocha.green : '#10b981') : (dark ? mocha.red : '#ef4444'),
                      }}
                    >
                      {stat.delta >= 0 ? '+' : ''}{stat.delta.toFixed(0)}%
                    </Typography>
                  )}
                </Box>
                <Sparkline values={stat.sparkValues.filter(v => v > 0)} color={stat.color} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Sleep Quality Score */}
      {sleepData.length > 0 && (
        <Card>
          <CardContent sx={{ py: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Sleep Quality Score
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 0.25 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: sleepQualityColor, letterSpacing: '-0.04em' }}>
                    {sleepQuality.score}
                  </Typography>
                  <Typography variant="body2" sx={{ color: sleepQualityColor, fontWeight: 600 }}>
                    {sleepQuality.label}
                  </Typography>
                  {sleepQuality.trend !== 0 && (
                    <Typography
                      variant="caption"
                      sx={{ color: sleepQuality.trend > 0 ? (dark ? mocha.green : '#10b981') : (dark ? mocha.red : '#ef4444'), fontSize: '0.78rem' }}
                    >
                      {sleepQuality.trend > 0 ? '↑' : '↓'} {Math.abs(sleepQuality.trend).toFixed(1)} vs prev 7 nights
                    </Typography>
                  )}
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', maxWidth: 280, textAlign: 'right' }}>
                Composite score from duration, deep sleep, REM, and HRV (0–100)
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}
    </Paper>
  );
};

export default WeeklyTrends;
