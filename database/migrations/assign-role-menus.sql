-- 为不同角色分配菜单权限
-- 根据角色的权限字段和菜单的perms字段进行匹配

-- 首先清空非admin角色的菜单分配（保留admin的分配）
DELETE FROM role_menus WHERE role_id != 'vd7p1lxn9lOaRKKJ';

-- ==================== 普通员工 (QIUgWkY0NMp444Qt) ====================
-- 权限: employee:view, department:view, position:view, project:view, collaboration:view, report:personal, bonus:view 等
INSERT INTO role_menus (role_id, menu_id) VALUES
-- 基础菜单（无权限要求）
('QIUgWkY0NMp444Qt', 'menu_1'),    -- 管理驾驶舱
('QIUgWkY0NMp444Qt', 'menu_100'),  -- 基础数据（目录）
('QIUgWkY0NMp444Qt', 'menu_101'),  -- 员工管理 (employee:view)
('QIUgWkY0NMp444Qt', 'menu_102'),  -- 部门管理 (department:view)
('QIUgWkY0NMp444Qt', 'menu_103'),  -- 岗位管理 (position:view)
('QIUgWkY0NMp444Qt', 'menu_104'),  -- 岗位大全 (position:view)
('QIUgWkY0NMp444Qt', 'menu_105'),  -- 业务线管理 (business_line:view)
('QIUgWkY0NMp444Qt', 'menu_200'),  -- 项目管理（目录）
('QIUgWkY0NMp444Qt', 'menu_201'),  -- 我的项目
('QIUgWkY0NMp444Qt', 'menu_204'),  -- 项目管理 (project:view)
('QIUgWkY0NMp444Qt', 'menu_500'),  -- 绩效管理（目录）
('QIUgWkY0NMp444Qt', 'menu_600'),  -- 报表查询（目录）
('QIUgWkY0NMp444Qt', 'menu_602'),  -- 个人奖金查询 (bonus:view)
('QIUgWkY0NMp444Qt', 'menu_603');  -- 我的奖金

-- ==================== 高级工程师 (3cUruZzYPErB074T) ====================
-- 权限: employee:view, department:view, position:view, project:view, project:update, collaboration:view, report:view 等
INSERT INTO role_menus (role_id, menu_id) VALUES
('3cUruZzYPErB074T', 'menu_1'),    -- 管理驾驶舱
('3cUruZzYPErB074T', 'menu_100'),  -- 基础数据（目录）
('3cUruZzYPErB074T', 'menu_101'),  -- 员工管理
('3cUruZzYPErB074T', 'menu_102'),  -- 部门管理
('3cUruZzYPErB074T', 'menu_103'),  -- 岗位管理
('3cUruZzYPErB074T', 'menu_104'),  -- 岗位大全
('3cUruZzYPErB074T', 'menu_200'),  -- 项目管理（目录）
('3cUruZzYPErB074T', 'menu_201'),  -- 我的项目
('3cUruZzYPErB074T', 'menu_204'),  -- 项目管理 (project:view)
('3cUruZzYPErB074T', 'menu_500'),  -- 绩效管理（目录）
('3cUruZzYPErB074T', 'menu_600'),  -- 报表查询（目录）
('3cUruZzYPErB074T', 'menu_601'),  -- 报表管理 (report:view)
('3cUruZzYPErB074T', 'menu_603');  -- 我的奖金

-- ==================== 业务专家 (business_expert_001) ====================
-- 权限: project:view, collaboration:view, collaboration:apply, calculation:read, report:view 等
INSERT INTO role_menus (role_id, menu_id) VALUES
('business_expert_001', 'menu_1'),    -- 管理驾驶舱
('business_expert_001', 'menu_100'),  -- 基础数据（目录）
('business_expert_001', 'menu_101'),  -- 员工管理
('business_expert_001', 'menu_102'),  -- 部门管理
('business_expert_001', 'menu_200'),  -- 项目管理（目录）
('business_expert_001', 'menu_201'),  -- 我的项目
('business_expert_001', 'menu_204'),  -- 项目管理 (project:view)
('business_expert_001', 'menu_500'),  -- 绩效管理（目录）
('business_expert_001', 'menu_600'),  -- 报表查询（目录）
('business_expert_001', 'menu_601'),  -- 报表管理 (report:view)
('business_expert_001', 'menu_603');  -- 我的奖金

-- ==================== 项目协作管理员 (collab_admin_001) ====================
-- 权限: collaboration:view, collaboration:publish, collaboration:approve, team:*, member:*, report:view 等
INSERT INTO role_menus (role_id, menu_id) VALUES
('collab_admin_001', 'menu_1'),    -- 管理驾驶舱
('collab_admin_001', 'menu_200'),  -- 项目管理（目录）
('collab_admin_001', 'menu_201'),  -- 我的项目
('collab_admin_001', 'menu_202'),  -- 项目协作 (collaboration:view)
('collab_admin_001', 'menu_204'),  -- 项目管理 (project:view)
('collab_admin_001', 'menu_600'),  -- 报表查询（目录）
('collab_admin_001', 'menu_601'),  -- 报表管理 (report:view)
('collab_admin_001', 'menu_603');  -- 我的奖金

-- ==================== 部门经理 (GlpDpQngrkgDMNh2) ====================
-- 权限: employee:*, department:*, position:*, business_line:view, project:create, bonus:view, report:view 等
INSERT INTO role_menus (role_id, menu_id) VALUES
('GlpDpQngrkgDMNh2', 'menu_1'),    -- 管理驾驶舱
('GlpDpQngrkgDMNh2', 'menu_100'),  -- 基础数据（目录）
('GlpDpQngrkgDMNh2', 'menu_101'),  -- 员工管理
('GlpDpQngrkgDMNh2', 'menu_102'),  -- 部门管理
('GlpDpQngrkgDMNh2', 'menu_103'),  -- 岗位管理
('GlpDpQngrkgDMNh2', 'menu_104'),  -- 岗位大全
('GlpDpQngrkgDMNh2', 'menu_105'),  -- 业务线管理
('GlpDpQngrkgDMNh2', 'menu_200'),  -- 项目管理（目录）
('GlpDpQngrkgDMNh2', 'menu_201'),  -- 我的项目
('GlpDpQngrkgDMNh2', 'menu_203'),  -- 发布项目 (project:create)
('GlpDpQngrkgDMNh2', 'menu_204'),  -- 项目管理 (project:view)
('GlpDpQngrkgDMNh2', 'menu_500'),  -- 绩效管理（目录）
('GlpDpQngrkgDMNh2', 'menu_600'),  -- 报表查询（目录）
('GlpDpQngrkgDMNh2', 'menu_601'),  -- 报表管理 (report:view)
('GlpDpQngrkgDMNh2', 'menu_602'),  -- 个人奖金查询 (bonus:view)
('GlpDpQngrkgDMNh2', 'menu_603');  -- 我的奖金

-- ==================== 技术总监 (eQe0vpMd3emXERl9) ====================
-- 权限: employee:*, department:*, position:*, project:*, team:*, member:*, bonus:view, simulation:view, system:config 等
INSERT INTO role_menus (role_id, menu_id) VALUES
('eQe0vpMd3emXERl9', 'menu_1'),    -- 管理驾驶舱
('eQe0vpMd3emXERl9', 'menu_100'),  -- 基础数据（目录）
('eQe0vpMd3emXERl9', 'menu_101'),  -- 员工管理
('eQe0vpMd3emXERl9', 'menu_102'),  -- 部门管理
('eQe0vpMd3emXERl9', 'menu_103'),  -- 岗位管理
('eQe0vpMd3emXERl9', 'menu_104'),  -- 岗位大全
('eQe0vpMd3emXERl9', 'menu_200'),  -- 项目管理（目录）
('eQe0vpMd3emXERl9', 'menu_201'),  -- 我的项目
('eQe0vpMd3emXERl9', 'menu_202'),  -- 项目协作
('eQe0vpMd3emXERl9', 'menu_203'),  -- 发布项目
('eQe0vpMd3emXERl9', 'menu_204'),  -- 项目管理
('eQe0vpMd3emXERl9', 'menu_207'),  -- 里程碑模板
('eQe0vpMd3emXERl9', 'menu_400'),  -- 奖金计算（目录）
('eQe0vpMd3emXERl9', 'menu_401'),  -- 奖金计算 (bonus:calculate)
('eQe0vpMd3emXERl9', 'menu_402'),  -- 模拟分析 (simulation:view)
('eQe0vpMd3emXERl9', 'menu_500'),  -- 绩效管理（目录）
('eQe0vpMd3emXERl9', 'menu_600'),  -- 报表查询（目录）
('eQe0vpMd3emXERl9', 'menu_601'),  -- 报表管理
('eQe0vpMd3emXERl9', 'menu_602'),  -- 个人奖金查询
('eQe0vpMd3emXERl9', 'menu_603'),  -- 我的奖金
('eQe0vpMd3emXERl9', 'menu_700'),  -- 系统管理（目录）
('eQe0vpMd3emXERl9', 'menu_704');  -- 系统配置 (system:config)

-- ==================== HR管理员 (Qz8jzlt6I2qitXpw) ====================
-- 权限: employee:*, department:*, position:*, user:*, role:*, bonus:view, bonus:approve 等
INSERT INTO role_menus (role_id, menu_id) VALUES
('Qz8jzlt6I2qitXpw', 'menu_1'),    -- 管理驾驶舱
('Qz8jzlt6I2qitXpw', 'menu_100'),  -- 基础数据（目录）
('Qz8jzlt6I2qitXpw', 'menu_101'),  -- 员工管理
('Qz8jzlt6I2qitXpw', 'menu_102'),  -- 部门管理
('Qz8jzlt6I2qitXpw', 'menu_103'),  -- 岗位管理
('Qz8jzlt6I2qitXpw', 'menu_104'),  -- 岗位大全
('Qz8jzlt6I2qitXpw', 'menu_105'),  -- 业务线管理
('Qz8jzlt6I2qitXpw', 'menu_300'),  -- 财务管理（目录）
('Qz8jzlt6I2qitXpw', 'menu_303'),  -- 项目奖金管理 (hr)
('Qz8jzlt6I2qitXpw', 'menu_400'),  -- 奖金计算（目录）(hr)
('Qz8jzlt6I2qitXpw', 'menu_401'),  -- 奖金计算 (hr)
('Qz8jzlt6I2qitXpw', 'menu_500'),  -- 绩效管理（目录）
('Qz8jzlt6I2qitXpw', 'menu_501'),  -- 绩效记录 (hr)
('Qz8jzlt6I2qitXpw', 'menu_600'),  -- 报表查询（目录）
('Qz8jzlt6I2qitXpw', 'menu_601'),  -- 报表管理
('Qz8jzlt6I2qitXpw', 'menu_602'),  -- 个人奖金查询
('Qz8jzlt6I2qitXpw', 'menu_603'),  -- 我的奖金
('Qz8jzlt6I2qitXpw', 'menu_700'),  -- 系统管理（目录）
('Qz8jzlt6I2qitXpw', 'menu_701'),  -- 用户管理 (user:view)
('Qz8jzlt6I2qitXpw', 'menu_702'),  -- 角色管理 (role:view)
('Qz8jzlt6I2qitXpw', 'menu_705'),  -- 三维权重配置 (hr)
('Qz8jzlt6I2qitXpw', 'menu_706');  -- 改进建议管理 (hr)

-- ==================== 财务管理员 (Eln8qiLDJhs73Sc7) ====================
-- 权限: bonus:*, finance:*, project:cost:*, calculation:* 等
INSERT INTO role_menus (role_id, menu_id) VALUES
('Eln8qiLDJhs73Sc7', 'menu_1'),    -- 管理驾驶舱
('Eln8qiLDJhs73Sc7', 'menu_100'),  -- 基础数据（目录）
('Eln8qiLDJhs73Sc7', 'menu_101'),  -- 员工管理
('Eln8qiLDJhs73Sc7', 'menu_102'),  -- 部门管理
('Eln8qiLDJhs73Sc7', 'menu_103'),  -- 岗位管理
('Eln8qiLDJhs73Sc7', 'menu_105'),  -- 业务线管理
('Eln8qiLDJhs73Sc7', 'menu_200'),  -- 项目管理（目录）
('Eln8qiLDJhs73Sc7', 'menu_204'),  -- 项目管理 (project:view)
('Eln8qiLDJhs73Sc7', 'menu_300'),  -- 财务管理（目录）
('Eln8qiLDJhs73Sc7', 'menu_301'),  -- 利润数据录入 (finance:view)
('Eln8qiLDJhs73Sc7', 'menu_302'),  -- 项目成本录入 (finance:view)
('Eln8qiLDJhs73Sc7', 'menu_303'),  -- 项目奖金管理 (finance:view)
('Eln8qiLDJhs73Sc7', 'menu_400'),  -- 奖金计算（目录）
('Eln8qiLDJhs73Sc7', 'menu_401'),  -- 奖金计算 (bonus:calculate)
('Eln8qiLDJhs73Sc7', 'menu_600'),  -- 报表查询（目录）
('Eln8qiLDJhs73Sc7', 'menu_601'),  -- 报表管理
('Eln8qiLDJhs73Sc7', 'menu_602'),  -- 个人奖金查询
('Eln8qiLDJhs73Sc7', 'menu_603');  -- 我的奖金

-- ==================== 项目经理 (CdFv8NCPauLjt7se) ====================
-- 权限: project:*, team:*, member:*, collaboration:*, bonus:view, simulation:view 等
INSERT INTO role_menus (role_id, menu_id) VALUES
('CdFv8NCPauLjt7se', 'menu_1'),    -- 管理驾驶舱
('CdFv8NCPauLjt7se', 'menu_100'),  -- 基础数据（目录）
('CdFv8NCPauLjt7se', 'menu_101'),  -- 员工管理
('CdFv8NCPauLjt7se', 'menu_102'),  -- 部门管理
('CdFv8NCPauLjt7se', 'menu_103'),  -- 岗位管理
('CdFv8NCPauLjt7se', 'menu_105'),  -- 业务线管理
('CdFv8NCPauLjt7se', 'menu_200'),  -- 项目管理（目录）
('CdFv8NCPauLjt7se', 'menu_201'),  -- 我的项目
('CdFv8NCPauLjt7se', 'menu_202'),  -- 项目协作 (project:create)
('CdFv8NCPauLjt7se', 'menu_203'),  -- 发布项目 (project:create)
('CdFv8NCPauLjt7se', 'menu_204'),  -- 项目管理 (project:view)
('CdFv8NCPauLjt7se', 'menu_205'),  -- 项目成员审批 (project:approve)
('CdFv8NCPauLjt7se', 'menu_206'),  -- 项目角色权重 (project:weights:view)
('CdFv8NCPauLjt7se', 'menu_207'),  -- 里程碑模板 (project:create)
('CdFv8NCPauLjt7se', 'menu_300'),  -- 财务管理（目录）
('CdFv8NCPauLjt7se', 'menu_302'),  -- 项目成本录入 (project:cost:manage)
('CdFv8NCPauLjt7se', 'menu_402'),  -- 模拟分析 (simulation:view)
('CdFv8NCPauLjt7se', 'menu_500'),  -- 绩效管理（目录）
('CdFv8NCPauLjt7se', 'menu_600'),  -- 报表查询（目录）
('CdFv8NCPauLjt7se', 'menu_601'),  -- 报表管理
('CdFv8NCPauLjt7se', 'menu_602'),  -- 个人奖金查询
('CdFv8NCPauLjt7se', 'menu_603');  -- 我的奖金

-- ==================== 模拟分析专家 (simulation_expert_001) ====================
-- 权限: simulation:*, calculation:read, calculation:simulate, report:view, project:view 等
INSERT INTO role_menus (role_id, menu_id) VALUES
('simulation_expert_001', 'menu_1'),    -- 管理驾驶舱
('simulation_expert_001', 'menu_200'),  -- 项目管理（目录）
('simulation_expert_001', 'menu_204'),  -- 项目管理 (project:view)
('simulation_expert_001', 'menu_402'),  -- 模拟分析 (simulation:view)
('simulation_expert_001', 'menu_600'),  -- 报表查询（目录）
('simulation_expert_001', 'menu_601'),  -- 报表管理
('simulation_expert_001', 'menu_603');  -- 我的奖金

-- 验证结果
SELECT
    r.name as '角色名称',
    COUNT(rm.menu_id) as '菜单数量'
FROM roles r
LEFT JOIN role_menus rm ON r.id = rm.role_id
GROUP BY r.id, r.name
ORDER BY COUNT(rm.menu_id) DESC;
