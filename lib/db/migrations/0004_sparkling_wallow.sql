CREATE TYPE "public"."conversation_role" AS ENUM('user', 'assistant', 'system');--> statement-breakpoint
CREATE TYPE "public"."conversation_session_type" AS ENUM('speaking_practice', 'mock_interview', 'pronunciation_coach', 'fluency_training', 'customer_support');--> statement-breakpoint
CREATE TYPE "public"."conversation_status" AS ENUM('active', 'completed', 'abandoned', 'error');--> statement-breakpoint
CREATE TYPE "public"."difficulty_level" AS ENUM('Easy', 'Medium', 'Hard');--> statement-breakpoint
CREATE TYPE "public"."listening_question_type" AS ENUM('summarize_spoken_text', 'multiple_choice_single', 'multiple_choice_multiple', 'fill_in_blanks', 'highlight_correct_summary', 'select_missing_word', 'highlight_incorrect_words', 'write_from_dictation');--> statement-breakpoint
CREATE TYPE "public"."reading_question_type" AS ENUM('multiple_choice_single', 'multiple_choice_multiple', 'reorder_paragraphs', 'fill_in_blanks', 'reading_writing_fill_blanks');--> statement-breakpoint
CREATE TYPE "public"."speaking_type" AS ENUM('read_aloud', 'repeat_sentence', 'describe_image', 'retell_lecture', 'answer_short_question', 'summarize_group_discussion', 'respond_to_a_situation');--> statement-breakpoint
CREATE TYPE "public"."writing_question_type" AS ENUM('summarize_written_text', 'write_essay');--> statement-breakpoint
CREATE TABLE "conversation_attempt_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"attempt_id" uuid NOT NULL,
	"attempt_type" text NOT NULL,
	"link_type" text DEFAULT 'generated_from',
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversation_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"session_type" "conversation_session_type" DEFAULT 'speaking_practice' NOT NULL,
	"status" "conversation_status" DEFAULT 'active' NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"ended_at" timestamp,
	"total_turns" integer DEFAULT 0 NOT NULL,
	"total_duration_ms" integer DEFAULT 0,
	"ai_provider" text DEFAULT 'openai',
	"model_used" text DEFAULT 'gpt-4o-realtime-preview',
	"token_usage" jsonb,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversation_turns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"turn_index" integer NOT NULL,
	"role" "conversation_role" NOT NULL,
	"audio_url" text,
	"transcript" text,
	"scores" jsonb,
	"duration_ms" integer,
	"silence_duration_ms" integer,
	"words_per_minute" numeric(6, 2),
	"pause_count" integer,
	"filler_word_count" integer,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listening_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"question_id" uuid NOT NULL,
	"user_response" jsonb NOT NULL,
	"scores" jsonb,
	"time_taken" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listening_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "listening_question_type" NOT NULL,
	"title" text NOT NULL,
	"prompt_text" text,
	"prompt_media_url" text,
	"correct_answers" jsonb NOT NULL,
	"options" jsonb,
	"transcript" text,
	"difficulty" "difficulty_level" DEFAULT 'Medium' NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reading_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"question_id" uuid NOT NULL,
	"user_response" jsonb NOT NULL,
	"scores" jsonb,
	"time_taken" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_scheduled_exam_dates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"exam_date" timestamp NOT NULL,
	"exam_name" text DEFAULT 'PTE Academic' NOT NULL,
	"is_primary" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "writing_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"question_id" uuid NOT NULL,
	"user_response" text NOT NULL,
	"scores" jsonb,
	"time_taken" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "reading_questions" ALTER COLUMN "difficulty" SET DEFAULT 'Medium'::"public"."difficulty_level";--> statement-breakpoint
ALTER TABLE "reading_questions" ALTER COLUMN "difficulty" SET DATA TYPE "public"."difficulty_level" USING "difficulty"::"public"."difficulty_level";--> statement-breakpoint
ALTER TABLE "speaking_attempts" ALTER COLUMN "type" SET DATA TYPE "public"."speaking_type" USING "type"::"public"."speaking_type";--> statement-breakpoint
ALTER TABLE "speaking_questions" ALTER COLUMN "type" SET DATA TYPE "public"."speaking_type" USING "type"::"public"."speaking_type";--> statement-breakpoint
ALTER TABLE "speaking_questions" ALTER COLUMN "difficulty" SET DEFAULT 'Medium'::"public"."difficulty_level";--> statement-breakpoint
ALTER TABLE "speaking_questions" ALTER COLUMN "difficulty" SET DATA TYPE "public"."difficulty_level" USING "difficulty"::"public"."difficulty_level";--> statement-breakpoint
ALTER TABLE "writing_questions" ALTER COLUMN "difficulty" SET DEFAULT 'Medium'::"public"."difficulty_level";--> statement-breakpoint
ALTER TABLE "writing_questions" ALTER COLUMN "difficulty" SET DATA TYPE "public"."difficulty_level" USING "difficulty"::"public"."difficulty_level";--> statement-breakpoint
ALTER TABLE "conversation_attempt_links" ADD CONSTRAINT "conversation_attempt_links_session_id_conversation_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."conversation_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_sessions" ADD CONSTRAINT "conversation_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_turns" ADD CONSTRAINT "conversation_turns_session_id_conversation_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."conversation_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listening_attempts" ADD CONSTRAINT "listening_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listening_attempts" ADD CONSTRAINT "listening_attempts_question_id_listening_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."listening_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reading_attempts" ADD CONSTRAINT "reading_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reading_attempts" ADD CONSTRAINT "reading_attempts_question_id_reading_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."reading_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_scheduled_exam_dates" ADD CONSTRAINT "user_scheduled_exam_dates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "writing_attempts" ADD CONSTRAINT "writing_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "writing_attempts" ADD CONSTRAINT "writing_attempts_question_id_writing_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."writing_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_conversation_links_session_id" ON "conversation_attempt_links" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_conversation_links_attempt_id" ON "conversation_attempt_links" USING btree ("attempt_id");--> statement-breakpoint
CREATE INDEX "idx_conversation_links_attempt_type" ON "conversation_attempt_links" USING btree ("attempt_type");--> statement-breakpoint
CREATE INDEX "idx_conversation_sessions_user_id" ON "conversation_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_conversation_sessions_status" ON "conversation_sessions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_conversation_sessions_type" ON "conversation_sessions" USING btree ("session_type");--> statement-breakpoint
CREATE INDEX "idx_conversation_sessions_created_at" ON "conversation_sessions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_conversation_turns_session_id" ON "conversation_turns" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_conversation_turns_turn_index" ON "conversation_turns" USING btree ("turn_index");--> statement-breakpoint
CREATE INDEX "idx_conversation_turns_role" ON "conversation_turns" USING btree ("role");--> statement-breakpoint
CREATE INDEX "idx_conversation_turns_created_at" ON "conversation_turns" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "listening_attempts_user_id_idx" ON "listening_attempts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "listening_attempts_question_id_idx" ON "listening_attempts" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "listening_attempts_created_at_idx" ON "listening_attempts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "listening_questions_type_idx" ON "listening_questions" USING btree ("type");--> statement-breakpoint
CREATE INDEX "listening_questions_difficulty_idx" ON "listening_questions" USING btree ("difficulty");--> statement-breakpoint
CREATE INDEX "listening_questions_created_at_idx" ON "listening_questions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "reading_attempts_user_id_idx" ON "reading_attempts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "reading_attempts_question_id_idx" ON "reading_attempts" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "reading_attempts_created_at_idx" ON "reading_attempts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_user_scheduled_exam_dates_user_id" ON "user_scheduled_exam_dates" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_scheduled_exam_dates_exam_date" ON "user_scheduled_exam_dates" USING btree ("exam_date");--> statement-breakpoint
CREATE INDEX "writing_attempts_user_id_idx" ON "writing_attempts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "writing_attempts_question_id_idx" ON "writing_attempts" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "writing_attempts_created_at_idx" ON "writing_attempts" USING btree ("created_at");