CREATE TYPE "public"."attempt_status" AS ENUM('not_started', 'in_progress', 'paused', 'completed', 'abandoned', 'expired');--> statement-breakpoint
CREATE TYPE "public"."mock_test_difficulty" AS ENUM('easy', 'medium', 'hard');--> statement-breakpoint
CREATE TYPE "public"."mock_test_section" AS ENUM('speaking', 'writing', 'reading', 'listening');--> statement-breakpoint
CREATE TYPE "public"."mock_test_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."question_table" AS ENUM('speaking_questions', 'writing_questions', 'reading_questions', 'listening_questions');--> statement-breakpoint
CREATE TABLE "mock_test_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attempt_id" uuid NOT NULL,
	"mock_test_question_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"question_table" "question_table" NOT NULL,
	"user_response" jsonb,
	"is_correct" boolean,
	"points_earned" integer,
	"points_possible" integer,
	"scores" jsonb,
	"ai_feedback" text,
	"time_taken_seconds" integer,
	"flagged_for_human_review" boolean DEFAULT false,
	"human_review_completed" boolean DEFAULT false,
	"human_review_notes" text,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mock_test_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"mock_test_id" uuid NOT NULL,
	"status" "attempt_status" DEFAULT 'not_started' NOT NULL,
	"current_question_index" integer DEFAULT 0 NOT NULL,
	"current_section" "mock_test_section" DEFAULT 'speaking',
	"started_at" timestamp,
	"paused_at" timestamp,
	"resumed_at" timestamp,
	"completed_at" timestamp,
	"time_remaining_seconds" integer,
	"pause_count" integer DEFAULT 0 NOT NULL,
	"overall_score" integer,
	"speaking_score" integer,
	"writing_score" integer,
	"reading_score" integer,
	"listening_score" integer,
	"enabling_skills" jsonb,
	"time_spent" jsonb,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mock_test_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mock_test_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"question_table" "question_table" NOT NULL,
	"section" "mock_test_section" NOT NULL,
	"order_index" integer NOT NULL,
	"time_limit_seconds" integer,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mock_tests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"test_number" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"difficulty" "mock_test_difficulty" DEFAULT 'medium' NOT NULL,
	"total_questions" integer NOT NULL,
	"duration_minutes" integer DEFAULT 120 NOT NULL,
	"is_free" boolean DEFAULT false NOT NULL,
	"status" "mock_test_status" DEFAULT 'published' NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "mock_tests_test_number_unique" UNIQUE("test_number")
);
--> statement-breakpoint
ALTER TABLE "mock_test_answers" ADD CONSTRAINT "mock_test_answers_attempt_id_mock_test_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."mock_test_attempts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mock_test_answers" ADD CONSTRAINT "mock_test_answers_mock_test_question_id_mock_test_questions_id_fk" FOREIGN KEY ("mock_test_question_id") REFERENCES "public"."mock_test_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mock_test_attempts" ADD CONSTRAINT "mock_test_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mock_test_attempts" ADD CONSTRAINT "mock_test_attempts_mock_test_id_mock_tests_id_fk" FOREIGN KEY ("mock_test_id") REFERENCES "public"."mock_tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mock_test_questions" ADD CONSTRAINT "mock_test_questions_mock_test_id_mock_tests_id_fk" FOREIGN KEY ("mock_test_id") REFERENCES "public"."mock_tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_mock_test_answers_attempt_id" ON "mock_test_answers" USING btree ("attempt_id");--> statement-breakpoint
CREATE INDEX "idx_mock_test_answers_question_id" ON "mock_test_answers" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "idx_mock_test_answers_flagged" ON "mock_test_answers" USING btree ("flagged_for_human_review");--> statement-breakpoint
CREATE INDEX "idx_mock_test_attempts_user_id" ON "mock_test_attempts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_mock_test_attempts_test_id" ON "mock_test_attempts" USING btree ("mock_test_id");--> statement-breakpoint
CREATE INDEX "idx_mock_test_attempts_status" ON "mock_test_attempts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_mock_test_attempts_completed_at" ON "mock_test_attempts" USING btree ("completed_at");--> statement-breakpoint
CREATE INDEX "idx_mock_test_attempts_user_test" ON "mock_test_attempts" USING btree ("user_id","mock_test_id");--> statement-breakpoint
CREATE INDEX "idx_mock_test_questions_test_id" ON "mock_test_questions" USING btree ("mock_test_id");--> statement-breakpoint
CREATE INDEX "idx_mock_test_questions_question_id" ON "mock_test_questions" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "idx_mock_test_questions_section" ON "mock_test_questions" USING btree ("section");--> statement-breakpoint
CREATE INDEX "idx_mock_test_questions_order" ON "mock_test_questions" USING btree ("mock_test_id","order_index");--> statement-breakpoint
CREATE INDEX "idx_mock_tests_test_number" ON "mock_tests" USING btree ("test_number");--> statement-breakpoint
CREATE INDEX "idx_mock_tests_difficulty" ON "mock_tests" USING btree ("difficulty");--> statement-breakpoint
CREATE INDEX "idx_mock_tests_is_free" ON "mock_tests" USING btree ("is_free");--> statement-breakpoint
CREATE INDEX "idx_mock_tests_status" ON "mock_tests" USING btree ("status");