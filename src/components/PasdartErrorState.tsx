"use client";

import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

type PasdartErrorStateProps = {
  title?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
};

export default function PasdartErrorState({
  title = "Något gick fel",
  message,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}: PasdartErrorStateProps) {
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "calc(100vh - 100px)",
          display: "flex",
          alignItems: "center",
          py: 4,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: 1,
            backgroundColor: "rgba(255,255,255,0.014)",
          }}
        >
          <Box sx={{ height: 3, backgroundColor: "error.dark" }} />

          <Stack
            spacing={2}
            sx={{
              alignItems: "center",
              textAlign: "center",
              px: { xs: 2.5, sm: 4 },
              py: { xs: 3.5, sm: 4.25 },
            }}
          >
            <Box sx={{ width: "100%" }}>
              <Typography
                sx={{
                  fontFamily: '"Times New Roman", Georgia, serif',
                  fontStyle: "italic",
                  fontSize: { xs: "1.1rem", sm: "1.2rem" },
                  color: "text.primary",
                  mb: 1.25,
                }}
              >
                Pas d&apos;Art
              </Typography>

              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  lineHeight: 1.15,
                }}
              >
                {title}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  mt: 0.75,
                  mx: "auto",
                  maxWidth: 360,
                  lineHeight: 1.55,
                }}
              >
                {message}
              </Typography>
            </Box>

            <Stack
              sx={{
                width: { xs: "100%", sm: "auto" },
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: "center",
                gap: 1,
              }}
            >
              {actionLabel && onAction && (
                <Button
                  variant="contained"
                  onClick={onAction}
                  sx={{
                    minWidth: 150,
                    borderRadius: 0.75,
                    backgroundColor: "primary.main",
                    color: "primary.contrastText",
                    "&:hover": {
                      backgroundColor: "#ffffff",
                    },
                  }}
                >
                  {actionLabel}
                </Button>
              )}

              {secondaryActionLabel && onSecondaryAction && (
                <Button
                  variant="outlined"
                  onClick={onSecondaryAction}
                  sx={{
                    minWidth: 190,
                    borderRadius: 0.75,
                    borderColor: "rgba(255,255,255,0.18)",
                    color: "text.primary",
                  }}
                >
                  {secondaryActionLabel}
                </Button>
              )}
            </Stack>
          </Stack>
        </Paper>
      </Box>
    </Container>
  );
}
