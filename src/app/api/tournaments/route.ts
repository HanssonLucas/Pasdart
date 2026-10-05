import { NextResponse } from "next/server";

import { db } from "@/db";
import { tournamentPlayers, tournaments } from "@/db/schema";

export async function POST(request: Request) {
  const body = await request.json();

  const {
    name,
    gameType,
    teamMode,
    roundRobinType,
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
