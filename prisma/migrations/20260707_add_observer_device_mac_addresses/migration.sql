-- Observer Agent: store LAN/WLAN MAC addresses from report payload

ALTER TABLE `observer_devices`
  ADD COLUMN `lan_mac_address` VARCHAR(17) NULL AFTER `public_ip`,
  ADD COLUMN `wlan_mac_address` VARCHAR(17) NULL AFTER `lan_mac_address`;
