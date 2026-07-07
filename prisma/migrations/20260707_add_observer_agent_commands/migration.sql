-- Observer Agent: one-time polling commands for manual full report requests

CREATE TABLE `observer_agent_commands` (
  `id` VARCHAR(40) NOT NULL,
  `command_type` VARCHAR(80) NOT NULL,
  `target_scope` VARCHAR(30) NOT NULL,
  `target_device_id` VARCHAR(80) NULL,
  `requested_by` VARCHAR(255) NULL,
  `requested_by_email` VARCHAR(255) NULL,
  `requested_at` DATETIME NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `status` VARCHAR(30) NOT NULL,
  `delivered_at` DATETIME NULL,
  `completed_at` DATETIME NULL,
  `cancelled_at` DATETIME NULL,
  `batch_id` VARCHAR(40) NULL,
  `delivery_count` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `observer_agent_commands_type_status_exp_idx` (`command_type`, `status`, `expires_at`),
  KEY `observer_agent_commands_target_status_idx` (`target_scope`, `target_device_id`, `status`),
  KEY `observer_agent_commands_batch_idx` (`batch_id`),
  KEY `observer_agent_commands_requested_idx` (`requested_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
