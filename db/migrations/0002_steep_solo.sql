CREATE TABLE `sinav` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`hoca_ders_id` integer NOT NULL,
	`tur` text NOT NULL,
	`donem` text NOT NULL,
	`sube` text NOT NULL,
	`sorular` text NOT NULL,
	`ogrenciler` text NOT NULL,
	`yuklenme` integer NOT NULL,
	FOREIGN KEY (`hoca_ders_id`) REFERENCES `hoca_ders`(`id`) ON UPDATE no action ON DELETE cascade
);
