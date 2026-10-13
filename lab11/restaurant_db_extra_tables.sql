USE `restaurant_db`;

CREATE TABLE IF NOT EXISTS `orders` (
  `orderId` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `customerName` varchar(180) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `deliveryDate` date NOT NULL,
  `deliveryTime` time NOT NULL,
  `address` varchar(255) NOT NULL,
  `total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`orderId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `order_items` (
  `orderItemId` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `orderId` int(10) UNSIGNED NOT NULL,
  `menuId` int(10) UNSIGNED NOT NULL,
  `qty` int(10) UNSIGNED NOT NULL DEFAULT 1,
  `note` varchar(255) DEFAULT '',
  `price` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  PRIMARY KEY (`orderItemId`),
  KEY `idx_order_items_orderId` (`orderId`),
  KEY `idx_order_items_menuId` (`menuId`),
  CONSTRAINT `fk_order_items_order`
    FOREIGN KEY (`orderId`)
    REFERENCES `orders` (`orderId`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_order_items_menu`
    FOREIGN KEY (`menuId`)
    REFERENCES `menus` (`menuId`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
