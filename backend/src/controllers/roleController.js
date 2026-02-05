const databaseService = require('../services/databaseService')
const logger = require('../utils/logger')
const { PERMISSIONS: PERMISSIONS_CONFIG } = require('../config/permissions')


// 从PERMISSIONS配置中生成权限名称映射（用于显示）
const PERMISSION_NAMES = {
  // 超级管理员权限
  '*': '所有权限',

  // 用户管理权限
  'user:view': '查看用户',
  'user:create': '创建用户',
  'user:update': '更新用户',
  'user:delete': '删除用户',
  'user:reset-password': '重置密码',
  'user:*': '用户管理所有权限',

  // 角色管理权限
  'role:view': '查看角色',
  'role:assign': '分配角色',
  'role:update': '更新角色',
  'role:*': '角色管理所有权限',

  // 员工管理权限
  'employee:view': '查看员工',
  'employee:create': '创建员工',
  'employee:update': '更新员工',
  'employee:delete': '删除员工',
  'employee:transfer': '员工调动',
  'employee:*': '员工管理所有权限',

  // 部门管理权限
  'department:view': '查看部门',
  'department:create': '创建部门',
  'department:update': '更新部门',
  'department:delete': '删除部门',
  'department:*': '部门管理所有权限',

  // 岗位管理权限
  'position:view': '查看岗位',
  'position:create': '创建岗位',
  'position:update': '更新岗位',
  'position:delete': '删除岗位',
  'position:approve': '审批岗位',
  'position:*': '岗位管理所有权限',

  // 岗位大全管理权限
  'position_encyclopedia:view': '查看岗位大全',
  'position_encyclopedia:manage': '管理岗位大全',
  'position_encyclopedia:update_requirements': '更新岗位要求',
  'position_encyclopedia:update_career_path': '更新职业路径',
  'position_encyclopedia:update_skills': '更新技能',
  'position_encyclopedia:bulk_update': '批量更新',
  'position_encyclopedia:export': '导出岗位大全',
  'position_encyclopedia:*': '岗位大全所有权限',

  // 业务线管理权限
  'business_line:view': '查看业务线',
  'business_line:create': '创建业务线',
  'business_line:update': '更新业务线',
  'business_line:delete': '删除业务线',
  'business_line:*': '业务线管理所有权限',

  // 奖金计算权限
  'calculation:read': '查看计算',
  'calculation:create': '创建计算',
  'calculation:update': '更新计算',
  'calculation:delete': '删除计算',
  'calculation:execute': '执行计算',
  'calculation:simulate': '模拟计算',
  'calculation:export': '导出计算',
  'calculation:*': '计算所有权限',

  // 模拟分析权限
  'simulation:view': '查看模拟',
  'simulation:run': '运行模拟',
  'simulation:create': '创建模拟',
  'simulation:delete': '删除模拟',
  'simulation:analyze': '敏感性分析',
  'simulation:*': '模拟分析所有权限',

  // 项目管理权限
  'project:view': '查看项目',
  'project:create': '创建项目',
  'project:update': '更新项目',
  'project:delete': '删除项目',
  'project:approve': '审批项目',
  'project:apply': '申请项目',
  'project:publish': '发布项目',
  'project:start': '启动项目',
  'project:pause': '暂停项目',
  'project:close': '关闭项目',
  'project:manage': '管理项目',
  'project:cost:view': '查看项目成本',
  'project:cost:create': '创建项目成本',
  'project:cost:update': '更新项目成本',
  'project:cost:delete': '删除项目成本',
  'project:cost:view:all': '查看所有项目成本',
  'project:cost:manage': '管理项目成本',
  'project:weights:view': '查看项目权重',
  'project:weights:view_own': '查看自己项目权重',
  'project:weights:view_all': '查看所有项目权重',
  'project:weights:update': '更新项目权重',
  'project:weights:update_own': '更新自己项目权重',
  'project:weights:update_all': '更新所有项目权重',
  'project:weights:approve': '审批项目权重',
  'project:*': '项目管理所有权限',

  // 项目成员管理权限
  'project_member:view': '查看项目成员',
  'project_member:create': '添加项目成员',
  'project_member:update': '更新项目成员',
  'project_member:delete': '删除项目成员',
  'project_member:*': '项目成员管理所有权限',

  // 项目协作权限
  'collaboration:view': '查看项目协作',
  'collaboration:publish': '发布项目协作',
  'collaboration:apply': '申请项目协作',
  'collaboration:approve': '审批项目协作',
  'collaboration:*': '项目协作所有权限',

  // 团队管理权限
  'team:view': '查看团队',
  'team:build': '组建团队',
  'team:manage': '管理团队',
  'team:approve': '审批团队',
  'team:*': '团队管理所有权限',

  // 成员管理权限
  'member:view': '查看成员',
  'member:recruit': '招募成员',
  'member:approve': '审批成员',
  'member:assign': '分配成员',
  'member:remove': '移除成员',
  'member:*': '成员管理所有权限',

  // 奖金管理权限
  'bonus:view': '查看奖金',
  'bonus:create': '创建奖金',
  'bonus:calculate': '计算奖金',
  'bonus:approve': '审批奖金',
  'bonus:distribute': '发放奖金',
  'bonus:adjust': '调整奖金',
  'bonus:*': '奖金管理所有权限',

  // 奖金池管理权限
  'bonus_pool:view': '查看奖金池',
  'bonus_pool:create': '创建奖金池',
  'bonus_pool:update': '更新奖金池',
  'bonus_pool:delete': '删除奖金池',
  'bonus_pool:calculate': '计算奖金池',
  'bonus_pool:approve': '审批奖金池',
  'bonus_pool:export': '导出奖金池',
  'bonus_pool:manage_own': '管理自己的奖金池',
  'bonus_pool:manage_all': '管理所有奖金池',
  'bonus_pool:*': '奖金池所有权限',

  // 财务权限
  'finance:view': '查看财务',
  'finance:manage': '管理财务',
  'finance:approve': '审批财务',
  'finance:*': '财务所有权限',

  // 报表权限
  'report:view': '查看报表',
  'report:export': '导出报表',
  'report:personal': '个人报表',
  'report:*': '报表所有权限',

  // 系统设置权限
  'system:config': '系统配置',
  'system:audit': '审计日志',
  'system:backup': '备份管理',
  'system:maintenance': '系统维护',
  'system:*': '系统管理所有权限',

  // 通知管理权限
  'notification:view': '查看通知',
  'notification:create': '创建通知',
  'notification:update': '更新通知',
  'notification:delete': '删除通知',
  'notification:manage': '管理通知',
  'notification:*': '通知管理所有权限',

  // 改进建议权限
  'improvement:view': '查看建议',
  'improvement:create': '创建建议',
  'improvement:edit': '修改建议',
  'improvement:delete': '删除建议',
  'improvement:*': '改进建议所有权限'
}

class RoleController {
  // 获取权限列表
  async getPermissions(req, res, next) {
    try {
      const permissions = Object.entries(PERMISSION_NAMES).map(([key, name]) => ({
        key,
        name,
        group: key.split(':')[0]
      }))

      // 按组分类
      const groupedPermissions = permissions.reduce((acc, permission) => {
        const group = permission.group
        if (!acc[group]) {
          acc[group] = []
        }
        acc[group].push(permission)
        return acc
      }, {})

      res.json({
        code: 200,
        data: {
          permissions,
          groupedPermissions
        },
        message: '获取成功'
      })

    } catch (error) {
      logger.error('Get permissions error:', error)
      next(error)
    }
  }

  // 获取角色列表
  async getRoles(req, res, next) {
    try {
      const {
        page = 1,
        pageSize = 20,
        search,
        status
      } = req.query

      // 获取所有角色
      let roles = await databaseService.find('roles', {})

      // 搜索过滤
      if (search) {
        roles = roles.filter(role =>
          role.name.toLowerCase().includes(search.toLowerCase()) ||
          (role.description && role.description.toLowerCase().includes(search.toLowerCase()))
        )
      }

      // 状态过滤
      if (status !== undefined) {
        roles = roles.filter(role => role.status === parseInt(status))
      }

      // 分页处理
      const total = roles.length
      const offset = (page - 1) * pageSize
      const paginatedRoles = roles.slice(offset, offset + parseInt(pageSize))

      // 统计每个角色的用户数量
      const rolesWithUserCount = await Promise.all(
        paginatedRoles.map(async (role) => {
          // 使用 _id 或 id (NeDB兼容性)
          const roleId = role._id || role.id
          const users = await databaseService.find('users', { roleId })
          const userCount = users.length

          return {
            id: roleId,  // 确保返回 id 字段
            name: role.name,
            description: role.description,
            permissions: role.permissions,
            status: role.status,
            createdAt: role.createdAt,
            userCount,
            permissionNames: role.permissions.map(p => PERMISSION_NAMES[p] || p)
          }
        })
      )

      res.json({
        code: 200,
        data: {
          roles: rolesWithUserCount,
          pagination: {
            total: total,
            page: parseInt(page),
            pageSize: parseInt(pageSize),
            totalPages: Math.ceil(total / pageSize)
          }
        },
        message: '获取成功'
      })

    } catch (error) {
      logger.error('Get roles error:', error)
      next(error)
    }
  }

  // 获取角色详情
  async getRole(req, res, next) {
    try {
      const { id } = req.params

      const role = await databaseService.findOne('roles', { id })

      if (!role) {
        return res.status(404).json({
          code: 404,
          message: '角色不存在',
          data: null
        })
      }

      // 获取使用此角色的用户数量
      const roleId = role._id || role.id
      const users = await databaseService.find('users', { roleId })
      const userCount = users.length

      const roleData = {
        id: roleId,  // 确保返回 id 字段
        name: role.name,
        description: role.description,
        permissions: role.permissions,
        status: role.status,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
        userCount,
        permissionNames: role.permissions.map(p => PERMISSION_NAMES[p] || p)
      }

      res.json({
        code: 200,
        data: roleData,
        message: '获取成功'
      })

    } catch (error) {
      logger.error('Get role error:', error)
      next(error)
    }
  }

  // 创建角色
  async createRole(req, res, next) {
    try {
      const { name, description, permissions, menuIds } = req.body

      // 检查角色名是否已存在
      const existingRole = await databaseService.findOne('roles', { name })
      if (existingRole) {
        return res.status(400).json({
          code: 400,
          message: '角色名已存在',
          data: null
        })
      }

      // 验证权限列表
      if (permissions && permissions.length > 0) {
        // 获取所有有效权限值（从嵌套的PERMISSIONS_CONFIG对象中提取所有权限字符串）
        const allPermissionValues = new Set();
        Object.values(PERMISSIONS_CONFIG).forEach(module => {
          if (typeof module === 'string') {
            // 处理顶层权限如 SUPER_ADMIN: '*'
            allPermissionValues.add(module);
          } else if (typeof module === 'object') {
            // 处理嵌套权限如 USER: { VIEW: 'user:view', ... }
            Object.values(module).forEach(perm => {
              if (typeof perm === 'string') {
                allPermissionValues.add(perm);
              }
            });
          }
        });

        // 验证所有提交的权限是否都是有效的
        const invalidPermissions = permissions.filter(p => !allPermissionValues.has(p));

        if (invalidPermissions.length > 0) {
          console.log('⚠️ 检测到无效权限，已自动过滤:', invalidPermissions);
          // 自动过滤无效权限
          permissions = permissions.filter(p => allPermissionValues.has(p));
          console.log('✅ 过滤后的有效权限数量:', permissions.length);
        }
      }

      const role = await databaseService.insert('roles', {
        name,
        description,
        permissions: permissions,
        status: 1
      })

      // 如果提供了菜单权限，则分配菜单
      if (menuIds && Array.isArray(menuIds) && menuIds.length > 0) {
        const menuService = require('../services/menuService');
        await menuService.assignMenusToRole(role.id, menuIds);
      }

      logger.info(`管理员${req.user.username}创建了角色: ${name}`)

      const roleData = {
        id: role.id,
        ...role,
        userCount: 0,
        permissionNames: (role.permissions || []).map(p => PERMISSION_NAMES[p] || p)
      }

      res.status(201).json({
        code: 201,
        data: roleData,
        message: '角色创建成功'
      })

    } catch (error) {
      logger.error('Create role error:', error)
      next(error)
    }
  }

  // 更新角色
  async updateRole(req, res, next) {
    try {
      const { id } = req.params
      let { name, description, permissions, status } = req.body

      const role = await databaseService.findOne('roles', { id })
      if (!role) {
        return res.status(404).json({
          code: 404,
          message: '角色不存在',
          data: null
        })
      }

      // // 检查角色名是否被其他角色使用
      // if (name && name !== role.name) {
      //   const existingRole = await databaseService.findOne('roles', { name })

      //   if (existingRole) {
      //     return res.status(400).json({
      //       code: 400,
      //       message: '角色名已被其他角色使用',
      //       data: null
      //     })
      //   }
      // }

      // 验证权限列表
      if (permissions) {
        // 获取所有有效权限值（从嵌套的PERMISSIONS_CONFIG对象中提取所有权限字符串）
        const allPermissionValues = new Set();
        Object.values(PERMISSIONS_CONFIG).forEach(module => {
          if (typeof module === 'string') {
            // 处理顶层权限如 SUPER_ADMIN: '*'
            allPermissionValues.add(module);
          } else if (typeof module === 'object') {
            // 处理嵌套权限如 USER: { VIEW: 'user:view', ... }
            Object.values(module).forEach(perm => {
              if (typeof perm === 'string') {
                allPermissionValues.add(perm);
              }
            });
          }
        });

        // 验证所有提交的权限是否都是有效的
        const invalidPermissions = permissions.filter(p => !allPermissionValues.has(p));

        if (invalidPermissions.length > 0) {
          console.log('⚠️ 检测到无效权限，已自动过滤:', invalidPermissions);
          // 自动过滤无效权限
          permissions = permissions.filter(p => allPermissionValues.has(p));
          console.log('✅ 过滤后的有效权限数量:', permissions.length);
        }
      }

      await databaseService.update('roles', { id }, {
        name: name || role.name,
        description: description || role.description,
        permissions: permissions || role.permissions,
        status: status !== undefined ? status : role.status
      })

      logger.info(`管理员${req.user.username}更新了角色: ${role.name}`)

      // 获取用户数量
      const users = await databaseService.find('users', { roleId: id })
      const userCount = users.length

      const roleData = {
        ...role,
        userCount,
        permissionNames: role.permissions.map(p => PERMISSION_NAMES[p] || p)
      }

      res.json({
        code: 200,
        data: roleData,
        message: '角色更新成功'
      })

    } catch (error) {
      logger.error('Update role error:', error)
      next(error)
    }
  }

  // 删除角色
  async deleteRole(req, res, next) {
    try {
      const { id } = req.params

      const role = await databaseService.findOne('roles', { id })
      if (!role) {
        return res.status(404).json({
          code: 404,
          message: '角色不存在',
          data: null
        })
      }

      // 检查是否有用户正在使用此角色
      const users = await databaseService.findAll('users', { where: { role_id: id } })
      const userCount = users.rows ? users.rows.length : users.length

      if (userCount > 0) {
        return res.status(400).json({
          code: 400,
          message: `该角色正被${userCount}个用户使用，无法删除`,
          data: null
        })
      }

      // 不能删除系统预设角色（ID为1、2、3的角色）
      if ([1, 2, 3].includes(parseInt(id))) {
        return res.status(400).json({
          code: 400,
          message: '不能删除系统预设角色',
          data: null
        })
      }

      await databaseService.remove('roles', { id })

      logger.info(`管理员${req.user.username}删除了角色: ${role.name}`)

      res.json({
        code: 200,
        data: null,
        message: '角色删除成功'
      })

    } catch (error) {
      logger.error('Delete role error:', error)
      next(error)
    }
  }

  // 批量操作角色
  async batchRoles(req, res, next) {
    try {
      const { action, roleIds } = req.body

      if (!roleIds || !Array.isArray(roleIds) || roleIds.length === 0) {
        return res.status(400).json({
          code: 400,
          message: '请选择要操作的角色',
          data: null
        })
      }

      // 不能操作系统预设角色
      const systemRoleIds = roleIds.filter(id => [1, 2, 3].includes(parseInt(id)))
      if (systemRoleIds.length > 0) {
        return res.status(400).json({
          code: 400,
          message: '不能对系统预设角色执行批量操作',
          data: null
        })
      }

      let actionText = ''

      switch (action) {
        case 'enable':
          actionText = '启用'
          break
        case 'disable':
          actionText = '禁用'
          break
        default:
          return res.status(400).json({
            code: 400,
            message: '无效的操作类型',
            data: null
          })
      }

      // 批量更新角色状态
      const updateData = { status: action === 'enable' ? 1 : 0 }
      let updatedCount = 0
      for (const roleId of roleIds) {
        try {
          await databaseService.update('roles', { id: roleId }, updateData)
          updatedCount++
        } catch (error) {
          logger.error(`批量操作角色${roleId}失败:`, error)
        }
      }

      logger.info(`管理员${req.user.username}批量${actionText}了${updatedCount}个角色`)

      res.json({
        code: 200,
        data: { updatedCount },
        message: `批量${actionText}成功，共处理${updatedCount}个角色`
      })

    } catch (error) {
      logger.error('Batch roles error:', error)
      next(error)
    }
  }
}

module.exports = new RoleController()