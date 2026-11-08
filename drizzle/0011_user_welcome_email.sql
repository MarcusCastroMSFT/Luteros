ALTER TABLE "users" ADD COLUMN "welcomeEmailSentAt" timestamp;
--> statement-breakpoint
-- Accounts that already exist never receive the welcome e-mail.
UPDATE "users" SET "welcomeEmailSentAt" = now() WHERE "welcomeEmailSentAt" IS NULL;
