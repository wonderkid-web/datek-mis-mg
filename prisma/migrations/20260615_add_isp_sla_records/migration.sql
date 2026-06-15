CREATE TABLE `isp_sla_records` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `sbu` VARCHAR(255) NOT NULL,
  `month` INT NOT NULL,
  `year` INT NOT NULL,
  `ispId` INT NOT NULL,
  `contract` VARCHAR(255) NOT NULL,
  `actualisation` DOUBLE NOT NULL,
  `uptime_seconds` INT NOT NULL,
  `downtime_seconds` INT NOT NULL,
  `remarks` TEXT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  CONSTRAINT `isp_sla_records_pkey` PRIMARY KEY (`id`),
  CONSTRAINT `isp_sla_records_ispId_fkey` FOREIGN KEY (`ispId`) REFERENCES `isps`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX `isp_sla_records_isp_id_idx` ON `isp_sla_records`(`ispId`);
CREATE INDEX `isp_sla_records_period_idx` ON `isp_sla_records`(`year`, `month`);
CREATE INDEX `isp_sla_records_sbu_idx` ON `isp_sla_records`(`sbu`);
