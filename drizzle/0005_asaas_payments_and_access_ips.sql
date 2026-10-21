CREATE TABLE "asaas_webhook_events" (
	"id" text PRIMARY KEY NOT NULL,
	"event" text NOT NULL,
	"paymentId" text,
	"receivedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_access_ips" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" text NOT NULL,
	"courseId" uuid NOT NULL,
	"ipAddress" text NOT NULL,
	"userAgent" text,
	"firstSeenAt" timestamp DEFAULT now() NOT NULL,
	"lastSeenAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN "asaasPaymentId" text;--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN "paymentUrl" text;--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN "paidAt" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "cpfCnpj" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "asaasCustomerId" text;--> statement-breakpoint
ALTER TABLE "course_access_ips" ADD CONSTRAINT "course_access_ips_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_access_ips" ADD CONSTRAINT "course_access_ips_courseId_courses_id_fk" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "course_access_ips_user_course_ip_idx" ON "course_access_ips" USING btree ("userId","courseId","ipAddress");--> statement-breakpoint
CREATE INDEX "course_access_ips_user_course_lastSeen_idx" ON "course_access_ips" USING btree ("userId","courseId","lastSeenAt");--> statement-breakpoint
CREATE UNIQUE INDEX "enrollments_asaasPaymentId_idx" ON "enrollments" USING btree ("asaasPaymentId");