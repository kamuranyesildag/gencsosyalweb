DROP INDEX "users_username_idx";--> statement-breakpoint
DROP INDEX "users_email_idx";--> statement-breakpoint
CREATE INDEX "messages_conversation_created_at_idx" ON "messages" USING btree ("conversation_id","created_at");--> statement-breakpoint
CREATE INDEX "notifications_recipient_created_at_idx" ON "notifications" USING btree ("recipient_id","created_at");--> statement-breakpoint
CREATE INDEX "posts_user_id_created_at_idx" ON "posts" USING btree ("user_id","created_at");
--> statement-breakpoint
