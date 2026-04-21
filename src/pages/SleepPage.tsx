import React from 'react';
import { Box, Typography, Breadcrumbs, Link as MuiLink, useTheme } from '@mui/material';
import { Link } from 'react-router-dom';
import SleepAnalysis from '../components/SleepAnalysis';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { useData } from '../context/DataContext';
import { mocha } from '../theme';

import '../utils/chartSetup';

const SleepPage: React.FC = () => {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';
  const { filteredSleepData, hasSleepData } = useData();

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 1.5, fontSize: '0.8rem' }}>
        <MuiLink component={Link} to="/" underline="hover" color="inherit" sx={{ fontSize: '0.8rem' }}>
          Dashboard
        </MuiLink>
        <Typography color="text.primary" sx={{ fontSize: '0.8rem' }}>Sleep</Typography>
      </Breadcrumbs>

      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, color: dark ? mocha.mauve : '#7c3aed', letterSpacing: '-0.03em', mb: 0.5 }}
        >
          Sleep Analysis
        </Typography>
        {hasSleepData && (
          <Typography variant="body2" color="text.secondary">
            {filteredSleepData.length} nights in selected range
          </Typography>
        )}
      </Box>

      <ErrorBoundary label="Sleep Analysis">
        <SleepAnalysis data={filteredSleepData} />
      </ErrorBoundary>
    </Box>
  );
};

export default SleepPage;
