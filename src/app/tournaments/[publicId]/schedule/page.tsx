"use client";

import { useEffect, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
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
};

export default function SchedulePage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const [data, setData] = useState<TournamentResponse | null>(null);

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(true);

  const [castoffOrders, setCastoffOrders] = useState<Record<number, number[]>>(
    {},
  );

  const [savingCastoff, setSavingCastoff] = useState(false);

  const [startingPlayoffs, setStartingPlayoffs] = useState(false);

  const [creatingFinal, setCreatingFinal] = useState(false);

  function applyTournamentData(result: TournamentResponse) {
    setData(result);

    const newCastoffOrders: Record<number, number[]> = {};

    result.castoffGroups.forEach((group) => {
      newCastoffOrders[group.wins] = group.teams.map((team) => team.teamId);
    });

    setCastoffOrders(newCastoffOrders);
  }

  useEffect(() => {
    let cancelled = false;

    async function loadSchedule() {
      try {
        const { publicId } = await params;

        const response = await fetch(`/api/tournaments/${publicId}/matches`);

        if (!response.ok) {
          throw new Error();
        }

        const result: TournamentResponse = await response.json();

        if (!cancelled) {
          applyTournamentData(result);
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

  if (loading) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ py: 4 }}>
          <Typography>Hämtar spelschema...</Typography>
        </Box>
      </Container>
    );
  }

  if (error || !data) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ py: 4 }}>
          <Alert severity="error">
            {error || "Spelschemat kunde inte hittas."}
          </Alert>
        </Box>
      </Container>
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

    setError("");

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

      const response = await fetch(`/api/tournaments/${publicId}/castoff`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
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

      const updatedResponse = await fetch(
        `/api/tournaments/${publicId}/matches`,
      );

      if (!updatedResponse.ok) {
        throw new Error();
      }

      const updatedData: TournamentResponse = await updatedResponse.json();

      applyTournamentData(updatedData);
    } catch {
      setError("Kunde inte spara castoff-resultatet.");
    } finally {
      setSavingCastoff(false);
    }
  }

  async function handleStartPlayoffs() {
    if (!data) {
      return;
    }

    setStartingPlayoffs(true);

    setError("");

    try {
      const { publicId } = await params;

      const response = await fetch(`/api/tournaments/${publicId}/playoffs`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error();
      }

      const updatedResponse = await fetch(
        `/api/tournaments/${publicId}/matches`,
      );

      if (!updatedResponse.ok) {
        throw new Error();
      }

      const updatedData: TournamentResponse = await updatedResponse.json();

      applyTournamentData(updatedData);
    } catch {
      setError("Kunde inte starta slutspelet.");
    } finally {
      setStartingPlayoffs(false);
    }
  }

  async function handleCreateFinal() {
    setCreatingFinal(true);

    setError("");

    try {
      const { publicId } = await params;

      const response = await fetch(
        `/api/tournaments/${publicId}/playoffs/final`,

        {
          method: "POST",
        },
      );

      if (!response.ok) {
        throw new Error();
      }

      const updatedResponse = await fetch(
        `/api/tournaments/${publicId}/matches`,
      );

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

  async function handleResult(
    matchId: number,

    teamALegs: number,

    teamBLegs: number,
  ) {
    try {
      const response = await fetch(`/api/matches/${matchId}`, {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          teamALegs,

          teamBLegs,
        }),
      });

      if (!response.ok) {
        throw new Error();
      }

      const { publicId } = await params;

      const updatedResponse = await fetch(
        `/api/tournaments/${publicId}/matches`,
      );

      if (!updatedResponse.ok) {
        throw new Error();
      }

      const updatedData: TournamentResponse = await updatedResponse.json();

      applyTournamentData(updatedData);
    } catch {
      setError("Kunde inte spara matchresultatet.");
    }
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
              {data.tournament.name}
            </Typography>

            <Typography sx={{ color: "text.secondary", mt: 0.5 }}>
              {playoffsStarted ? (
                <>
                  {data.tournament.gameType} · Slutspel · Bäst av{" "}
                  {data.tournament.playoffBestOf}
                  {data.tournament.playoffMaxDarts
                    ? ` · Max ${data.tournament.playoffMaxDarts} darts`
                    : ""}
                </>
              ) : (
                <>
                  {data.tournament.gameType} · Gruppspel · Bäst av{" "}
                  {data.tournament.groupBestOf}
                  {data.tournament.groupMaxDarts
                    ? ` · Max ${data.tournament.groupMaxDarts} darts`
                    : ""}
                </>
              )}
            </Typography>
          </Box>

          {playoffsStarted && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Stack
                sx={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 2,
                  flexWrap: "wrap",
                }}
              >
                <Stack
                  sx={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Chip label="SLUTSPEL" size="small" />

                  <Typography sx={{ fontWeight: 700 }}>
                    {data.tournament.status === "finished"
                      ? "Turneringen är avslutad"
                      : finalCreated
                        ? "Final"
                        : semifinalMatches.length === 1
                          ? "1 semifinal"
                          : `${semifinalMatches.length} semifinaler`}
                  </Typography>
                </Stack>

                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {finalCreated
                    ? "Finalen är skapad"
                    : semifinalMatches.length > 0
                      ? "Final väntar"
                      : "Slutspelet är igång"}
                </Typography>
              </Stack>
            </Paper>
          )}

          {!playoffsStarted && (
            <Paper
              elevation={0}
              sx={{
                p: 2.5,

                border: "1px solid",

                borderColor: "divider",
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                Tabell
              </Typography>

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>#</TableCell>

                      <TableCell>Lag</TableCell>

                      <TableCell align="center">M</TableCell>

                      <TableCell align="center">V</TableCell>

                      <TableCell align="center">F</TableCell>

                      <TableCell align="center">Legs</TableCell>

                      <TableCell align="center">+/-</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {data.standings.map((standing, index) => (
                      <TableRow key={standing.teamId}>
                        <TableCell>{index + 1}</TableCell>

                        <TableCell>
                          <Typography sx={{ fontWeight: 600 }}>
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
                        </TableCell>

                        <TableCell align="center">{standing.played}</TableCell>

                        <TableCell align="center">{standing.wins}</TableCell>

                        <TableCell align="center">{standing.losses}</TableCell>

                        <TableCell align="center">
                          {standing.legsWon}-{standing.legsLost}
                        </TableCell>

                        <TableCell align="center">
                          {standing.legDifference > 0
                            ? `+${standing.legDifference}`
                            : standing.legDifference}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}

          {data.groupStageComplete && !playoffsStarted && (
            <Paper
              elevation={0}
              sx={{
                p: 2.5,

                border: "1px solid",

                borderColor: "divider",
              }}
            >
              {data.requiresCastoff ? (
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      Castoff krävs
                    </Typography>

                    <Typography sx={{ color: "text.secondary", mt: 0.5 }}>
                      Ett eller flera lag har samma antal vinster. Ordna lagen
                      efter resultatet från castoffen.
                    </Typography>
                  </Box>

                  {data.castoffGroups.map((group) => {
                    const order = castoffOrders[group.wins] ?? [];

                    return (
                      <Stack key={group.wins} spacing={1.5}>
                        <Typography sx={{ fontWeight: 600 }}>
                          {group.wins} {group.wins === 1 ? "vinst" : "vinster"}
                        </Typography>

                        {order.map((teamId, index) => {
                          const standing = group.teams.find(
                            (team) => team.teamId === teamId,
                          );

                          if (!standing) {
                            return null;
                          }

                          return (
                            <Paper
                              key={teamId}
                              elevation={0}
                              sx={{
                                p: 2,

                                border: "1px solid",

                                borderColor: "divider",
                              }}
                            >
                              <Stack spacing={1.5}>
                                <Box>
                                  <Typography sx={{ fontWeight: 700 }}>
                                    {index + 1}. Lag {standing.teamNumber}
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

                                <Stack
                                  sx={{
                                    flexDirection: "row",

                                    gap: 1,
                                  }}
                                >
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    disabled={index === 0}
                                    onClick={() =>
                                      moveCastoffTeam(group.wins, teamId, "up")
                                    }
                                  >
                                    Flytta upp
                                  </Button>

                                  <Button
                                    variant="outlined"
                                    size="small"
                                    disabled={index === order.length - 1}
                                    onClick={() =>
                                      moveCastoffTeam(
                                        group.wins,

                                        teamId,

                                        "down",
                                      )
                                    }
                                  >
                                    Flytta ner
                                  </Button>
                                </Stack>
                              </Stack>
                            </Paper>
                          );
                        })}
                      </Stack>
                    );
                  })}

                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={handleConfirmCastoff}
                    disabled={savingCastoff}
                  >
                    {savingCastoff ? "Sparar castoff..." : "Bekräfta castoff"}
                  </Button>
                </Stack>
              ) : (
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      Gruppspelet är klart
                    </Typography>

                    <Typography sx={{ color: "text.secondary", mt: 0.5 }}>
                      Alla gruppmatcher är färdigspelade.
                    </Typography>
                  </Box>

                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={handleStartPlayoffs}
                    disabled={startingPlayoffs}
                  >
                    {startingPlayoffs
                      ? "Startar slutspel..."
                      : "Fortsätt till slutspel"}
                  </Button>
                </Stack>
              )}
            </Paper>
          )}

          {!playoffsStarted &&
            roundNumbers.map((roundNumber) => (
              <Stack key={roundNumber} spacing={2}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Omgång {roundNumber}
                </Typography>

                {groupMatches

                  .filter((match) => match.roundNumber === roundNumber)

                  .map((match) => {
                    const teamA = getTeam(match.teamAId);

                    const teamB = getTeam(match.teamBId);

                    return (
                      <Paper
                        key={match.id}
                        elevation={0}
                        sx={{
                          p: 2.5,

                          border: "1px solid",

                          borderColor: "divider",
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
                            <Chip
                              label={`Tavla ${match.boardNumber}`}
                              size="small"
                            />

                            <Typography
                              variant="body2"
                              sx={{ color: "text.secondary" }}
                            >
                              Match {match.matchNumber}
                            </Typography>
                          </Stack>

                          <Box>
                            <Typography sx={{ fontWeight: 700 }}>
                              Lag {teamA?.teamNumber}
                            </Typography>

                            <Typography sx={{ color: "text.secondary" }}>
                              {teamA?.players

                                .map((player) => player.name)

                                .join(" + ")}
                            </Typography>
                          </Box>

                          <Typography
                            sx={{
                              textAlign: "center",

                              color: "text.secondary",

                              fontWeight: 700,
                            }}
                          >
                            VS
                          </Typography>

                          <Box>
                            <Typography sx={{ fontWeight: 700 }}>
                              Lag {teamB?.teamNumber}
                            </Typography>

                            <Typography sx={{ color: "text.secondary" }}>
                              {teamB?.players

                                .map((player) => player.name)

                                .join(" + ")}
                            </Typography>
                          </Box>

                          {match.status === "finished" ? (
                            <Box
                              sx={{
                                textAlign: "center",

                                pt: 1,
                              }}
                            >
                              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                {match.teamALegs} - {match.teamBLegs}
                              </Typography>

                              <Typography
                                sx={{
                                  color: "text.secondary",

                                  mt: 0.5,
                                }}
                              >
                                Match avslutad
                              </Typography>
                            </Box>
                          ) : (
                            <Box>
                              <Typography
                                sx={{
                                  fontWeight: 600,

                                  mb: 1,
                                }}
                              >
                                Registrera resultat
                              </Typography>

                              <Stack
                                sx={{
                                  flexDirection: "row",

                                  flexWrap: "wrap",

                                  gap: 1,
                                }}
                              >
                                {getPossibleResults(
                                  data.tournament.groupBestOf,
                                ).map(([teamALegs, teamBLegs]) => (
                                  <Button
                                    key={`${teamALegs}-${teamBLegs}`}
                                    variant="outlined"
                                    onClick={() =>
                                      handleResult(
                                        match.id,

                                        teamALegs,

                                        teamBLegs,
                                      )
                                    }
                                  >
                                    {teamALegs} - {teamBLegs}
                                  </Button>
                                ))}
                              </Stack>
                            </Box>
                          )}
                        </Stack>
                      </Paper>
                    );
                  })}
              </Stack>
            ))}

          {playoffsStarted && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md:
                    semifinalMatches.length > 0
                      ? "minmax(0, 1fr) 48px minmax(0, 1fr)"
                      : "minmax(0, 1fr)",
                },
                gap: { xs: 3, md: 2 },
                alignItems: "center",
              }}
            >
              {semifinalMatches.length > 0 && (
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      Semifinaler
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary", mt: 0.5 }}
                    >
                      Vinnarna går vidare till final.
                    </Typography>
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
                          p: 2.5,
                          border: "1px solid",
                          borderColor: "divider",
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
                            <Chip
                              label={`Tavla ${match.boardNumber}`}
                              size="small"
                            />

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
                            <Box>
                              <Typography
                                sx={{
                                  fontWeight: 600,
                                  mb: 1,
                                }}
                              >
                                Registrera resultat
                              </Typography>

                              <Stack
                                sx={{
                                  flexDirection: "row",
                                  flexWrap: "wrap",
                                  gap: 1,
                                }}
                              >
                                {getPossibleResults(
                                  data.tournament.playoffBestOf,
                                ).map(([teamALegs, teamBLegs]) => (
                                  <Button
                                    key={`${teamALegs}-${teamBLegs}`}
                                    variant="outlined"
                                    onClick={() =>
                                      handleResult(
                                        match.id,
                                        teamALegs,
                                        teamBLegs,
                                      )
                                    }
                                  >
                                    {teamALegs} - {teamBLegs}
                                  </Button>
                                ))}
                              </Stack>
                            </Box>
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
                      color: "text.secondary",
                      fontSize: 32,
                      lineHeight: 1,
                    }}
                  >
                    →
                  </Typography>
                </Box>
              )}

              <Stack spacing={2}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    Final
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{ color: "text.secondary", mt: 0.5 }}
                  >
                    {finalCreated
                      ? "Vinnaren tar hem turneringen."
                      : semifinalMatches.length > 0
                        ? "Finalen skapas när semifinalerna är avgjorda."
                        : "Vinnaren tar hem turneringen."}
                  </Typography>
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
                          p: 2.5,
                          border: "1px solid",
                          borderColor: "divider",
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
                            <Chip
                              label={`Tavla ${match.boardNumber}`}
                              size="small"
                            />

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
                            <Box>
                              <Typography
                                sx={{
                                  fontWeight: 600,
                                  mb: 1,
                                }}
                              >
                                Registrera resultat
                              </Typography>

                              <Stack
                                sx={{
                                  flexDirection: "row",
                                  flexWrap: "wrap",
                                  gap: 1,
                                }}
                              >
                                {getPossibleResults(
                                  data.tournament.playoffBestOf,
                                ).map(([teamALegs, teamBLegs]) => (
                                  <Button
                                    key={`${teamALegs}-${teamBLegs}`}
                                    variant="outlined"
                                    onClick={() =>
                                      handleResult(
                                        match.id,
                                        teamALegs,
                                        teamBLegs,
                                      )
                                    }
                                  >
                                    {teamALegs} - {teamBLegs}
                                  </Button>
                                ))}
                              </Stack>
                            </Box>
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
                      borderColor: "divider",
                      minHeight: 190,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
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

                      {semifinalsFinished && (
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

          {data.tournament.status === "finished" && winnerTeam && (
            <Paper
              elevation={0}
              sx={{
                p: 3,

                border: "1px solid",

                borderColor: "divider",

                textAlign: "center",
              }}
            >
              <Stack spacing={1}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  Turneringen är avslutad
                </Typography>

                <Typography variant="h5">
                  Vinnare: Lag {winnerTeam.teamNumber}
                </Typography>

                <Typography sx={{ color: "text.secondary" }}>
                  {winnerTeam.players.map((player) => player.name).join(" + ")}
                </Typography>
              </Stack>
            </Paper>
          )}
        </Stack>
      </Box>
    </Container>
  );
}
