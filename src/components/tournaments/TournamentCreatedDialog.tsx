"use client";

import { useState } from "react";

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Stack,
  Typography,
} from "@mui/material";

type TournamentCreatedDialogProps = {
  open: boolean;
  viewerCode: string;
  onClose: () => void;
};

export default function TournamentCreatedDialog({
  open,
  viewerCode,
  onClose,
}: TournamentCreatedDialogProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(viewerCode);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      setCopied(false);
    }
  }

  function handleClose() {
    setCopied(false);
    onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: 1,
            backgroundImage: "none",
          },
        },
      }}
    >
      <Box
        sx={{
          height: 3,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 0.5,
        }}
      >
        <Box sx={{ width: 28, height: 3, backgroundColor: "success.dark" }} />
        <Box sx={{ width: 28, height: 3, backgroundColor: "error.dark" }} />
        <Box sx={{ width: 28, height: 3, backgroundColor: "success.dark" }} />
      </Box>

      <DialogContent sx={{ px: { xs: 2.5, sm: 3 }, pt: 3, pb: 2 }}>
        <Stack spacing={2.25}>
          <Box>
            <Typography
              variant="overline"
              sx={{
                color: "success.light",
                fontWeight: 800,
                letterSpacing: "0.08em",
              }}
            >
              CUPEN ÄR REDO
            </Typography>

            <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.25 }}>
              Dela följkoden
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                mt: 0.6,
                lineHeight: 1.6,
              }}
            >
              Dela koden med de som vill följa matcher, tabell och slutspel.
            </Typography>
          </Box>

          <Box
            sx={{
              py: 2,
              px: 2.5,
              textAlign: "center",
              border: "1px solid rgba(255,255,255,0.14)",
              borderRadius: 0.75,
              backgroundColor: "rgba(255,255,255,0.025)",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                display: "block",
                color: "text.secondary",
                letterSpacing: "0.08em",
                fontWeight: 800,
                mb: 0.5,
              }}
            >
              FÖLJKOD
            </Typography>

            <Typography
              sx={{
                fontSize: { xs: "2rem", sm: "2.35rem" },
                fontWeight: 900,
                letterSpacing: "0.14em",
                lineHeight: 1.1,
              }}
            >
              {viewerCode}
            </Typography>
          </Box>

          <Button
            variant="outlined"
            onClick={() => void handleCopy()}
            sx={{
              minHeight: 46,
              borderRadius: 0.75,
              borderColor: "rgba(255,255,255,0.18)",
              color: "text.primary",
              fontWeight: 800,
            }}
          >
            {copied ? "Kopierad!" : "Kopiera följkod"}
          </Button>
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          px: { xs: 2.5, sm: 3 },
          pb: 3,
          pt: 0.5,
        }}
      >
        <Button
          variant="contained"
          size="large"
          fullWidth
          onClick={handleClose}
          sx={{
            minHeight: 50,
            borderRadius: 0.75,
            boxShadow: "none",
            fontWeight: 800,
          }}
        >
          Stäng och starta cupen
        </Button>
      </DialogActions>
    </Dialog>
  );
}
