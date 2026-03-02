ALTER TABLE `call_outgoing_options`
  MODIFY `value` INT NOT NULL,
  ADD COLUMN `line` INT NOT NULL DEFAULT 0,
  ADD COLUMN `company` VARCHAR(255) NOT NULL DEFAULT '';

ALTER TABLE `phone_accounts`
  DROP FOREIGN KEY `phone_accounts_co_group_id_fkey`;

DROP INDEX `phone_accounts_co_group_id_idx` ON `phone_accounts`;

ALTER TABLE `phone_accounts`
  DROP COLUMN `co_group_id`;

DROP TABLE `co_group_options`;

CREATE TABLE `trunks` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nomor_line` INT NOT NULL,
  `company` VARCHAR(255) NOT NULL,
  `extension` INT NOT NULL,
  CONSTRAINT `trunks_pkey` PRIMARY KEY (`id`),
  CONSTRAINT `trunks_nomor_line_key` UNIQUE (`nomor_line`)
);

CREATE TABLE `pstns` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `pstn_code` INT NOT NULL,
  `pstn_name` VARCHAR(255) NOT NULL,
  CONSTRAINT `pstns_pkey` PRIMARY KEY (`id`),
  CONSTRAINT `pstns_pstn_code_key` UNIQUE (`pstn_code`)
);
