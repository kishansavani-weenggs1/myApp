CREATE TABLE `chat_groups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`group_name` varchar(255) NOT NULL,
	`group_admin_id` int NOT NULL,
	`updated_id` int,
	`deleted_id` int,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` datetime,
	CONSTRAINT `chat_groups_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `group_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`is_admin` boolean NOT NULL DEFAULT false,
	`created_id` int NOT NULL,
	`updated_id` int,
	`deleted_id` int,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` datetime,
	CONSTRAINT `group_members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `group_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`from_user_id` int NOT NULL,
	`group_id` int NOT NULL,
	`message` text NOT NULL,
	`status` enum('SENT','DELIVERED','READ') NOT NULL DEFAULT 'SENT',
	`updated_id` int,
	`deleted_id` int,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` datetime,
	CONSTRAINT `group_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `file_uploads` DROP FOREIGN KEY `file_uploads_created_id_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `chat_groups` ADD CONSTRAINT `chat_groups_group_admin_id_users_id_fk` FOREIGN KEY (`group_admin_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `group_members` ADD CONSTRAINT `group_members_group_id_chat_groups_id_fk` FOREIGN KEY (`group_id`) REFERENCES `chat_groups`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `group_members` ADD CONSTRAINT `group_members_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `group_messages` ADD CONSTRAINT `group_messages_from_user_id_users_id_fk` FOREIGN KEY (`from_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `group_messages` ADD CONSTRAINT `group_messages_group_id_chat_groups_id_fk` FOREIGN KEY (`group_id`) REFERENCES `chat_groups`(`id`) ON DELETE no action ON UPDATE no action;