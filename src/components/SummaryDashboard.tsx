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
} from '@mui/icons-material';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import BedtimeIcon from '@mui/icons-material/Bedtime';
import { WorkoutData, SleepData, TransformedHeartRateData } from '../types';
import { calculateIntensityScore, calculateRecoveryScore, calculateConsistencyScore } from '../utils/advancedAnalytics';

interface SummaryDashboardProps {
  workoutData: WorkoutData[];
  sleepData: SleepData[];
  heartRateData: TransformedHeartRateData[];
}

const SummaryDashboard: React.FC<SummaryDashboardProps> = ({
  workoutData,
  sleepData,
  heartRateData,
}) => {
  // Calculate advanced metrics
  const totalWorkouts = workoutData.length;
  const totalCalories = workoutData.reduce((sum, workout) => sum + workout.Calories, 0);
  
  const totalDistance = workoutData.reduce((sum, workout) => sum + (workout.Distance || 0), 0);
  const totalDuration = workoutData.reduce((sum, workout) => {
    const [hours, minutes] = workout.Duration.split(':').map(Number);
    return sum + (hours * 60 + minutes);
  }, 0);
  
  const avgSleepDuration = sleepData.reduce((sum, sleep) => sum + sleep['Total sleep time (min)'], 0) / (sleepData.length || 1);
  const avgSleepQuality = sleepData.reduce((sum, sleep) => sum + (sleep['avg HR'] || 0), 0) / (sleepData.length || 1);
  
  // Filter valid heart rates
  const validHeartRates = heartRateData.filter(hr => 
    hr.heartRate && !isNaN(hr.heartRate) && isFinite(hr.heartRate)
  );
  
  const avgHeartRate = validHeartRates.length > 0 
    ? validHeartRates.reduce((sum, hr) => sum + hr.heartRate, 0) / validHeartRates.length 
    : 0;
  
  // Calculate advanced scores
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
    <Card sx={{ height: '100%', borderRadius: 2, boxShadow: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Avatar sx={{ bgcolor: color, width: 48, height: 48 }}>
            {icon}
          </Avatar>
          {trend !== undefined && (
            <Box display="flex" alignItems="center" color={trend >= 0 ? 'success.main' : 'error.main'}>
              {trend >= 0 ? <TrendingUp fontSize="small" /> : <TrendingDown fontSize="small" />}
              <Typography variant="body2" fontWeight="medium" ml={0.5}>
                {trend >= 0 ? '+' : ''}{trend}%
              </Typography>
            </Box>
          )}
        </Box>
        <Typography color="textSecondary" variant="overline" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h4" component="div" fontWeight="600">
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
              Score: {progress}/100
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
          trend={5.2}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Calories Burned"
          value={(totalCalories / 1000).toFixed(1)}
          icon={<CaloriesIcon />}
          color="#d32f2f"
          unit="k"
          trend={8.7}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Avg Sleep"
          value={(avgSleepDuration / 60).toFixed(1)}
          icon={<SleepIcon />}
          color="#7b1fa2"
          unit="hrs"
          trend={-2.3}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Avg Heart Rate"
          value={Math.round(avgHeartRate)}
          icon={<HeartIcon />}
          color="#ed6c02"
          unit="BPM"
          trend={-1.5}
        />
      </Grid>
      
      {/* Advanced metric cards */}
      <Grid item xs={12} sm={6} md={4}>
        <StatCard
          title="Training Intensity"
          value={intensityScore.label}
          icon={<WhatshotIcon />}
          color="#f57c00"
          progress={intensityScore.score}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <StatCard
          title="Recovery Quality"
          value={recoveryScore.label}
          icon={<BedtimeIcon />}
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
        <Card sx={{ height: '100%', borderRadius: 2, boxShadow: 2 }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <Straighten color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" component="div">
                Total Distance
              </Typography>
            </Box>
            <Typography variant="h3" component="div" fontWeight="600">
              {totalDistance.toFixed(1)}
              <Typography component="span" variant="h6" ml={0.5}>km</Typography>
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Across {totalWorkouts} workouts
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={6}>
        <Card sx={{ height: '100%', borderRadius: 2, boxShadow: 2 }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <AccessTime color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" component="div">
                Total Training Time
              </Typography>
            </Box>
            <Typography variant="h3" component="div" fontWeight="600">
              {Math.round(totalDuration / 60)}
              <Typography component="span" variant="h6" ml={0.5}>hours</Typography>
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Average {(totalDuration / totalWorkouts / 60).toFixed(1)} hours per session
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default SummaryDashboard;
