import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { matches, players, teamPlayers, teams, tournaments } from "@/db/schema";

export async function GET(
  _request: Request,
  context: {
    params: Promise<{ publicId: string }>;
  },
) {
  const { publicId } = await context.params;

  const [tournament] = await db
    .select({
      id: tournaments.id,
      name: tournaments.name,
      gameType: tournaments.gameType,
      groupBestOf: tournaments.groupBestOf,
      groupMaxDarts: tournaments.groupMaxDarts,
    })
    .from(tournaments)
    .where(eq(tournaments.publicId, publicId));

  if (!tournament) {
    return NextResponse.json(
      { error: "Cupen hittades inte." },
      { status: 404 },
    );
  }

  const tournamentTeams = await db
    .select({
      id: teams.id,
      teamNumber: teams.teamNumber,
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

  const teamsWithPlayers = tournamentTeams.map((team) => ({
    ...team,
    players: teamMembers
      .filter((member) => member.teamId === team.id)
      .map((member) => ({
        id: member.playerId,
        name: member.playerName,
      })),
  }));

  return NextResponse.json({
    tournament,
    teams: teamsWithPlayers,
    matches: tournamentMatches,
  });
}
