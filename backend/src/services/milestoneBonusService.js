/**
 * 里程碑奖金服务
 * 提供奖金配置、计算、分配等功能
 */

const databaseService = require('./databaseService')
const { v4: uuidv4 } = require('uuid')
const logger = require('../utils/logger')

/**
 * 配置里程碑奖金
 */
async function configureMilestoneBonus(data) {
  try {
    const {
      projectId,
      milestoneId,
      bonusWeight,
      baseBonus,
      completionBonus = 0,
      qualityBonus = 0,
      onTimeBonus = 0,
      delayPenaltyRate = 10,
      maxPenaltyRate = 50
    } = data

    // 检查是否已存在配置
    const [existing] = await databaseService.query(
      'SELECT id FROM milestone_bonus_config WHERE milestone_id = ?',
      [milestoneId]
    )

    const configId = existing ? existing.id : uuidv4()

    if (existing) {
      // 更新配置
      await databaseService.query(
        `UPDATE milestone_bonus_config SET
         bonus_weight = ?, base_bonus = ?, completion_bonus = ?,
         quality_bonus = ?, on_time_bonus = ?, delay_penalty_rate = ?,
         max_penalty_rate = ?
         WHERE id = ?`,
        [bonusWeight, baseBonus, completionBonus, qualityBonus, onTimeBonus,
         delayPenaltyRate, maxPenaltyRate, configId]
      )
    } else {
      // 创建配置
      await databaseService.query(
        `INSERT INTO milestone_bonus_config
         (id, project_id, milestone_id, bonus_weight, base_bonus,
          completion_bonus, quality_bonus, on_time_bonus,
          delay_penalty_rate, max_penalty_rate)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [configId, projectId, milestoneId, bonusWeight, baseBonus,
         completionBonus, qualityBonus, onTimeBonus, delayPenaltyRate, maxPenaltyRate]
      )
    }

    logger.info(`配置里程碑奖金成功: ${milestoneId}`)

    return await getBonusConfig(milestoneId)
  } catch (error) {
    logger.error('配置里程碑奖金失败:', error)
    throw error
  }
}

/**
 * 获取奖金配置
 */
async function getBonusConfig(milestoneId) {
  const [config] = await databaseService.query(
    'SELECT * FROM milestone_bonus_config WHERE milestone_id = ?',
    [milestoneId]
  )
  return config
}

/**
 * 计算里程碑奖金
 */
async function calculateMilestoneBonus(milestoneId, calculatedBy = null) {
  try {
    logger.info(`开始计算里程碑奖金: ${milestoneId}`)

    // 获取里程碑信息
    const [milestone] = await databaseService.query(
      'SELECT * FROM project_milestones WHERE id = ?',
      [milestoneId]
    )

    if (!milestone) {
      throw new Error('里程碑不存在')
    }

    // 获取奖金配置
    const config = await getBonusConfig(milestoneId)
    if (!config || !config.is_enabled) {
      throw new Error('里程碑未配置奖金或已禁用')
    }

    // 1. 基础奖金
    const baseBonus = parseFloat(config.base_bonus) || 0

    // 2. 完成奖金 = 完成率 × 完成奖金额
    const completionRate = parseFloat(milestone.progress) || 0
    const completionBonus = (completionRate / 100) * (parseFloat(config.completion_bonus) || 0)

    // 3. 质量奖金 - 获取最新质量评分
    const [qualityScore] = await databaseService.query(
      `SELECT quality_score FROM milestone_quality_scores
       WHERE milestone_id = ?
       ORDER BY scored_at DESC LIMIT 1`,
      [milestoneId]
    )
    const quality = qualityScore ? parseFloat(qualityScore.quality_score) : 80 // 默认80分
    const qualityBonus = (quality / 100) * (parseFloat(config.quality_bonus) || 0)

    // 4. 按时奖金与延期惩罚
    let onTimeBonus = 0
    let delayPenalty = 0
    let delayDays = 0

    const targetDate = new Date(milestone.target_date)
    const completionDate = milestone.completion_date
      ? new Date(milestone.completion_date)
      : new Date()

    if (milestone.status === 'completed') {
      delayDays = Math.ceil((completionDate - targetDate) / (1000 * 60 * 60 * 24))

      if (delayDays <= 0) {
        // 按时或提前完成
        onTimeBonus = parseFloat(config.on_time_bonus) || 0
      } else {
        // 延期惩罚 = 总奖金 × 延期惩罚率 × 延期天数
        const delayPenaltyRate = parseFloat(config.delay_penalty_rate) || 10
        const maxPenaltyRate = parseFloat(config.max_penalty_rate) || 50
        const penaltyRate = Math.min(delayPenaltyRate * delayDays, maxPenaltyRate)

        const totalBeforePenalty = baseBonus + completionBonus + qualityBonus
        delayPenalty = (totalBeforePenalty * penaltyRate) / 100
      }
    }

    // 5. 总奖金
    const totalBonus = Math.max(0, baseBonus + completionBonus + qualityBonus + onTimeBonus - delayPenalty)

    // 保存计算记录
    const calculationId = uuidv4()
    await databaseService.query(
      `INSERT INTO milestone_bonus_calculations
       (id, milestone_id, project_id, calculation_date, calculated_by,
        base_bonus, completion_rate, completion_bonus, quality_score,
        quality_bonus, delay_days, delay_penalty, on_time_bonus, total_bonus,
        status)
       VALUES (?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        calculationId, milestoneId, milestone.project_id, calculatedBy,
        baseBonus, completionRate, completionBonus, quality,
        qualityBonus, delayDays, delayPenalty, onTimeBonus, totalBonus,
        'pending'
      ]
    )

    logger.info(`里程碑奖金计算完成: ${calculationId}, 总奖金: ${totalBonus}`)

    return await getCalculationById(calculationId)
  } catch (error) {
    logger.error('计算里程碑奖金失败:', error)
    throw error
  }
}

/**
 * 获取计算记录
 */
async function getCalculationById(calculationId) {
  const [calculation] = await databaseService.query(
    `SELECT c.*, m.name as milestone_name
     FROM milestone_bonus_calculations c
     LEFT JOIN project_milestones m ON c.milestone_id = m.id
     WHERE c.id = ?`,
    [calculationId]
  )
  return calculation
}

/**
 * 分配奖金到成员
 */
async function allocateBonusToMembers(calculationId, allocations) {
  try {
    logger.info(`开始分配奖金到成员: ${calculationId}`)

    // 获取计算记录
    const calculation = await getCalculationById(calculationId)
    if (!calculation) {
      throw new Error('计算记录不存在')
    }

    const totalBonus = parseFloat(calculation.total_bonus)

    // 验证权重总和
    const totalWeight = allocations.reduce((sum, a) => sum + parseFloat(a.contributionWeight), 0)
    if (Math.abs(totalWeight - 100) > 0.01) {
      throw new Error(`贡献权重总和必须为100%, 当前为${totalWeight}%`)
    }

    // 删除旧的分配记录
    await databaseService.query(
      'DELETE FROM milestone_member_bonuses WHERE calculation_id = ?',
      [calculationId]
    )

    // 创建新的分配记录
    for (const allocation of allocations) {
      const {
        userId,
        role,
        contributionWeight,
        performanceScore = 100,
        adjustmentAmount = 0
      } = allocation

      // 计算分配奖金
      const allocatedBonus = (totalBonus * parseFloat(contributionWeight)) / 100

      // 应用个人绩效系数
      const performanceAdjusted = allocatedBonus * (parseFloat(performanceScore) / 100)

      // 最终奖金 = 绩效调整后金额 + 调整金额
      const finalBonus = performanceAdjusted + parseFloat(adjustmentAmount)

      const allocationId = uuidv4()

      await databaseService.query(
        `INSERT INTO milestone_member_bonuses
         (id, calculation_id, milestone_id, project_id, user_id, role,
          contribution_weight, allocated_bonus, performance_score,
          adjustment_amount, final_bonus, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          allocationId, calculationId, calculation.milestone_id, calculation.project_id,
          userId, role, contributionWeight, allocatedBonus, performanceScore,
          adjustmentAmount, finalBonus, 'pending'
        ]
      )
    }

    logger.info(`奖金分配成功: ${allocations.length}个成员`)

    return await getMemberBonuses(calculationId)
  } catch (error) {
    logger.error('分配奖金失败:', error)
    throw error
  }
}

/**
 * 获取成员奖金分配
 */
async function getMemberBonuses(calculationId) {
  const bonuses = await databaseService.query(
    `SELECT mb.*, u.username, u.real_name
     FROM milestone_member_bonuses mb
     LEFT JOIN users u ON mb.user_id = u.id
     WHERE mb.calculation_id = ?
     ORDER BY mb.final_bonus DESC`,
    [calculationId]
  )
  return bonuses
}

/**
 * 审核奖金计算
 */
async function approveBonusCalculation(calculationId, approvedBy) {
  try {
    await databaseService.query(
      `UPDATE milestone_bonus_calculations
       SET status = 'approved', approved_by = ?, approved_at = NOW()
       WHERE id = ?`,
      [approvedBy, calculationId]
    )

    // 同时审核成员奖金
    await databaseService.query(
      `UPDATE milestone_member_bonuses
       SET status = 'approved'
       WHERE calculation_id = ?`,
      [calculationId]
    )

    logger.info(`审核奖金计算成功: ${calculationId}`)

    return await getCalculationById(calculationId)
  } catch (error) {
    logger.error('审核奖金计算失败:', error)
    throw error
  }
}

/**
 * 提交质量评分
 */
async function submitQualityScore(data) {
  try {
    const {
      milestoneId,
      projectId,
      scoredBy,
      qualityScore,
      scoreDetails = {},
      comments = ''
    } = data

    const scoreId = uuidv4()

    await databaseService.query(
      `INSERT INTO milestone_quality_scores
       (id, milestone_id, project_id, scored_by, quality_score,
        score_details, comments)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        scoreId, milestoneId, projectId, scoredBy, qualityScore,
        JSON.stringify(scoreDetails), comments
      ]
    )

    logger.info(`提交质量评分成功: ${scoreId}, 得分: ${qualityScore}`)

    return {
      id: scoreId,
      milestoneId,
      qualityScore,
      scoredBy,
      comments
    }
  } catch (error) {
    logger.error('提交质量评分失败:', error)
    throw error
  }
}

/**
 * 获取项目奖金池
 */
async function getProjectBonusPool(projectId) {
  const [pool] = await databaseService.query(
    'SELECT * FROM project_bonus_pools WHERE project_id = ?',
    [projectId]
  )
  return pool
}

/**
 * 创建或更新项目奖金池
 */
async function createOrUpdateBonusPool(projectId, totalBudget) {
  try {
    const [existing] = await databaseService.query(
      'SELECT id FROM project_bonus_pools WHERE project_id = ?',
      [projectId]
    )

    if (existing) {
      await databaseService.query(
        `UPDATE project_bonus_pools
         SET total_budget = ?, remaining_amount = total_budget - allocated_amount
         WHERE project_id = ?`,
        [totalBudget, projectId]
      )
    } else {
      const poolId = uuidv4()
      await databaseService.query(
        `INSERT INTO project_bonus_pools
         (id, project_id, total_budget, remaining_amount)
         VALUES (?, ?, ?, ?)`,
        [poolId, projectId, totalBudget, totalBudget]
      )
    }

    return await getProjectBonusPool(projectId)
  } catch (error) {
    logger.error('创建/更新奖金池失败:', error)
    throw error
  }
}

/**
 * 获取项目所有里程碑奖金配置
 */
async function getProjectMilestoneBonusConfigs(projectId) {
  const configs = await databaseService.query(
    `SELECT bc.*, m.name as milestone_name, m.status
     FROM milestone_bonus_config bc
     LEFT JOIN project_milestones m ON bc.milestone_id = m.id
     WHERE bc.project_id = ?
     ORDER BY bc.bonus_weight DESC`,
    [projectId]
  )
  return configs
}

/**
 * 批量配置里程碑奖金权重
 */
async function batchConfigureBonusWeights(projectId, configurations) {
  try {
    // 验证权重总和
    const totalWeight = configurations.reduce((sum, c) => sum + parseFloat(c.bonusWeight), 0)
    if (Math.abs(totalWeight - 100) > 0.01) {
      throw new Error(`奖金权重总和必须为100%, 当前为${totalWeight}%`)
    }

    for (const config of configurations) {
      await configureMilestoneBonus({
        projectId,
        ...config
      })
    }

    logger.info(`批量配置奖金权重成功: ${configurations.length}个里程碑`)

    return await getProjectMilestoneBonusConfigs(projectId)
  } catch (error) {
    logger.error('批量配置奖金权重失败:', error)
    throw error
  }
}

module.exports = {
  configureMilestoneBonus,
  getBonusConfig,
  calculateMilestoneBonus,
  getCalculationById,
  allocateBonusToMembers,
  getMemberBonuses,
  approveBonusCalculation,
  submitQualityScore,
  getProjectBonusPool,
  createOrUpdateBonusPool,
  getProjectMilestoneBonusConfigs,
  batchConfigureBonusWeights
}
