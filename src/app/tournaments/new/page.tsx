"use client";

import { useEffect, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Checkbox,
  Container,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { useRouter } from "next/navigation";

import PasdartLoadingState from "@/components/PasdartLoadingState";

type Player = {
  id: number;

  name: string;
};

export default function NewTournamentPage() {
  const router = useRouter();

  const [players, setPlayers] = useState<Player[]>([]);

  const [selectedPlayerIds, setSelectedPlayerIds] = useState<number[]>([]);

  const [loadingPlayers, setLoadingPlayers] = useState(true);

  const [error, setError] = useState("");

  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("Onsdagscup");

  const [teamMode, setTeamMode] = useState("doubles");

  const [gameType, setGameType] = useState("501");

  const [groupBestOf, setGroupBestOf] = useState("3");

  const [playoffBestOf, setPlayoffBestOf] = useState("5");

  const [groupMaxDarts, setGroupMaxDarts] = useState("39");

  const [playoffMaxDarts, setPlayoffMaxDarts] = useState("39");

  const [roundRobinType, setRoundRobinType] = useState("single");

  const [boardCount, setBoardCount] = useState("2");

  const [tiebreakMethod, setTiebreakMethod] = useState("castoff");

  useEffect(() => {
    let cancelled = false;

    fetch("/api/players")
      .then((response) => {
        if (!response.ok) {
          throw new Error();
        }

        return response.json();
      })

      .then((data) => {
        if (!cancelled) {
          setPlayers(data);
        }
      })

      .catch(() => {
        if (!cancelled) {
          setError("Kunde inte hämta spelare.");
        }
      })

      .finally(() => {
        if (!cancelled) {
          setLoadingPlayers(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function togglePlayer(playerId: number) {
    setSelectedPlayerIds((current) =>
      current.includes(playerId)
        ? current.filter((id) => id !== playerId)
        : [...current, playerId],
    );
  }

  async function handleContinue() {
    setSaving(true);

    setError("");

    try {
      const response = await fetch("/api/tournaments", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name,

          gameType,

          teamMode,

          roundRobinType,

          groupBestOf,

          playoffBestOf,

          groupMaxDarts,

          playoffMaxDarts,

          boardCount,

          tiebreakMethod,

          playerIds: selectedPlayerIds,
        }),
      });

      if (!response.ok) {
        throw new Error();
      }

      const data = await response.json();

      router.push(`/tournaments/${data.publicId}/teams`);
    } catch {
      setError("Kunde inte skapa cupen.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Container maxWidth="xl">
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

            <Box sx={{ p: { xs: 2.5, sm: 3.5 } }}>
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
                Skapa ny cup
              </Typography>

              <Typography
                sx={{
                  color: "text.secondary",
                  mt: 0.75,
                  maxWidth: 620,
                }}
              >
                Välj vilka som spelar och ställ in kvällens format. Resten
                sköter systemet åt er.
              </Typography>
            </Box>
          </Paper>

          {error && <Alert severity="error">{error}</Alert>}

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, minmax(0, 1fr))",
                lg: "1.08fr 1fr 0.92fr",
              },
              gap: 2,
              alignItems: "stretch",
            }}
          >
            <Paper
              elevation={0}
              sx={{
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 1,
                backgroundColor: "rgba(255,255,255,0.014)",
                height: "100%",
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
                <Typography
                  variant="overline"
                  sx={{
                    color: "error.light",
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                  }}
                >
                  01 · CUPEN
                </Typography>

                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  Namn och spelare
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", mt: 0.35 }}
                >
                  Börja med vilka som ska vara med ikväll.
                </Typography>
              </Box>

              <Stack spacing={2.25} sx={{ p: { xs: 2, sm: 2.5 } }}>
                <TextField
                  label="Cupnamn"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  fullWidth
                />

                <Box>
                  <Stack
                    sx={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 2,
                      mb: 1,
                    }}
                  >
                    <Typography sx={{ fontWeight: 800 }}>Spelare</Typography>

                    <Typography
                      variant="caption"
                      sx={{ color: "text.secondary" }}
                    >
                      {selectedPlayerIds.length} valda
                    </Typography>
                  </Stack>

                  {loadingPlayers ? (
                    <PasdartLoadingState
                      variant="inline"
                      title="Hämtar spelare"
                      description="Förbereder spelarregistret."
                    />
                  ) : players.length === 0 ? (
                    <Typography sx={{ color: "text.secondary" }}>
                      Inga spelare finns sparade ännu.
                    </Typography>
                  ) : (
                    <FormGroup
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "1fr",
                          sm: "repeat(2, minmax(0, 1fr))",
                          lg: "1fr",
                          xl: "repeat(2, minmax(0, 1fr))",
                        },
                        gap: 0.5,
                      }}
                    >
                      {players.map((player) => {
                        const checked = selectedPlayerIds.includes(player.id);

                        return (
                          <FormControlLabel
                            key={player.id}
                            control={
                              <Checkbox
                                checked={checked}
                                onChange={() => togglePlayer(player.id)}
                              />
                            }
                            label={player.name}
                            sx={{
                              m: 0,
                              px: 1,
                              py: 0.35,
                              minHeight: 44,
                              border: "1px solid",
                              borderColor: checked
                                ? "rgba(76,175,80,0.55)"
                                : "rgba(255,255,255,0.08)",
                              borderRadius: 0.75,
                              backgroundColor: checked
                                ? "rgba(46,125,50,0.06)"
                                : "transparent",
                            }}
                          />
                        );
                      })}
                    </FormGroup>
                  )}
                </Box>
              </Stack>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 1,
                backgroundColor: "rgba(255,255,255,0.014)",
                height: "100%",
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
                <Typography
                  variant="overline"
                  sx={{
                    color: "error.light",
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                  }}
                >
                  02 · MATCHFORMAT
                </Typography>

                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  Hur spelar vi?
                </Typography>
              </Box>

              <Stack spacing={2} sx={{ p: { xs: 2, sm: 2.5 } }}>
                <FormControl>
                  <FormLabel>Spelläge</FormLabel>
                  <RadioGroup
                    row
                    value={teamMode}
                    onChange={(event) => setTeamMode(event.target.value)}
                  >
                    <FormControlLabel
                      value="singles"
                      control={<Radio />}
                      label="Singel"
                    />
                    <FormControlLabel
                      value="doubles"
                      control={<Radio />}
                      label="Dubbel"
                    />
                  </RadioGroup>
                </FormControl>

                <TextField
                  select
                  label="Spel"
                  value={gameType}
                  onChange={(event) => setGameType(event.target.value)}
                  fullWidth
                >
                  <MenuItem value="301">301</MenuItem>
                  <MenuItem value="501">501</MenuItem>
                </TextField>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(2, minmax(0, 1fr))",
                      lg: "1fr",
                    },
                    gap: 1.5,
                  }}
                >
                  <TextField
                    select
                    label="Gruppspel - bäst av"
                    value={groupBestOf}
                    onChange={(event) => setGroupBestOf(event.target.value)}
                    fullWidth
                  >
                    <MenuItem value="1">1 leg</MenuItem>
                    <MenuItem value="3">3 legs</MenuItem>
                    <MenuItem value="5">5 legs</MenuItem>
                    <MenuItem value="7">7 legs</MenuItem>
                    <MenuItem value="9">9 legs</MenuItem>
                  </TextField>

                  <TextField
                    select
                    label="Slutspel - bäst av"
                    value={playoffBestOf}
                    onChange={(event) => setPlayoffBestOf(event.target.value)}
                    fullWidth
                  >
                    <MenuItem value="1">1 leg</MenuItem>
                    <MenuItem value="3">3 legs</MenuItem>
                    <MenuItem value="5">5 legs</MenuItem>
                    <MenuItem value="7">7 legs</MenuItem>
                    <MenuItem value="9">9 legs</MenuItem>
                  </TextField>
                </Box>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(2, minmax(0, 1fr))",
                      lg: "1fr",
                    },
                    gap: 1.5,
                  }}
                >
                  <TextField
                    label="Gruppspel - max darts"
                    type="number"
                    value={groupMaxDarts}
                    onChange={(event) => setGroupMaxDarts(event.target.value)}
                    fullWidth
                  />

                  <TextField
                    label="Slutspel - max darts"
                    type="number"
                    value={playoffMaxDarts}
                    onChange={(event) => setPlayoffMaxDarts(event.target.value)}
                    fullWidth
                  />
                </Box>
              </Stack>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 1,
                backgroundColor: "rgba(255,255,255,0.014)",
                height: "100%",
                gridColumn: { md: "1 / -1", lg: "auto" },
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
                <Typography
                  variant="overline"
                  sx={{
                    color: "error.light",
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                  }}
                >
                  03 · TURNERINGSFORMAT
                </Typography>

                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  Kvällens upplägg
                </Typography>
              </Box>

              <Stack spacing={2.25} sx={{ p: { xs: 2, sm: 2.5 } }}>
                <FormControl>
                  <FormLabel>Möten</FormLabel>
                  <RadioGroup
                    row
                    value={roundRobinType}
                    onChange={(event) => setRoundRobinType(event.target.value)}
                  >
                    <FormControlLabel
                      value="single"
                      control={<Radio />}
                      label="Enkelmöte"
                    />
                    <FormControlLabel
                      value="double"
                      control={<Radio />}
                      label="Dubbelmöte"
                    />
                  </RadioGroup>
                </FormControl>

                <TextField
                  select
                  label="Antal tavlor"
                  value={boardCount}
                  onChange={(event) => setBoardCount(event.target.value)}
                  fullWidth
                >
                  <MenuItem value="1">1 tavla</MenuItem>
                  <MenuItem value="2">2 tavlor</MenuItem>
                  <MenuItem value="3">3 tavlor</MenuItem>
                </TextField>

                <FormControl>
                  <FormLabel>Vid lika placering</FormLabel>
                  <RadioGroup
                    value={tiebreakMethod}
                    onChange={(event) => setTiebreakMethod(event.target.value)}
                  >
                    <FormControlLabel
                      value="castoff"
                      control={<Radio />}
                      label="Castoff"
                    />
                    <FormControlLabel
                      value="leg_difference"
                      control={<Radio />}
                      label="Leg difference"
                    />
                  </RadioGroup>
                </FormControl>
              </Stack>
            </Paper>
          </Box>

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
                  Skapa cupen
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    mt: 0.35,
                    maxWidth: 620,
                  }}
                >
                  Minst två spelare behövs. Nästa steg blir att slumpa och
                  godkänna lagen.
                </Typography>
              </Box>

              <Button
                variant="contained"
                size="large"
                disabled={selectedPlayerIds.length < 2 || saving}
                onClick={handleContinue}
                sx={{
                  width: { xs: "100%", md: "auto" },
                  minWidth: { md: 220 },
                  minHeight: 52,
                  borderRadius: 0.75,
                  boxShadow: "none",
                  fontWeight: 800,
                }}
              >
                {saving ? "Skapar cup..." : "Fortsätt"}
              </Button>
            </Box>
          </Paper>
        </Stack>
      </Box>
    </Container>
  );
}
