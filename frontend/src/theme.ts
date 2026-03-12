import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#5A6C57', // Dark Muted Green
            light: '#85A98F',
            dark: '#525B44',
            contrastText: '#FFF',
        },
        secondary: {
            main: '#85A98F', // Muted Green
            light: '#D3F1DF',
            dark: '#5A6C57',
            contrastText: '#FFF',
        },
        warning: {
            main: '#D4A373',
        },
        success: {
            main: '#5A6C57',
        },
        background: {
            default: '#F5F7F5', // Very light green-tinted white
            paper: '#D3F1DF',   // Very Light Green (Surfaces)
        },
        text: {
            primary: '#525B44', // Deep Olive Green
            secondary: '#5A6C57',
        },
    },
    typography: {
        fontFamily: '"Kanit", "Sarabun", sans-serif',
        h1: { fontWeight: 900, color: '#525B44' },
        h2: { fontWeight: 900, color: '#525B44' },
        h3: { fontWeight: 900, color: '#525B44' },
        h4: { fontWeight: 900, color: '#525B44' },
        h5: { fontWeight: 900, color: '#525B44' },
        h6: { fontWeight: 900, color: '#525B44' },
        button: {
            textTransform: 'none',
            fontWeight: 800,
            fontSize: '1rem',
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
                    padding: '10px 24px',
                    borderRadius: 12,
                    '&:hover': {
                        boxShadow: '0 4px 12px rgba(90, 108, 87, 0.2)',
                    },
                },
                contained: {
                    '&:hover': {
                        backgroundColor: '#525B44',
                    }
                }
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    boxShadow: '0 4px 20px rgba(82, 91, 68, 0.05)',
                    border: '1px solid #B6CEB4',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 20,
                    boxShadow: '0 8px 30px rgba(82, 91, 68, 0.08)',
                }
            }
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontWeight: 700,
                    borderRadius: 8,
                }
            }
        }
    },
});

export default theme;
