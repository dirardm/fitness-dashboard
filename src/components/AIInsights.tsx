import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  Button,
  Collapse,
  IconButton,
} from '@mui/material';
import {
  Psychology,
  Lightbulb,
  TrendingUp,
  TrendingDown,
  ExpandMore,
  HealthAndSafety,
  FitnessCenter,
  Bedtime,
  Favorite,
} from '@mui/icons-material';
import { WorkoutData, SleepData, TransformedHeartRateData, AIInsight } from '../types';

interface AIInsightsProps {
  workoutData: WorkoutData[];
  sleepData: SleepData[];
  heartRateData: TransformedHeartRateData[];
}

const AIInsights: React.FC<AIInsightsProps> = ({
  workoutData,
  sleepData,
  heartRateData,
}) => {
  const [insights, setInsights] = React.useState<AIInsight[]>([]);
  const [expanded, setExpanded] = React.useState(true);

  React.useEffect(() => {
    if (workoutData.length > 0 && sleepData.length > 0 && heartRateData.length > 0) {
      generateInsights();
    }
  }, [workoutData, sleepData, heartRateData]);

  const generateInsights = () => {
    const generatedInsights: AIInsight[] = [];
    
    // Analyze workout data
    const workoutInsights = analyzeWorkoutData(workoutData);
    generatedInsights.push(...workoutInsights);
    
    // Analyze sleep data
    const sleepInsights = analyzeSleepData(sleepData);
    generatedInsights.push(...sleepInsights);
    
    // Analyze heart rate data
    const hrInsights = analyzeHeartRateData(heartRateData);
    generatedInsights.push(...hrInsights);
    
    // Analyze recovery and overall trends
    const recoveryInsights = analyzeRecovery(workoutData, sleepData, heartRateData);
    generatedInsights.push(...recoveryInsights);
    
    setInsights(generatedInsights);
  };

  const analyzeWorkoutData = (data: WorkoutData[]): AIInsight[] => {
    const insights: AIInsight[] = [];
    
    // Calculate average metrics
    const avgCalories = data.reduce((sum, w) => sum + w.Calories, 0) / data.length;
    const avgDuration = data.reduce((sum, w) => {
      const [hours, minutes, seconds] = w.Duration.split(':').map(Number);
      return sum + (hours * 60 + minutes + seconds / 60);
    }, 0) / data.length;
    
    // Check consistency
    const workoutDays = data.map(w => new Date(w.Date).getDay());
    const consistencyScore = calculateConsistency(workoutDays);
    
    // Intensity analysis
    const highIntensityWorkouts = data.filter(w => w.Calories > 700).length;
    const highIntensityRatio = highIntensityWorkouts / data.length;
    
    if (consistencyScore > 0.8) {
      insights.push({
        category: 'workout',
        type: 'positive',
        title: 'Excellent Workout Consistency',
        description: 'You maintain a highly consistent workout schedule, which is optimal for fitness progress.',
        impact: 'high',
        dataPoints: [`${Math.round(consistencyScore * 100)}% consistency rate`]
      });
    }
    
    if (highIntensityRatio > 0.3) {
      insights.push({
        category: 'workout',
        type: 'positive',
        title: 'Good Intensity Balance',
        description: 'You have a good mix of high and moderate intensity workouts, promoting both fitness and recovery.',
        impact: 'medium',
        dataPoints: [`${Math.round(highIntensityRatio * 100)}% high intensity workouts`]
      });
    }
    
    return insights;
  };

  const analyzeSleepData = (data: SleepData[]): AIInsight[] => {
    const insights: AIInsight[] = [];
    
    // Calculate average metrics
    const avgSleepDuration = data.reduce((sum, s) => sum + s['Total sleep time (min)'], 0) / data.length;
    const avgSleepQuality = data.reduce((sum, s) => sum + s['avg HR'], 0) / data.length;
    const avgDeepSleep = data.reduce((sum, s) => sum + s['Deep sleep (min)'], 0) / data.length;
    
    // Check for patterns
    const deepSleepRatio = avgDeepSleep / avgSleepDuration;
    
    if (avgSleepDuration < 420) { // 7 hours
      insights.push({
        category: 'sleep',
        type: 'recommendation',
        title: 'Increase Sleep Duration',
        description: 'Your average sleep duration is below the recommended 7-9 hours. Consider prioritizing sleep for better recovery.',
        impact: 'high',
        dataPoints: [`Average sleep: ${Math.round(avgSleepDuration / 60)} hours`]
      });
    }
    
    if (deepSleepRatio < 0.15) {
      insights.push({
        category: 'sleep',
        type: 'recommendation',
        title: 'Improve Deep Sleep',
        description: 'Your deep sleep percentage is lower than optimal. Try reducing blue light exposure before bed and maintaining a cooler bedroom temperature.',
        impact: 'medium',
        dataPoints: [`Deep sleep ratio: ${Math.round(deepSleepRatio * 100)}%`]
      });
    }
    
    return insights;
  };

  const analyzeHeartRateData = (data: TransformedHeartRateData[]): AIInsight[] => {
    const insights: AIInsight[] = [];
    
    // Group by date and calculate averages
    const byDate: Record<string, number[]> = {};
    data.forEach(item => {
      if (!byDate[item.date]) byDate[item.date] = [];
      byDate[item.date].push(item.heartRate);
    });
    
    // Calculate average and max by date
    const dateAverages = Object.entries(byDate).map(([date, values]) => {
      const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
      const max = Math.max(...values);
      return { date, avg, max };
    });
    
    // Check for trends
    if (dateAverages.length > 5) {
      const recentAvg = dateAverages.slice(-5).reduce((sum, d) => sum + d.avg, 0) / 5;
      const olderAvg = dateAverages.slice(0, 5).reduce((sum, d) => sum + d.avg, 0) / 5;
      
      if (recentAvg < olderAvg) {
        insights.push({
          category: 'recovery',
          type: 'positive',
          title: 'Improving Cardiovascular Efficiency',
          description: 'Your average workout heart rate has decreased, suggesting improved cardiovascular fitness.',
          impact: 'medium',
          dataPoints: [`${Math.round(olderAvg - recentAvg)} BPM decrease in average heart rate`]
        });
      }
    }
    
    return insights;
  };

  const analyzeRecovery = (
    workoutData: WorkoutData[],
    sleepData: SleepData[],
    heartRateData: TransformedHeartRateData[]
  ): AIInsight[] => {
    const insights: AIInsight[] = [];
    
    // Simple correlation analysis between workout intensity and sleep quality
    if (workoutData.length > 5 && sleepData.length > 5) {
      const recentWorkouts = workoutData.slice(-5);
      const recentSleep = sleepData.slice(-5);
      
      const avgWorkoutIntensity = recentWorkouts.reduce((sum, w) => sum + w.Calories, 0) / 5;
      const avgSleepQuality = recentSleep.reduce((sum, s) => sum + s['avg HR'], 0) / 5;
      
      // This is a simplified correlation - in a real app, you'd use proper statistical methods
      if (avgWorkoutIntensity > 600 && avgSleepQuality > 65) {
        insights.push({
          category: 'recovery',
          type: 'recommendation',
          title: 'Monitor Recovery Balance',
          description: 'Your high-intensity workouts may be affecting your sleep quality. Consider adding more active recovery days.',
          impact: 'medium',
          dataPoints: [
            `Avg workout intensity: ${Math.round(avgWorkoutIntensity)} calories`,
            `Avg sleep HR: ${Math.round(avgSleepQuality)} BPM`
          ]
        });
      }
    }
    
    return insights;
  };

  const calculateConsistency = (days: number[]): number => {
    // Simple consistency calculation based on variation in workout days
    if (days.length < 2) return 1;
    
    const dayCounts: Record<number, number> = {};
    days.forEach(day => {
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });
    
    const values = Object.values(dayCounts);
    const max = Math.max(...values);
    const min = Math.min(...values);
    
    return 1 - (max - min) / days.length;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'workout': return <FitnessCenter />;
      case 'sleep': return <Bedtime />;
      case 'recovery': return <Favorite />;
      default: return <HealthAndSafety />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'positive': return 'success';
      case 'negative': return 'error';
      case 'recommendation': return 'info';
      default: return 'default';
    }
  };

  const groupInsightsByCategory = () => {
    const grouped: Record<string, AIInsight[]> = {
      workout: [],
      sleep: [],
      recovery: [],
      overall: []
    };
    
    insights.forEach(insight => {
      grouped[insight.category].push(insight);
    });
    
    return grouped;
  };

  if (insights.length === 0) {
    return (
      <Paper sx={{ p: 3, mt: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <Psychology sx={{ mr: 1 }} />
            <Typography variant="h6">AI-Powered Insights</Typography>
          </Box>
          <Button variant="outlined" onClick={generateInsights}>
            Generate Insights
          </Button>
        </Box>
        <Alert severity="info" sx={{ mt: 2 }}>
          AI insights will be generated based on your workout, sleep, and heart rate data patterns.
        </Alert>
      </Paper>
    );
  }

  const groupedInsights = groupInsightsByCategory();

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box display="flex" alignItems="center">
          <Psychology sx={{ mr: 1 }} />
          <Typography variant="h6">AI-Powered Insights</Typography>
        </Box>
        <IconButton onClick={() => setExpanded(!expanded)}>
          <ExpandMore sx={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }} />
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        <Alert severity="info" sx={{ mt: 2, mb: 3 }}>
          <Lightbulb sx={{ mr: 1 }} />
          These insights are generated by analyzing patterns in your workout, sleep, and heart rate data.
        </Alert>

        <Grid container spacing={3}>
          {Object.entries(groupedInsights).map(([category, categoryInsights]) => (
            categoryInsights.length > 0 && (
              <Grid item xs={12} md={6} key={category}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      {getCategoryIcon(category)}
                      <Typography variant="h6" sx={{ ml: 1, textTransform: 'capitalize' }}>
                        {category} Insights
                      </Typography>
                    </Box>
                    
                    <List dense>
                      {categoryInsights.map((insight, index) => (
                        <React.Fragment key={index}>
                          <ListItem alignItems="flex-start">
                            <ListItemIcon>
                              {insight.type === 'positive' ? (
                                <TrendingUp color="success" />
                              ) : insight.type === 'negative' ? (
                                <TrendingDown color="error" />
                              ) : (
                                <Lightbulb color="info" />
                              )}
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Box display="flex" alignItems="center">
                                  <Typography variant="subtitle1">
                                    {insight.title}
                                  </Typography>
                                  <Chip
                                    label={insight.impact}
                                    size="small"
                                    color={getTypeColor(insight.type)}
                                    sx={{ ml: 1 }}
                                  />
                                </Box>
                              }
                              secondary={
                                <Box mt={1}>
                                  <Typography variant="body2" color="text.secondary">
                                    {insight.description}
                                  </Typography>
                                  {insight.dataPoints && insight.dataPoints.length > 0 && (
                                    <Box mt={1}>
                                      {insight.dataPoints.map((point, i) => (
                                        <Chip
                                          key={i}
                                          label={point}
                                          size="small"
                                          variant="outlined"
                                          sx={{ mr: 0.5, mb: 0.5 }}
                                        />
                                      ))}
                                    </Box>
                                  )}
                                </Box>
                              }
                            />
                          </ListItem>
                          {index < categoryInsights.length - 1 && <Divider variant="inset" component="li" />}
                        </React.Fragment>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            )
          ))}
        </Grid>

        <Box mt={3}>
          <Alert severity="warning">
            These insights are generated based on patterns in your data and should not replace professional medical advice.
          </Alert>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default AIInsights;
