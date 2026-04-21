import React, { useState, useCallback } from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import { Fullscreen } from '@mui/icons-material';
import { Doughnut, Bar } from 'react-chartjs-2';
import { WorkoutData } from '../types';
import '../utils/chartSetup';
import { formatNumber, formatBPM } from '../utils/formatters';
import ChartModal from './ChartModal';
import { mocha, getChartColors, getChartGrid, getChartText, getChartTooltipBg } from '../theme';

interface WorkoutAnalysisProps {
  data: WorkoutData[];
  preview?: boolean;
}

const WorkoutAnalysis: React.FC<WorkoutAnalysisProps> = ({ data, preview = false }) => {
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
  const colors = getChartColors(dark);

  if (data.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Workout Analysis</Typography>
        <Typography color="text.secondary" variant="body2">No workout data in the selected range.</Typography>
      </Paper>
    );
  }

  const workoutTypes = data.reduce((acc, w) => {
    const t = w['Workout Type'];
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const tooltipBase = {
    backgroundColor: tooltipBg,
    titleColor: dark ? mocha.text : '#1e1b4b',
    bodyColor: dark ? mocha.subtext0 : '#6b7280',
    borderColor: dark ? mocha.surface1 : '#e5e7eb',
    borderWidth: 1,
  };

  const pieData = {
    labels: Object.keys(workoutTypes),
    datasets: [{
      data: Object.values(workoutTypes),
      backgroundColor: colors.map(c => `${c}cc`),
      borderColor: colors,
      borderWidth: 1,
    }],
  };
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' as const, labels: { color: textColor, boxWidth: 12, padding: 12, font: { size: 12 } } },
      title: { display: false },
      tooltip: { ...tooltipBase, callbacks: {
        label: (ctx: any) => {
          const total = (ctx.dataset.data as number[]).reduce((a: number, b: number) => a + b, 0);
          return `${ctx.label}: ${ctx.raw} (${Math.round(((ctx.raw as number) / total) * 100)}%)`;
        },
      }},
    },
  };

  function getISOWeek(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const y = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - y.getTime()) / 86400000 + 1) / 7);
  }

  const weeklyData = data.reduce((acc, w) => {
    try {
      const [day, month, year] = w.Date.split('/').map(Number);
      const d = new Date(year, month - 1, day);
      const lbl = `W${getISOWeek(d)} ${year}`;
      if (!acc[lbl]) acc[lbl] = 0;
      acc[lbl] += w.Calories || 0;
    } catch { /* skip */ }
    return acc;
  }, {} as Record<string, number>);

  const barAccent = dark ? mocha.mauve : '#7c3aed';
  const barData = {
    labels: Object.keys(weeklyData),
    datasets: [{
      label: 'Calories',
      data: Object.values(weeklyData),
      backgroundColor: `${barAccent}bb`,
      borderColor: barAccent,
      borderWidth: 1,
      borderRadius: 6,
      hoverBackgroundColor: barAccent,
    }],
  };
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const, labels: { color: textColor, font: { size: 12 } } },
      title: { display: false },
      tooltip: { ...tooltipBase, callbacks: { label: (ctx: any) => `Calories: ${(ctx.raw as number).toLocaleString()}` } },
    },
    scales: {
      y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: textColor, font: { size: 11 } } },
      x: { grid: { color: gridColor }, ticks: { color: textColor, font: { size: 11 }, maxRotation: 45 } },
    },
  };

  const zoneColors = dark
    ? [mocha.teal, mocha.blue, mocha.peach, mocha.yellow, mocha.red]
    : ['#0d9488', '#3b82f6', '#f97316', '#eab308', '#ef4444'];

  const getZoneAvg = (zone: string) => {
    const valid = data.filter(w => typeof w[zone as keyof WorkoutData] === 'string');
    if (!valid.length) return 0;
    return valid.reduce((s, w) => s + (parseFloat((w[zone as keyof WorkoutData] as string).replace('%', '')) || 0), 0) / valid.length;
  };

  const hrZoneData = {
    labels: ['Zone 1', 'Zone 2', 'Zone 3', 'Zone 4', 'Zone 5'],
    datasets: [{
      data: ['Zone 1 %', 'Zone 2 %', 'Zone 3 %', 'Zone 4 %', 'Zone 5 %'].map(getZoneAvg),
      backgroundColor: zoneColors.map(c => `${c}cc`),
      borderColor: zoneColors,
      borderWidth: 1,
    }],
  };
  const hrZoneOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' as const, labels: { color: textColor, boxWidth: 12, font: { size: 12 } } },
      title: { display: false },
      tooltip: { ...tooltipBase, callbacks: { label: (ctx: any) => `${ctx.label}: ${(ctx.raw as number).toFixed(1)}%` } },
    },
  };

  const calcSpeed = (dist: number, dur: string) => {
    try {
      const [h, m, s] = dur.split(':').map(Number);
      return dist / (h + m / 60 + s / 3600);
    } catch { return 0; }
  };

  const getCadence = (w: WorkoutData) =>
    w['Avg cadence'] || (w as any)['Average Cadence'] || (w as any)['Cadence'] || 0;

  const fsBtnSx = {
    position: 'absolute' as const, top: 8, right: 8,
    bgcolor: dark ? 'rgba(49,50,68,0.85)' : 'rgba(255,255,255,0.85)',
    backdropFilter: 'blur(4px)',
    '&:hover': { bgcolor: dark ? mocha.surface1 : '#f3f4f6' },
  };

  const withFS = (title: string, chart: React.ReactNode) => (
    <Box sx={{ position: 'relative', height: '100%' }}>
      {chart}
      <Tooltip title="Fullscreen">
        <IconButton sx={fsBtnSx} onClick={() => openChartModal(title, chart)} size="small">
          <Fullscreen fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );

  const workoutTypeChart = <Doughnut data={pieData} options={pieOptions} />;
  const weeklyCalChart = <Bar data={barData} options={barOptions} />;
  const hrZoneChart = <Doughnut data={hrZoneData} options={hrZoneOptions} />;

  return (
    <>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Workout Analysis</Typography>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ height: preview ? 300 : 400 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Workout Type Distribution</Typography>
                <Box sx={{ height: preview ? 230 : 330 }}>{withFS('Workout Types', workoutTypeChart)}</Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ height: preview ? 300 : 400 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Weekly Calories</Typography>
                <Box sx={{ height: preview ? 230 : 330 }}>{withFS('Weekly Calories', weeklyCalChart)}</Box>
              </CardContent>
            </Card>
          </Grid>

          {!preview && (
            <>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ height: 400 }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>HR Zone Distribution (avg %)</Typography>
                    <Box sx={{ height: 330 }}>{withFS('HR Zones', hrZoneChart)}</Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={12}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Recent Workouts</Typography>
                    <TableContainer sx={{ maxHeight: 400 }}>
                      <Table stickyHeader size="small">
                        <TableHead>
                          <TableRow>
                            {['Date','Type','Duration','Dist (km)','Cals','Avg HR','Speed (km/h)','Cadence (spm)'].map(h => (
                              <TableCell key={h}>{h}</TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {data.slice(-10).map((w, i) => (
                            <TableRow key={i} sx={{ '&:hover': { bgcolor: dark ? 'rgba(203,166,247,0.06)' : 'rgba(124,58,237,0.04)' } }}>
                              <TableCell>{w.Date}</TableCell>
                              <TableCell>
                                <Chip label={w['Workout Type']} size="small"
                                  sx={{ bgcolor: dark ? mocha.surface1 : 'rgba(124,58,237,0.1)', color: dark ? mocha.subtext1 : '#7c3aed', border: 'none', fontSize: '0.7rem' }} />
                              </TableCell>
                              <TableCell>{w.Duration}</TableCell>
                              <TableCell>{formatNumber(w.Distance)}</TableCell>
                              <TableCell>{formatNumber(w.Calories)}</TableCell>
                              <TableCell>{formatBPM(w['Avg HR'])}</TableCell>
                              <TableCell>{formatNumber((w as any)['Avg Speed'] || (w as any)['Average Speed'] || calcSpeed(w.Distance, w.Duration))}</TableCell>
                              <TableCell>{formatNumber(getCadence(w))}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
            </>
          )}
        </Grid>
      </Paper>
      <ChartModal open={openModal} onClose={closeChartModal} title={modalTitle} chartComponent={modalChart} />
    </>
  );
};

export default WorkoutAnalysis;
