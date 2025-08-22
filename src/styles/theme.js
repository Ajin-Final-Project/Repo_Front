// theme.js

import { createTheme } from '@mui/material/styles';

export const getTheme = (mode) => createTheme({
  palette: {
    mode,
    primary: { main: '#3BBF97' },
    warning: { main: '#FEBE69' },
    background: {
      default: mode === 'dark' ? '#333' : '#f5f5f5',
      paper:   mode === 'dark' ? '#333' : '#ffffff',
    },
    text: {
      primary: mode === 'dark' ? '#ffffff' : '#000000',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        main:{
          backgroundColor: mode === 'dark' ? '#333' : '#f5f5f5',
        },
        '#root': {  // ⭐ 여기 추가
          backgroundColor: mode === 'dark' ? '#333' : '#f5f5f5',
        },
        '.breadcrumb': {
          backgroundColor: mode === 'dark' ? '#444' : '#fff',
          padding: '8px 12px',
          borderRadius: '4px',
        },
        '.breadcrumb-item': {
          color: mode === 'dark' ? '#fff' : '#000',
        },
        '.breadcrumb-item.active': {
          color: mode === 'dark' ? '#fff' : '#000',
        },
        '.contant': {
          color: mode === 'dark' ? '#fff' : '#000',
        },
        '.theme-settings h6': {
          color: mode === 'dark' ? '#fff' : '#000',
        },
        '.widget-body': {
          backgroundColor: mode === 'dark' ? '#333' : '#fff',
          color: mode === 'dark' ? '#fff' : '#000',
        },
        '.theme-settings label, .abc-radio label, label[for^="navbar_"], label[for^="sidebar_"], label[for^="main_"]': {
          color: mode === 'dark' ? '#fff' : '#000',
        },
      },
    },
  },
});
