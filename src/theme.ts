import { ThemeOptions, createTheme } from '@mui/material/styles';

export const themeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: '#6495ED',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#90EE90',
      contrastText: '#000000',
    },
    text: {
      primary: '#2F4F4F',
      secondary: '#FFFFFF',
    },
  },
};

const theme = createTheme(themeOptions);

export default theme;