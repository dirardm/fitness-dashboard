import React from 'react';
import { Paper, Typography, Box, Tooltip, useTheme } from '@mui/material';
import { WorkoutData, SleepData } from '../types';
import { computeCorrelationMatrix } from '../utils/analytics';
import { mocha } from '../theme';

interface CorrelationHeatmapProps {
  workoutData: WorkoutData[];
  sleepData: SleepData[];
}

function correlationColor(r: number, dark: boolean): string {
  const clamped = Math.max(-1, Math.min(1, r));
  if (clamped >= 0) {
    const t = clamped;
    if (dark) {
      const g = Math.round(166 + t * (255 - 166));
      const b = Math.round(247 * (1 - t * 0.7));
      return `rgba(166,${g},${b},${0.15 + t * 0.6})`;
    }
    return `rgba(16,185,129,${0.1 + t * 0.7})`;
  } else {
    const t = -clamped;
    if (dark) {
      return `rgba(243,139,168,${0.1 + t * 0.65})`;
    }
    return `rgba(239,68,68,${0.1 + t * 0.7})`;
  }
}

const CorrelationHeatmap: React.FC<CorrelationHeatmapProps> = ({ workoutData, sleepData }) => {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';
  const { labels, matrix } = computeCorrelationMatrix(workoutData, sleepData);

  if (labels.length === 0) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Correlation Heatmap</Typography>
        <Typography variant="body2" color="text.secondary">
          Upload both workout and sleep data with overlapping dates to see correlations.
        </Typography>
      </Paper>
    );
  }

  const cellSize = 52;
  const labelWidth = 80;

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>Correlation Heatmap</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Pearson correlation between workout and sleep metrics
      </Typography>

      <Box sx={{ overflowX: 'auto' }}>
        <Box sx={{ display: 'inline-block', minWidth: labelWidth + cellSize * labels.length }}>
          {/* Column headers */}
          <Box sx={{ display: 'flex', ml: `${labelWidth}px` }}>
            {labels.map(label => (
              <Box
                key={label}
                sx={{
                  width: cellSize,
                  textAlign: 'center',
                  pb: 0.5,
                  fontSize: '0.65rem',
                  color: 'text.secondary',
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                  transform: 'rotate(-30deg)',
                  transformOrigin: 'bottom left',
                  height: 44,
                  display: 'flex',
                  alignItems: 'flex-end',
                  whiteSpace: 'nowrap',
                }}
              >
                {label}
              </Box>
            ))}
          </Box>

          {/* Rows */}
          {labels.map((rowLabel, i) => (
            <Box key={rowLabel} sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ width: labelWidth, fontSize: '0.7rem', color: 'text.secondary', fontWeight: 600, pr: 1, textAlign: 'right', flexShrink: 0 }}>
                {rowLabel}
              </Box>
              {labels.map((_, j) => {
                const r = matrix[i][j];
                const isIdentity = i === j;
                return (
                  <Tooltip
                    key={j}
                    title={isIdentity ? rowLabel : `${rowLabel} ↔ ${labels[j]}: r = ${r.toFixed(2)}`}
                    arrow
                  >
                    <Box
                      sx={{
                        width: cellSize,
                        height: cellSize,
                        bgcolor: isIdentity
                          ? (dark ? mocha.surface1 : '#f3f4f6')
                          : correlationColor(r, dark),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        color: isIdentity ? 'text.disabled' : (Math.abs(r) > 0.4 ? (dark ? mocha.text : '#111') : 'text.secondary'),
                        border: `1px solid ${dark ? 'rgba(108,112,134,0.12)' : 'rgba(0,0,0,0.05)'}`,
                        cursor: 'default',
                        transition: 'opacity 0.15s',
                        '&:hover': { opacity: 0.8 },
                      }}
                    >
                      {isIdentity ? '—' : r.toFixed(2)}
                    </Box>
                  </Tooltip>
                );
              })}
            </Box>
          ))}
        </Box>
      </Box>

      {/* Legend */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
        <Typography variant="caption" color="text.secondary">−1</Typography>
        <Box
          sx={{
            flex: 1,
            height: 8,
            borderRadius: 1,
            background: dark
              ? `linear-gradient(to right, rgba(243,139,168,0.7), rgba(49,50,68,0.3), rgba(166,227,161,0.7))`
              : `linear-gradient(to right, rgba(239,68,68,0.7), rgba(243,244,246,0.5), rgba(16,185,129,0.7))`,
          }}
        />
        <Typography variant="caption" color="text.secondary">+1</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
          negative ← → positive
        </Typography>
      </Box>
    </Paper>
  );
};

export default CorrelationHeatmap;
