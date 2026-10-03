import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tournaments = pgTable("tournaments", {
  id: serial("id").primaryKey(),
  publicId: text("public_id").notNull().unique(),
  adminToken: text("admin_token").notNull().unique(),

  name: text("name").notNull(),
  status: text("status").notNull().default("setup"),

  gameType: integer("game_type").notNull(),
  teamMode: text("team_mode").notNull(),
  roundRobinType: text("round_robin_type").notNull(),

  groupBestOf: integer("group_best_of").notNull(),
  playoffBestOf: integer("playoff_best_of").notNull(),

  groupMaxDarts: integer("group_max_darts"),
  playoffMaxDarts: integer("playoff_max_darts"),

  boardCount: integer("board_count").notNull(),
  tiebreakMethod: text("tiebreak_method").notNull(),
  playoffQualifiers: integer("playoff_qualifiers").notNull().default(4),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  finishedAt: timestamp("finished_at"),
});

export const tournamentPlayers = pgTable("tournament_players", {
  id: serial("id").primaryKey(),

  tournamentId: integer("tournament_id")
    .notNull()
    .references(() => tournaments.id, { onDelete: "cascade" }),

  playerId: integer("player_id")
    .notNull()
    .references(() => players.id, { onDelete: "cascade" }),
});

export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),

  tournamentId: integer("tournament_id")
    .notNull()
    .references(() => tournaments.id, { onDelete: "cascade" }),

  teamNumber: integer("team_number").notNull(),

  seed: integer("seed"),
});

export const teamPlayers = pgTable("team_players", {
  id: serial("id").primaryKey(),

  teamId: integer("team_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),

  playerId: integer("player_id")
    .notNull()
    .references(() => players.id, { onDelete: "cascade" }),
});
