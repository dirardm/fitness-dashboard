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
  useTheme,
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
import { mocha, getChartGrid, getChartText, getChartTooltipBg } from '../theme';

interface AdvancedAnalyticsProps {
  workoutData: WorkoutData[];
  sleepData: SleepData[];
  heartRateData: TransformedHeartRateData[];
}

const AdvancedAnalytics: React.FC<AdvancedAnalyticsProps> = ({
  workoutData,
  sleepData,
  heartRateData: _heartRateData,
}) => {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';
  const [openModal, setOpenModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalChart, setModalChart] = useState<React.ReactNode>(null);

  const openChartModal = useCallback((title: string, chart: React.ReactNode) => {
    setModalTitle(title); setModalChart(chart); setOpenModal(true);
  }, []);
  const closeChartModal = useCallback(() => setOpenModal(false), []);

  const gridColor = getChartGrid(dark);
  const textColor = getChartText(dark);
  const tooltipBg = getChartTooltipBg(dark);

  if (workoutData.length === 0 && sleepData.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Advanced Analytics
        </Typography>
        <Typography color="text.secondary" variant="body2">
          Upload workout and sleep data to see advanced analytics.
        </Typography>
      </Paper>
    );
  }

  const trainingLoadData = calculateTrainingLoad(workoutData);
  const hrvTrends = calculateHRVTrends(sleepData);
  const intensityScore = calculateIntensityScore(workoutData);
  const recoveryScore = calculateRecoveryScore(sleepData, workoutData);
  const consistencyScore = calculateConsistencyScore(workoutData);

  const loadColor = dark ? mocha.blue : '#3b82f6';
  const tooltipBase = {
    backgroundColor: tooltipBg,
    titleColor: dark ? mocha.text : '#1e1b4b',
    bodyColor: dark ? mocha.subtext0 : '#6b7280',
    borderColor: dark ? mocha.surface1 : '#e5e7eb',
    borderWidth: 1,
  };

  const trainingLoadChartData = {
    labels: trainingLoadData.map(item => item.date),
    datasets: [
      {
        label: 'Training Load',
        data: trainingLoadData.map(item => item.load),
        fill: true,
        backgroundColor: `${loadColor}18`,
        borderColor: loadColor,
        borderWidth: 2,
        pointBackgroundColor: loadColor,
        pointBorderColor: dark ? mocha.surface0 : '#fff',
        pointRadius: 3,
        pointHoverRadius: 5,
        tension: 0.4,
      },
    ],
  };

  const trainingLoadOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const, labels: { color: textColor, font: { size: 12 } } },
      title: { display: false },
      tooltip: { ...tooltipBase, callbacks: { label: (ctx: any) => `Load: ${(ctx.raw as number).toLocaleString()}` } },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: gridColor },
        ticks: { color: textColor },
        title: { display: true, text: 'Training Load', color: textColor },
      },
      x: {
        grid: { color: gridColor },
        ticks: { color: textColor, maxRotation: 45 },
      },
    },
  };

  const intensityColors = dark
    ? [`${mocha.green}cc`, `${mocha.yellow}cc`, `${mocha.red}cc`]
    : ['#10b98199', '#eab30899', '#ef444499'];

  const intensityDistribution = {
    labels: ['Low Intensity', 'Moderate Intensity', 'High Intensity'],
    datasets: [
      {
        data: [
          workoutData.filter(w => calculateIntensityScore([w]).label === 'Low').length,
          workoutData.filter(w => calculateIntensityScore([w]).label === 'Moderate').length,
          workoutData.filter(w => calculateIntensityScore([w]).label === 'High').length,
        ],
        backgroundColor: intensityColors,
        borderColor: dark
          ? [mocha.green, mocha.yellow, mocha.red]
          : ['#10b981', '#eab308', '#ef4444'],
        borderWidth: 1,
      },
    ],
  };

  const intensityDistributionOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' as const, labels: { color: textColor, font: { size: 12 } } },
      title: { display: false },
      tooltip: {
        ...tooltipBase,
        callbacks: {
          label: (ctx: any) => {
            const total = (ctx.dataset.data as number[]).reduce((a: number, b: number) => a + b, 0);
            const pct = total > 0 ? Math.round(((ctx.raw as number) / total) * 100) : 0;
            return `${ctx.label as string}: ${ctx.raw as number} (${pct}%)`;
          },
        },
      },
    },
  };

  const fullscreenBtnSx = {
    position: 'absolute' as const,
    top: 8,
    right: 8,
    bgcolor: dark ? 'rgba(49,50,68,0.85)' : 'rgba(255,255,255,0.85)',
    backdropFilter: 'blur(4px)',
    '&:hover': { bgcolor: dark ? mocha.surface1 : '#f3f4f6' },
  };

  const renderWithFullscreen = (title: string, chart: React.ReactNode) => (
    <Box sx={{ position: 'relative', height: '100%' }}>
      {chart}
      <Tooltip title="Fullscreen">
        <IconButton sx={fullscreenBtnSx} onClick={() => openChartModal(title, chart)} size="small">
          <Fullscreen fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );

  const trainingLoadChart = <Line data={trainingLoadChartData} options={trainingLoadOptions} />;
  const intensityChart = <Doughnut data={intensityDistribution} options={intensityDistributionOptions} />;

  const scoreCards = [
    {
      label: 'Intensity Score',
      value: formatNumber(intensityScore.score),
      sub: intensityScore.label,
      color: dark ? mocha.yellow : '#eab308',
    },
    {
      label: 'Recovery Score',
      value: formatNumber(recoveryScore.score),
      sub: recoveryScore.label,
      color: dark ? mocha.green : '#10b981',
    },
    {
      label: 'Consistency Score',
      value: formatNumber(consistencyScore.score),
      sub: consistencyScore.label,
      color: dark ? mocha.sapphire : '#06b6d4',
    },
  ];

  return (
    <>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }} gutterBottom>
          Advanced Analytics
        </Typography>

        <Grid container spacing={2.5}>
          {scoreCards.map(card => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={card.label}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Typography
                    variant="h3"
                    sx={{ fontWeight: 700, color: card.color, letterSpacing: '-0.04em' }}
                  >
                    {card.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {card.label}
                  </Typography>
                  <Typography variant="caption" sx={{ color: card.color }}>
                    {card.sub}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}

          {trainingLoadData.length > 0 && (
            <Grid size={{ xs: 12, md: 8 }}>
              <Card sx={{ height: 400 }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Training Load Over Time
                  </Typography>
                  <Box sx={{ height: 330 }}>
                    {renderWithFullscreen('Training Load Over Time', trainingLoadChart)}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}

          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: 400 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Workout Intensity Distribution
                </Typography>
                <Box sx={{ height: 330 }}>
                  {renderWithFullscreen('Intensity Distribution', intensityChart)}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {hrvTrends.avgHRV > 0 && (
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Typography
                    variant="h3"
                    sx={{ fontWeight: 700, color: dark ? mocha.mauve : '#7c3aed', letterSpacing: '-0.04em' }}
                  >
                    {formatNumber(hrvTrends.avgHRV)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Average HRV
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: hrvTrends.trend > 0 ? (dark ? mocha.green : '#10b981') : (dark ? mocha.red : '#ef4444') }}
                  >
                    Trend: {hrvTrends.trend > 0 ? '↑' : '↓'} {Math.abs(hrvTrends.trend).toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}

          {workoutData.length > 0 && (
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Typography
                    variant="h3"
                    sx={{ fontWeight: 700, color: dark ? mocha.blue : '#3b82f6', letterSpacing: '-0.04em' }}
                  >
                    {workoutData.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Workouts
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatNumber(workoutData.reduce((s, w) => s + (w.Calories || 0), 0))} total calories
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}

          {sleepData.length > 0 && (
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Typography
                    variant="h3"
                    sx={{ fontWeight: 700, color: dark ? mocha.teal : '#0d9488', letterSpacing: '-0.04em' }}
                  >
                    {formatNumber(
                      sleepData.reduce((s, sl) => s + (sl['Total sleep time (min)'] || 0), 0) /
                        sleepData.length /
                        60
                    )}
                    <Typography component="span" variant="h6" sx={{ ml: 0.5 }} color="text.secondary">
                      hrs
                    </Typography>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg Sleep Duration
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {sleepData.length} nights recorded
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Paper>

      <ChartModal open={openModal} onClose={closeChartModal} title={modalTitle} chartComponent={modalChart} />
    </>
  );
};

export default AdvancedAnalytics;
