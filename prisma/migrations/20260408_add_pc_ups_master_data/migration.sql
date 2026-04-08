CREATE TABLE `pc_ups_options` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `value` VARCHAR(150) NOT NULL,
  CONSTRAINT `pc_ups_options_pkey` PRIMARY KEY (`id`),
  CONSTRAINT `pc_ups_options_value_key` UNIQUE (`value`)
);

ALTER TABLE `pc_specs`
  ADD COLUMN `upsOptionId` INT NULL;

INSERT INTO `pc_ups_options` (`value`)
SELECT DISTINCT `ups`
FROM `pc_specs`
WHERE `ups` IS NOT NULL
  AND `ups` <> '';

UPDATE `pc_specs` AS `pcs`
JOIN `pc_ups_options` AS `puo`
  ON `puo`.`value` = `pcs`.`ups`
SET `pcs`.`upsOptionId` = `puo`.`id`
WHERE `pcs`.`ups` IS NOT NULL
  AND `pcs`.`ups` <> '';

CREATE INDEX `pc_specs_upsOptionId_fkey` ON `pc_specs`(`upsOptionId`);

ALTER TABLE `pc_specs`
  ADD CONSTRAINT `pc_specs_upsOptionId_fkey`
    FOREIGN KEY (`upsOptionId`) REFERENCES `pc_ups_options`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `pc_specs`
  DROP COLUMN `ups`;
