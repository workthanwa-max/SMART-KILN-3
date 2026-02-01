import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#3b82f6', // Bright Blue
            light: '#eff6ff',
            dark: '#1d4ed8',
        },
        secondary: {
            main: '#10b981', // Emerald Green
            light: '#ecfdf5',
            dark: '#047857',
        },
        error: {
            main: '#ef4444',
        },
        background: {
            default: '#f8fafc',
            paper: '#ffffff',
        },
        text: {
            primary: '#0f172a',
            secondary: '#64748b',
        },
    },
    typography: {
        fontFamily: '"Kanit", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: { fontWeight: 800 },
        h2: { fontWeight: 800 },
        h3: { fontWeight: 800 },
        h4: { fontWeight: 800 },
        h5: { fontWeight: 800 },
        h6: { fontWeight: 800 },
        button: {
            textTransform: 'none',
            fontWeight: 700,
        },
    },
    shape: {
        borderRadius: 3,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: 'none',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
            },
        },
    },
});

export default theme;
