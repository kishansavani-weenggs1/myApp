CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`from_user_id` int NOT NULL,
	`to_user_id` int NOT NULL,
	`message` text NOT NULL,
	`status` enum('SENT','DELIVERED','READ') NOT NULL DEFAULT 'SENT',
	`updated_id` int,
	`deleted_id` int,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` datetime,
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `messages` ADD CONSTRAINT `messages_from_user_id_users_id_fk` FOREIGN KEY (`from_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `messages` ADD CONSTRAINT `messages_to_user_id_users_id_fk` FOREIGN KEY (`to_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `file_uploads` ADD CONSTRAINT `file_uploads_created_id_users_id_fk` FOREIGN KEY (`created_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `comments` DROP COLUMN `created_id`;--> statement-breakpoint
ALTER TABLE `posts` DROP COLUMN `created_id`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `created_id`;