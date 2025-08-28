import React, { useState, useCallback } from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Fullscreen } from '@mui/icons-material';
import { Line, Doughnut } from 'react-chartjs-2';
import { WorkoutData, SleepData, TransformedHeartRateData } from '../types';
import '../utils/chartSetup';
import {
  calculateTrainingLoad,
  calculateHRVTrends,
  calculateIntensityScore,
  calculateRecoveryScore,
  calculateConsistencyScore,
} from '../utils/csvParser';
import { formatNumber } from '../utils/formatters';
import ChartModal from './ChartModal';

interface AdvancedAnalyticsProps {
  workoutData: WorkoutData[];
  sleepData: SleepData[];
  heartRateData: TransformedHeartRateData[];
}

const AdvancedAnalytics: React.FC<AdvancedAnalyticsProps> = ({
  workoutData,
  sleepData,
  heartRateData,
}) => {
  const [openModal, setOpenModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalChart, setModalChart] = useState<React.ReactNode>(null);

  if (workoutData.length === 0 && sleepData.length === 0 && heartRateData.length === 0) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Advanced Analytics
        </Typography>
        <Typography color="textSecondary">
          No data available for advanced analytics.
        </Typography>
      </Paper>
    );
  }

  // Calculate advanced metrics
  const trainingLoadData = calculateTrainingLoad(workoutData);
  const hrvTrends = calculateHRVTrends(sleepData);
  const intensityScore = calculateIntensityScore(workoutData);
  const recoveryScore = calculateRecoveryScore(sleepData, workoutData);
  const consistencyScore = calculateConsistencyScore(workoutData);

  // Prepare data for charts
// Update the trainingLoadChartData configuration
const trainingLoadChartData = {
  labels: trainingLoadData.map(item => item.date),
  datasets: [
    {
      label: 'Training Load',
      data: trainingLoadData.map(item => item.load),
      fill: true,
      backgroundColor: 'rgba(54, 162, 235, 0.1)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 2,
      pointBackgroundColor: 'rgba(54, 162, 235, 1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(54, 162, 235, 1)',
      pointRadius: 3,
      pointHoverRadius: 5,
      tension: 0.4, // Smooth line
    },
  ],
};

// Update trainingLoadOptions for better appearance
const trainingLoadOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        font: {
          size: 14,
        },
      },
    },
    title: {
      display: true,
      text: 'Training Load Over Time',
      font: {
        size: 16,
        weight: 'bold',
      },
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      titleFont: {
        size: 14,
      },
      bodyFont: {
        size: 14,
      },
      padding: 10,
      callbacks: {
        label: function(context: any) {
          return `Training Load: ${context.raw.toLocaleString()}`;
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.1)',
      },
      ticks: {
        font: {
          size: 12,
        },
      },
      title: {
        display: true,
        text: 'Training Load',
        font: {
          size: 14,
          weight: 'bold',
        },
      },
    },
    x: {
      grid: {
        color: 'rgba(0, 0, 0, 0.1)',
      },
      ticks: {
        font: {
          size: 12,
        },
        maxRotation: 45,
      },
      title: {
        display: true,
        text: 'Date',
        font: {
          size: 14,
          weight: 'bold',
        },
      },
    },
  },
};

  // Calculate workout intensity distribution
  const intensityDistribution = {
    labels: ['Low Intensity', 'Moderate Intensity', 'High Intensity'],
    datasets: [
      {
        data: [
          workoutData.filter(w => {
            const intensity = calculateIntensityScore([w]);
            return intensity.label === 'Low';
          }).length,
          workoutData.filter(w => {
            const intensity = calculateIntensityScore([w]);
            return intensity.label === 'Moderate';
          }).length,
          workoutData.filter(w => {
            const intensity = calculateIntensityScore([w]);
            return intensity.label === 'High';
          }).length,
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
        ],
      },
    ],
  };

  const intensityDistributionOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: 'Workout Intensity Distribution',
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
  };

  // Function to open chart in modal
  const openChartModal = useCallback((title: string, chart: React.ReactNode) => {
    setModalTitle(title);
    setModalChart(chart);
    setOpenModal(true);
  }, []);

  // Function to close modal
  const closeChartModal = useCallback(() => {
    setOpenModal(false);
  }, []);

  // Create chart components with fullscreen buttons
  const renderChartWithFullscreen = (
    title: string, 
    chart: React.ReactNode, 
    chartComponent: React.ReactNode
  ) => (
    <Box sx={{ position: 'relative', height: '100%' }}>
      {chartComponent}
      <Tooltip title="Open in full screen">
        <IconButton
          sx={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(255,255,255,0.7)' }}
          onClick={() => openChartModal(title, chart)}
          size="small"
        >
          <Fullscreen fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );

  // Create chart components for modal and regular view
  const trainingLoadChart = (
    <Line data={trainingLoadChartData} options={trainingLoadOptions} />
  );

  const intensityDistributionChart = (
    <Doughnut data={intensityDistribution} options={intensityDistributionOptions} />
  );

  return (
    <>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Advanced Analytics
        </Typography>

        <Grid container spacing={3}>
          {/* Score Cards */}
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {formatNumber(intensityScore.score)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Training Intensity Score
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {intensityScore.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {formatNumber(recoveryScore.score)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Recovery Quality Score
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {recoveryScore.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {formatNumber(consistencyScore.score)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Consistency Score
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {consistencyScore.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Charts */}
          {trainingLoadData.length > 0 && (
            <Grid item xs={12} md={8}>
              <Card sx={{ height: 400 }}>
                <CardContent>
                  <Box sx={{ height: 350 }}>
                    {renderChartWithFullscreen(
                      'Training Load Over Time',
                      trainingLoadChart,
                      trainingLoadChart
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}

          <Grid item xs={12} md={4}>
            <Card sx={{ height: 400 }}>
              <CardContent>
                <Box sx={{ height: 350 }}>
                  {renderChartWithFullscreen(
                    'Workout Intensity Distribution',
                    intensityDistributionChart,
                    intensityDistributionChart
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Additional Stats */}
          {hrvTrends.avgHRV > 0 && (
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {formatNumber(hrvTrends.avgHRV)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Average HRV
                  </Typography>
                  <Typography variant="body2" color={hrvTrends.trend > 0 ? 'success.main' : 'error.main'}>
                    Trend: {hrvTrends.trend > 0 ? '↑' : '↓'} {Math.abs(hrvTrends.trend).toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}

          {workoutData.length > 0 && (
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {workoutData.length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Workouts
                  </Typography>
                  <Typography variant="body2">
                    {formatNumber(workoutData.reduce((sum, w) => sum + (w.Calories || 0), 0))} total calories
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}

          {sleepData.length > 0 && (
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {formatNumber(sleepData.reduce((sum, s) => sum + (s['Total sleep time (min)'] || 0), 0) / sleepData.length / 60)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Avg Sleep Duration (hours)
                  </Typography>
                  <Typography variant="body2">
                    {sleepData.length} nights recorded
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Paper>

      <ChartModal
        open={openModal}
        onClose={closeChartModal}
        title={modalTitle}
        chartComponent={modalChart}
      />
    </>
  );
};

export default AdvancedAnalytics;
