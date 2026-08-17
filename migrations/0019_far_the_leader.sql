CREATE TABLE "otp_verifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"otp_hash" text NOT NULL,
	"type" varchar(50) DEFAULT 'REGISTER' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"max_attempts" integer DEFAULT 5 NOT NULL,
	"expires_at" timestamp NOT NULL,
	"last_sent_at" timestamp DEFAULT now() NOT NULL,
	"verified_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "otp_verifications_email_idx" ON "otp_verifications" USING btree ("email");--> statement-breakpoint
CREATE INDEX "otp_verifications_type_idx" ON "otp_verifications" USING btree ("type");