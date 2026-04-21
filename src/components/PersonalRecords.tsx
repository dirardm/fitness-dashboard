import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  useTheme,
} from '@mui/material';
import { EmojiEvents as TrophyIcon } from '@mui/icons-material';
import { WorkoutData } from '../types';
import { findPersonalRecords, detectAnomalies } from '../utils/analytics';
import { mocha } from '../theme';

interface PersonalRecordsProps {
  workoutData: WorkoutData[];
}

const PR_COLORS_DARK = [mocha.yellow, mocha.peach, mocha.green, mocha.blue];
const PR_COLORS_LIGHT = ['#eab308', '#f97316', '#10b981', '#3b82f6'];

const PersonalRecords: React.FC<PersonalRecordsProps> = ({ workoutData }) => {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';
  const records = findPersonalRecords(workoutData);
  const anomalies = detectAnomalies(workoutData);

  if (records.length === 0) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Personal Records</Typography>
        <Typography variant="body2" color="text.secondary">Upload workout data to see your personal records.</Typography>
      </Paper>
    );
  }

  const colors = dark ? PR_COLORS_DARK : PR_COLORS_LIGHT;

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <TrophyIcon sx={{ color: dark ? mocha.yellow : '#eab308', fontSize: 20 }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>Personal Records</Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: anomalies.length > 0 ? 3 : 0 }}>
        {records.map((rec, i) => (
          <Grid size={{ xs: 6, sm: 3 }} key={rec.metric}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', py: 2.5, px: 1.5 }}>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700, color: colors[i % colors.length], letterSpacing: '-0.04em', lineHeight: 1.1, mb: 0.5 }}
                >
                  {rec.formatted}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.8rem' }}>
                  {rec.metric}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }}>
                  {rec.date}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {anomalies.length > 0 && (
        <>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: 'text.secondary', letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.7rem' }}>
            Outlier sessions (z-score ≥ 2.0)
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            {anomalies.map((a, i) => (
              <Box
                key={i}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  px: 2,
                  py: 1,
                  borderRadius: 1.5,
                  bgcolor: dark ? 'rgba(108,112,134,0.1)' : 'rgba(0,0,0,0.03)',
                  border: `1px solid ${dark ? 'rgba(108,112,134,0.15)' : 'rgba(0,0,0,0.06)'}`,
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ minWidth: 72 }}>
                  {a.date}
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, color: a.direction === 'high' ? (dark ? mocha.peach : '#f97316') : (dark ? mocha.blue : '#3b82f6') }}>
                  {a.direction === 'high' ? '↑' : '↓'} {a.value.toLocaleString()} kcal
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                  z={a.zScore.toFixed(1)}
                </Typography>
              </Box>
            ))}
          </Box>
        </>
      )}
    </Paper>
  );
};

export default PersonalRecords;
