"use client";

import { Box, Button, Stack, Typography } from "@mui/material";

import PasdartInlineError from "@/components/PasdartInlineError";

type MatchResultControlsProps = {
  matchId: number;
  bestOf: number;
  isAdmin: boolean;
  density?: "default" | "compact";
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

export default function MatchResultControls({
  matchId,
  bestOf,
  isAdmin,
  density = "default",
  actionError,
  onResult,
}: MatchResultControlsProps) {
  if (!isAdmin) {
    return null;
  }

  const compact = density === "compact";

  return (
    <Box>
      <Typography
        variant={compact ? "body2" : "body1"}
        sx={{
          fontWeight: compact ? 700 : 600,
          mb: compact ? 0.75 : 1,
        }}
      >
        Registrera resultat
      </Typography>

      <Stack
        sx={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: compact ? 0.75 : 1,
        }}
      >
        {getPossibleResults(bestOf).map(([teamALegs, teamBLegs]) => (
          <Button
            key={`${teamALegs}-${teamBLegs}`}
            size={compact ? "small" : "medium"}
            variant="outlined"
            onClick={() => onResult(matchId, teamALegs, teamBLegs)}
            sx={
              compact
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
