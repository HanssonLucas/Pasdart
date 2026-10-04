"use client";

import {
  Box,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

type PasdartLoadingStateProps = {
  title: string;
  description?: string;
  variant?: "page" | "inline";
};

export default function PasdartLoadingState({
  title,
  description,
  variant = "page",
}: PasdartLoadingStateProps) {
  if (variant === "inline") {
    return (
      <Box
        sx={{
          minHeight: 96,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 0.75,
          backgroundColor: "rgba(255,255,255,0.01)",
        }}
      >
        <Stack
          sx={{
            flexDirection: "row",
            alignItems: "center",
            gap: 1.5,
            px: 2,
            py: 1.75,
          }}
        >
          <CircularProgress
            size={22}
            thickness={4}
            sx={{ color: "error.light" }}
          />

          <Box>
            <Typography sx={{ fontWeight: 800 }}>{title}</Typography>

            {description && (
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", mt: 0.15 }}
              >
                {description}
              </Typography>
            )}
          </Box>
        </Stack>
      </Box>
    );
  }

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
          <Box
            sx={{
              height: 3,
              display: "grid",
              gridTemplateColumns: "42px 12px 42px",
              justifyContent: "center",
            }}
          >
            <Box sx={{ backgroundColor: "success.dark" }} />
            <Box sx={{ backgroundColor: "error.dark" }} />
            <Box sx={{ backgroundColor: "success.dark" }} />
          </Box>

          <Stack
            spacing={1.5}
            sx={{
              alignItems: "center",
              textAlign: "center",
              px: { xs: 2.5, sm: 4 },
              py: { xs: 4, sm: 5 },
            }}
          >
            <CircularProgress
              size={34}
              thickness={4}
              sx={{ color: "error.light" }}
            />

            <Box>
              <Typography
                sx={{
                  fontFamily: '"Times New Roman", Georgia, serif',
                  fontStyle: "italic",
                  fontSize: { xs: "1.1rem", sm: "1.2rem" },
                  color: "text.primary",
                  mb: 0.75,
                }}
              >
                Pas d&apos;Art
              </Typography>

              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                }}
              >
                {title}
              </Typography>

              {description && (
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    mt: 0.5,
                    mx: "auto",
                    maxWidth: 360,
                  }}
                >
                  {description}
                </Typography>
              )}
            </Box>
          </Stack>
        </Paper>
      </Box>
    </Container>
  );
}
