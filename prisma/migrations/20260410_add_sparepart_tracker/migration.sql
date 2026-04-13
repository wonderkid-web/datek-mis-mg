CREATE TABLE `sparepart_movements` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `device_family` ENUM('LAPTOP', 'INTEL_NUC', 'PC') NOT NULL,
  `part_type` ENUM('BRAND', 'TYPE', 'PROCESSOR', 'RAM', 'STORAGE', 'OS', 'POWER', 'LICENSE', 'MICROSOFT_OFFICE', 'COLOR', 'GRAPHIC', 'VGA', 'MONITOR', 'MOTHERBOARD', 'UPS') NOT NULL,
  `source_option_id` INT NOT NULL,
  `source_option_value` VARCHAR(255) NOT NULL,
  `movement_type` ENUM('MASUK', 'PAKAI', 'ADJUSTMENT') NOT NULL,
  `adjustment_direction` ENUM('INCREASE', 'DECREASE') NULL,
  `quantity` INT NOT NULL,
  `moved_at` DATETIME(3) NOT NULL,
  `user_id` INT NULL,
  `notes` TEXT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

  INDEX `sparepart_movements_item_lookup_idx`(`device_family`, `part_type`, `source_option_id`),
  INDEX `sparepart_movements_moved_at_idx`(`moved_at`),
  INDEX `sparepart_movements_movement_type_idx`(`movement_type`),
  INDEX `sparepart_movements_userId_fkey`(`user_id`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `sparepart_movements`
  ADD CONSTRAINT `sparepart_movements_userId_fkey`
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
  ON DELETE SET NULL
  ON UPDATE CASCADE;
