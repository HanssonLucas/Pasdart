import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { tournaments } from "@/db/schema";

export async function GET() {
  const finishedTournaments = await db
    .select({
      publicId: tournaments.publicId,
      name: tournaments.name,
      finishedAt: tournaments.finishedAt,
    })
    .from(tournaments)
    .where(eq(tournaments.status, "finished"))
    .orderBy(desc(tournaments.finishedAt), desc(tournaments.id));

  return NextResponse.json({
    tournaments: finishedTournaments,
  });
}
