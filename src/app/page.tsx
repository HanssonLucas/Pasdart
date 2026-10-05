"use client";

import { useState } from "react";
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

export default function Home() {
  const router = useRouter();

  const [viewerCode, setViewerCode] = useState("");
  const [viewerError, setViewerError] = useState("");
  const [joiningViewer, setJoiningViewer] = useState(false);

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
          minHeight: "100vh",

          display: "flex",

          alignItems: "center",

          py: { xs: 4, md: 6 },
        }}
      >
        <Stack spacing={3} sx={{ width: "100%" }}>
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
                p: { xs: 3, sm: 4, md: 5 },
              }}
            >
              <Box
                sx={{
                  display: "grid",

                  gridTemplateColumns: {
                    xs: "1fr",

                    md: "minmax(0, 1.35fr) minmax(280px, 0.65fr)",
                  },

                  gap: { xs: 4, md: 6 },

                  alignItems: "center",
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      fontFamily: 'Georgia, "Times New Roman", serif',

                      fontStyle: "italic",

                      fontSize: { xs: "1.25rem", sm: "1.45rem" },

                      color: "rgba(255,255,255,0.82)",

                      lineHeight: 1,
                    }}
                  >
                    Pas d&apos;Art
                  </Typography>

                  <Typography
                    component="h1"
                    sx={{
                      mt: 1.75,

                      fontWeight: 800,

                      letterSpacing: "-0.035em",

                      fontSize: {
                        xs: "2.5rem",

                        sm: "3.4rem",

                        md: "4rem",
                      },

                      lineHeight: 1.05,
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

                      mt: 2.5,
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

                      mt: 2,

                      maxWidth: 560,

                      fontSize: { xs: "1rem", sm: "1.05rem" },

                      lineHeight: 1.6,
                    }}
                  >
                    Då kör vi. Slumpa lagen, håll koll på matcherna och låt Pas
                    d&apos;Art sköta resten.
                  </Typography>
                </Box>

                <Box
                  sx={{
                    pl: { md: 4 },

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

                  <Typography
                    variant="h5"
                    sx={{
                      mt: 0.3,

                      mb: 2,

                      fontWeight: 800,
                    }}
                  >
                    Vad ska vi göra?
                  </Typography>

                  <Stack spacing={1.25}>
                    <Button
                      href="/tournaments/new"
                      variant="contained"
                      size="large"
                      fullWidth
                      sx={{
                        minHeight: 54,

                        borderRadius: 0.75,

                        boxShadow: "none",

                        fontWeight: 800,
                      }}
                    >
                      Skapa ny cup
                    </Button>

                    <Button
                      href="/players"
                      variant="outlined"
                      size="large"
                      fullWidth
                      sx={{
                        minHeight: 50,

                        borderRadius: 0.75,

                        borderColor: "rgba(255,255,255,0.18)",

                        color: "text.primary",
                      }}
                    >
                      Hantera spelare
                    </Button>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "text.secondary",

                        mt: 1.5,
                      }}
                    >
                      Lägg till spelarna en gång, sedan kan du snabbt skapa nya
                      cuper med samma gäng.
                    </Typography>
                  </Stack>

                  <Box
                    sx={{
                      my: 2.5,
                      borderTop: "1px solid rgba(255,255,255,0.10)",
                    }}
                  />

                  <Typography
                    variant="overline"
                    sx={{
                      color: "success.light",
                      fontWeight: 800,
                      letterSpacing: "0.08em",
                    }}
                  >
                    FÖLJ CUPEN
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      mt: 0.35,
                      mb: 1.25,
                    }}
                  >
                    Skriv in följkoden för att öppna en pågående cup.
                  </Typography>

                  <Stack spacing={1.25}>
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
                    />

                    {viewerError && (
                      <PasdartInlineError message={viewerError} />
                    )}

                    <Button
                      variant="outlined"
                      size="large"
                      fullWidth
                      onClick={() => void handleFollowTournament()}
                      disabled={joiningViewer}
                      sx={{
                        minHeight: 50,
                        borderRadius: 0.75,
                        borderColor: "rgba(255,255,255,0.18)",
                        color: "text.primary",
                        fontWeight: 800,
                      }}
                    >
                      {joiningViewer ? "Öppnar cup..." : "Följ cupen"}
                    </Button>
                  </Stack>
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
                  py: 2.5,

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
