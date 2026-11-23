CREATE TABLE "cover_letter" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"job_id" uuid NOT NULL,
	"body" text NOT NULL,
	"warnings" text[] DEFAULT '{}'::text[] NOT NULL,
	"model" text NOT NULL,
	"edited" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cover_letter" ADD CONSTRAINT "cover_letter_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cover_letter" ADD CONSTRAINT "cover_letter_job_id_job_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cover_letter_job_created_idx" ON "cover_letter" USING btree ("job_id","created_at");--> statement-breakpoint
CREATE INDEX "cover_letter_user_created_idx" ON "cover_letter" USING btree ("user_id","created_at");