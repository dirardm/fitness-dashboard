import React, { useState, useEffect, useCallback } from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import { Fullscreen } from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import { TransformedHeartRateData } from '../types';
import '../utils/chartSetup';
import { formatBPM } from '../utils/formatters';
import ChartModal from './ChartModal';
import { mocha, getChartGrid, getChartText, getChartTooltipBg } from '../theme';

interface HeartRateAnalysisProps {
  data: TransformedHeartRateData[];
  preview?: boolean;
}

const HeartRateAnalysis: React.FC<HeartRateAnalysisProps> = ({ data, preview = false }) => {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [openModal, setOpenModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalChart, setModalChart] = useState<React.ReactNode>(null);

  const gridColor = getChartGrid(dark);
  const textColor = getChartText(dark);
  const tooltipBg = getChartTooltipBg(dark);

  const openChartModal = useCallback((title: string, chart: React.ReactNode) => {
    setModalTitle(title); setModalChart(chart); setOpenModal(true);
  }, []);
  const closeChartModal = useCallback(() => setOpenModal(false), []);

  useEffect(() => {
    if (data.length > 0 && !selectedDate) {
      const dates = Array.from(new Set(data.map(d => d.date))).sort();
      if (dates.length > 0) setSelectedDate(dates[dates.length - 1]);
    }
  }, [data, selectedDate]);

  if (data.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Heart Rate Analysis</Typography>
        <Typography color="text.secondary" variant="body2">No heart rate data in the selected range.</Typography>
      </Paper>
    );
  }

  const dates = Array.from(new Set(data.map(d => d.date))).sort();
  const dailyData = data.filter(d => d.date === selectedDate && d.heartRate > 0);

  const hrColor = dark ? mocha.red : '#ef4444';

  const timeLabels = dailyData.map(d => {
    const h = Math.floor(d.time / 60);
    const m = d.time % 60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
  });

  const lineData = {
    labels: timeLabels,
    datasets: [{
      label: 'Heart Rate (BPM)',
      data: dailyData.map(d => d.heartRate),
      fill: true,
      backgroundColor: `${hrColor}18`,
      borderColor: hrColor,
      borderWidth: 2,
      pointBackgroundColor: hrColor,
      pointBorderColor: dark ? mocha.surface0 : '#fff',
      pointRadius: 3,
      pointHoverRadius: 5,
      tension: 0.4,
    }],
  };
  const lineOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const, labels: { color: textColor, font: { size: 12 } } },
      title: { display: false },
      tooltip: {
        backgroundColor: tooltipBg,
        titleColor: dark ? mocha.text : '#1e1b4b',
        bodyColor: dark ? mocha.subtext0 : '#6b7280',
        borderColor: dark ? mocha.surface1 : '#e5e7eb',
        borderWidth: 1,
        callbacks: { label: (ctx: any) => `HR: ${ctx.raw as number} BPM` },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: gridColor },
        ticks: { color: textColor },
        title: { display: true, text: 'BPM', color: textColor },
      },
      x: {
        grid: { color: gridColor },
        ticks: { color: textColor, maxRotation: 45 },
        title: { display: true, text: 'Time (5-min splits)', color: textColor },
      },
    },
  };

  const avgBPM = dailyData.length > 0 ? dailyData.reduce((s, d) => s + d.heartRate, 0) / dailyData.length : 0;
  const maxBPM = dailyData.length > 0 ? Math.max(...dailyData.map(d => d.heartRate)) : 0;
  const minBPM = dailyData.length > 0 ? Math.min(...dailyData.map(d => d.heartRate)) : 0;

  const fsBtnSx = {
    position: 'absolute' as const, top: 8, right: 8,
    bgcolor: dark ? 'rgba(49,50,68,0.85)' : 'rgba(255,255,255,0.85)',
    backdropFilter: 'blur(4px)',
    '&:hover': { bgcolor: dark ? mocha.surface1 : '#f3f4f6' },
  };

  const chart = <Line data={lineData} options={lineOptions} />;

  return (
    <>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Heart Rate Analysis</Typography>
          <FormControl sx={{ minWidth: 140 }} size="small">
            <InputLabel>Workout Date</InputLabel>
            <Select value={selectedDate} label="Workout Date" onChange={e => setSelectedDate(e.target.value)}>
              {dates.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>

        <Grid container spacing={2.5}>
          <Grid size={12}>
            <Card sx={{ height: preview ? 300 : 400 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Heart Rate — {selectedDate}
                </Typography>
                <Box sx={{ height: preview ? 225 : 325 }}>
                  {dailyData.length > 0 ? (
                    <Box sx={{ position: 'relative', height: '100%' }}>
                      {chart}
                      <Tooltip title="Fullscreen">
                        <IconButton sx={fsBtnSx} onClick={() => openChartModal(`Heart Rate — ${selectedDate}`, chart)} size="small">
                          <Fullscreen fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <Typography color="text.secondary" variant="body2">
                        {selectedDate ? `No data for ${selectedDate}` : 'Select a date'}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {!preview && dailyData.length > 0 && (
            <Grid size={12}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
                    Session Stats — {selectedDate}
                  </Typography>
                  <Grid container spacing={2}>
                    {[
                      { label: 'Average BPM', value: formatBPM(avgBPM), color: hrColor },
                      { label: 'Max BPM', value: formatBPM(maxBPM), color: dark ? mocha.peach : '#f97316' },
                      { label: 'Min BPM', value: formatBPM(minBPM), color: dark ? mocha.green : '#10b981' },
                    ].map(stat => (
                      <Grid size={{ xs: 12, sm: 4 }} key={stat.label}>
                        <Box sx={{ textAlign: 'center', py: 1 }}>
                          <Typography variant="h4" sx={{ fontWeight: 700, color: stat.color, letterSpacing: '-0.04em' }}>
                            {stat.value}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
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

export default HeartRateAnalysis;
