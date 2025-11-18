CREATE TABLE "pte_categories" (
	"id" integer PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"icon" text,
	"code" text NOT NULL,
	"scoring_type" text,
	"short_name" text,
	"first_question_id" integer,
	"color" text,
	"parent" integer,
	"practice_count" integer DEFAULT 0,
	"question_count" integer DEFAULT 0,
	"video_link" text
);
