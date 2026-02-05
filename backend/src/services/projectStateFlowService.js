﻿/**
 * 项目状态流转服务
 * 管理项目协作的状态机和自动流转
 *
 * 状态流转规则:
 * 1. published → team_building (提交申请时)
 * 2. team_building → approved (批准申请时)
 * 3. team_building → published (拒绝申请时,重新开放)
 * 4. approved → in_progress (项目启动)
 * 5. in_progress → completed (项目完成)
 * 6. * → cancelled (项目取消)
 */

const databaseService = require('./databaseService')
const notificationService = require('./notificationService')
const logger = require('../utils/logger')


/**
 * 项目协作状态枚举
 */
const ProjectCooperationStatus = {
  DRAFT: 'draft',                    // 草稿（未指定经理，支持抢单）
  PUBLISHED: 'published',        // 已发布,等待申请
  TEAM_BUILDING: 'team_building', // 组建中,有待审批申请
  APPROVED: 'approved',          // 已批准,待启动
  IN_PROGRESS: 'in_progress',    // 进行中
  COMPLETED: 'completed',        // 已完成
  CANCELLED: 'cancelled'         // 已取消
}

/**
 * 状态转换映射表
 * key: 当前状态, value: 允许转换到的状态列表
 */
const STATE_TRANSITIONS = {
  [ProjectCooperationStatus.DRAFT]: [
    ProjectCooperationStatus.TEAM_BUILDING,  // 抢单模式：项目经理申请组建团队
    ProjectCooperationStatus.PUBLISHED,      // 指定经理后发布
    ProjectCooperationStatus.CANCELLED
  ],
  [ProjectCooperationStatus.PUBLISHED]: [
    ProjectCooperationStatus.TEAM_BUILDING,
    ProjectCooperationStatus.APPROVED,       // 允许直接批准（跳过组建阶段）
    ProjectCooperationStatus.CANCELLED
  ],
  [ProjectCooperationStatus.TEAM_BUILDING]: [
    ProjectCooperationStatus.APPROVED,
    ProjectCooperationStatus.PUBLISHED,
    ProjectCooperationStatus.CANCELLED
  ],
  [ProjectCooperationStatus.APPROVED]: [
    ProjectCooperationStatus.IN_PROGRESS,
    ProjectCooperationStatus.CANCELLED
  ],
  [ProjectCooperationStatus.IN_PROGRESS]: [
    ProjectCooperationStatus.COMPLETED,
    ProjectCooperationStatus.CANCELLED
  ],
  [ProjectCooperationStatus.COMPLETED]: [],
  [ProjectCooperationStatus.CANCELLED]: []
}

/**
 * 状态变更原因类型
 */
const StateChangeReason = {
  APPLICATION_SUBMITTED: 'application_submitted',   // 提交申请
  APPLICATION_APPROVED: 'application_approved',     // 批准申请
  APPLICATION_REJECTED: 'application_rejected',     // 拒绝申请
  PROJECT_STARTED: 'project_started',               // 项目启动
  PROJECT_COMPLETED: 'project_completed',           // 项目完成
  PROJECT_CANCELLED: 'project_cancelled',           // 项目取消
  MANUAL_CHANGE: 'manual_change'                    // 手动更改
}

class ProjectStateFlowService {
  /**
   * 验证状态转换是否合法
   * @param {string} currentStatus - 当前状态
   * @param {string} targetStatus - 目标状态
   * @returns {boolean} 是否允许转换
   */
  isValidTransition(currentStatus, targetStatus) {
    const allowedStates = STATE_TRANSITIONS[currentStatus] || []
    return allowedStates.includes(targetStatus)
  }

  /**
   * 获取项目当前状态
   * @param {string} projectId - 项目ID
   * @returns {string} 当前状态
   */
  async getProjectStatus(projectId) {
    try {
      const [projects] = await databaseService.manager.pool.execute(
        'SELECT cooperation_status FROM projects WHERE id = ?',
        [projectId]
      )
      return projects[0]?.cooperation_status || null
    } catch (error) {
      logger.error('获取项目状态失败:', error)
      throw error
    }
  }

  /**
   * 更新项目状态
   * @param {string} projectId - 项目ID
   * @param {string} targetStatus - 目标状态
   * @param {string} reason - 状态变更原因
   * @param {Object} metadata - 附加元数据
   * @param {Object} connection - 可选的数据库连接(用于事务)
   * @returns {Object} 状态更新结果
   */
  async updateProjectStatus(projectId, targetStatus, reason, metadata = {}, connection = null) {
    try {
      // 1. 获取当前状态
      const currentStatus = await this.getProjectStatus(projectId)
      if (!currentStatus) {
        throw new Error('项目不存在')
      }

      // 2. 验证状态转换合法性
      if (currentStatus === targetStatus) {
        logger.info('🔄 项目状态已是目标状态,跳过更新', { projectId, targetStatus })
        return {
          success: true,
          previousStatus: currentStatus,
          currentStatus: targetStatus,
          reason: '状态一致，无需更新'
        }
      }

      // 如果当前项目已经处于更先进的状态（如已启动/已完成），则在尝试将其设为已批准时，不报错回滚
      // 状态先进性排序
      const stateImportance = {
        'draft': 0,
        'published': 1,
        'team_building': 2,
        'approved': 4,      // 3 被留空以备扩展
        'in_progress': 5,
        'completed': 6,
        'cancelled': 9      // 终态特殊处理
      }

      const curRank = stateImportance[currentStatus] || 0
      const tgtRank = stateImportance[targetStatus] || 0

      // 如果当前状态等级更高（且不是要取消获退回重招），则跳过并返回成功
      if (curRank > tgtRank && targetStatus !== ProjectCooperationStatus.PUBLISHED && targetStatus !== ProjectCooperationStatus.CANCELLED) {
        logger.warn('🔄 项目状态已超越目标状态, 跳过更新以防回退', { projectId, currentStatus, targetStatus })
        return {
          success: true,
          previousStatus: currentStatus,
          currentStatus: currentStatus,
          reason: '当前状态已超越目标状态'
        }
      }

      if (!this.isValidTransition(currentStatus, targetStatus)) {
        throw new Error(
          `不允许的状态转换: ${currentStatus} → ${targetStatus}`
        )
      }

      // 3. 执行状态更新
      const now = new Date()

      const conn = connection || databaseService.manager.pool
      const executeQuery = connection
        ? (sql, params) => connection.execute(sql, params)
        : (sql, params) => conn.execute(sql, params)

      await executeQuery(
        `UPDATE projects
         SET cooperation_status = ?, updated_at = NOW()
         WHERE id = ?`,
        [targetStatus, projectId]
      )

      // 4. 记录状态变更历史
      await this.recordStateChange(projectId, currentStatus, targetStatus, reason, metadata)

      logger.info('🔄 项目状态更新成功', {
        projectId,
        transition: `${currentStatus} → ${targetStatus}`,
        reason
      })

      return {
        success: true,
        previousStatus: currentStatus,
        currentStatus: targetStatus,
        reason,
        timestamp: now
      }

    } catch (error) {
      logger.error('❌ 项目状态更新失败:', error)
      throw error
    }
  }

  /**
   * 记录状态变更历史
   * @param {string} projectId - 项目ID
   * @param {string} fromStatus - 原状态
   * @param {string} toStatus - 新状态
   * @param {string} reason - 变更原因
   * @param {Object} metadata - 附加元数据
   */
  async recordStateChange(projectId, fromStatus, toStatus, reason, metadata = {}) {
    try {
      const record = {
        projectId,
        fromStatus,
        toStatus,
        reason,
        metadata: JSON.stringify(metadata),
        createdAt: new Date()
      }

      await databaseService.manager.pool.execute(
        `INSERT INTO project_state_history
         (id, project_id, from_status, to_status, reason, metadata, created_at)
         VALUES (UUID(), ?, ?, ?, ?, ?, NOW())`,
        [projectId, fromStatus, toStatus, reason, record.metadata]
      )

      logger.info('📝 状态变更历史已记录', { projectId, transition: `${fromStatus} → ${toStatus}` })
    } catch (error) {
      logger.error('记录状态变更历史失败:', error)
      // 不抛出错误,避免影响主流程
    }
  }

  /**
   * 自动处理申请提交的状态流转
   * @param {string} projectId - 项目ID
   * @param {string} applicationId - 申请ID
   * @param {string} applicantId - 申请人ID
   * @returns {Object} 处理结果
   */
  async handleApplicationSubmitted(projectId, applicationId, applicantId) {
    try {
      const result = await this.updateProjectStatus(
        projectId,
        ProjectCooperationStatus.TEAM_BUILDING,
        StateChangeReason.APPLICATION_SUBMITTED,
        { applicationId, applicantId }
      )

      logger.info('✅ 申请提交状态流转完成', { projectId, applicationId })

      return result
    } catch (error) {
      logger.error('❌ 申请提交状态流转失败:', error)
      throw error
    }
  }

  /**
   * 自动处理申请批准的状态流转
   * @param {string} projectId - 项目ID
   * @param {string} applicationId - 申请ID
   * @param {string} approverId - 审批人ID
   * @param {Object} connection - 可选的数据库连接(用于事务)
   * @returns {Object} 处理结果
   */
  async handleApplicationApproved(projectId, applicationId, approverId, connection = null) {
    try {
      const result = await this.updateProjectStatus(
        projectId,
        ProjectCooperationStatus.APPROVED,
        StateChangeReason.APPLICATION_APPROVED,
        { applicationId, approverId },
        connection
      )

      // 发送状态变更通知
      await this.notifyStatusChange(projectId, 'approved', {
        applicationId,
        approverId
      })

      logger.info('✅ 申请批准状态流转完成', { projectId, applicationId })

      return result
    } catch (error) {
      logger.error('❌ 申请批准状态流转失败:', error)
      throw error
    }
  }

  /**
   * 自动处理申请拒绝的状态流转
   * @param {string} projectId - 项目ID
   * @param {string} applicationId - 申请ID
   * @param {string} approverId - 审批人ID
   * @param {string} reason - 拒绝理由
   * @param {Object} connection - 可选的数据库连接(用于事务)
   * @returns {Object} 处理结果
   */
  async handleApplicationRejected(projectId, applicationId, approverId, reason, connection = null) {
    try {
      const result = await this.updateProjectStatus(
        projectId,
        ProjectCooperationStatus.PUBLISHED,
        StateChangeReason.APPLICATION_REJECTED,
        { applicationId, approverId, rejectionReason: reason },
        connection
      )

      // 发送状态变更通知
      await this.notifyStatusChange(projectId, 'rejected', {
        applicationId,
        approverId,
        reason
      })

      logger.info('✅ 申请拒绝状态流转完成(项目重新开放)', { projectId, applicationId })

      return result
    } catch (error) {
      logger.error('❌ 申请拒绝状态流转失败:', error)
      throw error
    }
  }

  /**
   * 项目启动状态流转
   * @param {string} projectId - 项目ID
   * @param {string} startedBy - 启动人ID
   * @returns {Object} 处理结果
   */
  async startProject(projectId, startedBy) {
    try {
      const result = await this.updateProjectStatus(
        projectId,
        ProjectCooperationStatus.IN_PROGRESS,
        StateChangeReason.PROJECT_STARTED,
        { startedBy, startedAt: new Date() }
      )

      await this.notifyStatusChange(projectId, 'started', { startedBy })

      logger.info('✅ 项目启动状态流转完成', { projectId })

      return result
    } catch (error) {
      logger.error('❌ 项目启动状态流转失败:', error)
      throw error
    }
  }

  /**
   * 项目完成状态流转
   * @param {string} projectId - 项目ID
   * @param {string} completedBy - 完成人ID
   * @returns {Object} 处理结果
   */
  async completeProject(projectId, completedBy) {
    try {
      const result = await this.updateProjectStatus(
        projectId,
        ProjectCooperationStatus.COMPLETED,
        StateChangeReason.PROJECT_COMPLETED,
        { completedBy, completedAt: new Date() }
      )

      await this.notifyStatusChange(projectId, 'completed', { completedBy })

      logger.info('✅ 项目完成状态流转完成', { projectId })

      return result
    } catch (error) {
      logger.error('❌ 项目完成状态流转失败:', error)
      throw error
    }
  }

  /**
   * 项目取消状态流转
   * @param {string} projectId - 项目ID
   * @param {string} cancelledBy - 取消人ID
   * @param {string} reason - 取消原因
   * @returns {Object} 处理结果
   */
  async cancelProject(projectId, cancelledBy, reason) {
    try {
      const currentStatus = await this.getProjectStatus(projectId)

      // 取消操作可以从任何状态进行(除了已完成和已取消)
      if ([ProjectCooperationStatus.COMPLETED, ProjectCooperationStatus.CANCELLED].includes(currentStatus)) {
        throw new Error('项目已处于终态,无法取消')
      }

      const result = await this.updateProjectStatus(
        projectId,
        ProjectCooperationStatus.CANCELLED,
        StateChangeReason.PROJECT_CANCELLED,
        { cancelledBy, reason, cancelledAt: new Date() }
      )

      await this.notifyStatusChange(projectId, 'cancelled', { cancelledBy, reason })

      logger.info('✅ 项目取消状态流转完成', { projectId })

      return result
    } catch (error) {
      logger.error('❌ 项目取消状态流转失败:', error)
      throw error
    }
  }

  /**
   * 发送状态变更通知
   * @param {string} projectId - 项目ID
   * @param {string} action - 操作类型
   * @param {Object} metadata - 附加信息
   */
  async notifyStatusChange(projectId, action, metadata = {}) {
    try {
      // 获取项目信息
      let project
      const [projects] = await databaseService.pool.execute(
        'SELECT * FROM projects WHERE id = ?',
        [projectId]
      )
      project = projects[0]

      if (!project) {
        logger.warn('项目不存在,跳过通知', { projectId })
        return
      }

      // 获取项目相关人员
      let members = []
      const [memberRows] = await databaseService.pool.execute(
        'SELECT employee_id FROM project_members WHERE project_id = ? AND status = "active"',
        [projectId]
      )
      members = memberRows

      const recipientIds = members.map(m => m.employee_id || m.employeeId)

      // 根据操作类型构建通知
      const notificationConfigs = {
        approved: {
          title: '项目团队申请已批准',
          content: `项目"${project.name}"的团队申请已批准,项目即将启动`
        },
        rejected: {
          title: '项目团队申请被拒绝',
          content: `项目"${project.name}"的团队申请被拒绝,项目重新开放申请。拒绝理由: ${metadata.reason || '未说明'}`
        },
        started: {
          title: '项目已启动',
          content: `项目"${project.name}"已正式启动,请各团队成员按计划推进工作`
        },
        completed: {
          title: '项目已完成',
          content: `恭喜!项目"${project.name}"已顺利完成`
        },
        cancelled: {
          title: '项目已取消',
          content: `项目"${project.name}"已取消。取消原因: ${metadata.reason || '未说明'}`
        }
      }

      const config = notificationConfigs[action]
      if (!config || recipientIds.length === 0) {
        return
      }

      // 发送通知
      await notificationService.sendProjectNotification(
        projectId,
        `project_${action}`,
        config.title,
        config.content,
        recipientIds,
        { action, ...metadata }
      )

      logger.info('📢 状态变更通知已发送', { projectId, action, recipientCount: recipientIds.length })

    } catch (error) {
      logger.error('发送状态变更通知失败:', error)
      // 不抛出错误,避免影响主流程
    }
  }

  /**
   * 获取项目状态历史
   * @param {string} projectId - 项目ID
   * @returns {Array} 状态历史记录
   */
  async getProjectStateHistory(projectId) {
    try {
      const [history] = await databaseService.pool.execute(
        `SELECT * FROM project_state_history
           WHERE project_id = ?
           ORDER BY created_at DESC`,
        [projectId]
      )
      return history
    } catch (error) {
      logger.error('获取项目状态历史失败:', error)
      return []
    }
  }

  /**
   * 检查项目是否可以执行某个操作
   * @param {string} projectId - 项目ID
   * @param {string} action - 操作类型 (submit_application, approve, start, complete, cancel)
   * @returns {Object} 检查结果
   */
  async canPerformAction(projectId, action) {
    try {
      const currentStatus = await this.getProjectStatus(projectId)

      const actionRequirements = {
        submit_application: [ProjectCooperationStatus.PUBLISHED],
        approve: [ProjectCooperationStatus.TEAM_BUILDING],
        reject: [ProjectCooperationStatus.TEAM_BUILDING],
        start: [ProjectCooperationStatus.APPROVED],
        complete: [ProjectCooperationStatus.IN_PROGRESS],
        cancel: [
          ProjectCooperationStatus.PUBLISHED,
          ProjectCooperationStatus.TEAM_BUILDING,
          ProjectCooperationStatus.APPROVED,
          ProjectCooperationStatus.IN_PROGRESS
        ]
      }

      const allowedStatuses = actionRequirements[action] || []
      const canPerform = allowedStatuses.includes(currentStatus)

      return {
        canPerform,
        currentStatus,
        allowedStatuses,
        reason: canPerform ? null : `当前状态(${currentStatus})不允许执行此操作`
      }
    } catch (error) {
      logger.error('检查操作权限失败:', error)
      return {
        canPerform: false,
        reason: '检查失败: ' + error.message
      }
    }
  }
}

module.exports = {
  ProjectStateFlowService: new ProjectStateFlowService(),
  ProjectCooperationStatus,
  StateChangeReason
}
