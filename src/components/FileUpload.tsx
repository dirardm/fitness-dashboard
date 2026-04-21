import React, { useRef, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  LinearProgress,
  Alert,
  useTheme,
} from '@mui/material';
import {
  FitnessCenter as WorkoutIcon,
  Bedtime as SleepIcon,
  Favorite as HeartIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  UploadFile as UploadFileIcon,
} from '@mui/icons-material';
import { parseCSV, parseHeartRateCSV, transformHeartRateData } from '../utils/csvParser';
import { WorkoutData, SleepData } from '../types';
import { useData } from '../context/DataContext';
import { mocha } from '../theme';

type FileType = 'workout' | 'sleep' | 'heartRate';

interface ZoneConfig {
  key: FileType;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const ZONES: ZoneConfig[] = [
  {
    key: 'workout',
    label: 'Workout Data',
    description: 'CSV export from Polar, Garmin or similar',
    icon: <WorkoutIcon />,
    color: mocha.blue,
  },
  {
    key: 'sleep',
    label: 'Sleep Data',
    description: 'Sleep log with stages, HR and HRV',
    icon: <SleepIcon />,
    color: mocha.mauve,
  },
  {
    key: 'heartRate',
    label: 'Heart Rate Data',
    description: 'Transposed CSV: first column = time, header = dates',
    icon: <HeartIcon />,
    color: mocha.red,
  },
];

interface ZoneState {
  file: File | null;
  count: number;
  error: string | null;
  loading: boolean;
}

const initial = (): ZoneState => ({ file: null, count: 0, error: null, loading: false });

const FileUpload: React.FC = () => {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';
  const { setWorkoutData, setSleepData, setHeartRateData } = useData();

  const [zones, setZones] = useState<Record<FileType, ZoneState>>({
    workout: initial(),
    sleep: initial(),
    heartRate: initial(),
  });
  const [draggingOver, setDraggingOver] = useState<FileType | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const inputRefs = {
    workout: useRef<HTMLInputElement>(null),
    sleep: useRef<HTMLInputElement>(null),
    heartRate: useRef<HTMLInputElement>(null),
  };

  const setZone = useCallback((key: FileType, patch: Partial<ZoneState>) => {
    setZones(prev => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  }, []);

  const processFile = useCallback(
    async (key: FileType, file: File) => {
      if (!file.name.toLowerCase().endsWith('.csv')) {
        setZone(key, { error: 'Please upload a CSV file.', file: null });
        return;
      }

      setZone(key, { file, loading: true, error: null });
      setGlobalError(null);

      try {
        if (key === 'workout') {
          const data = await parseCSV<WorkoutData>(file);
          setWorkoutData(data);
          setZone(key, { loading: false, count: data.length });
        } else if (key === 'sleep') {
          const data = await parseCSV<SleepData>(file);
          setSleepData(data);
          setZone(key, { loading: false, count: data.length });
        } else {
          const raw = await parseHeartRateCSV(file);
          const data = transformHeartRateData(raw as Record<string, unknown>[]);
          setHeartRateData(data);
          const dates = new Set(data.map((d: { date: string }) => d.date)).size;
          setZone(key, { loading: false, count: dates });
        }
      } catch (err) {
        console.error(err);
        setZone(key, { loading: false, file: null, count: 0, error: 'Could not parse file — check format.' });
      }
    },
    [setWorkoutData, setSleepData, setHeartRateData, setZone]
  );

  const removeFile = useCallback(
    (key: FileType) => {
      setZone(key, initial());
      if (key === 'workout') setWorkoutData([]);
      else if (key === 'sleep') setSleepData([]);
      else setHeartRateData([]);
    },
    [setWorkoutData, setSleepData, setHeartRateData, setZone]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent, key: FileType) => {
      e.preventDefault();
      setDraggingOver(null);
      const file = e.dataTransfer.files[0];
      if (file) processFile(key, file);
    },
    [processFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, key: FileType) => {
      const file = e.target.files?.[0];
      if (file) processFile(key, file);
      e.target.value = '';
    },
    [processFile]
  );

  const loadedCount = Object.values(zones).filter(z => z.file && !z.loading && !z.error).length;
  const isAnyLoading = Object.values(zones).some(z => z.loading);

  const borderColor = dark ? 'rgba(108,112,134,0.25)' : 'rgba(109,40,217,0.12)';

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: dark ? mocha.mauve : '#7c3aed',
            letterSpacing: '-0.03em',
            mb: 0.5,
          }}
        >
          Upload Your Data
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Upload all three CSV files to unlock your full fitness dashboard.
        </Typography>
      </Box>

      {globalError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setGlobalError(null)}>
          {globalError}
        </Alert>
      )}

      {/* Upload zones */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
          gap: 2,
          mb: 2,
        }}
      >
        {ZONES.map(zone => {
          const state = zones[zone.key];
          const isDragging = draggingOver === zone.key;
          const isLoaded = !!state.file && !state.loading && !state.error;

          return (
            <Box
              key={zone.key}
              onClick={() => !isLoaded && inputRefs[zone.key].current?.click()}
              onDragOver={e => { e.preventDefault(); setDraggingOver(zone.key); }}
              onDragLeave={() => setDraggingOver(null)}
              onDrop={e => handleDrop(e, zone.key)}
              sx={{
                position: 'relative',
                border: `2px ${isLoaded ? 'solid' : 'dashed'} ${
                  isLoaded
                    ? zone.color
                    : isDragging
                    ? `${zone.color}88`
                    : borderColor
                }`,
                borderRadius: 3,
                p: 3,
                cursor: isLoaded ? 'default' : 'pointer',
                transition: 'all 0.2s ease',
                bgcolor: isLoaded
                  ? `${zone.color}12`
                  : isDragging
                  ? `${zone.color}08`
                  : dark
                  ? mocha.surface0
                  : '#ffffff',
                '&:hover': isLoaded
                  ? {}
                  : {
                      borderColor: zone.color,
                      bgcolor: `${zone.color}08`,
                    },
                minHeight: 160,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                gap: 1,
              }}
            >
              {state.loading ? (
                <>
                  <Box sx={{ color: zone.color, opacity: 0.7 }}>{zone.icon}</Box>
                  <Typography variant="body2" color="text.secondary">
                    Parsing…
                  </Typography>
                  <LinearProgress sx={{ width: '80%', mt: 1 }} />
                </>
              ) : isLoaded ? (
                <>
                  <CheckIcon sx={{ color: zone.color, fontSize: 32 }} />
                  <Typography sx={{ fontWeight: 600 }} variant="body2">
                    {zone.label}
                  </Typography>
                  <Chip
                    label={state.file!.name}
                    size="small"
                    sx={{
                      maxWidth: '100%',
                      bgcolor: `${zone.color}22`,
                      color: zone.color,
                      border: `1px solid ${zone.color}44`,
                      fontSize: '0.7rem',
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {state.count} {zone.key === 'heartRate' ? 'workout days' : 'records'}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={e => { e.stopPropagation(); removeFile(zone.key); }}
                    sx={{ position: 'absolute', top: 8, right: 8, color: 'text.secondary' }}
                  >
                    <CancelIcon fontSize="small" />
                  </IconButton>
                </>
              ) : state.error ? (
                <>
                  <Box sx={{ color: mocha.red }}>{zone.icon}</Box>
                  <Typography sx={{ fontWeight: 600 }} variant="body2" color="error">
                    {zone.label}
                  </Typography>
                  <Typography variant="caption" color="error">
                    {state.error}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Click to try again
                  </Typography>
                </>
              ) : (
                <>
                  <Box sx={{ color: zone.color, fontSize: 36 }}>
                    <UploadFileIcon sx={{ fontSize: 'inherit' }} />
                  </Box>
                  <Typography sx={{ fontWeight: 600 }} variant="body2">
                    {zone.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {zone.description}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: zone.color,
                      border: `1px solid ${zone.color}44`,
                      borderRadius: 1,
                      px: 1,
                      py: 0.25,
                      mt: 0.5,
                      fontSize: '0.7rem',
                    }}
                  >
                    Drop CSV or click to browse
                  </Typography>
                </>
              )}

              <input
                ref={inputRefs[zone.key]}
                type="file"
                accept=".csv"
                hidden
                onChange={e => handleFileInput(e, zone.key)}
              />
            </Box>
          );
        })}
      </Box>

      {/* Progress indicator */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <LinearProgress
          variant="determinate"
          value={(loadedCount / 3) * 100}
          sx={{
            flex: 1,
            height: 4,
            borderRadius: 2,
            bgcolor: dark ? mocha.surface1 : 'rgba(109,40,217,0.08)',
            '& .MuiLinearProgress-bar': {
              bgcolor: dark ? mocha.mauve : '#7c3aed',
              borderRadius: 2,
            },
          }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
          {isAnyLoading ? 'Parsing…' : `${loadedCount} / 3 files ready`}
        </Typography>
      </Box>
    </Box>
  );
};

export default FileUpload;
