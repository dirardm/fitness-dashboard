import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Collapse,
  IconButton,
  Tooltip,
  Button,
  useTheme,
} from '@mui/material';
import {
  ExpandLess,
  ExpandMore,
  CloudUpload as UploadIcon,
  DeleteSweep as ClearIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import FileUpload from '../components/FileUpload';
import SummaryView from '../components/SummaryView';
import WorkoutAnalysis from '../components/WorkoutAnalysis';
import SleepAnalysis from '../components/SleepAnalysis';
import HeartRateAnalysis from '../components/HeartRateAnalysis';
import AdvancedAnalytics from '../components/AdvancedAnalytics';
import WeeklyTrends from '../components/WeeklyTrends';
import CorrelationHeatmap from '../components/CorrelationHeatmap';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { useData } from '../context/DataContext';
import { mocha } from '../theme';

import '../utils/chartSetup';

const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';
  const {
    filteredWorkoutData,
    filteredSleepData,
    filteredHeartRateData,
    hasData,
    clearData,
  } = useData();
  const [showUpload, setShowUpload] = useState(true);

  const borderColor = dark ? 'rgba(108,112,134,0.22)' : 'rgba(109,40,217,0.1)';

  return (
    <Box>
      {/* Upload panel */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          position: 'relative',
          bgcolor: dark ? mocha.surface0 : 'white',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: showUpload ? 2 : 0,
            cursor: 'pointer',
          }}
          onClick={() => setShowUpload(v => !v)}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <UploadIcon
              sx={{ color: dark ? mocha.mauve : '#7c3aed', fontSize: 20 }}
            />
            <Typography sx={{ fontWeight: 600 }} variant="body2">
              {hasData ? 'Manage Data Files' : 'Upload Data Files'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {hasData && (
              <Tooltip title="Clear all data">
                <IconButton
                  size="small"
                  onClick={e => { e.stopPropagation(); clearData(); }}
                  sx={{ color: 'text.secondary' }}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <IconButton size="small" sx={{ color: 'text.secondary' }}>
              {showUpload ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
            </IconButton>
          </Box>
        </Box>

        <Collapse in={showUpload}>
          <FileUpload />
        </Collapse>
      </Paper>

      {hasData ? (
        <Box>
          {/* Summary stat cards */}
          <Box sx={{ mb: 4 }}>
            <ErrorBoundary label="Summary">
              <SummaryView
                workoutData={filteredWorkoutData}
                sleepData={filteredSleepData}
                heartRateData={filteredHeartRateData}
              />
            </ErrorBoundary>
          </Box>

          {/* Weekly Trends */}
          <Box sx={{ mb: 3 }}>
            <ErrorBoundary label="Weekly Trends">
              <WeeklyTrends workoutData={filteredWorkoutData} sleepData={filteredSleepData} />
            </ErrorBoundary>
          </Box>

          {/* Previews header */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 2,
              pb: 1,
              borderBottom: `1px solid ${borderColor}`,
            }}
          >
            <Typography
              variant="overline"
              sx={{ color: 'text.secondary', letterSpacing: '0.1em' }}
            >
              Quick Previews
            </Typography>
          </Box>

          <Grid container spacing={2.5} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, lg: 6 }}>
              <ErrorBoundary label="Workout preview">
                <WorkoutAnalysis data={filteredWorkoutData} preview />
              </ErrorBoundary>
              <Box sx={{ mt: 1, textAlign: 'right' }}>
                <Button component={Link} to="/workouts" size="small" sx={{ color: dark ? mocha.mauve : '#7c3aed', fontSize: '0.75rem' }}>
                  Full analysis →
                </Button>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, lg: 6 }}>
              <ErrorBoundary label="Sleep preview">
                <SleepAnalysis data={filteredSleepData} preview />
              </ErrorBoundary>
              <Box sx={{ mt: 1, textAlign: 'right' }}>
                <Button component={Link} to="/sleep" size="small" sx={{ color: dark ? mocha.mauve : '#7c3aed', fontSize: '0.75rem' }}>
                  Full analysis →
                </Button>
              </Box>
            </Grid>
            <Grid size={12}>
              <ErrorBoundary label="Heart Rate preview">
                <HeartRateAnalysis data={filteredHeartRateData} preview />
              </ErrorBoundary>
              <Box sx={{ mt: 1, textAlign: 'right' }}>
                <Button component={Link} to="/heartrate" size="small" sx={{ color: dark ? mocha.mauve : '#7c3aed', fontSize: '0.75rem' }}>
                  Full analysis →
                </Button>
              </Box>
            </Grid>
          </Grid>

          {/* Correlation Heatmap */}
          <Box sx={{ mb: 3 }}>
            <ErrorBoundary label="Correlation Heatmap">
              <CorrelationHeatmap workoutData={filteredWorkoutData} sleepData={filteredSleepData} />
            </ErrorBoundary>
          </Box>

          {/* Advanced analytics */}
          <Box
            sx={{
              pb: 1,
              mb: 2,
              borderBottom: `1px solid ${borderColor}`,
            }}
          >
            <Typography
              variant="overline"
              sx={{ color: 'text.secondary', letterSpacing: '0.1em' }}
            >
              Advanced Analytics
            </Typography>
          </Box>
          <ErrorBoundary label="Advanced Analytics">
            <AdvancedAnalytics
              workoutData={filteredWorkoutData}
              sleepData={filteredSleepData}
              heartRateData={filteredHeartRateData}
            />
          </ErrorBoundary>
        </Box>
      ) : (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            color: 'text.secondary',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }} gutterBottom>
            No data loaded yet
          </Typography>
          <Typography variant="body2">
            Upload your CSV files above to start exploring your fitness insights.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default DashboardPage;
