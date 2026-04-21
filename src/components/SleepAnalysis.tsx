import React, { useState, useCallback } from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
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
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { SleepData } from '../types';
import '../utils/chartSetup';
import { formatNumber, formatHours, formatBPM } from '../utils/formatters';
import ChartModal from './ChartModal';
import { mocha, getChartGrid, getChartText, getChartTooltipBg } from '../theme';

interface SleepAnalysisProps {
  data: SleepData[];
  preview?: boolean;
}

const SleepAnalysis: React.FC<SleepAnalysisProps> = ({ data, preview = false }) => {
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

  if (data.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Sleep Analysis</Typography>
        <Typography color="text.secondary" variant="body2">No sleep data in the selected range.</Typography>
      </Paper>
    );
  }

  const chartData = data.map(s => ({
    date: s['Night from'],
    total: s['Total sleep time (min)'] / 60,
    light: s['Light sleep (min)'] / 60,
    deep: s['Deep sleep (min)'] / 60,
    rem: s['REM (min)'] / 60,
    quality: s['avg HR'],
    hrv: s['avg HR Variability'],
    respiratory: s['Respiratory rate'],
    fragmentation: s['Fragmentation'],
  })).slice(-14);

  const lightC = dark ? mocha.blue : '#3b82f6';
  const deepC  = dark ? mocha.teal : '#0d9488';
  const remC   = dark ? mocha.mauve : '#7c3aed';
  const qualC  = dark ? mocha.green : '#10b981';

  const tooltipBase = {
    backgroundColor: tooltipBg,
    titleColor: dark ? mocha.text : '#1e1b4b',
    bodyColor: dark ? mocha.subtext0 : '#6b7280',
    borderColor: dark ? mocha.surface1 : '#e5e7eb',
    borderWidth: 1,
  };

  const durationData = {
    labels: chartData.map(d => d.date),
    datasets: [
      { label: 'Light (hrs)', data: chartData.map(d => d.light), backgroundColor: `${lightC}99`, borderColor: lightC, borderWidth: 1 },
      { label: 'Deep (hrs)',  data: chartData.map(d => d.deep),  backgroundColor: `${deepC}99`,  borderColor: deepC,  borderWidth: 1 },
      { label: 'REM (hrs)',   data: chartData.map(d => d.rem),   backgroundColor: `${remC}99`,   borderColor: remC,   borderWidth: 1 },
    ],
  };
  const durationOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const, labels: { color: textColor, font: { size: 12 } } },
      title: { display: false },
      tooltip: { ...tooltipBase, callbacks: { label: (ctx: any) => `${ctx.dataset.label}: ${(ctx.raw as number).toFixed(1)} hrs` } },
    },
    scales: {
      y: { beginAtZero: true, stacked: true, grid: { color: gridColor }, ticks: { color: textColor } },
      x: { stacked: true, grid: { color: gridColor }, ticks: { color: textColor, maxRotation: 45 } },
    },
  };

  const qualityData = {
    labels: chartData.map(d => d.date),
    datasets: [{
      label: 'Avg Resting HR',
      data: chartData.map(d => d.quality),
      fill: true,
      backgroundColor: `${qualC}18`,
      borderColor: qualC,
      borderWidth: 2,
      pointBackgroundColor: qualC,
      pointBorderColor: dark ? mocha.surface0 : '#fff',
      pointRadius: 4,
      pointHoverRadius: 6,
      tension: 0.4,
    }],
  };
  const qualityOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const, labels: { color: textColor, font: { size: 12 } } },
      title: { display: false },
      tooltip: { ...tooltipBase, callbacks: { label: (ctx: any) => `Avg HR: ${(ctx.raw as number).toFixed(0)} BPM` } },
    },
    scales: {
      y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: textColor }, title: { display: true, text: 'BPM', color: textColor } },
      x: { grid: { color: gridColor }, ticks: { color: textColor, maxRotation: 45 } },
    },
  };

  const totalSleep = chartData.reduce((s, d) => s + d.total, 0);
  const stageData = {
    labels: ['Light', 'Deep', 'REM'],
    datasets: [{
      data: [
        (chartData.reduce((s, d) => s + d.light, 0) / totalSleep) * 100,
        (chartData.reduce((s, d) => s + d.deep, 0) / totalSleep) * 100,
        (chartData.reduce((s, d) => s + d.rem, 0) / totalSleep) * 100,
      ],
      backgroundColor: [`${lightC}cc`, `${deepC}cc`, `${remC}cc`],
      borderColor: [lightC, deepC, remC],
      borderWidth: 1,
    }],
  };
  const stageOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' as const, labels: { color: textColor, font: { size: 12 } } },
      title: { display: false },
      tooltip: { ...tooltipBase, callbacks: { label: (ctx: any) => `${ctx.label}: ${(ctx.raw as number).toFixed(1)}%` } },
    },
  };

  const avgSleep = chartData.reduce((s, d) => s + d.total, 0) / chartData.length;
  const avgDeep  = chartData.reduce((s, d) => s + d.deep, 0)  / chartData.length;
  const avgRem   = chartData.reduce((s, d) => s + d.rem, 0)   / chartData.length;

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

  const durationChart = <Bar data={durationData} options={durationOptions} />;
  const qualityChart  = <Line data={qualityData} options={qualityOptions} />;
  const stageChart    = <Doughnut data={stageData} options={stageOptions} />;

  return (
    <>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Sleep Analysis</Typography>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ height: preview ? 300 : 400 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Duration by Stage</Typography>
                <Box sx={{ height: preview ? 230 : 330 }}>{withFS('Sleep Duration', durationChart)}</Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ height: preview ? 300 : 400 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Resting Heart Rate</Typography>
                <Box sx={{ height: preview ? 230 : 330 }}>{withFS('Sleep Quality (Resting HR)', qualityChart)}</Box>
              </CardContent>
            </Card>
          </Grid>

          {!preview && (
            <>
              <Grid size={{ xs: 12, md: 4 }}>
                <Card sx={{ height: 300 }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Stage Distribution</Typography>
                    <Box sx={{ height: 230 }}>{withFS('Sleep Stage Distribution', stageChart)}</Box>
                  </CardContent>
                </Card>
              </Grid>
              {[
                { label: 'Avg Sleep Duration', value: formatNumber(avgSleep), unit: 'hrs', color: remC },
                { label: 'Avg Deep Sleep',     value: formatNumber(avgDeep),  unit: 'hrs', color: deepC },
                { label: 'Avg REM Sleep',      value: formatNumber(avgRem),   unit: 'hrs', color: lightC },
              ].map(stat => (
                <Grid size={{ xs: 12, md: 4 }} key={stat.label}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center', py: 3 }}>
                      <Typography variant="h3" sx={{ fontWeight: 700, color: stat.color, letterSpacing: '-0.04em' }}>
                        {stat.value}
                        <Typography component="span" variant="h6" sx={{ ml: 0.5, color: 'text.secondary' }}>{stat.unit}</Typography>
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{stat.label}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
              <Grid size={12}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Sleep Metrics Overview</Typography>
                    <TableContainer sx={{ maxHeight: 400 }}>
                      <Table stickyHeader size="small">
                        <TableHead>
                          <TableRow>
                            {['Date','Total (hrs)','Light (hrs)','Deep (hrs)','REM (hrs)','Avg HR','HRV','Resp Rate','Fragmentation'].map(h => (
                              <TableCell key={h}>{h}</TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {data.slice(-10).map((s, i) => (
                            <TableRow key={i} sx={{ '&:hover': { bgcolor: dark ? 'rgba(203,166,247,0.06)' : 'rgba(124,58,237,0.04)' } }}>
                              <TableCell>{s['Night from']}</TableCell>
                              <TableCell>{formatHours(s['Total sleep time (min)'] / 60)}</TableCell>
                              <TableCell>{formatHours(s['Light sleep (min)'] / 60)}</TableCell>
                              <TableCell>{formatHours(s['Deep sleep (min)'] / 60)}</TableCell>
                              <TableCell>{formatHours(s['REM (min)'] / 60)}</TableCell>
                              <TableCell>{formatBPM(s['avg HR'])}</TableCell>
                              <TableCell>{formatNumber(s['avg HR Variability'])}</TableCell>
                              <TableCell>{formatNumber(s['Respiratory rate'])}</TableCell>
                              <TableCell>{formatNumber(s['Fragmentation'])}</TableCell>
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

export default SleepAnalysis;
