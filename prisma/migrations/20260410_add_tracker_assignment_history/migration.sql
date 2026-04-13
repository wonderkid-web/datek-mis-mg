CREATE TABLE `asset_assignment_histories` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `asset_id` INT NOT NULL,
  `user_id` INT NULL,
  `nomor_asset` VARCHAR(50) NULL,
  `catatan` TEXT NULL,
  `started_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `ended_at` DATETIME(3) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

  INDEX `asset_assignment_histories_asset_started_idx`(`asset_id`, `started_at`),
  INDEX `asset_assignment_histories_asset_ended_idx`(`asset_id`, `ended_at`),
  INDEX `asset_assignment_histories_user_id_fkey`(`user_id`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `asset_assignment_histories`
  ADD CONSTRAINT `asset_assignment_histories_asset_id_fkey`
  FOREIGN KEY (`asset_id`) REFERENCES `assets`(`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE `asset_assignment_histories`
  ADD CONSTRAINT `asset_assignment_histories_user_id_fkey`
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
  ON DELETE SET NULL
  ON UPDATE CASCADE;

INSERT INTO `asset_assignment_histories` (
  `asset_id`,
  `user_id`,
  `nomor_asset`,
  `catatan`,
  `started_at`,
  `ended_at`,
  `created_at`,
  `updated_at`
)
SELECT
  `asset_id`,
  `user_id`,
  `nomor_asset`,
  `catatan`,
  `created_at`,
  NULL,
  `created_at`,
  `updated_at`
FROM `asset_assignments`;
