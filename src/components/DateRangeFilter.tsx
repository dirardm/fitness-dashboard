import React from 'react';
import {
  Paper,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
} from '@mui/material';
import { DateRange, CalendarToday } from '@mui/icons-material';

interface DateRangeFilterProps {
  value: [Date | null, Date | null];
  onChange: (range: [Date | null, Date | null]) => void;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  value,
  onChange,
}) => {
  const dateRanges = [
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '90days', label: 'Last 90 Days' },
    { value: 'all', label: 'All Time' },
    { value: 'custom', label: 'Custom Range' },
  ];

  const [selectedRange, setSelectedRange] = React.useState('30days');

  const handleRangeChange = (range: string) => {
    setSelectedRange(range);
    
    // In a real implementation, this would calculate actual dates
    if (range !== 'custom') {
      const today = new Date();
      const startDate = new Date();
      
      if (range === '7days') {
        startDate.setDate(today.getDate() - 7);
      } else if (range === '30days') {
        startDate.setDate(today.getDate() - 30);
      } else if (range === '90days') {
        startDate.setDate(today.getDate() - 90);
      } else {
        // All time - set to a very old date
        startDate.setFullYear(2000);
      }
      
      onChange([startDate, today]);
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box display="flex" alignItems="center" mb={2}>
        <DateRange sx={{ mr: 1 }} />
        <Typography variant="h6">Date Range</Typography>
      </Box>

      <Box display="flex" alignItems="center" flexWrap="wrap" gap={2}>
        <FormControl sx={{ minWidth: 120 }} size="small">
          <InputLabel>Time Range</InputLabel>
          <Select
            value={selectedRange}
            label="Time Range"
            onChange={(e) => handleRangeChange(e.target.value)}
          >
            {dateRanges.map(range => (
              <MenuItem key={range.value} value={range.value}>
                {range.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedRange === 'custom' && (
          <Box display="flex" gap={1} alignItems="center">
            <Button variant="outlined" startIcon={<CalendarToday />}>
              Start Date
            </Button>
            <Typography>to</Typography>
            <Button variant="outlined" startIcon={<CalendarToday />}>
              End Date
            </Button>
          </Box>
        )}

        {value[0] && value[1] && (
          <Chip 
            label={`${value[0]?.toLocaleDateString()} - ${value[1]?.toLocaleDateString()}`} 
            variant="outlined" 
          />
        )}
      </Box>
    </Paper>
  );
};

export default DateRangeFilter;
