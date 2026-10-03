import { and, eq, isNotNull, lte } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { matches, teams, tournaments } from "@/db/schema";

export async function POST(
  _request: Request,
  context: {
    params: Promise<{ publicId: string }>;
  },
) {
  const { publicId } = await context.params;

  const [tournament] = await db
    .select({
      id: tournaments.id,
      playoffQualifiers: tournaments.playoffQualifiers,
    })
    .from(tournaments)
    .where(eq(tournaments.publicId, publicId));

  if (!tournament) {
    return NextResponse.json(
      { error: "Cupen hittades inte." },
      { status: 404 },
    );
  }

  if (tournament.playoffQualifiers !== 4) {
    return NextResponse.json(
      { error: "Endast slutspel med topp 4 stöds just nu." },
      { status: 400 },
    );
  }

  const existingPlayoffMatches = await db
    .select({
      id: matches.id,
    })
    .from(matches)
    .where(
      and(
        eq(matches.tournamentId, tournament.id),
        eq(matches.stage, "semifinal"),
      ),
    );

  if (existingPlayoffMatches.length > 0) {
    return NextResponse.json(
      { error: "Slutspelet har redan skapats." },
      { status: 409 },
    );
  }

  const qualifiedTeams = await db
    .select({
      id: teams.id,
      seed: teams.seed,
    })
    .from(teams)
    .where(
      and(
        eq(teams.tournamentId, tournament.id),
        isNotNull(teams.seed),
        lte(teams.seed, 4),
      ),
    );

  if (qualifiedTeams.length !== 4) {
    return NextResponse.json(
      { error: "Fyra seedade lag krävs för att starta slutspelet." },
      { status: 400 },
    );
  }

  const teamBySeed = new Map(
    qualifiedTeams.map((team) => [team.seed, team.id]),
  );

  const seed1 = teamBySeed.get(1);
  const seed2 = teamBySeed.get(2);
  const seed3 = teamBySeed.get(3);
  const seed4 = teamBySeed.get(4);

  if (!seed1 || !seed2 || !seed3 || !seed4) {
    return NextResponse.json(
      { error: "Seedningen är ofullständig." },
      { status: 400 },
    );
  }

  await db.insert(matches).values([
    {
      tournamentId: tournament.id,
      stage: "semifinal",
      roundNumber: 1,
      boardNumber: 1,
      matchNumber: 1,
      teamAId: seed1,
      teamBId: seed4,
      status: "scheduled",
    },
    {
      tournamentId: tournament.id,
      stage: "semifinal",
      roundNumber: 1,
      boardNumber: 2,
      matchNumber: 2,
      teamAId: seed2,
      teamBId: seed3,
      status: "scheduled",
    },
  ]);

  await db
    .update(tournaments)
    .set({
      status: "playoffs",
      updatedAt: new Date(),
    })
    .where(eq(tournaments.id, tournament.id));

  return NextResponse.json(
    {
      success: true,
    },
    { status: 201 },
  );
}
