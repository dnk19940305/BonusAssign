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

 Date: 16/01/2026 19:14:14
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for project_applications
-- ----------------------------
DROP TABLE IF EXISTS `project_applications`;
CREATE TABLE `project_applications`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键',
  `project_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '项目id',
  `application_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '团队申请id',
  `status` int NULL DEFAULT NULL COMMENT '申请状态 0 待审批  1  已取消 2 已拒绝',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

SET FOREIGN_KEY_CHECKS = 1;
