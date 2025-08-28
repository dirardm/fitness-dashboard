import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Close } from '@mui/icons-material';

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
          backgroundColor: theme.palette.background.default,
          borderRadius: fullScreen ? 0 : 2,
        },
      }}
    >
      <DialogTitle sx={{ 
        m: 0, 
        p: 2, 
        display: 'flex', 
        alignItems: 'center',
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
      }}>
        <Box sx={{ flexGrow: 1, fontSize: '1.2rem', fontWeight: 'bold' }}>
          {title}
        </Box>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ color: theme.palette.primary.contrastText }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0, overflow: 'hidden' }}>
        <Box sx={{ 
          height: fullScreen ? 'calc(100vh - 64px)' : '70vh', 
          width: '100%',
          padding: 2,
        }}>
          {chartComponent}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ChartModal;
