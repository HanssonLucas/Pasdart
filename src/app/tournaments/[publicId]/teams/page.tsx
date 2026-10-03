"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";

type Player = {
  id: number;
  name: string;
};

type TournamentData = {
  id: number;
  publicId: string;
  teamMode: "singles" | "doubles";
  players: Player[];
};

type GeneratedTeam = {
  number: number;
  players: Player[];
};

function shufflePlayers(players: Player[]) {
  const shuffled = [...players];

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const randomIndex = Math.floor(Math.random() * (i + 1));

    [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]];
  }

  return shuffled;
}

function generateTeams(
  players: Player[],
  teamMode: "singles" | "doubles",
): GeneratedTeam[] {
  const shuffledPlayers = shufflePlayers(players);

  if (teamMode === "singles") {
    return shuffledPlayers.map((player, index) => ({
      number: index + 1,
      players: [player],
    }));
  }

  const generatedTeams: GeneratedTeam[] = [];

  for (let i = 0; i < shuffledPlayers.length; i += 2) {
    generatedTeams.push({
      number: generatedTeams.length + 1,
      players: shuffledPlayers.slice(i, i + 2),
    });
  }

  return generatedTeams;
}

export default function TeamsPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const [tournament, setTournament] = useState<TournamentData | null>(null);
  const [teams, setTeams] = useState<GeneratedTeam[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [teamsSaved, setTeamsSaved] = useState(false);
  const router = useRouter();

  const resolvedParams = useMemo(() => params, [params]);

  useEffect(() => {
    let cancelled = false;

    async function loadTournament() {
      try {
        const { publicId } = await resolvedParams;

        const response = await fetch(`/api/tournaments/${publicId}`);

        if (!response.ok) {
          throw new Error();
        }

        const data: TournamentData = await response.json();

        if (!cancelled) {
          setTournament(data);
          setTeams(generateTeams(data.players, data.teamMode));
        }
      } catch {
        if (!cancelled) {
          setError("Kunde inte hämta cupen.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadTournament();

    return () => {
      cancelled = true;
    };
  }, [resolvedParams]);

  function handleReshuffle() {
    if (!tournament) {
      return;
    }

    setTeams(generateTeams(tournament.players, tournament.teamMode));
  }

  async function handleApproveTeams() {
    if (!tournament) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch(
        `/api/tournaments/${tournament.publicId}/teams`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            teams: teams.map((team) => ({
              number: team.number,
              playerIds: team.players.map((player) => player.id),
            })),
          }),
        },
      );

      if (!response.ok) {
        throw new Error();
      }

      setTeamsSaved(true);
      router.push(`/tournaments/${tournament.publicId}/schedule`);
    } catch {
      setError("Kunde inte spara lagen.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ py: 4 }}>
          <Typography>Hämtar lag...</Typography>
        </Box>
      </Container>
    );
  }

  if (error || !tournament) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ py: 4 }}>
          <Alert severity="error">{error || "Cupen kunde inte hittas."}</Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 4 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
              Lagindelning
            </Typography>

            <Typography sx={{ color: "text.secondary", mt: 0.5 }}>
              Kontrollera lagen innan cupen startas.
            </Typography>
          </Box>

          <Stack spacing={2}>
            {teams.map((team) => (
              <Paper
                key={team.number}
                elevation={0}
                sx={{
                  p: 2.5,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  Lag {team.number}
                </Typography>

                <Stack spacing={0.5}>
                  {team.players.map((player) => (
                    <Typography key={player.id}>{player.name}</Typography>
                  ))}
                </Stack>
              </Paper>
            ))}
          </Stack>

          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              size="large"
              fullWidth
              onClick={handleReshuffle}
            >
              Slumpa om
            </Button>

            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handleApproveTeams}
              disabled={saving || teamsSaved}
            >
              {saving
                ? "Sparar lag..."
                : teamsSaved
                  ? "Lagen är sparade"
                  : "Godkänn lag"}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Container>
  );
}
