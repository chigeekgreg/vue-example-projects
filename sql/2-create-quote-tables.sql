DROP TABLE IF EXISTS `quotenotes`,`quoteitems`,`quotes`,`associates`;
CREATE TABLE `associates` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `address` VARCHAR(255) DEFAULT '',
    `commission` DECIMAL(9,2) DEFAULT '0.00'
);
CREATE TABLE `quotes` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `date` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `associateid` INT NOT NULL,
    `custid` INT NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `amount` DECIMAL(9,2) DEFAULT '0.00',
    `commission` DECIMAL(9,2) DEFAULT '0.00',
    `status` ENUM('open','finalized','sanctioned','ordered') DEFAULT 'open',
    FOREIGN KEY (`associateid`) REFERENCES `associates`(`id`)
);
CREATE TABLE `quoteitems` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `quoteid` INT NOT NULL,
    `text` TEXT DEFAULT '',
    `price` DECIMAL(9,2) DEFAULT '0.00',
    FOREIGN KEY (`quoteid`) REFERENCES `quotes`(`id`)
);
CREATE TABLE `quotenotes` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `quoteid` INT NOT NULL,
    `text` TEXT DEFAULT '',
    `private` BOOLEAN DEFAULT 0,
    FOREIGN KEY (`quoteid`) REFERENCES `quotes`(`id`)
);
