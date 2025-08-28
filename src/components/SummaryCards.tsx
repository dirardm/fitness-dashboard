import React from 'react';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import {
  FitnessCenter as FitnessCenterIcon,
  Nightlight as SleepIcon,
  Favorite as HeartIcon,
  Whatshot as CaloriesIcon,
  TrendingUp,
  TrendingDown
} from '@mui/icons-material';
import { WorkoutData, SleepData, TransformedHeartRateData } from '../types';
import { analyzeData } from '../utils/csvParser';

interface SummaryCardsProps {
  workoutData: WorkoutData[];
  sleepData: SleepData[];
  heartRateData: TransformedHeartRateData[];
}

const SummaryCards: React.FC<SummaryCardsProps> = ({
  workoutData,
  sleepData,
  heartRateData,
}) => {
  // Calculate summary statistics
  const totalWorkouts = workoutData.length;
  const totalCalories = workoutData.reduce((sum, workout) => sum + workout.Calories, 0);
  const avgSleepDuration = sleepData.reduce((sum, sleep) => sum + sleep['Total sleep time (min)'], 0) / (sleepData.length || 1);
  
  // Fix for Infinity issue - filter out invalid heart rate values
  const validHeartRates = heartRateData.filter(hr => 
    typeof hr.heartRate === 'number' && 
    !isNaN(hr.heartRate) && 
    isFinite(hr.heartRate) &&
    hr.heartRate > 0
  );
  
  const avgHeartRate = validHeartRates.length > 0 
    ? validHeartRates.reduce((sum, hr) => sum + hr.heartRate, 0) / validHeartRates.length 
    : 0;
  
  // Get advanced metrics
  const analytics = analyzeData(workoutData, sleepData, heartRateData);

  const cards = [
    {
      title: 'Total Workouts',
      value: totalWorkouts,
      icon: <FitnessCenterIcon sx={{ fontSize: 40 }} />,
      color: '#1976d2',
      trend: analytics.workoutTrend,
    },
    {
      title: 'Calories Burned',
      value: totalCalories.toLocaleString(),
      icon: <CaloriesIcon sx={{ fontSize: 40 }} />,
      color: '#d32f2f',
      trend: analytics.workoutTrend,
    },
    {
      title: 'Avg Sleep (hrs)',
      value: (avgSleepDuration / 60).toFixed(1),
      icon: <SleepIcon sx={{ fontSize: 40 }} />,
      color: '#7b1fa2',
    },
    {
      title: 'Avg Heart Rate',
      value: Math.round(avgHeartRate),
      icon: <HeartIcon sx={{ fontSize: 40 }} />,
      color: '#ed6c02',
    },
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {cards.map((card, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              transition: '0.3s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 6,
              },
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="overline">
                    {card.title}
                  </Typography>
                  <Typography variant="h4" component="div">
                    {card.value}
                  </Typography>
                  {card.trend && (
                    <Box display="flex" alignItems="center" mt={1}>
                      {card.trend > 0 ? (
                        <TrendingUp color="success" sx={{ fontSize: 20, mr: 0.5 }} />
                      ) : (
                        <TrendingDown color="error" sx={{ fontSize: 20, mr: 0.5 }} />
                      )}
                      <Typography 
                        variant="body2" 
                        color={card.trend > 0 ? 'success.main' : 'error.main'}
                      >
                        {card.trend > 0 ? '+' : ''}{card.trend.toFixed(1)}%
                      </Typography>
                    </Box>
                  )}
                </Box>
                <Box color={card.color}>
                  {card.icon}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default SummaryCards;
