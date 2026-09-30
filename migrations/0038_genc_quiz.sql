CREATE TABLE IF NOT EXISTS "quiz_question_sets" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE cascade,
	"title" varchar(120) NOT NULL,
	"description" text,
	"category" varchar(50) DEFAULT 'Genel Kültür' NOT NULL,
	"difficulty" varchar(20) DEFAULT 'Orta' NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"question_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "quiz_question_sets_user_idx" ON "quiz_question_sets" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "quiz_question_sets_public_idx" ON "quiz_question_sets" ("is_public");--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "quiz_question_set_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"set_id" integer NOT NULL REFERENCES "quiz_question_sets"("id") ON DELETE cascade,
	"question" text NOT NULL,
	"explanation" text,
	"order" integer DEFAULT 1 NOT NULL,
	"options" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "quiz_question_set_items_set_idx" ON "quiz_question_set_items" ("set_id");--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "quiz_rooms" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(10) NOT NULL UNIQUE,
	"title" varchar(150) NOT NULL,
	"host_id" integer NOT NULL REFERENCES "users"("id") ON DELETE cascade,
	"category" varchar(50) DEFAULT 'Karışık' NOT NULL,
	"difficulty" varchar(20) DEFAULT 'Karışık' NOT NULL,
	"question_count" integer DEFAULT 10 NOT NULL,
	"time_per_question" integer DEFAULT 20 NOT NULL,
	"room_type" varchar(20) DEFAULT 'PUBLIC' NOT NULL,
	"source_type" varchar(30) DEFAULT 'SYSTEM' NOT NULL,
	"question_set_id" integer REFERENCES "quiz_question_sets"("id") ON DELETE set null,
	"max_players" integer DEFAULT 30 NOT NULL,
	"status" varchar(25) DEFAULT 'LOBBY' NOT NULL,
	"current_question_index" integer DEFAULT 0 NOT NULL,
	"question_started_at" timestamp,
	"started_at" timestamp,
	"finished_at" timestamp,
	"settings" jsonb DEFAULT '{"allowAnswerChange":false,"speedBonus":true,"soundEnabled":true}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "quiz_rooms_code_idx" ON "quiz_rooms" ("code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "quiz_rooms_host_idx" ON "quiz_rooms" ("host_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "quiz_rooms_status_idx" ON "quiz_rooms" ("status");--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "quiz_room_players" (
	"id" serial PRIMARY KEY NOT NULL,
	"room_id" integer NOT NULL REFERENCES "quiz_rooms"("id") ON DELETE cascade,
	"user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE cascade,
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
	"joined_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "quiz_room_players_room_user_unq" UNIQUE("room_id", "user_id")
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "quiz_room_players_room_idx" ON "quiz_room_players" ("room_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "quiz_room_players_user_idx" ON "quiz_room_players" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "quiz_room_players_score_idx" ON "quiz_room_players" ("room_id", "score");--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "quiz_room_questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"room_id" integer NOT NULL REFERENCES "quiz_rooms"("id") ON DELETE cascade,
	"question_id" integer REFERENCES "league_questions"("id") ON DELETE set null,
	"question_text" text NOT NULL,
	"category" varchar(50) NOT NULL,
	"difficulty" varchar(20) NOT NULL,
	"explanation" text,
	"options" jsonb NOT NULL,
	"order" integer NOT NULL,
	CONSTRAINT "quiz_room_questions_room_order_unq" UNIQUE("room_id", "order")
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "quiz_room_questions_room_idx" ON "quiz_room_questions" ("room_id");--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "quiz_answers" (
	"id" serial PRIMARY KEY NOT NULL,
	"room_id" integer NOT NULL REFERENCES "quiz_rooms"("id") ON DELETE cascade,
	"user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE cascade,
	"room_question_id" integer NOT NULL REFERENCES "quiz_room_questions"("id") ON DELETE cascade,
	"selected_option" varchar(5),
	"is_correct" boolean DEFAULT false NOT NULL,
	"points_earned" integer DEFAULT 0 NOT NULL,
	"time_taken_ms" integer DEFAULT 0 NOT NULL,
	"answered_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "quiz_answers_room_user_q_unq" UNIQUE("room_id", "user_id", "room_question_id")
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "quiz_answers_room_idx" ON "quiz_answers" ("room_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "quiz_answers_user_idx" ON "quiz_answers" ("user_id");--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "quiz_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"room_id" integer REFERENCES "quiz_rooms"("id") ON DELETE set null,
	"room_title" varchar(150) NOT NULL,
	"category" varchar(50) NOT NULL,
	"user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE cascade,
	"rank" integer NOT NULL,
	"total_players" integer NOT NULL,
	"score" integer NOT NULL,
	"correct_count" integer NOT NULL,
	"wrong_count" integer NOT NULL,
	"unanswered_count" integer NOT NULL,
	"total_questions" integer NOT NULL,
	"played_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "quiz_results_user_played_idx" ON "quiz_results" ("user_id", "played_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "quiz_results_user_score_idx" ON "quiz_results" ("user_id", "score");--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "quiz_invites" (
	"id" serial PRIMARY KEY NOT NULL,
	"room_id" integer NOT NULL REFERENCES "quiz_rooms"("id") ON DELETE cascade,
	"sender_id" integer NOT NULL REFERENCES "users"("id") ON DELETE cascade,
	"receiver_id" integer NOT NULL REFERENCES "users"("id") ON DELETE cascade,
	"status" varchar(20) DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "quiz_invites_room_receiver_unq" UNIQUE("room_id", "receiver_id")
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "quiz_invites_receiver_idx" ON "quiz_invites" ("receiver_id");
