"use client";

import { useState } from "react";

import { Box, Button, Stack, Typography } from "@mui/material";

type TournamentShareCodeProps = {
  viewerCode: string;
};

export default function TournamentShareCode({
  viewerCode,
}: TournamentShareCodeProps) {
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

  return (
    <Box
      sx={{
        mt: 1.5,
        pt: 1.25,
        borderTop: "1px solid rgba(255,255,255,0.10)",
      }}
    >
      <Typography
        variant="caption"
        sx={{
          display: "block",
          color: "success.light",
          fontWeight: 800,
          letterSpacing: "0.08em",
          mb: 0.55,
        }}
      >
        FÖLJKOD
      </Typography>

      <Stack
        sx={{
          flexDirection: "row",
          alignItems: "center",
          gap: 1,
          flexWrap: "wrap",
        }}
      >
        <Typography
          sx={{
            fontWeight: 900,
            letterSpacing: "0.12em",
            fontSize: "1.05rem",
            lineHeight: 1,
          }}
        >
          {viewerCode}
        </Typography>

        <Button
          type="button"
          size="small"
          variant="outlined"
          onClick={() => void handleCopy()}
          sx={{
            minWidth: 0,
            px: 1,
            py: 0.35,
            borderRadius: 0.75,
            borderColor: "rgba(255,255,255,0.18)",
            color: "text.primary",
            fontSize: "0.72rem",
            fontWeight: 800,
          }}
        >
          {copied ? "Kopierad!" : "Kopiera"}
        </Button>
      </Stack>
    </Box>
  );
}
