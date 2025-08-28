import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
  IconButton,
  Fade,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  FitnessCenter as FitnessCenterIcon,
  Bedtime as SleepIcon,
  Favorite as HeartIcon,
  ShowChart as AnalyticsIcon,
  Refresh as RefreshIcon,
  CloudUpload as UploadIcon,
} from '@mui/icons-material';
import SummaryView from './SummaryView';
import WorkoutAnalysis from './WorkoutAnalysis';
import SleepAnalysis from './SleepAnalysis';
import HeartRateAnalysis from './HeartRateAnalysis';
import AdvancedAnalytics from './AdvancedAnalytics';
import DateRangeFilter from './DateRangeFilter';
import FileUpload from './FileUpload';
import { WorkoutData, SleepData, TransformedHeartRateData } from '../types';
import { filterDataByDateRange } from '../utils/csvParser';

// Import chart setup
import '../utils/chartSetup';

interface DashboardProps {
  onDataLoaded: (data: {
    workoutData: WorkoutData[];
    sleepData: SleepData[];
    heartRateData: TransformedHeartRateData[];
  }) => void;
  onRefresh: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const Dashboard: React.FC<DashboardProps> = ({ onDataLoaded, onRefresh }) => {
  const [tabValue, setTabValue] = useState(0);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [workoutData, setWorkoutData] = useState<WorkoutData[]>([]);
  const [sleepData, setSleepData] = useState<SleepData[]>([]);
  const [heartRateData, setHeartRateData] = useState<TransformedHeartRateData[]>([]);
  const [showUpload, setShowUpload] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Set default date range to last 30 days
  useEffect(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    setDateRange([startDate, endDate]);
  }, []);

  // Handle data loaded from FileUpload
  const handleDataLoaded = (data: {
    workoutData: WorkoutData[];
    sleepData: SleepData[];
    heartRateData: TransformedHeartRateData[];
  }) => {
    setWorkoutData(data.workoutData);
    setSleepData(data.sleepData);
    setHeartRateData(data.heartRateData);
    setShowUpload(false);
    onDataLoaded(data);
  };

  // Filter data based on date range
  const filteredWorkoutData = useMemo(() => {
    if (!dateRange[0] || !dateRange[1]) return workoutData;
    return filterDataByDateRange(workoutData, 'Date', dateRange[0], dateRange[1]);
  }, [workoutData, dateRange]);

  const filteredSleepData = useMemo(() => {
    if (!dateRange[0] || !dateRange[1]) return sleepData;
    return filterDataByDateRange(sleepData, 'Night from', dateRange[0], dateRange[1]);
  }, [sleepData, dateRange]);

  const filteredHeartRateData = useMemo(() => {
    if (!dateRange[0] || !dateRange[1]) return heartRateData;
    return heartRateData.filter(item => {
      try {
        const [day, month, year] = item.date.split('/').map(Number);
        const itemDate = new Date(year, month - 1, day);
        return itemDate >= dateRange[0]! && itemDate <= dateRange[1]!;
      } catch (error) {
        return false;
      }
    });
  }, [heartRateData, dateRange]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleRefresh = () => {
    setWorkoutData([]);
    setSleepData([]);
    setHeartRateData([]);
    setShowUpload(true);
    onRefresh();
  };

  const hasData = workoutData.length > 0 || sleepData.length > 0 || heartRateData.length > 0;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* File Upload Section */}
      <Fade in={showUpload} timeout={500}>
        <Box>
          {showUpload && (
            <FileUpload onDataLoaded={handleDataLoaded} />
          )}
        </Box>
      </Fade>

      {/* Dashboard Content */}
      {hasData && (
        <Fade in={hasData} timeout={500}>
          <Box>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={4} flexWrap="wrap">
              <Box>
                <Box display="flex" alignItems="center" gap={2} mb={1}>
                  <Typography variant="h3" component="h1" fontWeight="600">
                    Fitness Analytics Dashboard
                  </Typography>
                  <IconButton onClick={handleRefresh} color="primary" size="large">
                    <RefreshIcon />
                  </IconButton>
                  <IconButton 
                    onClick={() => setShowUpload(true)} 
                    color="secondary" 
                    size="large"
                    title="Upload new data"
                  >
                    <UploadIcon />
                  </IconButton>
                </Box>
                <Typography variant="h6" color="textSecondary">
                  Comprehensive analysis of workout, sleep, and heart rate data
                </Typography>
              </Box>
              <DateRangeFilter value={dateRange} onChange={setDateRange} />
            </Box>

            {/* Summary View - Always visible */}
            <SummaryView
              workoutData={filteredWorkoutData}
              sleepData={filteredSleepData}
              heartRateData={filteredHeartRateData}
            />

            {/* Tabbed Navigation */}
            <Paper sx={{ width: '100%', mt: 4, borderRadius: 2, overflow: 'hidden' }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                variant={isMobile ? "scrollable" : "fullWidth"}
                scrollButtons="auto"
                aria-label="dashboard tabs"
                sx={{
                  borderBottom: 1,
                  borderColor: 'divider',
                  backgroundColor: theme.palette.background.default,
                  '& .MuiTab-root': {
                    minHeight: 64,
                    fontSize: '1rem',
                    fontWeight: 500,
                    '&.Mui-selected': {
                      color: theme.palette.primary.main,
                      fontWeight: 600,
                    },
                  },
                }}
              >
                <Tab icon={<DashboardIcon />} label="Overview" />
                <Tab icon={<FitnessCenterIcon />} label="Workouts" />
                <Tab icon={<SleepIcon />} label="Sleep" />
                <Tab icon={<HeartIcon />} label="Heart Rate" />
                <Tab icon={<AnalyticsIcon />} label="Advanced Analytics" />
              </Tabs>

              <Box sx={{ p: 3 }}>
                <TabPanel value={tabValue} index={0}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} lg={6}>
                      <WorkoutAnalysis data={filteredWorkoutData} preview />
                    </Grid>
                    <Grid item xs={12} lg={6}>
                      <SleepAnalysis data={filteredSleepData} preview />
                    </Grid>
                    <Grid item xs={12}>
                      <HeartRateAnalysis data={filteredHeartRateData} preview />
                    </Grid>
                  </Grid>
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                  <WorkoutAnalysis data={filteredWorkoutData} />
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                  <SleepAnalysis data={filteredSleepData} />
                </TabPanel>

                <TabPanel value={tabValue} index={3}>
                  <HeartRateAnalysis data={filteredHeartRateData} />
                </TabPanel>

                <TabPanel value={tabValue} index={4}>
                  <AdvancedAnalytics
                    workoutData={filteredWorkoutData}
                    sleepData={filteredSleepData}
                    heartRateData={filteredHeartRateData}
                  />
                </TabPanel>
              </Box>
            </Paper>
          </Box>
        </Fade>
      )}
    </Container>
  );
};

export default Dashboard;
