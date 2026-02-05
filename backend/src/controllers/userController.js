const { databaseManager } = require('../config/database')
const userService = require('../services/userService')
const { User, Role, Department } = require('../models')
const { Op } = require('sequelize')
const bcrypt = require('bcryptjs')
const logger = require('../utils/logger')


class UserController {
  // 获取用户列表
  async list(req, res) {
    try {
      const { 
        page = 1, 
        pageSize = 20, 
        search, 
        roleId, 
        departmentId, 
        status 
      } = req.query

      // 使用服务层获取用户列表
      const result = await userService.getUserList({
        page,
        pageSize,
        search,
        roleId,
        departmentId,
        status
      })
      
      // 处理用户数据，排除密码字段
      const usersWithRelations = result.users.map(user => {
        const { password, role_name, role_description, department_name, department_code, ...userData } = user
        return {
          id: user.id,
          ...userData,
          Role: role_name ? { name: role_name, description: role_description } : null,
          Department: department_name ? { name: department_name, code: department_code } : null
        }
      })
      
      res.json({
        code: 200,
        data: {
          users: usersWithRelations,
          pagination: result.pagination
        },
        message: '获取成功'
      })

    } catch (error) {
      logger.error('Get users error:', error)
      res.status(500).json({
        code: 500,
        message: '获取用户列表失败',
        data: null
      })
    }
  }

  // 获取用户详情
  async detail(req, res, next) {
    try {
      const { id } = req.params

      // 使用服务层获取用户详情
      const user = await userService.getUserById(id)
      
      if (!user) {
        return res.status(404).json({
          code: 404,
          message: '用户不存在',
          data: null
        })
      }
      
      // 构建返回数据，排除密码字段
      const { password, role_name, role_description, department_name, department_code, ...userData } = user
      const result = {
        id: user.id,
        ...userData,
        Role: role_name ? { name: role_name, description: role_description } : null,
        Department: department_name ? { name: department_name, code: department_code } : null
      }

      res.json({
        code: 200,
        data: result,
        message: '获取成功'
      })

    } catch (error) {
      logger.error('Get user detail error:', error)
      next(error)
    }
  }

  // 创建用户
  async create(req, res, next) {
    try {

      
      const { username, password, realName, email, phone, roleId, departmentId, employeeId, status } = req.body

      try {
        // 使用服务层创建用户
        const newUser = await userService.createUser({
          username,
          password,
          realName,
          email,
          phone,
          roleId,
          departmentId,
          employeeId,
          status
        })
        
        logger.info(`用户创建成功: ${username}`)
        
        // 构建返回数据，排除密码字段
        const { password: userPassword, role_name, role_description, department_name, department_code, ...userDataResult } = newUser
        const result = {
          id: newUser.id,
          ...userDataResult,
          Role: role_name ? { name: role_name, description: role_description } : null,
          Department: department_name ? { name: department_name, code: department_code } : null
        }

        res.json({
          code: 200,
          data: result,
          message: '创建成功'
        })
      } catch (error) {
        return res.status(400).json({
          code: 400,
          message: error.message,
          data: null
        })
      }

    } catch (error) {
      logger.error('Create user error:', error)
      next(error)
    }
  }

  // 更新用户
  async update(req, res, next) {
    try {

      
      const { id } = req.params
      const { username, realName, email, phone, roleId, departmentId, status } = req.body

      try {
        // 使用服务层更新用户
        const updatedUser = await userService.updateUser(id, {
          username,
          realName,
          email,
          phone,
          roleId,
          departmentId,
          status
        })

        logger.info(`管理员${req.user.username}更新了用户: ${updatedUser.username}`)

        // 构建返回数据，排除密码字段
        const { password: userPassword, role_name, role_description, department_name, department_code, ...userData } = updatedUser
        const result = {
          id: updatedUser.id,
          ...userData,
          Role: role_name ? { name: role_name, description: role_description } : null,
          Department: department_name ? { name: department_name, code: department_code } : null
        }

        res.json({
          code: 200,
          data: result,
          message: '更新成功'
        })
      } catch (error) {
        return res.status(400).json({
          code: 400,
          message: error.message,
          data: null
        })
      }

    } catch (error) {
      logger.error('Update user error:', error)
      next(error)
    }
  }

  // 重置用户密码
  async resetPassword(req, res, next) {
    try {

      
      const { id } = req.params
      const { newPassword } = req.body

      try {
        // 使用服务层重置密码
        await userService.resetPassword(id, newPassword)
        
        const user = await userService.getUserById(id)
        logger.info(`管理员${req.user.username}重置了用户${user.username}的密码`)

        res.json({
          code: 200,
          data: null,
          message: '密码重置成功'
        })
      } catch (error) {
        return res.status(400).json({
          code: 400,
          message: error.message,
          data: null
        })
      }

    } catch (error) {
      logger.error('Reset password error:', error)
      next(error)
    }
  }

  // 删除用户
  async delete(req, res, next) {
    try {

      
      const { id } = req.params

      // 不能删除自己
      if (id === req.user.id) {
        return res.status(400).json({
          code: 400,
          message: '不能删除自己的账户',
          data: null
        })
      }

      try {
        // 使用服务层删除用户
        await userService.deleteUser(id, req.user.id)
        
        const user = await userService.getUserById(id)
        logger.info(`管理员${req.user.username}删除了用户: ${user.username}`)

        res.json({
          code: 200,
          data: null,
          message: '删除成功'
        })
      } catch (error) {
        return res.status(400).json({
          code: 400,
          message: error.message,
          data: null
        })
      }

    } catch (error) {
      logger.error('Delete user error:', error)
      next(error)
    }
  }

  // 批量操作用户
  async batchOperation(req, res, next) {
    try {

      const { action, userIds } = req.body

      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({
          code: 400,
          message: '请选择要操作的用户',
          data: null
        })
      }

      // 不能操作自己
      if (userIds.includes(req.user.id)) {
        return res.status(400).json({
          code: 400,
          message: '不能对自己执行批量操作',
          data: null
        })
      }

      try {
        // 使用服务层批量操作用户
        const result = await userService.batchOperation(userIds, action)
        
        let actionText = ''
        switch (action) {
          case 'enable':
            actionText = '启用'
            break
          case 'disable':
            actionText = '禁用'
            break
        }
        
        logger.info(`管理员${req.user.username}批量${actionText}了${result.updatedCount}个用户`)

        res.json({
          code: 200,
          data: { updatedCount: result.updatedCount },
          message: `批量${actionText}成功，共处理${result.updatedCount}个用户`
        })
      } catch (error) {
        return res.status(400).json({
          code: 400,
          message: error.message,
          data: null
        })
      }

    } catch (error) {
      logger.error('Batch operation error:', error)
      next(error)
    }
  }
}

module.exports = new UserController()