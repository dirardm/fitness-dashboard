import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { ErrorOutlined } from '@mui/icons-material';

interface State {
  error: Error | null;
}

interface Props {
  children: React.ReactNode;
  label?: string;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <Paper sx={{ p: 3, border: '1px solid #ef4444' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <ErrorOutlined sx={{ color: '#ef4444' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#ef4444' }}>
              {this.props.label ?? 'Component'} error
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontFamily: 'monospace', fontSize: '0.75rem' }}>
            {this.state.error.message}
          </Typography>
          <Button size="small" variant="outlined" color="error" onClick={() => this.setState({ error: null })}>
            Retry
          </Button>
        </Paper>
      );
    }
    return this.props.children;
  }
}
