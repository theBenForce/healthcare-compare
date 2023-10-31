import { ThemeOptions, createTheme } from '@mui/material/styles';

export const themeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: '#000080',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#90EE90',
      contrastText: '#000000',
    },
  },
};

const theme = createTheme(themeOptions);

export default theme;