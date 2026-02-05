/**
 * 开发环境配置管理器
 * MySQL数据库配置
 */

const devConfig = {
  // 功能开关配置
  features: {
    // 员工管理模块
    employee: {
      enabled: true,
      useRealAPI: true
    },

    // 部门管理模块
    department: {
      enabled: true,
      useRealAPI: true
    },

    // 岗位管理模块
    position: {
      enabled: true,
      useRealAPI: true
    },

    // 业务线管理模块
    businessLine: {
      enabled: true,
      useRealAPI: true
    },

    // 奖金计算模块
    bonusCalculation: {
      enabled: false,        // 功能开发中，暂时禁用
      useRealAPI: false
    },

    // 绩效评估模块
    performance: {
      enabled: false,        // 功能开发中，暂时禁用
      useRealAPI: false
    }
  },

  // MySQL数据库配置
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    name: process.env.DB_NAME || 'bonus_system',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'rootpassword'
  },

  // 开发工具配置
  devTools: {
    // 启用API日志
    enableAPILogging: true,

    // 启用数据库日志
    enableDBLogging: true,

    // 启用性能监控
    enablePerformanceMonitoring: true,

    // 启用错误追踪
    enableErrorTracking: true
  },

  // 获取功能配置
  getFeatureConfig(featureName) {
    return this.features[featureName] || {
      enabled: false,
      useRealAPI: false
    };
  },

  // 检查功能是否启用
  isFeatureEnabled(featureName) {
    const config = this.getFeatureConfig(featureName);
    return config.enabled;
  },

  // 检查是否使用真实API
  shouldUseRealAPI(featureName) {
    const config = this.getFeatureConfig(featureName);
    return config.enabled && config.useRealAPI;
  }
};

module.exports = devConfig;
