CREATE TABLE `pc_monitor_options` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `value` VARCHAR(150) NOT NULL,
  CONSTRAINT `pc_monitor_options_pkey` PRIMARY KEY (`id`),
  CONSTRAINT `pc_monitor_options_value_key` UNIQUE (`value`)
);

CREATE TABLE `pc_motherboard_options` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `value` VARCHAR(150) NOT NULL,
  CONSTRAINT `pc_motherboard_options_pkey` PRIMARY KEY (`id`),
  CONSTRAINT `pc_motherboard_options_value_key` UNIQUE (`value`)
);

CREATE TABLE `pc_specs` (
  `assetId` INT NOT NULL,
  `processorOptionId` INT NULL,
  `ramOptionId` INT NULL,
  `storageTypeOptionId` INT NULL,
  `licenseOptionId` INT NULL,
  `osOptionId` INT NULL,
  `powerOptionId` INT NULL,
  `microsoftOfficeOptionId` INT NULL,
  `colorOptionId` INT NULL,
  `graphicOptionId` INT NULL,
  `monitorOptionId` INT NULL,
  `motherboardOptionId` INT NULL,
  `mac_lan` VARCHAR(17) NULL,
  `casing` VARCHAR(100) NULL,
  `ups` VARCHAR(100) NULL,
  CONSTRAINT `pc_specs_pkey` PRIMARY KEY (`assetId`),
  CONSTRAINT `pc_specs_mac_lan_key` UNIQUE (`mac_lan`)
);

CREATE INDEX `pc_specs_colorOptionId_fkey` ON `pc_specs`(`colorOptionId`);
CREATE INDEX `pc_specs_graphicOptionId_fkey` ON `pc_specs`(`graphicOptionId`);
CREATE INDEX `pc_specs_licenseOptionId_fkey` ON `pc_specs`(`licenseOptionId`);
CREATE INDEX `pc_specs_microsoftOfficeOptionId_fkey` ON `pc_specs`(`microsoftOfficeOptionId`);
CREATE INDEX `pc_specs_monitorOptionId_fkey` ON `pc_specs`(`monitorOptionId`);
CREATE INDEX `pc_specs_motherboardOptionId_fkey` ON `pc_specs`(`motherboardOptionId`);
CREATE INDEX `pc_specs_osOptionId_fkey` ON `pc_specs`(`osOptionId`);
CREATE INDEX `pc_specs_powerOptionId_fkey` ON `pc_specs`(`powerOptionId`);
CREATE INDEX `pc_specs_processorOptionId_fkey` ON `pc_specs`(`processorOptionId`);
CREATE INDEX `pc_specs_ramOptionId_fkey` ON `pc_specs`(`ramOptionId`);
CREATE INDEX `pc_specs_storageTypeOptionId_fkey` ON `pc_specs`(`storageTypeOptionId`);

ALTER TABLE `pc_specs`
  ADD CONSTRAINT `pc_specs_assetId_fkey`
    FOREIGN KEY (`assetId`) REFERENCES `assets`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `pc_specs_colorOptionId_fkey`
    FOREIGN KEY (`colorOptionId`) REFERENCES `laptop_color_options`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `pc_specs_graphicOptionId_fkey`
    FOREIGN KEY (`graphicOptionId`) REFERENCES `laptop_graphic_options`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `pc_specs_licenseOptionId_fkey`
    FOREIGN KEY (`licenseOptionId`) REFERENCES `laptop_license_options`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `pc_specs_microsoftOfficeOptionId_fkey`
    FOREIGN KEY (`microsoftOfficeOptionId`) REFERENCES `laptop_microsoft_office_options`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `pc_specs_monitorOptionId_fkey`
    FOREIGN KEY (`monitorOptionId`) REFERENCES `pc_monitor_options`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `pc_specs_motherboardOptionId_fkey`
    FOREIGN KEY (`motherboardOptionId`) REFERENCES `pc_motherboard_options`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `pc_specs_osOptionId_fkey`
    FOREIGN KEY (`osOptionId`) REFERENCES `laptop_os_options`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `pc_specs_powerOptionId_fkey`
    FOREIGN KEY (`powerOptionId`) REFERENCES `laptop_power_options`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `pc_specs_processorOptionId_fkey`
    FOREIGN KEY (`processorOptionId`) REFERENCES `laptop_processor_options`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `pc_specs_ramOptionId_fkey`
    FOREIGN KEY (`ramOptionId`) REFERENCES `laptop_ram_options`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `pc_specs_storageTypeOptionId_fkey`
    FOREIGN KEY (`storageTypeOptionId`) REFERENCES `laptop_storage_type_options`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO `asset_categories` (`nama`, `slug`)
SELECT 'Personal Computer', 'pc'
WHERE NOT EXISTS (
  SELECT 1
  FROM `asset_categories`
  WHERE `slug` IN ('pc', 'personal-computer')
     OR `nama` = 'Personal Computer'
);
