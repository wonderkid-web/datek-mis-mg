-- Observer Agent: storage health (MVP)

CREATE TABLE IF NOT EXISTS `observer_storage_health` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `device_ref_id` INT NOT NULL,
  `disk_device_id` VARCHAR(255) NOT NULL,
  `device_name` VARCHAR(255) NULL,
  `serial_number` VARCHAR(255) NULL,
  `model` VARCHAR(255) NULL,
  `media_type` VARCHAR(50) NULL,
  `bus_type` VARCHAR(50) NULL,
  `firmware_version` VARCHAR(100) NULL,
  `health_status` VARCHAR(30) NULL,
  `operational_status` VARCHAR(30) NULL,
  `predicted_failure` BOOLEAN NULL,
  `temperature_c` FLOAT NULL,
  `temperature_f` FLOAT NULL,
  `power_on_hours` INT NULL,
  `wear_level_percent` FLOAT NULL,
  `available_spare_percent` FLOAT NULL,
  `read_errors` INT NULL,
  `write_errors` INT NULL,
  `collected_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `observer_storage_health_device_disk_uidx` (`device_ref_id`, `disk_device_id`),
  KEY `observer_storage_health_device_ref_idx` (`device_ref_id`),
  KEY `observer_storage_health_health_status_idx` (`health_status`),
  KEY `observer_storage_health_predicted_failure_idx` (`predicted_failure`),
  CONSTRAINT `observer_storage_health_device_fk`
    FOREIGN KEY (`device_ref_id`) REFERENCES `observer_devices` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
);

