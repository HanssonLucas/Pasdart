import { and, desc, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { matches, players, teamPlayers, teams, tournaments } from "@/db/schema";
import { getTeamDisplayName } from "@/lib/tournaments/getTeamDisplayName";

export async function GET() {
  const finishedTournaments = await db
    .select({
      id: tournaments.id,
      publicId: tournaments.publicId,
      name: tournaments.name,
      finishedAt: tournaments.finishedAt,
    })
    .from(tournaments)
    .where(eq(tournaments.status, "finished"))
    .orderBy(desc(tournaments.finishedAt), desc(tournaments.id));

  if (finishedTournaments.length === 0) {
    return NextResponse.json({ tournaments: [] });
  }

  const tournamentIds = finishedTournaments.map((tournament) => tournament.id);

  const winners = await db
    .select({
      tournamentId: matches.tournamentId,
      winnerTeamId: matches.winnerTeamId,
      teamNumber: teams.teamNumber,
      playerName: players.name,
    })
    .from(matches)
    .innerJoin(teams, eq(matches.winnerTeamId, teams.id))
    .leftJoin(teamPlayers, eq(teamPlayers.teamId, teams.id))
    .leftJoin(players, eq(teamPlayers.playerId, players.id))
    .where(
      and(
        inArray(matches.tournamentId, tournamentIds),
        eq(matches.stage, "final"),
        eq(matches.status, "finished"),
      ),
    )
    .orderBy(teamPlayers.id);

  const winnerNames = new Map<number, string[]>();
  const winnerTeamNumbers = new Map<number, number>();

  for (const winner of winners) {
    if (!winner.winnerTeamId || winner.playerName === null) {
      continue;
    }

    const names = winnerNames.get(winner.tournamentId) ?? [];
    names.push(winner.playerName);

    winnerNames.set(winner.tournamentId, names);
    winnerTeamNumbers.set(winner.tournamentId, winner.teamNumber);
  }

  return NextResponse.json({
    tournaments: finishedTournaments.map((tournament) => {
      const names = winnerNames.get(tournament.id) ?? [];

      return {
        publicId: tournament.publicId,
        name: tournament.name,
        finishedAt: tournament.finishedAt,
        winnerTeamNumber: winnerTeamNumbers.get(tournament.id) ?? null,
        winnerTeamName: names.length > 0 ? getTeamDisplayName(names) : null,
      };
    }),
  });
}
