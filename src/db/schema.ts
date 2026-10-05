import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tournaments = pgTable("tournaments", {
  id: serial("id").primaryKey(),
  publicId: text("public_id").notNull().unique(),
  adminToken: text("admin_token").notNull().unique(),
  viewerCode: text("viewer_code").notNull().unique(),

  name: text("name").notNull(),
  status: text("status").notNull().default("setup"),
  isLive: boolean("is_live").notNull().default(false),

  gameType: integer("game_type").notNull(),
  teamMode: text("team_mode").notNull(),
  roundRobinType: text("round_robin_type").notNull(),

  groupMatchMode: text("group_match_mode").notNull().default("bestOf"),

  groupLegCount: integer("group_leg_count").notNull().default(3),

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

export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),

  tournamentId: integer("tournament_id")
    .notNull()
    .references(() => tournaments.id, { onDelete: "cascade" }),

  stage: text("stage").notNull(),
  roundNumber: integer("round_number"),
  boardNumber: integer("board_number"),
  matchNumber: integer("match_number"),

  teamAId: integer("team_a_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),

  teamBId: integer("team_b_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),

  teamALegs: integer("team_a_legs").notNull().default(0),
  teamBLegs: integer("team_b_legs").notNull().default(0),

  winnerTeamId: integer("winner_team_id").references(() => teams.id, {
    onDelete: "set null",
  }),

  status: text("status").notNull().default("scheduled"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
