import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

export default function Home() {
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
                      width: 74,
                      height: 2,
                      mt: 2.5,
                    }}
                  >
                    <Box sx={{ flex: 1, backgroundColor: "success.dark" }} />
                    <Box sx={{ width: 10 }} />
                    <Box sx={{ flex: 1, backgroundColor: "error.dark" }} />
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
                  </Stack>

                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      mt: 1.5,
                    }}
                  >
                    Börja med spelarna första gången. Därefter är det bara att
                    skapa cupen.
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
                sm: "repeat(3, 1fr)",
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
            ].map((step, index) => (
              <Box
                key={step.number}
                sx={{
                  py: 2.5,
                  px: { xs: 0.5, sm: 2.5 },
                  borderLeft: {
                    xs: "none",
                    sm:
                      index === 0 ? "none" : "1px solid rgba(255,255,255,0.08)",
                  },
                  borderTop: {
                    xs:
                      index === 0 ? "none" : "1px solid rgba(255,255,255,0.08)",
                    sm: "none",
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
