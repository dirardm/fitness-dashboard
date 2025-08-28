import Papa from 'papaparse';

export interface CSVRow {
  [key: string]: string | number;
}

export const parseCSV = <T>(file: File): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data as T[]);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};

export const parseHeartRateCSV = (file: File): Promise<CSVRow[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data as CSVRow[]);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};

export const transformHeartRateData = (data: Record<string, any>[]): any[] => {
  if (!data || data.length === 0) return [];

  const transformedData: any[] = [];
  
  // Get all dates from the first row (excluding the 'Time' column)
  const dates = Object.keys(data[0]).filter(key => key !== 'Time' && key !== '');
  
  data.forEach(row => {
    const timeValue = row.Time;
    if (timeValue === undefined || timeValue === null) return;
    
    // Handle both string and number time values
    let timeInMinutes = 0;
    if (typeof timeValue === 'string') {
      if (timeValue.includes(':')) {
        // Handle HH:MM format
        const [hours, minutes] = timeValue.split(':').map(Number);
        timeInMinutes = hours * 60 + minutes;
      } else {
        // Handle raw minutes
        timeInMinutes = parseInt(timeValue);
      }
    } else {
      timeInMinutes = timeValue;
    }
    
    if (isNaN(timeInMinutes)) return;
    
    dates.forEach(date => {
      if (row[date] !== undefined && row[date] !== null) {
        const heartRate = Number(row[date]);
        // Filter out invalid heart rates
        if (!isNaN(heartRate) && isFinite(heartRate) && heartRate > 30 && heartRate < 250) {
          transformedData.push({
            date,
            time: timeInMinutes,
            heartRate
          });
        }
      }
    });
  });
  
  return transformedData;
};

export const calculateWorkoutIntensity = (workout: any): number => {
  // Simple intensity calculation based on calories, duration, and heart rate
  const [hours, minutes, seconds] = workout.Duration.split(':').map(Number);
  const durationInMinutes = hours * 60 + minutes + seconds / 60;
  
  const intensity = (workout.Calories / durationInMinutes) * (workout['Avg HR'] / 100);
  return intensity;
};

export const filterDataByDateRange = (
  data: any[],
  dateField: string,
  startDate: Date,
  endDate: Date
): any[] => {
  return data.filter(item => {
    const itemDateStr = item[dateField];
    if (!itemDateStr) return false;
    
    try {
      const [day, month, year] = itemDateStr.split('/').map(Number);
      const itemDate = new Date(year, month - 1, day);
      
      return itemDate >= startDate && itemDate <= endDate;
    } catch (error) {
      console.error('Error parsing date:', error);
      return false;
    }
  });
};

export const analyzeData = (workoutData: any[], sleepData: any[], heartRateData: any[]) => {
  // Calculate average metrics with proper error handling
  const avgWorkoutCalories = workoutData.length > 0 ? 
    workoutData.reduce((sum, w) => sum + (w.Calories || 0), 0) / workoutData.length : 0;
  
  const avgSleepDuration = sleepData.length > 0 ? 
    sleepData.reduce((sum, s) => sum + (s['Total sleep time (min)'] || 0), 0) / sleepData.length : 0;
  
  // Filter valid heart rates
  const validHeartRates = heartRateData.filter(hr => 
    hr && 
    typeof hr.heartRate === 'number' && 
    !isNaN(hr.heartRate) && 
    isFinite(hr.heartRate) &&
    hr.heartRate > 30 && // Reasonable minimum
    hr.heartRate < 250   // Reasonable maximum
  );
  
  const avgHeartRate = validHeartRates.length > 0 ? 
    validHeartRates.reduce((sum, hr) => sum + hr.heartRate, 0) / validHeartRates.length : 0;
  
  // Calculate trends (simplified)
  const workoutTrend = workoutData.length > 10 ? 
    (workoutData.slice(-5).reduce((sum, w) => sum + (w.Calories || 0), 0) / 5) / 
    (workoutData.slice(-10, -5).reduce((sum, w) => sum + (w.Calories || 0), 0) / 5) - 1 : 0;
  
  return {
    avgWorkoutCalories,
    avgSleepDuration,
    avgHeartRate,
    workoutTrend: workoutTrend * 100
  };
};

export const calculateIntensityScore = (workoutData: any[]): { score: number; label: string } => {
  if (workoutData.length === 0) return { score: 0, label: 'No data' };
  
  let totalIntensity = 0;
  let count = 0;
  
  workoutData.forEach(workout => {
    const zone3 = parseFloat(workout['Zone 3 %']?.replace('%', '') || '0');
    const zone4 = parseFloat(workout['Zone 4 %']?.replace('%', '') || '0');
    const zone5 = parseFloat(workout['Zone 5 %']?.replace('%', '') || '0');
    
    // Calculate intensity based on time in higher zones
    const intensity = (zone3 * 0.5) + (zone4 * 0.8) + (zone5 * 1.0);
    totalIntensity += intensity;
    count++;
  });
  
  const avgIntensity = totalIntensity / count;
  const score = Math.min(100, Math.max(0, avgIntensity * 1.2));
  
  let label = 'Low';
  if (score > 70) label = 'High';
  else if (score > 40) label = 'Moderate';
  
  return { score, label };
};

export const calculateRecoveryScore = (sleepData: any[], workoutData: any[]): { score: number; label: string } => {
  if (sleepData.length === 0) return { score: 0, label: 'No data' };
  
  let totalRecovery = 0;
  
  sleepData.forEach(sleep => {
    // Sleep duration score (0-50 points)
    const durationScore = Math.min(50, (sleep['Total sleep time (min)'] / 480) * 50);
    
    // Sleep quality score based on HRV and resting HR (0-50 points)
    const hrv = sleep['avg HR Variability'] || 50;
    const restingHR = sleep['avg HR'] || 60;
    
    const hrvScore = Math.min(25, (hrv / 100) * 25);
    const hrScore = Math.min(25, ((60 - Math.max(40, restingHR)) / 20) * 25);
    
    totalRecovery += durationScore + hrvScore + hrScore;
  });
  
  const avgRecovery = totalRecovery / sleepData.length;
  const score = Math.min(100, Math.max(0, avgRecovery));
  
  let label = 'Poor';
  if (score > 75) label = 'Excellent';
  else if (score > 60) label = 'Good';
  else if (score > 40) label = 'Fair';
  
  return { score, label };
};

export const calculateConsistencyScore = (workoutData: any[]): { score: number; label: string } => {
  if (workoutData.length < 2) return { score: 0, label: 'Insufficient data' };
  
  // Extract dates and sort them
  const dates = workoutData
    .map(w => new Date(w.Date.split('/').reverse().join('-')))
    .sort((a, b) => a.getTime() - b.getTime());
  
  // Calculate gaps between workouts
  const gaps = [];
  for (let i = 1; i < dates.length; i++) {
    const gap = (dates[i].getTime() - dates[i-1].getTime()) / (1000 * 60 * 60 * 24);
    gaps.push(gap);
  }
  
  // Calculate average gap and consistency
  const avgGap = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
  const variance = gaps.reduce((sum, gap) => sum + Math.pow(gap - avgGap, 2), 0) / gaps.length;
  
  // Lower variance = more consistent
  const consistency = Math.max(0, 100 - (variance * 10));
  const score = Math.min(100, consistency);
  
  let label = 'Irregular';
  if (score > 80) label = 'Very Consistent';
  else if (score > 60) label = 'Consistent';
  else if (score > 40) label = 'Moderate';
  
  return { score, label };
};

export const calculateHRVTrends = (sleepData: any[]) => {
  if (sleepData.length === 0) return { trend: 0, avgHRV: 0 };
  
  const hrvValues = sleepData
    .filter(s => s['avg HR Variability'] !== undefined)
    .map(s => s['avg HR Variability'] as number);
  
  if (hrvValues.length < 2) return { trend: 0, avgHRV: hrvValues[0] || 0 };
  
  // Calculate trend (simple linear regression)
  const x = Array.from({ length: hrvValues.length }, (_, i) => i);
  const n = x.length;
  
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = hrvValues.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((a, _, i) => a + (i * hrvValues[i]), 0);
  const sumXX = x.reduce((a, b) => a + (b * b), 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const avgHRV = sumY / n;
  
  return { trend: slope, avgHRV };
};

export const calculateTrainingLoad = (workoutData: any[]) => {
  if (workoutData.length === 0) return [];
  
  return workoutData.map(workout => {
    const durationParts = workout.Duration.split(':').map(Number);
    const durationHours = durationParts[0] + (durationParts[1] / 60) + (durationParts[2] / 3600);
    
    // Simple training load calculation: calories * duration * intensity factor
    const intensity = parseFloat(workout['Zone 4 %']?.replace('%', '') || '0') / 100 || 0.5;
    const load = workout.Calories * durationHours * (1 + intensity);
    
    return {
      date: workout.Date,
      load: Math.round(load),
      calories: workout.Calories,
      duration: durationHours,
    };
  });
};

export const validateHeartRateData = (data: any[]): any[] => {
  return data.filter(item => 
    item.heartRate && 
    !isNaN(item.heartRate) && 
    isFinite(item.heartRate) && 
    item.heartRate > 30 && 
    item.heartRate < 250
  );
};

// Add this function to debug heart rate data
export const debugHeartRateData = (data: any[]) => {
  console.log('Heart rate data debug:');
  console.log('Total records:', data.length);
  
  if (data.length > 0) {
    console.log('Sample record:', data[0]);
    
    const dates = Array.from(new Set(data.map(item => item.date)));
    console.log('Available dates:', dates);
    
    const heartRates = data.map(item => item.heartRate);
    console.log('Heart rate stats:', {
      min: Math.min(...heartRates),
      max: Math.max(...heartRates),
      avg: heartRates.reduce((sum, hr) => sum + hr, 0) / heartRates.length
    });
  }
};
