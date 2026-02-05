/**
 * 初始化项目角色数据脚本
 */
require('dotenv').config();
const path = require('path');
const fs = require('fs');

// 设置环境变量，模拟Express应用上下文
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// 动态构建路径，避免Windows路径分隔符问题
const dbPath = path.join(__dirname, '../backend/src/services/databaseService.js');

console.log('🔄 开始初始化项目角色数据...');

// 延迟加载数据库服务以确保环境变量已设置
async function initializeProjectRoles() {
  try {
    console.log('📚 加载数据库服务...');
    const databaseService = require(dbPath);
    
    console.log('🔌 初始化数据库连接...');
    await databaseService.initialize();
    
    console.log('🔍 检查项目角色表是否已有数据...');
    const existingRoles = await databaseService.findAll('project_roles', {});
    const roles = existingRoles.rows || existingRoles || [];
    
    if (roles.length > 0) {
      console.log(`⚠️ 项目角色表已有 ${roles.length} 条记录，跳过初始化`);
      console.log('📋 现有角色:');
      roles.forEach(role => {
        console.log(`   - ${role.name} (${role.code}): ${role.description}`);
      });
      return;
    }
    
    console.log('📦 准备插入默认项目角色数据...');
    
    // 定义默认项目角色
    const defaultRoles = [
      {
        name: '项目经理',
        code: 'PM',
        description: '项目整体管理',
        defaultWeight: 1.2,
        responsibilities: ['项目规划', '资源协调', '进度管理', '风险管理'],
        requiredSkills: ['项目管理', '沟通协调', '团队管理'],
        status: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '技术负责人',
        code: 'TECH_LEAD',
        description: '技术方案和团队管理',
        defaultWeight: 1.1,
        responsibilities: ['技术方案设计', '代码审查', '技术团队管理'],
        requiredSkills: ['架构设计', '技术选型', '团队协作'],
        status: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '高级开发工程师',
        code: 'SENIOR_DEV',
        description: '核心功能开发',
        defaultWeight: 1.0,
        responsibilities: ['核心模块开发', '技术难点攻关', '代码质量'],
        requiredSkills: ['编程能力', '系统设计', '问题解决'],
        status: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '开发工程师',
        code: 'DEVELOPER',
        description: '功能开发',
        defaultWeight: 0.8,
        responsibilities: ['功能实现', '单元测试', '文档编写'],
        requiredSkills: ['编程基础', '框架使用', '协作开发'],
        status: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '测试工程师',
        code: 'TESTER',
        description: '质量保证和测试',
        defaultWeight: 0.8,
        responsibilities: ['测试用例设计', '功能测试', '缺陷跟踪管理'],
        requiredSkills: ['测试方法', '自动化测试', '质量意识'],
        status: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '产品经理',
        code: 'PRODUCT_MANAGER',
        description: '产品规划和需求管理',
        defaultWeight: 1.0,
        responsibilities: ['需求分析', '产品规划', '用户体验设计'],
        requiredSkills: ['产品思维', '市场分析', '用户研究'],
        status: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'UI/UX设计师',
        code: 'DESIGNER',
        description: '界面和用户体验设计',
        defaultWeight: 0.9,
        responsibilities: ['界面设计', '交互设计', '用户体验优化'],
        requiredSkills: ['视觉设计', '交互设计', '原型制作'],
        status: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    console.log(`💾 插入 ${defaultRoles.length} 个默认项目角色...`);
    
    for (const roleData of defaultRoles) {
      try {
        const result = await databaseService.insert('project_roles', roleData);
        console.log(`✅ 成功插入角色: ${roleData.name} (${roleData.code})`);
      } catch (insertError) {
        console.error(`❌ 插入角色 ${roleData.name} 失败:`, insertError.message);
      }
    }
    
    console.log('🎉 项目角色数据初始化完成！');
    
    // 关闭数据库连接
    if (databaseService.close) {
      await databaseService.close();
      console.log('🔒 数据库连接已关闭');
    }
    
  } catch (error) {
    console.error('❌ 初始化项目角色数据失败:', error);
    console.error('详细错误:', error.stack);
    process.exit(1);
  }
}

// 执行初始化
initializeProjectRoles();