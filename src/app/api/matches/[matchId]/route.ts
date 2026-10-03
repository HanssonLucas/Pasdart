import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { matches, tournaments } from "@/db/schema";

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{ matchId: string }>;
  },
) {
  const { matchId } = await context.params;
  const body = await request.json();

  const parsedMatchId = Number(matchId);
  const teamALegs = Number(body.teamALegs);
  const teamBLegs = Number(body.teamBLegs);

  if (
    !Number.isInteger(parsedMatchId) ||
    !Number.isInteger(teamALegs) ||
    !Number.isInteger(teamBLegs) ||
    teamALegs < 0 ||
    teamBLegs < 0
  ) {
    return NextResponse.json(
      { error: "Ogiltigt matchresultat." },
      { status: 400 },
    );
  }

  const [match] = await db
    .select({
      id: matches.id,
      tournamentId: matches.tournamentId,
      stage: matches.stage,
      teamAId: matches.teamAId,
      teamBId: matches.teamBId,
    })
    .from(matches)
    .where(eq(matches.id, parsedMatchId));

  if (!match) {
    return NextResponse.json(
      { error: "Matchen hittades inte." },
      { status: 404 },
    );
  }

  const [tournament] = await db
    .select({
      groupBestOf: tournaments.groupBestOf,
      playoffBestOf: tournaments.playoffBestOf,
    })
    .from(tournaments)
    .where(eq(tournaments.id, match.tournamentId));

  if (!tournament) {
    return NextResponse.json(
      { error: "Cupen hittades inte." },
      { status: 404 },
    );
  }

  const bestOf =
    match.stage === "group" ? tournament.groupBestOf : tournament.playoffBestOf;

  const legsNeededToWin = Math.floor(bestOf / 2) + 1;

  const teamAWon = teamALegs === legsNeededToWin && teamBLegs < legsNeededToWin;

  const teamBWon = teamBLegs === legsNeededToWin && teamALegs < legsNeededToWin;

  if (!teamAWon && !teamBWon) {
    return NextResponse.json(
      {
        error: `En match bäst av ${bestOf} kräver ${legsNeededToWin} vunna legs.`,
      },
      { status: 400 },
    );
  }

  const winnerTeamId = teamAWon ? match.teamAId : match.teamBId;

  const [updatedMatch] = await db
    .update(matches)
    .set({
      teamALegs,
      teamBLegs,
      winnerTeamId,
      status: "finished",
      updatedAt: new Date(),
    })
    .where(eq(matches.id, match.id))
    .returning();

  return NextResponse.json(updatedMatch);
}
