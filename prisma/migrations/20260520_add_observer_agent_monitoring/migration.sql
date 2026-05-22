-- Observer Agent monitoring (MVP)

CREATE TABLE `observer_devices` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `device_id` VARCHAR(80) NOT NULL,
  `hostname` VARCHAR(255) NOT NULL,
  `username` VARCHAR(255) NULL,
  `ip_address` VARCHAR(45) NULL,
  `os_name` VARCHAR(255) NULL,
  `os_version` VARCHAR(255) NULL,
  `os_build` VARCHAR(255) NULL,
  `agent_version` VARCHAR(50) NULL,
  `last_seen` DATETIME NULL,
  `last_report_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `observer_devices_device_id_uq` (`device_id`),
  KEY `observer_devices_hostname_idx` (`hostname`),
  KEY `observer_devices_last_seen_idx` (`last_seen`),
  KEY `observer_devices_last_report_idx` (`last_report_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `observer_hardware_specs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `device_ref_id` INT NOT NULL,
  `cpu` VARCHAR(255) NULL,
  `ram_gb` INT NULL,
  `manufacturer` VARCHAR(255) NULL,
  `model` VARCHAR(255) NULL,
  `serial_number` VARCHAR(255) NULL,
  `gpu` VARCHAR(255) NULL,
  `motherboard` VARCHAR(255) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `observer_hardware_specs_device_ref_uq` (`device_ref_id`),
  KEY `observer_hardware_specs_device_ref_idx` (`device_ref_id`),
  CONSTRAINT `observer_hardware_specs_device_ref_fk`
    FOREIGN KEY (`device_ref_id`) REFERENCES `observer_devices` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `observer_storage_drives` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `device_ref_id` INT NOT NULL,
  `drive_letter` VARCHAR(16) NOT NULL,
  `total_gb` INT NULL,
  `free_gb` INT NULL,
  `free_percent` FLOAT NULL,
  `status` VARCHAR(20) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `observer_storage_drives_device_ref_idx` (`device_ref_id`),
  KEY `observer_storage_drives_status_idx` (`status`),
  CONSTRAINT `observer_storage_drives_device_ref_fk`
    FOREIGN KEY (`device_ref_id`) REFERENCES `observer_devices` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `observer_installed_apps` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `device_ref_id` INT NOT NULL,
  `app_name` VARCHAR(255) NOT NULL,
  `app_version` VARCHAR(255) NULL,
  `publisher` VARCHAR(255) NULL,
  `install_date` DATE NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `observer_installed_apps_device_ref_idx` (`device_ref_id`),
  KEY `observer_installed_apps_app_name_idx` (`app_name`),
  CONSTRAINT `observer_installed_apps_device_ref_fk`
    FOREIGN KEY (`device_ref_id`) REFERENCES `observer_devices` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `observer_agent_logs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `device_ref_id` INT NOT NULL,
  `event_type` VARCHAR(100) NOT NULL,
  `message` TEXT NOT NULL,
  `log_level` VARCHAR(30) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `observer_agent_logs_device_ref_idx` (`device_ref_id`),
  KEY `observer_agent_logs_event_type_idx` (`event_type`),
  CONSTRAINT `observer_agent_logs_device_ref_fk`
    FOREIGN KEY (`device_ref_id`) REFERENCES `observer_devices` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `observer_sync_history` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `device_ref_id` INT NOT NULL,
  `sync_kind` VARCHAR(30) NOT NULL,
  `collected_at` DATETIME NULL,
  `received_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `observer_sync_history_device_ref_idx` (`device_ref_id`),
  KEY `observer_sync_history_kind_idx` (`sync_kind`),
  CONSTRAINT `observer_sync_history_device_ref_fk`
    FOREIGN KEY (`device_ref_id`) REFERENCES `observer_devices` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

