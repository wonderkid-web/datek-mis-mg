CREATE TABLE `call_outgoing_options` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `value` VARCHAR(100) NOT NULL,
  CONSTRAINT `call_outgoing_options_pkey` PRIMARY KEY (`id`),
  CONSTRAINT `call_outgoing_options_value_key` UNIQUE (`value`)
);

CREATE TABLE `co_group_options` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `value` VARCHAR(100) NOT NULL,
  CONSTRAINT `co_group_options_pkey` PRIMARY KEY (`id`),
  CONSTRAINT `co_group_options_value_key` UNIQUE (`value`)
);

CREATE TABLE `phone_accounts` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `userId` INT NOT NULL,
  `extension` INT NOT NULL,
  `account` INT NOT NULL,
  `code_dial` VARCHAR(255) NOT NULL,
  `deposit` DECIMAL(12, 2) NOT NULL,
  `call_outgoing_id` INT NOT NULL,
  `co_group_id` INT NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  CONSTRAINT `phone_accounts_pkey` PRIMARY KEY (`id`),
  CONSTRAINT `phone_accounts_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `phone_accounts_call_outgoing_id_fkey` FOREIGN KEY (`call_outgoing_id`) REFERENCES `call_outgoing_options`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `phone_accounts_co_group_id_fkey` FOREIGN KEY (`co_group_id`) REFERENCES `co_group_options`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX `phone_accounts_userId_idx` ON `phone_accounts`(`userId`);
CREATE INDEX `phone_accounts_call_outgoing_id_idx` ON `phone_accounts`(`call_outgoing_id`);
CREATE INDEX `phone_accounts_co_group_id_idx` ON `phone_accounts`(`co_group_id`);
