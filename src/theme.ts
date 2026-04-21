import { createTheme } from '@mui/material/styles';

export const mocha = {
  base: '#1e1e2e',
  mantle: '#181825',
  crust: '#11111b',
  surface0: '#313244',
  surface1: '#45475a',
  surface2: '#585b70',
  overlay0: '#6c7086',
  overlay1: '#7f849c',
  subtext0: '#a6adc8',
  subtext1: '#bac2de',
  text: '#cdd6f4',
  lavender: '#b4befe',
  blue: '#89b4fa',
  sapphire: '#74c7ec',
  sky: '#89dceb',
  teal: '#94e2d5',
  green: '#a6e3a1',
  yellow: '#f9e2af',
  peach: '#fab387',
  red: '#f38ba8',
  maroon: '#eba0ac',
  mauve: '#cba6f7',
  pink: '#f5c2e7',
} as const;

export const chartColors = [
  mocha.mauve,
  mocha.blue,
  mocha.green,
  mocha.peach,
  mocha.red,
  mocha.sapphire,
  mocha.yellow,
  mocha.teal,
  mocha.pink,
];

export const getChartColors = (dark: boolean): string[] =>
  dark
    ? chartColors
    : ['#7c3aed', '#3b82f6', '#10b981', '#f97316', '#ef4444', '#06b6d4', '#eab308', '#0d9488', '#ec4899'];

export const getChartGrid = (dark: boolean): string =>
  dark ? 'rgba(108,112,134,0.12)' : 'rgba(0,0,0,0.08)';

export const getChartText = (dark: boolean): string =>
  dark ? mocha.subtext0 : '#6b7280';

export const getChartTooltipBg = (dark: boolean): string =>
  dark ? mocha.surface1 : '#ffffff';

export const createAppTheme = (dark: boolean) =>
  createTheme({
    palette: {
      mode: dark ? 'dark' : 'light',
      ...(dark
        ? {
            background: { default: mocha.base, paper: mocha.surface0 },
            text: { primary: mocha.text, secondary: mocha.subtext0 },
            primary: { main: mocha.mauve, light: mocha.lavender, dark: '#9d7fd4', contrastText: mocha.crust },
            secondary: { main: mocha.pink },
            error: { main: mocha.red },
            warning: { main: mocha.yellow },
            success: { main: mocha.green },
            info: { main: mocha.blue },
            divider: 'rgba(108,112,134,0.3)',
            action: {
              hover: 'rgba(203,166,247,0.08)',
              selected: 'rgba(203,166,247,0.14)',
              focus: 'rgba(203,166,247,0.12)',
            },
          }
        : {
            background: { default: '#f5f3ff', paper: '#ffffff' },
            text: { primary: '#1e1b4b', secondary: '#6b7280' },
            primary: { main: '#7c3aed', contrastText: '#ffffff' },
            divider: 'rgba(109,40,217,0.12)',
          }),
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      button: { textTransform: 'none', fontWeight: 600 },
      h3: { fontWeight: 700, letterSpacing: '-0.03em' },
      h4: { fontWeight: 700, letterSpacing: '-0.02em' },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      overline: { letterSpacing: '0.08em', fontSize: '0.7rem' },
    },
    shape: { borderRadius: 12 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          '*': { boxSizing: 'border-box' },
          body: { margin: 0, padding: 0 },
          '::-webkit-scrollbar': { width: '6px', height: '6px' },
          '::-webkit-scrollbar-track': { background: 'transparent' },
          '::-webkit-scrollbar-thumb': {
            background: dark ? mocha.surface1 : '#d1d5db',
            borderRadius: '3px',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            ...(dark && {
              border: '1px solid rgba(108,112,134,0.22)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
            }),
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            ...(dark && {
              backgroundColor: mocha.surface0,
              border: '1px solid rgba(108,112,134,0.22)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
            }),
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            ...(dark && {
              '& .MuiTableCell-root': {
                backgroundColor: mocha.mantle,
                borderColor: 'rgba(108,112,134,0.22)',
              },
            }),
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            ...(dark && { borderColor: 'rgba(108,112,134,0.18)' }),
          },
        },
      },
      MuiChip: {
        styleOverrides: { root: { fontWeight: 500 } },
      },
      MuiTab: {
        styleOverrides: { root: { fontWeight: 500, fontSize: '0.875rem' } },
      },
    },
  });
