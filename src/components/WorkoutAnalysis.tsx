import React, { useState, useCallback } from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Fullscreen } from '@mui/icons-material';
import { Doughnut, Bar } from 'react-chartjs-2';
import { WorkoutData } from '../types';
import '../utils/chartSetup';
import { formatNumber, formatBPM } from '../utils/formatters';
import ChartModal from './ChartModal';

interface WorkoutAnalysisProps {
  data: WorkoutData[];
  preview?: boolean;
}

const WorkoutAnalysis: React.FC<WorkoutAnalysisProps> = ({ data, preview = false }) => {
  const [openModal, setOpenModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalChart, setModalChart] = useState<React.ReactNode>(null);

  if (data.length === 0) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Workout Analysis
        </Typography>
        <Typography color="textSecondary">
          No workout data available.
        </Typography>
      </Paper>
    );
  }

  // Prepare data for charts
  const workoutTypes = data.reduce((acc, workout) => {
    const type = workout['Workout Type'];
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = {
    labels: Object.keys(workoutTypes),
    datasets: [
      {
        data: Object.values(workoutTypes),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
        ],
        hoverBackgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
        ],
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: 'Workout Type Distribution',
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
  };

const weeklyData = data.reduce((acc, workout) => {
  try {
    const [day, month, year] = workout.Date.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    
    // Calculate the ISO week number
    const weekNumber = getISOWeekNumber(date);
    
    const weekLabel = `Week ${weekNumber}, ${year}`;

    if (!acc[weekLabel]) {
      acc[weekLabel] = { week: weekLabel, calories: 0 };
    }
    acc[weekLabel].calories += workout.Calories || 0;
    return acc;
  } catch {
    return acc;
  }
}, {} as Record<string, { week: string; calories: number }>);

// Helper function to calculate ISO week number
function getISOWeekNumber(date: Date): number {
  // Create a new date object to avoid modifying the original
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  
  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday's day number 7
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  
  // Get first day of year
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  
  // Calculate full weeks to nearest Thursday
  const weekNumber = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  
  return weekNumber;
}
 // const weeklyData = data.reduce((acc, workout) => {
  //  try {
   //   const [day, month, year] = workout.Date.split('/').map(Number);
    //  const date = new Date(year, month - 1, day);
     // const weekNumber = Math.ceil(date.getDate() / 7);
      //const weekLabel = `Week ${weekNumber}, ${year}`;
      
    //  if (!acc[weekLabel]) {
     //   acc[weekLabel] = { week: weekLabel, calories: 0 };
     // }
     // acc[weekLabel].calories += workout.Calories || 0;
     // return acc;
  //  } catch {
   //   return acc;
  //  }
 //// }, {} as Record<string, { week: string; calories: number }>);

// Update the barData configuration for a smoother appearance
const barData = {
  labels: Object.keys(weeklyData),
  datasets: [
    {
      label: 'Calories Burned',
      data: Object.values(weeklyData).map(w => w.calories),
      backgroundColor: 'rgba(54, 162, 235, 0.7)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1,
      borderRadius: 5, // Rounded corners for bars
      hoverBackgroundColor: 'rgba(54, 162, 235, 0.9)',
    },
  ],
};

// Update barOptions for better appearance
const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        font: {
          size: 14,
        },
      },
    },
    title: {
      display: true,
      text: 'Weekly Calories Burned',
      font: {
        size: 16,
        weight: 'bold',
      },
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      titleFont: {
        size: 14,
      },
      bodyFont: {
        size: 14,
      },
      padding: 10,
      callbacks: {
        label: function(context: any) {
          return `Calories: ${context.raw.toLocaleString()}`;
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.1)',
      },
      ticks: {
        font: {
          size: 12,
        },
      },
      title: {
        display: true,
        text: 'Calories',
        font: {
          size: 14,
          weight: 'bold',
        },
      },
    },
    x: {
      grid: {
        color: 'rgba(0, 0, 0, 0.1)',
      },
      ticks: {
        font: {
          size: 12,
        },
        maxRotation: 45,
      },
      title: {
        display: true,
        text: 'Week',
        font: {
          size: 14,
          weight: 'bold',
        },
      },
    },
  },
};

  // HR Zone distribution data - Fixed calculation to show percentages
  const calculateZoneAverage = (zone: string): number => {
    const validWorkouts = data.filter(workout => {
      const zoneValue = workout[zone as keyof WorkoutData];
      return zoneValue && typeof zoneValue === 'string';
    });
    
    if (validWorkouts.length === 0) return 0;
    
    return validWorkouts.reduce((sum, workout) => {
      const zoneValue = workout[zone as keyof WorkoutData] as string;
      return sum + (parseFloat(zoneValue.replace('%', '')) || 0);
    }, 0) / validWorkouts.length;
  };

  const hrZoneData = {
    labels: ['Zone 1', 'Zone 2', 'Zone 3', 'Zone 4', 'Zone 5'],
    datasets: [
      {
        data: [
          calculateZoneAverage('Zone 1 %'),
          calculateZoneAverage('Zone 2 %'),
          calculateZoneAverage('Zone 3 %'),
          calculateZoneAverage('Zone 4 %'),
          calculateZoneAverage('Zone 5 %')
        ],
        backgroundColor: [
          '#36A2EB',
          '#4BC0C0',
          '#FFCE56',
          '#FF9F40',
          '#FF6384',
        ],
      },
    ],
  };

  const hrZoneOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: 'Average Time in Heart Rate Zones (%)',
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.label}: ${context.raw.toFixed(1)}%`;
          }
        }
      }
    },
  };

  // Helper function to calculate speed from distance and duration
  const calculateSpeed = (distance: number, duration: string): number => {
    try {
      const [hours, minutes, seconds] = duration.split(':').map(Number);
      const totalHours = hours + (minutes / 60) + (seconds / 3600);
      return distance / totalHours;
    } catch {
      return 0;
    }
  };

  // Helper function to extract cadence from workout data
  const getCadence = (workout: WorkoutData): number => {
    // Check various possible field names for cadence
    return workout['Avg cadence'] || 
           workout['Average Cadence'] || 
           workout['Cadence'] || 
           workout['Run Cadence'] || 
           workout['avg_cadence'] || 
           0;
  };

  // Function to open chart in modal
  const openChartModal = useCallback((title: string, chart: React.ReactNode) => {
    setModalTitle(title);
    setModalChart(chart);
    setOpenModal(true);
  }, []);

  // Function to close modal
  const closeChartModal = useCallback(() => {
    setOpenModal(false);
  }, []);

  // Create chart components with fullscreen buttons
  const renderChartWithFullscreen = (
    title: string, 
    chart: React.ReactNode, 
    chartComponent: React.ReactNode
  ) => (
    <Box sx={{ position: 'relative', height: '100%' }}>
      {chartComponent}
      <Tooltip title="Open in full screen">
        <IconButton
          sx={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(255,255,255,0.7)' }}
          onClick={() => openChartModal(title, chart)}
          size="small"
        >
          <Fullscreen fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );

  // Create chart components for modal and regular view
  const workoutTypeChart = (
    <Doughnut data={pieData} options={pieOptions} />
  );

  const weeklyCaloriesChart = (
    <Bar data={barData} options={barOptions} />
  );

  const hrZoneChart = (
    <Doughnut data={hrZoneData} options={hrZoneOptions} />
  );

  return (
    <>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Workout Analysis
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: preview ? 300 : 400 }}>
              <CardContent>
                <Box sx={{ height: preview ? 250 : 350 }}>
                  {renderChartWithFullscreen(
                    'Workout Type Distribution',
                    workoutTypeChart,
                    workoutTypeChart
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ height: preview ? 300 : 400 }}>
              <CardContent>
                <Box sx={{ height: preview ? 250 : 350 }}>
                  {renderChartWithFullscreen(
                    'Weekly Calories Burned',
                    weeklyCaloriesChart,
                    weeklyCaloriesChart
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {!preview && (
            <>
              <Grid item xs={12} md={6}>
                <Card sx={{ height: 400 }}>
                  <CardContent>
                    <Box sx={{ height: 350 }}>
                      {renderChartWithFullscreen(
                        'Heart Rate Zone Distribution',
                        hrZoneChart,
                        hrZoneChart
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Recent Workouts
                    </Typography>
                    <TableContainer sx={{ maxHeight: 400 }}>
                      <Table stickyHeader size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Duration</TableCell>
                            <TableCell>Distance (km)</TableCell>
                            <TableCell>Calories</TableCell>
                            <TableCell>Avg HR</TableCell>
                            <TableCell>Avg Speed (km/h)</TableCell>
                            <TableCell>Avg Cadence (spm)</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {data.slice(-10).map((workout, index) => (
                            <TableRow key={index}>
                              <TableCell>{workout.Date}</TableCell>
                              <TableCell>
                                <Chip label={workout['Workout Type']} size="small" />
                              </TableCell>
                              <TableCell>{workout.Duration}</TableCell>
                              <TableCell>{formatNumber(workout.Distance)}</TableCell>
                              <TableCell>{formatNumber(workout.Calories)}</TableCell>
                              <TableCell>{formatBPM(workout['Avg HR'])}</TableCell>
                              <TableCell>
                                {formatNumber(
                                  workout['Avg Speed'] || 
                                  workout['Average Speed'] || 
                                  calculateSpeed(workout.Distance, workout.Duration)
                                )}
                              </TableCell>
                              <TableCell>
                                {formatNumber(getCadence(workout))}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
            </>
          )}
        </Grid>
      </Paper>

      <ChartModal
        open={openModal}
        onClose={closeChartModal}
        title={modalTitle}
        chartComponent={modalChart}
      />
    </>
  );
};

export default WorkoutAnalysis;
