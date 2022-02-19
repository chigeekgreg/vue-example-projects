DROP TABLE IF EXISTS `orderitems`,`orders`,`inventory`,`brackets`;
CREATE TABLE `brackets` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `weight` DECIMAL(9,2) DEFAULT '0.00',
    `cost` DECIMAL(9,2) DEFAULT '0.00'
);
CREATE TABLE `inventory` (
    `id` INT PRIMARY KEY, -- REFERENCES csci467.parts(number)
    `quantity` INT
);
CREATE TABLE `orders` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `date` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `amount` DECIMAL(9,2) DEFAULT '0.00',
    `weight` DECIMAL(9,2) DEFAULT '0.00',
    `shipping` DECIMAL(9,2) DEFAULT '0.00',
    `address` VARCHAR(255) NOT NULL,
    `status` ENUM('open','filled') DEFAULT 'open'
);
CREATE TABLE `orderitems` (
    `orderid` INT NOT NULL,
    `partnumber` INT NOT NULL, -- REFERENCES csci467.parts(number)
    `quantity` INT NOT NULL,
    PRIMARY KEY (`orderid`,`partnumber`),
    FOREIGN KEY (`orderid`) REFERENCES `orders`(`id`)
    ON DELETE CASCADE
);
