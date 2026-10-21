ALTER TABLE "tournaments"
ADD COLUMN IF NOT EXISTS "viewer_code" text;

--> statement-breakpoint
ALTER TABLE "tournaments"
ADD COLUMN IF NOT EXISTS "is_live" boolean DEFAULT false NOT NULL;

--> statement-breakpoint
ALTER TABLE "tournaments"
ADD COLUMN IF NOT EXISTS "group_match_mode" text DEFAULT 'bestOf' NOT NULL;

--> statement-breakpoint
ALTER TABLE "tournaments"
ADD COLUMN IF NOT EXISTS "group_leg_count" integer DEFAULT 3 NOT NULL;

--> statement-breakpoint
ALTER TABLE "tournaments"
ADD COLUMN "semifinal_match_mode" text DEFAULT 'bestOf' NOT NULL;

--> statement-breakpoint
ALTER TABLE "tournaments"
ADD COLUMN "final_match_mode" text DEFAULT 'bestOf' NOT NULL;

--> statement-breakpoint
ALTER TABLE "tournaments"
ADD COLUMN "semifinal_leg_target" integer DEFAULT 5 NOT NULL;

--> statement-breakpoint
ALTER TABLE "tournaments"
ADD COLUMN "final_leg_target" integer DEFAULT 5 NOT NULL;

--> statement-breakpoint
UPDATE "tournaments"
SET
  "semifinal_leg_target" = "playoff_best_of",
  "final_leg_target" = "playoff_best_of";