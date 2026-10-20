"use client";

import { Box, Button, Stack, Typography } from "@mui/material";

import PasdartInlineError from "@/components/PasdartInlineError";

type MatchResultControlsProps = {
  matchId: number;
  bestOf: number;
  matchMode?: "bestOf" | "fixedLegs";
  fixedLegCount?: number;
  isAdmin: boolean;
  density?: "default" | "compact" | "inline";
  title?: string;
  actionError?: string;
  onResult: (matchId: number, teamALegs: number, teamBLegs: number) => void;
};

function getPossibleResults(bestOf: number) {
  const legsToWin = Math.floor(bestOf / 2) + 1;

  const results: Array<[number, number]> = [];

  for (let loserLegs = 0; loserLegs < legsToWin; loserLegs += 1) {
    results.push([legsToWin, loserLegs]);
  }

  for (let loserLegs = legsToWin - 1; loserLegs >= 0; loserLegs -= 1) {
    results.push([loserLegs, legsToWin]);
  }

  return results;
}

function getPossibleFixedLegResults(legCount: number) {
  const results: Array<[number, number]> = [];

  for (let teamALegs = legCount; teamALegs >= 0; teamALegs -= 1) {
    results.push([teamALegs, legCount - teamALegs]);
  }

  return results;
}

export default function MatchResultControls({
  matchId,
  bestOf,
  matchMode = "bestOf",
  fixedLegCount,
  isAdmin,
  density = "default",
  title = "Registrera resultat",
  actionError,
  onResult,
}: MatchResultControlsProps) {
  if (!isAdmin) {
    return null;
  }

  const compact = density === "compact";
  const inline = density === "inline";

  const possibleResults =
    matchMode === "fixedLegs" && fixedLegCount
      ? getPossibleFixedLegResults(fixedLegCount)
      : getPossibleResults(bestOf);

  return (
    <Box>
      {!inline && (
        <Typography
          variant={compact ? "body2" : "body1"}
          sx={{
            fontWeight: compact ? 700 : 600,
            mb: compact ? 0.75 : 1,
          }}
        >
          {title}
        </Typography>
      )}

      <Stack
        sx={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: inline ? "center" : "flex-start",
          gap: inline ? 0.5 : compact ? 0.75 : 1,
        }}
      >
        {possibleResults.map(([teamALegs, teamBLegs]) => (
          <Button
            key={`${teamALegs}-${teamBLegs}`}
            size={compact || inline ? "small" : "medium"}
            variant="outlined"
            onClick={() => onResult(matchId, teamALegs, teamBLegs)}
            sx={
              inline
                ? {
                    minWidth: 46,
                    px: 0.85,
                    py: 0.4,
                    borderRadius: 0.5,
                    borderColor: "rgba(255,255,255,0.18)",
                    color: "text.primary",
                    fontSize: "0.78rem",
                    fontWeight: 800,
                    backgroundColor: "rgba(255,255,255,0.018)",
                    boxShadow: "none",
                    "&:hover": {
                      borderColor: "rgba(198,40,40,0.70)",
                      backgroundColor: "rgba(198,40,40,0.08)",
                    },
                  }
                : compact
                  ? {
                      minWidth: 54,
                      borderRadius: 0.75,
                    }
                  : undefined
            }
          >
            {teamALegs} - {teamBLegs}
          </Button>
        ))}
      </Stack>

      {actionError && (
        <Box sx={{ mt: 1 }}>
          <PasdartInlineError message={actionError} />
        </Box>
      )}
    </Box>
  );
}
