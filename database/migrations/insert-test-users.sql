-- 创建测试用户（密码统一为: test123）
INSERT INTO users (id, username, password, real_name, email, role_id, status) VALUES 
('user_hr001', 'hr_manager', '$2b$10$EixZaYVK1fsbw1ZfbX3OXe.PlgKDnXR3d5w5L7TY8N.xqCxDLsA7y', '王人事', 'hr@example.com', 'Qz8jzlt6I2qitXpw', 1),
('user_pm001', 'project_manager', '$2b$10$EixZaYVK1fsbw1ZfbX3OXe.PlgKDnXR3d5w5L7TY8N.xqCxDLsA7y', '张项目', 'pm@example.com', 'CdFv8NCPauLjt7se', 1),
('user_test001', 'test_user', '$2b$10$EixZaYVK1fsbw1ZfbX3OXe.PlgKDnXR3d5w5L7TY8N.xqCxDLsA7y', '李测试', 'test@example.com', 'role_user', 1);
