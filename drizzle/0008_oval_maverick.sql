CREATE TABLE "job_event" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"job_id" uuid NOT NULL,
	"from_status" text,
	"to_status" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "status" text DEFAULT 'saved' NOT NULL;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "status_updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "job_url" text;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "applied_on" date;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "follow_up_on" date;--> statement-breakpoint
ALTER TABLE "job_event" ADD CONSTRAINT "job_event_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_event" ADD CONSTRAINT "job_event_job_id_job_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "job_event_job_created_idx" ON "job_event" USING btree ("job_id","created_at");