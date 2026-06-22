CREATE TABLE `office_floors` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(120) NOT NULL,
  `slug` VARCHAR(120) NOT NULL,
  `description` VARCHAR(255) NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `canvas_columns` INT NOT NULL DEFAULT 12,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

  UNIQUE INDEX `office_floors_slug_key`(`slug`),
  INDEX `office_floors_sort_order_idx`(`sort_order`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `office_desk_groups` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `floor_id` INT NOT NULL,
  `name` VARCHAR(120) NOT NULL,
  `department` VARCHAR(120) NULL,
  `department_color` VARCHAR(30) NULL,
  `layout_kind` ENUM('DOUBLE', 'SINGLE_TOP', 'SINGLE_BOTTOM') NOT NULL DEFAULT 'DOUBLE',
  `grid_column` INT NOT NULL DEFAULT 1,
  `grid_row` INT NOT NULL DEFAULT 1,
  `column_span` INT NOT NULL DEFAULT 4,
  `seats_per_side` INT NOT NULL DEFAULT 2,
  `sort_order` INT NOT NULL DEFAULT 0,
  `notes` VARCHAR(255) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

  INDEX `office_desk_groups_floor_sort_idx`(`floor_id`, `sort_order`),
  INDEX `office_desk_groups_floor_grid_idx`(`floor_id`, `grid_row`, `grid_column`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `office_floor_zones` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `floor_id` INT NOT NULL,
  `kind` ENUM('WALKWAY') NOT NULL DEFAULT 'WALKWAY',
  `name` VARCHAR(120) NOT NULL,
  `color` VARCHAR(30) NULL,
  `grid_column` INT NOT NULL DEFAULT 1,
  `grid_row` INT NOT NULL DEFAULT 1,
  `column_span` INT NOT NULL DEFAULT 2,
  `row_span` INT NOT NULL DEFAULT 1,
  `sort_order` INT NOT NULL DEFAULT 0,
  `notes` VARCHAR(255) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

  INDEX `office_floor_zones_floor_sort_idx`(`floor_id`, `sort_order`),
  INDEX `office_floor_zones_floor_grid_idx`(`floor_id`, `grid_row`, `grid_column`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `office_seats` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `desk_group_id` INT NOT NULL,
  `side` ENUM('TOP', 'BOTTOM') NOT NULL,
  `position` INT NOT NULL,
  `user_id` INT NULL,
  `label` VARCHAR(120) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

  UNIQUE INDEX `office_seats_desk_group_side_position_uidx`(`desk_group_id`, `side`, `position`),
  UNIQUE INDEX `office_seats_user_id_uidx`(`user_id`),
  INDEX `office_seats_user_id_idx`(`user_id`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `office_desk_groups`
  ADD CONSTRAINT `office_desk_groups_floor_id_fkey`
  FOREIGN KEY (`floor_id`) REFERENCES `office_floors`(`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE `office_seats`
  ADD CONSTRAINT `office_seats_desk_group_id_fkey`
  FOREIGN KEY (`desk_group_id`) REFERENCES `office_desk_groups`(`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE `office_floor_zones`
  ADD CONSTRAINT `office_floor_zones_floor_id_fkey`
  FOREIGN KEY (`floor_id`) REFERENCES `office_floors`(`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE `office_seats`
  ADD CONSTRAINT `office_seats_user_id_fkey`
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
  ON DELETE SET NULL
  ON UPDATE CASCADE;
