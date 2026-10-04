"use client";

import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#111111",
      paper: "#1a1a1a",
    },
    text: {
      primary: "#f5f5f5",
      secondary: "#bdbdbd",
    },
    primary: {
      main: "#f5f5f5",
      contrastText: "#111111",
    },
    secondary: {
      main: "#2e7d32",
    },
    error: {
      main: "#c62828",
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: "Arial, Helvetica, sans-serif",
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          transition:
            "background-color 160ms ease, border-color 160ms ease, color 160ms ease, transform 160ms ease",
          "&:hover": {
            transform: "translateY(-1px)",
          },
          "&:focus-visible": {
            outline: "2px solid rgba(245,245,245,0.9)",
            outlineOffset: 2,
          },
        },
        contained: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
            backgroundColor: "#ffffff",
          },
        },
        outlined: {
          borderColor: "rgba(255,255,255,0.18)",
          "&:hover": {
            borderColor: "rgba(255,255,255,0.34)",
            backgroundColor: "rgba(255,255,255,0.035)",
          },
        },
        text: {
          "&:hover": {
            backgroundColor: "rgba(255,255,255,0.035)",
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          transition:
            "background-color 160ms ease, box-shadow 160ms ease, border-color 160ms ease",
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(255,255,255,0.28)",
          },
          "&.Mui-focused": {
            backgroundColor: "rgba(255,255,255,0.018)",
            boxShadow: "0 0 0 2px rgba(245,245,245,0.08)",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(245,245,245,0.72)",
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          transition: "color 160ms ease, background-color 160ms ease",
          "&:hover": {
            backgroundColor: "rgba(255,255,255,0.035)",
          },
          "&.Mui-focusVisible": {
            outline: "2px solid rgba(245,245,245,0.8)",
            outlineOffset: 2,
          },
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          transition: "color 160ms ease, background-color 160ms ease",
          "&:hover": {
            backgroundColor: "rgba(255,255,255,0.035)",
          },
          "&.Mui-focusVisible": {
            outline: "2px solid rgba(245,245,245,0.8)",
            outlineOffset: 2,
          },
        },
      },
    },
  },
});

export default theme;
