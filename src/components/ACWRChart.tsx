import React, { useState, useCallback } from 'react';
import {
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import { Fullscreen } from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import { WorkoutData } from '../types';
import '../utils/chartSetup';
import { calculateACWR } from '../utils/analytics';
import ChartModal from './ChartModal';
import { mocha, getChartGrid, getChartText, getChartTooltipBg } from '../theme';

interface ACWRChartProps {
  workoutData: WorkoutData[];
}

const ACWRChart: React.FC<ACWRChartProps> = ({ workoutData }) => {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';
  const [openModal, setOpenModal] = useState(false);
  const [modalChart, setModalChart] = useState<React.ReactNode>(null);

  const openChartModal = useCallback((chart: React.ReactNode) => {
    setModalChart(chart);
    setOpenModal(true);
  }, []);
  const closeChartModal = useCallback(() => setOpenModal(false), []);

  const gridColor = getChartGrid(dark);
  const textColor = getChartText(dark);
  const tooltipBg = getChartTooltipBg(dark);

  const data = calculateACWR(workoutData);

  if (data.length === 0) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Training Load (ACWR)</Typography>
        <Typography variant="body2" color="text.secondary">
          At least 14 workout sessions required to calculate ACWR.
        </Typography>
      </Paper>
    );
  }

  const acwrColor = dark ? mocha.blue : '#3b82f6';
  const safeZoneColor = dark ? 'rgba(166,227,161,0.12)' : 'rgba(16,185,129,0.08)';

  const chartData = {
    labels: data.map(d => d.date),
    datasets: [
      {
        label: 'ACWR',
        data: data.map(d => d.acwr),
        fill: false,
        borderColor: acwrColor,
        borderWidth: 2.5,
        pointBackgroundColor: data.map(d =>
          d.acwr < 0.8 ? (dark ? mocha.blue : '#3b82f6') :
          d.acwr > 1.3 ? (dark ? mocha.red : '#ef4444') :
          (dark ? mocha.green : '#10b981')
        ),
        pointBorderColor: dark ? mocha.surface0 : '#fff',
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const, labels: { color: textColor, font: { size: 12 } } },
      title: { display: false },
      tooltip: {
        backgroundColor: tooltipBg,
        titleColor: dark ? mocha.text : '#1e1b4b',
        bodyColor: dark ? mocha.subtext0 : '#6b7280',
        borderColor: dark ? mocha.surface1 : '#e5e7eb',
        borderWidth: 1,
        callbacks: {
          label: (ctx: any) => {
            const v = ctx.raw as number;
            const zone = v < 0.8 ? 'Undertrained' : v > 1.3 ? 'Overreaching' : 'Optimal';
            return [`ACWR: ${v.toFixed(2)}`, `Zone: ${zone}`];
          },
        },
      },
    },
    scales: {
      y: {
        grid: { color: gridColor },
        ticks: { color: textColor },
        title: { display: true, text: 'ACWR (7d acute / 28d chronic)', color: textColor, font: { size: 11 } },
        min: 0,
        max: Math.max(2, ...data.map(d => d.acwr)) + 0.1,
      },
      x: {
        grid: { color: gridColor },
        ticks: { color: textColor, maxRotation: 45, font: { size: 10 } },
      },
    },
  };

  const chart = <Line data={chartData} options={chartOptions} />;

  const fsBtnSx = {
    position: 'absolute' as const,
    top: 8,
    right: 8,
    bgcolor: dark ? 'rgba(49,50,68,0.85)' : 'rgba(255,255,255,0.85)',
    backdropFilter: 'blur(4px)',
    '&:hover': { bgcolor: dark ? mocha.surface1 : '#f3f4f6' },
  };

  return (
    <>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>Training Load (ACWR)</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Acute:Chronic Workload Ratio — optimal zone is 0.8–1.3
        </Typography>

        {/* Risk zone legend */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          {[
            { label: '< 0.8 Undertrained', color: dark ? mocha.blue : '#3b82f6' },
            { label: '0.8–1.3 Optimal', color: dark ? mocha.green : '#10b981' },
            { label: '> 1.3 Overreaching', color: dark ? mocha.red : '#ef4444' },
          ].map(zone => (
            <Box key={zone.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: zone.color }} />
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>{zone.label}</Typography>
            </Box>
          ))}
        </Box>

        <Card sx={{ height: 320 }}>
          <CardContent>
            <Box sx={{ height: 280, position: 'relative', bgcolor: safeZoneColor, borderRadius: 1 }}>
              {chart}
              <Tooltip title="Fullscreen">
                <IconButton sx={fsBtnSx} onClick={() => openChartModal(chart)} size="small">
                  <Fullscreen fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </CardContent>
        </Card>
      </Paper>

      <ChartModal open={openModal} onClose={closeChartModal} title="Training Load (ACWR)" chartComponent={modalChart} />
    </>
  );
};

export default ACWRChart;
