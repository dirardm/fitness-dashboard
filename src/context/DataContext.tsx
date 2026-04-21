import React, { createContext, useContext, useState, useMemo } from 'react';
import { WorkoutData, SleepData, TransformedHeartRateData } from '../types';
import { filterDataByDateRange } from '../utils/csvParser';

interface DataContextType {
  workoutData: WorkoutData[];
  sleepData: SleepData[];
  heartRateData: TransformedHeartRateData[];
  filteredWorkoutData: WorkoutData[];
  filteredSleepData: SleepData[];
  filteredHeartRateData: TransformedHeartRateData[];
  dateRange: [Date | null, Date | null];
  setDateRange: (range: [Date | null, Date | null]) => void;
  selectedPreset: string;
  setSelectedPreset: (preset: string) => void;
  setWorkoutData: (data: WorkoutData[]) => void;
  setSleepData: (data: SleepData[]) => void;
  setHeartRateData: (data: TransformedHeartRateData[]) => void;
  clearData: () => void;
  hasData: boolean;
  hasWorkoutData: boolean;
  hasSleepData: boolean;
  hasHeartRateData: boolean;
}

const DataContext = createContext<DataContextType | null>(null);

function loadPersistedRange(): [Date | null, Date | null] {
  try {
    const stored = localStorage.getItem('fitness-date-range');
    if (stored) {
      const [s, e] = JSON.parse(stored) as [string, string];
      return [new Date(s), new Date(e)];
    }
  } catch { /* ignore */ }
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  return [start, end];
}

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workoutData, setWorkoutData] = useState<WorkoutData[]>([]);
  const [sleepData, setSleepData] = useState<SleepData[]>([]);
  const [heartRateData, setHeartRateData] = useState<TransformedHeartRateData[]>([]);

  const [dateRange, setDateRangeState] = useState<[Date | null, Date | null]>(loadPersistedRange);
  const [selectedPreset, setSelectedPreset] = useState<string>(() => {
    try { return localStorage.getItem('fitness-date-preset') || 'Last 30 days'; } catch { return 'Last 30 days'; }
  });

  const setDateRange = (range: [Date | null, Date | null]) => {
    setDateRangeState(range);
    try {
      localStorage.setItem('fitness-date-range', JSON.stringify([range[0]?.toISOString(), range[1]?.toISOString()]));
    } catch { /* ignore */ }
  };

  const handleSetPreset = (preset: string) => {
    setSelectedPreset(preset);
    try { localStorage.setItem('fitness-date-preset', preset); } catch { /* ignore */ }
  };

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
      } catch {
        return false;
      }
    });
  }, [heartRateData, dateRange]);

  const clearData = () => {
    setWorkoutData([]);
    setSleepData([]);
    setHeartRateData([]);
  };

  return (
    <DataContext.Provider
      value={{
        workoutData,
        sleepData,
        heartRateData,
        filteredWorkoutData,
        filteredSleepData,
        filteredHeartRateData,
        dateRange,
        setDateRange,
        selectedPreset,
        setSelectedPreset: handleSetPreset,
        setWorkoutData,
        setSleepData,
        setHeartRateData,
        clearData,
        hasData: workoutData.length > 0 || sleepData.length > 0 || heartRateData.length > 0,
        hasWorkoutData: workoutData.length > 0,
        hasSleepData: sleepData.length > 0,
        hasHeartRateData: heartRateData.length > 0,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
};
