CREATE TABLE `problem_sequences` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `ticket_number` VARCHAR(30) NOT NULL,
  `sbu` VARCHAR(255) NOT NULL,
  `isp_id` INT NOT NULL,
  `pic` VARCHAR(255) NOT NULL,
  `date_down` DATETIME(3) NOT NULL,
  `date_done_up` DATETIME(3) NOT NULL,
  `issue` TEXT NOT NULL,
  `trouble` TEXT NOT NULL,
  `solved` TEXT NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  CONSTRAINT `problem_sequences_pkey` PRIMARY KEY (`id`),
  CONSTRAINT `problem_sequences_ticket_number_key` UNIQUE (`ticket_number`),
  CONSTRAINT `problem_sequences_ispId_fkey` FOREIGN KEY (`isp_id`) REFERENCES `isps`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX `problem_sequences_ispId_idx` ON `problem_sequences`(`isp_id`);
