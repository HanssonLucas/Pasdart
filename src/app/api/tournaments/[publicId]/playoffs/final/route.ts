import { and, eq } from "drizzle-orm";
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
    })
    .from(tournaments)
    .where(eq(tournaments.publicId, publicId));

  if (!tournament) {
    return NextResponse.json(
      { error: "Cupen hittades inte." },
      { status: 404 },
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

  if (semifinalMatches.length !== 1 && semifinalMatches.length !== 2) {
    return NextResponse.json(
      {
        error: "En eller två semifinaler krävs innan finalen kan skapas.",
      },
      { status: 400 },
    );
  }

  const semifinalsFinished = semifinalMatches.every(
    (match) => match.status === "finished" && match.winnerTeamId !== null,
  );

  if (!semifinalsFinished) {
    return NextResponse.json(
      { error: "Semifinalerna måste vara färdigspelade." },
      { status: 400 },
    );
  }

  let teamAId: number;
  let teamBId: number;

  if (semifinalMatches.length === 1) {
    const [seed1Team] = await db
      .select({
        id: teams.id,
      })
      .from(teams)
      .where(and(eq(teams.tournamentId, tournament.id), eq(teams.seed, 1)));

    const semifinalWinner = semifinalMatches[0].winnerTeamId;

    if (!seed1Team || semifinalWinner === null) {
      return NextResponse.json(
        { error: "Finalisterna kunde inte hittas." },
        { status: 400 },
      );
    }

    teamAId = seed1Team.id;
    teamBId = semifinalWinner;
  } else {
    const semifinal1Winner = semifinalMatches[0].winnerTeamId;
    const semifinal2Winner = semifinalMatches[1].winnerTeamId;

    if (semifinal1Winner === null || semifinal2Winner === null) {
      return NextResponse.json(
        { error: "Semifinalvinnarna kunde inte hittas." },
        { status: 400 },
      );
    }

    teamAId = semifinal1Winner;
    teamBId = semifinal2Winner;
  }

  await db.insert(matches).values({
    tournamentId: tournament.id,
    stage: "final",
    roundNumber: 2,
    boardNumber: 1,
    matchNumber: 1,
    teamAId,
    teamBId,
    status: "scheduled",
  });

  return NextResponse.json(
    {
      success: true,
    },
    { status: 201 },
  );
}
