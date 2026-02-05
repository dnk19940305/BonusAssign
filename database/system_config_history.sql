/*
 Navicat Premium Dump SQL

 Source Server         : mydatabase
 Source Server Type    : MySQL
 Source Server Version : 80035 (8.0.35)
 Source Host           : localhost:3306
 Source Schema         : bonus_system

 Target Server Type    : MySQL
 Target Server Version : 80035 (8.0.35)
 File Encoding         : 65001

 Date: 16/01/2026 15:07:21
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for system_config_history
-- ----------------------------
DROP TABLE IF EXISTS `system_config_history`;
CREATE TABLE `system_config_history`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `config_id` int NOT NULL COMMENT '??ID',
  `category` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `key` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `old_value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '??',
  `new_value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '??',
  `changed_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `changed_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `change_reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '????',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_config_id`(`config_id` ASC) USING BTREE,
  INDEX `idx_changed_at`(`changed_at` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '???????' ROW_FORMAT = DYNAMIC;

SET FOREIGN_KEY_CHECKS = 1;
