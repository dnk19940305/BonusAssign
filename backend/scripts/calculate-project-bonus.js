const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

async function calculateProjectBonus() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'rootpassword',
    database: process.env.DB_NAME || 'bonus_system'
  });

  try {

    // 读取之前创建的数据
    const setupData = JSON.parse(fs.readFileSync('setup-workflow-result.json', 'utf8'));
    const projectId = setupData.project.id;
    const pmEmployeeId = setupData.projectManager.employeeId;
    const empEmployeeId = setupData.employee.employeeId;


    // 定义期间
    const period = '2025Q2'; // 2025年第二季度

    // 检查是否已存在奖金池
    const [existingPools] = await connection.execute(
      `SELECT id, period, total_amount, profit_ratio, status FROM project_bonus_pools
       WHERE project_id = ? AND period = ?`,
      [projectId, period]
    );

    let poolId;
    let totalAmount;
    let profitRatio;

    if (existingPools.length > 0) {
      poolId = existingPools[0].id;
      totalAmount = parseFloat(existingPools[0].total_amount);
      profitRatio = parseFloat(existingPools[0].profit_ratio);


      // 删除现有的分配记录以重新计算
      await connection.execute(
        'DELETE FROM project_bonus_allocations WHERE pool_id = ?',
        [poolId]
      );
    } else {
      // 创建项目奖金池
      poolId = uuidv4();
      const period = '2025Q2'; // 2025年第二季度
      totalAmount = 100000; // 总奖金池10万元
      profitRatio = 20.5; // 利润率20.5%

      // 获取管理员用户ID (作为创建者)
      const [adminUsers] = await connection.execute(
        `SELECT u.id FROM users u
         JOIN roles r ON u.role_id = r.id
         WHERE r.name LIKE '%管理%' LIMIT 1`
      );
      const adminUserId = adminUsers[0].id;

      await connection.execute(
        `INSERT INTO project_bonus_pools (id, project_id, period, total_amount, profit_ratio, status, description, created_by, approved_by, approved_at, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())`,
        [
          poolId,
          projectId,
          period,
          totalAmount,
          profitRatio,
          'approved',
          '客户管理系统开发项目Q2奖金池，根据项目利润和团队贡献度分配',
          adminUserId,
          adminUserId
        ]
      );
    }


    // 获取项目成员信息
    const [members] = await connection.execute(
      `SELECT
        pm.id, pm.employee_id, pm.role, pm.contribution_weight, pm.participation_ratio,
        e.name, e.employee_no, e.annual_salary,
        p.name as position_name, p.benchmark_value
       FROM project_members pm
       JOIN employees e ON pm.employee_id = e.id
       LEFT JOIN positions p ON e.position_id = p.id
       WHERE pm.project_id = ? AND pm.status = 'approved'`,
      [projectId]
    );

    console.log(`Found ${members.length} approved members:`);
    members.forEach(m => {
      console.log(`  - ${m.name} (${m.employee_no})`);
      console.log(`    Role: ${m.role}`);
      console.log(`    Position: ${m.position_name}`);
      console.log(`    Benchmark Value: ¥${(m.benchmark_value || 0).toLocaleString()}`);
      console.log(`    Contribution Weight: ${m.contribution_weight}`);
      console.log(`    Participation Ratio: ${m.participation_ratio || 1.0}`);
    });

    console.log('\n=== Step 3: Calculating Bonus Allocation ===\n');

    // 计算奖金分配
    // 简化的计算逻辑:
    // 1. 基础分配 = 贡献权重(%) * 参与比例(%)
    // 2. 绩效系数根据角色设定(经理1.2, 普通成员1.0)
    // 3. 最终奖金 = (基础分配 / 总权重) * 奖金池 * 绩效系数
    // 注意: 贡献权重和参与比例都以百分比形式存储和计算

    const allocations = [];
    let totalWeight = 0;

    // 计算总权重
    members.forEach(m => {
      // 贡献权重和参与比例都是百分比(0-100)
      const contributionWeight = parseFloat(m.contribution_weight) || 100;
      const participationRatio = parseFloat(m.participation_ratio) || 100;
      const weight = contributionWeight * participationRatio / 100; // 除以100转换百分比
      totalWeight += weight;
    });

    console.log(`Total Weight: ${totalWeight.toFixed(2)}`);
    console.log();

    // 为每个成员计算奖金
    for (const member of members) {
      // 贡献权重和参与比例都是百分比(0-100)
      const contributionWeight = parseFloat(member.contribution_weight) || 100;
      const participationRatio = parseFloat(member.participation_ratio) || 100;
      const performanceCoeff = member.role === 'manager' ? 1.2 : 1.0; // 经理绩效系数更高

      const baseWeight = contributionWeight * participationRatio / 100; // 除以100转换百分比
      const bonusAmount = (baseWeight / totalWeight) * totalAmount * performanceCoeff;

      const allocationId = uuidv4();

      await connection.execute(
        `INSERT INTO project_bonus_allocations (id, pool_id, employee_id, role_weight, performance_coeff, participation_ratio, bonus_amount, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          allocationId,
          poolId,
          member.employee_id,
          contributionWeight, // 以百分比形式保存
          performanceCoeff,
          participationRatio, // 以百分比形式保存
          bonusAmount,
          'calculated'
        ]
      );

      allocations.push({
        name: member.name,
        employeeNo: member.employee_no,
        role: member.role,
        roleWeight: contributionWeight, // 百分比形式
        participationRatio, // 百分比形式
        performanceCoeff,
        bonusAmount: bonusAmount.toFixed(2)
      });

      console.log(`✓ Allocated bonus for ${member.name}`);
      console.log(`  Contribution Weight: ${contributionWeight}%`);
      console.log(`  Participation Ratio: ${participationRatio}%`);
      console.log(`  Performance Coefficient: ${performanceCoeff}`);
      console.log(`  Bonus Amount: ¥${bonusAmount.toFixed(2)}`);
      console.log();
    }

    console.log('=== Step 4: Bonus Allocation Summary ===\n');

    // 汇总信息
    const totalAllocated = allocations.reduce((sum, a) => sum + parseFloat(a.bonusAmount), 0);

    console.log('Bonus Allocation Results:');
    console.log('─'.repeat(80));
    console.log(`${'Name'.padEnd(15)} ${'Employee No'.padEnd(20)} ${'Role'.padEnd(12)} ${'Bonus Amount'.padStart(15)}`);
    console.log('─'.repeat(80));

    allocations.forEach(a => {
      console.log(
        `${a.name.padEnd(15)} ${a.employeeNo.padEnd(20)} ${a.role.padEnd(12)} ¥${parseFloat(a.bonusAmount).toLocaleString().padStart(12)}`
      );
    });

    console.log('─'.repeat(80));
    console.log(`${'Total Allocated:'.padEnd(48)} ¥${totalAllocated.toLocaleString().padStart(12)}`);
    console.log(`${'Bonus Pool:'.padEnd(48)} ¥${totalAmount.toLocaleString().padStart(12)}`);
    console.log(`${'Remaining:'.padEnd(48)} ¥${(totalAmount - totalAllocated).toFixed(2).padStart(12)}`);
    console.log('─'.repeat(80));

    // 验证查询
    console.log('\n=== Step 5: Verifying Bonus Records ===\n');

    const [verifyResults] = await connection.execute(
      `SELECT
        pba.bonus_amount, pba.role_weight, pba.performance_coeff, pba.participation_ratio,
        e.name, e.employee_no,
        pbp.period, pbp.total_amount as pool_amount
       FROM project_bonus_allocations pba
       JOIN employees e ON pba.employee_id = e.id
       JOIN project_bonus_pools pbp ON pba.pool_id = pbp.id
       WHERE pba.pool_id = ?`,
      [poolId]
    );

    console.log('✓ Verified records in database:');
    verifyResults.forEach(r => {
      console.log(`  - ${r.name}: ¥${parseFloat(r.bonus_amount).toFixed(2)} (Period: ${r.period})`);
    });

    console.log('\n=== Summary ===\n');
    console.log('✓ Project bonus pool created successfully');
    console.log('✓ Bonus allocated to all project members');
    console.log('✓ Records saved to database');
    console.log();
    console.log('Next Steps:');
    console.log('  1. Login to frontend as project manager or employee');
    console.log('  2. View personal bonus details in "个人奖金" section');
    console.log('  3. Check project bonus reports in "项目奖金" section');
    console.log();
    console.log('Login Credentials:');
    console.log(`  Project Manager: ${setupData.projectManager.username} / ${setupData.projectManager.password}`);
    console.log(`  Employee: ${setupData.employee.username} / ${setupData.employee.password}`);
    console.log();
    console.log('Frontend URL: http://localhost:8080');

    // 保存奖金分配结果
    const bonusResult = {
      poolId,
      period,
      totalAmount,
      profitRatio,
      allocations,
      totalAllocated: totalAllocated.toFixed(2),
      remaining: (totalAmount - totalAllocated).toFixed(2)
    };

    fs.writeFileSync(
      'bonus-allocation-result.json',
      JSON.stringify(bonusResult, null, 2)
    );
    console.log('✓ Bonus allocation results saved to: bonus-allocation-result.json');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await connection.end();
  }
}

calculateProjectBonus();
