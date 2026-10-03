CREATE TABLE "team_players" (
	"id" serial PRIMARY KEY,
	"team_id" integer NOT NULL,
	"player_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" serial PRIMARY KEY,
	"tournament_id" integer NOT NULL,
	"team_number" integer NOT NULL,
	"seed" integer
);
--> statement-breakpoint
CREATE TABLE "tournament_players" (
	"id" serial PRIMARY KEY,
	"tournament_id" integer NOT NULL,
	"player_id" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "team_players" ADD CONSTRAINT "team_players_team_id_teams_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "team_players" ADD CONSTRAINT "team_players_player_id_players_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_tournament_id_tournaments_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "tournament_players" ADD CONSTRAINT "tournament_players_tournament_id_tournaments_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "tournament_players" ADD CONSTRAINT "tournament_players_player_id_players_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE;