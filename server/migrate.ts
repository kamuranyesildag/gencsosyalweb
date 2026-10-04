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

      // FAZ 69: TEKNOFEST KÖŞESİ (Etkinlik ve Anı Arşivi)
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "teknofest_events" (
          "id" serial PRIMARY KEY NOT NULL,
          "slug" varchar(50) NOT NULL UNIQUE,
          "title" varchar(150) NOT NULL,
          "theme" varchar(255),
          "description" text NOT NULL,
          "location" varchar(150) NOT NULL,
          "start_date" timestamp NOT NULL,
          "end_date" timestamp NOT NULL,
          "cover_image_url" text,
          "status" varchar(30) DEFAULT 'COMPLETED' NOT NULL,
          "is_featured" boolean DEFAULT true NOT NULL,
          "stats" jsonb DEFAULT '{"visitorCount":"1.2M+","projectCount":"1,500+","competitionsCount":"44","teamCount":"25,000+"}'::jsonb,
          "sort_order" integer DEFAULT 0 NOT NULL,
          "created_at" timestamp DEFAULT now() NOT NULL,
          "updated_at" timestamp DEFAULT now() NOT NULL
        );
      `);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS "teknofest_events_slug_idx" ON "teknofest_events" ("slug");`);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS "teknofest_events_status_idx" ON "teknofest_events" ("status");`);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "teknofest_categories" (
          "id" serial PRIMARY KEY NOT NULL,
          "event_id" integer NOT NULL REFERENCES "teknofest_events"("id") ON DELETE CASCADE,
          "name" varchar(100) NOT NULL,
          "slug" varchar(100) NOT NULL,
          "icon" varchar(50) DEFAULT 'Camera' NOT NULL,
          "sort_order" integer DEFAULT 0 NOT NULL,
          "created_at" timestamp DEFAULT now() NOT NULL
        );
      `);
      await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS "teknofest_categories_event_slug_unq" ON "teknofest_categories" ("event_id", "slug");`);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS "teknofest_categories_event_id_idx" ON "teknofest_categories" ("event_id");`);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "teknofest_timeline_items" (
          "id" serial PRIMARY KEY NOT NULL,
          "event_id" integer NOT NULL REFERENCES "teknofest_events"("id") ON DELETE CASCADE,
          "date_label" varchar(50) NOT NULL,
          "title" varchar(200) NOT NULL,
          "description" text,
          "icon" varchar(50) DEFAULT 'Sparkles' NOT NULL,
          "sort_order" integer DEFAULT 0 NOT NULL,
          "created_at" timestamp DEFAULT now() NOT NULL
        );
      `);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS "teknofest_timeline_event_id_idx" ON "teknofest_timeline_items" ("event_id");`);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "teknofest_media" (
          "id" serial PRIMARY KEY NOT NULL,
          "event_id" integer NOT NULL REFERENCES "teknofest_events"("id") ON DELETE CASCADE,
          "user_id" integer REFERENCES "users"("id") ON DELETE SET NULL,
          "category_id" integer REFERENCES "teknofest_categories"("id") ON DELETE SET NULL,
          "post_id" integer REFERENCES "posts"("id") ON DELETE SET NULL,
          "project_id" integer REFERENCES "projects"("id") ON DELETE SET NULL,
          "media_type" varchar(20) DEFAULT 'IMAGE' NOT NULL,
          "media_url" text NOT NULL,
          "thumbnail_url" text,
          "title" varchar(200),
          "caption" text,
          "alt_text" varchar(255),
          "credit" varchar(200) DEFAULT '📷 Genç Sosyal Topluluğu' NOT NULL,
          "aspect_ratio" varchar(20) DEFAULT '4:3',
          "duration" integer,
          "views_count" integer DEFAULT 0 NOT NULL,
          "likes_count" integer DEFAULT 0 NOT NULL,
          "is_featured" boolean DEFAULT false NOT NULL,
          "moderation_status" varchar(20) DEFAULT 'APPROVED' NOT NULL,
          "rejection_reason" text,
          "reviewed_by" integer REFERENCES "users"("id") ON DELETE SET NULL,
          "reviewed_at" timestamp,
          "sort_order" integer DEFAULT 0 NOT NULL,
          "created_at" timestamp DEFAULT now() NOT NULL,
          "updated_at" timestamp DEFAULT now() NOT NULL
        );
      `);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS "teknofest_media_event_id_idx" ON "teknofest_media" ("event_id");`);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS "teknofest_media_user_id_idx" ON "teknofest_media" ("user_id");`);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS "teknofest_media_category_id_idx" ON "teknofest_media" ("category_id");`);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS "teknofest_media_mod_status_idx" ON "teknofest_media" ("moderation_status");`);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS "teknofest_media_is_featured_idx" ON "teknofest_media" ("is_featured");`);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "teknofest_memories" (
          "id" serial PRIMARY KEY NOT NULL,
          "event_id" integer NOT NULL REFERENCES "teknofest_events"("id") ON DELETE CASCADE,
          "user_id" integer REFERENCES "users"("id") ON DELETE SET NULL,
          "post_id" integer REFERENCES "posts"("id") ON DELETE SET NULL,
          "content" text NOT NULL,
          "author_name" varchar(100),
          "author_title" varchar(150),
          "is_featured" boolean DEFAULT false NOT NULL,
          "moderation_status" varchar(20) DEFAULT 'APPROVED' NOT NULL,
          "rejection_reason" text,
          "reviewed_by" integer REFERENCES "users"("id") ON DELETE SET NULL,
          "reviewed_at" timestamp,
          "created_at" timestamp DEFAULT now() NOT NULL,
          "updated_at" timestamp DEFAULT now() NOT NULL
        );
      `);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS "teknofest_memories_event_id_idx" ON "teknofest_memories" ("event_id");`);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS "teknofest_memories_user_id_idx" ON "teknofest_memories" ("user_id");`);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS "teknofest_memories_mod_status_idx" ON "teknofest_memories" ("moderation_status");`);

      // Update existing TEKNOFEST 2026 if location is still Istanbul
      await db.execute(sql`
        UPDATE "teknofest_events"
        SET "location" = 'Şanlıurfa — GAP Havalimanı'
        WHERE "slug" = '2026' AND ("location" LIKE '%İstanbul%' OR "location" LIKE '%Atatürk%');
      `);

      // Seed initial TEKNOFEST 2026 Event if not exists
      const existingEvents = await db.execute(sql`SELECT id FROM "teknofest_events" WHERE "slug" = '2026' LIMIT 1;`);
      if (!existingEvents || (existingEvents as any).rows?.length === 0 || (Array.isArray(existingEvents) && existingEvents.length === 0)) {
        const evInsert = await db.execute(sql`
          INSERT INTO "teknofest_events" (
            "slug", "title", "theme", "description", "location", 
            "start_date", "end_date", "cover_image_url", "status", "is_featured", "stats"
          ) VALUES (
            '2026',
            'TEKNOFEST 2026',
            'Milli Teknoloji Hamlesi & Geleceğin Gençleri',
            'Bir festival sona erdi, anıların hikâyesi devam ediyor. TEKNOFEST''te geride kalan fotoğrafları, yarışma projelerini ve gençlerin unutulmaz anılarını keşfet.',
            'Şanlıurfa — GAP Havalimanı',
            '2026-09-30 09:00:00',
            '2026-10-04 19:00:00',
            null,
            'COMPLETED',
            true,
            '{"visitorCount":"1.5M+","projectCount":"2,100+","competitionsCount":"46","teamCount":"32,000+"}'::jsonb
          ) RETURNING "id";
        `);
        
        const eventId = (evInsert as any).rows?.[0]?.id || (Array.isArray(evInsert) && evInsert[0]?.id) || 1;

        if (eventId) {
          // Seed standard categories
          await db.execute(sql`
            INSERT INTO "teknofest_categories" ("event_id", "name", "slug", "icon", "sort_order") VALUES
            (${eventId}, '📸 Etkinlik', 'etkinlik', 'Camera', 1),
            (${eventId}, '🚀 Projeler', 'projeler', 'Rocket', 2),
            (${eventId}, '🤖 Teknoloji', 'teknoloji', 'Cpu', 3),
            (${eventId}, '🧑‍🤝‍🧑 Gençler', 'gencler', 'Users', 4),
            (${eventId}, '🏆 Yarışmalar', 'yarismalar', 'Trophy', 5),
            (${eventId}, '🎤 Sahne & Uçuş', 'sahne', 'Plane', 6),
            (${eventId}, '🌆 Festival Alanı', 'alan', 'MapPin', 7),
            (${eventId}, '💡 İlham', 'ilham', 'Sparkles', 8)
            ON CONFLICT DO NOTHING;
          `);

          // Seed timeline days (30 Eylül – 4 Ekim)
          await db.execute(sql`
            INSERT INTO "teknofest_timeline_items" ("event_id", "date_label", "title", "description", "icon", "sort_order") VALUES
            (${eventId}, '30 Eylül', 'Büyük Açılış Günü', 'Protokol açılışı, SoloTürk ve Türk Yıldızları nefes kesen açılış uçuşları ve stantların ilk ziyaretçilerle buluşması.', 'Plane', 1),
            (${eventId}, '01 Ekim', 'Proje ve Girişim Alanları', 'Genç geliştiricilerin ve girişimcilerin çadırlarında jüri sunumları, AR/VR ve robotik teknoloji sergileri.', 'Rocket', 2),
            (${eventId}, '02 Ekim', 'Teknoloji ve İHA Sergileri', 'Otonom sistemler, insansız hava araçları ve yapay zeka yarışmalarının eleme turları ve halka açık atölyeler.', 'Cpu', 3),
            (${eventId}, '03 Ekim', 'Büyük Yarışma Finalleri', 'Roket, Model Uydu, Tarım Teknolojileri ve Hackathon yarışmalarının final etabı ve ödül heyecanı.', 'Trophy', 4),
            (${eventId}, '04 Ekim', 'Görkemli Kapanış & Ödül Töreni', 'Dereceye giren takımların ödüllerini alması, kapanış hava gösterileri ve festival anılarının taçlanması.', 'Sparkles', 5)
            ON CONFLICT DO NOTHING;
          `);

          // Seed default featured memories
          await db.execute(sql`
            INSERT INTO "teknofest_memories" ("event_id", "content", "author_name", "author_title", "is_featured", "moderation_status") VALUES
            (${eventId}, 'Aylarca geceli gündüzlü çalıştığımız otonom İHA projemizi jüri önünde uçurduğumuz andaki gururu asla unutamam. TEKNOFEST sadece bir yarışma değil, Türkiye''nin dört bir yanından gençlerle kurulan devasa bir kardeşlik ağı.', 'Alperen K.', 'İHA Takım Kaptanı', true, 'APPROVED'),
            (${eventId}, 'Festival çadırında küçük bir kardeşimizin robotik kolumuza bakarken gözlerinde gördüğüm o ışık, bize sabahlara kadar kod yazmanın değerini bir kez daha hissettirdi.', 'Zeynep B.', 'Yapay Zeka Yarışmacısı', true, 'APPROVED'),
            (${eventId}, 'İlk kez TEKNOFEST''e katıldık ve projemizle finalist olduk. Genç Sosyal''deki ekibimizle burada tanışmıştık, seneye şampiyonluk için geliyoruz!', 'Mert & Can', 'Girişimci Gençler', true, 'APPROVED')
            ON CONFLICT DO NOTHING;
          `);
        }
      }
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
