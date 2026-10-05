import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { tournaments } from "@/db/schema";

export async function POST(request: Request) {
  const body = await request.json();

  const viewerCode =
    typeof body.viewerCode === "string"
      ? body.viewerCode.trim().toUpperCase()
      : "";

  if (!viewerCode) {
    return NextResponse.json({ error: "Ange en följkod." }, { status: 400 });
  }

  const [tournament] = await db
    .select({
      publicId: tournaments.publicId,
      name: tournaments.name,
      status: tournaments.status,
    })
    .from(tournaments)
    .where(eq(tournaments.viewerCode, viewerCode));

  if (!tournament) {
    return NextResponse.json(
      { error: "Ingen cup hittades med den följkoden." },
      { status: 404 },
    );
  }

  return NextResponse.json({
    publicId: tournament.publicId,
    name: tournament.name,
    status: tournament.status,
  });
}
