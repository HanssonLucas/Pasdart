CREATE TABLE "matches" (
	"id" serial PRIMARY KEY,
	"tournament_id" integer NOT NULL,
	"stage" text NOT NULL,
	"round_number" integer,
	"board_number" integer,
	"match_number" integer,
	"team_a_id" integer NOT NULL,
	"team_b_id" integer NOT NULL,
	"team_a_legs" integer DEFAULT 0 NOT NULL,
	"team_b_legs" integer DEFAULT 0 NOT NULL,
	"winner_team_id" integer,
	"status" text DEFAULT 'scheduled' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_tournament_id_tournaments_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_team_a_id_teams_id_fkey" FOREIGN KEY ("team_a_id") REFERENCES "teams"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_team_b_id_teams_id_fkey" FOREIGN KEY ("team_b_id") REFERENCES "teams"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_winner_team_id_teams_id_fkey" FOREIGN KEY ("winner_team_id") REFERENCES "teams"("id") ON DELETE SET NULL;