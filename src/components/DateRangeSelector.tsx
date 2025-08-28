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

interface DateRangeSelectorProps {
  onDateRangeChange: (range: string) => void;
  selectedRange: string;
  availableDates: string[];
}

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  onDateRangeChange,
  selectedRange,
  availableDates,
}) => {
  const dateRanges = [
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '90days', label: 'Last 90 Days' },
    { value: 'all', label: 'All Time' },
    { value: 'custom', label: 'Custom Range' },
  ];

  // Extract unique months from available dates for quick selection
  const uniqueMonths = React.useMemo(() => {
    const months = availableDates.map(date => {
      const [day, month, year] = date.split('/');
      return `${month}/${year}`;
    });
    return Array.from(new Set(months)).sort((a, b) => {
      const [aMonth, aYear] = a.split('/').map(Number);
      const [bMonth, bYear] = b.split('/').map(Number);
      return new Date(aYear, aMonth - 1).getTime() - new Date(bYear, bMonth - 1).getTime();
    });
  }, [availableDates]);

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box display="flex" alignItems="center" mb={2}>
        <DateRange sx={{ mr: 1 }} />
        <Typography variant="h6">Date Range Selection</Typography>
      </Box>

      <Box display="flex" alignItems="center" flexWrap="wrap" gap={2}>
        <FormControl sx={{ minWidth: 120 }} size="small">
          <InputLabel>Time Range</InputLabel>
          <Select
            value={selectedRange}
            label="Time Range"
            onChange={(e) => onDateRangeChange(e.target.value)}
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

        <Box flexGrow={1} />

        <Box>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Quick Select:
          </Typography>
          <Box display="flex" gap={1} flexWrap="wrap">
            {uniqueMonths.slice(-6).map(month => (
              <Chip
                key={month}
                label={month}
                size="small"
                onClick={() => onDateRangeChange(month)}
                color={selectedRange === month ? 'primary' : 'default'}
              />
            ))}
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default DateRangeSelector;
