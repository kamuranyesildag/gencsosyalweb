import path from "path";
import { migrate as migratePg } from "drizzle-orm/node-postgres/migrator";
import { migrate as migratePglite } from "drizzle-orm/pglite/migrator";
import { sql } from "drizzle-orm";
import { db, createPool, createPglite } from "../src/db/index.js";

export async function runMigration(isStandalone = false) {
  if (process.env.NODE_ENV !== "production") {
    const dotenv = await import("dotenv");
    dotenv.config();
  }

  let exitCode = 0;
  console.log("🚀 Starting database migration...");

  try {
    const pool = createPool();
    if (pool) {
      await migratePg(db, { migrationsFolder: path.join(process.cwd(), "migrations") });
    } else {
      await migratePglite(db, { migrationsFolder: path.join(process.cwd(), "migrations") });
    }

    // Direct idempotent safety checks for Community Management (FAZ 65)
    try {
      await db.execute(sql`ALTER TABLE "communities" ADD COLUMN IF NOT EXISTS "category" varchar(50) DEFAULT 'Genel' NOT NULL;`);
      await db.execute(sql`ALTER TABLE "communities" ADD COLUMN IF NOT EXISTS "is_private" boolean DEFAULT false NOT NULL;`);
      await db.execute(sql`ALTER TABLE "communities" ADD COLUMN IF NOT EXISTS "rules" text;`);
      await db.execute(sql`ALTER TABLE "communities" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp;`);
      await db.execute(sql`ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "community_id" integer;`);
      
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "community_join_requests" (
          "id" serial PRIMARY KEY NOT NULL,
          "community_id" integer NOT NULL REFERENCES "communities"("id") ON DELETE CASCADE,
          "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
          "status" varchar(20) DEFAULT 'PENDING' NOT NULL,
          "note" text,
          "created_at" timestamp DEFAULT now() NOT NULL,
          "updated_at" timestamp DEFAULT now() NOT NULL
        );
      `);
      await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS "community_join_requests_user_community_unq" ON "community_join_requests" ("community_id", "user_id");`);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "community_audit_logs" (
          "id" serial PRIMARY KEY NOT NULL,
          "community_id" integer NOT NULL REFERENCES "communities"("id") ON DELETE CASCADE,
          "actor_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
          "target_user_id" integer REFERENCES "users"("id") ON DELETE SET NULL,
          "action" varchar(50) NOT NULL,
          "details" text,
          "created_at" timestamp DEFAULT now() NOT NULL
        );
      `);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS "community_audit_logs_community_idx" ON "community_audit_logs" ("community_id");`);

      // Gençlik Ligi (FAZ 67)
      await db.execute(sql`ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "birth_date" timestamp;`);
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "league_seasons" (
          "id" serial PRIMARY KEY NOT NULL,
          "year" integer NOT NULL UNIQUE,
          "title" varchar(150) NOT NULL,
          "theme" varchar(150),
          "description" text,
          "registration_start_date" timestamp NOT NULL,
          "registration_end_date" timestamp NOT NULL,
          "start_date" timestamp NOT NULL,
          "end_date" timestamp NOT NULL,
          "status" varchar(30) DEFAULT 'UPCOMING' NOT NULL,
          "settings" jsonb DEFAULT '{"ageGroups":["13-15","16-17","18+"],"pointsCorrect":100,"pointsHardBonus":50,"maxSpeedBonus":25,"questionTimeLimit":20,"questionsPerMatch":8,"simulationMode":false}'::jsonb NOT NULL,
          "champion_user_id" integer,
          "total_participants" integer DEFAULT 0 NOT NULL,
          "total_matches" integer DEFAULT 0 NOT NULL,
          "created_at" timestamp DEFAULT now() NOT NULL,
          "updated_at" timestamp DEFAULT now() NOT NULL
        );
      `);
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "league_participants" (
          "id" serial PRIMARY KEY NOT NULL,
          "season_id" integer NOT NULL REFERENCES "league_seasons"("id") ON DELETE CASCADE,
          "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
          "age_group" varchar(20) NOT NULL,
          "total_points" integer DEFAULT 0 NOT NULL,
          "matches_played" integer DEFAULT 0 NOT NULL,
          "matches_won" integer DEFAULT 0 NOT NULL,
          "correct_answers_count" integer DEFAULT 0 NOT NULL,
          "total_answers_count" integer DEFAULT 0 NOT NULL,
          "current_round" varchar(30) DEFAULT 'QUALIFIERS' NOT NULL,
          "status" varchar(30) DEFAULT 'ACTIVE' NOT NULL,
          "is_flagged" boolean DEFAULT false NOT NULL,
          "created_at" timestamp DEFAULT now() NOT NULL,
          "updated_at" timestamp DEFAULT now() NOT NULL
        );
      `);
      await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS "league_participants_season_user_unq" ON "league_participants" ("season_id", "user_id");`);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "league_questions" (
          "id" serial PRIMARY KEY NOT NULL,
          "question" text NOT NULL,
          "category" varchar(50) NOT NULL,
          "difficulty" varchar(20) DEFAULT 'MEDIUM' NOT NULL,
          "age_group" varchar(20) DEFAULT 'ALL' NOT NULL,
          "language" varchar(10) DEFAULT 'tr' NOT NULL,
          "explanation" text,
          "source_type" varchar(30) DEFAULT 'MANUAL' NOT NULL,
          "source_reference" text,
          "status" varchar(20) DEFAULT 'ACTIVE' NOT NULL,
          "usage_count" integer DEFAULT 0 NOT NULL,
          "created_at" timestamp DEFAULT now() NOT NULL,
          "updated_at" timestamp DEFAULT now() NOT NULL
        );
      `);
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "league_question_options" (
          "id" serial PRIMARY KEY NOT NULL,
          "question_id" integer NOT NULL REFERENCES "league_questions"("id") ON DELETE CASCADE,
          "option_key" varchar(5) NOT NULL,
          "option_text" text NOT NULL,
          "is_correct" boolean DEFAULT false NOT NULL
        );
      `);
      await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS "league_question_options_q_key_unq" ON "league_question_options" ("question_id", "option_key");`);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "league_matches" (
          "id" serial PRIMARY KEY NOT NULL,
          "season_id" integer NOT NULL REFERENCES "league_seasons"("id") ON DELETE CASCADE,
          "stage" varchar(30) DEFAULT 'QUALIFIERS' NOT NULL,
          "age_group" varchar(20) DEFAULT '13-15' NOT NULL,
          "player1_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
          "player2_id" integer REFERENCES "users"("id") ON DELETE SET NULL,
          "is_vs_bot" boolean DEFAULT false NOT NULL,
          "bot_name" varchar(50),
          "winner_id" integer REFERENCES "users"("id") ON DELETE SET NULL,
          "player1_score" integer DEFAULT 0 NOT NULL,
          "player2_score" integer DEFAULT 0 NOT NULL,
          "status" varchar(20) DEFAULT 'PENDING' NOT NULL,
          "current_question_index" integer DEFAULT 0 NOT NULL,
          "question_started_at" timestamp,
          "started_at" timestamp,
          "completed_at" timestamp,
          "created_at" timestamp DEFAULT now() NOT NULL
        );
      `);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "league_match_questions" (
          "id" serial PRIMARY KEY NOT NULL,
          "match_id" integer NOT NULL REFERENCES "league_matches"("id") ON DELETE CASCADE,
          "question_id" integer NOT NULL REFERENCES "league_questions"("id") ON DELETE CASCADE,
          "order" integer NOT NULL
        );
      `);
      await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS "league_match_questions_match_q_unq" ON "league_match_questions" ("match_id", "question_id");`);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "league_match_answers" (
          "id" serial PRIMARY KEY NOT NULL,
          "match_id" integer NOT NULL REFERENCES "league_matches"("id") ON DELETE CASCADE,
          "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
          "question_id" integer NOT NULL REFERENCES "league_questions"("id") ON DELETE CASCADE,
          "selected_option" varchar(5),
          "is_correct" boolean DEFAULT false NOT NULL,
          "points_earned" integer DEFAULT 0 NOT NULL,
          "time_taken_ms" integer DEFAULT 0 NOT NULL,
          "created_at" timestamp DEFAULT now() NOT NULL
        );
      `);
      await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS "league_match_answers_match_user_q_unq" ON "league_match_answers" ("match_id", "user_id", "question_id");`);

      // Genç Quiz (FAZ 68)
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "quiz_question_sets" (
          "id" serial PRIMARY KEY NOT NULL,
          "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
          "title" varchar(120) NOT NULL,
          "description" text,
          "category" varchar(50) DEFAULT 'Genel Kültür' NOT NULL,
          "difficulty" varchar(20) DEFAULT 'Orta' NOT NULL,
          "is_public" boolean DEFAULT false NOT NULL,
          "question_count" integer DEFAULT 0 NOT NULL,
          "created_at" timestamp DEFAULT now() NOT NULL,
          "updated_at" timestamp DEFAULT now() NOT NULL
        );
      `);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS "quiz_question_sets_user_idx" ON "quiz_question_sets" ("user_id");`);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS "quiz_question_sets_public_idx" ON "quiz_question_sets" ("is_public");`);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "quiz_question_set_items" (
          "id" serial PRIMARY KEY NOT NULL,
          "set_id" integer NOT NULL REFERENCES "quiz_question_sets"("id") ON DELETE CASCADE,
          "question" text NOT NULL,
          "explanation" text,
          "order" integer DEFAULT 1 NOT NULL,
          "options" jsonb NOT NULL,
          "created_at" timestamp DEFAULT now() NOT NULL
        );
      `);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS "quiz_question_set_items_set_idx" ON "quiz_question_set_items" ("set_id");`);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "quiz_rooms" (
          "id" serial PRIMARY KEY NOT NULL,
          "code" varchar(10) NOT NULL UNIQUE,
          "title" varchar(150) NOT NULL,
          "host_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
          "category" varchar(50) DEFAULT 'Karışık' NOT NULL,
          "difficulty" varchar(20) DEFAULT 'Karışık' NOT NULL,
          "question_count" integer DEFAULT 10 NOT NULL,
          "time_per_question" integer DEFAULT 20 NOT NULL,
          "room_type" varchar(20) DEFAULT 'PUBLIC' NOT NULL,
          "source_type" varchar(30) DEFAULT 'SYSTEM' NOT NULL,
          "question_set_id" integer REFERENCES "quiz_question_sets"("id") ON DELETE SET NULL,
          "max_players" integer DEFAULT 30 NOT NULL,
          "status" varchar(25) DEFAULT 'LOBBY' NOT NULL,
          "current_question_index" integer DEFAULT 0 NOT NULL,
          "question_started_at" timestamp,
          "started_at" timestamp,
          "finished_at" timestamp,
          "settings" jsonb DEFAULT '{"allowAnswerChange":false,"speedBonus":true,"soundEnabled":true}'::jsonb NOT NULL,
          "created_at" timestamp DEFAULT now() NOT NULL,
          "updated_at" timestamp DEFAULT now() NOT NULL
        );
      `);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS "quiz_rooms_code_idx" ON "quiz_rooms" ("code");`);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS "quiz_rooms_host_idx" ON "quiz_rooms" ("host_id");`);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS "quiz_rooms_status_idx" ON "quiz_rooms" ("status");`);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "quiz_room_players" (
          "id" serial PRIMARY KEY NOT NULL,
          "room_id" integer NOT NULL REFERENCES "quiz_rooms"("id") ON DELETE CASCADE,
          "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
          "score" integer DEFAULT 0 NOT NULL,
          "correct_answers_count" integer DEFAULT 0 NOT NULL,
          "wrong_answers_count" integer DEFAULT 0 NOT NULL,
          "unanswered_count" integer DEFAULT 0 NOT NULL,
          "streak" integer DEFAULT 0 NOT NULL,
          "max_streak" integer DEFAULT 0 NOT NULL,
          "rank" integer DEFAULT 1,
          "is_host" boolean DEFAULT false NOT NULL,
          "is_connected" boolean DEFAULT true NOT NULL,
          "last_active_at" timestamp DEFAULT now() NOT NULL,
          "joined_at" timestamp DEFAULT now() NOT NULL
        );
      `);
      await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS "quiz_room_players_room_user_unq" ON "quiz_room_players" ("room_id", "user_id");`);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS "quiz_room_players_room_idx" ON "quiz_room_players" ("room_id");`);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS "quiz_room_players_user_idx" ON "quiz_room_players" ("user_id");`);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS "quiz_room_players_score_idx" ON "quiz_room_players" ("room_id", "score");`);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "quiz_room_questions" (
          "id" serial PRIMARY KEY NOT NULL,
          "room_id" integer NOT NULL REFERENCES "quiz_rooms"("id") ON DELETE CASCADE,
          "question_id" integer REFERENCES "league_questions"("id") ON DELETE SET NULL,
          "question_text" text NOT NULL,
          "category" varchar(50) NOT NULL,
          "difficulty" varchar(20) NOT NULL,
          "explanation" text,
          "options" jsonb NOT NULL,
          "order" integer NOT NULL
        );
      `);
      await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS "quiz_room_questions_room_order_unq" ON "quiz_room_questions" ("room_id", "order");`);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS "quiz_room_questions_room_idx" ON "quiz_room_questions" ("room_id");`);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "quiz_answers" (
          "id" serial PRIMARY KEY NOT NULL,
          "room_id" integer NOT NULL REFERENCES "quiz_rooms"("id") ON DELETE CASCADE,
          "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
          "room_question_id" integer NOT NULL REFERENCES "quiz_room_questions"("id") ON DELETE CASCADE,
          "selected_option" varchar(5),
          "is_correct" boolean DEFAULT false NOT NULL,
          "points_earned" integer DEFAULT 0 NOT NULL,
          "time_taken_ms" integer DEFAULT 0 NOT NULL,
          "answered_at" timestamp DEFAULT now() NOT NULL
        );
      `);
      await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS "quiz_answers_room_user_q_unq" ON "quiz_answers" ("room_id", "user_id", "room_question_id");`);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS "quiz_answers_room_idx" ON "quiz_answers" ("room_id");`);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS "quiz_answers_user_idx" ON "quiz_answers" ("user_id");`);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "quiz_results" (
          "id" serial PRIMARY KEY NOT NULL,
          "room_id" integer REFERENCES "quiz_rooms"("id") ON DELETE SET NULL,
          "room_title" varchar(150) NOT NULL,
          "category" varchar(50) NOT NULL,
          "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
          "rank" integer NOT NULL,
          "total_players" integer NOT NULL,
          "score" integer NOT NULL,
          "correct_count" integer NOT NULL,
          "wrong_count" integer NOT NULL,
          "unanswered_count" integer NOT NULL,
          "total_questions" integer NOT NULL,
          "played_at" timestamp DEFAULT now() NOT NULL
        );
      `);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS "quiz_results_user_played_idx" ON "quiz_results" ("user_id", "played_at");`);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS "quiz_results_user_score_idx" ON "quiz_results" ("user_id", "score");`);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "quiz_invites" (
          "id" serial PRIMARY KEY NOT NULL,
          "room_id" integer NOT NULL REFERENCES "quiz_rooms"("id") ON DELETE CASCADE,
          "sender_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
          "receiver_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
          "status" varchar(20) DEFAULT 'PENDING' NOT NULL,
          "created_at" timestamp DEFAULT now() NOT NULL
        );
      `);
      await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS "quiz_invites_room_receiver_unq" ON "quiz_invites" ("room_id", "receiver_id");`);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS "quiz_invites_receiver_idx" ON "quiz_invites" ("receiver_id");`);
    } catch (safeErr) {
      console.warn("Community schema safety check note:", safeErr);
    }

    console.log("✅ Database migrations completed successfully.");
  } catch (error: any) {
    console.error("❌ Database migration failed:", error);
    exitCode = 1;
  } finally {
    if (isStandalone) {
      try {
        if (global._postgresPool) {
          await global._postgresPool.end();
        }
        if (global._pgliteClient) {
          await global._pgliteClient.close();
        }
      } catch(e) {}
      process.exit(exitCode);
    }
  }
}

if (process.argv[1] && process.argv[1].includes("migrate")) {
  runMigration(true);
}
