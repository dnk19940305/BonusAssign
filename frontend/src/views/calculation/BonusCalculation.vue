<template>
  <div class="bonus-calculation">
    <div class="page-header">
      <div class="flex-center">
        <h2>奖金池计算</h2>
        <el-popover placement="right" :width="400" trigger="hover">
          <template #reference>
            <el-icon :size="24" style="margin-left: 8px">
              <QuestionFilled />
            </el-icon>
          </template>
          <!-- 功能说明 -->
          <div class="function-intro">
            <el-alert title="三维奖金计算" type="info" :closable="false" class="info-alert">
              <template #default>
                <div class="intro-content">
                  <p>
                    公司奖金池采用<strong>三维评估模型</strong>进行科学分配，综合评价员工的<strong>利润贡献</strong>、<strong>岗位价值</strong>和<strong>绩效表现</strong>三个维度。
                  </p>

                  <div class="formula-section">
                    <h4>核心计算公式</h4>
                    <p><strong>个人奖金</strong> = 奖金池总额 × (个人最终系数得分 / 全员总得分)</p>
                    <p><strong>三维计算得分</strong> = 利润贡献得分 × 权重 + 岗位价值得分 × 权重 + 绩效表现得分 × 权重</p>
                    <p><strong>最终系数得分</strong> = 三维计算得分 × 岗位基准值 × 城市系数 × 业务线系数 × 绩效系数 × 时间系数</p>
                  </div>

                  <div class="coefficients-section">
                    <h4>三维评估体系</h4>
                    <ul>
                      <li><strong>利润贡献维度（默认50%）</strong>：评估员工对公司利润的直接和间接贡献
                        <ul style="margin-top: 4px; font-size: 13px; color: #606266;">
                          <li>直接贡献（40%）：业务收入、订单获取</li>
                          <li>工作量（30%）：完成工时、任务数量</li>
                          <li>质量贡献（20%）：错误率、客户满意度</li>
                          <li>岗位价值（10%）：不可替代性、技能稀缺性</li>
                        </ul>
                      </li>
                      <li><strong>岗位价值维度（默认30%）</strong>：衡量岗位本身的重要性和复杂度
                        <ul style="margin-top: 4px; font-size: 13px; color: #606266;">
                          <li>技能复杂度（25%）：技术难度、专业要求</li>
                          <li>责任权重（30%）：决策权限、风险承担</li>
                          <li>决策影响（20%）：对组织的影响范围</li>
                          <li>经验要求（15%）：工作经验门槛</li>
                          <li>市场价值（10%）：人才稀缺程度</li>
                        </ul>
                      </li>
                      <li><strong>绩效表现维度（默认20%）</strong>：评价员工的实际工作表现
                        <ul style="margin-top: 4px; font-size: 13px; color: #606266;">
                          <li>工作产出（35%）：完成量、达成率</li>
                          <li>工作质量（30%）：成果质量、客户反馈</li>
                          <li>工作效率（15%）：时间管理、资源利用</li>
                          <li>团队协作（10%）：跨部门合作、知识分享</li>
                          <li>创新能力（5%）：优化建议、技术创新</li>
                          <li>领导能力（3%）：项目领导、团队指导</li>
                          <li>学习成长（2%）：技能提升、培训参与</li>
                        </ul>
                      </li>
                    </ul>
                  </div>

                  <div class="navigation-section">
                    <h4>配置管理</h4>
                    <ul>
                      <li><strong>权重配置</strong>：系统管理 → 三维权重配置（可自定义各维度权重）</li>
                      <li><strong>标准化方法</strong>：支持Z-Score标准化、百分位排名、Min-Max归一化</li>
                      <li><strong>计算方法</strong>：加权求和（默认）、加权乘积、混合方法</li>
                      <li><strong>调整系数</strong>：卓越奖励、绩效倍数、岗位级别倍数</li>
                    </ul>
                  </div>
                </div>
              </template>
            </el-alert>
          </div>
        </el-popover>
      </div>

      <div class="header-actions">
        <el-button type="primary" @click="showCreatePoolDialog" :disabled="calculating">
          <el-icon>
            <Plus />
          </el-icon>
          创建奖金池
        </el-button>
        <el-button @click="refreshData" :loading="loading">
          <el-icon>
            <Refresh />
          </el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-title">奖金池总数</div>
          <div class="stat-number">{{ statistics.totalPools }}</div>
          <div class="stat-subtitle">已创建</div>
        </div>
      </el-card>
      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-title">总金额</div>
          <div class="stat-number">¥{{ formatNumber(statistics.totalAmount) }}</div>
          <div class="stat-subtitle">累计奖金池</div>
        </div>
      </el-card>
      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-title">已分配</div>
          <div class="stat-number">{{ statistics.allocatedPools }}</div>
          <div class="stat-subtitle">完成计算</div>
        </div>
      </el-card>
      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-title">受益人数</div>
          <div class="stat-number">{{ statistics.totalEmployees }}</div>
          <div class="stat-subtitle">参与员工</div>
        </div>
      </el-card>
    </div>

    <!-- 奖金池列表 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>奖金池列表</span>
          <div class="header-controls">
            <el-select v-model="queryForm.status" placeholder="筛选状态" clearable style="width: 120px"
              @change="handleSearch">
              <el-option label="草稿" value="draft" />
              <el-option label="已计算" value="calculated" />
              <el-option label="已分配" value="allocated" />
              <el-option label="已发放" value="paid" />
            </el-select>
          </div>
        </div>
      </template>

      <el-table :data="bonusPools" v-loading="loading" stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="period" label="计算周期" width="120" />
        <el-table-column label="公司利润" width="140">
          <template #default="{ row }">
            ¥{{ formatNumber(row.totalProfit) }}
          </template>
        </el-table-column>
        <el-table-column label="奖金池比例" width="100">
          <template #default="{ row }">
            {{ (row.poolRatio * 100).toFixed(1) }}%
          </template>
        </el-table-column>
        <el-table-column label="奖金池金额" width="140">
          <template #default="{ row }">
            ¥{{ formatNumber(row.poolAmount) }}
          </template>
        </el-table-column>
        <el-table-column label="可分配金额" width="140">
          <template #default="{ row }">
            ¥{{ formatNumber(row.distributableAmount) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="380" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="showCalculateDialog(row)"
              :disabled="calculating || row.status === 'allocated' || row.status === 'paid'">
              {{ row.status === 'draft' ? '计算' : '重新计算' }}
            </el-button>
            <el-button size="small" @click="showResultDialog(row)" :disabled="row.status === 'draft'">
              查看结果
            </el-button>
            <el-button 
              v-if="row.status === 'calculated' || row.status === 'allocated'" 
              type="success" 
              size="small" 
              @click="handlePayment(row)"
            >
              发放奖金
            </el-button>
            <el-dropdown @command="(cmd: string) => handleMoreAction(cmd, row)">
              <el-button size="small">
                更多<el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="edit" :disabled="row.status === 'allocated' || row.status === 'paid'">
                    编辑
                  </el-dropdown-item>
                  <el-dropdown-item command="copy">复制</el-dropdown-item>
                  <el-dropdown-item command="export" :disabled="row.status === 'draft'">
                    导出结果
                  </el-dropdown-item>
                  <el-dropdown-item command="delete" divided :disabled="row.status === 'paid'">删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination v-model:current-page="pagination.page" v-model:page-size="pagination.pageSize"
          :total="pagination.total" :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>
    </el-card>

    <!-- 创建奖金池对话框 -->
    <el-dialog v-model="createPoolVisible" title="创建奖金池" width="600px" :close-on-click-modal="false">
      <el-form ref="poolFormRef" :model="poolForm" :rules="poolFormRules" label-width="120px">

        <!-- 公司财务信息展示 -->
        <el-alert v-if="companyFinancialData.totalBudget > 0 || companyFinancialData.totalProfit !== 0" type="info"
          :closable="false" style="margin-bottom: 20px">
          <template #title>
            <div style="font-weight: bold; margin-bottom: 10px">公司财务概览</div>
          </template>
          <div style="font-size: 13px">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px">
              <span><strong>项目总预算：</strong>{{ formatNumber(companyFinancialData.totalBudget) }} 元</span>
              <span><strong>总成本：</strong><span style="color: #f56c6c">{{ formatNumber(companyFinancialData.totalCost) }}
                  元</span></span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px">
              <span><strong>预期利润：</strong>
                <span
                  :style="{ color: companyFinancialData.totalProfit >= 0 ? '#67c23a' : '#f56c6c', fontWeight: 'bold' }">
                  {{ formatNumber(companyFinancialData.totalProfit) }} 元
                </span>
              </span>
              <span><strong>预估奖金：</strong>{{ formatNumber(companyFinancialData.estimatedBonus) }} 元</span>
            </div>
            <div
              style="display: flex; justify-content: space-between; margin-bottom: 8px; padding-top: 8px; border-top: 1px dashed #dcdfe6">
              <span><strong>已分配项目奖金：</strong>
                <span style="color: #e6a23c">
                  {{ formatNumber((companyFinancialData as any).allocatedProjectBonus || 0) }} 元
                </span>
              </span>
              <span><strong>已分配公司奖金：</strong>
                <span style="color: #e6a23c">
                  {{ formatNumber((companyFinancialData as any).allocatedCompanyBonus || 0) }} 元
                </span>
              </span>
            </div>
            <div style="background: #f5f7fa; padding: 8px; border-radius: 4px; margin-top: 8px">
              <strong>可用利润（扣除历史奖金）：</strong>
              <span :style="{
                color: ((companyFinancialData as any).finalAvailableProfit || 0) >= 0 ? '#67c23a' : '#f56c6c',
                fontWeight: 'bold',
                fontSize: '16px'
              }">
                {{ formatNumber((companyFinancialData as any).finalAvailableProfit || 0) }} 元
              </span>
            </div>
            <el-divider style="margin: 8px 0" />
            <div style="color: #909399; font-size: 12px">
              <span v-if="(companyFinancialData as any).finalAvailableProfit > 0">
                ✓ 建议奖金池金额不超过可用利润 ¥{{ formatNumber((companyFinancialData as any).finalAvailableProfit || 0) }}
              </span>
              <span v-else style="color: #f56c6c">
                ⚠ 公司可用利润不足 ¥{{ formatNumber(Math.abs((companyFinancialData as any).finalAvailableProfit || 0))
                }}，请谨慎设置奖金池
              </span>
            </div>
          </div>
        </el-alert>

        <el-form-item label="计算周期" prop="period">
          <el-select v-model="poolForm.period" placeholder="请选择计算周期" style="width: 100%">
            <el-option
              v-for="option in periodOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="公司总利润" prop="totalProfit">
          <el-input-number v-model="poolForm.totalProfit" :min="0" :precision="2" style="width: 100%"
            controls-position="right" />
        </el-form-item>
        <el-form-item label="奖金池比例" prop="poolRatio">
          <el-slider v-model="poolForm.poolRatio" :min="0.05" :max="0.3" :step="0.01"
            :format-tooltip="(val: number) => `${(val * 100).toFixed(1)}%`" style="width: 80%; margin-right: 20px" />
          <span>{{ (poolForm.poolRatio * 100).toFixed(1) }}%</span>
        </el-form-item>
        <el-form-item label="预留调节金" prop="reserveRatio">
          <el-slider v-model="poolForm.reserveRatio" :min="0" :max="0.1" :step="0.005"
            :format-tooltip="(val: number) => `${(val * 100).toFixed(2)}%`" style="width: 80%; margin-right: 20px" />
          <span>{{ (poolForm.reserveRatio * 100).toFixed(2) }}%</span>
        </el-form-item>
        <el-form-item label="CEO特别奖励" prop="specialRatio">
          <el-slider v-model="poolForm.specialRatio" :min="0" :max="0.1" :step="0.005"
            :format-tooltip="(val: number) => `${(val * 100).toFixed(2)}%`" style="width: 80%; margin-right: 20px" />
          <span>{{ (poolForm.specialRatio * 100).toFixed(2) }}%</span>
        </el-form-item>

        <!-- 计算预览 -->
        <el-divider content-position="left">计算预览</el-divider>
        <div class="calculation-preview">
          <div class="preview-item">
            <span>奖金池总额：</span>
            <strong>¥{{ formatNumber(poolForm.totalProfit * poolForm.poolRatio) }}</strong>
          </div>
          <div class="preview-item">
            <span>预留调节金：</span>
            <span>¥{{ formatNumber(poolForm.totalProfit * poolForm.poolRatio * poolForm.reserveRatio) }}</span>
          </div>
          <div class="preview-item">
            <span>CEO特别奖励：</span>
            <span>¥{{ formatNumber(poolForm.totalProfit * poolForm.poolRatio * poolForm.specialRatio) }}</span>
          </div>
          <div class="preview-item highlight">
            <span>可分配金额：</span>
            <strong>¥{{ formatNumber(poolForm.totalProfit * poolForm.poolRatio * (1 - poolForm.reserveRatio -
              poolForm.specialRatio)) }}</strong>
          </div>
        </div>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="createPoolVisible = false">取消</el-button>
          <el-button type="primary" @click="handleCreatePool" :loading="submitting">
            创建
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 编辑奖金池对话框 -->
    <el-dialog v-model="editPoolVisible" title="编辑奖金池" width="600px" :close-on-click-modal="false">
      <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="120px">
        <el-form-item label="计算周期" prop="period">
          <el-select v-model="editForm.period" placeholder="请选择计算周期" style="width: 100%">
            <el-option
              v-for="option in periodOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="公司总利润" prop="totalProfit">
          <el-input-number v-model="editForm.totalProfit" :min="0" :precision="2" style="width: 100%"
            controls-position="right" />
        </el-form-item>
        <el-form-item label="奖金池比例" prop="poolRatio">
          <el-slider v-model="editForm.poolRatio" :min="0.05" :max="0.3" :step="0.01"
            :format-tooltip="(val: number) => `${(val * 100).toFixed(1)}%`" style="width: 80%; margin-right: 20px" />
          <span>{{ (editForm.poolRatio * 100).toFixed(1) }}%</span>
        </el-form-item>
        <el-form-item label="预留调节金" prop="reserveRatio">
          <el-slider v-model="editForm.reserveRatio" :min="0" :max="0.1" :step="0.005"
            :format-tooltip="(val: number) => `${(val * 100).toFixed(2)}%`" style="width: 80%; margin-right: 20px" />
          <span>{{ (editForm.reserveRatio * 100).toFixed(2) }}%</span>
        </el-form-item>
        <el-form-item label="CEO特别奖励" prop="specialRatio">
          <el-slider v-model="editForm.specialRatio" :min="0" :max="0.1" :step="0.005"
            :format-tooltip="(val: number) => `${(val * 100).toFixed(2)}%`" style="width: 80%; margin-right: 20px" />
          <span>{{ (editForm.specialRatio * 100).toFixed(2) }}%</span>
        </el-form-item>

        <!-- 计算预览 -->
        <el-divider content-position="left">计算预览</el-divider>
        <div class="calculation-preview">
          <div class="preview-item">
            <span>奖金池总额：</span>
            <strong>¥{{ formatNumber(editForm.totalProfit * editForm.poolRatio) }}</strong>
          </div>
          <div class="preview-item">
            <span>预留调节金：</span>
            <span>¥{{ formatNumber(editForm.totalProfit * editForm.poolRatio * editForm.reserveRatio) }}</span>
          </div>
          <div class="preview-item">
            <span>CEO特别奖励：</span>
            <span>¥{{ formatNumber(editForm.totalProfit * editForm.poolRatio * editForm.specialRatio) }}</span>
          </div>
          <div class="preview-item highlight">
            <span>可分配金额：</span>
            <strong>¥{{ formatNumber(editForm.totalProfit * editForm.poolRatio * (1 - editForm.reserveRatio -
              editForm.specialRatio)) }}</strong>
          </div>
        </div>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editPoolVisible = false">取消</el-button>
          <el-button type="primary" @click="handleEditPool" :loading="submitting">
            更新
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 计算参数对话框 -->
    <el-dialog v-model="calculateVisible" title="奖金计算参数" width="800px" :close-on-click-modal="false">
      <div v-if="currentPool">
        <div class="pool-info">
          <h4>奖金池信息</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="计算周期">{{ currentPool.period }}</el-descriptions-item>
            <el-descriptions-item label="可分配金额">¥{{ formatNumber(currentPool.distributableAmount)
            }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <el-divider />

        <el-form ref="calculateFormRef" :model="calculateForm" label-width="120px">
          <h4>计算方式</h4>
          <el-form-item label="计算模式">
            <el-radio-group v-model="calculateForm.mode">
              <el-radio label="full">全员计算</el-radio>
              <el-radio label="department">按部门计算</el-radio>
              <el-radio label="line">按业务线计算</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item v-if="calculateForm.mode === 'department'" label="选择部门">
            <el-select v-model="calculateForm.departments" multiple placeholder="请选择部门" style="width: 100%">
              <el-option v-for="dept in departments" :key="dept.id" :label="dept.name" :value="dept.id" />
            </el-select>
          </el-form-item>

          <el-form-item v-if="calculateForm.mode === 'line'" label="选择业务线">
            <el-select v-model="calculateForm.businessLines" multiple placeholder="请选择业务线" style="width: 100%">
              <el-option v-for="line in businessLines" :key="line.id" :label="line.name" :value="line.id" />
            </el-select>
          </el-form-item>

          <h4>高级选项</h4>
          <el-form-item label="最低分数阈值">
            <el-input-number v-model="calculateForm.minScoreThreshold" :min="0" :max="1" :step="0.1" :precision="2" />
          </el-form-item>

          <el-form-item label="是否模拟">
            <el-switch v-model="calculateForm.simulation" />
            <span class="form-item-help">模拟模式下不会保存结果</span>
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="calculateVisible = false">取消</el-button>
          <el-button type="primary" @click="handleCalculate" :loading="calculating">
            {{ calculateForm.simulation ? '开始模拟' : '开始计算' }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 计算进度对话框 -->
    <el-dialog v-model="progressVisible" title="计算进度" width="500px" :close-on-click-modal="false" :show-close="false">
      <div class="progress-content">
        <el-progress :percentage="progress.percentage" :status="progress.status" stroke-width="8" />
        <p class="progress-text">{{ progress.text }}</p>
        <div class="progress-details" v-if="progress.details">
          <p v-for="detail in progress.details" :key="detail">{{ detail }}</p>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="progressVisible = false" type="primary">{{ progress.status === 'success' ? '关闭' : '后台运行' }}</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 计算结果对话框 -->
    <el-dialog v-model="resultVisible" title="计算结果" width="1200px" :close-on-click-modal="false">
      <div v-if="calculationResult">
        <!-- 结果汇总 -->
        <div class="result-summary">
          <el-row :gutter="20">
            <el-col :span="6">
              <div class="summary-item">
                <div class="summary-number">{{ calculationResult.summary.totalEmployees }}</div>
                <div class="summary-label">参与员工</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="summary-item">
                <div class="summary-number">¥{{ formatNumber(calculationResult.summary.totalBonus) }}</div>
                <div class="summary-label">总奖金</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="summary-item">
                <div class="summary-number">¥{{ formatNumber(calculationResult.summary.averageBonus) }}</div>
                <div class="summary-label">平均奖金</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="summary-item">
                <div class="summary-number">{{ ((calculationResult.summary.totalBonus /
                  currentPool?.distributableAmount) *
                  100).toFixed(1) }}%</div>
                <div class="summary-label">分配比例</div>
              </div>
            </el-col>
          </el-row>
        </div>

        <!-- 视图切换按钮 -->
        <div class="view-switcher">
          <el-radio-group v-model="resultViewMode" size="small">
            <el-radio-button value="line">业务线分布</el-radio-button>
            <el-radio-button value="department">部门分布</el-radio-button>
            <el-radio-button value="employee">员工明细</el-radio-button>
          </el-radio-group>
        </div>

        <!-- 业务线分布视图 -->
        <div v-if="resultViewMode === 'line'">
          <el-table :data="calculationResult.lineStats" stripe>
            <el-table-column prop="lineName" label="业务线" />
            <el-table-column prop="employees" label="员工数量" />
            <el-table-column label="总奖金">
              <template #default="{ row }">
                ¥{{ formatNumber(row.totalBonus) }}
              </template>
            </el-table-column>
            <el-table-column label="平均奖金">
              <template #default="{ row }">
                ¥{{ formatNumber(row.averageBonus) }}
              </template>
            </el-table-column>
            <el-table-column label="占比">
              <template #default="{ row }">
                {{ ((row.totalBonus / calculationResult.summary.totalBonus) * 100).toFixed(1) }}%
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 部门分布视图 -->
        <div v-if="resultViewMode === 'department'">
          <el-table :data="calculationResult.lineStats" stripe>
            <el-table-column prop="lineName" label="部门" />
            <el-table-column prop="employees" label="员工数量" />
            <el-table-column label="总奖金">
              <template #default="{ row }">
                ¥{{ formatNumber(row.totalBonus) }}
              </template>
            </el-table-column>
            <el-table-column label="平均奖金">
              <template #default="{ row }">
                ¥{{ formatNumber(row.averageBonus) }}
              </template>
            </el-table-column>
            <el-table-column label="占比">
              <template #default="{ row }">
                {{ ((row.totalBonus / calculationResult.summary.totalBonus) * 100).toFixed(1) }}%
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 员工明细视图 -->
        <div v-if="resultViewMode === 'employee'">
          <el-divider content-position="left">员工奖金明细</el-divider>
          <el-table :data="employeeDetailsList" stripe v-loading="loadingEmployeeDetails" max-height="500">
            <el-table-column prop="employeeNo" label="工号" width="100" />
            <el-table-column prop="employeeName" label="姓名" width="100" />
            <el-table-column prop="departmentName" label="部门" width="100" />
            <el-table-column prop="positionName" label="岗位" width="120" />
            <el-table-column label="利润贡献" width="100" align="right">
              <template #default="{ row }">
                {{ row.profitContributionScore?.toFixed(2) || '0.00' }}
              </template>
            </el-table-column>
            <el-table-column label="岗位价值" width="100" align="right">
              <template #default="{ row }">
                {{ row.positionValueScore?.toFixed(2) || '0.00' }}
              </template>
            </el-table-column>
            <el-table-column label="绩效评分" width="100" align="right">
              <template #default="{ row }">
                {{ row.performanceScore?.toFixed(2) || '0.00' }}
              </template>
            </el-table-column>
            <el-table-column label="三维计算得分" width="110" align="right">
              <template #default="{ row }">
                {{row.totalScore?.toFixed(2) || '0.00' }}
              </template>
            </el-table-column>
            <el-table-column label="最终系数得分" width="120" align="right">
              <template #default="{ row }">
                <span style="color: #409eff; font-weight: bold;">
                  {{ row.finalScore?.toFixed(2) || '0.00' }}
                </span>
              </template>
            </el-table-column>
            
            <!-- ⭐ 新增：系数列（可折叠） -->
            <el-table-column label="计算系数" align="center" width="500">
              <el-table-column label="岗位基准" width="90" align="right">
                <template #default="{ row }">
                  <el-tag size="small" effect="plain" type="info">
                    {{ row.positionBenchmark?.toFixed(2) || '1.00' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="城市系数" width="85" align="right">
                <template #default="{ row }">
                  <el-tag size="small" effect="plain" :type="row.cityCoefficient > 1 ? 'success' : 'info'">
                    {{ row.cityCoefficient?.toFixed(2) || '1.00' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="业务线" width="85" align="right">
                <template #default="{ row }">
                  <el-tag size="small" effect="plain" :type="row.businessLineCoefficient > 1 ? 'success' : 'info'">
                    {{ row.businessLineCoefficient?.toFixed(2) || '1.00' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="绩效系数" width="85" align="right">
                <template #default="{ row }">
                  <el-tag size="small" effect="plain" :type="row.performanceCoefficient >= 1 ? 'success' : 'warning'">
                    {{ row.performanceCoefficient?.toFixed(2) || '1.00' }}
                  </el-tag>
                </template>
              </el-table-column>
              <!-- ✅ 时间系数已移除，不再展示 -->
            </el-table-column>
            
            <el-table-column label="最终奖金" width="120" align="right">
              <template #default="{ row }">
                <span style="color: #f56c6c; font-weight: bold;">
                  ¥{{ formatNumber(row.finalBonusAmount || 0) }}
                </span>
              </template>
            </el-table-column>
            
            <!-- ⭐ 新增：操作列（查看计算过程） -->
            <el-table-column label="操作" width="100" align="center" fixed="right">
              <template #default="{ row }">
                <el-button 
                  size="small" 
                  type="primary" 
                  link
                  @click="showCalculationDetail(row)"
                >
                  计算过程
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="resultVisible = false">关闭</el-button>
          <el-button type="primary" @click="exportResult" :loading="exporting">
            导出结果
          </el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- ⭐ 新增：计算过程详情对话框 -->
    <el-dialog
      v-model="calculationDetailVisible"
      title="奖金计算过程详情"
      width="900px"
      :close-on-click-modal="false"
    >
      <div class="calculation-detail-container" v-if="currentCalculationDetail.employeeName">
        <!-- 员工基本信息 -->
        <el-card class="info-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>👤 员工信息</span>
            </div>
          </template>
          <el-descriptions :column="3" border>
            <el-descriptions-item label="姓名">{{ currentCalculationDetail.employeeName }}</el-descriptions-item>
            <el-descriptions-item label="工号">{{ currentCalculationDetail.employeeNo }}</el-descriptions-item>
            <el-descriptions-item label="部门">{{ currentCalculationDetail.departmentName }}</el-descriptions-item>
            <el-descriptions-item label="岗位">{{ currentCalculationDetail.positionName }}</el-descriptions-item>
            <el-descriptions-item label="业务线">{{ currentCalculationDetail.businessLineName }}</el-descriptions-item>
            <el-descriptions-item label="最终奖金">
              <span style="color: #f56c6c; font-weight: bold; font-size: 16px;">
                ¥{{ formatNumber(currentCalculationDetail.finalBonusAmount || 0) }}
              </span>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 计算公式展示 -->
        <el-card class="formula-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>🧮 计算公式</span>
            </div>
          </template>
          <div class="formula-content">
            <div class="formula-line main-formula">
              <strong>最终系数得分</strong> = 
              <span class="formula-part">三维计算得分</span> × 
              <span class="formula-part">岗位基准值</span> × 
              <span class="formula-part">城市系数</span> × 
              <span class="formula-part">业务线系数</span> × 
              <span class="formula-part">绩效系数</span> × 
              <span class="formula-part">时间系数</span>
            </div>
            <div class="formula-line calculation-result">
              <strong>{{ currentCalculationDetail.finalScore?.toFixed(2) }}</strong> = 
              <span class="value">{{ currentCalculationDetail.totalScore?.toFixed(2) }}</span> × 
              <span class="value">{{ currentCalculationDetail.positionBenchmark?.toFixed(2) }}</span> × 
              <span class="value">{{ currentCalculationDetail.cityCoefficient?.toFixed(2) }}</span> × 
              <span class="value">{{ currentCalculationDetail.businessLineCoefficient?.toFixed(2) }}</span> × 
              <span class="value">{{ currentCalculationDetail.performanceCoefficient?.toFixed(2) }}</span>
              <!-- ✅ 移除时间系数 -->
            </div>
          </div>
        </el-card>

        <!-- 系数详细说明 -->
        <el-card class="coefficients-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>📊 系数详细说明</span>
            </div>
          </template>
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="coefficient-item">
                <div class="coef-label">🎯 岗位基准值</div>
                <div class="coef-value">{{ currentCalculationDetail.positionBenchmark?.toFixed(2) }}</div>
                <div class="coef-desc">范围：0.1 - 3.0</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="coefficient-item">
                <div class="coef-label">🌆 城市系数</div>
                <div class="coef-value" :class="currentCalculationDetail.cityCoefficient > 1 ? 'positive' : 'normal'">
                  {{ currentCalculationDetail.cityCoefficient?.toFixed(2) }}
                </div>
                <div class="coef-desc">范围：0.8 - 1.5</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="coefficient-item">
                <div class="coef-label">🏢 业务线系数</div>
                <div class="coef-value" :class="currentCalculationDetail.businessLineCoefficient > 1 ? 'positive' : 'normal'">
                  {{ currentCalculationDetail.businessLineCoefficient?.toFixed(2) }}
                </div>
                <div class="coef-desc">范围：0.8 - 1.5</div>
              </div>
            </el-col>
          </el-row>
          <el-row :gutter="20" style="margin-top: 20px;">
            <el-col :span="8">
              <div class="coefficient-item">
                <div class="coef-label">🏆 绩效系数</div>
                <div class="coef-value" :class="currentCalculationDetail.performanceCoefficient >= 1 ? 'positive' : 'negative'">
                  {{ currentCalculationDetail.performanceCoefficient?.toFixed(2) }}
                </div>
                <div class="coef-desc">范围：0.5 - 2.0</div>
              </div>
            </el-col>
            <!-- ✅ 时间系数已移除 -->
            <el-col :span="8">
              <div class="coefficient-item highlight">
                <div class="coef-label">✨ 最终系数得分</div>
                <div class="coef-value final">{{ currentCalculationDetail.finalScore?.toFixed(2) }}</div>
                <div class="coef-desc">应用所有系数后的得分</div>
              </div>
            </el-col>
          </el-row>
        </el-card>

        <!-- 三维得分明细 -->
        <el-card class="scores-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>📊 三维评分明细</span>
            </div>
          </template>
          <el-descriptions :column="3" border>
            <el-descriptions-item label="利润贡献得分">
              <span class="score-value">{{ currentCalculationDetail.profitContributionScore?.toFixed(2) }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="岗位价值得分">
              <span class="score-value">{{ currentCalculationDetail.positionValueScore?.toFixed(2) }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="绩效表现得分">
              <span class="score-value">{{ currentCalculationDetail.performanceScore?.toFixed(2) }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="三维计算得分" :span="3">
              <span class="score-value highlight">{{ currentCalculationDetail.totalScore?.toFixed(2) }}</span>
              <span class="score-note">(加权汇总后的基础得分)</span>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="calculationDetailVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh, ArrowDown } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { businessLineApi } from '@/api/businessLine'
import { departmentApi } from '@/api/department'
import { getBonusPools } from '@/api/calculation'
import { startCalculation, simulateCalculation } from '@/api/calculation'
import type { BusinessLine } from '@/types/businessLine'
import type { Department } from '@/api/department'
import request from '@/utils/request'
import { generateCompanyPeriodOptions } from '@/utils/periodUtils'

// 响应式数据
const router = useRouter()
const loading = ref(false)
const calculating = ref(false)
const submitting = ref(false)
const exporting = ref(false)

const bonusPools = ref<any[]>([])
const selectedPools = ref<any[]>([])
const departments = ref<Department[]>([])
const businessLines = ref<BusinessLine[]>([])

// 统计数据
const statistics = reactive({
  totalPools: 0,
  totalAmount: 0,
  allocatedPools: 0,
  totalEmployees: 0
})

// 公司财务数据
const companyFinancialData = ref({
  totalBudget: 0,
  totalCost: 0,
  totalProfit: 0,
  estimatedBonus: 0
})

// 查询表单
const queryForm = reactive({
  status: undefined
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})
type BonusPool = {
  _id: number  // 暂时保留_id，这个文件的API不同
  period: string
  totalProfit: number
  poolRatio: number
  reserveRatio: number
  specialRatio: number
  distributableAmount: number
}
type BonusCalculationResult = {
  summary: {
    totalEmployees: number
    totalBonus: number
    averageBonus: number
    maxBonus: number
    minBonus: number
  }
  lineStats: {
    lineName: string
    employees: number
    totalBonus: number
    averageBonus: number
  }[]
  threeDimensionalResults?: any[]
}
// 对话框状态
const createPoolVisible = ref(false)
const editPoolVisible = ref(false)
const calculateVisible = ref(false)
const progressVisible = ref(false)
const resultVisible = ref(false)

const currentPool = ref<BonusPool>({} as BonusPool)
const calculationResult = ref<BonusCalculationResult>({} as BonusCalculationResult)

// 视图模式和员工明细
const resultViewMode = ref<'line' | 'employee'|'department'>('line')
const lineDistributionMode = ref<'business' | 'department'>('business')
const employeeDetailsList = ref<any[]>([])
const loadingEmployeeDetails = ref(false)

// ⭐ 新增：计算过程详情
const calculationDetailVisible = ref(false)
const currentCalculationDetail = ref<any>({})

// 表单
const poolFormRef = ref()
const editFormRef = ref()
const calculateFormRef = ref()

const poolForm = reactive({
  period: '',
  totalProfit: 10000000,
  poolRatio: 0.15,
  reserveRatio: 0.02,
  specialRatio: 0.03
})

const editForm = reactive({
  period: '',
  totalProfit: 10000000,
  poolRatio: 0.15,
  reserveRatio: 0.02,
  specialRatio: 0.03
})

const calculateForm = reactive({
  mode: 'full',
  departments: [],
  businessLines: [],
  minScoreThreshold: 0,
  simulation: false
})

// 进度
const progress = reactive({
  percentage: 0,
  status: '' as 'success' | 'exception' | 'active' | 'warning' | '',
  text: '',
  details: [] as string[]
})

// 表单验证规则
const poolFormRules = {
  period: [
    { required: true, message: '请输入计算周期', trigger: 'blur' }
  ],
  totalProfit: [
    { required: true, message: '请输入公司总利润', trigger: 'blur' },
    { type: 'number', min: 0, message: '利润不能为负数', trigger: 'blur' }
  ]
}

const editFormRules = {
  period: [
    { required: true, message: '请输入计算周期', trigger: 'blur' }
  ],
  totalProfit: [
    { required: true, message: '请输入公司总利润', trigger: 'blur' },
    { type: 'number', min: 0, message: '利润不能为负数', trigger: 'blur' }
  ]
}

// 工具函数
const formatNumber = (num: number) => {
  return new Intl.NumberFormat('zh-CN').format(num || 0)
}

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleString('zh-CN')
}

const periodOptions = computed(() => generateCompanyPeriodOptions())

const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    draft: 'info',
    calculated: 'warning',
    allocated: 'success',
    paid: '' // 已发放使用默认绿色
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    draft: '草稿',
    calculated: '已计算',
    allocated: '已分配',
    paid: '已发放'
  }
  return statusMap[status] || status
}

// 数据加载
const loadBonusPools = async () => {
  loading.value = true
  try {
    // 获取真实的奖金池数据
    const response = await getBonusPools({ pageSize: 100 })
    const data = response.data
    bonusPools.value = data.bonusPools
    // 更新统计
    statistics.totalPools = data.pagination.total
    statistics.totalAmount = bonusPools.value.reduce((sum, pool) => sum + (pool.poolAmount || 0), 0)
    // 已分配统计：状态为 'calculated' 或 'allocated' 的奖金池
    statistics.allocatedPools = bonusPools.value.filter(pool =>
      pool.status === 'calculated' || pool.status === 'allocated'
    ).length

    // 统计实际参与奖金分配的员工数（从所有已计算的奖金池中汇总）
    try {
      const participantSet = new Set<number>()

      for (const pool of bonusPools.value) {
        if (pool.status === 'calculated' || pool.status === 'allocated') {
          try {
            const { getCalculationHistory } = await import('@/api/calculation')
            const calcResponse: any = await getCalculationHistory(pool._id)

            if (calcResponse && calcResponse.code === 200 && calcResponse.data) {
              const threeDimensionalResults = calcResponse.data.threeDimensionalResults || []
              threeDimensionalResults.forEach((result: any) => {
                participantSet.add(result.employeeId || result.employee_id)
              })
            }
          } catch (error) {
            console.warn(`获取奖金池 ${pool._id} 的计算结果失败:`, error)
          }
        }
      }

      statistics.totalEmployees = participantSet.size
    } catch (error) {
      console.error('统计参与员工数失败:', error)
      // 如果统计失败，显示0而不是错误的总员工数
      statistics.totalEmployees = 0
    }

  } catch (error: any) {
    ElMessage.error('加载奖金池列表失败: ' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

const loadBasicData = async () => {
  try {
    console.log('🔄 正在加载基础数据...')

    // 加载业务线数据
    const businessLinesResponse = await businessLineApi.getBusinessLines({
      pageSize: 100,
      status: 1
    })

    if (businessLinesResponse && businessLinesResponse.data) {
      businessLines.value = businessLinesResponse.data.list || []
      console.log('✅ 成功加载业务线数据:', businessLines.value.length, '个业务线')
    }

    // 加载部门数据
    const departmentsResponse = await departmentApi.getDepartmentOptions({
      status: 1
    })

    if (departmentsResponse && departmentsResponse.data) {
      departments.value = departmentsResponse.data.departments || []
      console.log('✅ 成功加载部门数据:', departments.value.length, '个部门')
    }

    console.log('✅ 基础数据加载完成')

  } catch (error: any) {
    console.error('❌ 加载基础数据失败:', error)
    ElMessage.error('加载基础数据失败: ' + (error.response?.data?.message || error.message))

    // 设置空数组作为默认值
    businessLines.value = []
    departments.value = []
  }
}

// 事件处理
const refreshData = () => {
  loadBonusPools()
  loadBasicData()
}

const handleSearch = () => {
  loadBonusPools()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  loadBonusPools()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  loadBonusPools()
}

const handleSelectionChange = (selection: BonusPool[]) => {
  selectedPools.value = selection
}

const showCreatePoolDialog = async () => {
  // 重置表单
  Object.assign(poolForm, {
    period: '',
    totalProfit: 0,
    poolRatio: 0.15,
    reserveRatio: 0.02,
    specialRatio: 0.03
  })

  // 获取公司总体财务数据
  try {
    const { projectCostApi } = await import('@/api/projectCosts')
    const response = await projectCostApi.getAllProjectCostSummaries()
    const summaries = response.data || []

    // 计算公司总体财务数据
    companyFinancialData.value.totalBudget = summaries.reduce((sum: number, s: any) => sum + (Number(s?.totalBudget) || 0), 0)
    companyFinancialData.value.totalCost = summaries.reduce((sum: number, s: any) => sum + (Number(s?.totalCost) || 0), 0)
    companyFinancialData.value.totalProfit = companyFinancialData.value.totalBudget - companyFinancialData.value.totalCost
    companyFinancialData.value.estimatedBonus = summaries.reduce((sum: number, s: any) => sum + (Number(s?.estimatedBonus) || 0), 0)

    // 计算已分配的项目奖金和可用利润
    const allocatedProjectBonus = summaries.reduce((sum: number, s: any) => sum + (Number(s?.allocatedProjectBonus) || 0), 0)
    const availableProfit = summaries.reduce((sum: number, s: any) => sum + (Number(s?.availableProfit) || 0), 0)

    // 查询已创建的公司级奖金池总额
    const { getBonusPools } = await import('@/api/calculation')
    const bonusPoolsResponse = await getBonusPools({ pageSize: 1000 })
    const allocatedCompanyBonus = (bonusPoolsResponse.data?.bonusPools || []).reduce((sum: number, pool: any) => {
      return sum + (Number(pool?.poolAmount) || 0)
    }, 0)

    // 计算最终可用利润
    const finalAvailableProfit = availableProfit - allocatedCompanyBonus

      // 保存扩展信息
      ; (companyFinancialData.value as any).allocatedProjectBonus = allocatedProjectBonus
      ; (companyFinancialData.value as any).allocatedCompanyBonus = allocatedCompanyBonus
      ; (companyFinancialData.value as any).finalAvailableProfit = finalAvailableProfit

    // console.log('公司财务数据:', {
    //   totalBudget: companyFinancialData.value.totalBudget,
    //   totalCost: companyFinancialData.value.totalCost,
    //   totalProfit: companyFinancialData.value.totalProfit,
    //   allocatedProjectBonus,
    //   allocatedCompanyBonus,
    //   finalAvailableProfit
    // })
  } catch (error) {
    console.error('获取公司财务数据失败:', error)
  }

  createPoolVisible.value = true
}

const handleCreatePool = async () => {
  if (!poolFormRef.value) return

  try {
    await poolFormRef.value.validate()

    // 验证奖金池金额是否在合理范围内
    const poolAmount = poolForm.totalProfit * poolForm.poolRatio
    const totalProfit = companyFinancialData.value.totalProfit

    // 检查输入的总利润是否超过实际总利润
    if (totalProfit > 0 && poolForm.totalProfit > totalProfit * 1.5) {
      const confirmResult = await ElMessageBox.confirm(
        `输入的公司总利润 ¥${formatNumber(poolForm.totalProfit)} 超过了实际总利润 ¥${formatNumber(totalProfit)} 的150%，是否继续创建？`,
        '总利润数据异常',
        {
          type: 'warning',
          confirmButtonText: '继续创建',
          cancelButtonText: '重新调整'
        }
      ).catch(() => false)

      if (!confirmResult) {
        return
      }
    }

    // 检查奖金池金额是否超过总利润
    if (poolAmount > poolForm.totalProfit) {
      ElMessage.error('奖金池金额不能超过公司总利润')
      return
    }

    submitting.value = true

    // 调用真实API创建奖金池
    const createData = {
      period: poolForm.period,
      totalProfit: poolForm.totalProfit,
      poolRatio: poolForm.poolRatio,
      reserveRatio: poolForm.reserveRatio,
      specialRatio: poolForm.specialRatio
    }

    console.log('创建奖金池:', createData)

    // 使用calculation API创建奖金池
    const { createBonusPool } = await import('@/api/calculation')
    const response: any = await createBonusPool(createData)

    if (response && response.code === 200) {
      ElMessage.success('奖金池创建成功')
      createPoolVisible.value = false
      loadBonusPools()
    } else {
      throw new Error(response?.message || '创建奖金池失败')
    }

  } catch (error: any) {
    console.error('创建奖金池失败:', error)
    if (error !== 'cancel') {
      const errorMessage = error.response?.data?.message || error.message || '创建失败'
      ElMessage.error(errorMessage)
    }
  } finally {
    submitting.value = false
  }
}

const showCalculateDialog = (pool: BonusPool) => {
  currentPool.value = pool
  Object.assign(calculateForm, {
    mode: 'full',
    departments: [],
    businessLines: [],
    minScoreThreshold: 0,
    simulation: false
  })
  calculateVisible.value = true
}

const handleCalculate = async () => {
  if (!currentPool.value || !currentPool.value.period) {
    ElMessage.error('奖金池信息不完整')
    return
  }

  calculating.value = true

  try {
    // 第一步：验证绩效数据
    const { validatePerformanceData } = await import('@/api/calculation')
    let validationResponse: any
    
    try {
      validationResponse = await validatePerformanceData(currentPool.value.period)
    } catch (error: any) {
      // 捕获request拦截器的reject，从错误信息中提取业务信息
      const errorMessage = error.message || ''
      calculating.value = false
      await ElMessageBox.alert(
        errorMessage,
        '绩效数据不完整',
        {
          type: 'error',
          confirmButtonText: '去录入'
        }
      )
      return
    }
    
    if (validationResponse.code === 400) {
      // 没有绩效数据，阻止计算
      calculating.value = false
      await ElMessageBox.alert(
        validationResponse.message,
        '绩效数据不完整',
        {
          type: 'error',
          confirmButtonText: '去录入'
        }
      )
      return
    } else if (validationResponse.code === 200 && validationResponse.data?.warning) {
      // 绩效数据不完整，给出警告
      const confirmResult = await ElMessageBox.confirm(
        validationResponse.message,
        '绩效数据警告',
        {
          type: 'warning',
          confirmButtonText: '继续计算',
          cancelButtonText: '去补充',
          distinguishCancelAndClose: true
        }
      ).catch((action) => {
        if (action === 'cancel') {
          router.push('/performance/records')
        }
        return false
      })

      if (!confirmResult) {
        calculating.value = false
        return
      }
    }

    // 第二步：执行计算
    calculateVisible.value = false
    progressVisible.value = true

    // 重置进度
    Object.assign(progress, {
      percentage: 0,
      status: 'active',
      text: '准备计算...',
      details: []
    })

    // 调用真实的计算API
    const calculateData = {
      poolId: currentPool.value._id,
      mode: calculateForm.mode as 'full' | 'department' | 'line',
      departments: calculateForm.departments,
      businessLines: calculateForm.businessLines,
      minScoreThreshold: calculateForm.minScoreThreshold,
      simulation: calculateForm.simulation
    }

    const response: any = await startCalculation(calculateData)

    if (response && response.code === 200) {
      const taskId = response.data.taskId;

      // 如果是模拟计算，直接显示结果
      if (calculateForm.simulation) {
        // 获取模拟计算结果
        try {
          const simulateResponse: any = await simulateCalculation(calculateData)

          if (simulateResponse && simulateResponse.code === 200) {
            calculationResult.value = {
              summary: simulateResponse.data.summary,
              lineStats: Object.entries(simulateResponse.data.distribution.byDepartment).map(([lineName, data]: [string, any]) => ({
                lineName,
                employees: data.count,
                totalBonus: data.amount,
                averageBonus: data.count > 0 ? data.amount / data.count : 0
              }))
            }
            progressVisible.value = false
            resultVisible.value = true
          } else {
            throw new Error(simulateResponse?.message || '模拟计算失败')
          }
        } catch (simulateError: any) {
          progress.status = 'exception'
          progress.text = '模拟计算失败: ' + (simulateError.message || '未知错误')
        }
      } else {
        // 实际计算，开始轮询进度
        await pollCalculationProgress(taskId);
      }
    } else {
      throw new Error(response?.message || '计算任务提交失败')
    }

  } catch (error: any) {
    progress.status = 'exception'
    progress.text = '计算失败: ' + (error.message || '未知错误')
    ElMessage.error('计算失败: ' + (error.message || '未知错误'))
  } finally {
    calculating.value = false
  }
}

const viewCalculationResult = () => {
  progressVisible.value = false
  resultVisible.value = true
}

const showResultDialog = async (pool: BonusPool) => {
  currentPool.value = pool
  loading.value = true
  resultViewMode.value = 'line'
  try {
    // 调用真实的API获取计算结果
    const { getCalculationHistory } = await import('@/api/calculation')
    const response: any = await getCalculationHistory(pool._id)

    if (response && response.code === 200 && response.data && response.data.summary) {
      // 使用API返回的实际数据
      const data = response.data

      // 创建计算结果对象
      calculationResult.value = {
        summary: data.summary,
        lineStats: [],
        threeDimensionalResults: data.threeDimensionalResults
      }

      // 加载业务线统计数据
      await loadBusinessLineStats();
    } else {
      // 如果没有历史记录，使用模拟数据
      calculationResult.value = {
        summary: {
          totalEmployees: 31,
          totalBonus: 1350000,
          averageBonus: 9000,
          maxBonus: 45000,
          minBonus: 3000
        },
        lineStats: [
          { lineName: '实施', employees: 16, totalBonus: 742500, averageBonus: 9281 },
          { lineName: '售前', employees: 6, totalBonus: 270000, averageBonus: 9000 },
          { lineName: '市场', employees: 5, totalBonus: 202500, averageBonus: 8100 },
          { lineName: '运营', employees: 4, totalBonus: 135000, averageBonus: 9000 }
        ],
        threeDimensionalResults: []
      }
    }
  } catch (error: any) {
    ElMessage.error('获取计算结果失败: ' + (error.message || '未知错误'))
    // 使用模拟数据
    calculationResult.value = {
      summary: {
        totalEmployees: 31,
        totalBonus: 1350000,
        averageBonus: 9000,
        maxBonus: 45000,
        minBonus: 3000
      },
      lineStats: [
        { lineName: '实施', employees: 16, totalBonus: 742500, averageBonus: 9281 },
        { lineName: '售前', employees: 6, totalBonus: 270000, averageBonus: 9000 },
        { lineName: '市场', employees: 5, totalBonus: 202500, averageBonus: 8100 },
        { lineName: '运营', employees: 4, totalBonus: 135000, averageBonus: 9000 }
      ],
      threeDimensionalResults: []
    }
  } finally {
    loading.value = false
    resultVisible.value = true
  }
}

const exportResult = async () => {
  if (!currentPool.value) {
    ElMessage.warning('请先选择一个奖金池')
    return
  }

  exporting.value = true
  try {
    const { exportCalculationResult } = await import('@/api/calculation')
    const response = await exportCalculationResult(currentPool.value._id, 'excel')

    // 创建 Blob 对象
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })

    // 创建下载链接
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `奖金池计算结果_${currentPool.value.period}.xlsx`
    document.body.appendChild(link)
    link.click()

    // 清理
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    ElMessage.success('导出成功')
  } catch (error: any) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败: ' + (error.response?.data?.message || error.message || '未知错误'))
  } finally {
    exporting.value = false
  }
}

const showEditDialog = (pool: BonusPool) => {
  currentPool.value = pool
  // 填充编辑表单
  Object.assign(editForm, {
    period: pool.period,
    totalProfit: pool.totalProfit,
    poolRatio: pool.poolRatio,
    reserveRatio: pool.reserveRatio,
    specialRatio: pool.specialRatio
  })
  editPoolVisible.value = true
}

const handleEditPool = async () => {
  if (!editFormRef.value) return

  try {
    await editFormRef.value.validate()

    submitting.value = true

    const updateData = {
      period: editForm.period,
      totalProfit: editForm.totalProfit,
      poolRatio: editForm.poolRatio,
      reserveRatio: editForm.reserveRatio,
      specialRatio: editForm.specialRatio
    }

    console.log('更新奖金池:', currentPool.value._id, updateData)

    const { updateBonusPool } = await import('@/api/calculation')
    const response: any = await updateBonusPool(currentPool.value._id, updateData)

    if (response && response.code === 200) {
      ElMessage.success('奖金池更新成功')
      editPoolVisible.value = false
      loadBonusPools()
    } else {
      throw new Error(response?.message || '更新奖金池失败')
    }

  } catch (error: any) {
    console.error('更新奖金池失败:', error)
    if (error !== 'cancel') {
      const errorMessage = error.response?.data?.message || error.message || '更新失败'
      ElMessage.error(errorMessage)
    }
  } finally {
    submitting.value = false
  }
}

const handleCopyPool = async (pool: BonusPool) => {
  try {
    const { value: newPeriod } = await ElMessageBox.prompt(
      '请输入新奖金池的计算周期',
      '复制奖金池',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /.+/,
        inputErrorMessage: '请输入计算周期',
        inputValue: `${pool.period}-copy`
      }
    )

    if (!newPeriod) {
      return
    }

    submitting.value = true

    const { copyBonusPool } = await import('@/api/calculation')
    const response: any = await copyBonusPool(pool._id, newPeriod)

    if (response && response.code === 200) {
      ElMessage.success('奖金池复制成功')
      loadBonusPools()
    } else {
      throw new Error(response?.message || '复制奖金池失败')
    }

  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('复制奖金池失败:', error)
      const errorMessage = error.response?.data?.message || error.message || '复制失败'
      ElMessage.error(errorMessage)
    }
  } finally {
    submitting.value = false
  }
}


const handleMoreAction = async (command: string, pool: BonusPool) => {
  switch (command) {
    case 'edit':
      showEditDialog(pool)
      break
    case 'copy':
      await handleCopyPool(pool)
      break
    case 'export':
      // 导出结果
      currentPool.value = pool
      await exportResult()
      break
    case 'delete':
      try {
        await ElMessageBox.confirm(
          `确定要删除奖金池 ${pool.period} 吗？删除后将无法恢复。`,
          '确认删除',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        // 调用删除API
        const { deleteBonusPool } = await import('@/api/calculation')
        const response: any = await deleteBonusPool(pool._id)

        if (response && response.code === 200) {
          ElMessage.success('删除成功')
          loadBonusPools()
        } else {
          throw new Error(response?.message || '删除失败')
        }
      } catch (error: any) {
        // 用户取消或删除失败
        if (error !== 'cancel') {
          const errorMessage = error.response?.data?.message || error.message || '删除失败'
          ElMessage.error(errorMessage)
        }
      }
      break
  }
}

// 发放奖金
const handlePayment = async (pool: BonusPool) => {
  try {
    await ElMessageBox.confirm(
      `确认发放奖金池 ${pool.period} 的奖金？\n\n发放后将不能修改或删除此奖金池。`,
      '确认发放',
      {
        confirmButtonText: '确认发放',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 调用发放接口
    const { payBonusPool } = await import('@/api/calculation')
    const response: any = await payBonusPool(pool._id)

    if (response && response.code === 200) {
      ElMessage.success('奖金发放成功')
      loadBonusPools()
    } else {
      throw new Error(response?.message || '发放失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      const errorMessage = error.response?.data?.message || error.message || '发放失败'
      ElMessage.error(errorMessage)
    }
  }
}

// 页面加载时初始化数据
onMounted(() => {
  loadBonusPools()
  loadBasicData()
})

// 监听视图模式切换，加载员工明细
watch(resultViewMode, async (newMode) => {
  if (newMode === 'employee' && currentPool.value._id) {
    await loadEmployeeDetails()
  }
})

// 监听视图模式切换，加载相应数据
watch(resultViewMode, async (newMode) => {
  if (calculationResult.value && calculationResult.value.threeDimensionalResults) {
    if (newMode === 'line') {
      await loadBusinessLineStats();
    } else if (newMode === 'department') {
      await loadDepartmentStats();
    } else if (newMode === 'employee') {
      await loadEmployeeDetails();
    }
  }
})

// 轮询计算进度
const pollCalculationProgress = async (taskId: string) => {
  // 初始化进度
  Object.assign(progress, {
    percentage: 0,
    status: 'active',
    text: '正在计算中...',
    details: ['任务已提交']
  })

  const maxRetries = 60; // 最大尝试次数，假设每秒一次，最多1分钟
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      const { getCalculationResult } = await import('@/api/calculation')
      const response: any = await getCalculationResult(taskId)

      if (response && response.code === 200 && response.data) {
        const resultData = response.data

        // 更新进度
        if (resultData.progress !== undefined) {
          progress.percentage = resultData.progress
        }

       // 根据状态更新UI
        if (resultData.status === 'completed') {
          progress.status = 'success'
          progress.text = '计算完成！'
          progress.details.push('计算任务已完成，请点击"查看结果"按钮查看详情')

          // 不再自动弹出结果对话框，由用户手动点击"查看结果"按钮
          // 刷新奖金池列表以更新状态
          await loadBonusPools()
          
          break
        } else if (resultData.status === 'error') {
          progress.status = 'exception'
          progress.text = '计算失败: ' + (resultData.error || '未知错误')
          progress.details.push('错误: ' + (resultData.error || '未知错误'))
          break
        } else if (resultData.status === 'processing') {
          progress.status = 'active'
          progress.text = `正在计算中... (${resultData.progress || 0}%)`

          // 如果有具体进度信息
          if (resultData.message) {
            progress.details.push(resultData.message)
          }
        }
      } else {
        // 如果API返回错误，重试
        progress.details.push(`尝试 ${retryCount + 1}: 请求失败`)
      }
    } catch (error: any) {
      console.error('获取计算进度失败:', error)
      progress.details.push(`尝试 ${retryCount + 1}: ${(error.message || '网络错误')}`)
    }

    // 等待1秒再继续轮询
    await new Promise(resolve => setTimeout(resolve, 1000))
    retryCount++
  }

  if (retryCount >= maxRetries) {
    progress.status = 'warning'
    progress.text = '计算超时，请稍后查看结果'
    progress.details.push('任务超时，建议手动刷新查看结果')
  }
}

// 加载业务线统计数据（通用函数，用于初始化）
const loadLineStats = async () => {
  try {
    // 从三维计算结果中提取业务线数据
    if (calculationResult.value && calculationResult.value.threeDimensionalResults) {
      const results = calculationResult.value.threeDimensionalResults

      // 按业务线分组统计
      const lineStatsMap = new Map<string, { lineName: string, employees: number, totalBonus: number, averageBonus: number }>()

      for (const result of results) {
        // 优先使用业务线名称，如果没有则使用部门名称
        const lineName = result.businessLineName || result.business_line_name || result.departmentName || result.department_name || '未分配'
        const finalBonus = parseFloat(result.finalBonusAmount || result.final_bonus_amount || 0)

        if (!lineStatsMap.has(lineName)) {
          lineStatsMap.set(lineName, {
            lineName,
            employees: 0,
            totalBonus: 0,
            averageBonus: 0
          })
        }

        const stat = lineStatsMap.get(lineName)!
        stat.employees++
        stat.totalBonus += finalBonus
      }

      // 计算平均奖金
      for (const [_, stat] of lineStatsMap) {
        stat.averageBonus = stat.employees > 0 ? stat.totalBonus / stat.employees : 0
      }

      calculationResult.value.lineStats = Array.from(lineStatsMap.values())
    }
  } catch (error: any) {
    console.error('加载业务线统计数据失败:', error)
    ElMessage.error('加载业务线统计数据失败: ' + (error.message || '未知错误'))
  }
}

// 加载部门统计数据
const loadDepartmentStats = async () => {
  try {
    // 从三维计算结果中提取部门数据
    if (calculationResult.value && calculationResult.value.threeDimensionalResults) {
      const results = calculationResult.value.threeDimensionalResults

      // 按部门分组统计
      const lineStatsMap = new Map<string, { lineName: string, employees: number, totalBonus: number, averageBonus: number }>()

      for (const result of results) {
        // 使用部门名称
        const lineName = result.departmentName || result.department_name || '未分配'
        const finalBonus = parseFloat(result.finalBonusAmount || result.final_bonus_amount || 0)

        if (!lineStatsMap.has(lineName)) {
          lineStatsMap.set(lineName, {
            lineName,
            employees: 0,
            totalBonus: 0,
            averageBonus: 0
          })
        }

        const stat = lineStatsMap.get(lineName)!
        stat.employees++
        stat.totalBonus += finalBonus
      }

      // 计算平均奖金
      for (const [_, stat] of lineStatsMap) {
        stat.averageBonus = stat.employees > 0 ? stat.totalBonus / stat.employees : 0
      }

      calculationResult.value.lineStats = Array.from(lineStatsMap.values())
    }
  } catch (error: any) {
    console.error('加载部门统计数据失败:', error)
    ElMessage.error('加载部门统计数据失败: ' + (error.message || '未知错误'))
  }
}

// 专门用于加载业务线数据的函数
const loadBusinessLineStats = async () => {
  try {
    // 从三维计算结果中提取业务线数据
    if (calculationResult.value && calculationResult.value.threeDimensionalResults) {
      const results = calculationResult.value.threeDimensionalResults

      console.log('🔍 业务线统计 - 数据样本:', results[0])

      // 按业务线分组统计
      const lineStatsMap = new Map<string, { lineName: string, employees: number, totalBonus: number, averageBonus: number }>()

      for (const result of results) {
        // 多种可能的字段名：
        // 1. businessLineName (直接字段)
        // 2. business_line_name (下划线字段)
        // 3. businessLine.name (对象字段)
        // 4. business_line.name (对象字段)
        let lineName = result.businessLineName || result.business_line_name
        
        if (!lineName && result.businessLine) {
          lineName = typeof result.businessLine === 'object' 
            ? (result.businessLine.name || result.businessLine.Name)
            : result.businessLine
        }
        
        if (!lineName && result.business_line) {
          lineName = typeof result.business_line === 'object'
            ? (result.business_line.name || result.business_line.Name)  
            : result.business_line
        }
        
        // 如果还是没有，标记为"未分配"
        lineName = lineName || '未分配'
        
        const finalBonus = parseFloat(result.finalBonusAmount || result.final_bonus_amount || 0)

        // 包含所有数据，即使是"未分配"的也要显示
        if (!lineStatsMap.has(lineName)) {
          lineStatsMap.set(lineName, {
            lineName,
            employees: 0,
            totalBonus: 0,
            averageBonus: 0
          })
        }

        const stat = lineStatsMap.get(lineName)!
        stat.employees++
        stat.totalBonus += finalBonus
      }

      // 计算平均奖金
      for (const [_, stat] of lineStatsMap) {
        stat.averageBonus = stat.employees > 0 ? stat.totalBonus / stat.employees : 0
      }

      calculationResult.value.lineStats = Array.from(lineStatsMap.values())
      console.log('✅ 业务线统计完成:', calculationResult.value.lineStats)
    }
  } catch (error: any) {
    console.error('加载业务线统计数据失败:', error)
    ElMessage.error('加载业务线统计数据失败: ' + (error.message || '未知错误'))
  }
}

// 加载员工奖金明细
const loadEmployeeDetails = async () => {
  if (!currentPool.value._id) {
    return
  }

  loadingEmployeeDetails.value = true
  try {
    // 调用API获取三维计算结果
    const response: any = await request({
      url: `/calculations/bonus-pools/${currentPool.value._id}/calculations`,
      method: 'get'
    })

    if (response.code === 200 && response.data.threeDimensionalResults) {
      const results = response.data.threeDimensionalResults

      console.log('=== 三维计算结果调试 ===')
      console.log('计算结果数量:', results.length)
      if (results.length > 0) {
        console.log('第一条结果样例:', results[0])
      }

      // 直接使用后端返回的员工信息，不需要再次查询
      employeeDetailsList.value = results.map((result: any) => {
        return {
          employeeId: result.employeeId,
          // 后端已经关联好了员工信息，直接使用
          employeeNo: result.employeeNo || result.employee_no || '-',
          employeeName: result.employeeName || result.employee_name || '未知',
          departmentName: result.departmentName || result.department_name || '-',
          positionName: result.positionName || result.position_name || '-',
          businessLineName: result.businessLineName || result.business_line_name || '-', // 添加业务线名称
          profitContributionScore: result.profitContributionScore || result.profit_contribution_score || 0,
          positionValueScore: result.positionValueScore || result.position_value_score || 0,
          performanceScore: result.performanceScore || result.performance_score || 0,
          finalScore: result.finalScore || result.final_score || 0,
          totalScore: result.total_score || result.total_score || 0,
          finalBonusAmount: result.finalBonusAmount || result.final_bonus_amount || 0,
          
          // ⭐ 新增：系数字段（用于展示计算过程）
          baseThreeDimensionalScore: result.baseThreeDimensionalScore || result.base_three_dimensional_score || 0,
          finalCoefficientScore: result.finalCoefficientScore || result.final_coefficient_score || 0,
          positionBenchmark: result.positionBenchmark || result.position_benchmark || 1.0,
          cityCoefficient: result.cityCoefficient || result.city_coefficient || 1.0,
          businessLineCoefficient: result.businessLineCoefficient || result.business_line_coefficient || 1.0,
          performanceCoefficient: result.performanceCoefficient || result.performance_coefficient || 1.0,
          // timeCoefficient: result.timeCoefficient || result.time_coefficient || 1.0  // ✅ 已移除
        }
      })

      // 按奖金降序排序
      employeeDetailsList.value.sort((a, b) => b.finalBonusAmount - a.finalBonusAmount)
    } else {
      employeeDetailsList.value = []
    }
  } catch (error: any) {
    console.error('加载员工明细失败:', error)
    ElMessage.error('加载员工明细失败: ' + (error.message || '未知错误'))
    employeeDetailsList.value = []
  } finally {
    loadingEmployeeDetails.value = false
  }
}

// ⭐ 新增：显示计算详情
const showCalculationDetail = (row: any) => {
  currentCalculationDetail.value = row
  calculationDetailVisible.value = true
}
</script>

<style scoped>
.bonus-calculation {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 8px;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-content {
  text-align: center;
}

.stat-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 4px;
}

.stat-subtitle {
  font-size: 12px;
  color: #999;
}

.table-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-controls {
  display: flex;
  gap: 12px;
  align-items: center;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

.calculation-preview {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 6px;
  margin-top: 16px;
}

.preview-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.preview-item.highlight {
  font-size: 16px;
  font-weight: bold;
  border-top: 1px solid #ddd;
  padding-top: 8px;
  margin-top: 8px;
}

.form-item-help {
  font-size: 12px;
  color: #999;
  margin-left: 8px;
}

.pool-info {
  margin-bottom: 20px;
}

.progress-content {
  text-align: center;
  padding: 20px 0;
}

.progress-text {
  margin: 16px 0 8px;
  font-size: 14px;
  color: #666;
}

.progress-details {
  margin-top: 16px;
  font-size: 12px;
  color: #999;
}

.result-summary {
  margin-bottom: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.summary-item {
  text-align: center;
}

.summary-number {
  font-size: 20px;
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 4px;
}

.summary-label {
  font-size: 14px;
  color: #666;
}

.view-switcher {
  margin: 20px 0;
  display: flex;
  justify-content: center;
}

/* ⭐ 新增：计算详情对话框样式 */
.calculation-detail-container {
  padding: 10px 0;
}

.calculation-detail-container .el-card {
  margin-bottom: 20px;
}

.calculation-detail-container .el-card:last-child {
  margin-bottom: 0;
}

.card-header {
  display: flex;
  align-items: center;
  font-weight: bold;
  font-size: 16px;
}

.formula-card {
  background: linear-gradient(135deg, #f5f7fa 0%, #e8f0fe 100%);
}

.formula-content {
  padding: 20px;
}

.formula-line {
  padding: 15px;
  margin: 10px 0;
  background: white;
  border-radius: 8px;
  font-size: 14px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.formula-line.main-formula {
  background: #fff9e6;
  border: 2px solid #ffd666;
}

.formula-line.calculation-result {
  background: #e6f7ff;
  border: 2px solid #91d5ff;
  font-size: 16px;
}

.formula-part {
  padding: 4px 12px;
  background: #409eff;
  color: white;
  border-radius: 4px;
  font-size: 13px;
}

.formula-line .value {
  padding: 4px 10px;
  background: #67c23a;
  color: white;
  border-radius: 4px;
  font-weight: bold;
}

.coefficient-item {
  text-align: center;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
  transition: all 0.3s;
}

.coefficient-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.coefficient-item.highlight {
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
  border: 2px solid #ff9800;
}

.coef-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
  font-weight: 500;
}

.coef-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 8px;
}

.coef-value.positive {
  color: #67c23a;
}

.coef-value.negative {
  color: #f56c6c;
}

.coef-value.normal {
  color: #909399;
}

.coef-value.final {
  color: #e6a23c;
  font-size: 32px;
}

.coef-desc {
  font-size: 12px;
  color: #999;
}

.score-value {
  font-size: 16px;
  font-weight: bold;
  color: #409eff;
}

.score-value.highlight {
  font-size: 18px;
  color: #e6a23c;
}

.score-note {
  margin-left: 10px;
  font-size: 12px;
  color: #999;
  font-weight: normal;
}
</style>