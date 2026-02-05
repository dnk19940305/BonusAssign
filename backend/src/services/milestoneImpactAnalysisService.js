/**
 * 里程碑影响分析服务
 * 提供依赖链分析、关键路径计算、影响评估等功能
 */

const databaseService = require('./databaseService')
const { v4: uuidv4 } = require('uuid')
const logger = require('../utils/logger')

/**
 * 分析里程碑延期的影响
 */
async function analyzeMilestoneDelay(milestoneId, originalDate, newDate, userId) {
  try {
    logger.info(`开始分析里程碑${milestoneId}的延期影响...`)
    
    // 1. 获取里程碑信息
    const [milestone] = await databaseService.query(
      'SELECT * FROM project_milestones WHERE id = ?',
      [milestoneId]
    )
    
    if (!milestone) {
      throw new Error('里程碑不存在')
    }
    
    const delayDays = Math.ceil(
      (new Date(newDate) - new Date(originalDate)) / (1000 * 60 * 60 * 24)
    )
    
    // 2. 获取所有后续里程碑(递归)
    const affectedMilestones = await findAllSuccessors(milestoneId, milestone.project_id)
    
    // 3. 检查是否在关键路径上
    const isOnCriticalPath = await checkIfOnCriticalPath(milestoneId, milestone.project_id)
    
    // 4. 计算项目延期天数
    let projectDelayDays = 0
    if (isOnCriticalPath) {
      projectDelayDays = delayDays
    }
    
    // 5. 评估影响级别
    const impactLevel = assessImpactLevel(
      affectedMilestones.length,
      delayDays,
      isOnCriticalPath
    )
    
    // 6. 生成依赖链数据
    const dependencyChain = await buildDependencyChain(milestoneId, milestone.project_id)
    
    // 7. 生成风险评估和建议
    const riskAssessment = generateRiskAssessment(
      milestone,
      delayDays,
      affectedMilestones,
      isOnCriticalPath
    )
    
    const suggestions = generateSuggestions(
      milestone,
      delayDays,
      affectedMilestones,
      isOnCriticalPath
    )
    
    // 8. 保存分析结果
    const analysisId = uuidv4()
    await databaseService.query(
      `INSERT INTO milestone_impact_analysis 
       (id, milestone_id, project_id, analysis_type, original_date, new_date,
        delay_days, affected_milestones_count, affected_milestone_ids,
        impact_level, is_critical_path, project_delay_days, dependency_chain,
        risk_assessment, suggestions, analyzed_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        analysisId,
        milestoneId,
        milestone.project_id,
        'delay',
        originalDate,
        newDate,
        delayDays,
        affectedMilestones.length,
        JSON.stringify(affectedMilestones.map(m => m.id)),
        impactLevel,
        isOnCriticalPath,
        projectDelayDays,
        JSON.stringify(dependencyChain),
        riskAssessment,
        suggestions,
        userId
      ]
    )
    
    logger.info(`里程碑影响分析完成: ${analysisId}`)
    
    return {
      analysisId,
      delayDays,
      affectedMilestones,
      impactLevel,
      isOnCriticalPath,
      projectDelayDays,
      dependencyChain,
      riskAssessment,
      suggestions
    }
  } catch (error) {
    logger.error('分析里程碑延期影响失败:', error)
    throw error
  }
}

/**
 * 查找所有后续里程碑(递归)
 */
async function findAllSuccessors(milestoneId, projectId) {
  const visited = new Set()
  const successors = []
  
  async function traverse(currentId) {
    if (visited.has(currentId)) return
    visited.add(currentId)
    
    // 查找直接依赖当前里程碑的所有里程碑
    const dependents = await databaseService.query(
      `SELECT * FROM project_milestones 
       WHERE project_id = ? 
       AND JSON_CONTAINS(dependencies, ?)`,
      [projectId, JSON.stringify(currentId)]
    )
    
    for (const dep of dependents) {
      if (!visited.has(dep.id)) {
        successors.push(dep)
        await traverse(dep.id)
      }
    }
  }
  
  await traverse(milestoneId)
  return successors
}

/**
 * 查找所有前置里程碑(递归)
 */
async function findAllPredecessors(milestoneId, projectId) {
  const visited = new Set()
  const predecessors = []
  
  async function traverse(currentId) {
    if (visited.has(currentId)) return
    visited.add(currentId)
    
    // 获取当前里程碑
    const [current] = await databaseService.query(
      'SELECT * FROM project_milestones WHERE id = ?',
      [currentId]
    )
    
    if (!current || !current.dependencies) return
    
    let deps = []
    try {
      deps = JSON.parse(current.dependencies)
    } catch (e) {
      return
    }
    
    for (const depId of deps) {
      if (!visited.has(depId)) {
        const [predecessor] = await databaseService.query(
          'SELECT * FROM project_milestones WHERE id = ?',
          [depId]
        )
        if (predecessor) {
          predecessors.push(predecessor)
          await traverse(depId)
        }
      }
    }
  }
  
  await traverse(milestoneId)
  return predecessors
}

/**
 * 计算项目的关键路径(CPM算法)
 */
async function calculateCriticalPath(projectId) {
  try {
    logger.info(`开始计算项目${projectId}的关键路径...`)
    
    // 1. 获取项目所有里程碑
    const milestones = await databaseService.query(
      'SELECT * FROM project_milestones WHERE project_id = ? ORDER BY sort_order',
      [projectId]
    )
    
    if (milestones.length === 0) {
      return { path: [], duration: 0, finishDate: null }
    }
    
    // 2. 构建依赖图
    const graph = new Map()
    const inDegree = new Map()
    
    for (const milestone of milestones) {
      graph.set(milestone.id, {
        milestone,
        dependencies: [],
        dependents: [],
        earliestStart: 0,
        earliestFinish: 0,
        latestStart: Infinity,
        latestFinish: Infinity,
        slack: 0
      })
      inDegree.set(milestone.id, 0)
    }
    
    // 解析依赖关系
    for (const milestone of milestones) {
      const node = graph.get(milestone.id)
      let deps = []
      try {
        deps = JSON.parse(milestone.dependencies || '[]')
      } catch (e) {
        deps = []
      }
      
      node.dependencies = deps
      for (const depId of deps) {
        if (graph.has(depId)) {
          graph.get(depId).dependents.push(milestone.id)
          inDegree.set(milestone.id, inDegree.get(milestone.id) + 1)
        }
      }
    }
    
    // 3. 计算最早开始时间(正向计算)
    const queue = []
    for (const [id, degree] of inDegree) {
      if (degree === 0) {
        queue.push(id)
      }
    }
    
    while (queue.length > 0) {
      const currentId = queue.shift()
      const node = graph.get(currentId)
      
      // 计算持续时间
      const duration = calculateMilestoneDuration(node.milestone)
      node.earliestFinish = node.earliestStart + duration
      
      // 更新后续节点
      for (const dependentId of node.dependents) {
        const dependent = graph.get(dependentId)
        dependent.earliestStart = Math.max(
          dependent.earliestStart,
          node.earliestFinish
        )
        
        inDegree.set(dependentId, inDegree.get(dependentId) - 1)
        if (inDegree.get(dependentId) === 0) {
          queue.push(dependentId)
        }
      }
    }
    
    // 4. 找出项目最晚完成时间
    let projectFinish = 0
    for (const node of graph.values()) {
      projectFinish = Math.max(projectFinish, node.earliestFinish)
    }
    
    // 5. 计算最迟完成时间(反向计算)
    for (const node of graph.values()) {
      if (node.dependents.length === 0) {
        node.latestFinish = projectFinish
      }
    }
    
    const reverseQueue = []
    for (const [id, node] of graph) {
      if (node.dependents.length === 0) {
        const duration = calculateMilestoneDuration(node.milestone)
        node.latestStart = node.latestFinish - duration
        reverseQueue.push(id)
      }
    }
    
    const visited = new Set()
    while (reverseQueue.length > 0) {
      const currentId = reverseQueue.shift()
      if (visited.has(currentId)) continue
      visited.add(currentId)
      
      const node = graph.get(currentId)
      const duration = calculateMilestoneDuration(node.milestone)
      
      for (const depId of node.dependencies) {
        const dep = graph.get(depId)
        dep.latestFinish = Math.min(dep.latestFinish, node.latestStart)
        dep.latestStart = dep.latestFinish - calculateMilestoneDuration(dep.milestone)
        reverseQueue.push(depId)
      }
    }
    
    // 6. 计算松弛时间,识别关键路径
    const criticalPath = []
    for (const [id, node] of graph) {
      node.slack = node.latestStart - node.earliestStart
      if (Math.abs(node.slack) < 0.01) {
        criticalPath.push(id)
        
        // 更新缓存表
        await updateDependencyCache(id, projectId, true)
      }
    }
    
    // 7. 计算最早完成日期
    const projectStartDate = new Date(
      Math.min(...milestones.map(m => new Date(m.created_at || new Date())))
    )
    const earliestFinishDate = new Date(projectStartDate)
    earliestFinishDate.setDate(earliestFinishDate.getDate() + projectFinish)
    
    // 8. 保存关键路径
    const pathId = uuidv4()
    
    // 设置旧记录为非当前
    await databaseService.query(
      'UPDATE project_critical_paths SET is_current = 0 WHERE project_id = ?',
      [projectId]
    )
    
    // 插入新记录
    await databaseService.query(
      `INSERT INTO project_critical_paths 
       (id, project_id, path_data, total_duration, earliest_finish_date)
       VALUES (?, ?, ?, ?, ?)`,
      [
        pathId,
        projectId,
        JSON.stringify(criticalPath),
        projectFinish,
        earliestFinishDate
      ]
    )
    
    logger.info(`关键路径计算完成,包含${criticalPath.length}个里程碑`)
    
    return {
      path: criticalPath,
      duration: projectFinish,
      finishDate: earliestFinishDate,
      details: Array.from(graph.values()).map(node => ({
        id: node.milestone.id,
        name: node.milestone.name,
        earliestStart: node.earliestStart,
        earliestFinish: node.earliestFinish,
        latestStart: node.latestStart,
        latestFinish: node.latestFinish,
        slack: node.slack,
        isCritical: Math.abs(node.slack) < 0.01
      }))
    }
  } catch (error) {
    logger.error('计算关键路径失败:', error)
    throw error
  }
}

/**
 * 计算里程碑持续时间
 */
function calculateMilestoneDuration(milestone) {
  if (!milestone.target_date || !milestone.created_at) {
    return 7 // 默认7天
  }
  
  const start = new Date(milestone.created_at)
  const end = new Date(milestone.target_date)
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24))
}

/**
 * 检查里程碑是否在关键路径上
 */
async function checkIfOnCriticalPath(milestoneId, projectId) {
  const [result] = await databaseService.query(
    `SELECT path_data FROM project_critical_paths 
     WHERE project_id = ? AND is_current = 1 
     ORDER BY calculated_at DESC LIMIT 1`,
    [projectId]
  )
  
  if (!result) {
    // 如果没有关键路径,先计算
    await calculateCriticalPath(projectId)
    return checkIfOnCriticalPath(milestoneId, projectId)
  }
  
  const path = JSON.parse(result.path_data)
  return path.includes(milestoneId)
}

/**
 * 构建依赖链数据
 */
async function buildDependencyChain(milestoneId, projectId) {
  const predecessors = await findAllPredecessors(milestoneId, projectId)
  const successors = await findAllSuccessors(milestoneId, projectId)
  
  return {
    milestone: milestoneId,
    predecessors: predecessors.map(p => ({ id: p.id, name: p.name })),
    successors: successors.map(s => ({ id: s.id, name: s.name })),
    totalAffected: predecessors.length + successors.length + 1
  }
}

/**
 * 评估影响级别
 */
function assessImpactLevel(affectedCount, delayDays, isOnCriticalPath) {
  if (isOnCriticalPath && delayDays > 7) {
    return 'critical'
  }
  if (isOnCriticalPath || (affectedCount > 5 && delayDays > 5)) {
    return 'high'
  }
  if (affectedCount > 3 || delayDays > 3) {
    return 'medium'
  }
  return 'low'
}

/**
 * 生成风险评估
 */
function generateRiskAssessment(milestone, delayDays, affectedMilestones, isOnCriticalPath) {
  let assessment = `里程碑"${milestone.name}"延期${delayDays}天。`
  
  if (isOnCriticalPath) {
    assessment += `该里程碑位于项目关键路径上,延期将直接导致项目整体延期${delayDays}天。`
  }
  
  if (affectedMilestones.length > 0) {
    assessment += `受影响的后续里程碑共${affectedMilestones.length}个,包括: ${affectedMilestones.slice(0, 3).map(m => m.name).join('、')}${affectedMilestones.length > 3 ? '等' : ''}。`
  }
  
  if (delayDays > 7) {
    assessment += '延期时间较长,建议立即采取措施。'
  }
  
  return assessment
}

/**
 * 生成建议措施
 */
function generateSuggestions(milestone, delayDays, affectedMilestones, isOnCriticalPath) {
  const suggestions = []
  
  if (isOnCriticalPath) {
    suggestions.push('1. 增加资源投入,加快当前里程碑进度')
    suggestions.push('2. 与项目干系人沟通,调整项目整体时间表')
  }
  
  if (affectedMilestones.length > 0) {
    suggestions.push('3. 重新评估后续里程碑的时间安排')
    suggestions.push('4. 通知相关团队成员,提前做好准备')
  }
  
  if (delayDays > 3) {
    suggestions.push('5. 分析延期原因,制定改进措施')
  }
  
  suggestions.push('6. 考虑并行推进部分非依赖任务')
  
  return suggestions.join('\n')
}

/**
 * 更新依赖关系缓存
 */
async function updateDependencyCache(milestoneId, projectId, isOnCriticalPath = false) {
  const predecessors = await findAllPredecessors(milestoneId, projectId)
  const successors = await findAllSuccessors(milestoneId, projectId)
  
  const cacheId = uuidv4()
  
  // 检查是否已存在
  const [existing] = await databaseService.query(
    'SELECT id FROM milestone_dependency_cache WHERE milestone_id = ?',
    [milestoneId]
  )
  
  if (existing) {
    await databaseService.query(
      `UPDATE milestone_dependency_cache 
       SET all_predecessors = ?,
           all_successors = ?,
           is_on_critical_path = ?
       WHERE milestone_id = ?`,
      [
        JSON.stringify(predecessors.map(p => p.id)),
        JSON.stringify(successors.map(s => s.id)),
        isOnCriticalPath,
        milestoneId
      ]
    )
  } else {
    await databaseService.query(
      `INSERT INTO milestone_dependency_cache 
       (id, milestone_id, project_id, all_predecessors, all_successors, is_on_critical_path)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        cacheId,
        milestoneId,
        projectId,
        JSON.stringify(predecessors.map(p => p.id)),
        JSON.stringify(successors.map(s => s.id)),
        isOnCriticalPath
      ]
    )
  }
}

/**
 * 刷新项目的依赖缓存
 */
async function refreshProjectDependencyCache(projectId) {
  const milestones = await databaseService.query(
    'SELECT id FROM project_milestones WHERE project_id = ?',
    [projectId]
  )
  
  for (const milestone of milestones) {
    await updateDependencyCache(milestone.id, projectId)
  }
  
  logger.info(`项目${projectId}的依赖缓存已刷新`)
}

module.exports = {
  analyzeMilestoneDelay,
  calculateCriticalPath,
  checkIfOnCriticalPath,
  findAllSuccessors,
  findAllPredecessors,
  buildDependencyChain,
  refreshProjectDependencyCache
}
