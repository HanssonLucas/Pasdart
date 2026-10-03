import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { teamPlayers, teams, tournaments } from "@/db/schema";

type TeamInput = {
  number: number;
  playerIds: number[];
};

export async function POST(
  request: Request,
  context: {
    params: Promise<{ publicId: string }>;
  },
) {
  const { publicId } = await context.params;
  const body = await request.json();

  const submittedTeams = body.teams as TeamInput[] | undefined;

  if (
    !Array.isArray(submittedTeams) ||
    submittedTeams.length === 0 ||
    submittedTeams.some(
      (team) =>
        !Number.isInteger(team.number) ||
        !Array.isArray(team.playerIds) ||
        team.playerIds.length === 0,
    )
  ) {
    return NextResponse.json(
      { error: "Ogiltig lagindelning." },
      { status: 400 },
    );
  }

  const [tournament] = await db
    .select({
      id: tournaments.id,
    })
    .from(tournaments)
    .where(eq(tournaments.publicId, publicId));

  if (!tournament) {
    return NextResponse.json(
      { error: "Cupen hittades inte." },
      { status: 404 },
    );
  }

  const existingTeams = await db
    .select({
      id: teams.id,
    })
    .from(teams)
    .where(eq(teams.tournamentId, tournament.id));

  if (existingTeams.length > 0) {
    return NextResponse.json(
      { error: "Lagen har redan sparats." },
      { status: 409 },
    );
  }

  for (const submittedTeam of submittedTeams) {
    const [newTeam] = await db
      .insert(teams)
      .values({
        tournamentId: tournament.id,
        teamNumber: submittedTeam.number,
      })
      .returning({
        id: teams.id,
      });

    await db.insert(teamPlayers).values(
      submittedTeam.playerIds.map((playerId) => ({
        teamId: newTeam.id,
        playerId,
      })),
    );
  }

  return NextResponse.json(
    {
      success: true,
    },
    { status: 201 },
  );
}
