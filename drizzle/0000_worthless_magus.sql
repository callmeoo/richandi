CREATE TABLE `cards` (
	`id` text NOT NULL,
	`user_id` text NOT NULL,
	`content` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`correct` integer DEFAULT 0 NOT NULL,
	`wrong` integer DEFAULT 0 NOT NULL,
	`streak` integer DEFAULT 0 NOT NULL,
	`last_review` integer,
	`next_review` integer NOT NULL,
	`last_result` text,
	`version` integer DEFAULT 1 NOT NULL,
	PRIMARY KEY(`user_id`, `id`)
);
--> statement-breakpoint
CREATE TABLE `libraries` (
	`user_id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` text NOT NULL,
	`user_id` text NOT NULL,
	`card_id` text NOT NULL,
	`correct` integer NOT NULL,
	`reviewed_at` integer NOT NULL,
	`mode` text NOT NULL,
	`response` text NOT NULL,
	PRIMARY KEY(`user_id`, `id`)
);
--> statement-breakpoint
CREATE INDEX `idx_reviews_user_time` ON `reviews` (`user_id`,`reviewed_at`);