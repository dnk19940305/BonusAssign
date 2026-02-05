-- 里程碑协作功能相关表

-- 1. 里程碑讨论表
CREATE TABLE IF NOT EXISTS milestone_discussions (
  id VARCHAR(50) PRIMARY KEY COMMENT '讨论ID',
  milestone_id VARCHAR(50) NOT NULL COMMENT '里程碑ID',
  project_id VARCHAR(50) NOT NULL COMMENT '项目ID',
  user_id VARCHAR(50) NOT NULL COMMENT '发布用户ID',
  parent_id VARCHAR(50) COMMENT '父评论ID(回复用)',
  content TEXT NOT NULL COMMENT '讨论内容',
  mentions JSON COMMENT '提及的用户ID列表',
  attachments JSON COMMENT '附件列表',
  is_pinned BOOLEAN DEFAULT FALSE COMMENT '是否置顶',
  is_deleted BOOLEAN DEFAULT FALSE COMMENT '是否删除',
  like_count INT DEFAULT 0 COMMENT '点赞数',
  reply_count INT DEFAULT 0 COMMENT '回复数',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_milestone_id (milestone_id),
  INDEX idx_project_id (project_id),
  INDEX idx_user_id (user_id),
  INDEX idx_parent_id (parent_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='里程碑讨论表';

-- 2. 里程碑附件表
CREATE TABLE IF NOT EXISTS milestone_attachments (
  id VARCHAR(50) PRIMARY KEY COMMENT '附件ID',
  milestone_id VARCHAR(50) NOT NULL COMMENT '里程碑ID',
  project_id VARCHAR(50) NOT NULL COMMENT '项目ID',
  uploaded_by VARCHAR(50) NOT NULL COMMENT '上传用户ID',
  file_name VARCHAR(255) NOT NULL COMMENT '文件名',
  file_size BIGINT NOT NULL COMMENT '文件大小(字节)',
  file_type VARCHAR(100) COMMENT '文件类型',
  file_path VARCHAR(500) NOT NULL COMMENT '文件路径',
  file_url VARCHAR(500) COMMENT '文件访问URL',
  description TEXT COMMENT '文件描述',
  download_count INT DEFAULT 0 COMMENT '下载次数',
  is_deleted BOOLEAN DEFAULT FALSE COMMENT '是否删除',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_milestone_id (milestone_id),
  INDEX idx_project_id (project_id),
  INDEX idx_uploaded_by (uploaded_by),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='里程碑附件表';

-- 3. 里程碑活动日志表
CREATE TABLE IF NOT EXISTS milestone_activity_logs (
  id VARCHAR(50) PRIMARY KEY COMMENT '日志ID',
  milestone_id VARCHAR(50) NOT NULL COMMENT '里程碑ID',
  project_id VARCHAR(50) NOT NULL COMMENT '项目ID',
  user_id VARCHAR(50) NOT NULL COMMENT '操作用户ID',
  action_type VARCHAR(50) NOT NULL COMMENT '操作类型: create/update/complete/comment/attach/mention等',
  action_description VARCHAR(500) COMMENT '操作描述',
  old_value TEXT COMMENT '旧值(JSON)',
  new_value TEXT COMMENT '新值(JSON)',
  metadata JSON COMMENT '额外元数据',
  ip_address VARCHAR(50) COMMENT 'IP地址',
  user_agent VARCHAR(500) COMMENT '用户代理',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX idx_milestone_id (milestone_id),
  INDEX idx_project_id (project_id),
  INDEX idx_user_id (user_id),
  INDEX idx_action_type (action_type),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='里程碑活动日志表';

-- 4. 里程碑关注表
CREATE TABLE IF NOT EXISTS milestone_followers (
  id VARCHAR(50) PRIMARY KEY COMMENT '关注ID',
  milestone_id VARCHAR(50) NOT NULL COMMENT '里程碑ID',
  project_id VARCHAR(50) NOT NULL COMMENT '项目ID',
  user_id VARCHAR(50) NOT NULL COMMENT '关注用户ID',
  notification_enabled BOOLEAN DEFAULT TRUE COMMENT '是否接收通知',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  UNIQUE KEY uk_milestone_user (milestone_id, user_id),
  INDEX idx_milestone_id (milestone_id),
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='里程碑关注表';

-- 5. 讨论点赞表
CREATE TABLE IF NOT EXISTS discussion_likes (
  id VARCHAR(50) PRIMARY KEY COMMENT '点赞ID',
  discussion_id VARCHAR(50) NOT NULL COMMENT '讨论ID',
  user_id VARCHAR(50) NOT NULL COMMENT '用户ID',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  UNIQUE KEY uk_discussion_user (discussion_id, user_id),
  INDEX idx_discussion_id (discussion_id),
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='讨论点赞表';

-- 6. 协作统计表
CREATE TABLE IF NOT EXISTS milestone_collaboration_stats (
  id VARCHAR(50) PRIMARY KEY COMMENT '统计ID',
  milestone_id VARCHAR(50) NOT NULL COMMENT '里程碑ID',
  project_id VARCHAR(50) NOT NULL COMMENT '项目ID',
  stat_date DATE NOT NULL COMMENT '统计日期',
  discussion_count INT DEFAULT 0 COMMENT '讨论数',
  attachment_count INT DEFAULT 0 COMMENT '附件数',
  activity_count INT DEFAULT 0 COMMENT '活动数',
  participant_count INT DEFAULT 0 COMMENT '参与人数',
  follower_count INT DEFAULT 0 COMMENT '关注人数',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  UNIQUE KEY uk_milestone_date (milestone_id, stat_date),
  INDEX idx_milestone_id (milestone_id),
  INDEX idx_project_id (project_id),
  INDEX idx_stat_date (stat_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='里程碑协作统计表';
