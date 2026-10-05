"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

type ActiveTournament = {
  publicId: string;
  name: string;
  status: string;
};

function getTournamentPhase(status: string) {
  if (status === "playoffs") {
    return "Slutspel";
  }

  return "Gruppspel";
}

export default function Home() {
  const router = useRouter();

  const [viewerCode, setViewerCode] = useState("");
  const [viewerError, setViewerError] = useState("");
  const [joiningViewer, setJoiningViewer] = useState(false);
  const [showViewerJoin, setShowViewerJoin] = useState(false);

  const [activeTournament, setActiveTournament] =
    useState<ActiveTournament | null>(null);

  useEffect(() => {
    let cancelled = false;
    let requestInProgress = false;

    async function loadActiveTournament() {
      if (requestInProgress || document.visibilityState === "hidden") {
        return;
      }

      requestInProgress = true;

      try {
        const response = await fetch("/api/tournaments", {
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const result = (await response.json()) as {
          activeTournament?: ActiveTournament | null;
        };

        if (!cancelled) {
          setActiveTournament(result.activeTournament ?? null);
        }
      } catch {
        // Startsidan fungerar fortfarande även om live-status inte kan hämtas.
      } finally {
        requestInProgress = false;
      }
    }

    void loadActiveTournament();

    const intervalId = window.setInterval(() => {
      void loadActiveTournament();
    }, 4000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  function handleFollowActiveTournament() {
    if (!activeTournament) {
      return;
    }

    sessionStorage.setItem(`pasdart_viewer_${activeTournament.publicId}`, "1");

    router.push(`/tournaments/${activeTournament.publicId}/schedule`);
  }

  async function handleFollowTournament() {
    const normalizedCode = viewerCode.trim().toUpperCase();

    if (!normalizedCode) {
      setViewerError("Ange en följkod.");
      return;
    }

    setViewerError("");
    setJoiningViewer(true);

    try {
      const response = await fetch("/api/tournaments/viewer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          viewerCode: normalizedCode,
        }),
      });

      const result = (await response.json()) as {
        publicId?: string;
        error?: string;
      };

      if (!response.ok || !result.publicId) {
        setViewerError(result.error ?? "Kunde inte hitta cupen.");
        return;
      }

      sessionStorage.setItem(`pasdart_viewer_${result.publicId}`, "1");

      router.push(`/tournaments/${result.publicId}/schedule`);
    } catch {
      setViewerError("Kunde inte hitta cupen.");
    } finally {
      setJoiningViewer(false);
    }
  }

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          minHeight: "calc(100vh - 88px)",
          py: { xs: 3, md: 4.5 },
        }}
      >
        <Stack spacing={2.25}>
          {activeTournament && (
            <Paper
              elevation={0}
              sx={{
                px: { xs: 2, sm: 2.5 },
                py: { xs: 1.75, sm: 2 },
                border: "1px solid rgba(198,40,40,0.36)",
                borderLeft: "3px solid",
                borderLeftColor: "error.main",
                borderRadius: 1,
                backgroundColor: "rgba(198,40,40,0.045)",
              }}
            >
              <Stack
                sx={{
                  flexDirection: { xs: "column", sm: "row" },
                  alignItems: { xs: "stretch", sm: "center" },
                  justifyContent: "space-between",
                  gap: 1.5,
                }}
              >
                <Stack
                  sx={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 1.5,
                    minWidth: 0,
                  }}
                >
                  <Box
                    aria-hidden="true"
                    sx={{
                      width: 10,
                      height: 10,
                      flexShrink: 0,
                      borderRadius: "50%",
                      backgroundColor: "error.main",
                      boxShadow: "0 0 0 4px rgba(211,47,47,0.12)",
                    }}
                  />

                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        color: "error.light",
                        fontWeight: 900,
                        letterSpacing: "0.1em",
                      }}
                    >
                      LIVE NU
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.1,
                        fontWeight: 900,
                        fontSize: { xs: "1.1rem", sm: "1.2rem" },
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {activeTournament.name}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        color: "text.secondary",
                        mt: 0.15,
                      }}
                    >
                      {getTournamentPhase(activeTournament.status)} · Följ
                      matcher och tabell live
                    </Typography>
                  </Box>
                </Stack>

                <Button
                  variant="contained"
                  onClick={handleFollowActiveTournament}
                  sx={{
                    minWidth: { sm: 190 },
                    minHeight: 44,
                    borderRadius: 0.75,
                    boxShadow: "none",
                    fontWeight: 800,
                  }}
                >
                  Följ cupen live
                </Button>
              </Stack>
            </Paper>
          )}

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
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              <Box
                sx={{
                  width: 28,
                  height: 3,
                  backgroundColor: "success.dark",
                }}
              />

              <Box
                sx={{
                  width: 28,
                  height: 3,
                  backgroundColor: "error.dark",
                }}
              />

              <Box
                sx={{
                  width: 28,
                  height: 3,
                  backgroundColor: "success.dark",
                }}
              />
            </Box>

            <Box
              sx={{
                p: { xs: 2.5, sm: 3.25, md: 4 },
              }}
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    md: "minmax(0, 1.45fr) minmax(260px, 0.55fr)",
                  },
                  gap: { xs: 3, md: 4.5 },
                  alignItems: "center",
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      fontFamily: 'Georgia, "Times New Roman", serif',
                      fontStyle: "italic",
                      fontSize: { xs: "1.15rem", sm: "1.3rem" },
                      color: "rgba(255,255,255,0.82)",
                      lineHeight: 1,
                    }}
                  >
                    Pas d&apos;Art
                  </Typography>

                  <Typography
                    component="h1"
                    sx={{
                      mt: 1.35,
                      fontWeight: 800,
                      letterSpacing: "-0.035em",
                      fontSize: {
                        xs: "2.35rem",
                        sm: "3rem",
                        md: "3.35rem",
                      },
                      lineHeight: 1.03,
                    }}
                  >
                    Sugen på öl?
                    <br />
                    Sugen på dart?
                    <br />
                    Skiter björnen i skogen?
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      mt: 2,
                    }}
                  >
                    <Box
                      sx={{
                        width: 24,
                        height: 2,
                        backgroundColor: "success.dark",
                      }}
                    />

                    <Box
                      sx={{
                        width: 24,
                        height: 2,
                        backgroundColor: "error.dark",
                      }}
                    />

                    <Box
                      sx={{
                        width: 24,
                        height: 2,
                        backgroundColor: "success.dark",
                      }}
                    />
                  </Box>

                  <Typography
                    sx={{
                      color: "text.secondary",
                      mt: 1.5,
                      maxWidth: 600,
                      fontSize: { xs: "0.95rem", sm: "1rem" },
                      lineHeight: 1.55,
                    }}
                  >
                    Då kör vi. Slumpa lagen, håll koll på matcherna och låt Pas
                    d&apos;Art sköta resten.
                  </Typography>
                </Box>

                <Box
                  sx={{
                    pl: { md: 3.5 },
                    borderLeft: {
                      xs: "none",
                      md: "1px solid rgba(255,255,255,0.11)",
                    },
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
                    STARTA KVÄLLEN
                  </Typography>

                  <Button
                    href="/tournaments/new"
                    variant="contained"
                    size="large"
                    fullWidth
                    sx={{
                      mt: 1,
                      minHeight: 52,
                      borderRadius: 0.75,
                      boxShadow: "none",
                      fontWeight: 800,
                    }}
                  >
                    Skapa ny cup
                  </Button>

                  <Button
                    type="button"
                    variant="text"
                    size="small"
                    onClick={() => {
                      setShowViewerJoin((current) => !current);
                      setViewerError("");
                    }}
                    sx={{
                      mt: 1.25,
                      px: 0,
                      minWidth: 0,
                      color: "text.secondary",
                      justifyContent: "flex-start",
                      fontWeight: 700,
                      "&:hover": {
                        backgroundColor: "transparent",
                        color: "text.primary",
                      },
                    }}
                  >
                    Har du en följkod? {showViewerJoin ? "Stäng" : "Ange kod →"}
                  </Button>

                  {showViewerJoin && (
                    <Stack
                      spacing={1}
                      sx={{
                        mt: 1.25,
                      }}
                    >
                      <Stack
                        sx={{
                          flexDirection: {
                            xs: "column",
                            sm: "row",
                            md: "column",
                          },
                          gap: 1,
                        }}
                      >
                        <TextField
                          value={viewerCode}
                          onChange={(event) => {
                            setViewerCode(event.target.value.toUpperCase());

                            if (viewerError) {
                              setViewerError("");
                            }
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              void handleFollowTournament();
                            }
                          }}
                          placeholder="T.ex. 483217"
                          slotProps={{
                            htmlInput: {
                              maxLength: 6,
                              inputMode: "numeric",
                              pattern: "[0-9]*",
                              "aria-label": "Följkod",
                            },
                          }}
                          fullWidth
                          size="small"
                        />

                        <Button
                          variant="outlined"
                          onClick={() => void handleFollowTournament()}
                          disabled={joiningViewer}
                          sx={{
                            minHeight: 42,
                            minWidth: { sm: 120, md: 0 },
                            borderRadius: 0.75,
                            borderColor: "rgba(255,255,255,0.18)",
                            color: "text.primary",
                            fontWeight: 800,
                          }}
                        >
                          {joiningViewer ? "Öppnar..." : "Följ"}
                        </Button>
                      </Stack>

                      {viewerError && (
                        <PasdartInlineError message={viewerError} />
                      )}
                    </Stack>
                  )}

                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      color: "text.secondary",
                      mt: 1.6,
                      lineHeight: 1.5,
                    }}
                  >
                    Spelare och övriga inställningar hittar du i menyn ovan.
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                lg: "repeat(4, 1fr)",
              },
              borderTop: "1px solid rgba(255,255,255,0.12)",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {[
              {
                number: "01",
                title: "Skapa lagen",
                description: "Välj spelare och slumpa lagen.",
              },
              {
                number: "02",
                title: "Spela matcherna",
                description: "Registrera resultat och följ tabellen live.",
              },
              {
                number: "03",
                title: "Avgör cupen",
                description:
                  "Castoff vid behov och sedan raka vägen till final.",
              },
              {
                number: "04",
                title: "Följ cupen",
                description:
                  "Ange följkoden och följ matcher, tabell och slutspel live.",
              },
            ].map((step, index) => (
              <Box
                key={step.number}
                sx={{
                  py: 2.25,
                  px: { xs: 0.5, sm: 2.5 },

                  borderLeft: {
                    xs: "none",

                    sm:
                      index % 2 === 0
                        ? "none"
                        : "1px solid rgba(255,255,255,0.08)",

                    lg:
                      index === 0 ? "none" : "1px solid rgba(255,255,255,0.08)",
                  },

                  borderTop: {
                    xs:
                      index === 0 ? "none" : "1px solid rgba(255,255,255,0.08)",

                    sm: index < 2 ? "none" : "1px solid rgba(255,255,255,0.08)",

                    lg: "none",
                  },
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: "error.light",
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                  }}
                >
                  {step.number}
                </Typography>

                <Typography
                  sx={{
                    mt: 0.35,
                    fontWeight: 800,
                    fontSize: "1.05rem",
                  }}
                >
                  {step.title}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    mt: 0.35,
                    lineHeight: 1.5,
                  }}
                >
                  {step.description}
                </Typography>
              </Box>
            ))}
          </Box>

          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              textAlign: "center",
              letterSpacing: "0.06em",
            }}
          >
            PAS D&apos;ART
          </Typography>
        </Stack>
      </Box>
    </Container>
  );
}
