CREATE TABLE "course_instructors" (
	"courseId" uuid NOT NULL,
	"instructorId" text NOT NULL,
	"order" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "course_instructors_courseId_instructorId_pk" PRIMARY KEY("courseId","instructorId")
);
--> statement-breakpoint
ALTER TABLE "course_instructors" ADD CONSTRAINT "course_instructors_courseId_courses_id_fk" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_instructors" ADD CONSTRAINT "course_instructors_instructorId_users_id_fk" FOREIGN KEY ("instructorId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
INSERT INTO "course_instructors" ("courseId", "instructorId", "order")
SELECT "id", "instructorId", 0 FROM "courses"
ON CONFLICT ("courseId", "instructorId") DO NOTHING;--> statement-breakpoint
CREATE INDEX "course_instructors_instructorId_idx" ON "course_instructors" USING btree ("instructorId");