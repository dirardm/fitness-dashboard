import React from 'react';
import { Box, Typography, Breadcrumbs, Link as MuiLink, useTheme } from '@mui/material';
import { Link } from 'react-router-dom';
import WorkoutAnalysis from '../components/WorkoutAnalysis';
import PersonalRecords from '../components/PersonalRecords';
import ACWRChart from '../components/ACWRChart';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { useData } from '../context/DataContext';
import { mocha } from '../theme';

import '../utils/chartSetup';

const WorkoutsPage: React.FC = () => {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';
  const { filteredWorkoutData, workoutData, hasWorkoutData } = useData();

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 1.5, fontSize: '0.8rem' }}>
        <MuiLink component={Link} to="/" underline="hover" color="inherit" sx={{ fontSize: '0.8rem' }}>
          Dashboard
        </MuiLink>
        <Typography color="text.primary" sx={{ fontSize: '0.8rem' }}>Workouts</Typography>
      </Breadcrumbs>

      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, color: dark ? mocha.mauve : '#7c3aed', letterSpacing: '-0.03em', mb: 0.5 }}
        >
          Workout Analysis
        </Typography>
        {hasWorkoutData && (
          <Typography variant="body2" color="text.secondary">
            {filteredWorkoutData.length} workouts in selected range
          </Typography>
        )}
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <ErrorBoundary label="Workout Analysis">
          <WorkoutAnalysis data={filteredWorkoutData} />
        </ErrorBoundary>

        <ErrorBoundary label="Personal Records">
          <PersonalRecords workoutData={filteredWorkoutData} />
        </ErrorBoundary>

        <ErrorBoundary label="ACWR Chart">
          <ACWRChart workoutData={workoutData} />
        </ErrorBoundary>
      </Box>
    </Box>
  );
};

export default WorkoutsPage;
