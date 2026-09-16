CREATE TABLE "cards" (
	"id" text NOT NULL,
	"user_id" text NOT NULL,
	"content" jsonb NOT NULL,
	"created_at" bigint NOT NULL,
	"updated_at" bigint NOT NULL,
	"correct" integer DEFAULT 0 NOT NULL,
	"wrong" integer DEFAULT 0 NOT NULL,
	"streak" integer DEFAULT 0 NOT NULL,
	"last_review" bigint,
	"next_review" bigint NOT NULL,
	"last_result" text,
	"version" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "cards_user_id_id_pk" PRIMARY KEY("user_id","id")
);
--> statement-breakpoint
CREATE TABLE "libraries" (
	"user_id" text PRIMARY KEY NOT NULL,
	"created_at" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" text NOT NULL,
	"user_id" text NOT NULL,
	"card_id" text NOT NULL,
	"correct" integer NOT NULL,
	"reviewed_at" bigint NOT NULL,
	"mode" text NOT NULL,
	"response" text NOT NULL,
	CONSTRAINT "reviews_user_id_id_pk" PRIMARY KEY("user_id","id")
);
--> statement-breakpoint
CREATE INDEX "idx_reviews_user_time" ON "reviews" USING btree ("user_id","reviewed_at");