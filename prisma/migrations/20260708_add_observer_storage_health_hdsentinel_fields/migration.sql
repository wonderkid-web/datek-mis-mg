-- Observer Agent: HD Sentinel health details

ALTER TABLE `observer_storage_health`
  ADD COLUMN `health_percent` FLOAT NULL AFTER `health_status`,
  ADD COLUMN `health_source` VARCHAR(40) NULL AFTER `health_percent`;

CREATE INDEX `observer_storage_health_health_source_idx`
  ON `observer_storage_health`(`health_source`);
