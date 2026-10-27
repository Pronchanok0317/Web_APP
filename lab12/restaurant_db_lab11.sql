USE `restaurant_db`;

DROP TABLE IF EXISTS `menus`;
DROP TABLE IF EXISTS `types`;

CREATE TABLE `types` (
  `typeId` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(120) NOT NULL,
  PRIMARY KEY (`typeId`),
  UNIQUE KEY `uk_types_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `menus` (
  `menuId` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(180) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `isBestSeller` tinyint(1) NOT NULL DEFAULT 0,
  `typeId` int(10) UNSIGNED NOT NULL,
  PRIMARY KEY (`menuId`),
  KEY `idx_menus_typeId` (`typeId`),
  CONSTRAINT `fk_menus_type`
    FOREIGN KEY (`typeId`)
    REFERENCES `types` (`typeId`)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `types` (`typeId`, `name`) VALUES
(1, 'อาหารรสจัด'),
(2, 'อาหารจานหลัก');

INSERT INTO `menus` (`menuId`, `name`, `price`, `isBestSeller`, `typeId`) VALUES
(1, 'ส้มตำไทย', 60.00, 1, 1),
(2, 'ต้มยำกุ้งน้ำข้น', 120.00, 1, 1),
(3, 'ผัดไทยกุ้งสด', 80.00, 1, 2),
(4, 'ไก่ทอดสมุนไพร', 90.00, 0, 2);
