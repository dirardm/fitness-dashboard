import React, { useState, useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Dashboard from './components/Dashboard';
import { WorkoutData, SleepData, TransformedHeartRateData } from './types';

function App() {
  const [workoutData, setWorkoutData] = useState<WorkoutData[]>([]);
  const [sleepData, setSleepData] = useState<SleepData[]>([]);
  const [heartRateData, setHeartRateData] = useState<TransformedHeartRateData[]>([]);
  const [darkMode, setDarkMode] = useState(false);

  // Create theme based on dark mode state
  const theme = useMemo(() => createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
    },
  }), [darkMode]);

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

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Dashboard 
        onDataLoaded={handleDataLoaded}
        onRefresh={handleRefresh}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
      />
    </ThemeProvider>
  );
}

export default App;
