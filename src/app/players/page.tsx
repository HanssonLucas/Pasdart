"use client";

import { useEffect, useState } from "react";

import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import PasdartInlineError from "@/components/PasdartInlineError";
import PasdartLoadingState from "@/components/PasdartLoadingState";

type Player = {
  id: number;

  name: string;

  createdAt: string;
};

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);

  const [name, setName] = useState("");

  const [loadError, setLoadError] = useState("");
  const [formError, setFormError] = useState("");

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

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
          setLoadError("Kunde inte hämta spelarna. Försök att ladda om sidan.");
        }
      })

      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setFormError("Skriv in ett namn innan du fortsätter.");

      return;
    }

    setSaving(true);

    setFormError("");

    try {
      const response = await fetch("/api/players", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name: trimmedName,
        }),
      });

      if (!response.ok) {
        throw new Error();
      }

      const newPlayer = await response.json();

      setPlayers((currentPlayers) => [...currentPlayers, newPlayer]);

      setName("");
    } catch {
      setFormError("Kunde inte lägga till spelaren. Försök igen om en stund.");
    } finally {
      setSaving(false);
    }
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
                  Spelare
                </Typography>

                <Typography sx={{ color: "text.secondary", mt: 0.75 }}>
                  Lägg till personer som kan användas i kommande cuper.
                </Typography>
              </Box>

              <Box
                sx={{
                  minWidth: { sm: 150 },

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
                  SPELARREGISTER
                </Typography>

                <Typography sx={{ mt: 0.25, fontWeight: 800 }}>
                  {players.length} spelare
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", mt: 0.2 }}
                >
                  Redo för nästa cup
                </Typography>
              </Box>
            </Box>
          </Paper>

          <Box
            sx={{
              display: "grid",

              gridTemplateColumns: {
                xs: "1fr",

                md: "minmax(280px, 0.8fr) minmax(0, 1.2fr)",
              },

              gap: 2,

              alignItems: "start",
            }}
          >
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
                <Typography
                  variant="overline"
                  sx={{
                    color: "error.light",

                    fontWeight: 800,

                    letterSpacing: "0.08em",
                  }}
                >
                  NY SPELARE
                </Typography>

                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  Lägg till spelare
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", mt: 0.35 }}
                >
                  Lägg till spelaren en gång så finns den kvar till framtida
                  cuper.
                </Typography>
              </Box>

              <Stack
                component="form"
                spacing={1.5}
                onSubmit={handleSubmit}
                sx={{ p: { xs: 2, sm: 2.5 } }}
              >
                <TextField
                  label="Spelarens namn"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    if (formError) {
                      setFormError("");
                    }
                  }}
                  fullWidth
                />

                {formError && <PasdartInlineError message={formError} />}

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={saving}
                  sx={{
                    minHeight: 50,

                    borderRadius: 0.75,

                    boxShadow: "none",

                    fontWeight: 800,
                  }}
                >
                  {saving ? "Lägger till..." : "Lägg till spelare"}
                </Button>
              </Stack>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                border: "1px solid rgba(255,255,255,0.12)",

                borderRadius: 1,

                backgroundColor: "rgba(255,255,255,0.014)",

                overflow: "hidden",
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

                    gap: 1,
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
                      SPARAT
                    </Typography>

                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                      Spelarregister
                    </Typography>
                  </Box>

                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary" }}
                  >
                    {players.length} totalt
                  </Typography>
                </Stack>
              </Box>

              <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
                {loading ? (
                  <PasdartLoadingState
                    variant="inline"
                    title="Hämtar spelare"
                    description="Förbereder spelarregistret."
                  />
                ) : loadError ? (
                  <PasdartInlineError message={loadError} />
                ) : players.length === 0 ? (
                  <Typography sx={{ color: "text.secondary" }}>
                    Inga spelare sparade ännu.
                  </Typography>
                ) : (
                  <Box
                    sx={{
                      display: "grid",

                      gridTemplateColumns: {
                        xs: "1fr",

                        sm: "repeat(2, minmax(0, 1fr))",
                      },

                      gap: 1,
                    }}
                  >
                    {players.map((player, index) => (
                      <Box
                        key={player.id}
                        sx={{
                          minHeight: 58,

                          display: "grid",

                          gridTemplateColumns: "36px minmax(0, 1fr)",

                          alignItems: "center",

                          border: "1px solid rgba(255,255,255,0.09)",

                          borderRadius: 0.75,

                          backgroundColor: "rgba(255,255,255,0.01)",

                          overflow: "hidden",
                        }}
                      >
                        <Box
                          sx={{
                            alignSelf: "stretch",

                            display: "flex",

                            alignItems: "center",

                            justifyContent: "center",

                            borderRight: "1px solid rgba(255,255,255,0.07)",

                            backgroundColor: "rgba(198,40,40,0.045)",
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              color: "error.light",

                              fontWeight: 800,
                            }}
                          >
                            {index + 1}
                          </Typography>
                        </Box>

                        <Typography
                          sx={{
                            px: 1.5,

                            fontWeight: 700,
                          }}
                        >
                          {player.name}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Paper>
          </Box>
        </Stack>
      </Box>
    </Container>
  );
}
