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
});

export default theme;
