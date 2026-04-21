import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider,
  useTheme,
  useMediaQuery,
  Tooltip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  FitnessCenter as FitnessCenterIcon,
  Bedtime as SleepIcon,
  Favorite as HeartIcon,
  Menu as MenuIcon,
  Brightness4 as DarkIcon,
  Brightness7 as LightIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { mocha } from '../../theme';
import DateRangePicker from '../DateRangePicker';

const DRAWER_WIDTH = 240;

interface AppLayoutProps {
  children: React.ReactNode;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, darkMode, onToggleDarkMode }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { workoutData, sleepData, heartRateData, hasData } = useData();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <DashboardIcon fontSize="small" />, count: null },
    { path: '/workouts', label: 'Workouts', icon: <FitnessCenterIcon fontSize="small" />, count: workoutData.length },
    { path: '/sleep', label: 'Sleep', icon: <SleepIcon fontSize="small" />, count: sleepData.length },
    { path: '/heartrate', label: 'Heart Rate', icon: <HeartIcon fontSize="small" />, count: [...new Set(heartRateData.map(d => d.date))].length },
  ];

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const sidebarBg = darkMode ? mocha.mantle : theme.palette.background.paper;
  const borderColor = darkMode ? 'rgba(108,112,134,0.2)' : 'rgba(109,40,217,0.1)';

  const sidebarContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: sidebarBg, borderRight: `1px solid ${borderColor}` }}>
      <Box sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${borderColor}` }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: darkMode ? mocha.mauve : '#7c3aed', letterSpacing: '-0.02em', fontSize: '1rem' }}>
          💪 Fitness Analytics
        </Typography>
      </Box>

      <List sx={{ flex: 1, py: 1.5, px: 1 }}>
        {navItems.map(item => {
          const active = isActive(item.path);
          const hasItemData = item.count !== null && item.count > 0;
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.25 }}>
              <ListItemButton
                component={Link}
                to={item.path}
                selected={active}
                onClick={() => setMobileOpen(false)}
                sx={{
                  borderRadius: 2,
                  py: 0.9,
                  px: 1.5,
                  color: active ? (darkMode ? mocha.mauve : '#7c3aed') : theme.palette.text.secondary,
                  bgcolor: active ? (darkMode ? 'rgba(203,166,247,0.12)' : 'rgba(124,58,237,0.08)') : 'transparent',
                  '&:hover': { bgcolor: darkMode ? 'rgba(203,166,247,0.07)' : 'rgba(124,58,237,0.05)' },
                  '&.Mui-selected': { bgcolor: 'transparent' },
                }}
              >
                <ListItemIcon sx={{ minWidth: 32, color: 'inherit', position: 'relative' }}>
                  {item.icon}
                  {hasItemData && (
                    <Box sx={{ position: 'absolute', top: -2, right: -2, width: 7, height: 7, borderRadius: '50%', bgcolor: darkMode ? mocha.green : '#10b981' }} />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  slotProps={{ primary: { style: { fontSize: '0.875rem', fontWeight: active ? 600 : 400 } } }}
                />
                {item.count !== null && item.count > 0 && (
                  <Chip label={item.count} size="small" sx={{ height: 20, fontSize: '0.7rem', bgcolor: darkMode ? mocha.surface1 : 'rgba(109,40,217,0.1)', color: darkMode ? mocha.subtext1 : '#7c3aed', border: 'none' }} />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor }} />

      <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 0.75 }}>
        <LockIcon sx={{ fontSize: 12, color: darkMode ? mocha.green : '#10b981' }} />
        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: '0.7rem' }}>
          Data stays local — never uploaded
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {isMobile && (
        <AppBar position="fixed" elevation={0} sx={{ bgcolor: darkMode ? mocha.mantle : 'white', borderBottom: `1px solid ${borderColor}`, color: theme.palette.text.primary }}>
          <Toolbar sx={{ gap: 1 }}>
            <IconButton edge="start" onClick={() => setMobileOpen(o => !o)} size="small">
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flex: 1, fontWeight: 700, color: darkMode ? mocha.mauve : '#7c3aed', fontSize: '1rem' }}>
              💪 Fitness Analytics
            </Typography>
            {hasData && (
              <DateRangePicker />
            )}
            <Tooltip title={darkMode ? 'Light mode' : 'Dark mode'}>
              <IconButton onClick={onToggleDarkMode} size="small">
                {darkMode ? <LightIcon fontSize="small" /> : <DarkIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>
      )}

      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, border: 'none' } }}
        >
          {sidebarContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, border: 'none', bgcolor: sidebarBg } }}
          open
        >
          {sidebarContent}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flex: 1, minWidth: 0, minHeight: '100vh', bgcolor: theme.palette.background.default, pt: isMobile ? 8 : 0, display: 'flex', flexDirection: 'column' }}>
        {!isMobile && (
          <Box sx={{ px: 3, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2, borderBottom: `1px solid ${borderColor}`, bgcolor: darkMode ? mocha.base : theme.palette.background.default, position: 'sticky', top: 0, zIndex: 10 }}>
            {hasData && <DateRangePicker />}
            <Tooltip title={darkMode ? 'Light mode' : 'Dark mode'}>
              <IconButton onClick={onToggleDarkMode} size="small">
                {darkMode
                  ? <LightIcon fontSize="small" sx={{ color: mocha.yellow }} />
                  : <DarkIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          </Box>
        )}

        <Box sx={{ flex: 1, p: { xs: 2, md: 3 } }}>{children}</Box>
      </Box>
    </Box>
  );
};

export default AppLayout;
