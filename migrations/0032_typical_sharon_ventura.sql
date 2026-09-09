CREATE TABLE "notification_preferences" (
	"user_id" integer PRIMARY KEY NOT NULL,
	"push_enabled" boolean DEFAULT true NOT NULL,
	"email_enabled" boolean DEFAULT true NOT NULL,
	"likes" boolean DEFAULT true NOT NULL,
	"comments" boolean DEFAULT true NOT NULL,
	"mentions" boolean DEFAULT true NOT NULL,
	"follows" boolean DEFAULT true NOT NULL,
	"messages" boolean DEFAULT true NOT NULL,
	"newsletters" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "follows" ADD COLUMN "status" varchar(20) DEFAULT 'accepted' NOT NULL;--> statement-breakpoint
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;