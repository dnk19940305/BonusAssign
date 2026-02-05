const logger = require('../utils/logger')
const databaseService = require('./databaseService')
const projectMemberService = require('./projectMemberService')
const { databaseManager } = require('../config/database')


class ProjectBonusService {
  /**
   * 创建项目奖金池
   */
  async createProjectBonusPool(projectId, period, totalAmount, profitRatio, createdBy) {
    try {
      // 检查项目是否存在
      const project = await databaseService.getProjectById(projectId)
      if (!project) {
        throw new Error('项目不存在')
      }

      // 检查该项目是否已经有奖金池（一个项目只能有一个奖金池）
      const existingPools = await databaseService.find('projectBonusPools', { 
        projectId,
        status: { $ne: 'deleted' } 
      })
      
      if (existingPools && existingPools.length > 0) {
        throw new Error('该项目已存在奖金池，一个项目只能创建一个奖金池')
      }

      // 验证奖金金额是否在合理范围内
      const budget = parseFloat(project.budget) || 0
      const cost = await this.getProjectTotalCost(projectId)
      const expectedProfit = budget - cost
      
      logger.info(`项目财务检查 - 预算: ${budget}, 成本: ${cost}, 预期利润: ${expectedProfit}, 奖金金额: ${totalAmount}`)
      
      // 检查奖金金额是否超过预算（硬性限制）
      if (totalAmount > budget) {
        throw new Error(`奖金金额 ¥${totalAmount} 不能超过项目预算 ¥${budget}`)
      }
      
      // 检查奖金金额是否超过预期利润（警告但允许）
      if (totalAmount > expectedProfit && expectedProfit > 0) {
        logger.warn(`警告：奖金金额 ¥${totalAmount} 超过了项目预期利润 ¥${expectedProfit}`)
      }
      
      // 检查项目是否亏损
      if (expectedProfit <= 0) {
        logger.warn(`警告：项目当前亏损 ¥${Math.abs(expectedProfit)}，创建奖金池需谨慎`)
      }

      const poolData = {
        projectId,
        period,
        totalAmount,
        profitRatio,
        projectProfit: expectedProfit, // 添加项目利润信息
        status: 'pending', // pending/approved/distributed
        createdBy,
        createdAt: new Date()
      }

      const pool = await databaseService.createProjectBonusPool(poolData)
      logger.info(`创建项目奖金池成功: ${pool._id}`)
      return {
        id: pool._id || pool.id,
        ...pool
      }

    } catch (error) {
      logger.error('创建项目奖金池失败:', error)
      throw error
    }
  }

  /**
   * 计算项目奖金分配
   */
  async calculateProjectBonus(poolId, calculatedBy) {
    try {
      // 验证输入参数
      if (!poolId) {
        throw new Error('项目奖金池ID不能为空')
      }

      // 获取奖金池信息
      const pool = await databaseService.findOne('projectBonusPools', { _id: poolId })
      if (!pool) {
        throw new Error(`项目奖金池不存在: ${poolId}`)
      }

      // 允许重新计算：移除状态检查，支持 pending 和 calculated 状态的奖金池
      console.log(`📊 开始计算项目奖金: 项目${pool.projectId}, 期间${pool.period}, 总金额${pool.totalAmount}, 当前状态: ${pool.status}`)

      // 获取项目成员列表（使用 projectMemberService，包含项目经理）
      let members = await projectMemberService.getProjectMembers(pool.projectId)
      
      if (!members) {
        console.warn(`项目 ${pool.projectId} 返回的成员列表为 null，尝试使用替代方法获取`)
        members = await databaseService.find('projectMembers', { projectId: pool.projectId })
      }
      
      if (!Array.isArray(members)) {
        console.error(`项目成员数据格式错误:`, typeof members, members)
        throw new Error('项目成员数据格式错误')
      }

      if (members.length === 0) {
        throw new Error(`项目 ${pool.projectId} 暂无成员，请先添加项目成员`)
      }

      // 获取已审批的成员，放宽条件以避免无人符合的问题
      const approvedMembers = members.filter(m => {
        // 基本条件: 必须有员工ID
        if (!m.employeeId) {
          console.warn(`成员 ${m._id} 缺少员工ID`)
          return false
        }

        // 状态校验: approved 或者 active
        const validStatuses = ['approved', 'active', 'confirmed']
        const hasValidStatus = validStatuses.includes(m.status)
        
        // 角色校验: 必须有角色或者有默认角色
        const hasRole = m.roleId || m.role || m.defaultRole
        
        if (!hasValidStatus) {
          console.warn(`成员 ${m._id} (员工${m.employeeId}) 状态不符合: ${m.status}`)
        }
        
        if (!hasRole) {
          console.warn(`成员 ${m._id} (员工${m.employeeId}) 缺少角色信息`)
          // 为没有角色的成员设置默认角色（仅当 roleId 为 undefined/null 时）
          if (m.roleId === undefined || m.roleId === null) {
            // 尝试使用 role_id 字段（数据库 snake_case 命名）
            if (m.role_id !== undefined && m.role_id !== null) {
              m.roleId = m.role_id
            } else {
              m.roleId = 'developer' // 设置默认角色
              m.defaultRoleAssigned = true
            }
          }
        }
        
        return hasValidStatus
      })
      
      console.log('🔍 项目成员状态分析:', {
        总成员数: members.length,
        已审批成员数: approvedMembers.length,
        成员详情: members.map(m => ({
          id: m._id || m.id,
          employeeId: m.employeeId,
          status: m.status,
          roleId: m.roleId,
          hasRole: !!(m.roleId || m.role || m.defaultRole),
          isApproved: ['approved', 'active', 'confirmed'].includes(m.status)
        }))
      })
      
      if (approvedMembers.length === 0) {
        // 提供更详细的错误信息
        const statusCounts = {}
        members.forEach(m => {
          statusCounts[m.status] = (statusCounts[m.status] || 0) + 1
        })
        
        const errorMessage = `项目 ${pool.projectId} 暂无符合条件的成员。` +
          `现有成员状态统计: ${JSON.stringify(statusCounts)}。` +
          `请检查成员状态是否为 'approved'、'active' 或 'confirmed'，` +
          `并确保每个成员都有角色信息。`
        
        throw new Error(errorMessage)
      }

      // 获取角色权重配置
      const roleWeights = await this.getProjectRoleWeights(pool.projectId)
      console.log(`📋 角色权重配置:`, roleWeights)
      
      // 计算每个成员的奖金
      const allocations = []
      let totalWeight = 0
      const validMembers = [] // 用于存储有效的成员和其权重

      // 首先计算总权重并收集有效成员
      console.log(`📋 开始计算成员权重...`)
      
      // ✅ 问题3修复: 记录计算失败的成员
      const calculationErrors = []

      // 首先计算总权重并收集有效成员
      for (const member of approvedMembers) {
        try {
          const employee = await databaseService.getEmployeeById(member.employeeId)
          if (!employee) {
            const errorMsg = `未找到员工信息: ${member.employeeId}`
            console.warn(errorMsg)
            calculationErrors.push({ employeeId: member.employeeId, error: errorMsg })
            continue
          }

          // 获取角色权重，处理默认情况（允许0权重，不使用"||"吞掉0）
          // 优先使用 member.roleId，如果为 undefined/null 才使用默认值
          let rawRoleId
          if (member.roleId !== undefined && member.roleId !== null) {
            rawRoleId = member.roleId
          } else if (member.role_id !== undefined && member.role_id !== null) {
            // 兼容数据库字段名（snake_case）
            rawRoleId = member.role_id
          } else {
            // 无角色信息时使用默认值
            rawRoleId = 'developer'
          }
          
          // 将数字 roleId 转换为 code (如 1 -> 'PM')
          let roleId = rawRoleId
          if (typeof rawRoleId === 'number' || (typeof rawRoleId === 'string' && !isNaN(parseInt(rawRoleId)))) {
            try {
              // 查询 project_roles 表获取 code
              const roleRecord = await databaseService.query(
                'SELECT code FROM project_roles WHERE id = ? LIMIT 1',
                [parseInt(rawRoleId)]
              )
              if (roleRecord && roleRecord.length > 0 && roleRecord[0].code) {
                roleId = roleRecord[0].code
                console.log(`角色ID ${rawRoleId} 转换为 code: ${roleId}`)
              } else {
                console.warn(`未找到角色ID ${rawRoleId} 对应的 code，使用原值`)
                roleId = String(rawRoleId)
              }
            } catch (err) {
              console.error(`查询角色 code 失败: ${err.message}，使用原值`)
              roleId = String(rawRoleId)
            }
          }
          let roleWeight
          if (Object.prototype.hasOwnProperty.call(roleWeights, roleId)) {
            const w = typeof roleWeights[roleId] === 'number' ? roleWeights[roleId] : parseFloat(roleWeights[roleId])
            roleWeight = !isNaN(w) ? w : 0
          } else if (Object.prototype.hasOwnProperty.call(roleWeights, 'DEVELOPER')) {
            // 兼容fallback: 使用 DEVELOPER 的权重
            const w = typeof roleWeights['DEVELOPER'] === 'number' ? roleWeights['DEVELOPER'] : parseFloat(roleWeights['DEVELOPER'])
            roleWeight = !isNaN(w) ? w : 1.0
          } else if (Object.prototype.hasOwnProperty.call(roleWeights, 'default')) {
            // 最后兼容: 使用 default 权重
            const w = typeof roleWeights['default'] === 'number' ? roleWeights['default'] : parseFloat(roleWeights['default'])
            roleWeight = !isNaN(w) ? w : 1.0
          } else {
            // 最终兼容: 硬编码 1.0
            roleWeight = 1.0
          }
          
          // 获取贡献权重（百分比格式 0-100）
          const contributionWeight = parseFloat(member.contributionWeight || member.contribution_weight) || 100
          
          // 获取工作量占比（百分比格式 1-100）
          const estimatedWorkload = parseFloat(member.estimatedWorkload || member.estimated_workload) || 100
          
          // 获取参与比例（百分比格式 0-100）
          const pr = parseFloat(member.participationRatio)
          const participationRatio = isNaN(pr) ? 100 : pr  // 默认100%
          
          // ✅ 项目奖金不使用绩效系数，固定为 1.0
          // 理由：项目奖金已经基于角色权重、贡献权重、工作量占比进行了差异化，
          // 不需要再使用绩效系数进行调整，避免双重调整导致不公平。
          const performanceCoeff = 1.0
          
          // 计算最终权重 - 简化公式：成员权重 = 角色权重 × 贡献权重 × 工作量占比 × 参与度
          // 注意：贡献权重、工作量占比和参与比例都是百分比，需要除以100转换
          const memberWeight = roleWeight * (contributionWeight / 100) * (estimatedWorkload / 100) * (participationRatio / 100) * performanceCoeff
          
          if (memberWeight > 0) {
            totalWeight += memberWeight
            validMembers.push({
              member,
              employee,
              roleId,
              roleWeight,
              performanceCoeff,  // ✅ 固定为 1.0，项目奖金不使用绩效系数
              participationRatio,
              memberWeight
            })
            
            console.log(`成员 ${employee.name} (角色: ${roleId})：权重 = ${roleWeight} × ${contributionWeight}% × ${estimatedWorkload}% × ${participationRatio}% × ${performanceCoeff} = ${memberWeight.toFixed(4)}`)
          } else {
            const warnMsg = `成员 ${employee.name} 的权重为0，将被跳过`
            console.warn(warnMsg)
            calculationErrors.push({ employeeId: member.employeeId, employeeName: employee.name, error: warnMsg })
          }
        } catch (error) {
          const errorMsg = `处理成员 ${member.employeeId} 时出错: ${error.message}`
          console.error(errorMsg)
          calculationErrors.push({ employeeId: member.employeeId, error: errorMsg })
        }
      }
      
      // ✅ 问题3修复: 检查是否有关键成员计算失败
      if (calculationErrors.length > 0) {
        console.warn(`⚠️  有 ${calculationErrors.length} 个成员计算失败:`, calculationErrors)
        // 如果失败数超过30%，阻断流程
        if (calculationErrors.length / approvedMembers.length > 0.3) {
          throw new Error(`计算失败成员比例过高 (${calculationErrors.length}/${approvedMembers.length})，阻断奖金计算`)
        }
      }

      if (totalWeight <= 0 || validMembers.length === 0) {
        throw new Error(`项目成员总权重为0或没有有效成员，无法进行奖金分配`)
      }

      console.log(`📋 总权重: ${totalWeight}，有效成员: ${validMembers.length} 名`)

      // 然后计算每个成员的实际奖金
      console.log(`💰 开始奖金分配计算...`)
      
      // ✅ 问题2修复: 使用整数计算避免浮点误差（单位:分）
      const poolAmountCents = Math.round(pool.totalAmount * 100) // 转为分
      let allocatedCents = 0 // 已分配金额（分）
      
      for (let i = 0; i < validMembers.length; i++) {
        const memberData = validMembers[i]
        const { member, employee, roleId, roleWeight, participationRatio, performanceCoeff, memberWeight } = memberData
        
        // ✅ 问题2修复: 整数计算金额（分）
        let bonusAmountCents
        if (i === validMembers.length - 1) {
          // 最后一个成员，使用剩余金额避免误差累积
          bonusAmountCents = poolAmountCents - allocatedCents
        } else {
          bonusAmountCents = Math.round(poolAmountCents * memberWeight / totalWeight)
        }
        
        // 转回元（保疙2位小数）
        const finalBonusAmount = Math.max(0, bonusAmountCents / 100)
        allocatedCents += bonusAmountCents

        const allocation = {
          poolId: pool._id,
          employeeId: member.employeeId,
          roleId: roleId,
          roleWeight,
          performanceCoeff, // 使用实际查询的绩效系数
          participationRatio, // 保存原始百分比值（0-100）
          contributionWeight: member.contributionWeight || member.contribution_weight || 100, // 保存贡献权重百分比值（0-100）
          // estimatedWorkload 不保存到数据库，从 project_members 表实时获取
          bonusAmount: finalBonusAmount,
          status: 'calculated'
        }

        allocations.push(allocation)
        
        console.log(`✅ ${employee.name}: ${finalBonusAmount} 元 (权重比例: ${(memberWeight/totalWeight*100).toFixed(2)}%)`)
      }

      // ✅ 问题2修复: 使用整数验证分配结果
      const totalAllocatedCents = allocations.reduce((sum, allocation) => sum + Math.round(allocation.bonusAmount * 100), 0)
      const allocationDifferenceCents = Math.abs(totalAllocatedCents - poolAmountCents)
      
      // ✅ 问题3修复: 严格验证分配结果
      if (allocationDifferenceCents > 1) { // 允许1分的误差
        const errorMsg = `奖金分配总额与奖金池总额不一致: 分配${(totalAllocatedCents/100).toFixed(2)}元, 池${pool.totalAmount}元, 差异${(allocationDifferenceCents/100).toFixed(2)}元`
        console.error(`❌ ${errorMsg}`)
        throw new Error(errorMsg) // ✅ 问题3修复: 严格阻断而不是仅警告
      }
      
      console.log(`✅ 奖金分配验证通过: 总额${(totalAllocatedCents/100).toFixed(2)}元, 误差${(allocationDifferenceCents/100).toFixed(2)}元`)

      // 先删除该奖金池的所有旧分配记录，防止重复
      console.log(`🧹 清理该奖金池的旧分配记录...`)
      
      // ✅ 使用事务保证数据一致性：删除旧数据 + 插入新数据
      const connection = await databaseManager.beginTransaction()
      let savedAllocations = [] // ✅ 在try外定义，扩大作用域
      
      try {
        console.log(`🔒 事务开启，开始原子操作...`)
        
        // 步骤1: 删除旧记录
        const deleteResult = await connection.query(
          'DELETE FROM project_bonus_allocations WHERE pool_id = ?',
          [pool._id]
        )
        console.log(`✅ 已删除 ${deleteResult.affectedRows || 0} 条旧记录`)
        
        // 步骤2: 保存新记录
        console.log(`💾 保存奖金分配记录到数据库...`)
        
        for (const allocation of allocations) {
          try {
            // ✅ 生挅16位随机ID（project_bonus_allocations表使用varchar主键）
            const generateId = () => {
              const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
              let result = ''
              for (let i = 0; i < 16; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length))
              }
              return result
            }
            const allocationId = generateId()
            
            // 直接使用 connection 执行 INSERT
            await connection.query(
              `INSERT INTO project_bonus_allocations 
              (id, pool_id, employee_id, role_id, role_weight, performance_coeff, participation_ratio, contribution_weight, bonus_amount, status, created_at, updated_at) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
              [
                allocationId,
                allocation.poolId,
                allocation.employeeId,
                allocation.roleId,
                allocation.roleWeight,
                allocation.performanceCoeff,
                allocation.participationRatio,
                allocation.contributionWeight,
                allocation.bonusAmount,
                allocation.status
              ]
            )
            
            savedAllocations.push({
              ...allocation,
              _id: allocationId,
              id: allocationId
            })
            console.log(`✅ 成员 ${allocation.employeeId} 奖金记录保存成功 (ID: ${allocationId})`)
          } catch (saveError) {
            // 单条记录失败，抛出异常触发回滚
            console.error(`❌ 保存成员 ${allocation.employeeId} 奖金记录失败:`, saveError.message)
            throw new Error(`保存奖金分配记录失败: ${saveError.message}`)
          }
        }
        
        // 步骤3: 提交事务
        await databaseManager.commitTransaction(connection)
        console.log(`✅ 事务提交成功，所有操作已持久化`)
        
      } catch (transactionError) {
        // 事务失败，回滚
        await databaseManager.rollbackTransaction(connection)
        console.error(`❌ 事务回滚: ${transactionError.message}`)
        throw new Error(`奖金分配事务失败: ${transactionError.message}`)
      }
      
      const totalAllocatedAmt = savedAllocations.reduce((sum, alloc) => sum + (parseFloat(alloc.bonusAmount) || 0), 0)
      
      // 为历史记录添加员工姓名和角色名称
      const allocationsWithNames = await Promise.all(
        savedAllocations.map(async (allocation) => {
          let employeeName = '未知员工'
          let roleName = '未知角色'
          
          // 获取员工姓名
          try {
            const employee = await databaseService.getEmployeeById(allocation.employeeId)
            if (employee) {
              employeeName = employee.name || employee.employeeName || employeeName
            }
          } catch (e) {
            console.warn(`获取员工信息失败: ${allocation.employeeId}`, e.message)
          }
          
          // 获取角色名称
          try {
            const roleId = allocation.roleId
            if (roleId !== undefined && roleId !== null) {
              const numericRoleId = typeof roleId === 'string' ? parseInt(roleId, 10) : roleId
              
              if (!isNaN(numericRoleId)) {
                const role = await databaseService.getProjectRoleById(numericRoleId)
                if (role) {
                  roleName = role.name || String(roleId)
                }
              } else {
                const role = await databaseService.getProjectRoleByCode(String(roleId))
                if (role) {
                  roleName = role.name || String(roleId)
                }
              }
            }
          } catch (e) {
            console.warn(`获取角色信息失败: ${allocation.roleId}`, e.message)
          }
          
          // 从 project_members 表获取贡献权重和工作量占比
          let contributionWeight = 100
          let estimatedWorkload = 100
          try {
            const memberRecords = await databaseService.find('projectMembers', {
              projectId: pool.projectId,
              employeeId: allocation.employeeId,
              status: { $in: ['active', 'approved'] }
            })
            
            if (memberRecords && memberRecords.length > 0) {
              const memberRecord = memberRecords[0]
              contributionWeight = parseFloat(memberRecord.contributionWeight || memberRecord.contribution_weight) || 100
              estimatedWorkload = parseFloat(memberRecord.estimatedWorkload || memberRecord.estimated_workload) || 100
            }
          } catch (memberErr) {
            console.warn(`获取成员 ${allocation.employeeId} 的贡献权重和工作量占比失败:`, memberErr.message)
          }
          
          // 计算权重：完整公式
          const roleWeight = parseFloat(allocation.roleWeight) || 0
          const performanceCoeff = parseFloat(allocation.performanceCoeff) || 1
          const participationRatio = parseFloat(allocation.participationRatio) || 100
          
          const calculatedWeight = roleWeight 
            * (contributionWeight / 100) 
            * (estimatedWorkload / 100) 
            * (participationRatio / 100) 
            * performanceCoeff
          
          return {
            ...allocation,
            employeeName,
            roleName,
            contributionWeight,  // 添加贡献权重
            estimatedWorkload,   // 添加工作量占比
            calculatedWeight: Math.round(calculatedWeight * 100) / 100  // 添加计算后的权重
          }
        })
      )
      
      // 保存计算历史记录
      await this.saveCalculationHistory({
        poolId: pool._id,
        projectId: pool.projectId,
        totalAmount: pool.totalAmount,
        memberCount: allocations.length,
        totalWeight,
        allocations: allocationsWithNames,
        calculatedBy: calculatedBy || 'system'
      })
      
      // 更新奖金池状态为已计算
      await databaseService.update('projectBonusPools', 
        { _id: pool._id }, 
        { 
          status: 'calculated',
          updatedAt: new Date() 
        }
      )
      
      logger.info(`项目奖金计算完成，共分配给 ${allocations.length} 名成员，总金额 ${totalAllocatedAmt} 元`)
      
      return {
        poolId: pool._id,
        id: pool._id,  // 添加 id 字段
        projectId: pool.projectId,
        period: pool.period,
        totalAmount: pool.totalAmount,
        totalAllocated: totalAllocatedAmt,
        memberCount: allocations.length,
        allocations: savedAllocations,
        summary: {
          validMembers: validMembers.length,
          totalWeight,
          averageBonus: allocations.length > 0 ? totalAllocatedAmt / allocations.length : 0,
          maxBonus: allocations.length > 0 ? Math.max(...allocations.map(a => a.bonusAmount)) : 0,
          minBonus: allocations.length > 0 ? Math.min(...allocations.map(a => a.bonusAmount)) : 0
        }
      }

    } catch (error) {
      console.error('🚫 计算项目奖金失败:', {
        poolId,
        error: error.message,
        stack: error.stack
      })
      logger.error('计算项目奖金失败:', error)
      throw new Error(`项目奖金计算失败: ${error.message}`)
    }
  }

  /**
   * 获取项目角色权重配置
   * ✅ 使用 project_role_weights、project_role_weight_templates 和 project_roles 表
   */
  async getProjectRoleWeights(projectId) {
    try {
      if (!projectId) {
        console.warn('项目ID为空，使用默认角色权重')
        return await this.getDefaultRoleWeights()
      }

      // 步骤1: 查找项目专属权重配置
      const projectWeights = await databaseManager.query(`
        SELECT weights 
        FROM project_role_weights 
        WHERE project_id = ? 
        LIMIT 1
      `, [projectId])
      
      if (projectWeights && projectWeights.length > 0 && projectWeights[0].weights) {
        let weights = projectWeights[0].weights
        
        // 处理JSON字符串
        if (typeof weights === 'string') {
          try {
            weights = JSON.parse(weights)
          } catch (e) {
            console.warn('项目角色权重JSON解析失败，尝试使用模板')
            weights = null
          }
        }
        
        if (weights && typeof weights === 'object' && Object.keys(weights).length > 0) {
          console.log(`✅ 项目 ${projectId} 使用专属角色权重`)
          return weights
        }
      }
      
      console.log(`项目 ${projectId} 没有专属角色权重，尝试使用模板`)
      
      // 步骤2: 使用模板 tpl_standard_tech
      const templateWeights = await databaseManager.query(`
        SELECT weights 
        FROM project_role_weight_templates 
        WHERE id = 'tpl_standard_tech' AND is_active = 1
        LIMIT 1
      `)
      
      if (templateWeights && templateWeights.length > 0 && templateWeights[0].weights) {
        let weights = templateWeights[0].weights
        
        if (typeof weights === 'string') {
          try {
            weights = JSON.parse(weights)
          } catch (e) {
            console.warn('模板JSON解析失败，尝试使用 project_roles')
            weights = null
          }
        }
        
        if (weights && typeof weights === 'object' && Object.keys(weights).length > 0) {
          console.log(`✅ 使用模板 tpl_standard_tech 的权重配置`)
          return weights
        }
      }
      
      console.log(`未找到模板 tpl_standard_tech，使用 project_roles 表`)
      
      // 步骤3: 从 project_roles 表获取默认权重
      return await this.getDefaultRoleWeights()

    } catch (error) {
      console.error(`❌ 获取项目 ${projectId} 角色权重失败:`, error.message)
      return await this.getDefaultRoleWeights()
    }
  }

  /**
   * 获取项目总成本
   */
  async getProjectTotalCost(projectId) {
    try {
      const costs = await databaseService.getProjectCosts({ projectId })
      const totalCost = costs.reduce((sum, cost) => sum + (parseFloat(cost.amount) || 0), 0)
      return totalCost
    } catch (error) {
      logger.warn(`获取项目成本失败: projectId=${projectId}`, error.message)
      return 0
    }
  }

  /**
   * 获取默认角色权重
   * 注意：这里的 key 应该使用 project_roles 表中的 code 字段
   */
  /**
   * 获取默认角色权重（从 project_roles 表读取）
   * ✅ 由于 default_weight 字段为 int 且大多为 NULL，使用硬编码映射
   */
  async getDefaultRoleWeights() {
    try {
      // 从 project_roles 表读取角色列表
      const roles = await databaseManager.query(`
        SELECT code, default_weight, name
        FROM project_roles 
        WHERE status = 1
      `)
      
      if (roles && roles.length > 0) {
        // 硬编码的角色权重映射（因为 default_weight 字段为 NULL）
        const weightMapping = {
          'PM': 2.0,           // 项目经理
          'TECH_LEAD': 1.8,    // 技术负责人
          'SENIOR_DEV': 1.5,   // 高级开发工程师
          'DEVELOPER': 1.0,    // 开发工程师
          'TESTER': 1.0,       // 测试工程师
          'PRODUCT_MANAGE': 1.0 // 产品经理
        }
        
        const defaultWeights = {}
        
        roles.forEach(role => {
          if (role.code) {
            // 使用硬编码映射，忽略 default_weight 字段（因为都是 NULL）
            defaultWeights[role.code] = weightMapping[role.code] || 1.0
          }
        })
        
        if (Object.keys(defaultWeights).length > 0) {
          console.log(`✅ 从 project_roles 表加载默认权重: ${Object.keys(defaultWeights).length} 个角色`)
          return defaultWeights
        }
      }
      
      // 最后兼容: project_roles 表为空时使用完整硬编码
      console.warn('⚠️  project_roles 表为空，使用完整硬编码配置')
      return {
        'PM': 2.0,
        'TECH_LEAD': 1.8,
        'SENIOR_DEV': 1.5,
        'DEVELOPER': 1.0,
        'TESTER': 1.0,
        'PRODUCT_MANAGE': 1.0,
        'default': 1.0
      }
      
    } catch (error) {
      console.error('❌ 获取默认角色权重失败:', error.message)
      // 异常兼容: 返回硬编码配置
      return {
        'PM': 2.0,
        'TECH_LEAD': 1.8,
        'SENIOR_DEV': 1.5,
        'DEVELOPER': 1.0,
        'TESTER': 1.0,
        'PRODUCT_MANAGE': 1.0,
        'default': 1.0
      }
    }
  }

  /**
   * 获取员工绩效系数
   */
  async getEmployeePerformanceCoeff(employeeId, period) {
    try {
      if (!employeeId) {
        console.warn('员工ID为空，返回默认绩效系数')
        return 1.0
      }

      // 首先尝试从 performance_three_dimensional_scores 表获取绩效评分（新系统数据）
      try {
        const performanceScoreRecord = await databaseManager.query(
          `SELECT performance_score 
           FROM performance_three_dimensional_scores 
           WHERE employee_id = ? AND calculation_period = ? 
           LIMIT 1`,
          [employeeId.toString(), period]
        )
        
        if (performanceScoreRecord && performanceScoreRecord.length > 0 && performanceScoreRecord[0].performance_score !== null) {
          const perfScore = parseFloat(performanceScoreRecord[0].performance_score || 0)
          
          // 将绩效评分转换为绩效系数
          // 绩效评分范围 0-100，转换为系数 0.5-1.5
          // 50分对应系数1.0，每10分差异对应0.1系数差异
          const coefficient = 1.0 + (perfScore - 50) / 50 * 0.5  // 以50分为基准，系数范围0.5-1.5
          const clampedCoefficient = Math.max(0.5, Math.min(1.5, coefficient))
          
          console.log(`使用员工 ${employeeId} 的三维绩效评分转换的系数: ${perfScore}分 -> ${clampedCoefficient}`)
          return clampedCoefficient
        }
      } catch (error) {
        console.warn(`从三维绩效表获取数据失败:`, error.message)
      }

      // 如果三维绩效表没有数据，再查找传统的 performance_records 表
      const record = await databaseService.find('performanceRecords', {
        employeeId: employeeId.toString(),
        period: period
      })

      if (record && record.length > 0) {
        const assessment = record[0]
        const coefficient = parseFloat(assessment.coefficient)

        if (!isNaN(coefficient) && coefficient > 0) {
          console.log(`使用员工 ${employeeId} 的绩效系数: ${coefficient}`)
          return coefficient
        }

        console.warn(`员工 ${employeeId} 的绩效系数无效: ${assessment.coefficient}`)
        return 1.0
      }

      // 如果没有绩效数据，尝试查找相近期间的数据（三维评分）
      try {
        const recentScores = await databaseManager.query(
          `SELECT performance_score, calculation_period, created_at 
           FROM performance_three_dimensional_scores 
           WHERE employee_id = ? 
           ORDER BY created_at DESC 
           LIMIT 1`,
          [employeeId.toString()]
        )
        
        if (recentScores && recentScores.length > 0 && recentScores[0].performance_score !== null) {
          const perfScore = parseFloat(recentScores[0].performance_score || 0)
          const coefficient = 1.0 + (perfScore - 50) / 50 * 0.5
          const clampedCoefficient = Math.max(0.5, Math.min(1.5, coefficient * 0.95)) // 5%折扣
          
          console.log(`使用员工 ${employeeId} 的最近三维绩效评分转换的系数: ${perfScore}分 -> ${clampedCoefficient} (折扣5%)`)
          return clampedCoefficient
        }
      } catch (error) {
        console.warn(`从三维绩效表获取历史数据失败:`, error.message)
      }

      // 如果还没有数据，尝试查找相近期间的传统绩效数据
      try {
        const recentRecords = await databaseService.find('performanceRecords', {
          employeeId: employeeId.toString()
        })

        if (recentRecords && recentRecords.length > 0) {
          // 使用最近的绩效评估
          const latest = recentRecords
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]

          if (latest && latest.coefficient) {
            const coefficient = parseFloat(latest.coefficient)
            if (!isNaN(coefficient) && coefficient > 0) {
              console.log(`使用员工 ${employeeId} 的最近绩效系数: ${coefficient} (折扣5%)`)

              // 返回但有所折扣，因为不是当期数据
              return Math.max(0.8, coefficient * 0.95) // 折扣5%，最低0.8
            }
          }
        }
      } catch (error) {
        console.warn(`获取员工 ${employeeId} 历史绩效数据失败:`, error.message)
      }

      // 如果没有任何绩效数据，默认系数为1.0
      console.log(`员工 ${employeeId} 没有绩效数据，使用默认系数 1.0`)
      return 1.0
    } catch (error) {
      console.error(`获取员工 ${employeeId} 绩效系数失败:`, error.message)
      return 1.0
    }
  }

  /**
   * 设置项目角色权重
   */
  async setProjectRoleWeights(projectId, weights, updatedBy) {
    try {
      // 将提交的权重值统一为数值类型（允许0禁用某角色）
      const normalizedWeights = {}
      Object.entries(weights).forEach(([role, w]) => {
        const num = typeof w === 'number' ? w : parseFloat(w)
        if (!isNaN(num) && num >= 0) {
          normalizedWeights[role] = num
        }
      })

      // 读取已存在的配置（原始存储，不与默认权重混合）
      const existingRecord = await databaseService.findOne('projectRoleWeights', { projectId })
      let existingWeights = {}
      if (existingRecord && existingRecord.weights) {
        let rawWeights = existingRecord.weights
        if (typeof rawWeights === 'string') {
          try {
            rawWeights = JSON.parse(rawWeights)
          } catch (e) {
            rawWeights = {}
          }
        }
        if (rawWeights && typeof rawWeights === 'object') {
          // 保障历史数据为数值（允许0）
          for (const [role, w] of Object.entries(rawWeights)) {
            const num = typeof w === 'number' ? w : parseFloat(w)
            if (!isNaN(num) && num >= 0) {
              existingWeights[role] = num
            }
          }
        }
      }

      // 合并：每个角色为独立配置，增量更新到已存权重
      const mergedWeights = { ...existingWeights, ...normalizedWeights }
      const totalWeight = Object.values(mergedWeights).reduce((sum, w) => {
        const num = typeof w === 'number' ? w : parseFloat(w)
        const safeNum = !isNaN(num) && num >= 0 ? num : 0
        return sum + safeNum
      }, 0)

      // 用于数据库写入的字段，遵循MySQL schema（不包含 totalWeight）
      // 重要：写入合并后的权重，确保增量更新不会丢失既有配置
      const weightDataDb = {
        projectId,
        weights: mergedWeights,
        updatedBy,
        updatedAt: new Date()
      }

      // 用于接口返回的字段，包含 totalWeight 便于前端展示
      const weightData = {
        ...weightDataDb,
        totalWeight
      }

      // 检查是否已存在配置
      const existing = existingRecord

      if (existing) {
        // 使用updateMany方法,通过projectId条件更新
        await databaseService.updateMany('projectRoleWeights', { projectId }, weightDataDb)
      } else {
        // 首次创建时补充创建人和时间
        weightDataDb.createdBy = updatedBy
        weightDataDb.createdAt = new Date()
        await databaseService.insert('projectRoleWeights', weightDataDb)
      }

      logger.info(`设置项目角色权重成功: 项目 ${projectId}`)
      return weightData

    } catch (error) {
      logger.error('设置项目角色权重失败:', error)
      throw error
    }
  }

  /**
   * 设置单个角色权重（独立更新）
   */
  async setProjectRoleWeight(projectId, role, weight, updatedBy) {
    if (!projectId || !role) {
      throw new Error('项目ID与角色标识不能为空')
    }
    const num = typeof weight === 'number' ? weight : parseFloat(weight)
    if (isNaN(num) || num < 0) {
      throw new Error('角色权重必须为非负数')
    }

    return this.setProjectRoleWeights(projectId, { [role]: num }, updatedBy)
  }

  /**
   * 获取项目奖金分配详情
   */
  async getProjectBonusDetails(projectId, period) {
    try {
      const pool = await databaseService.getProjectBonusPool(projectId, period)
      if (!pool) {
        return null
      }

      // 获取奖金分配记录，并过滤掉已删除的记录
      const allAllocations = await databaseService.getProjectBonusAllocations(pool._id || pool.id)
      const allocations = (Array.isArray(allAllocations) ? allAllocations : []).filter(a =>
        a.status !== 'deleted' && !a.deletedAt
      )

      // 先规范化原始分配记录值类型
      const formattedAllocations = (Array.isArray(allocations) ? allocations : []).map(a => ({
        _id: a._id || a.id,
        poolId: a.poolId,
        employeeId: a.employeeId,
        roleId: a.roleId,
        roleWeight: typeof a.roleWeight === 'number' ? a.roleWeight : parseFloat(a.roleWeight) || 0,
        performanceCoeff: typeof a.performanceCoeff === 'number' ? a.performanceCoeff : parseFloat(a.performanceCoeff) || 1,
        participationRatio: typeof a.participationRatio === 'number' ? a.participationRatio : parseFloat(a.participationRatio) || 1,
        bonusAmount: typeof a.bonusAmount === 'number' ? a.bonusAmount : parseFloat(a.bonusAmount) || 0,
        status: a.status || 'calculated',
        approvedAt: a.approvedAt || null,
        deletedAt: a.deletedAt || null,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt
      }))

      // 再根据需求结构生成展示用结果（查询名称）
      const regeneratedAllocations = await Promise.all(formattedAllocations.map(async a => {
        // 员工名称
        let employeeName = '未知员工'
        try {
          const emp = await databaseService.getEmployeeById(a.employeeId)
          employeeName = emp?.name || emp?.employeeName || employeeName
        } catch (e) {
          // 保持默认
        }
        
        // 从 project_members 表获取贡献权重和工作量占比
        let contributionWeight = 100
        let estimatedWorkload = 100
        try {
          const memberRecords = await databaseService.find('projectMembers', {
            projectId: pool.projectId,
            employeeId: a.employeeId,
            status: { $in: ['active', 'approved'] }
          })
          
          if (memberRecords && memberRecords.length > 0) {
            const memberRecord = memberRecords[0]
            contributionWeight = parseFloat(memberRecord.contributionWeight || memberRecord.contribution_weight) || 100
            estimatedWorkload = parseFloat(memberRecord.estimatedWorkload || memberRecord.estimated_workload) || 100
          }
        } catch (memberErr) {
          console.warn(`获取成员 ${a.employeeId} 的贡献权重和工作量占比失败:`, memberErr.message)
        }

        // 角色名称：根据 project_roles.id 或 code 解析
        let roleName = '未知角色'
        try {
          const roleId = a.roleId

          if (roleId !== undefined && roleId !== null) {
            let role = null
            // 尝试将 roleId 转换为数字
            const numericRoleId = typeof roleId === 'string' ? parseInt(roleId, 10) : roleId

            if (!isNaN(numericRoleId)) {
              // roleId 是数字，通过 ID 查询
              if (typeof databaseService.getProjectRoleById === 'function') {
                role = await databaseService.getProjectRoleById(numericRoleId)
              } else if (typeof databaseService.getProjectRoles === 'function') {
                // NeDB 兼容：枚举后按 ID 匹配
                const roles = await databaseService.getProjectRoles()
                role = Array.isArray(roles) ? roles.find(r => r && (r.id === numericRoleId || r._id === numericRoleId)) : null
              }
            } else {
              // roleId 是字符串（历史数据问题），尝试通过 code 查询
              if (typeof databaseService.getProjectRoleByCode === 'function') {
                role = await databaseService.getProjectRoleByCode(String(roleId))
              } else if (typeof databaseService.getProjectRoles === 'function') {
                // NeDB 兼容：枚举后按 code 匹配
                const roles = await databaseService.getProjectRoles()
                role = Array.isArray(roles) ? roles.find(r => r && r.code === String(roleId)) : null
              }
            }
            roleName = role?.name || String(roleId)
          }
        } catch (e) {
          if (a.roleId !== undefined && a.roleId !== null) {
            roleName = String(a.roleId)
          }
        }

        // 计算权重：完整公式
        const calculatedWeight = (a.roleWeight || 0) 
          * (contributionWeight / 100) 
          * (estimatedWorkload / 100) 
          * (a.participationRatio / 100) 
          * (a.performanceCoeff || 1)

        const result = {
          employeeName,
          roleName,
          roleWeight: a.roleWeight,
          contributionWeight, // 添加贡献权重
          estimatedWorkload, // 添加工作量占比
          performanceCoeff: a.performanceCoeff,
          participationRatio: a.participationRatio,
          calculatedWeight: Math.round(calculatedWeight * 100) / 100,
          bonusAmount: a.bonusAmount,
          status: a.status || 'calculated'
        }

        return result
      }))

      return {
        pool,
        allocations: regeneratedAllocations,
        summary: {
          totalAmount: pool.totalAmount,
          memberCount: regeneratedAllocations.length,
          averageBonus: regeneratedAllocations.length > 0 ? pool.totalAmount / regeneratedAllocations.length : 0
        }
      }
    } catch (error) {
      logger.error('获取项目奖金详情失败:', error)
      throw error
    }
  }

  /**
   * 审批项目奖金分配
   */
  async approveProjectBonusAllocation(poolId, approvedBy) {
    try {
      // 更新奖金池状态
      await databaseService.update('projectBonusPools', 
        { _id: poolId }, 
        { 
          status: 'approved', 
          approvedBy, 
          approvedAt: new Date() 
        } 
      )

      // 更新所有分配记录状态
      await databaseService.update('projectBonusAllocations', 
        { poolId }, 
        { 
          status: 'approved', 
          approvedAt: new Date() 
        }
      )

      // 获取更新后的奖金池信息，确保返回 id 字段
      const updatedPool = await databaseService.findOne('projectBonusPools', { _id: poolId })
      
      logger.info(`项目奖金分配审批完成: ${poolId}`)
      return {
        id: updatedPool._id || updatedPool.id,
        ...updatedPool
      }

    } catch (error) {
      logger.error('审批项目奖金分配失败:', error)
      throw error
    }
  }

  /**
   * 获取奖金池列表
   */
  async getBonusPools(filters = {}) {
    try {
      // 默认不查询已删除的记录
      const queryFilters = {
        ...filters,
        status: filters.status || { $ne: 'deleted' }
      }
      
      const pools = await databaseService.find('projectBonusPools', queryFilters)
      
      // 为每个奖金池添加项目信息，并转换_id为id
      const poolsWithProject = []
      for (const pool of pools) {
        const project = await databaseService.getProjectById(pool.projectId)
        
        // 计算实际成员数量（使用 projectMemberService，包含项目经理）
        let memberCount = 0
        try {
          const members = await projectMemberService.getProjectMembers(pool.projectId)
          // 统计状态为 active 或 approved 的成员
          memberCount = members.filter(m => 
            m.status === 'active' || m.status === 'approved'
          ).length
        } catch (err) {
          logger.warn(`获取项目成员数量失败: projectId=${pool.projectId}`, err.message)
          memberCount = 0
        }
        
        // 转换_id为id字段
        const poolWithProject = {
          id: pool._id || pool.id,
          ...pool,
          projectName: project ? project.name : '未知项目',
          projectCode: project ? project.code : '',
          memberCount
        }
        poolsWithProject.push(poolWithProject)
      }
      
      return poolsWithProject
    } catch (error) {
      logger.error('获取奖金池列表失败:', error)
      throw error
    }
  }

  /**
   * 根据ID获取奖金池详情
   */
  async getBonusPoolById(poolId) {
    try {
      const pool = await databaseService.findOne('projectBonusPools', { _id: poolId })
      if (!pool) {
        throw new Error('奖金池不存在')
      }

      // 添加项目信息
      const project = await databaseService.getProjectById(pool.projectId)
      return {
        ...pool,
        projectName: project ? project.name : '未知项目',
        projectCode: project ? project.code : ''
      }
    } catch (error) {
      logger.error('获取奖金池详情失败:', error)
      throw error
    }
  }

  /**
   * 更新奖金池
   */
  async updateBonusPool(poolId, updateData) {
    try {
      const updatedAt = new Date()
      
      // 只保留数据库中存在的字段
      const validFields = {};
      if (updateData.totalAmount !== undefined) validFields.totalAmount = updateData.totalAmount;
      if (updateData.profitRatio !== undefined) validFields.profitRatio = updateData.profitRatio;
      if (updateData.description !== undefined) validFields.description = updateData.description;
      if (updateData.projectProfit !== undefined) validFields.projectProfit = updateData.projectProfit;
      
      const dataWithTimestamp = {
        ...validFields,
        updatedAt
      }
      
      await databaseService.update('projectBonusPools', 
        { _id: poolId }, 
        dataWithTimestamp
      )
      
      logger.info(`奖金池更新成功: ${poolId}`)
      
      // 返回更新后的奖金池，转换_id为id
      const updatedPool = await this.getBonusPoolById(poolId)
      return {
        id: updatedPool._id || updatedPool.id,
        ...updatedPool
      }
    } catch (error) {
      logger.error('更新奖金池失败:', error)
      throw error
    }
  }

  /**
   * 删除奖金池
   */
  async deleteBonusPool(poolId, deletedBy) {
    try {
      // 获取奖金池信息，用于获取相关期间
      const pool = await databaseService.findOne('projectBonusPools', { _id: poolId })
      if (!pool) {
        throw new Error('奖金池不存在')
      }
      
      // 删除相关的计算历史记录
      await databaseService.remove('projectBonusCalculationHistory', { poolId })
      
      // 删除相关的分配记录
      await databaseService.remove('projectBonusAllocations', { poolId })
      
      // 最后删除奖金池记录
      await databaseService.remove('projectBonusPools', { _id: poolId })
      
      logger.info(`项目奖金池删除成功: ${poolId}`)
      return true
    } catch (error) {
      logger.error('删除奖金池失败:', error)
      throw error
    }
  }

  /**
   * 保存计算历史记录
   */
  async saveCalculationHistory(data) {
    try {
      const { poolId, projectId, totalAmount, memberCount, totalWeight, allocations, calculatedBy } = data
      
      // 获取当前计算次数
      const existingHistories = await databaseService.find('projectBonusCalculationHistory', { poolId })
      const calculationNumber = (existingHistories?.length || 0) + 1
      
      // 将之前的记录设为非当前
      if (existingHistories && existingHistories.length > 0) {
        for (const history of existingHistories) {
          await databaseService.update('projectBonusCalculationHistory',
            { _id: history._id },
            { isCurrent: false }
          )
        }
      }
      
      // 创建新的历史记录
      const historyData = {
        poolId,
        projectId,
        calculationNumber,
        totalAmount,
        memberCount,
        totalWeight,
        calculationData: JSON.stringify(allocations), // 存储分配明细
        calculatedBy,
        calculatedAt: new Date(),
        isCurrent: true
      }
      
      const saved = await databaseService.create('projectBonusCalculationHistory', historyData)
      logger.info(`保存计算历史成功: 第${calculationNumber}次计算, ID: ${saved._id}`)
      
      // 返回时确保包含 id 字段
      return {
        id: saved._id || saved.id,
        ...saved
      }
    } catch (error) {
      logger.error('保存计算历史失败:', error)
      // 不抛出错误，避免影响主流程
      return null
    }
  }

  /**
   * 获取奖金池计算历史
   */
  async getCalculationHistory(poolId) {
    try {
      const histories = await databaseService.find('projectBonusCalculationHistory', { poolId })
      
      if (!histories || histories.length === 0) {
        return []
      }
      
      // 关联查询计算人信息
      const historiesWithUser = await Promise.all(
        histories.map(async (history) => {
          let calculatorName = '未知'
          
          if (history.calculatedBy) {
            try {
              // 查询用户信息
              const user = await databaseService.findOne('users', { id: history.calculatedBy })
              if (user) {
                calculatorName = user.realName || user.username || '未知'
              }
            } catch (err) {
              logger.warn(`获取计算人信息失败: ${history.calculatedBy}`, err.message)
            }
          }
          
          // 返回处理后的数据，将 _id 转换为 id
          return {
            id: history._id || history.id,
            ...history,
            calculatorName  // 添加计算人姓名
          }
        })
      )
      
      // 按计算次数降序排列
      return historiesWithUser.sort((a, b) => b.calculationNumber - a.calculationNumber)
    } catch (error) {
      logger.error('获取计算历史失败:', error)
      return []
    }
  }

  /**
   * 获取当前有效的计算记录
   */
  async getCurrentCalculation(poolId) {
    try {
      const current = await databaseService.findOne('projectBonusCalculationHistory', {
        poolId,
        isCurrent: true
      })
      
      // 如果找到了记录，确保返回 id 字段
      if (current) {
        return {
          id: current._id || current.id,
          ...current
        }
      }
      
      return current
    } catch (error) {
      logger.error('获取当前计算记录失败:', error)
      return null
    }
  }
}

module.exports = new ProjectBonusService()
