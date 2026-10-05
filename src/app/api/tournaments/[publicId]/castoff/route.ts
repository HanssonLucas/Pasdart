import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { teams, tournaments } from "@/db/schema";

type CastoffOrder = {
  teamId: number;
  seed: number;
};

export async function POST(
  request: Request,
  context: {
    params: Promise<{ publicId: string }>;
  },
) {
  const { publicId } = await context.params;
  const body = await request.json();

  const order = body.order as CastoffOrder[] | undefined;

  if (
    !Array.isArray(order) ||
    order.length === 0 ||
    order.some(
      (item) =>
        !Number.isInteger(item.teamId) ||
        !Number.isInteger(item.seed) ||
        item.seed < 1,
    )
  ) {
    return NextResponse.json(
      { error: "Ogiltig castoff-ordning." },
      { status: 400 },
    );
  }

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
      { error: "Du saknar behörighet att ändra castoff." },
      { status: 403 },
    );
  }

  for (const item of order) {
    const [updatedTeam] = await db
      .update(teams)
      .set({
        seed: item.seed,
      })
      .where(
        and(eq(teams.id, item.teamId), eq(teams.tournamentId, tournament.id)),
      )
      .returning({
        id: teams.id,
      });

    if (!updatedTeam) {
      return NextResponse.json(
        { error: "Ett av lagen kunde inte uppdateras." },
        { status: 400 },
      );
    }
  }

  const savedTeams = await db
    .select({
      id: teams.id,
      teamNumber: teams.teamNumber,
      seed: teams.seed,
    })
    .from(teams)
    .where(eq(teams.tournamentId, tournament.id));

  return NextResponse.json({
    success: true,
    teams: savedTeams,
  });
}
