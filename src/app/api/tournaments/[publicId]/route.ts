import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { players, tournamentPlayers, tournaments } from "@/db/schema";

export async function GET(
  _request: Request,
  context: {
    params: Promise<{ publicId: string }>;
  },
) {
  const { publicId } = await context.params;

  const [tournament] = await db
    .select()
    .from(tournaments)
    .where(eq(tournaments.publicId, publicId));

  if (!tournament) {
    return NextResponse.json(
      { error: "Cupen hittades inte." },
      { status: 404 },
    );
  }

  const tournamentPlayerRows = await db
    .select({
      id: players.id,
      name: players.name,
    })
    .from(tournamentPlayers)
    .innerJoin(players, eq(tournamentPlayers.playerId, players.id))
    .where(eq(tournamentPlayers.tournamentId, tournament.id));

  return NextResponse.json({
    id: tournament.id,
    publicId: tournament.publicId,
    teamMode: tournament.teamMode,
    players: tournamentPlayerRows,
  });
}

export async function DELETE(
  request: Request,
  context: {
    params: Promise<{ publicId: string }>;
  },
) {
  const { publicId } = await context.params;

  const [tournament] = await db
    .select({
      id: tournaments.id,
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

  const adminToken = request.headers.get("x-admin-token");

  if (!adminToken || adminToken !== tournament.adminToken) {
    return NextResponse.json(
      { error: "Du saknar behörighet att radera cupen." },
      { status: 403 },
    );
  }

  await db.delete(tournaments).where(eq(tournaments.id, tournament.id));

  return NextResponse.json({
    success: true,
  });
}
