import { DefaultTheme } from 'react-native-paper';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#003366', // University blue
    accent: '#FF9500',  // Accent orange
    background: '#f5f5f5',
    surface: '#ffffff',
    text: '#333333',
    error: '#D32F2F',
  },
};

export default theme;
