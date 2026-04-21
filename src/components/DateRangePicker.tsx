import React, { useState } from 'react';
import {
  Button,
  Popover,
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  useTheme,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { CalendarToday as CalendarIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import { useData } from '../context/DataContext';
import { mocha } from '../theme';

const PRESETS = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
  { label: 'Last 6 months', days: 180 },
  { label: 'Last year', days: 365 },
  { label: 'All time', days: 0 },
  { label: 'Custom range', days: -1 },
];

const DateRangePicker: React.FC = () => {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';
  const { dateRange, setDateRange, selectedPreset, setSelectedPreset } = useData();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [customStart, setCustomStart] = useState<Date | null>(dateRange[0]);
  const [customEnd, setCustomEnd] = useState<Date | null>(dateRange[1]);

  const open = Boolean(anchor);

  const handlePreset = (preset: typeof PRESETS[0]) => {
    if (preset.days === -1) {
      setSelectedPreset('Custom range');
      return;
    }
    setSelectedPreset(preset.label);
    const end = new Date();
    const start = new Date();
    if (preset.days === 0) {
      start.setFullYear(start.getFullYear() - 10);
    } else {
      start.setDate(start.getDate() - preset.days);
    }
    setDateRange([start, end]);
    setAnchor(null);
  };

  const handleApplyCustom = () => {
    if (customStart && customEnd) {
      setDateRange([customStart, customEnd]);
      setSelectedPreset('Custom range');
      setAnchor(null);
    }
  };

  const getLabel = () => {
    if (selectedPreset === 'Custom range' && dateRange[0] && dateRange[1]) {
      return `${format(dateRange[0], 'dd MMM')} – ${format(dateRange[1], 'dd MMM yy')}`;
    }
    return selectedPreset;
  };

  const borderColor = dark ? mocha.surface2 : 'rgba(109,40,217,0.3)';

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        startIcon={<CalendarIcon sx={{ fontSize: '0.85rem !important' }} />}
        onClick={e => setAnchor(e.currentTarget)}
        sx={{
          fontSize: '0.78rem',
          borderColor,
          color: dark ? mocha.subtext1 : '#7c3aed',
          textTransform: 'none',
          whiteSpace: 'nowrap',
          px: 1.5,
          '&:hover': {
            borderColor: dark ? mocha.mauve : '#7c3aed',
            bgcolor: dark ? 'rgba(203,166,247,0.07)' : 'rgba(124,58,237,0.05)',
          },
        }}
      >
        {getLabel()}
      </Button>

      <Popover
        open={open}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              mt: 0.5,
              borderRadius: 2,
              bgcolor: dark ? mocha.surface0 : 'white',
              boxShadow: dark ? '0 8px 32px rgba(0,0,0,0.5)' : '0 8px 32px rgba(0,0,0,0.15)',
            },
          },
        }}
      >
        <Box sx={{ display: 'flex' }}>
          {/* Preset list */}
          <Box sx={{ width: 175, borderRight: `1px solid ${dark ? mocha.surface2 : '#e5e7eb'}` }}>
            <Typography
              variant="caption"
              sx={{ px: 2, pt: 1.5, pb: 0.5, display: 'block', color: 'text.secondary', letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.65rem' }}
            >
              Quick select
            </Typography>
            <List dense disablePadding sx={{ pb: 1 }}>
              {PRESETS.map(p => (
                <ListItemButton
                  key={p.label}
                  selected={selectedPreset === p.label}
                  onClick={() => handlePreset(p)}
                  sx={{
                    px: 2,
                    py: 0.55,
                    '&.Mui-selected': {
                      bgcolor: dark ? 'rgba(203,166,247,0.15)' : 'rgba(124,58,237,0.08)',
                      color: dark ? mocha.mauve : '#7c3aed',
                    },
                    '&:hover': {
                      bgcolor: dark ? 'rgba(203,166,247,0.08)' : 'rgba(124,58,237,0.05)',
                    },
                  }}
                >
                  <ListItemText
                    primary={p.label}
                    slotProps={{ primary: { style: { fontSize: '0.82rem' } } }}
                  />
                </ListItemButton>
              ))}
            </List>
          </Box>

          {/* Custom range pickers */}
          {selectedPreset === 'Custom range' && (
            <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 200 }}>
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.65rem' }}
              >
                Custom range
              </Typography>
              <DatePicker
                label="Start date"
                value={customStart}
                onChange={v => setCustomStart(v)}
                slotProps={{
                  textField: {
                    size: 'small',
                    sx: { '& .MuiInputBase-root': { fontSize: '0.82rem' } },
                  },
                }}
              />
              <DatePicker
                label="End date"
                value={customEnd}
                onChange={v => setCustomEnd(v)}
                minDate={customStart ?? undefined}
                slotProps={{
                  textField: {
                    size: 'small',
                    sx: { '& .MuiInputBase-root': { fontSize: '0.82rem' } },
                  },
                }}
              />
              <Button
                variant="contained"
                size="small"
                disabled={!customStart || !customEnd}
                onClick={handleApplyCustom}
                sx={{
                  bgcolor: dark ? mocha.mauve : '#7c3aed',
                  '&:hover': { bgcolor: dark ? mocha.lavender : '#6d28d9' },
                  fontSize: '0.78rem',
                  textTransform: 'none',
                }}
              >
                Apply range
              </Button>
            </Box>
          )}
        </Box>
      </Popover>
    </>
  );
};

export default DateRangePicker;
