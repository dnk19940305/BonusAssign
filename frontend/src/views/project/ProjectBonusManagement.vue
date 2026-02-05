<template>
  <div class="page-container">
    <div class="page-header">
      <div class="flex-center">
        <h2>项目奖金池管理</h2>
        <el-popover placement="right" :width="400" trigger="hover">
          <template #reference>
            <el-icon :size="24" style="margin-left: 8px">
              <QuestionFilled />
            </el-icon>
          </template>
          <!-- 功能说明 -->
          <div class="function-intro">
            <el-alert title="项目奖金池管理" type="info" :closable="false" class="info-alert">
              <template #default>
                <div class="intro-content">
                  <p>项目奖金池管理包含：<strong>奖金池创建</strong>、<strong>奖金计算</strong>和<strong>审批流程</strong>。</p>

                  <div class="formula-section">
                    <h4>计算公式</h4>
                    <div style="background: #f0f9ff; padding: 12px; border-radius: 4px; border-left: 3px solid #409EFF; margin-bottom: 12px;">
                      <p style="margin: 0 0 8px 0;"><strong>成员权重</strong> = 角色权重 × 贡献权重 × 工作量占比 × 参与度</p>
                      <p style="margin: 0;"><strong>成员奖金</strong> = 项目奖金池 × (成员权重 / 所有成员权重之和)</p>
                    </div>
                  </div>

                  <div class="coefficients-section">
                    <h4>参数说明</h4>
                    <ul>
                      <li><strong>角色权重</strong>：根据项目角色确定（如项目经理2.0，技术负责人1.8）</li>
                      <li><strong>贡献权重</strong>：成员在项目中的实际贡献比例（0-100%，默认100%）</li>
                      <li><strong>工作量占比</strong>：在项目中的工作量分配比例（1-100%，默认100%）</li>
                      <li><strong>参与度</strong>：实际参与项目的时间占比（0-100%，默认100%）</li>
                    </ul>
                  </div>

                  <div class="navigation-section">
                    <h4>配置导航</h4>
                    <ul>
                      <li>角色权重配置：基础管理 → 项目角色权重管理</li>
                      <li>贡献权重设置：项目管理 → 我的项目 → 管理贡献权重</li>
                      <li>工作量占比设置：项目管理 → 我的项目 → 管理工作量占比</li>
                      <li>参与度设置：项目管理 → 项目成员管理</li>
                    </ul>
                  </div>
                </div>
              </template>
            </el-alert>
          </div>
        </el-popover>

      </div>
      <div class="header-actions">
        <el-button type="primary" @click="showCreatePoolDialog">
          <el-icon>
            <Plus />
          </el-icon>
          创建奖金池
        </el-button>
        <el-button @click="refreshList">
          <el-icon>
            <Refresh />
          </el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 筛选区域 -->
    <div class="filter-section">
      <el-form :model="queryForm" inline>
        <el-form-item label="项目">
          <el-select v-model="queryForm.projectId" placeholder="选择项目" clearable filterable style="width: 200px"
            @change="handleSearch">
            <el-option v-for="project in allProjects" v-if="allProjects && allProjects.length > 0"
              :key="project.id || project._id" :label="project.name + ' (' + project.code + ')'"
              :value="project.id || project._id" />
          </el-select>
          <div v-if="allProjects.length === 0" style="margin-top: 4px; color: #f56c6c; font-size: 12px">
            没有可用的项目
          </div>
        </el-form-item>

        <el-form-item label="期间">
          <el-select v-model="queryForm.period" placeholder="选择期间" clearable style="width: 120px"
            @change="handleSearch">
            <el-option v-for="period in availablePeriods" :key="period.value" :label="period.label"
              :value="period.value" />
          </el-select>
        </el-form-item>

        <el-form-item label="状态">
          <el-select v-model="queryForm.status" placeholder="奖金池状态" clearable style="width: 120px"
            @change="handleSearch">
            <el-option label="待审批" value="pending" />
            <el-option label="已审批" value="approved" />
            <el-option label="已分配" value="distributed" />
            <el-option label="已计算" value="calculated" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
        </el-form-item>
      </el-form>
    </div>


    <!-- 奖金池列表 -->
    <div class="table-section">
      <vxe-table ref="poolTable" :data="poolList" stripe border show-overflow="title" height="500">
        <template #loading>
          <div v-if="loading" class="loading-overlay">
            <el-icon class="is-loading">
              <Loading />
            </el-icon>
            <span>加载中...</span>
          </div>
        </template>
        <vxe-column field="projectName" title="项目名称" width="200">
          <template #default="scope">
            <div v-if="scope?.row" class="project-info">
              <div class="project-name">{{ scope.row.projectName }}</div>
              <div class="project-code">{{ scope.row.projectCode }}</div>
            </div>
          </template>
        </vxe-column>

        <vxe-column field="period" title="奖金期间" width="100" />

        <vxe-column field="totalAmount" title="奖金总额" width="120">
          <template #default="scope">
            <span v-if="scope?.row" class="amount">{{ formatCurrency(scope.row.totalAmount) }}</span>
          </template>
        </vxe-column>

        <vxe-column field="profitRatio" title="利润分配比例" width="120">
          <template #default="scope">
            <span v-if="scope?.row?.profitRatio">{{ Math.round(scope.row.profitRatio * 100) }}%</span>
            <span v-else>-</span>
          </template>
        </vxe-column>

        <vxe-column field="memberCount" title="成员数量" width="100">
          <template #default="scope">
            <span v-if="scope?.row">{{ scope.row.memberCount || 0 }}人</span>
          </template>
        </vxe-column>

        <vxe-column field="averageBonus" title="平均奖金" width="120">
          <template #default="scope">
            <span v-if="scope?.row?.memberCount > 0" class="amount">
              {{ formatCurrency(scope.row.totalAmount / scope.row.memberCount) }}
            </span>
            <span v-else>-</span>
          </template>
        </vxe-column>

        <vxe-column field="status" title="状态" width="100">
          <template #default="scope">
            <el-tag v-if="scope?.row" :type="getStatusType(scope.row.status)" size="small">
              {{ getStatusLabel(scope.row.status) }}
            </el-tag>
          </template>
        </vxe-column>

        <vxe-column field="createdAt" title="创建时间" width="120">
          <template #default="scope">
            <span v-if="scope?.row">{{ formatDate(scope.row.createdAt) }}</span>
          </template>
        </vxe-column>

        <vxe-column title="操作" width="420" fixed="right">
          <template #default="scope">
            <div v-if="scope?.row">
              <!-- 编辑按钮 - pending和calculated状态可以编辑 -->
              <el-button v-if="scope.row.status === 'pending' || scope.row.status === 'calculated'" type="primary"
                size="small" text @click="showEditDialog(scope.row)">
                编辑
              </el-button>

              <!-- 删除按钮 - 只有approved状态可以删除 -->
              <el-button v-if="scope.row.status !== 'approved'" type="danger" size="small" text
                @click="handleDelete(scope.row)">
                删除
              </el-button>

              <!-- 计算分配按钮 - pending状态 -->
              <el-button v-if="scope.row.status === 'pending'" type="primary" size="small" text
                @click="calculateBonus(scope.row)">
                计算分配
              </el-button>

              <!-- 重新计算按钮 - calculated状态 -->
              <el-button v-if="scope.row.status === 'calculated'" type="warning" size="small" text
                @click="recalculateBonus(scope.row)">
                重新计算
              </el-button>

              <!-- <el-button
                v-if="scope.row.status === 'pending'"
                type="warning"
                size="small"
                text
                @click="goToManualInput(scope.row)"
              >
                手动录入
              </el-button> -->

              <!-- 审批按钮 -->
              <el-button v-if="scope.row.status === 'calculated'" type="success" size="small" text
                @click="approveBonus(scope.row)">
                审批
              </el-button>

              <!-- 查看详情 -->
              <el-button size="small" text @click="viewDetails(scope.row)">
                查看详情
              </el-button>

              <!-- 查看历史 - 已计算的奖金池可以查看 -->
              <el-button v-if="scope.row.status === 'calculated' || scope.row.status === 'approved'" type="info"
                size="small" text @click="viewHistory(scope.row)">
                计算历史
              </el-button>

              <el-button v-if="scope.row.status === 'approved'" type="warning" size="small" text
                @click="exportReport(scope.row)">
                导出
              </el-button>
            </div>
          </template>
        </vxe-column>
      </vxe-table>
    </div>

    <!-- 创建奖金池对话框 -->
    <el-dialog v-model="createPoolDialogVisible" title="创建项目奖金池" width="600px" @close="resetCreateForm">
      <el-form ref="createFormRef" :model="createForm" :rules="createFormRules" label-width="100px">
        <el-form-item label="选择项目" prop="projectId">
          <el-select v-model="createForm.projectId" placeholder="请选择项目" filterable clearable style="width: 100%"
            @change="handleProjectChange">
            <el-option v-for="project in allProjects" v-if="allProjects && allProjects.length > 0"
              :key="project.id || project._id" :label="project.name + ' (' + project.code + ')'"
              :value="project.id || project._id" />
          </el-select>
          <div v-if="allProjects.length === 0" style="margin-top: 8px; color: #f56c6c; font-size: 12px">
            没有可用的项目，请联系管理员
          </div>
        </el-form-item>

        <!-- 项目财务信息展示 -->
        <el-alert v-if="createForm.projectId" type="info" :closable="false" style="margin-bottom: 20px">
          <template #title>
            <div style="font-weight: bold; margin-bottom: 10px">项目财务概览</div>
          </template>
          <div style="font-size: 13px">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px">
              <span><strong>项目预算：</strong>{{ formatCurrency(selectedProjectFinance.budget) }}</span>
              <span><strong>已用成本：</strong><span style="color: #f56c6c">{{ formatCurrency(selectedProjectFinance.cost)
                  }}</span></span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px">
              <span><strong>预期利润：</strong>
                <span
                  :style="{ color: selectedProjectFinance.expectedProfit >= 0 ? '#67c23a' : '#f56c6c', fontWeight: 'bold' }">
                  {{ formatCurrency(selectedProjectFinance.expectedProfit) }}
                </span>
              </span>
              <span><strong>利润目标：</strong>{{ formatCurrency(selectedProjectFinance.profitTarget) }}</span>
            </div>
            <el-divider style="margin: 8px 0" />
            <div style="color: #909399; font-size: 12px">
              <span v-if="selectedProjectFinance.expectedProfit > 0">
                ✓ 建议奖金金额不超过预期利润 {{ formatCurrency(selectedProjectFinance.expectedProfit) }}
              </span>
              <span v-else style="color: #f56c6c">
                ⚠ 项目当前亏损，请谨慎设置奖金
              </span>
            </div>
          </div>
        </el-alert>

        <el-form-item label="奖金期间" prop="period">
          <el-select v-model="createForm.period" placeholder="请选择奖金期间" style="width: 100%">
            <el-option v-for="period in availablePeriods" :key="period.value" :label="period.label"
              :value="period.value" />
          </el-select>
        </el-form-item>

        <el-form-item label="项目利润" prop="projectProfit">
          <el-input-number v-model="createForm.projectProfit" :min="0" :max="10000000" :step="1000" placeholder="项目利润"
            style="width: 100%" @change="calculateTotalAmount">
            <template #append>元</template>
          </el-input-number>
          <div class="help-text">该项目在指定期间内的利润总额</div>
        </el-form-item>

        <el-form-item label="分配比例" prop="profitRatio">
          <el-slider v-model="createForm.profitRatio" :min="5" :max="50" :step="1" show-stops show-input
            @change="calculateTotalAmount" />
          <div class="help-text">从项目利润中提取多少比例作为奖金池</div>
        </el-form-item>

        <el-form-item label="奖金总额" prop="totalAmount">
          <el-input-number v-model="createForm.totalAmount" :min="100" :max="1000000" :step="100" placeholder="奖金总额"
            style="width: 100%">
            <template #append>元</template>
          </el-input-number>
          <div class="calculation-result">
            <span v-if="createForm.projectProfit && createForm.profitRatio">
              建议金额: {{ formatCurrency(createForm.projectProfit * createForm.profitRatio / 100) }}
            </span>
          </div>
        </el-form-item>

        <el-form-item label="备注">
          <el-input v-model="createForm.remark" type="textarea" :rows="3" placeholder="奖金池创建的备注信息" maxlength="200"
            show-word-limit />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="createPoolDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitCreatePool" :loading="submitting">
            创建奖金池
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 编辑奖金池对话框 -->
    <el-dialog v-model="editPoolDialogVisible" title="编辑项目奖金池" width="600px" @close="resetEditForm">
      <el-alert v-if="editForm.projectId" type="info" :closable="false" style="margin-bottom: 20px">
        <template #title>
          <div style="font-weight: bold; margin-bottom: 10px">项目财务概览</div>
        </template>
        <div style="font-size: 13px">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px">
            <span><strong>项目预算：</strong>{{ formatCurrency(editForm.budget) }}</span>
            <span><strong>已用成本：</strong><span style="color: #f56c6c">{{ formatCurrency(editForm.cost) }}</span></span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px">
            <span><strong>预期利润：</strong>
              <span :style="{ color: editForm.expectedProfit >= 0 ? '#67c23a' : '#f56c6c', fontWeight: 'bold' }">
                {{ formatCurrency(editForm.expectedProfit) }}
              </span>
            </span>
            <span><strong>利润目标：</strong>{{ formatCurrency(editForm.profitTarget) }}</span>
          </div>
          <el-divider style="margin: 8px 0" />
          <div style="color: #909399; font-size: 12px">
            <span v-if="editForm.expectedProfit > 0">
              ✓ 建议奖金金额不超过预期利润 {{ formatCurrency(editForm.expectedProfit) }}
            </span>
            <span v-else style="color: #f56c6c">
              ⚠ 项目当前亏损，请谨慎设置奖金
            </span>
          </div>
        </div>
      </el-alert>
      <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="100px">
        <!-- 项目信息（只读） -->
        <el-form-item label="项目名称">
          <el-input :value="editForm.projectName" readonly style="width: 100%" />
        </el-form-item>

        <el-form-item label="奖金期间">
          <el-input :value="editForm.period" readonly style="width: 100%" />
        </el-form-item>

        <el-form-item label="项目利润" prop="projectProfit">
          <el-input-number v-model="editForm.projectProfit" :min="0" :max="10000000" :step="1000" placeholder="项目利润"
            style="width: 100%" @change="calculateEditTotalAmount">
            <template #append>元</template>
          </el-input-number>
          <div class="help-text">该项目在指定期间内的利润总额</div>
        </el-form-item>

        <el-form-item label="分配比例" prop="profitRatio">
          <el-slider v-model="editForm.profitRatio" :min="5" :max="50" :step="1" show-stops show-input
            @change="calculateEditTotalAmount" />
          <div class="help-text">从项目利润中提取多少比例作为奖金池</div>
        </el-form-item>

        <el-form-item label="奖金总额" prop="totalAmount">
          <el-input-number v-model="editForm.totalAmount" :min="1000" :max="1000000" :step="1000" placeholder="奖金总额"
            style="width: 100%">
            <template #append>元</template>
          </el-input-number>
          <div class="calculation-result">
            <span v-if="editForm.projectProfit && editForm.profitRatio">
              建议金额: {{ formatCurrency(editForm.projectProfit * editForm.profitRatio / 100) }}
            </span>
          </div>
        </el-form-item>

        <el-form-item label="备注">
          <el-input v-model="editForm.description" type="textarea" :rows="3" placeholder="奖金池备注信息" maxlength="200"
            show-word-limit />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editPoolDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEditPool" :loading="submitting">
            保存修改
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 奖金分配详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="项目奖金分配详情" width="1000px">
      <div v-if="selectedPool">
        <!-- 奖金池概况 -->
        <div class="pool-overview">
          <h4>奖金池概况</h4>
          <el-descriptions :column="3" border>
            <el-descriptions-item label="项目名称">
              {{ selectedPool.projectName }}
            </el-descriptions-item>
            <el-descriptions-item label="奖金期间">
              {{ selectedPool.period }}
            </el-descriptions-item>
            <el-descriptions-item label="奖金总额">
              <span class="amount">{{ formatCurrency(selectedPool.totalAmount) }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="成员数量">
              {{ selectedPool.memberCount }}人
            </el-descriptions-item>
            <el-descriptions-item label="平均奖金">
              <span class="amount">
                {{ formatCurrency(selectedPool.memberCount > 0 ? selectedPool.totalAmount / selectedPool.memberCount : 0) }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="getStatusType(selectedPool.status)">
                {{ getStatusLabel(selectedPool.status) }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 成员分配列表 -->
        <div class="allocations-section" v-if="poolAllocations.length > 0">
          <h4>成员分配明细</h4>
          
          <vxe-table :data="poolAllocations" stripe border height="400">
            <vxe-column field="employeeName" title="员工姓名" width="100" fixed="left" />
            <vxe-column field="roleName" title="项目角色" width="100" />
            
            <!-- 权重维度 -->
            <vxe-colgroup title="权重维度" header-align="center">
              <vxe-column field="roleWeight" title="角色权重" width="100">
                <template #default="{ row }">
                  <span>{{ row.roleWeight?.toFixed(2) || '0.00' }}</span>
                </template>
              </vxe-column>
              <vxe-column field="contributionWeight" title="贡献权重" width="100">
                <template #default="{ row }">
                  <span>{{ row.contributionWeight || 100 }}%</span>
                </template>
              </vxe-column>
              <vxe-column field="estimatedWorkload" title="工作量占比" width="110">
                <template #default="{ row }">
                  <span>{{ row.estimatedWorkload || 100 }}%</span>
                </template>
              </vxe-column>
              <vxe-column field="participationRatio" title="参与度" width="90">
                <template #default="{ row }">
                  <span>{{ row.participationRatio || 100 }}%</span>
                </template>
              </vxe-column>
            </vxe-colgroup>
            
            <!-- 计算结果 -->
            <vxe-colgroup title="计算结果" header-align="center">
              <vxe-column field="calculatedWeight" title="成员权重" width="100">
                <template #default="{ row }">
                  <span style="font-weight: bold; color: #409EFF;">{{ row.calculatedWeight?.toFixed(3) || '0.000' }}</span>
                </template>
              </vxe-column>
              <vxe-column field="bonusAmount" title="奖金金额" width="120">
                <template #default="{ row }">
                  <span class="amount" style="font-weight: bold;">{{ formatCurrency(row.bonusAmount) }}</span>
                </template>
              </vxe-column>
            </vxe-colgroup>
            
            <vxe-column field="status" title="状态" width="100" fixed="right">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small">
                  {{ getStatusLabel(row.status) }}
                </el-tag>
              </template>
            </vxe-column>
            
            <!-- 计算过程按钮列 -->
            <vxe-column title="操作" width="100" fixed="right">
              <template #default="{ row }">
                <el-button 
                  type="primary" 
                  size="small" 
                  text
                  @click="showCalculationProcess(row)"
                >
                  计算过程
                </el-button>
              </template>
            </vxe-column>
          </vxe-table>
        </div>
      </div>
    </el-dialog>

    <!-- 计算过程详情对话框 -->
    <el-dialog
      v-model="calculationProcessVisible"
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
            <el-descriptions-item label="项目角色">{{ currentCalculationDetail.roleName }}</el-descriptions-item>
            <el-descriptions-item label="最终奖金">
              <span style="color: #f56c6c; font-weight: bold; font-size: 16px;">
                ¥{{ formatCurrency(currentCalculationDetail.bonusAmount || 0) }}
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
              <strong>成员权重</strong> = 
              <span class="formula-part">角色权重</span> × 
              <span class="formula-part">贡献权重</span> × 
              <span class="formula-part">工作量占比</span> × 
              <span class="formula-part">参与度</span>
            </div>
            <div class="formula-line calculation-result">
              <strong>{{ currentCalculationDetail.calculatedWeight?.toFixed(3) }}</strong> = 
              <span class="value">{{ currentCalculationDetail.roleWeight?.toFixed(2) }}</span> × 
              <span class="value">{{ (currentCalculationDetail.contributionWeight || 100) }}%</span> × 
              <span class="value">{{ (currentCalculationDetail.estimatedWorkload || 100) }}%</span> × 
              <span class="value">{{ (currentCalculationDetail.participationRatio || 100) }}%</span>
            </div>
            <el-divider />
            <div class="formula-line main-formula">
              <strong>成员奖金</strong> = 
              <span class="formula-part">项目奖金池</span> × 
              <span class="formula-part">(成员权重 / 所有成员权重之和)</span>
            </div>
            <div class="formula-line calculation-result">
              <strong>{{ formatCurrency(currentCalculationDetail.bonusAmount || 0) }}</strong> = 
              <span class="value">{{ formatCurrency(selectedPool?.totalAmount || 0) }}</span> × 
              <span class="value">({{ currentCalculationDetail.calculatedWeight?.toFixed(3) }} / {{ totalWeight?.toFixed(3) }})</span>
            </div>
          </div>
        </el-card>

        <!-- 系数详细说明 -->
        <el-card class="coefficients-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>📊 权重参数详细说明</span>
            </div>
          </template>
          <el-row :gutter="20">
            <el-col :span="6">
              <div class="coefficient-item">
                <div class="coef-label">🎯 角色权重</div>
                <div class="coef-value">{{ currentCalculationDetail.roleWeight?.toFixed(2) }}</div>
                <div class="coef-desc">{{ currentCalculationDetail.roleName }}的基础权重</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="coefficient-item">
                <div class="coef-label">💡 贡献权重</div>
                <div class="coef-value" :class="(currentCalculationDetail.contributionWeight || 100) >= 100 ? 'positive' : 'normal'">
                  {{ currentCalculationDetail.contributionWeight || 100 }}%
                </div>
                <div class="coef-desc">实际贡献比例（0-100%）</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="coefficient-item">
                <div class="coef-label">⚙️ 工作量占比</div>
                <div class="coef-value" :class="(currentCalculationDetail.estimatedWorkload || 100) >= 100 ? 'positive' : 'normal'">
                  {{ currentCalculationDetail.estimatedWorkload || 100 }}%
                </div>
                <div class="coef-desc">时间投入比例（1-100%）</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="coefficient-item">
                <div class="coef-label">👥 参与度</div>
                <div class="coef-value" :class="(currentCalculationDetail.participationRatio || 100) >= 100 ? 'positive' : 'normal'">
                  {{ currentCalculationDetail.participationRatio || 100 }}%
                </div>
                <div class="coef-desc">实际参与时间占比（0-100%）</div>
              </div>
            </el-col>
          </el-row>
          <el-row :gutter="20" style="margin-top: 20px;">
            <el-col :span="12">
              <div class="coefficient-item highlight">
                <div class="coef-label">✨ 最终成员权重</div>
                <div class="coef-value final">{{ currentCalculationDetail.calculatedWeight?.toFixed(3) }}</div>
                <div class="coef-desc">应用所有系数后的权重</div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="coefficient-item highlight">
                <div class="coef-label">💰 权重分配比例</div>
                <div class="coef-value final">{{ ((currentCalculationDetail.calculatedWeight / totalWeight) * 100).toFixed(2) }}%</div>
                <div class="coef-desc">在全部成员中的权重占比</div>
              </div>
            </el-col>
          </el-row>
        </el-card>

        <!-- 计算逻辑说明 -->
        <el-card class="notes-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>📝 计算说明</span>
            </div>
          </template>
          <el-alert type="info" :closable="false">
            <template #default>
              <div style="line-height: 1.8;">
                <h4 style="margin: 0 0 12px 0;">项目奖金计算公式</h4>
                <p><strong>成员权重</strong> = 角色权重 × 贡献权重 × 工作量占比 × 参与度</p>
                <p><strong>成员奖金</strong> = 项目奖金池 × (成员权重 / 总权重)</p>
                <div style="margin-top: 12px; padding: 8px 12px; background-color: #f0f9ff; border-left: 3px solid #409eff; border-radius: 4px;">
                  <p style="margin: 0; color: #606266;">
                    <strong>💡 说明：</strong>项目奖金基于项目贡献进行分配，<strong>不使用绩效系数调整</strong>，确保项目激励的公平性和针对性。项目奖金已经通过角色权重、贡献权重、工作量占比进行了充分的差异化，无需再使用绩效系数进行双重调整。
                  </p>
                </div>
                <div style="margin-top: 12px; color: #909399; font-size: 13px;">
                  <p style="margin: 4px 0;"><strong>计算步骤：</strong></p>
                  <p style="margin: 4px 0;"><strong>步骤1：</strong>计算每个成员的权重</p>
                  <p style="margin: 4px 0;"><strong>步骤2：</strong>汇总所有成员的权重得到总权重 = {{ totalWeight?.toFixed(3) }}</p>
                  <p style="margin: 4px 0;"><strong>步骤3：</strong>按权重比例分配奖金</p>
                </div>
              </div>
            </template>
          </el-alert>
        </el-card>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="calculationProcessVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 计算历史记录对话框 -->
    <el-dialog v-model="historyDialogVisible" title="奖金计算历史记录" width="1200px">
      <div v-if="selectedPool">
        <el-alert type="info" :closable="false" style="margin-bottom: 20px">
          <template #title>
            <strong>项目：</strong>{{ selectedPool.projectName }} |
            <strong>期间：</strong>{{ selectedPool.period }} |
            <strong>奖金总额：</strong>{{ formatCurrency(selectedPool.totalAmount) }}
          </template>
        </el-alert>

        <vxe-table :data="calculationHistories" stripe border height="500">
          <vxe-column field="calculationNumber" title="计算次数" width="100" fixed="left">
            <template #default="scope">
              <div v-if="scope?.row" style="display: flex; align-items: center; gap: 8px">
                <span style="font-weight: bold; color: #409EFF">第{{ scope.row.calculationNumber }}次</span>
                <el-tag v-if="scope.row.isCurrent" type="success" size="small">当前</el-tag>
              </div>
            </template>
          </vxe-column>

          <vxe-column field="calculatedAt" title="计算时间" width="180">
            <template #default="scope">
              <span v-if="scope?.row">{{ formatDate(scope.row.calculatedAt) }}</span>
            </template>
          </vxe-column>

          <vxe-column field="totalAmount" title="奖金总额" width="130">
            <template #default="scope">
              <span v-if="scope?.row" class="amount">{{ formatCurrency(scope.row.totalAmount) }}</span>
            </template>
          </vxe-column>

          <vxe-column field="memberCount" title="成员数量" width="100">
            <template #default="scope">
              <span v-if="scope?.row">{{ scope.row.memberCount }}人</span>
            </template>
          </vxe-column>

          <vxe-column field="totalWeight" title="总权重" width="120">
            <template #default="scope">
              <span v-if="scope?.row">{{ scope.row.totalWeight?.toFixed(2) }}</span>
            </template>
          </vxe-column>

          <vxe-column title="平均奖金" width="130">
            <template #default="scope">
              <span v-if="scope?.row" class="amount">
                {{ formatCurrency(scope.row.memberCount > 0 ? scope.row.totalAmount / scope.row.memberCount : 0) }}
              </span>
            </template>
          </vxe-column>

          <vxe-column field="calculatorName" title="计算人" width="120">
            <template #default="scope">
              <span v-if="scope?.row">{{ scope.row.calculatorName || '未知' }}</span>
            </template>
          </vxe-column>

          <vxe-column field="notes" title="备注" min-width="150" />

          <vxe-column title="操作" width="150" fixed="right">
            <template #default="scope">
              <el-button v-if="scope?.row" type="primary" size="small" text @click="viewHistoryDetail(scope.row)">
                查看明细
              </el-button>
            </template>
          </vxe-column>
        </vxe-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, ElPopover } from 'element-plus'
import { Plus, Refresh, Loading, QuestionFilled } from '@element-plus/icons-vue'
import { projectApi } from '@/api/project'
import { formatCurrency, formatDate } from '@/utils/format'
import * as projectBonusApi from '@/api/projectBonus'
import { generateProjectPeriodOptions } from '@/utils/periodUtils'

// 路由实例
const router = useRouter()

// 数据定义
const loading = ref(false)
const submitting = ref(false)
const poolList = ref([])
const allProjects = ref([])

const availablePeriods = ref(generateProjectPeriodOptions())

// 查询表单
const queryForm = reactive({
  projectId: '',
  period: '',
  status: ''
})

// 创建奖金池对话框
const createPoolDialogVisible = ref(false)
const createFormRef = ref()
const createForm = reactive({
  projectId: '',
  period: '',
  projectProfit: 0,
  profitRatio: 20,
  totalAmount: 0,
  remark: ''
})

// 选中项目的财务信息
const selectedProjectFinance = ref({
  budget: 0,
  cost: 0,
  expectedProfit: 0,
  profitTarget: 0
})

const createFormRules = {
  projectId: [
    { required: true, message: '请选择项目', trigger: 'change' }
  ],
  period: [
    { required: true, message: '请选择奖金期间', trigger: 'change' }
  ],
  projectProfit: [
    { required: true, message: '请输入项目利润', trigger: 'blur' },
    { type: 'number', min: 0, message: '项目利润不能小于0', trigger: 'blur' }
  ],
  totalAmount: [
    { required: true, message: '请输入奖金总额', trigger: 'blur' },
    { type: 'number', min: 1000, message: '奖金总额不能小于1000元', trigger: 'blur' }
  ]
}

// 编辑奖金池对话框
const editPoolDialogVisible = ref(false)
const editFormRef = ref()
const editForm = reactive({
  _id: '',
  projectId: '',
  projectName: '',
  period: '',
  projectProfit: null,
  profitRatio: 20,
  totalAmount: null,
  description: '',
  budget: 0,
  cost: 0,
  expectedProfit: 0,
  profitTarget: 0
})

const editFormRules = {
  projectProfit: [
    { required: true, message: '项目利润不能为空', trigger: 'blur' },
    { type: 'number', min: 0, message: '项目利润不能小于0', trigger: 'blur' }
  ],
  profitRatio: [
    { required: true, message: '分配比例不能为空', trigger: 'blur' },
    { type: 'number', min: 5, max: 50, message: '分配比例应在5%-50%之间', trigger: 'blur' }
  ],
  totalAmount: [
    { required: true, message: '奖金总额不能为空', trigger: 'blur' },
    { type: 'number', min: 1000, message: '奖金总额不能小于1000元', trigger: 'blur' }
  ]
}

// 详情对话框
const detailDialogVisible = ref(false)
const selectedPool = ref(null)
const poolAllocations = ref([])

// 历史记录对话框
const historyDialogVisible = ref(false)
const calculationHistories = ref([])

// 计算过程详情对话框
const calculationProcessVisible = ref(false)
const currentCalculationDetail = ref({})
const totalWeight = ref(0)

// 状态映射
const getStatusType = (status) => {
  const types = {
    pending: 'warning',
    calculated: 'primary',
    approved: 'success',
    distributed: 'info'
  }
  return types[status] || 'info'
}

const getStatusLabel = (status) => {
  const labels = {
    pending: '待计算',
    calculated: '已计算',
    approved: '已审批',
    distributed: '已发放'
  }
  return labels[status] || '未知'
}

// 方法定义
const loadPoolList = async () => {
  try {
    loading.value = true

    const queryParams = {
      projectId: queryForm.projectId || undefined,
      period: queryForm.period || undefined,
      status: queryForm.status || undefined
    }

    const response = await projectBonusApi.getBonusPools(queryParams)
    poolList.value = response.data.data || []

    // 备用模拟数据（如果API失败）
    if (!response.data || response.data.length === 0) {
      // 模拟数据
      poolList.value = [
        {
          _id: '1',
          projectId: 'proj1',
          projectName: '电商平台升级',
          projectCode: 'PROJ001',
          period: '2024Q4',
          totalAmount: 100000,
          profitRatio: 0.2,
          projectProfit: 500000,
          memberCount: 8,
          status: 'pending',
          createdAt: new Date()
        }
      ]
    }
  } catch (error) {
    ElMessage.error('加载奖金池列表失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

const loadAllProjects = async () => {
  try {

    const response = await projectApi.getProjects({ pageSize: 1000, manager: true })


    // 验证返回的数据格式
    if (response && response.data) {
      let projectsData = response.data.list
      if (Array.isArray(projectsData)) {
        // 过滤掉没有id字段的项目，确保数据完整性（同时兼容 id 和 _id）
        allProjects.value = projectsData.filter(project => {
          const projectId = project?.id || project?._id
          return project && projectId && typeof projectId === 'string' && projectId.trim() !== ''
        })


      } else {

        allProjects.value = []
      }
    } else {

      allProjects.value = []
    }

    if (allProjects.value.length === 0) {

      ElMessage.warning('没有可管理的项目，请联系管理员')
    }
  } catch (error) {

    ElMessage.error('加载项目列表失败: ' + error.message)
    allProjects.value = []
  }
}

// 操作方法
const handleSearch = () => {
  loadPoolList()
}

const refreshList = () => {
  handleSearch()
}

const showCreatePoolDialog = () => {
  resetCreateForm()
  createPoolDialogVisible.value = true
}

const resetCreateForm = () => {
  Object.assign(createForm, {
    projectId: '',
    period: '',
    projectProfit: 0,
    profitRatio: 20,
    totalAmount: 0,
    remark: ''
  })
  // 重置财务信息
  selectedProjectFinance.value = {
    budget: 0,
    cost: 0,
    expectedProfit: 0,
    profitTarget: 0
  }
  createFormRef.value?.resetFields()
}

const handleProjectChange = async (projectId) => {
  // 项目变更时加载该项目的财务数据

  if (!projectId) {
    // 清空财务信息
    selectedProjectFinance.value = {
      budget: 0,
      cost: 0,
      expectedProfit: 0,
      profitTarget: 0
    }
    return
  }

  try {
    // 获取项目详情获取财务数据
    const response = await projectApi.getProject(projectId)
    const project = response.data

    // 更新财务信息
    const budget = project.budget || 0
    const cost = project.cost || 0
    const expectedProfit = budget - cost
    const profitTarget = project.profitTarget || 0

    selectedProjectFinance.value = {
      budget,
      cost,
      expectedProfit,
      profitTarget
    }
  } catch (error) {

    ElMessage.error('获取项目财务数据失败')
  }
}

const calculateTotalAmount = () => {
  if (createForm.projectProfit && createForm.profitRatio) {
    createForm.totalAmount = Math.round(createForm.projectProfit * createForm.profitRatio / 100)
  }
}

const submitCreatePool = async () => {
  try {
    const valid = await createFormRef.value.validate()
    if (!valid) return

    // 获取项目财务数据进行奖金金额范围检查
    const response = await projectApi.getProject(createForm.projectId)
    const project = response.data
    const budget = project.budget || 0
    const cost = project.cost || 0
    const expectedProfit = budget - cost

    // 检查奖金金额是否超过预期利润
    if (createForm.totalAmount > expectedProfit) {
      const confirmResult = await ElMessageBox.confirm(
        `奖金金额 ${formatCurrency(createForm.totalAmount)} 超过了项目预期利润 ${formatCurrency(expectedProfit)}，是否继续创建？`,
        '奖金金额超出预期利润',
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

    // 检查奖金金额是否超过预算（更严格的检查）
    if (createForm.totalAmount > budget) {
      ElMessage.error(`奖金金额不能超过项目预算 ${formatCurrency(budget)}`)
      return
    }

    submitting.value = true
    await projectBonusApi.createBonusPool({
      projectId: createForm.projectId,
      period: createForm.period,
      totalAmount: createForm.totalAmount,
      profitRatio: createForm.profitRatio / 100,
      projectProfit: createForm.projectProfit,
      remark: createForm.remark
    })

    ElMessage.success('奖金池创建成功')
    createPoolDialogVisible.value = false
    await loadPoolList()

  } catch (error) {
    if (error !== 'cancel' && error.message) {
      ElMessage.error('创建失败: ' + error.message)
    }
  } finally {
    submitting.value = false
  }
}

const calculateBonus = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要计算项目 "${row.projectName}" 的奖金分配吗？`,
      '计算奖金分配',
      { type: 'warning' }
    )

    await projectBonusApi.calculateBonus(row._id)
    ElMessage.success('奖金计算完成')
    await loadPoolList()

  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('计算失败: ' + error.message)
    }
  }
}

const approveBonus = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要审批项目 "${row.projectName}" 的奖金分配吗？`,
      '审批奖金分配',
      { type: 'warning' }
    )

    await projectBonusApi.approveBonus(row._id)
    ElMessage.success('奖金分配已审批')
    await loadPoolList()

  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('审批失败: ' + error.message)
    }
  }
}

const viewDetails = async (row) => {
  try {
    selectedPool.value = row
    const response = await projectBonusApi.getBonusDetails(row.projectId, row.period)

    poolAllocations.value = response.data.data.allocations || []

    detailDialogVisible.value = true
  } catch (error) {
    ElMessage.error('获取详情失败: ' + error.message)
  }
}

// 重新计算奖金
const recalculateBonus = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要重新计算项目“${row.projectName}”的奖金分配吗？\n` +
      `旧的计算结果将被保存到历史记录中，并生成新的分配方案。`,
      '重新计算确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    loading.value = true
    const response = await projectBonusApi.calculateBonus(row._id)

    if (response.data.success) {
      ElMessage.success('奖金重新计算成功！')
      await loadPoolList()
    } else {
      throw new Error(response.data.message || '计算失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('重新计算失败: ' + (error.message || error))
    }
  } finally {
    loading.value = false
  }
}

// 查看计算历史
const viewHistory = async (row) => {
  try {
    loading.value = true
    const response = await projectBonusApi.getCalculationHistory(row._id)

    if (response.data.success) {
      const histories = response.data.data || []

      if (histories.length === 0) {
        ElMessage.info('暂无计算历史记录')
        return
      }

      // 显示历史记录对话框
      historyDialogVisible.value = true
      calculationHistories.value = histories
      selectedPool.value = row
    } else {
      throw new Error(response.data.message || '获取失败')
    }
  } catch (error) {
    ElMessage.error('获取计算历史失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

// 显示计算过程详情
const showCalculationProcess = (allocation) => {
  // 计算总权重（所有成员的calculatedWeight之和）
  const allAllocations = poolAllocations.value
  totalWeight.value = allAllocations.reduce((sum, a) => {
    const roleWeight = parseFloat(a.roleWeight) || 0
    const contributionWeight = parseFloat(a.contributionWeight) || 100
    const estimatedWorkload = parseFloat(a.estimatedWorkload) || 100
    const participationRatio = parseFloat(a.participationRatio) || 100
    
    // 成员权重 = 角色权重 × 贡献权重% × 工作量占比% × 参与度%
    const weight = roleWeight * (contributionWeight / 100) * (estimatedWorkload / 100) * (participationRatio / 100)
    return sum + weight
  }, 0)

  currentCalculationDetail.value = {
    ...allocation
  }
  
  calculationProcessVisible.value = true
}

// 查看历史明细
const viewHistoryDetail = (history) => {
  try {
    if (!history.calculationData) {
      ElMessage.warning('该记录没有详细数据')
      return
    }
    selectedPool.value = {
      ...selectedPool.value,
      ...history
    }
    // 解析JSON数据
    let allocations = []
    if (typeof history.calculationData === 'string') {
      allocations = JSON.parse(history.calculationData)
    } else {
      allocations = history.calculationData
    }
    console.log(allocations)
    // 显示详细对话框
    poolAllocations.value = allocations
    historyDialogVisible.value = false // 关闭历史列表
    detailDialogVisible.value = true // 打开详情对话框
  } catch (error) {
    ElMessage.error('解析历史数据失败: ' + error.message)
  }
}

const exportReport = async (row) => {
  try {
    // TODO: 实现导出功能
    ElMessage.success('导出功能开发中')
  } catch (error) {
    ElMessage.error('导出失败: ' + error.message)
  }
}

// 显示编辑对话框
const showEditDialog = async (row) => {
  // 复制数据到编辑表单
  Object.assign(editForm, {
    _id: row._id,
    projectId: row.projectId,
    projectName: row.projectName,
    period: row.period,
    projectProfit: row.project_profit,
    profitRatio: (row.profitRatio || 0.2) * 100,
    totalAmount: row.totalAmount,
    description: row.description || ''
  })

  // 加载项目财务数据
  if (row.projectId) {
    try {
      const response = await projectApi.getProject(row.projectId)
      const project = response.data

      // 更新财务信息
      const budget = project.budget || 0
      const cost = project.cost || 0
      const expectedProfit = budget - cost
      const profitTarget = project.profitTarget || 0

      // 将财务数据添加到editForm
      Object.assign(editForm, {
        budget,
        cost,
        expectedProfit,
        profitTarget
      })
    } catch (error) {
      console.error('获取项目财务数据失败:', error)
      ElMessage.error('获取项目财务数据失败')
    }
  }

  editPoolDialogVisible.value = true
}

// 重置编辑表单
const resetEditForm = () => {
  Object.assign(editForm, {
    _id: '',
    projectId: '',
    projectName: '',
    period: '',
    projectProfit: null,
    profitRatio: 20,
    totalAmount: null,
    description: '',
    budget: 0,
    cost: 0,
    expectedProfit: 0,
    profitTarget: 0
  })

  if (editFormRef.value) {
    editFormRef.value.resetFields()
  }
}

// 计算编辑表单的奖金总额
const calculateEditTotalAmount = () => {
  if (editForm.projectProfit !== null && editForm.profitRatio) {
    editForm.totalAmount = Math.round(editForm.projectProfit * editForm.profitRatio / 100)
  }
}

// 提交编辑表单
const submitEditPool = async () => {
  if (!editFormRef.value) return

  try {
    await editFormRef.value.validate()

    // 获取项目财务数据进行奖金金额范围检查
    const response = await projectApi.getProject(editForm.projectId)
    const project = response.data
    const budget = project.budget || 0
    const cost = project.cost || 0
    const expectedProfit = budget - cost

    // 检查奖金金额是否超过预期利润
    if (editForm.totalAmount > expectedProfit) {
      const confirmResult = await ElMessageBox.confirm(
        `奖金金额 ${formatCurrency(editForm.totalAmount)} 超过了项目预期利润 ${formatCurrency(expectedProfit)}，是否继续编辑？`,
        '奖金金额超出预期利润',
        {
          type: 'warning',
          confirmButtonText: '继续编辑',
          cancelButtonText: '重新调整'
        }
      ).catch(() => false)

      if (!confirmResult) {
        return
      }
    }

    // 检查奖金金额是否超过预算（更严格的检查）
    if (editForm.totalAmount > budget) {
      ElMessage.error(`奖金金额不能超过项目预算 ${formatCurrency(budget)}`)
      return
    }

    submitting.value = true

    const updateData = {
      totalAmount: editForm.totalAmount,
      profitRatio: editForm.profitRatio / 100,
      projectProfit: editForm.projectProfit,
      description: editForm.description
    }

    // 调用编辑API
    await projectBonusApi.updateBonusPool(editForm._id, updateData)

    ElMessage.success('奖金池编辑成功')
    editPoolDialogVisible.value = false
    await loadPoolList()

  } catch (error) {
    if (error.message) {
      ElMessage.error('编辑失败: ' + error.message)
    }
  } finally {
    submitting.value = false
  }
}

// 删除奖金池
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除项目"${row.projectName}"在${row.period}期间的奖金池吗？\n` +
      `奖金总额：${formatCurrency(row.totalAmount)}\n` +
      `注意：此操作不可恢复！`,
      '确认删除',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: false
      }
    )

    // 调用删除API
    await projectBonusApi.deleteBonusPool(row._id)

    ElMessage.success('奖金池删除成功')
    await loadPoolList()

  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败: ' + (error.message || error))
    }
  }
}

// 跳转到手动录入页面
const goToManualInput = (row) => {
  router.push({
    path: '/project/ProjectPerformanceManual',
    query: { poolId: row._id }
  })
}

// 生命周期
onMounted(async () => {
  await loadAllProjects()
  await loadPoolList()
})
</script>

<style scoped>
.function-intro {
  margin-bottom: 20px;
}

.info-alert {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.intro-content {
  font-size: 14px;
  line-height: 1.6;
}

.formula-section,
.coefficients-section,
.navigation-section {
  margin: 12px 0;
  padding: 10px;
  background-color: rgba(235, 245, 255, 0.3);
  border-radius: 4px;
}

.formula-section h4,
.coefficients-section h4,
.navigation-section h4 {
  margin: 0 0 8px 0;
  font-size: 15px;
  color: #409EFF;
  font-weight: 600;
}

.intro-content ul {
  margin: 8px 0;
  padding-left: 20px;
}

.intro-content li {
  margin-bottom: 4px;
}

.intro-content p {
  margin: 8px 0;
}

.intro-content strong {
  color: #303133;
}

.project-bonus-management {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.filter-section {
  margin-bottom: 20px;
}

.table-section {
  margin-top: 20px;
}

.amount {
  font-weight: 600;
  color: #e6a23c;
}

.project-info {
  display: flex;
  flex-direction: column;
}

.project-name {
  font-weight: 600;
}

.project-code {
  font-size: 12px;
  color: #909399;
}

.dialog-footer {
  text-align: right;
}

.help-text {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.calculation-result {
  font-size: 12px;
  color: #67c23a;
  margin-top: 5px;
}

.pool-overview {
  margin-bottom: 20px;
}

.allocations-section {
  margin-top: 20px;
}

.loading-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: #909399;
}
</style>
<style>
.filter-section {
  background: white;
  padding: 16px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.table-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.project-info .project-name {
  font-weight: 500;
  color: #303133;
}

.project-info .project-code {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

.amount {
  color: #67c23a;
  font-weight: 500;
}

.help-text {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
  line-height: 1.4;
}

.calculation-result {
  margin-top: 8px;
  font-size: 14px;
  color: #409eff;
}

.pool-overview {
  margin-bottom: 24px;
}

.pool-overview h4 {
  margin-bottom: 16px;
  color: #303133;
}

.allocations-section h4 {
  margin-bottom: 16px;
  color: #303133;
}

/* 功能说明样式 */
.function-intro {
  margin-bottom: 20px;
}

.info-alert {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.intro-content {
  font-size: 14px;
  line-height: 1.6;
}

.formula-section,
.coefficients-section,
.navigation-section {
  margin: 12px 0;
  padding: 10px;
  background-color: rgba(235, 245, 255, 0.3);
  border-radius: 4px;
}

.formula-section h4,
.coefficients-section h4,
.navigation-section h4 {
  margin: 0 0 8px 0;
  font-size: 15px;
  color: #409EFF;
  font-weight: 600;
}

.intro-content ul {
  margin: 8px 0;
  padding-left: 20px;
}

.intro-content li {
  margin-bottom: 4px;
}

.intro-content p {
  margin: 8px 0;
}

.intro-content strong {
  color: #303133;
}

/* 计算过程详情样式 */
.calculation-detail-container {
  max-height: 70vh;
  overflow-y: auto;
}

.info-card,
.formula-card,
.coefficients-card,
.notes-card {
  margin-bottom: 20px;
}

.card-header {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.formula-content {
  padding: 10px 0;
}

.formula-line {
  padding: 12px;
  margin: 8px 0;
  border-radius: 6px;
  background: #f5f7fa;
  text-align: center;
  font-size: 14px;
}

.formula-line.main-formula {
  background: #ecf5ff;
  border-left: 4px solid #409eff;
  font-size: 15px;
}

.formula-line.calculation-result {
  background: #f0f9ff;
  border-left: 4px solid #67c23a;
  font-weight: 500;
  font-size: 16px;
}

.formula-part {
  padding: 4px 8px;
  margin: 0 4px;
  background: white;
  border-radius: 4px;
  color: #409eff;
  font-weight: 500;
}

.formula-line .value {
  padding: 4px 10px;
  margin: 0 4px;
  background: #fff;
  border-radius: 4px;
  color: #67c23a;
  font-weight: bold;
  font-size: 16px;
}

.coefficient-item {
  text-align: center;
  padding: 20px;
  background: #fafbfc;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  transition: all 0.3s;
}

.coefficient-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.coefficient-item.highlight {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.coefficient-item.highlight .coef-label,
.coefficient-item.highlight .coef-desc {
  color: white;
}

.coef-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 12px;
  font-weight: 500;
}

.coef-value {
  font-size: 24px;
  font-weight: bold;
  margin: 8px 0;
}

.coef-value.positive {
  color: #67c23a;
}

.coef-value.normal {
  color: #409eff;
}

.coef-value.negative {
  color: #f56c6c;
}

.coef-value.final {
  color: #fff;
  font-size: 28px;
}

.coef-desc {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}
</style>
