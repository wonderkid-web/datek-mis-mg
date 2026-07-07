-- Observer Agent: central runtime config for heartbeat/report intervals

CREATE TABLE `observer_runtime_configs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `scope_type` VARCHAR(30) NOT NULL,
  `scope_key` VARCHAR(120) NOT NULL,
  `heartbeat_interval_minutes` INT NOT NULL,
  `full_report_interval_hours` INT NOT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `observer_runtime_configs_scope_uidx` (`scope_type`, `scope_key`),
  KEY `observer_runtime_configs_scope_active_idx` (`scope_type`, `is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `observer_runtime_configs`
  (`scope_type`, `scope_key`, `heartbeat_interval_minutes`, `full_report_interval_hours`, `is_active`)
VALUES
  ('GLOBAL', 'global', 3, 24, TRUE);
