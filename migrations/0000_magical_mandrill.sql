CREATE TABLE `projects` (
	`contract_id` text PRIMARY KEY NOT NULL,
	`contract_name` text NOT NULL,
	`contractor` text NOT NULL,
	`implementing_office` text NOT NULL,
	`contract_cost` real NOT NULL,
	`contract_effectivity_date` text NOT NULL,
	`contract_expiry_date` text NOT NULL,
	`status` text NOT NULL,
	`accomplishment_in_percentage` integer NOT NULL,
	`region` text NOT NULL,
	`source_of_funds_desc` text DEFAULT '' NOT NULL,
	`source_of_funds_year` text DEFAULT '' NOT NULL,
	`source_of_funds_source` text DEFAULT '' NOT NULL,
	`year` text NOT NULL,
	`province` text DEFAULT '' NOT NULL,
	`municipality` text DEFAULT '' NOT NULL,
	`barangay` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `IDX_projects_region` ON `projects` (`region`);--> statement-breakpoint
CREATE INDEX `IDX_projects_implementing_office` ON `projects` (`implementing_office`);--> statement-breakpoint
CREATE INDEX `IDX_projects_province` ON `projects` (`province`);--> statement-breakpoint
CREATE INDEX `IDX_projects_municipality` ON `projects` (`municipality`);--> statement-breakpoint
CREATE INDEX `IDX_projects_barangay` ON `projects` (`barangay`);--> statement-breakpoint
CREATE INDEX `IDX_projects_status` ON `projects` (`status`);--> statement-breakpoint
CREATE INDEX `IDX_projects_year` ON `projects` (`year`);--> statement-breakpoint
CREATE INDEX `IDX_projects_contract_name` ON `projects` (`contract_name`);--> statement-breakpoint
CREATE INDEX `IDX_projects_contractor` ON `projects` (`contractor`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`sid` text PRIMARY KEY NOT NULL,
	`sess` text NOT NULL,
	`expire` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `IDX_session_expire` ON `sessions` (`expire`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text,
	`first_name` text,
	`last_name` text,
	`profile_image_url` text,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);