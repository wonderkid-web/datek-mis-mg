-- CreateTable
CREATE TABLE `service_records` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ticketHelpdesk` VARCHAR(191) NOT NULL,
    `repairType` VARCHAR(191) NOT NULL,
    `cost` DECIMAL(12, 2) NOT NULL,
    `remarks` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `assetAssignmentId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `service_records` ADD CONSTRAINT `service_records_assetAssignmentId_fkey` FOREIGN KEY (`assetAssignmentId`) REFERENCES `asset_assignments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
