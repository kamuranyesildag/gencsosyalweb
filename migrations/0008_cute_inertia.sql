CREATE TABLE "post_collaborators" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "post_collaborators_unique_user_post" UNIQUE("post_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "project_collaborators" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "project_collaborators_unique_user_project" UNIQUE("project_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "post_collaborators" ADD CONSTRAINT "post_collaborators_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_collaborators" ADD CONSTRAINT "post_collaborators_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_collaborators" ADD CONSTRAINT "project_collaborators_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_collaborators" ADD CONSTRAINT "project_collaborators_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "post_collaborators_post_id_idx" ON "post_collaborators" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "post_collaborators_user_id_idx" ON "post_collaborators" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "project_collaborators_project_id_idx" ON "project_collaborators" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_collaborators_user_id_idx" ON "project_collaborators" USING btree ("user_id");