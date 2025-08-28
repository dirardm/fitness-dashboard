import React from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  Alert,
  Chip,
  Stack,
  IconButton,
  Collapse,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { parseCSV, parseHeartRateCSV, transformHeartRateData } from '../utils/csvParser';
import { WorkoutData, SleepData, HeartRateData, TransformedHeartRateData } from '../types';

interface FileUploadProps {
  onDataLoaded: (data: {
    workoutData: WorkoutData[];
    sleepData: SleepData[];
    heartRateData: TransformedHeartRateData[];
  }) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded }) => {
  const [workoutFile, setWorkoutFile] = React.useState<File | null>(null);
  const [sleepFile, setSleepFile] = React.useState<File | null>(null);
  const [heartRateFile, setHeartRateFile] = React.useState<File | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showUpload, setShowUpload] = React.useState(true);

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setFile: React.Dispatch<React.SetStateAction<File | null>>
  ) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!workoutFile || !sleepFile || !heartRateFile) {
      setError('Please upload all three files');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const workoutData = await parseCSV<WorkoutData>(workoutFile);
      const sleepData = await parseCSV<SleepData>(sleepFile);
      const heartRateRawData = await parseHeartRateCSV(heartRateFile);
      const heartRateData = transformHeartRateData(heartRateRawData);

      onDataLoaded({
        workoutData,
        sleepData,
        heartRateData,
      });

      // Clear file selections after successful upload
      setWorkoutFile(null);
      setSleepFile(null);
      setHeartRateFile(null);
      
    } catch (err) {
      setError('Error parsing CSV files. Please check the file formats.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setShowUpload(false);
  };

  if (!showUpload) {
    return null;
  }

  return (
    <Paper sx={{ p: 3, mb: 3, position: 'relative' }}>
      <IconButton
        sx={{ position: 'absolute', top: 8, right: 8 }}
        onClick={handleClose}
        size="small"
      >
        <CloseIcon />
      </IconButton>
      
      <Typography variant="h6" gutterBottom>
        Upload Data Files
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Stack spacing={2}>
        <Box>
          <Button
            component="label"
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            sx={{ mr: 2 }}
            disabled={isLoading}
          >
            Upload Workout Data
            <input
              type="file"
              hidden
              accept=".csv"
              onChange={(e) => handleFileChange(e, setWorkoutFile)}
            />
          </Button>
          {workoutFile && <Chip label={workoutFile.name} onDelete={() => setWorkoutFile(null)} />}
        </Box>
        
        <Box>
          <Button
            component="label"
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            sx={{ mr: 2 }}
            disabled={isLoading}
          >
            Upload Sleep Data
            <input
              type="file"
              hidden
              accept=".csv"
              onChange={(e) => handleFileChange(e, setSleepFile)}
            />
          </Button>
          {sleepFile && <Chip label={sleepFile.name} onDelete={() => setSleepFile(null)} />}
        </Box>
        
        <Box>
          <Button
            component="label"
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            sx={{ mr: 2 }}
            disabled={isLoading}
          >
            Upload Heart Rate Data
            <input
              type="file"
              hidden
              accept=".csv"
              onChange={(e) => handleFileChange(e, setHeartRateFile)}
            />
          </Button>
          {heartRateFile && <Chip label={heartRateFile.name} onDelete={() => setHeartRateFile(null)} />}
        </Box>
        
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={!workoutFile || !sleepFile || !heartRateFile || isLoading}
          sx={{ mt: 2 }}
        >
          {isLoading ? 'Processing...' : 'Process Data'}
        </Button>
      </Stack>
    </Paper>
  );
};

export default FileUpload;
