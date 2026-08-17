CREATE TABLE "poll_options" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" integer NOT NULL,
	"text" varchar(255) NOT NULL,
	"order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "poll_votes" (
	"id" serial PRIMARY KEY NOT NULL,
	"option_id" integer NOT NULL,
	"post_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "poll_votes_post_user_unique" UNIQUE("post_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "post_type" varchar(20) DEFAULT 'NORMAL' NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "content_warning" text;--> statement-breakpoint
ALTER TABLE "poll_options" ADD CONSTRAINT "poll_options_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poll_votes" ADD CONSTRAINT "poll_votes_option_id_poll_options_id_fk" FOREIGN KEY ("option_id") REFERENCES "public"."poll_options"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poll_votes" ADD CONSTRAINT "poll_votes_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poll_votes" ADD CONSTRAINT "poll_votes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "poll_votes_option_idx" ON "poll_votes" USING btree ("option_id");