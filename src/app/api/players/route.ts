import { eq } from "drizzle-orm";
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

export async function PATCH(request: Request) {
  const body = await request.json();

  const id = Number(body.id);
  const name = body.name?.trim();

  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid player id" }, { status: 400 });
  }

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const [updatedPlayer] = await db
    .update(players)
    .set({ name })
    .where(eq(players.id, id))
    .returning();

  if (!updatedPlayer) {
    return NextResponse.json({ error: "Player not found" }, { status: 404 });
  }

  return NextResponse.json(updatedPlayer);
}
