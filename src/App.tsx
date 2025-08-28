import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Dashboard from './components/Dashboard';
import { WorkoutData, SleepData, TransformedHeartRateData } from './types';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [workoutData, setWorkoutData] = useState<WorkoutData[]>([]);
  const [sleepData, setSleepData] = useState<SleepData[]>([]);
  const [heartRateData, setHeartRateData] = useState<TransformedHeartRateData[]>([]);

  const handleDataLoaded = (data: {
    workoutData: WorkoutData[];
    sleepData: SleepData[];
    heartRateData: TransformedHeartRateData[];
  }) => {
    setWorkoutData(data.workoutData);
    setSleepData(data.sleepData);
    setHeartRateData(data.heartRateData);
  };

  const handleRefresh = () => {
    setWorkoutData([]);
    setSleepData([]);
    setHeartRateData([]);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Dashboard 
        onDataLoaded={handleDataLoaded}
        onRefresh={handleRefresh}
      />
    </ThemeProvider>
  );
}

export default App;
