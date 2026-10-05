import { and, eq, isNotNull, lte } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { matches, teams, tournaments } from "@/db/schema";

export async function POST(
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

  const adminToken = request.headers.get("x-admin-token");

  if (!adminToken || adminToken !== tournament.adminToken) {
    return NextResponse.json(
      { error: "Du saknar behörighet att starta slutspelet." },
      { status: 403 },
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

  const tournamentTeams = await db
    .select({
      id: teams.id,
      seed: teams.seed,
    })
    .from(teams)
    .where(eq(teams.tournamentId, tournament.id));

  const hasAnySeeds = tournamentTeams.some((team) => team.seed !== null);

  if (!hasAnySeeds) {
    const groupMatches = await db
      .select({
        teamAId: matches.teamAId,
        teamBId: matches.teamBId,
        teamALegs: matches.teamALegs,
        teamBLegs: matches.teamBLegs,
        winnerTeamId: matches.winnerTeamId,
        status: matches.status,
      })
      .from(matches)
      .where(
        and(
          eq(matches.tournamentId, tournament.id),
          eq(matches.stage, "group"),
        ),
      );

    const unfinishedGroupMatch = groupMatches.some(
      (match) => match.status !== "finished",
    );

    if (unfinishedGroupMatch) {
      return NextResponse.json(
        { error: "Gruppspelet måste vara färdigspelat först." },
        { status: 400 },
      );
    }

    const standings = tournamentTeams.map((team) => {
      let wins = 0;
      let legsWon = 0;
      let legsLost = 0;

      for (const match of groupMatches) {
        if (match.teamAId !== team.id && match.teamBId !== team.id) {
          continue;
        }

        if (match.teamAId === team.id) {
          legsWon += match.teamALegs;
          legsLost += match.teamBLegs;
        } else {
          legsWon += match.teamBLegs;
          legsLost += match.teamALegs;
        }

        if (match.winnerTeamId === team.id) {
          wins += 1;
        }
      }

      return {
        teamId: team.id,
        wins,
        legDifference: legsWon - legsLost,
      };
    });

    standings.sort((a, b) => {
      if (b.wins !== a.wins) {
        return b.wins - a.wins;
      }

      return b.legDifference - a.legDifference;
    });

    for (let index = 0; index < standings.length; index += 1) {
      await db
        .update(teams)
        .set({
          seed: index + 1,
        })
        .where(eq(teams.id, standings[index].teamId));
    }
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

  if (qualifiedTeams.length === 2) {
    const teamBySeed = new Map(
      qualifiedTeams.map((team) => [team.seed, team.id]),
    );

    const seed1 = teamBySeed.get(1);
    const seed2 = teamBySeed.get(2);

    if (!seed1 || !seed2) {
      return NextResponse.json(
        { error: "Seedningen är ofullständig." },
        { status: 400 },
      );
    }

    const existingFinal = await db
      .select({
        id: matches.id,
      })
      .from(matches)
      .where(
        and(
          eq(matches.tournamentId, tournament.id),
          eq(matches.stage, "final"),
        ),
      );

    if (existingFinal.length > 0) {
      return NextResponse.json(
        { error: "Finalen har redan skapats." },
        { status: 409 },
      );
    }

    await db.insert(matches).values({
      tournamentId: tournament.id,
      stage: "final",
      roundNumber: 1,
      boardNumber: 1,
      matchNumber: 1,
      teamAId: seed1,
      teamBId: seed2,
      status: "scheduled",
    });

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

  if (qualifiedTeams.length === 3) {
    const teamBySeed = new Map(
      qualifiedTeams.map((team) => [team.seed, team.id]),
    );

    const seed1 = teamBySeed.get(1);
    const seed2 = teamBySeed.get(2);
    const seed3 = teamBySeed.get(3);

    if (!seed1 || !seed2 || !seed3) {
      return NextResponse.json(
        { error: "Seedningen är ofullständig." },
        { status: 400 },
      );
    }

    await db.insert(matches).values({
      tournamentId: tournament.id,
      stage: "semifinal",
      roundNumber: 1,
      boardNumber: 1,
      matchNumber: 1,
      teamAId: seed2,
      teamBId: seed3,
      status: "scheduled",
    });

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

  if (qualifiedTeams.length !== 4) {
    return NextResponse.json(
      {
        error: "Slutspelet kräver 2, 3 eller 4 seedade lag.",
      },
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
