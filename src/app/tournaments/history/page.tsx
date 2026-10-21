"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import {
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Stack,
  SvgIcon,
  Typography,
} from "@mui/material";

type FinishedTournament = {
  publicId: string;

  name: string;

  finishedAt: string | null;

  winnerTeamNumber: number | null;

  winnerTeamName: string | null;

  teamMode: string;

  participantCount: number;
};

type HistoryFilter = "all" | "singles" | "doubles";

function TargetIcon() {
  return (
    <SvgIcon viewBox="0 0 24 24" sx={{ fontSize: 45 }}>
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="9" />

        <circle cx="12" cy="12" r="5.5" />

        <circle cx="12" cy="12" r="2" />

        <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
      </g>
    </SvgIcon>
  );
}

function ArchiveIcon() {
  return (
    <SvgIcon viewBox="0 0 24 24" sx={{ fontSize: 28 }}>
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="4" width="18" height="4" rx="1" />

        <path d="M5 8v12h14V8M10 12h4" />
      </g>
    </SvgIcon>
  );
}

function TrophyIcon({ size = 20 }: { size?: number }) {
  return (
    <SvgIcon viewBox="0 0 24 24" sx={{ fontSize: size }}>
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M7 4h10v6a5 5 0 0 1-10 0V4Z" />

        <path d="M7 6H4v2a4 4 0 0 0 4 4M17 6h3v2a4 4 0 0 1-4 4" />

        <path d="M12 15v4M8 21h8M10 19h4" />
      </g>
    </SvgIcon>
  );
}

function ArrowIcon() {
  return (
    <SvgIcon viewBox="0 0 24 24" sx={{ fontSize: 19 }}>
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 18 18 6M8 6h10v10" />
      </g>
    </SvgIcon>
  );
}

function getWinnerName(tournament: FinishedTournament) {
  if (tournament.winnerTeamName) return tournament.winnerTeamName;

  if (tournament.winnerTeamNumber !== null) {
    return `Lag ${tournament.winnerTeamNumber}`;
  }

  return null;
}

function getTeamModeLabel(teamMode: string) {
  if (teamMode === "singles") return "Singel";

  if (teamMode === "doubles") return "Dubbel";

  return "Okänt format";
}

function getTournamentDate(finishedAt: string | null) {
  if (!finishedAt) return null;

  const date = new Date(finishedAt);

  return Number.isNaN(date.getTime()) ? null : date;
}

const dateFormatter = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Europe/Stockholm",

  day: "numeric",
});

const monthFormatter = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Europe/Stockholm",

  month: "short",
});

const fullDateFormatter = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Europe/Stockholm",

  day: "numeric",

  month: "long",

  year: "numeric",
});

const shortDateFormatter = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Europe/Stockholm",

  day: "numeric",

  month: "short",

  year: "numeric",
});

const yearFormatter = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Europe/Stockholm",

  year: "numeric",
});

const cardBaseSx = {
  border: "1px solid rgba(255,255,255,0.12)",

  borderRadius: 1,

  backgroundColor: "rgba(255,255,255,0.018)",
};

export default function TournamentHistoryPage() {
  const router = useRouter();

  const [tournaments, setTournaments] = useState<FinishedTournament[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [filter, setFilter] = useState<HistoryFilter>("all");

  useEffect(() => {
    let cancelled = false;

    async function loadHistory() {
      try {
        const response = await fetch("/api/tournaments/history", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Kunde inte hämta tidigare cuper.");
        }

        const result = (await response.json()) as {
          tournaments: FinishedTournament[];
        };

        if (!cancelled) {
          setTournaments(result.tournaments);
        }
      } catch {
        if (!cancelled) {
          setError("Kunde inte hämta tidigare cuper.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadHistory();

    return () => {
      cancelled = true;
    };
  }, []);

  function handleOpenTournament(publicId: string) {
    const adminToken = localStorage.getItem(`pasdart_admin_${publicId}`);

    if (!adminToken) {
      sessionStorage.setItem(`pasdart_viewer_${publicId}`, "1");
    }

    router.push(`/tournaments/${publicId}/schedule`);
  }

  const latestTournament = tournaments[0] ?? null;

  const oldestTournament = tournaments.reduce<FinishedTournament | null>(
    (oldest, tournament) => {
      const date = getTournamentDate(tournament.finishedAt);

      if (!date) return oldest;

      if (!oldest) return tournament;

      const oldestDate = getTournamentDate(oldest.finishedAt);

      return !oldestDate || date < oldestDate ? tournament : oldest;
    },

    null,
  );

  const latestDate = latestTournament
    ? getTournamentDate(latestTournament.finishedAt)
    : null;

  const oldestDate = oldestTournament
    ? getTournamentDate(oldestTournament.finishedAt)
    : null;

  const filteredTournaments = tournaments.filter(
    (tournament) => filter === "all" || tournament.teamMode === filter,
  );

  const groupedTournaments = filteredTournaments.reduce<
    Record<string, FinishedTournament[]>
  >((groups, tournament) => {
    const date = getTournamentDate(tournament.finishedAt);

    const year = date ? yearFormatter.format(date) : "Okänt år";

    if (!groups[year]) {
      groups[year] = [];
    }

    groups[year].push(tournament);

    return groups;
  }, {});

  const filters: { value: HistoryFilter; label: string }[] = [
    { value: "all", label: "Alla cuper" },

    { value: "singles", label: "Singel" },

    { value: "doubles", label: "Dubbel" },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4.5 } }}>
      <Stack spacing={3}>
        {/* HERO */}

        <Paper elevation={0} sx={{ ...cardBaseSx, overflow: "hidden" }}>
          <Box
            sx={{
              height: 3,

              display: "flex",

              justifyContent: "center",

              gap: 0.5,
            }}
          >
            {["success.dark", "error.dark", "success.dark"].map(
              (color, index) => (
                <Box
                  key={index}
                  sx={{
                    width: 28,

                    height: 3,

                    backgroundColor: color,
                  }}
                />
              ),
            )}
          </Box>

          <Box
            sx={{
              p: { xs: 2.75, sm: 3.5, md: 4.5 },

              display: "flex",

              alignItems: "center",

              justifyContent: "space-between",

              gap: 3,
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontFamily: 'Georgia, "Times New Roman", serif',

                  fontStyle: "italic",

                  fontSize: { xs: "1.1rem", md: "1.35rem" },

                  color: "rgba(255,255,255,0.82)",
                }}
              >
                Pas d&apos;Art
              </Typography>

              <Typography
                component="h1"
                sx={{
                  mt: 0.75,

                  fontSize: { xs: "2rem", sm: "2.65rem", md: "3.2rem" },

                  fontWeight: 900,

                  letterSpacing: "-0.04em",

                  lineHeight: 1.05,
                }}
              >
                Tidigare cuper
              </Typography>

              <Typography
                sx={{
                  mt: 1.5,

                  color: "text.secondary",

                  fontSize: { xs: "0.9rem", sm: "1rem" },

                  maxWidth: 540,

                  lineHeight: 1.55,
                }}
              >
                Alla kvällar, matcher och vinnare samlade på ett ställe. Kolla
                tillbaka på gamla resultat och se hur det gick.
              </Typography>
            </Box>

            <Box
              sx={{
                display: { xs: "none", sm: "flex" },

                flexDirection: "column",

                alignItems: "center",

                justifyContent: "center",

                gap: 1.25,

                minWidth: { sm: 110, md: 150 },

                minHeight: 110,

                pl: { sm: 3, md: 4 },

                borderLeft: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <Typography
                sx={{
                  color: "error.light",

                  fontSize: "0.7rem",

                  fontWeight: 900,

                  letterSpacing: "0.11em",
                }}
              >
                CUPARKIV
              </Typography>

              <Box sx={{ color: "error.light", opacity: 0.85 }}>
                <TargetIcon />
              </Box>
            </Box>
          </Box>
        </Paper>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : tournaments.length === 0 ? (
          <Paper elevation={0} sx={{ ...cardBaseSx, p: 4 }}>
            <Typography sx={{ fontWeight: 800 }}>
              Inga tidigare cuper ännu
            </Typography>

            <Typography sx={{ mt: 1, color: "text.secondary" }}>
              När den första cupen är avslutad kommer den att visas här.
            </Typography>
          </Paper>
        ) : (
          <>
            {/* SAMMANFATTNING */}

            <Box
              sx={{
                display: "grid",

                gridTemplateColumns: {
                  xs: "1fr",

                  sm: "minmax(0, 0.7fr) minmax(0, 1.3fr)",
                },

                gap: 1.5,
              }}
            >
              {/* ARKIVSTATISTIK */}

              <Paper
                elevation={0}
                sx={{
                  ...cardBaseSx,

                  p: { xs: 2, sm: 2.5 },

                  borderTop: "2px solid rgba(198,40,40,0.6)",

                  backgroundColor: "rgba(198,40,40,0.028)",

                  display: "flex",

                  flexDirection: "column",

                  justifyContent: "space-between",

                  gap: 2,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                  <Box sx={{ color: "error.light", display: "flex" }}>
                    <ArchiveIcon />
                  </Box>

                  <Typography
                    sx={{
                      color: "error.light",

                      fontSize: { xs: "0.82rem", sm: "0.9rem" },

                      fontWeight: 900,

                      letterSpacing: "0.09em",
                    }}
                  >
                    CUPARKIVET
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    sx={{
                      fontSize: "2.6rem",

                      fontWeight: 900,

                      letterSpacing: "-0.04em",

                      lineHeight: 1,
                    }}
                  >
                    {tournaments.length}
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.5,

                      color: "text.secondary",

                      fontSize: "0.85rem",
                    }}
                  >
                    avgjorda cuper
                  </Typography>
                </Box>

                <Typography
                  sx={{
                    borderTop: "1px solid rgba(255,255,255,0.09)",

                    pt: 1.5,

                    fontSize: "0.8rem",

                    color: "text.secondary",
                  }}
                >
                  Sedan{" "}
                  <Box component="span" sx={{ color: "text.primary" }}>
                    {oldestDate
                      ? fullDateFormatter.format(oldestDate)
                      : "okänt datum"}
                  </Box>
                </Typography>
              </Paper>

              {/* SENASTE VINNAREN */}

              {latestTournament && (
                <Paper
                  elevation={0}
                  sx={{
                    ...cardBaseSx,

                    width: "100%",

                    p: { xs: 2, sm: 2.5 },

                    borderTop: "2px solid rgba(76,175,80,0.6)",

                    backgroundColor: "rgba(46,125,50,0.03)",

                    display: "flex",

                    flexDirection: "column",

                    justifyContent: "space-between",

                    gap: 2,

                    textAlign: "left",

                    color: "text.primary",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box sx={{ color: "success.light", display: "flex" }}>
                      <TrophyIcon size={30} />
                    </Box>

                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        sx={{
                          color: "success.light",

                          fontSize: { xs: "0.82rem", sm: "0.9rem" },

                          fontWeight: 900,

                          letterSpacing: "0.09em",
                        }}
                      >
                        SENASTE VINNAREN
                      </Typography>

                      <Typography
                        sx={{
                          color: "text.secondary",

                          fontSize: { xs: "0.9rem", sm: "1rem" },
                        }}
                      >
                        {latestTournament.name}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography
                    sx={{
                      fontSize: { xs: "1.4rem", sm: "1.7rem" },

                      fontWeight: 900,

                      color: "success.light",

                      letterSpacing: "-0.025em",

                      overflowWrap: "anywhere",
                    }}
                  >
                    {getWinnerName(latestTournament) ?? "Okänd vinnare"}
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",

                      alignItems: "center",

                      justifyContent: "space-between",

                      gap: 2,

                      borderTop: "1px solid rgba(255,255,255,0.09)",

                      pt: 1.5,
                    }}
                  >
                    <Typography
                      sx={{ color: "text.secondary", fontSize: "0.8rem" }}
                    >
                      {latestDate
                        ? shortDateFormatter.format(latestDate)
                        : "Okänt datum"}

                      {" · "}

                      {getTeamModeLabel(latestTournament.teamMode)}
                    </Typography>

                    <Button
                      variant="text"
                      size="small"
                      onClick={() =>
                        handleOpenTournament(latestTournament.publicId)
                      }
                      sx={{
                        minHeight: 40,
                        px: 1.5,
                        flexShrink: 0,
                        color: "text.primary",
                        textTransform: "none",
                        fontWeight: 800,
                        "&:hover": {
                          backgroundColor: "rgba(255,255,255,0.07)",
                        },
                      }}
                    >
                      Visa cupen
                    </Button>
                  </Box>
                </Paper>
              )}
            </Box>

            {/* ARKIVSEKTION */}

            <Stack spacing={2}>
              <Box
                sx={{
                  display: "flex",

                  alignItems: { xs: "flex-start", sm: "flex-end" },

                  justifyContent: "space-between",

                  gap: 2,

                  flexWrap: "wrap",
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      color: "error.light",

                      fontWeight: 900,

                      fontSize: "0.7rem",

                      letterSpacing: "0.1em",
                    }}
                  >
                    CUPARKIV
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.25,

                      fontSize: "1.5rem",

                      fontWeight: 900,

                      letterSpacing: "-0.03em",
                    }}
                  >
                    Tidigare turneringar
                  </Typography>
                </Box>

                <Typography
                  sx={{ color: "text.secondary", fontSize: "0.85rem" }}
                >
                  {filteredTournaments.length} av {tournaments.length} cuper
                </Typography>
              </Box>

              {/* FILTER */}

              <Box
                role="group"
                aria-label="Filtrera cuper efter spelformat"
                sx={{
                  display: "flex",

                  flexWrap: "wrap",

                  gap: 1,
                }}
              >
                {filters.map((option) => {
                  const selected = filter === option.value;

                  return (
                    <Button
                      key={option.value}
                      onClick={() => setFilter(option.value)}
                      variant="outlined"
                      aria-pressed={selected}
                      sx={{
                        px: 2,

                        minHeight: 36,

                        borderRadius: 0.75,

                        textTransform: "none",

                        fontWeight: selected ? 800 : 600,

                        fontSize: "0.82rem",

                        color: selected ? "error.light" : "text.secondary",

                        borderColor: selected
                          ? "rgba(198,40,40,0.55)"
                          : "rgba(255,255,255,0.14)",

                        backgroundColor: selected
                          ? "rgba(198,40,40,0.1)"
                          : "transparent",

                        "&:hover": {
                          borderColor: "error.main",

                          backgroundColor: "rgba(198,40,40,0.07)",
                        },
                      }}
                    >
                      {option.label}
                    </Button>
                  );
                })}
              </Box>

              {/* FILTRERAD CUPLISTA */}

              {filteredTournaments.length === 0 ? (
                <Paper elevation={0} sx={{ ...cardBaseSx, p: 3 }}>
                  <Typography sx={{ fontWeight: 800 }}>
                    Inga cuper med detta spelformat
                  </Typography>

                  <Typography sx={{ color: "text.secondary", mt: 0.75 }}>
                    Testa att välja ett annat filter.
                  </Typography>
                </Paper>
              ) : (
                <Stack spacing={3}>
                  {Object.entries(groupedTournaments)

                    .sort(([yearA], [yearB]) => {
                      if (yearA === "Okänt år") return 1;

                      if (yearB === "Okänt år") return -1;

                      return Number(yearB) - Number(yearA);
                    })

                    .map(([year, yearTournaments]) => (
                      <Box key={year}>
                        {/* ÅRSRUBRIK */}

                        <Box
                          sx={{
                            display: "flex",

                            alignItems: "center",

                            justifyContent: "space-between",

                            mb: 1.5,

                            pb: 1.25,

                            borderBottom: "1px solid rgba(255,255,255,0.12)",
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: "1.3rem",

                              fontWeight: 900,

                              letterSpacing: "-0.02em",
                            }}
                          >
                            {year}
                          </Typography>

                          <Typography
                            sx={{
                              color: "text.secondary",

                              fontSize: "0.85rem",
                            }}
                          >
                            {yearTournaments.length}{" "}
                            {yearTournaments.length === 1 ? "cup" : "cuper"}
                          </Typography>
                        </Box>

                        {/* CUPRADER */}

                        <Stack spacing={1}>
                          {yearTournaments.map((tournament) => {
                            const date = getTournamentDate(
                              tournament.finishedAt,
                            );

                            const winnerName = getWinnerName(tournament);

                            const isLatest =
                              tournament.publicId ===
                              latestTournament?.publicId;

                            return (
                              <Paper
                                key={tournament.publicId}
                                component="button"
                                type="button"
                                onClick={() =>
                                  handleOpenTournament(tournament.publicId)
                                }
                                elevation={0}
                                sx={{
                                  ...cardBaseSx,

                                  width: "100%",

                                  p: 0,

                                  overflow: "hidden",

                                  textAlign: "left",

                                  font: "inherit",

                                  color: "text.primary",

                                  cursor: "pointer",

                                  transition:
                                    "border-color 0.2s, background-color 0.2s",

                                  "&:hover": {
                                    borderColor: "rgba(198,40,40,0.38)",

                                    backgroundColor: "rgba(198,40,40,0.025)",
                                  },

                                  "&:focus-visible": {
                                    outline: "2px solid",

                                    outlineColor: "error.main",

                                    outlineOffset: 3,
                                  },
                                }}
                              >
                                <Box
                                  sx={{
                                    display: "flex",

                                    alignItems: "stretch",
                                  }}
                                >
                                  {/* RÖD VÄNSTERACCENT */}

                                  <Box
                                    sx={{
                                      width: 3,

                                      flexShrink: 0,

                                      backgroundColor: isLatest
                                        ? "error.main"
                                        : "transparent",

                                      "button:hover &": {
                                        backgroundColor: "error.main",
                                      },
                                    }}
                                  />

                                  <Box
                                    sx={{
                                      display: "flex",

                                      alignItems: "center",

                                      gap: { xs: 1.5, sm: 2.5 },

                                      width: "100%",

                                      minWidth: 0,

                                      p: { xs: 1.75, sm: 2.25 },
                                    }}
                                  >
                                    {/* DATUM */}

                                    <Box
                                      sx={{
                                        width: { xs: 48, sm: 58 },

                                        flexShrink: 0,

                                        textAlign: "center",

                                        borderRight:
                                          "1px solid rgba(255,255,255,0.1)",

                                        pr: { xs: 1.5, sm: 2 },
                                      }}
                                    >
                                      <Typography
                                        sx={{
                                          fontSize: {
                                            xs: "1.45rem",

                                            sm: "1.7rem",
                                          },

                                          fontWeight: 900,

                                          lineHeight: 1,
                                        }}
                                      >
                                        {date
                                          ? dateFormatter.format(date)
                                          : "–"}
                                      </Typography>

                                      <Typography
                                        sx={{
                                          mt: 0.5,

                                          fontSize: "0.7rem",

                                          fontWeight: 800,

                                          color: "text.secondary",

                                          textTransform: "uppercase",
                                        }}
                                      >
                                        {date
                                          ? monthFormatter.format(date)
                                          : "–"}
                                      </Typography>
                                    </Box>

                                    {/* CUPNAMN + INFORMATION */}

                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                      <Box
                                        sx={{
                                          display: "flex",

                                          alignItems: "center",

                                          gap: 1,

                                          flexWrap: "wrap",
                                        }}
                                      >
                                        <Typography
                                          sx={{
                                            fontSize: {
                                              xs: "0.95rem",

                                              sm: "1.05rem",
                                            },

                                            fontWeight: 800,

                                            overflowWrap: "anywhere",
                                          }}
                                        >
                                          {tournament.name}
                                        </Typography>

                                        {isLatest && (
                                          <Typography
                                            component="span"
                                            sx={{
                                              color: "error.light",

                                              fontSize: "0.6rem",

                                              fontWeight: 900,

                                              letterSpacing: "0.07em",
                                            }}
                                          >
                                            SENASTE
                                          </Typography>
                                        )}
                                      </Box>

                                      <Typography
                                        sx={{
                                          mt: 0.5,

                                          fontSize: "0.82rem",

                                          color: "text.secondary",
                                        }}
                                      >
                                        {getTeamModeLabel(tournament.teamMode)}
                                        {" · "}
                                        {tournament.participantCount} spelare
                                      </Typography>

                                      {/* VINNARE PÅ MOBIL */}

                                      <Box
                                        sx={{
                                          display: { xs: "flex", md: "none" },

                                          alignItems: "center",

                                          gap: 0.75,

                                          mt: 0.75,

                                          color: winnerName
                                            ? "success.light"
                                            : "text.secondary",
                                        }}
                                      >
                                        <TrophyIcon size={16} />

                                        <Typography
                                          sx={{ fontSize: "0.82rem" }}
                                        >
                                          {winnerName
                                            ? `${winnerName} vann`
                                            : "Vinnare saknas"}
                                        </Typography>
                                      </Box>
                                    </Box>

                                    {/* VINNARKOLUMN DESKTOP */}

                                    <Box
                                      sx={{
                                        display: { xs: "none", md: "flex" },

                                        flexDirection: "column",

                                        alignItems: "flex-start",

                                        justifyContent: "center",

                                        width: 190,

                                        flexShrink: 0,

                                        gap: 0.5,
                                      }}
                                    >
                                      <Typography
                                        sx={{
                                          color: "text.secondary",

                                          fontSize: "0.65rem",

                                          fontWeight: 900,

                                          letterSpacing: "0.09em",
                                        }}
                                      >
                                        VINNARE
                                      </Typography>

                                      <Box
                                        sx={{
                                          display: "flex",

                                          alignItems: "center",

                                          gap: 0.75,

                                          minWidth: 0,

                                          color: winnerName
                                            ? "success.light"
                                            : "text.secondary",
                                        }}
                                      >
                                        <TrophyIcon size={17} />

                                        <Typography
                                          sx={{
                                            fontSize: "0.95rem",

                                            fontWeight: 800,

                                            overflowWrap: "anywhere",
                                          }}
                                        >
                                          {winnerName ?? "Okänd vinnare"}
                                        </Typography>
                                      </Box>
                                    </Box>

                                    {/* PIL */}

                                    <Box
                                      sx={{
                                        display: "flex",

                                        alignItems: "center",

                                        justifyContent: "center",

                                        color: "text.secondary",

                                        flexShrink: 0,

                                        transition:
                                          "color 0.2s, transform 0.2s",

                                        "button:hover &": {
                                          color: "error.light",

                                          transform: "translate(2px, -2px)",
                                        },
                                      }}
                                      aria-hidden="true"
                                    >
                                      <ArrowIcon />
                                    </Box>
                                  </Box>
                                </Box>
                              </Paper>
                            );
                          })}
                        </Stack>
                      </Box>
                    ))}
                </Stack>
              )}
            </Stack>
          </>
        )}
      </Stack>
    </Container>
  );
}
