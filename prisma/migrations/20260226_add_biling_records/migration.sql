CREATE TABLE `biling_records` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `call_date` DATETIME(3) NOT NULL,
  `userId` INT NOT NULL,
  `extension` INT NOT NULL,
  `dial` VARCHAR(255) NOT NULL,
  `duration` VARCHAR(20) NOT NULL,
  `trunk` INT NOT NULL,
  `pstn` INT NOT NULL,
  `cost` DECIMAL(12, 2) NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  CONSTRAINT `biling_records_pkey` PRIMARY KEY (`id`),
  CONSTRAINT `biling_records_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX `biling_records_userId_idx` ON `biling_records`(`userId`);
