CREATE TABLE "players" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
