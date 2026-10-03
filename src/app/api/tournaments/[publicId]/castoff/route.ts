import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { teams, tournaments } from "@/db/schema";

type CastoffOrder = {
  teamId: number;
  seed: number;
};

export async function POST(
  request: Request,
  context: {
    params: Promise<{ publicId: string }>;
  },
) {
  const { publicId } = await context.params;
  const body = await request.json();

  const order = body.order as CastoffOrder[] | undefined;

  if (
    !Array.isArray(order) ||
    order.length === 0 ||
    order.some(
      (item) =>
        !Number.isInteger(item.teamId) ||
        !Number.isInteger(item.seed) ||
        item.seed < 1,
    )
  ) {
    return NextResponse.json(
      { error: "Ogiltig castoff-ordning." },
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

  for (const item of order) {
    await db
      .update(teams)
      .set({
        seed: item.seed,
      })
      .where(eq(teams.id, item.teamId));
  }

  return NextResponse.json({
    success: true,
  });
}
