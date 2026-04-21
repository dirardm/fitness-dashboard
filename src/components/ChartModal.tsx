import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Box,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { mocha } from '../theme';

interface ChartModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  chartComponent: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
}

const ChartModal: React.FC<ChartModalProps> = ({
  open,
  onClose,
  title,
  chartComponent,
  maxWidth = 'xl',
}) => {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth
      fullScreen={fullScreen}
      sx={{
        '& .MuiDialog-paper': {
          backgroundImage: 'none',
          bgcolor: dark ? mocha.base : '#f5f3ff',
          borderRadius: fullScreen ? 0 : 3,
          border: dark ? `1px solid rgba(108,112,134,0.25)` : '1px solid rgba(109,40,217,0.12)',
        },
      }}
    >
      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          display: 'flex',
          alignItems: 'center',
          bgcolor: dark ? mocha.surface0 : 'white',
          borderBottom: `1px solid ${dark ? 'rgba(108,112,134,0.22)' : 'rgba(109,40,217,0.1)'}`,
        }}
      >
        <Typography
          variant="h6"
          sx={{ flex: 1, fontWeight: 600, color: dark ? mocha.mauve : '#7c3aed', fontSize: '1rem' }}
        >
          {title}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          size="small"
          sx={{ color: 'text.secondary' }}
        >
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0, borderColor: dark ? 'rgba(108,112,134,0.22)' : undefined }}>
        <Box
          sx={{
            height: fullScreen ? 'calc(100vh - 64px)' : '70vh',
            width: '100%',
            p: 2,
            bgcolor: dark ? mocha.base : '#f5f3ff',
          }}
        >
          {chartComponent}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ChartModal;
