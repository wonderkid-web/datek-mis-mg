ALTER TABLE `sparepart_movements`
  ADD COLUMN `source_assignment_id` INT NULL AFTER `user_id`;

CREATE INDEX `sparepart_movements_source_assignment_id_fkey`
  ON `sparepart_movements`(`source_assignment_id`);

ALTER TABLE `sparepart_movements`
  ADD CONSTRAINT `sparepart_movements_source_assignment_id_fkey`
  FOREIGN KEY (`source_assignment_id`) REFERENCES `asset_assignments`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;
