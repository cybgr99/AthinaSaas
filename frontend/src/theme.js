import { createTheme } from '@mui/material/styles';
import { elGR } from '@mui/material/locale';

const theme = createTheme(
  {
    palette: {
      primary: {
        main: '#1976d2',
        light: '#42a5f5',
        dark: '#1565c0'
      },
      secondary: {
        main: '#9c27b0',
        light: '#ba68c8',
        dark: '#7b1fa2'
      }
    },
    typography: {
      fontFamily: [
        'Roboto',
        'Arial',
        'sans-serif'
      ].join(','),
      h1: {
        fontSize: '2.5rem',
        fontWeight: 500
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 500
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 500
      }
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none'
          }
        }
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 8
          }
        }
      },
      MuiTextField: {
        defaultProps: {
          size: 'small'
        }
      },
      MuiInputLabel: {
        defaultProps: {
          size: 'small'
        }
      },
      MuiDataGrid: {
        defaultProps: {
          localeText: elGR.components.MuiDataGrid.defaultProps.localeText
        }
      },
      MuiDatePicker: {
        defaultProps: {
          localeText: elGR.components.MuiDatePicker.defaultProps.localeText
        }
      }
    }
  },
  elGR
);

export default theme;
