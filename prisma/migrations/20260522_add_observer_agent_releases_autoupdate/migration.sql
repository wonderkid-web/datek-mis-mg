-- Observer Agent auto-update: release registry + heartbeat update status

ALTER TABLE `observer_devices`
  ADD COLUMN `current_version` VARCHAR(50) NULL AFTER `agent_version`,
  ADD COLUMN `last_update_status` VARCHAR(40) NULL AFTER `current_version`,
  ADD COLUMN `last_update_version` VARCHAR(50) NULL AFTER `last_update_status`,
  ADD COLUMN `last_update_message` VARCHAR(500) NULL AFTER `last_update_version`,
  ADD COLUMN `last_update_at` DATETIME NULL AFTER `last_update_message`,
  ADD KEY `observer_devices_current_version_idx` (`current_version`),
  ADD KEY `observer_devices_update_status_idx` (`last_update_status`);

CREATE TABLE `observer_agent_releases` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `version` VARCHAR(80) NOT NULL,
  `original_name` VARCHAR(255) NOT NULL,
  `stored_name` VARCHAR(255) NOT NULL,
  `size_bytes` INT NOT NULL,
  `sha256` CHAR(64) NOT NULL,
  `uploaded_at` DATETIME NOT NULL,
  `uploaded_by_name` VARCHAR(255) NULL,
  `uploaded_by_email` VARCHAR(255) NULL,
  `is_latest` BOOLEAN NOT NULL DEFAULT FALSE,
  `release_notes` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `observer_agent_releases_version_uq` (`version`),
  UNIQUE KEY `observer_agent_releases_stored_name_uq` (`stored_name`),
  KEY `observer_agent_releases_is_latest_idx` (`is_latest`),
  KEY `observer_agent_releases_uploaded_at_idx` (`uploaded_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
