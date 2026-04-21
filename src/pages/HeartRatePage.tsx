import React from 'react';
import { Box, Typography, Breadcrumbs, Link as MuiLink, useTheme } from '@mui/material';
import { Link } from 'react-router-dom';
import HeartRateAnalysis from '../components/HeartRateAnalysis';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { useData } from '../context/DataContext';
import { mocha } from '../theme';

import '../utils/chartSetup';

const HeartRatePage: React.FC = () => {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';
  const { filteredHeartRateData, hasHeartRateData } = useData();

  const dateCount = new Set(filteredHeartRateData.map(d => d.date)).size;

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 1.5, fontSize: '0.8rem' }}>
        <MuiLink component={Link} to="/" underline="hover" color="inherit" sx={{ fontSize: '0.8rem' }}>
          Dashboard
        </MuiLink>
        <Typography color="text.primary" sx={{ fontSize: '0.8rem' }}>Heart Rate</Typography>
      </Breadcrumbs>

      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, color: dark ? mocha.mauve : '#7c3aed', letterSpacing: '-0.03em', mb: 0.5 }}
        >
          Heart Rate Analysis
        </Typography>
        {hasHeartRateData && (
          <Typography variant="body2" color="text.secondary">
            {dateCount} workout day{dateCount !== 1 ? 's' : ''} in selected range
          </Typography>
        )}
      </Box>

      <ErrorBoundary label="Heart Rate Analysis">
        <HeartRateAnalysis data={filteredHeartRateData} />
      </ErrorBoundary>
    </Box>
  );
};

export default HeartRatePage;
