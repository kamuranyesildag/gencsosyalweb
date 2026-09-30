ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "birth_date" timestamp;--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "league_seasons" (
	"id" serial PRIMARY KEY NOT NULL,
	"year" integer NOT NULL,
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
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "league_seasons_year_unique" UNIQUE("year")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "league_participants" (
	"id" serial PRIMARY KEY NOT NULL,
	"season_id" integer NOT NULL,
	"user_id" integer NOT NULL,
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
--> statement-breakpoint
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
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "league_question_options" (
	"id" serial PRIMARY KEY NOT NULL,
	"question_id" integer NOT NULL,
	"option_key" varchar(5) NOT NULL,
	"option_text" text NOT NULL,
	"is_correct" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "league_matches" (
	"id" serial PRIMARY KEY NOT NULL,
	"season_id" integer NOT NULL,
	"stage" varchar(30) DEFAULT 'QUALIFIERS' NOT NULL,
	"age_group" varchar(20) DEFAULT '13-15' NOT NULL,
	"player1_id" integer NOT NULL,
	"player2_id" integer,
	"is_vs_bot" boolean DEFAULT false NOT NULL,
	"bot_name" varchar(50),
	"winner_id" integer,
	"player1_score" integer DEFAULT 0 NOT NULL,
	"player2_score" integer DEFAULT 0 NOT NULL,
	"status" varchar(20) DEFAULT 'PENDING' NOT NULL,
	"current_question_index" integer DEFAULT 0 NOT NULL,
	"question_started_at" timestamp,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "league_match_questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"match_id" integer NOT NULL,
	"question_id" integer NOT NULL,
	"order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "league_match_answers" (
	"id" serial PRIMARY KEY NOT NULL,
	"match_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"question_id" integer NOT NULL,
	"selected_option" varchar(5),
	"is_correct" boolean DEFAULT false NOT NULL,
	"points_earned" integer DEFAULT 0 NOT NULL,
	"time_taken_ms" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "league_seasons" ADD CONSTRAINT "league_seasons_champion_user_id_users_id_fk" FOREIGN KEY ("champion_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "league_participants" ADD CONSTRAINT "league_participants_season_id_league_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."league_seasons"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "league_participants" ADD CONSTRAINT "league_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "league_question_options" ADD CONSTRAINT "league_question_options_question_id_league_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."league_questions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "league_matches" ADD CONSTRAINT "league_matches_season_id_league_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."league_seasons"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "league_matches" ADD CONSTRAINT "league_matches_player1_id_users_id_fk" FOREIGN KEY ("player1_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "league_matches" ADD CONSTRAINT "league_matches_player2_id_users_id_fk" FOREIGN KEY ("player2_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "league_matches" ADD CONSTRAINT "league_matches_winner_id_users_id_fk" FOREIGN KEY ("winner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "league_match_questions" ADD CONSTRAINT "league_match_questions_match_id_league_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."league_matches"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "league_match_questions" ADD CONSTRAINT "league_match_questions_question_id_league_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."league_questions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "league_match_answers" ADD CONSTRAINT "league_match_answers_match_id_league_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."league_matches"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "league_match_answers" ADD CONSTRAINT "league_match_answers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "league_match_answers" ADD CONSTRAINT "league_match_answers_question_id_league_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."league_questions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "league_participants_season_user_unq" ON "league_participants" ("season_id", "user_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "league_question_options_q_key_unq" ON "league_question_options" ("question_id", "option_key");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "league_match_questions_match_q_unq" ON "league_match_questions" ("match_id", "question_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "league_match_answers_match_user_q_unq" ON "league_match_answers" ("match_id", "user_id", "question_id");
