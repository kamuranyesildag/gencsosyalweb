CREATE INDEX "notifications_recipient_unread_date_idx" ON "notifications" USING btree ("recipient_id","is_read","created_at");
--> statement-breakpoint
