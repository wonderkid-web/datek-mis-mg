-- Observer Agent: add public IP from heartbeat

ALTER TABLE `observer_devices`
  ADD COLUMN `public_ip` VARCHAR(45) NULL AFTER `ip_address`,
  ADD KEY `observer_devices_public_ip_idx` (`public_ip`);
