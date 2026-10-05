import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { matches, players, teamPlayers, teams, tournaments } from "@/db/schema";

export async function GET(
  request: Request,
  context: {
    params: Promise<{ publicId: string }>;
  },
) {
  const { publicId } = await context.params;

  const [tournament] = await db
    .select({
      id: tournaments.id,
      name: tournaments.name,
      status: tournaments.status,
      gameType: tournaments.gameType,

      groupMatchMode: tournaments.groupMatchMode,
      groupLegCount: tournaments.groupLegCount,
      groupBestOf: tournaments.groupBestOf,

      playoffBestOf: tournaments.playoffBestOf,
      groupMaxDarts: tournaments.groupMaxDarts,
      playoffMaxDarts: tournaments.playoffMaxDarts,
      tiebreakMethod: tournaments.tiebreakMethod,
      playoffQualifiers: tournaments.playoffQualifiers,
      adminToken: tournaments.adminToken,
    })
    .from(tournaments)
    .where(eq(tournaments.publicId, publicId));

  if (!tournament) {
    return NextResponse.json(
      { error: "Cupen hittades inte." },
      { status: 404 },
    );
  }

  const requestAdminToken = request.headers.get("x-admin-token");

  const isAdmin =
    requestAdminToken !== null && requestAdminToken === tournament.adminToken;

  const publicTournament = {
    id: tournament.id,
    name: tournament.name,
    status: tournament.status,
    gameType: tournament.gameType,
    groupBestOf: tournament.groupBestOf,
    playoffBestOf: tournament.playoffBestOf,
    groupMaxDarts: tournament.groupMaxDarts,
    playoffMaxDarts: tournament.playoffMaxDarts,
    tiebreakMethod: tournament.tiebreakMethod,
    playoffQualifiers: tournament.playoffQualifiers,
  };

  const tournamentTeams = await db
    .select({
      id: teams.id,
      teamNumber: teams.teamNumber,
      seed: teams.seed,
    })
    .from(teams)
    .where(eq(teams.tournamentId, tournament.id));

  const teamMembers = await db
    .select({
      teamId: teamPlayers.teamId,
      playerId: players.id,
      playerName: players.name,
    })
    .from(teamPlayers)
    .innerJoin(players, eq(teamPlayers.playerId, players.id));

  const tournamentMatches = await db
    .select({
      id: matches.id,
      stage: matches.stage,
      roundNumber: matches.roundNumber,
      boardNumber: matches.boardNumber,
      matchNumber: matches.matchNumber,
      teamAId: matches.teamAId,
      teamBId: matches.teamBId,
      teamALegs: matches.teamALegs,
      teamBLegs: matches.teamBLegs,
      winnerTeamId: matches.winnerTeamId,
      status: matches.status,
    })
    .from(matches)
    .where(eq(matches.tournamentId, tournament.id));

  const groupMatches = tournamentMatches.filter(
    (match) => match.stage === "group",
  );

  const groupStageComplete =
    groupMatches.length > 0 &&
    groupMatches.every((match) => match.status === "finished");

  const teamsWithPlayers = tournamentTeams.map((team) => ({
    ...team,
    players: teamMembers
      .filter((member) => member.teamId === team.id)
      .map((member) => ({
        id: member.playerId,
        name: member.playerName,
      })),
  }));

  const standings = teamsWithPlayers
    .map((team) => {
      const teamMatches = groupMatches.filter(
        (match) =>
          match.status === "finished" &&
          (match.teamAId === team.id || match.teamBId === team.id),
      );

      let wins = 0;
      let losses = 0;
      let legsWon = 0;
      let legsLost = 0;

      for (const match of teamMatches) {
        const isTeamA = match.teamAId === team.id;

        const teamLegs = isTeamA ? match.teamALegs : match.teamBLegs;

        const opponentLegs = isTeamA ? match.teamBLegs : match.teamALegs;

        legsWon += teamLegs;
        legsLost += opponentLegs;

        if (match.winnerTeamId === team.id) {
          wins += 1;
        } else {
          losses += 1;
        }
      }

      return {
        teamId: team.id,
        teamNumber: team.teamNumber,
        players: team.players,
        played: teamMatches.length,
        wins,
        losses,
        legsWon,
        legsLost,
        legDifference: legsWon - legsLost,
      };
    })
    .sort((a, b) => {
      if (b.wins !== a.wins) {
        return b.wins - a.wins;
      }

      return b.legDifference - a.legDifference;
    });

  const castoffGroups: Array<{
    wins: number;
    teams: typeof standings;
  }> = [];

  if (groupStageComplete && tournament.tiebreakMethod === "castoff") {
    const relevantStandings = standings.filter(
      (_, index) => index < tournament.playoffQualifiers,
    );

    const winsInPlayoffs = new Set(
      relevantStandings.map((standing) => standing.wins),
    );

    for (const wins of winsInPlayoffs) {
      const tiedTeams = standings.filter((standing) => standing.wins === wins);

      const castoffAlreadyCompleted = tiedTeams.every((standing) => {
        const team = tournamentTeams.find(
          (tournamentTeam) => tournamentTeam.id === standing.teamId,
        );

        return team?.seed !== null && team?.seed !== undefined;
      });

      if (tiedTeams.length > 1 && !castoffAlreadyCompleted) {
        castoffGroups.push({
          wins,
          teams: tiedTeams,
        });
      }
    }
  }

  const requiresCastoff = castoffGroups.length > 0;

  return NextResponse.json({
    tournament: publicTournament,
    teams: teamsWithPlayers,
    matches: tournamentMatches,
    standings,
    groupStageComplete,
    requiresCastoff,
    castoffGroups,
    isAdmin,
  });
}
