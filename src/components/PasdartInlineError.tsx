"use client";

import { Box, Typography } from "@mui/material";

type PasdartInlineErrorProps = {
  message: string;
};

export default function PasdartInlineError({
  message,
}: PasdartInlineErrorProps) {
  return (
    <Box
      role="alert"
      sx={{
        border: "1px solid rgba(198,40,40,0.45)",
        borderLeft: "3px solid",
        borderLeftColor: "error.dark",
        borderRadius: 0.75,
        backgroundColor: "rgba(198,40,40,0.06)",
        px: { xs: 1.75, sm: 2 },
        py: 1.5,
      }}
    >
      <Typography
        sx={{
          fontWeight: 800,
          lineHeight: 1.35,
        }}
      >
        Något gick fel
      </Typography>

      <Typography
        variant="body2"
        sx={{
          color: "text.secondary",
          mt: 0.35,
          lineHeight: 1.5,
        }}
      >
        {message}
      </Typography>
    </Box>
  );
}
