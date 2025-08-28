import React from 'react';
import { Grid, Card, CardContent, Typography, Box, Avatar, LinearProgress } from '@mui/material';
import {
  FitnessCenter as FitnessCenterIcon,
  Nightlight as SleepIcon,
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
import { formatNumber, formatBPM, formatHours } from '../utils/formatters';

interface SummaryViewProps {
  workoutData: WorkoutData[];
  sleepData: SleepData[];
  heartRateData: TransformedHeartRateData[];
}

const SummaryView: React.FC<SummaryViewProps> = ({
  workoutData,
  sleepData,
  heartRateData,
}) => {
  // Calculate summary statistics
  const totalWorkouts = workoutData.length;
  const totalCalories = workoutData.reduce((sum, workout) => sum + (workout.Calories || 0), 0);
  
  const totalDistance = workoutData.reduce((sum, workout) => sum + (workout.Distance || 0), 0);
  const totalDuration = workoutData.reduce((sum, workout) => {
    try {
      const [hours, minutes] = workout.Duration.split(':').map(Number);
      return sum + (hours * 60 + minutes);
    } catch {
      return sum;
    }
  }, 0);
  
  const avgSleepDuration = sleepData.length > 0 
    ? sleepData.reduce((sum, sleep) => sum + (sleep['Total sleep time (min)'] || 0), 0) / sleepData.length 
    : 0;
  
  // Filter valid heart rates
  const validHeartRates = heartRateData.filter(hr => 
    hr.heartRate && !isNaN(hr.heartRate) && isFinite(hr.heartRate) && hr.heartRate > 0
  );
  
  const avgHeartRate = validHeartRates.length > 0 
    ? validHeartRates.reduce((sum, hr) => sum + hr.heartRate, 0) / validHeartRates.length 
    : 0;
  
  // Get advanced metrics
  const analytics = analyzeData(workoutData, sleepData, heartRateData);
  const intensityScore = calculateIntensityScore(workoutData);
  const recoveryScore = calculateRecoveryScore(sleepData, workoutData);
  const consistencyScore = calculateConsistencyScore(workoutData);

  const StatCard = ({ 
    title, 
    value, 
    icon, 
    color, 
    unit, 
    trend, 
    progress 
  }: { 
    title: string; 
    value: string | number; 
    icon: React.ReactNode;
    color: string;
    unit?: string;
    trend?: number;
    progress?: number;
  }) => (
    <Card sx={{ 
      height: '100%', 
      borderRadius: 2, 
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
      },
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Avatar sx={{ bgcolor: color, width: 48, height: 48 }}>
            {icon}
          </Avatar>
          {trend !== undefined && (
            <Box display="flex" alignItems="center" color={trend >= 0 ? 'success.main' : 'error.main'}>
              {trend >= 0 ? <TrendingUp fontSize="small" /> : <TrendingDown fontSize="small" />}
              <Typography variant="body2" fontWeight="medium" ml={0.5}>
                {trend >= 0 ? '+' : ''}{formatNumber(trend)}%
              </Typography>
            </Box>
          )}
        </Box>
        <Typography color="textSecondary" gutterBottom variant="overline">
          {title}
        </Typography>
        <Typography variant="h4" component="div">
          {value}{unit && <Typography component="span" variant="h6" ml={0.5}>{unit}</Typography>}
        </Typography>
        {progress !== undefined && (
          <Box mt={2}>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ height: 6, borderRadius: 3 }} 
              color={progress > 75 ? 'success' : progress > 50 ? 'warning' : 'error'}
            />
            <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
              Score: {formatNumber(progress)}/100
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Total Workouts"
          value={totalWorkouts}
          icon={<FitnessCenterIcon />}
          color="#1976d2"
          trend={analytics.workoutTrend}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Calories Burned"
          value={formatNumber(totalCalories / 1000)}
          icon={<CaloriesIcon />}
          color="#d32f2f"
          unit="k"
          trend={analytics.workoutTrend}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Avg Sleep"
          value={formatNumber(avgSleepDuration / 60)}
          icon={<SleepIcon />}
          color="#7b1fa2"
          unit="hrs"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Avg Heart Rate"
          value={formatNumber(avgHeartRate)}
          icon={<HeartIcon />}
          color="#ed6c02"
          unit="BPM"
        />
      </Grid>
      
      {/* Advanced metric cards */}
      <Grid item xs={12} sm={6} md={4}>
        <StatCard
          title="Training Intensity"
          value={intensityScore.label}
          icon={<Whatshot />}
          color="#f57c00"
          progress={intensityScore.score}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <StatCard
          title="Recovery Quality"
          value={recoveryScore.label}
          icon={<SleepIcon />}
          color="#388e3c"
          progress={recoveryScore.score}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <StatCard
          title="Consistency"
          value={consistencyScore.label}
          icon={<AccessTime />}
          color="#0288d1"
          progress={consistencyScore.score}
        />
      </Grid>
      
      {/* Additional summary metrics */}
      <Grid item xs={12} sm={6} md={6}>
        <Card sx={{ 
          height: '100%', 
          borderRadius: 2, 
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <Straighten color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" component="div">
                Total Distance
              </Typography>
            </Box>
            <Typography variant="h3" component="div" fontWeight="600">
              {formatNumber(totalDistance)}
              <Typography component="span" variant="h6" ml={0.5}>km</Typography>
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Across {totalWorkouts} workouts
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={6}>
        <Card sx={{ 
          height: '100%', 
          borderRadius: 2, 
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <AccessTime color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" component="div">
                Total Training Time
              </Typography>
            </Box>
            <Typography variant="h3" component="div" fontWeight="600">
              {formatNumber(totalDuration / 60)}
              <Typography component="span" variant="h6" ml={0.5}>hours</Typography>
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Average {formatNumber(totalDuration / totalWorkouts / 60)} hours per session
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default SummaryView;
