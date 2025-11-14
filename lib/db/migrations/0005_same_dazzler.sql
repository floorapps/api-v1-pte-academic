CREATE TYPE "public"."ai_usage_type" AS ENUM('transcription', 'scoring', 'feedback', 'realtime_voice', 'text_generation', 'other');--> statement-breakpoint
CREATE TABLE "ai_credit_usage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"usage_type" "ai_usage_type" NOT NULL,
	"provider" text NOT NULL,
	"model" text,
	"input_tokens" integer DEFAULT 0,
	"output_tokens" integer DEFAULT 0,
	"total_tokens" integer DEFAULT 0,
	"audio_seconds" numeric(10, 2),
	"cost" numeric(10, 6),
	"session_id" uuid,
	"attempt_id" uuid,
	"attempt_type" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_credit_usage" ADD CONSTRAINT "ai_credit_usage_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_ai_usage_user_id" ON "ai_credit_usage" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_ai_usage_type" ON "ai_credit_usage" USING btree ("usage_type");--> statement-breakpoint
CREATE INDEX "idx_ai_usage_provider" ON "ai_credit_usage" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "idx_ai_usage_created_at" ON "ai_credit_usage" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_ai_usage_session_id" ON "ai_credit_usage" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_ai_usage_attempt_id" ON "ai_credit_usage" USING btree ("attempt_id");