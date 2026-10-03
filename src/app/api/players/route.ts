import { NextResponse } from "next/server";

import { db } from "@/db";
import { players } from "@/db/schema";

export async function GET() {
  const allPlayers = await db.select().from(players);

  return NextResponse.json(allPlayers);
}

export async function POST(request: Request) {
  const body = await request.json();
  const name = body.name?.trim();

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const [newPlayer] = await db.insert(players).values({ name }).returning();

  return NextResponse.json(newPlayer, { status: 201 });
}
