ALTER TABLE "otp_verifications" ADD CONSTRAINT "otp_verifications_email_type_unique" UNIQUE("email","type");
--> statement-breakpoint
