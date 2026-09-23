CREATE TABLE "announcement_views" (
	"id" serial PRIMARY KEY NOT NULL,
	"announcement_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"seen_at" timestamp DEFAULT now() NOT NULL,
	"dismissed_at" timestamp,
	"clicked_cta" boolean DEFAULT false NOT NULL,
	CONSTRAINT "announcement_views_user_announcement_unq" UNIQUE("announcement_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "announcements" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"image_url" text,
	"button_text" varchar(100),
	"button_url" text,
	"status" varchar(30) DEFAULT 'draft' NOT NULL,
	"target_type" varchar(30) DEFAULT 'all' NOT NULL,
	"target_role" varchar(50),
	"priority" integer DEFAULT 0 NOT NULL,
	"starts_at" timestamp,
	"ends_at" timestamp,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "announcement_views" ADD CONSTRAINT "announcement_views_announcement_id_announcements_id_fk" FOREIGN KEY ("announcement_id") REFERENCES "public"."announcements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcement_views" ADD CONSTRAINT "announcement_views_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "announcement_views_announcement_idx" ON "announcement_views" USING btree ("announcement_id");--> statement-breakpoint
CREATE INDEX "announcement_views_user_idx" ON "announcement_views" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "announcements_status_idx" ON "announcements" USING btree ("status");--> statement-breakpoint
CREATE INDEX "announcements_starts_ends_idx" ON "announcements" USING btree ("starts_at","ends_at");--> statement-breakpoint
CREATE INDEX "announcements_created_at_idx" ON "announcements" USING btree ("created_at");