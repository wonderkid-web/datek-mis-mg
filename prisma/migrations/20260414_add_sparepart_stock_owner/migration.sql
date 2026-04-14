ALTER TABLE `sparepart_movements`
  ADD COLUMN `stock_owner_user_id` INT NULL AFTER `user_id`;

CREATE INDEX `sparepart_movements_stock_owner_user_id_fkey`
  ON `sparepart_movements`(`stock_owner_user_id`);

ALTER TABLE `sparepart_movements`
  ADD CONSTRAINT `sparepart_movements_stock_owner_user_id_fkey`
  FOREIGN KEY (`stock_owner_user_id`) REFERENCES `users`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;
