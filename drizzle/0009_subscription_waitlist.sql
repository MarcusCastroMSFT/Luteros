CREATE TABLE "subscription_waitlist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"audience" text,
	"source" text,
	"ipAddress" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscription_waitlist_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE INDEX "subscription_waitlist_createdAt_idx" ON "subscription_waitlist" USING btree ("createdAt");