import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { matches, tournaments } from "@/db/schema";

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
    })
    .from(tournaments)
    .where(eq(tournaments.publicId, publicId));

  if (!tournament) {
    return NextResponse.json(
      { error: "Cupen hittades inte." },
      { status: 404 },
    );
  }

  const semifinalMatches = await db
    .select({
      id: matches.id,
      winnerTeamId: matches.winnerTeamId,
      status: matches.status,
    })
    .from(matches)
    .where(
      and(
        eq(matches.tournamentId, tournament.id),
        eq(matches.stage, "semifinal"),
      ),
    );

  if (semifinalMatches.length !== 2) {
    return NextResponse.json(
      { error: "Två semifinaler krävs innan finalen kan skapas." },
      { status: 400 },
    );
  }

  const semifinalsFinished = semifinalMatches.every(
    (match) => match.status === "finished" && match.winnerTeamId !== null,
  );

  if (!semifinalsFinished) {
    return NextResponse.json(
      { error: "Båda semifinalerna måste vara färdigspelade." },
      { status: 400 },
    );
  }

  const existingFinal = await db
    .select({
      id: matches.id,
    })
    .from(matches)
    .where(
      and(eq(matches.tournamentId, tournament.id), eq(matches.stage, "final")),
    );

  if (existingFinal.length > 0) {
    return NextResponse.json(
      { error: "Finalen har redan skapats." },
      { status: 409 },
    );
  }

  const semifinal1 = semifinalMatches[0];
  const semifinal2 = semifinalMatches[1];

  if (semifinal1.winnerTeamId === null || semifinal2.winnerTeamId === null) {
    return NextResponse.json(
      { error: "Semifinalvinnarna kunde inte hittas." },
      { status: 400 },
    );
  }

  await db.insert(matches).values({
    tournamentId: tournament.id,
    stage: "final",
    roundNumber: 2,
    boardNumber: 1,
    matchNumber: 1,
    teamAId: semifinal1.winnerTeamId,
    teamBId: semifinal2.winnerTeamId,
    status: "scheduled",
  });

  return NextResponse.json(
    {
      success: true,
    },
    { status: 201 },
  );
}
