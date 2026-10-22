CREATE TABLE "contact_messages" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"reason" text NOT NULL,
	"subject" text,
	"message" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "contact_messages_createdAt_id_idx" ON "contact_messages" USING btree ("createdAt","id");--> statement-breakpoint
CREATE INDEX "contact_messages_email_createdAt_idx" ON "contact_messages" USING btree ("email","createdAt");