CREATE TABLE `hoca_ders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`obs_ders_id` text NOT NULL,
	`obs_birim_id` text NOT NULL,
	`eklenme` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `hoca_ders_user_id_obs_ders_id_unique` ON `hoca_ders` (`user_id`,`obs_ders_id`);