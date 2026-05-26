-- Observer Agent: add device alias for internal labeling

ALTER TABLE `observer_devices`
  ADD COLUMN `alias_name` VARCHAR(120) NULL AFTER `hostname`;
