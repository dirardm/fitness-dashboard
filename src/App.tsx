import { useState, useMemo } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DataProvider } from './context/DataContext';
import AppLayout from './components/layout/AppLayout';
import DashboardPage from './pages/DashboardPage';
import WorkoutsPage from './pages/WorkoutsPage';
import SleepPage from './pages/SleepPage';
import HeartRatePage from './pages/HeartRatePage';
import { createAppTheme } from './theme';

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const theme = useMemo(() => createAppTheme(darkMode), [darkMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DataProvider>
          <BrowserRouter>
            <AppLayout darkMode={darkMode} onToggleDarkMode={() => setDarkMode(d => !d)}>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/workouts" element={<WorkoutsPage />} />
                <Route path="/sleep" element={<SleepPage />} />
                <Route path="/heartrate" element={<HeartRatePage />} />
              </Routes>
            </AppLayout>
          </BrowserRouter>
        </DataProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
