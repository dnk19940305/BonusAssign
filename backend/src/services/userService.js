const { databaseManager } = require('../config/database')
const bcrypt = require('bcryptjs')
const logger = require('../utils/logger')

/**
 * 用户服务
 * 处理用户和角色相关的业务逻辑
 */
class UserService {
  /**
   * 根据用户名查找用户
   */
  async getUserByUsername(username) {
    const userResult = await databaseManager.query(
      `SELECT u.*, r.name as roleName, r.description as roleDescription,
              d.name as departmentName, d.code as departmentCode
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.username = ?
       LIMIT 1`,
      [username]
    )
    return userResult.length > 0 ? userResult[0] : null
  }

  /**
   * 根据ID查找用户
   */
  async getUserById(id) {
    const userResult = await databaseManager.query(
      `SELECT u.*, r.name as roleName, r.description as roleDescription,
              d.name as departmentName, d.code as departmentCode
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.id = ?
       LIMIT 1`,
      [id]
    )
    return userResult.length > 0 ? userResult[0] : null
  }

  /**
   * 根据ID查找用户（别名）
   */
  async findUserById(id) {
    return await this.getUserById(id)
  }

  /**
   * 根据用户名或邮箱查找用户
   */
  async findUserByUsernameOrEmail(username, email) {
    const userResult = await databaseManager.query(
      `SELECT u.*, r.name as roleName, r.description as roleDescription,
              d.name as departmentName, d.code as departmentCode
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.username = ? OR u.email = ?
       LIMIT 1`,
      [username, email]
    )
    return userResult.length > 0 ? userResult[0] : null
  }

  /**
   * 获取用户列表
   */
  async getUserList({ page = 1, pageSize = 20, search, roleId, departmentId, status }) {
    // 构建查询条件
    let whereConditions = []
    let params = []

    if (search) {
      whereConditions.push('(u.username LIKE ? OR u.real_name LIKE ? OR u.email LIKE ?)')
      const searchTerm = `%${search}%`
      params.push(searchTerm, searchTerm, searchTerm)
    }
    
    if (roleId && roleId !== '') {
      whereConditions.push('u.role_id = ?')
      params.push(roleId)
    }
    
    if (departmentId && departmentId !== '') {
      whereConditions.push('u.department_id = ?')
      params.push(departmentId)
    }
    
    if (status !== undefined && status !== '') {
      whereConditions.push('u.status = ?')
      params.push(Number(status))
    }

    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : ''
    
    // 计算偏移量
    const offset = Math.max(0, (parseInt(page) - 1) * parseInt(pageSize))
    const limit = parseInt(pageSize)

    // 获取总数
    const countSql = `SELECT COUNT(*) as total FROM users u ${whereClause}`
    const countResult = await databaseManager.query(countSql, params)
    const total = countResult[0]?.total || 0

    // 获取用户列表 - 使用字符串插值而不是占位符来处理LIMIT和OFFSET
    // 这样可以避免MySQL prepared statement的限制
    const usersSql = `
      SELECT u.*, r.name as roleName, r.description as roleDescription,
             d.name as departmentName, d.code as departmentCode
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN departments d ON u.department_id = d.id
      ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `
    const users = await databaseManager.query(usersSql, params)

    return {
      users,
      pagination: {
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        totalPages: Math.ceil(total / parseInt(pageSize))
      }
    }
  }

  /**
   * 创建用户
   */
  async createUser(userData) {
    const { username, password, realName, email, phone, roleId, departmentId, employeeId, status } = userData

    // 检查用户名是否存在
    const existingUserResult = await databaseManager.query(
      'SELECT id FROM users WHERE username = ?',
      [username]
    )
    if (existingUserResult.length > 0) {
      throw new Error('用户名已存在')
    }

    // 检查邮箱是否存在
    if (email && email.trim()) {
      const existingEmailResult = await databaseManager.query(
        'SELECT id FROM users WHERE email = ?',
        [email.trim()]
      )
      if (existingEmailResult.length > 0) {
        throw new Error('邮箱已被其他用户使用')
      }
    }

    // 如果提供了员工ID，验证员工是否存在且未关联用户
    let employee = null
    if (employeeId) {
      const employeeResult = await databaseManager.query(
        'SELECT id, name, department_id, email as emp_email, phone as emp_phone, user_id FROM employees WHERE id = ?',
        [employeeId]
      )
      if (employeeResult.length === 0) {
        throw new Error('指定的员工不存在')
      }
      
      employee = employeeResult[0]
      if (employee.user_id) {
        throw new Error('该员工已关联用户账号')
      }

      // 如果员工存在，使用员工信息填充相关字段
      if (!realName) {
        realName = employee.name
      }
      if (!departmentId) {
        departmentId = employee.department_id
      }
      if (!email && employee.emp_email) {
        email = employee.emp_email
      }
      if (!phone && employee.emp_phone) {
        phone = employee.emp_phone
      }
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 12)

    // 生成用户ID
    const userId = require('crypto').randomBytes(16).toString('hex')
    
    // 准备用户数据
    const userInsertData = [
      userId,  // id
      username,
      hashedPassword,
      realName,
      email && email.trim() ? email.trim() : null,
      phone && phone.trim() ? phone.trim() : null,
      roleId,
      departmentId || null,  // 将 undefined 转换为 null
      status !== undefined ? status : 1
    ]

    // 创建用户
    const insertResult = await databaseManager.query(
      `INSERT INTO users (id, username, password, real_name, email, phone, role_id, department_id, status, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      userInsertData
    )
    

    // 如果提供了员工ID，更新员工记录的userId字段
    if (employeeId) {
      await databaseManager.query(
        'UPDATE employees SET user_id = ? WHERE id = ?',
        [userId, employeeId]
      )
      logger.info(`用户 ${username} 已关联到员工 ${employeeId}`)
    }

    // 返回新创建的用户
    return await this.getUserById(userId)
  }

  /**
   * 更新用户
   */
  async updateUser(id, updateData) {
    // 查询用户
    const userResult = await databaseManager.query(
      'SELECT id, username FROM users WHERE id = ?',
      [id]
    )
    if (userResult.length === 0) {
      throw new Error('用户不存在')
    }
    
    const user = userResult[0]
    const { username, realName, email, phone, roleId, departmentId, status } = updateData

    // 检查邮箱是否被其他用户使用
    if (email && email.trim()) {
      const existingEmailResult = await databaseManager.query(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email.trim(), id]
      )
      if (existingEmailResult.length > 0) {
        throw new Error('邮箱已被其他用户使用')
      }
    }

    // 检查用户名是否被其他用户使用
    if (username) {
      const existingUsernameResult = await databaseManager.query(
        'SELECT id FROM users WHERE username = ? AND id != ?',
        [username, id]
      )
      if (existingUsernameResult.length > 0) {
        throw new Error('用户名已被其他用户使用')
      }
    }

    // 准备更新数据
    const updateFields = []
    const updateValues = []
    
    if (realName !== undefined) {
      updateFields.push('real_name = ?')
      updateValues.push(realName)
    }
    if (email !== undefined) {
      updateFields.push('email = ?')
      updateValues.push(email && email.trim() ? email.trim() : null)
    }
    if (phone !== undefined) {
      updateFields.push('phone = ?')
      updateValues.push(phone && phone.trim() ? phone.trim() : null)
    }
    if (roleId !== undefined) {
      updateFields.push('role_id = ?')
      updateValues.push(roleId)
    }
    if (departmentId !== undefined) {
      updateFields.push('department_id = ?')
      updateValues.push(departmentId)
    }
    if (status !== undefined) {
      updateFields.push('status = ?')
      updateValues.push(status)
    }
    if (username !== undefined) {
      updateFields.push('username = ?')
      updateValues.push(username)
    }
    
    updateFields.push('updated_at = NOW()')
    updateValues.push(id)

    // 执行更新
    await databaseManager.query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    )

    // 返回更新后的用户
    return await this.getUserById(id)
  }

  /**
   * 更新最后登录时间
   */
  async updateLastLogin(userId) {
    await databaseManager.query(
      'UPDATE users SET last_login = NOW(), updated_at = NOW() WHERE id = ?',
      [userId]
    )
    return await this.getUserById(userId)
  }

  /**
   * 更新用户密码
   */
  async updatePassword(userId, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 12)
    await databaseManager.query(
      'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?',
      [hashedPassword, userId]
    )
    return await this.getUserById(userId)
  }

  /**
   * 重置用户密码
   */
  async resetPassword(userId, newPassword) {
    return await this.updatePassword(userId, newPassword)
  }

  /**
   * 删除用户（软删除）
   */
  async deleteUser(userId, operatorId) {
    // 查询用户
    const userResult = await databaseManager.query(
      'SELECT id, username FROM users WHERE id = ?',
      [userId]
    )
    if (userResult.length === 0) {
      throw new Error('用户不存在')
    }
    
    const user = userResult[0]

    // 执行软删除
    await databaseManager.query(
      'UPDATE users SET status = 0, updated_at = NOW() WHERE id = ?',
      [userId]
    )
    
    logger.info(`用户 ${user.username} 已被删除`)
    return true
  }

  /**
   * 批量操作用户
   */
  async batchOperation(userIds, action) {
    let statusValue = null
    let actionText = ''

    switch (action) {
      case 'enable':
        statusValue = 1
        actionText = '启用'
        break
      case 'disable':
        statusValue = 0
        actionText = '禁用'
        break
      default:
        throw new Error('无效的操作类型')
    }

    // 构建SQL查询
    const placeholders = userIds.map(() => '?').join(',')
    
    // 批量更新用户
    const result = await databaseManager.query(
      `UPDATE users SET status = ?, updated_at = NOW() WHERE id IN (${placeholders})`,
      [statusValue, ...userIds]
    )
    
    const updatedCount = result.affectedRows
    logger.info(`批量${actionText}了${updatedCount}个用户`)
    
    return { updatedCount }
  }

  /**
   * 根据ID查找角色
   */
  async getRoleById(id) {
    const roleResult = await databaseManager.query(
      'SELECT * FROM roles WHERE id = ? LIMIT 1',
      [id]
    )
    return roleResult.length > 0 ? roleResult[0] : null
  }

  /**
   * 获取所有角色
   */
  async getRoles() {
    return await databaseManager.query('SELECT * FROM roles WHERE status = 1')
  }

  /**
   * 根据名称查找角色
   */
  async getRoleByName(name) {
    const roleResult = await databaseManager.query(
      'SELECT * FROM roles WHERE name = ? LIMIT 1',
      [name]
    )
    return roleResult.length > 0 ? roleResult[0] : null
  }

  /**
   * 创建角色
   */
  async createRole(data) {
    const { name, description, permissions, status = 1 } = data
    
    // 检查角色名是否已存在
    const existingRole = await databaseManager.query(
      'SELECT id FROM roles WHERE name = ? LIMIT 1',
      [name]
    )
    if (existingRole.length > 0) {
      throw new Error('角色名已存在')
    }
    
    const insertResult = await databaseManager.query(
      `INSERT INTO roles (name, description, permissions, status, created_at, updated_at) 
       VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [name, description, JSON.stringify(permissions || []), status]
    )
    
    return await this.getRoleById(insertResult.insertId)
  }

  /**
   * 更新角色
   */
  async updateRole(id, data) {
    const { name, description, permissions, status } = data
    
    // 检查角色名是否被其他角色使用
    if (name) {
      const existingRole = await databaseManager.query(
        'SELECT id FROM roles WHERE name = ? AND id != ? LIMIT 1',
        [name, id]
      )
      if (existingRole.length > 0) {
        throw new Error('角色名已被其他角色使用')
      }
    }
    
    const updateFields = []
    const updateValues = []
    
    if (name) {
      updateFields.push('name = ?')
      updateValues.push(name)
    }
    if (description !== undefined) {
      updateFields.push('description = ?')
      updateValues.push(description)
    }
    if (permissions !== undefined) {
      updateFields.push('permissions = ?')
      updateValues.push(JSON.stringify(permissions))
    }
    if (status !== undefined) {
      updateFields.push('status = ?')
      updateValues.push(status)
    }
    
    updateFields.push('updated_at = NOW()')
    updateValues.push(id)

    await databaseManager.query(
      `UPDATE roles SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    )
    
    return await this.getRoleById(id)
  }

  /**
   * 删除角色（软删除）
   */
  async deleteRole(id) {
    // 检查角色下是否有用户
    const userCountResult = await databaseManager.query(
      'SELECT COUNT(*) as count FROM users WHERE role_id = ?',
      [id]
    )
    if (userCountResult[0].count > 0) {
      throw new Error('该角色下还有用户，不能删除')
    }
    
    await databaseManager.query(
      'UPDATE roles SET status = 0, updated_at = NOW() WHERE id = ?',
      [id]
    )
    
    return true
  }

  /**
   * 统计角色下的用户数量
   */
  async countUsersByRoleId(roleId) {
    const result = await databaseManager.query(
      'SELECT COUNT(*) as count FROM users WHERE role_id = ?',
      [roleId]
    )
    return result[0].count
  }

  /**
   * 项目角色相关方法
   */
  async getProjectRoleById(id) {
    const roleResult = await databaseManager.query(
      'SELECT * FROM project_roles WHERE id = ? LIMIT 1',
      [id]
    )
    return roleResult.length > 0 ? roleResult[0] : null
  }

  async getProjectRoleByCode(code) {
    const roleResult = await databaseManager.query(
      'SELECT * FROM project_roles WHERE code = ? LIMIT 1',
      [code]
    )
    return roleResult.length > 0 ? roleResult[0] : null
  }

  async getProjectRoleByName(name) {
    const roleResult = await databaseManager.query(
      'SELECT * FROM project_roles WHERE name = ? LIMIT 1',
      [name]
    )
    return roleResult.length > 0 ? roleResult[0] : null
  }
}

module.exports = new UserService()
