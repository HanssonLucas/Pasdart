import { and, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import {
  matches,
  players,
  teamPlayers,
  teams,
  tournamentPlayers,
  tournaments,
} from "@/db/schema";
import { getTeamDisplayName } from "@/lib/tournaments/getTeamDisplayName";

export async function GET() {
  const [activeTournament] = await db
    .select({
      publicId: tournaments.publicId,
      name: tournaments.name,
      status: tournaments.status,
    })
    .from(tournaments)
    .where(eq(tournaments.isLive, true))
    .orderBy(desc(tournaments.id))
    .limit(1);

  const [latestTournament] = await db
    .select({
      id: tournaments.id,
      publicId: tournaments.publicId,
      name: tournaments.name,
      status: tournaments.status,
    })
    .from(tournaments)
    .where(eq(tournaments.status, "finished"))
    .orderBy(desc(tournaments.id))
    .limit(1);

  let winnerTeamNumber: number | null = null;
  let winnerTeamName: string | null = null;

  if (latestTournament) {
    const [finalMatch] = await db
      .select({
        winnerTeamId: matches.winnerTeamId,
      })
      .from(matches)
      .where(
        and(
          eq(matches.tournamentId, latestTournament.id),
          eq(matches.stage, "final"),
        ),
      )
      .orderBy(desc(matches.id))
      .limit(1);

    if (finalMatch?.winnerTeamId) {
      const [winnerTeam] = await db
        .select({
          teamNumber: teams.teamNumber,
        })
        .from(teams)
        .where(eq(teams.id, finalMatch.winnerTeamId))
        .limit(1);

      winnerTeamNumber = winnerTeam?.teamNumber ?? null;

      const winnerPlayers = await db
        .select({
          name: players.name,
        })
        .from(teamPlayers)
        .innerJoin(players, eq(teamPlayers.playerId, players.id))
        .where(eq(teamPlayers.teamId, finalMatch.winnerTeamId))
        .orderBy(teamPlayers.id);

      if (winnerPlayers.length > 0) {
        winnerTeamName = getTeamDisplayName(
          winnerPlayers.map((player) => player.name),
        );
      }
    }
  }

  return NextResponse.json({
    activeTournament: activeTournament ?? null,
    latestTournament: latestTournament
      ? {
          publicId: latestTournament.publicId,
          name: latestTournament.name,
          status: latestTournament.status,
          winnerTeamNumber,
          winnerTeamName,
        }
      : null,
  });
}

export async function POST(request: Request) {
  const body = await request.json();

  const {
    name,
    gameType,
    teamMode,
    roundRobinType,
    groupMatchMode,
    groupLegCount,
    groupBestOf,
    playoffBestOf,
    groupMaxDarts,
    playoffMaxDarts,
    boardCount,
    tiebreakMethod,
    playerIds,
  } = body;

  if (
    !name?.trim() ||
    !gameType ||
    !teamMode ||
    !roundRobinType ||
    !groupMatchMode ||
    !groupLegCount ||
    !groupBestOf ||
    !playoffBestOf ||
    !boardCount ||
    !tiebreakMethod ||
    !Array.isArray(playerIds) ||
    playerIds.length < 2
  ) {
    return NextResponse.json(
      { error: "Ogiltiga cupinställningar." },
      { status: 400 },
    );
  }

  const publicId = crypto.randomUUID();
  const adminToken = crypto.randomUUID();
  const viewerCode = String(
    crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000,
  ).padStart(6, "0");

  const [newTournament] = await db
    .insert(tournaments)
    .values({
      publicId,
      adminToken,
      viewerCode,
      name: name.trim(),
      gameType: Number(gameType),
      teamMode,
      roundRobinType,
      groupMatchMode,
      groupLegCount: Number(groupLegCount),
      groupBestOf: Number(groupBestOf),
      playoffBestOf: Number(playoffBestOf),
      groupMaxDarts: groupMaxDarts ? Number(groupMaxDarts) : null,
      playoffMaxDarts: playoffMaxDarts ? Number(playoffMaxDarts) : null,
      boardCount: Number(boardCount),
      tiebreakMethod,
      playoffQualifiers: 4,
    })
    .returning();

  await db.insert(tournamentPlayers).values(
    playerIds.map((playerId: number) => ({
      tournamentId: newTournament.id,
      playerId,
    })),
  );

  return NextResponse.json(
    {
      id: newTournament.id,
      publicId: newTournament.publicId,
      adminToken: newTournament.adminToken,
      viewerCode: newTournament.viewerCode,
    },
    { status: 201 },
  );
}
