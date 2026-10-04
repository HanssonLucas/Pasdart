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

import PasdartErrorState from "@/components/PasdartErrorState";
import PasdartLoadingState from "@/components/PasdartLoadingState";

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
      <PasdartLoadingState
        title="Förbereder lagen"
        description="Hämtar spelarna och gör lagindelningen redo."
      />
    );
  }

  if (error || !tournament) {
    return (
      <PasdartErrorState
        title="Cupen kunde inte öppnas"
        message="Kontrollera länken eller försök igen."
        actionLabel="Försök igen"
        onAction={() => window.location.reload()}
        secondaryActionLabel="Gå till startsidan"
        onSecondaryAction={() => {
          router.push("/");
        }}
      />
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: { xs: 3, sm: 4 } }}>
        <Stack spacing={3}>
          <Paper
            elevation={0}
            sx={{
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.14)",
              borderRadius: 1.25,
              backgroundColor: "rgba(255,255,255,0.018)",
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
              <Box sx={{ backgroundColor: "rgba(255,255,255,0.78)" }} />
              <Box sx={{ backgroundColor: "error.dark" }} />
            </Box>

            <Box
              sx={{
                p: { xs: 2.5, sm: 3.5 },
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "minmax(0, 1fr) auto",
                },
                gap: 2,
                alignItems: "center",
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontFamily: 'Georgia, "Times New Roman", serif',
                    fontStyle: "italic",
                    fontSize: { xs: "1.1rem", sm: "1.25rem" },
                    color: "rgba(255,255,255,0.82)",
                    lineHeight: 1,
                  }}
                >
                  Pas d&apos;Art
                </Typography>

                <Typography
                  variant="h3"
                  component="h1"
                  sx={{
                    mt: 0.8,
                    fontWeight: 800,
                    letterSpacing: "-0.025em",
                    fontSize: { xs: "2rem", sm: "2.5rem" },
                  }}
                >
                  Lagindelning
                </Typography>

                <Typography sx={{ color: "text.secondary", mt: 0.75 }}>
                  Kontrollera lagen innan cupen startas.
                </Typography>
              </Box>

              <Box
                sx={{
                  pl: { sm: 2.5 },
                  borderLeft: {
                    xs: "none",
                    sm: "1px solid rgba(255,255,255,0.10)",
                  },
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    color: "error.light",
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                  }}
                >
                  LÄGE
                </Typography>

                <Typography sx={{ mt: 0.25, fontWeight: 800 }}>
                  {tournament.teamMode === "doubles" ? "Dubbel" : "Singel"}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", mt: 0.2 }}
                >
                  {teams.length} {teams.length === 1 ? "lag" : "lag"} ·{" "}
                  {tournament.players.length} spelare
                </Typography>
              </Box>
            </Box>
          </Paper>

          {error && <Alert severity="error">{error}</Alert>}

          <Paper
            elevation={0}
            sx={{
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 1,
              backgroundColor: "rgba(255,255,255,0.014)",
            }}
          >
            <Box
              sx={{
                px: { xs: 2, sm: 2.5 },
                pt: 2.25,
                pb: 1.75,
                borderBottom: "1px solid rgba(255,255,255,0.10)",
                borderLeft: "3px solid rgba(198,40,40,0.70)",
              }}
            >
              <Stack
                sx={{
                  flexDirection: { xs: "column", sm: "row" },
                  justifyContent: "space-between",
                  alignItems: { xs: "flex-start", sm: "flex-end" },
                  gap: 1.5,
                }}
              >
                <Box>
                  <Typography
                    variant="overline"
                    sx={{
                      color: "error.light",
                      fontWeight: 800,
                      letterSpacing: "0.08em",
                    }}
                  >
                    SLUMPADE LAG
                  </Typography>

                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    Kvällens lag
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{ color: "text.secondary", mt: 0.35 }}
                  >
                    Inte nöjd? Slumpa om tills det känns rätt.
                  </Typography>
                </Box>

                <Button
                  variant="outlined"
                  onClick={handleReshuffle}
                  sx={{
                    borderRadius: 0.75,
                    borderColor: "rgba(255,255,255,0.18)",
                    color: "text.primary",
                    minWidth: { sm: 150 },
                  }}
                >
                  Slumpa om
                </Button>
              </Stack>
            </Box>

            <Box
              sx={{
                p: { xs: 2, sm: 2.5 },
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: 1.25,
              }}
            >
              {teams.map((team) => (
                <Box
                  key={team.number}
                  sx={{
                    width: {
                      xs: "100%",
                      sm: "calc(50% - 5px)",
                      md: "calc(33.333% - 7px)",
                    },
                    minHeight: { xs: 106, md: 118 },
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                    position: "relative",
                    px: 2,
                    py: 2,
                    border: "1px solid rgba(255,255,255,0.11)",
                    borderRadius: 0.75,
                    backgroundColor: "rgba(255,255,255,0.012)",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    aria-hidden="true"
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 42,
                      height: 2,
                      backgroundColor: "error.dark",
                    }}
                  />

                  <Typography
                    sx={{
                      color: "error.light",
                      fontWeight: 800,
                      fontSize: { xs: "1.15rem", md: "1.25rem" },
                      letterSpacing: "0.035em",
                      lineHeight: 1.1,
                    }}
                  >
                    LAG {team.number}
                  </Typography>

                  <Typography
                    sx={{
                      mt: 1,
                      fontWeight: 800,
                      fontSize: { xs: "1.05rem", md: "1.12rem" },
                      lineHeight: 1.35,
                    }}
                  >
                    {team.players.map((player) => player.name).join(" + ")}
                  </Typography>

                  {tournament.teamMode === "doubles" &&
                    team.players.length === 1 && (
                      <Typography
                        variant="caption"
                        sx={{
                          mt: 0.5,
                          color: "text.secondary",
                        }}
                      >
                        Spelar solo
                      </Typography>
                    )}
                </Box>
              ))}
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 1,
              backgroundColor: "rgba(255,255,255,0.014)",
            }}
          >
            <Box
              sx={{
                px: { xs: 2, sm: 2.5 },
                py: { xs: 2, sm: 2.25 },
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "minmax(0, 1fr) auto",
                },
                gap: { xs: 1.5, md: 3 },
                alignItems: "center",
              }}
            >
              <Box>
                <Typography
                  variant="overline"
                  sx={{
                    color: "error.light",
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                  }}
                >
                  REDO?
                </Typography>

                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  Godkänn lagen
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    mt: 0.35,
                    maxWidth: 620,
                  }}
                >
                  När lagen känns rätt skapar vi spelschemat och startar cupen.
                </Typography>
              </Box>

              <Button
                variant="contained"
                size="large"
                onClick={handleApproveTeams}
                disabled={saving || teamsSaved}
                sx={{
                  width: { xs: "100%", md: "auto" },
                  minWidth: { md: 220 },
                  minHeight: 52,
                  borderRadius: 0.75,
                  boxShadow: "none",
                  fontWeight: 800,
                }}
              >
                {saving
                  ? "Sparar lag..."
                  : teamsSaved
                    ? "Lagen är sparade"
                    : "Godkänn lag"}
              </Button>
            </Box>
          </Paper>
        </Stack>
      </Box>
    </Container>
  );
}
