import React from 'react';
import { Grid, Card, CardContent, Typography, Box, LinearProgress, useTheme } from '@mui/material';
import {
  FitnessCenter as FitnessCenterIcon,
  Bedtime as SleepIcon,
  Favorite as HeartIcon,
  Whatshot as CaloriesIcon,
  TrendingUp,
  TrendingDown,
  AccessTime,
  Straighten,
  Whatshot,
} from '@mui/icons-material';
import { WorkoutData, SleepData, TransformedHeartRateData } from '../types';
import { analyzeData, calculateIntensityScore, calculateRecoveryScore, calculateConsistencyScore } from '../utils/csvParser';
import { formatNumber, formatBPM } from '../utils/formatters';
import { mocha } from '../theme';

interface SummaryViewProps {
  workoutData: WorkoutData[];
  sleepData: SleepData[];
  heartRateData: TransformedHeartRateData[];
}

const SummaryView: React.FC<SummaryViewProps> = ({ workoutData, sleepData, heartRateData }) => {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';

  const totalWorkouts = workoutData.length;
  const totalCalories = workoutData.reduce((sum, w) => sum + (w.Calories || 0), 0);
  const totalDistance = workoutData.reduce((sum, w) => sum + (w.Distance || 0), 0);
  const totalDuration = workoutData.reduce((sum, w) => {
    try {
      const [hours, minutes] = w.Duration.split(':').map(Number);
      return sum + (hours * 60 + minutes);
    } catch { return sum; }
  }, 0);

  const avgSleepDuration =
    sleepData.length > 0
      ? sleepData.reduce((sum, s) => sum + (s['Total sleep time (min)'] || 0), 0) / sleepData.length
      : 0;

  const validHR = heartRateData.filter(hr => hr.heartRate && !isNaN(hr.heartRate) && hr.heartRate > 0);
  const avgHeartRate =
    validHR.length > 0 ? validHR.reduce((sum, hr) => sum + hr.heartRate, 0) / validHR.length : 0;

  const analytics = analyzeData(workoutData, sleepData, heartRateData);
  const intensityScore = calculateIntensityScore(workoutData);
  const recoveryScore = calculateRecoveryScore(sleepData, workoutData);
  const consistencyScore = calculateConsistencyScore(workoutData);

  interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    unit?: string;
    trend?: number;
    progress?: number;
  }

  const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, unit, trend, progress }) => (
    <Card
      sx={{
        height: '100%',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: dark ? '0 12px 36px rgba(0,0,0,0.5)' : `0 10px 28px ${color}28`,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: `${color}1a`,
              border: `1px solid ${color}33`,
              color: color,
            }}
          >
            {icon}
          </Box>
          {trend !== undefined && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                color: trend >= 0 ? (dark ? mocha.green : '#10b981') : (dark ? mocha.red : '#ef4444'),
              }}
            >
              {trend >= 0 ? <TrendingUp fontSize="small" /> : <TrendingDown fontSize="small" />}
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, ml: 0.5, fontSize: '0.8rem' }}
              >
                {trend >= 0 ? '+' : ''}{formatNumber(trend)}%
              </Typography>
            </Box>
          )}
        </Box>
        <Typography color="text.secondary" variant="overline" sx={{ display: 'block', mb: 0.5 }}>
          {title}
        </Typography>
        <Typography variant="h4" component="div" sx={{ fontWeight: 700, letterSpacing: '-0.04em' }}>
          {value}
          {unit && (
            <Typography component="span" variant="h6" sx={{ ml: 0.5, fontWeight: 400, color: 'text.secondary' }}>
              {unit}
            </Typography>
          )}
        </Typography>
        {progress !== undefined && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 5,
                borderRadius: 3,
                bgcolor: dark ? mocha.surface1 : 'rgba(0,0,0,0.06)',
                '& .MuiLinearProgress-bar': {
                  bgcolor:
                    progress > 75
                      ? dark ? mocha.green : '#10b981'
                      : progress > 50
                      ? dark ? mocha.yellow : '#eab308'
                      : dark ? mocha.red : '#ef4444',
                  borderRadius: 3,
                },
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              Score: {formatNumber(progress)} / 100
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Grid container spacing={2.5}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          title="Total Workouts"
          value={totalWorkouts}
          icon={<FitnessCenterIcon fontSize="small" />}
          color={dark ? mocha.blue : '#3b82f6'}
          trend={analytics.workoutTrend}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          title="Calories Burned"
          value={formatNumber(totalCalories / 1000)}
          icon={<CaloriesIcon fontSize="small" />}
          color={dark ? mocha.red : '#ef4444'}
          unit="k"
          trend={analytics.workoutTrend}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          title="Avg Sleep"
          value={formatNumber(avgSleepDuration / 60)}
          icon={<SleepIcon fontSize="small" />}
          color={dark ? mocha.mauve : '#7c3aed'}
          unit="hrs"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          title="Avg Heart Rate"
          value={formatBPM(avgHeartRate)}
          icon={<HeartIcon fontSize="small" />}
          color={dark ? mocha.peach : '#f97316'}
          unit="BPM"
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <StatCard
          title="Training Intensity"
          value={intensityScore.label}
          icon={<Whatshot fontSize="small" />}
          color={dark ? mocha.yellow : '#eab308'}
          progress={intensityScore.score}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <StatCard
          title="Recovery Quality"
          value={recoveryScore.label}
          icon={<SleepIcon fontSize="small" />}
          color={dark ? mocha.green : '#10b981'}
          progress={recoveryScore.score}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <StatCard
          title="Consistency"
          value={consistencyScore.label}
          icon={<AccessTime fontSize="small" />}
          color={dark ? mocha.sapphire : '#06b6d4'}
          progress={consistencyScore.score}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <Card sx={{ height: '100%', transition: 'transform 0.25s ease', '&:hover': { transform: 'translateY(-3px)' } }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Straighten sx={{ color: dark ? mocha.sapphire : '#06b6d4', mr: 1, fontSize: 20 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Total Distance</Typography>
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 700, letterSpacing: '-0.04em' }}>
              {formatNumber(totalDistance)}
              <Typography component="span" variant="h6" sx={{ ml: 0.75, fontWeight: 400, color: 'text.secondary' }}>
                km
              </Typography>
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Across {totalWorkouts} workout{totalWorkouts !== 1 ? 's' : ''}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <Card sx={{ height: '100%', transition: 'transform 0.25s ease', '&:hover': { transform: 'translateY(-3px)' } }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AccessTime sx={{ color: dark ? mocha.teal : '#0d9488', mr: 1, fontSize: 20 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Training Time</Typography>
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 700, letterSpacing: '-0.04em' }}>
              {formatNumber(totalDuration / 60)}
              <Typography component="span" variant="h6" sx={{ ml: 0.75, fontWeight: 400, color: 'text.secondary' }}>
                hrs
              </Typography>
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Avg {formatNumber(totalWorkouts > 0 ? totalDuration / totalWorkouts / 60 : 0)} hrs per session
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default SummaryView;
