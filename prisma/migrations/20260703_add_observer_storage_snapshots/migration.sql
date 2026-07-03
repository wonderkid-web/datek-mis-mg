CREATE TABLE `observer_storage_snapshots` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `device_ref_id` INTEGER NOT NULL,
  `drive_letter` VARCHAR(16) NOT NULL,
  `total_gb` INTEGER NULL,
  `free_gb` INTEGER NULL,
  `free_percent` FLOAT NULL,
  `status` VARCHAR(20) NULL,
  `collected_at` DATETIME(3) NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  UNIQUE INDEX `observer_storage_snapshots_device_drive_collected_uidx`(`device_ref_id`, `drive_letter`, `collected_at`),
  INDEX `observer_storage_snapshots_device_drive_collected_idx`(`device_ref_id`, `drive_letter`, `collected_at`),
  INDEX `observer_storage_snapshots_collected_at_idx`(`collected_at`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `observer_storage_snapshots`
  ADD CONSTRAINT `observer_storage_snapshots_device_ref_id_fkey`
  FOREIGN KEY (`device_ref_id`) REFERENCES `observer_devices`(`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;
