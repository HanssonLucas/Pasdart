"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import PasdartErrorState from "@/components/PasdartErrorState";
import PasdartInlineError from "@/components/PasdartInlineError";
import PasdartLoadingState from "@/components/PasdartLoadingState";
import MatchResultControls from "@/components/tournaments/MatchResultControls";
import TournamentCreatedDialog from "@/components/tournaments/TournamentCreatedDialog";
import TournamentShareCode from "@/components/tournaments/TournamentShareCode";

type Player = {
  id: number;

  name: string;
};

type Team = {
  id: number;

  teamNumber: number;

  seed: number | null;

  players: Player[];
};

type Match = {
  id: number;

  roundNumber: number | null;

  boardNumber: number | null;

  matchNumber: number | null;

  teamAId: number;

  teamBId: number;

  teamALegs: number;

  teamBLegs: number;

  status: string;

  winnerTeamId: number | null;

  stage: string;
};

type Standing = {
  teamId: number;
  teamNumber: number;
  players: Player[];
  played: number;
  wins: number;
  draws: number;
  losses: number;
  legsWon: number;
  legsLost: number;
  legDifference: number;
};

type CastoffGroup = {
  wins: number;

  teams: Standing[];
};

type TournamentResponse = {
  tournament: {
    id: number;

    name: string;

    status: string;

    gameType: number;

    groupMatchMode: string;

    groupLegCount: number;

    groupBestOf: number;

    playoffBestOf: number;

    groupMaxDarts: number | null;

    playoffMaxDarts: number | null;

    tiebreakMethod: string;

    playoffQualifiers: number;
  };

  teams: Team[];

  matches: Match[];

  standings: Standing[];

  groupStageComplete: boolean;

  requiresCastoff: boolean;

  castoffGroups: CastoffGroup[];

  isAdmin: boolean;
};

function getTournamentAdminToken(publicId: string) {
  const isViewerMode =
    sessionStorage.getItem(`pasdart_viewer_${publicId}`) === "1";

  if (isViewerMode) {
    return null;
  }

  return localStorage.getItem(`pasdart_admin_${publicId}`);
}

async function fetchTournamentSchedule(publicId: string) {
  const adminToken = getTournamentAdminToken(publicId);

  return fetch(`/api/tournaments/${publicId}/matches`, {
    headers: adminToken
      ? {
          "x-admin-token": adminToken,
        }
      : undefined,
  });
}

export default function SchedulePage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const router = useRouter();

  const [data, setData] = useState<TournamentResponse | null>(null);

  const [error, setError] = useState("");

  const [actionError, setActionError] = useState<{
    matchId: number;
    message: string;
  } | null>(null);

  const [castoffError, setCastoffError] = useState("");

  const [playoffError, setPlayoffError] = useState("");

  const [loading, setLoading] = useState(true);

  const [castoffOrders, setCastoffOrders] = useState<Record<number, number[]>>(
    {},
  );

  const [savingCastoff, setSavingCastoff] = useState(false);

  const [startingPlayoffs, setStartingPlayoffs] = useState(false);

  const [creatingFinal, setCreatingFinal] = useState(false);

  const [showGroupHistory, setShowGroupHistory] = useState(false);

  const [winnerDialogOpen, setWinnerDialogOpen] = useState(false);

  const winnerDialogShownRef = useRef(false);

  const [viewerCodeDialog, setViewerCodeDialog] = useState("");

  const [viewerCode, setViewerCode] = useState("");

  function applyTournamentData(result: TournamentResponse) {
    setData(result);

    const newCastoffOrders: Record<number, number[]> = {};

    result.castoffGroups.forEach((group) => {
      newCastoffOrders[group.wins] = group.teams.map((team) => team.teamId);
    });

    setCastoffOrders(newCastoffOrders);

    const finishedFinal = result.matches.find(
      (match) =>
        match.stage === "final" &&
        match.status === "finished" &&
        match.winnerTeamId !== null,
    );

    if (
      result.tournament.status === "finished" &&
      finishedFinal?.winnerTeamId &&
      !winnerDialogShownRef.current
    ) {
      winnerDialogShownRef.current = true;
      setWinnerDialogOpen(true);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function loadSchedule() {
      try {
        const { publicId } = await params;

        const response = await fetchTournamentSchedule(publicId);

        if (!response.ok) {
          throw new Error();
        }

        const result: TournamentResponse = await response.json();

        if (!cancelled) {
          applyTournamentData(result);

          const shouldShowViewerCode =
            localStorage.getItem(`pasdart_show_viewer_code_${publicId}`) ===
            "1";

          if (result.isAdmin) {
            const storedViewerCode = localStorage.getItem(
              `pasdart_viewer_code_${publicId}`,
            );

            if (storedViewerCode) {
              setViewerCode(storedViewerCode);

              if (shouldShowViewerCode) {
                setViewerCodeDialog(storedViewerCode);
              }
            }

            if (shouldShowViewerCode) {
              localStorage.removeItem(`pasdart_show_viewer_code_${publicId}`);
            }
          }
        }
      } catch {
        if (!cancelled) {
          setError("Kunde inte hämta spelschemat.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadSchedule();

    return () => {
      cancelled = true;
    };
  }, [params]);

  const isViewer = data?.isAdmin === false;

  useEffect(() => {
    if (!isViewer) {
      return;
    }

    let cancelled = false;
    let requestInProgress = false;

    async function refreshViewerSchedule() {
      if (requestInProgress || document.visibilityState === "hidden") {
        return;
      }

      requestInProgress = true;

      try {
        const { publicId } = await params;
        const response = await fetchTournamentSchedule(publicId);

        if (!response.ok) {
          return;
        }

        const result: TournamentResponse = await response.json();

        if (!cancelled) {
          applyTournamentData(result);
        }
      } catch {
        // Keep the currently visible data if one polling request fails.
      } finally {
        requestInProgress = false;
      }
    }

    const intervalId = window.setInterval(() => {
      void refreshViewerSchedule();
    }, 2000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [isViewer, params]);

  if (loading) {
    return (
      <PasdartLoadingState
        title="Förbereder spelschemat"
        description="Hämtar matcher, tabell och turneringsstatus."
      />
    );
  }

  if (error || !data) {
    return (
      <PasdartErrorState
        title="Spelschemat kunde inte öppnas"
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

  const groupMatches = data.matches.filter((match) => match.stage === "group");

  const semifinalMatches = data.matches.filter(
    (match) => match.stage === "semifinal",
  );

  const finalMatches = data.matches.filter((match) => match.stage === "final");

  const finalCreated = finalMatches.length > 0;

  const finishedFinal = finalMatches.find(
    (match) => match.status === "finished",
  );

  const winnerTeam = finishedFinal?.winnerTeamId
    ? getTeam(finishedFinal.winnerTeamId)
    : undefined;

  const semifinalsFinished =
    (semifinalMatches.length === 1 || semifinalMatches.length === 2) &&
    semifinalMatches.every(
      (match) => match.status === "finished" && match.winnerTeamId !== null,
    );

  const playoffsStarted =
    data.tournament.status === "playoffs" ||
    data.tournament.status === "finished" ||
    semifinalMatches.length > 0 ||
    finalMatches.length > 0;

  const isPlayoffView = playoffsStarted && !showGroupHistory;

  const isFixedLegGroup = data.tournament.groupMatchMode === "fixedLegs";

  const roundNumbers = [
    ...new Set(
      groupMatches

        .map((match) => match.roundNumber)

        .filter((round): round is number => round !== null),
    ),
  ].sort((a, b) => a - b);

  function getTeam(teamId: number) {
    return data?.teams.find((team) => team.id === teamId);
  }

  function moveCastoffTeam(
    wins: number,

    teamId: number,

    direction: "up" | "down",
  ) {
    setCastoffOrders((current) => {
      const currentOrder = current[wins];

      if (!currentOrder) {
        return current;
      }

      const currentIndex = currentOrder.indexOf(teamId);

      if (currentIndex === -1) {
        return current;
      }

      const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

      if (newIndex < 0 || newIndex >= currentOrder.length) {
        return current;
      }

      const newOrder = [...currentOrder];

      [newOrder[currentIndex], newOrder[newIndex]] = [
        newOrder[newIndex],

        newOrder[currentIndex],
      ];

      return {
        ...current,

        [wins]: newOrder,
      };
    });
  }

  async function handleConfirmCastoff() {
    if (!data) {
      return;
    }

    setSavingCastoff(true);

    setCastoffError("");

    try {
      const finalOrder = [...data.standings];

      for (const group of data.castoffGroups) {
        const selectedOrder = castoffOrders[group.wins];

        if (!selectedOrder) {
          continue;
        }

        const tiedIndexes = finalOrder

          .map((standing, index) => ({
            teamId: standing.teamId,

            index,
          }))

          .filter(({ teamId }) =>
            group.teams.some((team) => team.teamId === teamId),
          )

          .map(({ index }) => index);

        const tiedStandingsByTeamId = new Map(
          group.teams.map((team) => [team.teamId, team]),
        );

        selectedOrder.forEach((teamId, orderIndex) => {
          const targetIndex = tiedIndexes[orderIndex];

          const standing = tiedStandingsByTeamId.get(teamId);

          if (standing && targetIndex !== undefined) {
            finalOrder[targetIndex] = standing;
          }
        });
      }

      const { publicId } = await params;

      const adminToken = getTournamentAdminToken(publicId);

      if (!adminToken) {
        setCastoffError("Du saknar behörighet att spara castoff.");
        return;
      }

      const response = await fetch(`/api/tournaments/${publicId}/castoff`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "x-admin-token": adminToken,
        },

        body: JSON.stringify({
          order: finalOrder.map((standing, index) => ({
            teamId: standing.teamId,
            seed: index + 1,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error();
      }

      const updatedResponse = await fetchTournamentSchedule(publicId);

      if (!updatedResponse.ok) {
        throw new Error();
      }

      const updatedData: TournamentResponse = await updatedResponse.json();

      applyTournamentData(updatedData);
    } catch {
      setCastoffError("Kunde inte spara castoff-resultatet.");
    } finally {
      setSavingCastoff(false);
    }
  }

  async function handleStartPlayoffs() {
    if (!data) {
      return;
    }

    setStartingPlayoffs(true);

    setPlayoffError("");

    try {
      const { publicId } = await params;

      const adminToken = getTournamentAdminToken(publicId);

      if (!adminToken) {
        setPlayoffError("Du saknar behörighet att starta slutspelet.");
        return;
      }

      const response = await fetch(`/api/tournaments/${publicId}/playoffs`, {
        method: "POST",
        headers: {
          "x-admin-token": adminToken,
        },
      });

      if (!response.ok) {
        throw new Error();
      }

      const updatedResponse = await fetchTournamentSchedule(publicId);
      if (!updatedResponse.ok) {
        throw new Error();
      }

      const updatedData: TournamentResponse = await updatedResponse.json();

      applyTournamentData(updatedData);
    } catch {
      setPlayoffError("Kunde inte starta slutspelet.");
    } finally {
      setStartingPlayoffs(false);
    }
  }

  async function handleCreateFinal() {
    setCreatingFinal(true);

    setError("");

    try {
      const { publicId } = await params;

      const adminToken = getTournamentAdminToken(publicId);

      if (!adminToken) {
        return;
      }

      const response = await fetch(
        `/api/tournaments/${publicId}/playoffs/final`,
        {
          method: "POST",
          headers: {
            "x-admin-token": adminToken,
          },
        },
      );

      if (!response.ok) {
        throw new Error();
      }

      const updatedResponse = await fetchTournamentSchedule(publicId);

      if (!updatedResponse.ok) {
        throw new Error();
      }

      const updatedData: TournamentResponse = await updatedResponse.json();

      applyTournamentData(updatedData);
    } catch {
      setError("Kunde inte skapa finalen.");
    } finally {
      setCreatingFinal(false);
    }
  }

  async function handleResult(
    matchId: number,
    teamALegs: number,
    teamBLegs: number,
  ) {
    try {
      const { publicId } = await params;

      setActionError(null);

      const adminToken = getTournamentAdminToken(publicId);

      if (!adminToken) {
        setActionError({
          matchId,
          message: "Du saknar behörighet att registrera resultat.",
        });
        return;
      }

      const response = await fetch(`/api/matches/${matchId}`, {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
          "x-admin-token": adminToken,
        },

        body: JSON.stringify({
          teamALegs,
          teamBLegs,
        }),
      });

      if (!response.ok) {
        throw new Error();
      }

      const updatedResponse = await fetchTournamentSchedule(publicId);

      if (!updatedResponse.ok) {
        throw new Error();
      }

      const updatedData: TournamentResponse = await updatedResponse.json();

      applyTournamentData(updatedData);
    } catch {
      setActionError({
        matchId,
        message: "Kunde inte spara matchresultatet.",
      });
    }
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
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

            <Box sx={{ p: { xs: 2.25, sm: 3 } }}>
              <Stack spacing={2}>
                <Stack
                  sx={{
                    flexDirection: { xs: "column", sm: "row" },

                    justifyContent: "space-between",

                    alignItems: { xs: "flex-start", sm: "center" },

                    gap: 2,
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
                        mt: 0.7,

                        fontWeight: 800,

                        letterSpacing: "-0.025em",

                        fontSize: { xs: "2rem", sm: "2.5rem" },

                        lineHeight: 1.05,
                      }}
                    >
                      {data.tournament.name}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      minWidth: { sm: 175 },
                      pl: { sm: 2.5 },
                      borderLeft: {
                        xs: "none",
                        sm: "1px solid rgba(255,255,255,0.12)",
                      },
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        color: "error.light",
                        letterSpacing: "0.08em",
                        fontWeight: 800,
                      }}
                    >
                      TURNERINGSFAS
                    </Typography>

                    <Typography sx={{ mt: 0.25, fontWeight: 800 }}>
                      {isPlayoffView
                        ? data.tournament.status === "finished"
                          ? "Avslutad"
                          : finalCreated
                            ? "Final"
                            : "Slutspel"
                        : "Gruppspel"}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary", mt: 0.2 }}
                    >
                      {isPlayoffView
                        ? data.tournament.status === "finished"
                          ? "Cupen är avgjord"
                          : finalCreated
                            ? "Finalen är skapad"
                            : semifinalMatches.length === 1
                              ? "1 semifinal"
                              : `${semifinalMatches.length} semifinaler`
                        : data.groupStageComplete
                          ? "Gruppspelet är klart"
                          : `${groupMatches.filter((match) => match.status === "finished").length} av ${groupMatches.length} matcher klara`}
                    </Typography>

                    {data.isAdmin && viewerCode && (
                      <TournamentShareCode viewerCode={viewerCode} />
                    )}
                  </Box>
                </Stack>

                <Box
                  sx={{
                    pt: 1.5,

                    borderTop: "1px solid rgba(255,255,255,0.10)",
                  }}
                >
                  <Stack
                    sx={{
                      flexDirection: "row",

                      flexWrap: "wrap",

                      alignItems: "center",

                      gap: 1,
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
                      {isPlayoffView ? "SLUTSPEL" : "GRUPPSPEL"}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
                      {isPlayoffView ? (
                        <>
                          {data.tournament.gameType} · Bäst av{" "}
                          {data.tournament.playoffBestOf}
                          {data.tournament.playoffMaxDarts
                            ? ` · Max ${data.tournament.playoffMaxDarts} darts`
                            : ""}
                        </>
                      ) : (
                        <>
                          {data.tournament.gameType} · Gruppspel ·{" "}
                          {data.tournament.groupMatchMode === "fixedLegs"
                            ? `Alla ${data.tournament.groupLegCount} legs spelas`
                            : `Bäst av ${data.tournament.groupBestOf}`}
                          {data.tournament.groupMaxDarts
                            ? ` · Max ${data.tournament.groupMaxDarts} darts`
                            : ""}
                        </>
                      )}
                    </Typography>
                  </Stack>
                </Box>
              </Stack>
            </Box>
          </Paper>

          {playoffsStarted && (
            <Stack
              sx={{
                flexDirection: "row",

                gap: 1,

                borderBottom: "1px solid rgba(255,255,255,0.12)",

                pb: 1,
              }}
            >
              <Button
                size="small"
                variant={showGroupHistory ? "text" : "contained"}
                onClick={() => setShowGroupHistory(false)}
                sx={{
                  borderRadius: 0.75,

                  boxShadow: "none",

                  px: 1.5,
                }}
              >
                Slutspel
              </Button>

              <Button
                size="small"
                variant={showGroupHistory ? "contained" : "text"}
                onClick={() => setShowGroupHistory(true)}
                sx={{
                  borderRadius: 0.75,

                  boxShadow: "none",

                  px: 1.5,
                }}
              >
                Gruppspel
              </Button>
            </Stack>
          )}

          {(!playoffsStarted || showGroupHistory) && (
            <Paper
              elevation={0}
              sx={{
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 0.75,
                backgroundColor: "rgba(255,255,255,0.012)",
              }}
            >
              <Box
                sx={{
                  px: { xs: 2, sm: 2.5 },
                  pt: 2.25,
                  pb: 1.75,
                  borderBottom: "1px solid rgba(255,255,255,0.10)",
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
                      GRUPPSPEL
                    </Typography>

                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 800,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      Tabell
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary", mt: 0.35 }}
                    >
                      {Math.min(
                        data.tournament.playoffQualifiers,
                        data.standings.length,
                      )}{" "}
                      lag går vidare till slutspel.
                    </Typography>
                  </Box>

                  <Stack spacing={0.35} sx={{ alignItems: { sm: "flex-end" } }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {isFixedLegGroup
                        ? "M = matcher · V = vinster · O = oavgjorda · F = förluster"
                        : "M = matcher · V = vinster · F = förluster"}
                    </Typography>

                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                        letterSpacing: "0.03em",
                      }}
                    >
                      Grön markering = slutspelsplats
                    </Typography>
                  </Stack>
                </Stack>

                <Box
                  sx={{
                    width: 42,
                    height: 2,
                    mt: 1.5,
                    backgroundColor: "error.dark",
                  }}
                />
              </Box>

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow
                      sx={{
                        "& th": {
                          py: 1.25,
                          borderBottom: "1px solid rgba(255,255,255,0.16)",
                          color: "text.secondary",
                          fontSize: "0.72rem",
                          fontWeight: 800,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                        },
                      }}
                    >
                      <TableCell align="center">M</TableCell>
                      <TableCell align="center">V</TableCell>

                      {isFixedLegGroup && (
                        <TableCell align="center">O</TableCell>
                      )}

                      <TableCell align="center">F</TableCell>
                      <TableCell align="center">Legs</TableCell>
                      <TableCell align="center">+/-</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {data.standings.map((standing, index) => {
                      const isPlayoffPosition =
                        index < data.tournament.playoffQualifiers;

                      return (
                        <TableRow
                          key={standing.teamId}
                          sx={{
                            position: "relative",
                            "& td": {
                              py: 1.4,
                              borderBottom: "1px solid rgba(255,255,255,0.07)",
                            },
                            "&:last-of-type td": {
                              borderBottom: 0,
                            },
                            ...(isPlayoffPosition && {
                              "& td:first-of-type": {
                                borderLeft: "3px solid rgba(76,175,80,0.70)",
                              },
                            }),
                            ...(index ===
                              Math.min(
                                data.tournament.playoffQualifiers,
                                data.standings.length,
                              ) -
                                1 &&
                              index < data.standings.length - 1 && {
                                "& td": {
                                  borderBottom:
                                    "2px solid rgba(198,40,40,0.38)",
                                },
                              }),
                          }}
                        >
                          <TableCell>
                            <Typography
                              sx={{
                                fontWeight: 800,
                                color: isPlayoffPosition
                                  ? "text.primary"
                                  : "text.secondary",
                              }}
                            >
                              {index + 1}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Typography sx={{ fontWeight: 700 }}>
                              Lag {standing.teamNumber}
                            </Typography>

                            <Typography
                              variant="body2"
                              sx={{ color: "text.secondary", mt: 0.15 }}
                            >
                              {standing.players
                                .map((player) => player.name)
                                .join(" + ")}
                            </Typography>
                          </TableCell>

                          <TableCell align="center">
                            {standing.played}
                          </TableCell>

                          <TableCell align="center">
                            <Typography sx={{ fontWeight: 700 }}>
                              {standing.wins}
                            </Typography>
                          </TableCell>

                          {isFixedLegGroup && (
                            <TableCell align="center">
                              {standing.draws}
                            </TableCell>
                          )}

                          <TableCell align="center">
                            {standing.losses}
                          </TableCell>

                          <TableCell align="center">
                            {standing.legsWon}-{standing.legsLost}
                          </TableCell>

                          <TableCell align="center">
                            <Typography
                              sx={{
                                fontWeight: 700,
                                color:
                                  standing.legDifference > 0
                                    ? "success.light"
                                    : standing.legDifference < 0
                                      ? "text.secondary"
                                      : "text.primary",
                              }}
                            >
                              {standing.legDifference > 0
                                ? `+${standing.legDifference}`
                                : standing.legDifference}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}

          {(!playoffsStarted || showGroupHistory) &&
            roundNumbers.map((roundNumber) => {
              const roundMatches = groupMatches.filter(
                (match) => match.roundNumber === roundNumber,
              );

              const finishedMatches = roundMatches.filter(
                (match) => match.status === "finished",
              ).length;

              return (
                <Stack key={roundNumber} spacing={1.5}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-end",
                      gap: 2,
                      pb: 1,
                      borderBottom: "1px solid rgba(255,255,255,0.14)",
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
                        GRUPPSPEL
                      </Typography>

                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 800,
                          letterSpacing: "-0.01em",
                        }}
                      >
                        Omgång {roundNumber}
                      </Typography>
                    </Box>

                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                        letterSpacing: "0.03em",
                      }}
                    >
                      {finishedMatches} av {roundMatches.length} matcher klara
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr",
                        md: "repeat(2, minmax(0, 1fr))",
                      },
                      gap: 1.5,
                    }}
                  >
                    {roundMatches.map((match) => {
                      const teamA = getTeam(match.teamAId);
                      const teamB = getTeam(match.teamBId);
                      const teamAWon =
                        match.status === "finished" &&
                        match.winnerTeamId === match.teamAId;
                      const teamBWon =
                        match.status === "finished" &&
                        match.winnerTeamId === match.teamBId;

                      return (
                        <Paper
                          key={match.id}
                          elevation={0}
                          sx={{
                            p: 2,
                            border: "1px solid rgba(255,255,255,0.12)",
                            borderRadius: 0.75,
                            backgroundColor: "rgba(255,255,255,0.012)",
                          }}
                        >
                          <Stack spacing={1.5}>
                            <Stack
                              sx={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                                gap: 2,
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "text.secondary",
                                  fontWeight: 700,
                                  letterSpacing: "0.04em",
                                }}
                              >
                                TAVLA {match.boardNumber}
                              </Typography>

                              <Typography
                                variant="caption"
                                sx={{ color: "text.secondary" }}
                              >
                                MATCH {match.matchNumber}
                              </Typography>
                            </Stack>

                            <Stack spacing={0.75}>
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  gap: 2,
                                  py: 1,
                                  px: 1.25,
                                  borderLeft: teamAWon
                                    ? "3px solid rgba(76,175,80,0.80)"
                                    : "3px solid transparent",
                                  borderBottom:
                                    "1px solid rgba(255,255,255,0.08)",
                                  opacity:
                                    match.status === "finished" && !teamAWon
                                      ? 0.58
                                      : 1,
                                }}
                              >
                                <Box sx={{ minWidth: 0 }}>
                                  <Typography sx={{ fontWeight: 700 }}>
                                    Lag {teamA?.teamNumber}
                                    {teamAWon ? " ✓" : ""}
                                  </Typography>

                                  <Typography
                                    variant="body2"
                                    sx={{ color: "text.secondary" }}
                                  >
                                    {teamA?.players
                                      .map((player) => player.name)
                                      .join(" + ")}
                                  </Typography>
                                </Box>

                                {match.status === "finished" && (
                                  <Typography
                                    variant="h6"
                                    sx={{ fontWeight: 800 }}
                                  >
                                    {match.teamALegs}
                                  </Typography>
                                )}
                              </Box>

                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  gap: 2,
                                  py: 1,
                                  px: 1.25,
                                  borderLeft: teamBWon
                                    ? "3px solid rgba(76,175,80,0.80)"
                                    : "3px solid transparent",
                                  opacity:
                                    match.status === "finished" && !teamBWon
                                      ? 0.58
                                      : 1,
                                }}
                              >
                                <Box sx={{ minWidth: 0 }}>
                                  <Typography sx={{ fontWeight: 700 }}>
                                    Lag {teamB?.teamNumber}
                                    {teamBWon ? " ✓" : ""}
                                  </Typography>

                                  <Typography
                                    variant="body2"
                                    sx={{ color: "text.secondary" }}
                                  >
                                    {teamB?.players
                                      .map((player) => player.name)
                                      .join(" + ")}
                                  </Typography>
                                </Box>

                                {match.status === "finished" && (
                                  <Typography
                                    variant="h6"
                                    sx={{ fontWeight: 800 }}
                                  >
                                    {match.teamBLegs}
                                  </Typography>
                                )}
                              </Box>
                            </Stack>

                            {match.status !== "finished" && (
                              <MatchResultControls
                                matchId={match.id}
                                bestOf={data.tournament.groupBestOf}
                                matchMode={
                                  data.tournament.groupMatchMode === "fixedLegs"
                                    ? "fixedLegs"
                                    : "bestOf"
                                }
                                fixedLegCount={data.tournament.groupLegCount}
                                isAdmin={data.isAdmin}
                                density="compact"
                                actionError={
                                  actionError?.matchId === match.id
                                    ? actionError.message
                                    : undefined
                                }
                                onResult={handleResult}
                              />
                            )}
                          </Stack>
                        </Paper>
                      );
                    })}
                  </Box>
                </Stack>
              );
            })}

          {data.groupStageComplete && !playoffsStarted && (
            <Paper
              elevation={0}
              sx={{
                overflow: "hidden",
                border: "1px solid rgba(198,40,40,0.34)",
                borderTop: "3px solid",
                borderTopColor: "error.dark",
                borderRadius: 0.75,
                backgroundColor: "rgba(198,40,40,0.035)",
              }}
            >
              {data.requiresCastoff ? (
                <Stack spacing={0}>
                  <Box
                    sx={{
                      px: { xs: 2, sm: 2.5 },
                      pt: 2.25,
                      pb: 1.75,
                      borderBottom: "1px solid rgba(255,255,255,0.10)",
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
                      NÄSTA STEG
                    </Typography>

                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 800,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      Avgör castoff
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        color: "text.secondary",
                        mt: 0.45,
                        maxWidth: 680,
                        lineHeight: 1.6,
                      }}
                    >
                      Gruppspelet är klart. Gör castoff mellan lagen som står
                      lika. Använd sedan pilarna för att lägga vinnaren högst
                      upp och resten i resultatordning.
                    </Typography>
                  </Box>

                  <Stack spacing={2.25} sx={{ p: { xs: 2, sm: 2.5 } }}>
                    {data.castoffGroups.map((group) => {
                      const order = castoffOrders[group.wins] ?? [];

                      return (
                        <Box key={group.wins}>
                          <Stack
                            sx={{
                              flexDirection: "row",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: 2,
                              mb: 0.75,
                            }}
                          >
                            <Box>
                              <Typography
                                sx={{
                                  fontWeight: 800,
                                  letterSpacing: "-0.01em",
                                }}
                              >
                                {group.wins}{" "}
                                {group.wins === 1 ? "vinst" : "vinster"}
                              </Typography>

                              <Typography
                                variant="caption"
                                sx={{ color: "text.secondary" }}
                              >
                                Vinnaren ska ligga högst upp. Ordna resten efter
                                castoff-resultatet.
                              </Typography>
                            </Box>

                            <Typography
                              variant="caption"
                              sx={{
                                color: "text.secondary",
                                letterSpacing: "0.03em",
                                flexShrink: 0,
                              }}
                            >
                              {group.teams.length} lag
                            </Typography>
                          </Stack>

                          <Box
                            sx={{
                              borderTop: "1px solid rgba(255,255,255,0.12)",
                            }}
                          >
                            {order.map((teamId, index) => {
                              const standing = group.teams.find(
                                (team) => team.teamId === teamId,
                              );

                              if (!standing) {
                                return null;
                              }

                              return (
                                <Box
                                  key={teamId}
                                  sx={{
                                    display: "grid",
                                    gridTemplateColumns:
                                      "34px minmax(0, 1fr) auto",
                                    alignItems: "center",
                                    gap: { xs: 1, sm: 1.5 },
                                    py: 1.25,
                                    borderBottom:
                                      "1px solid rgba(255,255,255,0.08)",
                                  }}
                                >
                                  <Box
                                    sx={{
                                      width: 28,
                                      height: 28,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      border:
                                        "1px solid rgba(255,255,255,0.14)",
                                      borderRadius: 0.75,
                                      fontWeight: 800,
                                      fontSize: "0.9rem",
                                    }}
                                  >
                                    {index + 1}
                                  </Box>

                                  <Box sx={{ minWidth: 0 }}>
                                    <Typography sx={{ fontWeight: 700 }}>
                                      Lag {standing.teamNumber}
                                    </Typography>

                                    <Typography
                                      variant="body2"
                                      sx={{ color: "text.secondary" }}
                                    >
                                      {standing.players
                                        .map((player) => player.name)
                                        .join(" + ")}
                                    </Typography>
                                  </Box>

                                  {data.isAdmin && (
                                    <Stack
                                      sx={{
                                        flexDirection: "row",
                                        gap: 0.5,
                                      }}
                                    >
                                      <Button
                                        variant="outlined"
                                        size="small"
                                        aria-label={`Flytta Lag ${standing.teamNumber} upp`}
                                        disabled={index === 0}
                                        onClick={() =>
                                          moveCastoffTeam(
                                            group.wins,
                                            teamId,
                                            "up",
                                          )
                                        }
                                        sx={{
                                          minWidth: 34,
                                          width: 34,
                                          height: 34,
                                          p: 0,
                                          borderRadius: 0.75,
                                          borderColor: "rgba(255,255,255,0.16)",
                                          color: "text.primary",
                                        }}
                                      >
                                        ↑
                                      </Button>

                                      <Button
                                        variant="outlined"
                                        size="small"
                                        aria-label={`Flytta Lag ${standing.teamNumber} ner`}
                                        disabled={index === order.length - 1}
                                        onClick={() =>
                                          moveCastoffTeam(
                                            group.wins,
                                            teamId,
                                            "down",
                                          )
                                        }
                                        sx={{
                                          minWidth: 34,
                                          width: 34,
                                          height: 34,
                                          p: 0,
                                          borderRadius: 0.75,
                                          borderColor: "rgba(255,255,255,0.16)",
                                          color: "text.primary",
                                        }}
                                      >
                                        ↓
                                      </Button>
                                    </Stack>
                                  )}
                                </Box>
                              );
                            })}
                          </Box>
                        </Box>
                      );
                    })}

                    {data.isAdmin && (
                      <Box
                        sx={{
                          pt: 2,
                          mt: 0.5,
                          borderTop: "1px solid rgba(255,255,255,0.10)",
                        }}
                      >
                        {castoffError && (
                          <Box sx={{ mb: 1.5 }}>
                            <PasdartInlineError message={castoffError} />
                          </Box>
                        )}

                        <Button
                          variant="contained"
                          size="large"
                          fullWidth
                          onClick={handleConfirmCastoff}
                          disabled={savingCastoff}
                          sx={{
                            minHeight: 52,
                            borderRadius: 0.75,
                            boxShadow: "none",
                            fontWeight: 800,
                          }}
                        >
                          {savingCastoff
                            ? "Sparar castoff..."
                            : "Bekräfta castoff-ordning"}
                        </Button>

                        <Typography
                          variant="caption"
                          sx={{
                            display: "block",
                            textAlign: "center",
                            color: "text.secondary",
                            mt: 1,
                          }}
                        >
                          Kontrollera ordningen och bekräfta när vinnaren ligger
                          högst upp.
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </Stack>
              ) : (
                <Stack
                  spacing={2}
                  sx={{
                    p: { xs: 2.25, sm: 2.75 },
                    alignItems: { xs: "stretch", sm: "flex-start" },
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
                      NÄSTA STEG
                    </Typography>

                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                      Gruppspelet är klart
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        color: "text.secondary",
                        mt: 0.45,
                        lineHeight: 1.6,
                      }}
                    >
                      Alla gruppmatcher är färdigspelade och seedningen är klar.
                      Starta slutspelet när ni är redo.
                    </Typography>
                  </Box>

                  {data.isAdmin && (
                    <Stack spacing={1.5}>
                      {playoffError && (
                        <PasdartInlineError message={playoffError} />
                      )}

                      <Button
                        variant="contained"
                        size="large"
                        onClick={handleStartPlayoffs}
                        disabled={startingPlayoffs}
                        sx={{
                          width: { xs: "100%", sm: "auto" },
                          minWidth: { sm: 280 },
                          minHeight: 52,
                          borderRadius: 0.75,
                          boxShadow: "none",
                          fontWeight: 800,
                        }}
                      >
                        {startingPlayoffs
                          ? "Startar slutspel..."
                          : "Starta slutspel"}
                      </Button>
                    </Stack>
                  )}
                </Stack>
              )}
            </Paper>
          )}

          {isPlayoffView && (
            <Box
              sx={{
                display: "grid",

                gridTemplateColumns: {
                  xs: "1fr",

                  md:
                    semifinalMatches.length > 0
                      ? "minmax(0, 1fr) 64px minmax(0, 1fr)"
                      : "minmax(0, 1fr)",
                },

                gap: { xs: 3, md: 2.5 },

                alignItems: "center",

                p: { xs: 2, sm: 2.5 },

                borderTop: "1px solid rgba(255,255,255,0.16)",

                borderBottom: "1px solid rgba(255,255,255,0.10)",

                borderRadius: 0,

                backgroundColor: "transparent",
              }}
            >
              {semifinalMatches.length > 0 && (
                <Stack spacing={2}>
                  <Box>
                    <Typography
                      variant="overline"
                      sx={{
                        color: "error.light",

                        fontWeight: 800,

                        letterSpacing: "0.08em",
                      }}
                    >
                      SEMIFINALER
                    </Typography>

                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 800, letterSpacing: "-0.01em" }}
                    >
                      Semifinaler
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary", mt: 0.35 }}
                    >
                      Vinnarna går vidare till final.
                    </Typography>

                    <Box
                      sx={{
                        width: 42,

                        height: 2,

                        mt: 1.25,

                        backgroundColor: "error.dark",
                      }}
                    />
                  </Box>

                  {semifinalMatches.map((match) => {
                    const teamA = getTeam(match.teamAId);

                    const teamB = getTeam(match.teamBId);

                    const teamAWon =
                      match.status === "finished" &&
                      match.winnerTeamId === match.teamAId;

                    const teamBWon =
                      match.status === "finished" &&
                      match.winnerTeamId === match.teamBId;

                    return (
                      <Paper
                        key={match.id}
                        elevation={0}
                        sx={{
                          p: 2,

                          border: "1px solid rgba(255,255,255,0.12)",

                          borderRadius: 0.75,

                          backgroundColor: "rgba(255,255,255,0.012)",

                          boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
                        }}
                      >
                        <Stack spacing={2}>
                          <Stack
                            sx={{
                              flexDirection: "row",

                              justifyContent: "space-between",

                              alignItems: "center",
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                color: "text.secondary",

                                fontWeight: 700,

                                letterSpacing: "0.04em",
                              }}
                            >
                              TAVLA {match.boardNumber}
                            </Typography>

                            <Typography
                              variant="body2"
                              sx={{ color: "text.secondary" }}
                            >
                              Semifinal {match.matchNumber}
                            </Typography>
                          </Stack>

                          <Stack spacing={1}>
                            <Box
                              sx={{
                                display: "flex",

                                justifyContent: "space-between",

                                alignItems: "center",

                                gap: 2,

                                p: 1.5,

                                border: "1px solid",

                                borderColor: teamAWon
                                  ? "text.primary"
                                  : "divider",

                                borderRadius: 1,

                                backgroundColor: teamAWon
                                  ? "rgba(46,125,50,0.07)"
                                  : "rgba(255,255,255,0.012)",

                                borderLeft: teamAWon
                                  ? "3px solid rgba(76,175,80,0.80)"
                                  : "3px solid transparent",

                                opacity:
                                  match.status === "finished" && !teamAWon
                                    ? 0.55
                                    : 1,
                              }}
                            >
                              <Box sx={{ minWidth: 0 }}>
                                <Typography sx={{ fontWeight: 700 }}>
                                  {teamA?.seed ? `#${teamA.seed} · ` : ""}
                                  Lag {teamA?.teamNumber}
                                  {teamAWon ? " ✓" : ""}
                                </Typography>

                                <Typography
                                  variant="body2"
                                  sx={{ color: "text.secondary" }}
                                >
                                  {teamA?.players

                                    .map((player) => player.name)

                                    .join(" + ")}
                                </Typography>
                              </Box>

                              {match.status === "finished" && (
                                <Typography
                                  variant="h5"
                                  sx={{ fontWeight: 700 }}
                                >
                                  {match.teamALegs}
                                </Typography>
                              )}
                            </Box>

                            <Box
                              sx={{
                                display: "flex",

                                justifyContent: "space-between",

                                alignItems: "center",

                                gap: 2,

                                p: 1.5,

                                border: "1px solid",

                                borderColor: teamBWon
                                  ? "text.primary"
                                  : "divider",

                                borderRadius: 1,

                                backgroundColor: teamBWon
                                  ? "rgba(46,125,50,0.07)"
                                  : "rgba(255,255,255,0.012)",

                                borderLeft: teamBWon
                                  ? "3px solid rgba(76,175,80,0.80)"
                                  : "3px solid transparent",

                                opacity:
                                  match.status === "finished" && !teamBWon
                                    ? 0.55
                                    : 1,
                              }}
                            >
                              <Box sx={{ minWidth: 0 }}>
                                <Typography sx={{ fontWeight: 700 }}>
                                  {teamB?.seed ? `#${teamB.seed} · ` : ""}
                                  Lag {teamB?.teamNumber}
                                  {teamBWon ? " ✓" : ""}
                                </Typography>

                                <Typography
                                  variant="body2"
                                  sx={{ color: "text.secondary" }}
                                >
                                  {teamB?.players

                                    .map((player) => player.name)

                                    .join(" + ")}
                                </Typography>
                              </Box>

                              {match.status === "finished" && (
                                <Typography
                                  variant="h5"
                                  sx={{ fontWeight: 700 }}
                                >
                                  {match.teamBLegs}
                                </Typography>
                              )}
                            </Box>
                          </Stack>

                          {match.status !== "finished" && (
                            <MatchResultControls
                              matchId={match.id}
                              bestOf={data.tournament.playoffBestOf}
                              isAdmin={data.isAdmin}
                              actionError={
                                actionError?.matchId === match.id
                                  ? actionError.message
                                  : undefined
                              }
                              onResult={handleResult}
                            />
                          )}
                        </Stack>
                      </Paper>
                    );
                  })}
                </Stack>
              )}

              {semifinalMatches.length > 0 && (
                <Box
                  sx={{
                    display: { xs: "none", md: "flex" },

                    alignItems: "center",

                    justifyContent: "center",
                  }}
                >
                  <Typography
                    aria-hidden="true"
                    sx={{
                      color: "rgba(255,255,255,0.58)",

                      fontSize: 34,

                      lineHeight: 1,
                    }}
                  >
                    →
                  </Typography>
                </Box>
              )}

              <Stack spacing={2}>
                <Box>
                  <Typography
                    variant="overline"
                    sx={{
                      color: "error.light",

                      fontWeight: 800,

                      letterSpacing: "0.08em",
                    }}
                  >
                    FINAL
                  </Typography>

                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 800, letterSpacing: "-0.01em" }}
                  >
                    Final
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{ color: "text.secondary", mt: 0.35 }}
                  >
                    {finalCreated
                      ? "Vinnaren tar hem turneringen."
                      : semifinalMatches.length > 0
                        ? "Finalen skapas när semifinalerna är avgjorda."
                        : "Vinnaren tar hem turneringen."}
                  </Typography>

                  <Box
                    sx={{
                      width: 42,

                      height: 2,

                      mt: 1.25,

                      backgroundColor: "success.dark",
                    }}
                  />
                </Box>

                {finalCreated ? (
                  finalMatches.map((match) => {
                    const teamA = getTeam(match.teamAId);

                    const teamB = getTeam(match.teamBId);

                    const teamAWon =
                      match.status === "finished" &&
                      match.winnerTeamId === match.teamAId;

                    const teamBWon =
                      match.status === "finished" &&
                      match.winnerTeamId === match.teamBId;

                    return (
                      <Paper
                        key={match.id}
                        elevation={0}
                        sx={{
                          p: 2,

                          border: "1px solid rgba(255,255,255,0.12)",

                          borderTop: "2px solid rgba(198,40,40,0.72)",

                          borderRadius: 0.75,

                          backgroundColor: "rgba(255,255,255,0.012)",

                          boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
                        }}
                      >
                        <Stack spacing={2}>
                          <Stack
                            sx={{
                              flexDirection: "row",

                              justifyContent: "space-between",

                              alignItems: "center",
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                color: "text.secondary",

                                fontWeight: 700,

                                letterSpacing: "0.04em",
                              }}
                            >
                              TAVLA {match.boardNumber}
                            </Typography>

                            <Typography
                              variant="body2"
                              sx={{ color: "text.secondary" }}
                            >
                              Final
                            </Typography>
                          </Stack>

                          <Stack spacing={1}>
                            <Box
                              sx={{
                                display: "flex",

                                justifyContent: "space-between",

                                alignItems: "center",

                                gap: 2,

                                p: 1.5,

                                border: "1px solid",

                                borderColor: teamAWon
                                  ? "text.primary"
                                  : "divider",

                                borderRadius: 1,

                                backgroundColor: teamAWon
                                  ? "rgba(46,125,50,0.07)"
                                  : "rgba(255,255,255,0.012)",

                                borderLeft: teamAWon
                                  ? "3px solid rgba(76,175,80,0.80)"
                                  : "3px solid transparent",

                                opacity:
                                  match.status === "finished" && !teamAWon
                                    ? 0.55
                                    : 1,
                              }}
                            >
                              <Box sx={{ minWidth: 0 }}>
                                <Typography sx={{ fontWeight: 700 }}>
                                  {teamA?.seed ? `#${teamA.seed} · ` : ""}
                                  Lag {teamA?.teamNumber}
                                  {teamAWon ? " ✓" : ""}
                                </Typography>

                                <Typography
                                  variant="body2"
                                  sx={{ color: "text.secondary" }}
                                >
                                  {teamA?.players

                                    .map((player) => player.name)

                                    .join(" + ")}
                                </Typography>
                              </Box>

                              {match.status === "finished" && (
                                <Typography
                                  variant="h5"
                                  sx={{ fontWeight: 700 }}
                                >
                                  {match.teamALegs}
                                </Typography>
                              )}
                            </Box>

                            <Box
                              sx={{
                                display: "flex",

                                justifyContent: "space-between",

                                alignItems: "center",

                                gap: 2,

                                p: 1.5,

                                border: "1px solid",

                                borderColor: teamBWon
                                  ? "text.primary"
                                  : "divider",

                                borderRadius: 1,

                                backgroundColor: teamBWon
                                  ? "rgba(46,125,50,0.07)"
                                  : "rgba(255,255,255,0.012)",

                                borderLeft: teamBWon
                                  ? "3px solid rgba(76,175,80,0.80)"
                                  : "3px solid transparent",

                                opacity:
                                  match.status === "finished" && !teamBWon
                                    ? 0.55
                                    : 1,
                              }}
                            >
                              <Box sx={{ minWidth: 0 }}>
                                <Typography sx={{ fontWeight: 700 }}>
                                  {teamB?.seed ? `#${teamB.seed} · ` : ""}
                                  Lag {teamB?.teamNumber}
                                  {teamBWon ? " ✓" : ""}
                                </Typography>

                                <Typography
                                  variant="body2"
                                  sx={{ color: "text.secondary" }}
                                >
                                  {teamB?.players

                                    .map((player) => player.name)

                                    .join(" + ")}
                                </Typography>
                              </Box>

                              {match.status === "finished" && (
                                <Typography
                                  variant="h5"
                                  sx={{ fontWeight: 700 }}
                                >
                                  {match.teamBLegs}
                                </Typography>
                              )}
                            </Box>
                          </Stack>

                          {match.status !== "finished" && (
                            <MatchResultControls
                              matchId={match.id}
                              bestOf={data.tournament.playoffBestOf}
                              isAdmin={data.isAdmin}
                              actionError={
                                actionError?.matchId === match.id
                                  ? actionError.message
                                  : undefined
                              }
                              onResult={handleResult}
                            />
                          )}
                        </Stack>
                      </Paper>
                    );
                  })
                ) : (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,

                      border: "1px dashed",

                      borderColor: "rgba(255,255,255,0.18)",

                      borderRadius: 1.5,

                      minHeight: 190,

                      display: "flex",

                      alignItems: "center",

                      justifyContent: "center",

                      backgroundColor: "rgba(255,255,255,0.018)",
                    }}
                  >
                    <Stack
                      spacing={2}
                      sx={{ width: "100%", textAlign: "center" }}
                    >
                      <Box>
                        <Typography sx={{ fontWeight: 700 }}>
                          Finalplats väntar
                        </Typography>

                        <Typography
                          variant="body2"
                          sx={{ color: "text.secondary", mt: 0.5 }}
                        >
                          {semifinalsFinished
                            ? "Semifinalerna är klara."
                            : "Avgör semifinalerna för att fylla finalen."}
                        </Typography>
                      </Box>

                      {data.isAdmin && semifinalsFinished && (
                        <Button
                          variant="contained"
                          size="large"
                          fullWidth
                          onClick={handleCreateFinal}
                          disabled={creatingFinal}
                        >
                          {creatingFinal ? "Skapar final..." : "Skapa final"}
                        </Button>
                      )}
                    </Stack>
                  </Paper>
                )}
              </Stack>
            </Box>
          )}

          {isPlayoffView &&
            data.tournament.status === "finished" &&
            winnerTeam && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    width: "100%",
                    maxWidth: 860,
                    overflow: "hidden",
                    border: "1px solid rgba(255,255,255,0.14)",
                    borderRadius: 1,
                    backgroundColor: "rgba(255,255,255,0.015)",
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
                      px: { xs: 2.25, sm: 3.5 },
                      py: { xs: 2.5, sm: 3.25 },
                    }}
                  >
                    <Stack spacing={2.5}>
                      <Box sx={{ textAlign: "center" }}>
                        <Typography
                          variant="overline"
                          sx={{
                            color: "error.light",
                            fontWeight: 800,
                            letterSpacing: "0.09em",
                          }}
                        >
                          TURNERINGEN ÄR AVGJORD
                        </Typography>

                        <Typography
                          variant="h4"
                          sx={{
                            mt: 0.3,
                            fontWeight: 800,
                            letterSpacing: "-0.02em",
                          }}
                        >
                          Kvällens vinnare
                        </Typography>

                        <Box
                          sx={{
                            width: 46,
                            height: 2,
                            mx: "auto",
                            mt: 1.15,
                            backgroundColor: "error.dark",
                          }}
                        />
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        <Box
                          sx={{
                            width: "100%",
                            maxWidth: 680,
                            borderTop: "1px solid rgba(255,255,255,0.14)",
                            borderBottom: "1px solid rgba(255,255,255,0.10)",
                            borderLeft: "3px solid rgba(76,175,80,0.82)",
                          }}
                        >
                          <Box
                            sx={{
                              display: "grid",
                              gridTemplateColumns: {
                                xs: "1fr",
                                sm: finishedFinal ? "1fr 1fr" : "1fr",
                              },
                            }}
                          >
                            <Box
                              sx={{
                                px: { xs: 2, sm: 2.75 },
                                py: { xs: 2.25, sm: 2.75 },
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center",
                                textAlign: "center",
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
                                VINNARE
                              </Typography>

                              <Typography
                                variant="h4"
                                sx={{
                                  mt: 0.4,
                                  fontWeight: 800,
                                  lineHeight: 1.1,
                                }}
                              >
                                Lag {winnerTeam.teamNumber}
                              </Typography>

                              <Typography
                                sx={{
                                  color: "text.secondary",
                                  mt: 0.45,
                                }}
                              >
                                {winnerTeam.players
                                  .map((player) => player.name)
                                  .join(" + ")}
                              </Typography>
                            </Box>

                            {finishedFinal && (
                              <Box
                                sx={{
                                  px: { xs: 2, sm: 2.75 },
                                  py: { xs: 2.25, sm: 2.75 },
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  textAlign: "center",
                                  borderTop: {
                                    xs: "1px solid rgba(255,255,255,0.10)",
                                    sm: "none",
                                  },
                                  borderLeft: {
                                    xs: "none",
                                    sm: "1px solid rgba(255,255,255,0.10)",
                                  },
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: "text.secondary",
                                    fontWeight: 700,
                                    letterSpacing: "0.06em",
                                  }}
                                >
                                  FINALRESULTAT
                                </Typography>

                                <Typography
                                  variant="h3"
                                  sx={{
                                    mt: 0.4,
                                    fontWeight: 800,
                                    lineHeight: 1,
                                  }}
                                >
                                  {finishedFinal.teamALegs} -{" "}
                                  {finishedFinal.teamBLegs}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </Box>
                      </Box>

                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.secondary",
                          textAlign: "center",
                        }}
                      >
                        Pas d&apos;Art · {data.tournament.name}
                      </Typography>
                    </Stack>
                  </Box>
                </Paper>
              </Box>
            )}
        </Stack>
      </Box>

      <TournamentCreatedDialog
        open={viewerCodeDialog !== ""}
        viewerCode={viewerCodeDialog}
        onClose={() => setViewerCodeDialog("")}
      />

      {winnerTeam && finishedFinal && (
        <Dialog
          open={winnerDialogOpen}
          onClose={() => setWinnerDialogOpen(false)}
          fullWidth
          maxWidth="sm"
          slotProps={{
            paper: {
              sx: {
                width: "100%",
                maxWidth: 600,
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.16)",
                borderRadius: 1,
                backgroundImage: "none",
                backgroundColor: "#191919",
                boxShadow: "0 22px 70px rgba(0,0,0,0.55)",
              },
            },
          }}
        >
          <Box
            sx={{
              height: 3,
              backgroundColor: "error.dark",
            }}
          />

          <DialogContent
            sx={{
              px: { xs: 2.5, sm: 4.5 },
              pt: { xs: 3.25, sm: 4.25 },
              pb: { xs: 2.5, sm: 3 },
              textAlign: "center",
            }}
          >
            <Stack
              spacing={2.25}
              sx={{
                width: "100%",
                alignItems: "center",
              }}
            >
              <Typography
                sx={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontStyle: "italic",
                  fontSize: { xs: "1rem", sm: "1.08rem" },
                  color: "rgba(255,255,255,0.70)",
                  lineHeight: 1,
                }}
              >
                Pas d&apos;Art
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                <Box
                  sx={{
                    width: 24,
                    height: 3,
                    backgroundColor: "success.dark",
                  }}
                />
                <Box
                  sx={{
                    width: 24,
                    height: 3,
                    backgroundColor: "error.dark",
                  }}
                />
                <Box
                  sx={{
                    width: 24,
                    height: 3,
                    backgroundColor: "success.dark",
                  }}
                />
              </Box>

              <Box sx={{ width: "100%" }}>
                <Typography
                  variant="overline"
                  sx={{
                    color: "error.light",
                    fontWeight: 800,
                    letterSpacing: "0.12em",
                  }}
                >
                  KVÄLLENS VINNARE
                </Typography>

                <Typography
                  variant="h2"
                  component="div"
                  sx={{
                    mt: 0.45,
                    fontWeight: 900,
                    letterSpacing: "-0.035em",
                    fontSize: { xs: "2.6rem", sm: "3.4rem" },
                    lineHeight: 1,
                  }}
                >
                  Lag {winnerTeam.teamNumber}
                </Typography>

                <Typography
                  sx={{
                    mt: 1.35,
                    fontSize: { xs: "1.15rem", sm: "1.3rem" },
                    fontWeight: 800,
                  }}
                >
                  {winnerTeam.players.map((player) => player.name).join(" + ")}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    mt: 0.5,
                  }}
                >
                  Vinnare av {data.tournament.name}
                </Typography>
              </Box>

              <Box
                sx={{
                  width: "100%",
                  maxWidth: 360,
                  mx: "auto",
                  py: { xs: 2, sm: 2.25 },
                  px: 2,
                  borderTop: "1px solid rgba(255,255,255,0.11)",
                  borderBottom: "1px solid rgba(255,255,255,0.11)",
                  textAlign: "center",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    color: "text.secondary",
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                  }}
                >
                  FINALRESULTAT
                </Typography>

                <Typography
                  variant="h2"
                  sx={{
                    mt: 0.6,
                    fontWeight: 900,
                    fontSize: { xs: "2.8rem", sm: "3.35rem" },
                    letterSpacing: "-0.035em",
                    lineHeight: 1,
                  }}
                >
                  {finishedFinal.teamALegs} - {finishedFinal.teamBLegs}
                </Typography>
              </Box>

              <Typography
                variant="body2"
                sx={{
                  maxWidth: 390,
                  color: "rgba(255,255,255,0.62)",
                  lineHeight: 1.6,
                }}
              >
                Turneringen är avgjord. Grattis till kvällens vinnare!
              </Typography>
            </Stack>
          </DialogContent>

          <DialogActions
            sx={{
              px: { xs: 2.5, sm: 4.5 },
              pb: { xs: 3, sm: 4 },
              pt: 0.5,
              gap: 1,
              flexDirection: { xs: "column-reverse", sm: "row" },
              justifyContent: "center",
            }}
          >
            <Button
              type="button"
              variant="outlined"
              onClick={() => router.push("/")}
              sx={{
                width: { xs: "100%", sm: "auto" },
                minWidth: 170,
              }}
            >
              Till startsidan
            </Button>

            <Button
              type="button"
              variant="contained"
              onClick={() => router.push("/tournaments/new")}
              sx={{
                width: { xs: "100%", sm: "auto" },
                minWidth: 170,
              }}
            >
              Skapa ny cup
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Container>
  );
}
