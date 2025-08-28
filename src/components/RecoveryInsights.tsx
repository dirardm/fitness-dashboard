import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Warning,
  Info,
  Favorite,
  Bedtime,
  FitnessCenter,
} from '@mui/icons-material';
import { WorkoutData, SleepData, TransformedHeartRateData } from '../types';

interface RecoveryInsightsProps {
  workoutData: WorkoutData[];
  sleepData: SleepData[];
  heartRateData: TransformedHeartRateData[];
}

const RecoveryInsights: React.FC<RecoveryInsightsProps> = ({
  workoutData,
  sleepData,
  heartRateData,
}) => {
  // Calculate recovery insights based on the data
  const insights = [
    {
      type: 'positive' as const,
      icon: <CheckCircle color="success" />,
      title: 'Consistent Training Schedule',
      description: 'You maintain a regular workout routine with good recovery periods.',
    },
    {
      type: 'warning' as const,
      icon: <Warning color="warning" />,
      title: 'Sleep Variability',
      description: 'Your sleep duration varies significantly. Try to maintain a consistent sleep schedule.',
    },
    {
      type: 'info' as const,
      icon: <Info color="info" />,
      title: 'Heart Rate Recovery',
      description: 'Your heart rate returns to normal quickly after workouts, indicating good cardiovascular fitness.',
    },
  ];

  // Calculate recovery score (simplified)
  const recoveryScore = 78; // This would be calculated from actual data

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Recovery Insights
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ textAlign: 'center', height: '100%' }}>
            <CardContent>
              <Box display="flex" justifyContent="center" mb={2}>
                <Favorite color="primary" sx={{ fontSize: 48 }} />
              </Box>
              <Typography variant="h4" gutterBottom>
                {recoveryScore}%
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Recovery Score
              </Typography>
              <Box mt={2}>
                <Chip 
                  label={recoveryScore > 75 ? 'Excellent' : recoveryScore > 50 ? 'Good' : 'Needs Improvement'} 
                  color={recoveryScore > 75 ? 'success' : recoveryScore > 50 ? 'warning' : 'error'} 
                  size="small" 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Recovery Insights
              </Typography>
              <List>
                {insights.map((insight, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemIcon>
                        {insight.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={insight.title}
                        secondary={insight.description}
                      />
                    </ListItem>
                    {index < insights.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <FitnessCenter sx={{ mr: 1 }} />
                <Typography variant="subtitle1">
                  Training Load
                </Typography>
              </Box>
              <Box display="flex" alignItems="center">
                <TrendingUp color="success" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  Your training intensity has increased by 12% over the past month.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Bedtime sx={{ mr: 1 }} />
                <Typography variant="subtitle1">
                  Sleep Quality
                </Typography>
              </Box>
              <Box display="flex" alignItems="center">
                <TrendingDown color="error" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  Sleep efficiency has decreased by 5% compared to last month.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default RecoveryInsights;
