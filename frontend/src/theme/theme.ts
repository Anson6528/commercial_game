import { createTheme } from '@mui/material/styles';
import colors from './colors';

const base = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: colors.primary,
      light: '#33dcff',
      dark: '#00a8cc',
      contrastText: '#0a0f1e',
    },
    secondary: {
      main: colors.accent,
      light: '#33ffb5',
      dark: '#00cc80',
      contrastText: '#0a0f1e',
    },
    error: { main: colors.danger },
    warning: { main: colors.warning },
    info: { main: colors.primary },
    success: { main: colors.accent },
    background: {
      default: colors.bg.deep,
      paper: colors.bg.paper,
    },
    text: {
      primary: colors.white,
      secondary: colors.text,
      disabled: colors.muted,
    },
    divider: colors.border,
  },
  typography: {
    fontFamily: '"Noto Sans SC", "Roboto", "Helvetica Neue", Arial, sans-serif',
    h1: { fontFamily: '"Orbitron", sans-serif', fontWeight: 700, letterSpacing: '0.05em' },
    h2: { fontFamily: '"Orbitron", sans-serif', fontWeight: 700, letterSpacing: '0.05em' },
    h3: { fontFamily: '"Orbitron", sans-serif', fontWeight: 600, letterSpacing: '0.04em' },
    h4: { fontFamily: '"Orbitron", sans-serif', fontWeight: 600, letterSpacing: '0.04em' },
    h5: { fontFamily: '"Orbitron", sans-serif', fontWeight: 500, letterSpacing: '0.03em' },
    h6: { fontFamily: '"Orbitron", sans-serif', fontWeight: 500, letterSpacing: '0.03em' },
    body1: { fontWeight: 400, lineHeight: 1.6, color: colors.text },
    body2: { fontWeight: 400, lineHeight: 1.5, color: colors.muted },
    caption: { fontFamily: '"JetBrains Mono", "Roboto Mono", monospace', fontWeight: 400 },
    button: {
      fontFamily: '"Orbitron", sans-serif',
      fontWeight: 600,
      letterSpacing: '0.05em',
      textTransform: 'none',
    },
  },
  shape: { borderRadius: 4 },
});

export default createTheme(base, {
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          '&::-webkit-scrollbar': { width: 4 },
          '&::-webkit-scrollbar-track': { background: colors.bg.deep },
          '&::-webkit-scrollbar-thumb': { background: colors.border, borderRadius: 2 },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: `1px solid ${colors.border}`,
          boxShadow: `0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.02)`,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          padding: '8px 20px',
          '&:hover': { boxShadow: `0 0 16px ${colors.glow}` },
          '&.MuiButton-containedPrimary': {
            background: `linear-gradient(135deg, ${colors.primary} 0%, #00a8cc 100%)`,
            '&:hover': { background: `linear-gradient(135deg, #33dcff 0%, ${colors.primary} 100%)` },
          },
          '&.MuiButton-containedSecondary': {
            background: `linear-gradient(135deg, ${colors.accent} 0%, #00cc80 100%)`,
            '&:hover': { background: `linear-gradient(135deg, #33ffb5 0%, ${colors.accent} 100%)` },
          },
          '&.MuiButton-containedError': {
            background: `linear-gradient(135deg, ${colors.danger} 0%, #cc2055 100%)`,
          },
          '&.MuiButton-outlinedPrimary': {
            borderColor: colors.borderHover,
            '&:hover': { borderColor: colors.primary, background: `${colors.primary}14` },
          },
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          borderColor: colors.border,
          color: colors.text,
          '&.Mui-selected': { color: colors.primary, background: `${colors.primary}1a` },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& fieldset': { borderColor: colors.border },
          '&:hover fieldset': { borderColor: colors.borderHover },
          '&.Mui-focused fieldset': { borderColor: colors.primary },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          border: `1px solid ${colors.borderHover}`,
          boxShadow: `0 8px 48px rgba(0,0,0,0.6), 0 0 24px ${colors.glow}`,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 4, fontFamily: '"JetBrains Mono", monospace', fontSize: '0.7rem' },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.04)' },
        bar: { borderRadius: 3 },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: colors.bg.paper,
          border: `1px solid ${colors.border}`,
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: '0.72rem',
        },
      },
    },
  },
});
