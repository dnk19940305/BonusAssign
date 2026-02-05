const databaseService = require('../backend/src/services/databaseService');

async function initCityMenu() {
  try {
    console.log('🔄 初始化城市模块菜单...');
    
    // 初始化数据库服务
    await databaseService.initialize();
    
    // 检查城市菜单是否已存在
    const existingCityMenu = await databaseService.findOne('menus', { 
      menu_path: '/system/cities' 
    });
    
    if (existingCityMenu) {
      console.log('✅ 城市模块菜单已存在，跳过初始化');
      return;
    }
    
    // 创建城市模块菜单项
    const cityMenu = {
      id: 'city_management',
      parent_id: 'system_management',  // 系统管理的子菜单
      menu_name: '城市管理',
      menu_path: '/system/cities',
      component: 'system/CityManagement',
      menu_type: 'menu',
      icon: 'OfficeBuilding',
      sort_order: 100,  // 在系统管理菜单中的排序
      visible: 1,
      status: 1,
      perms: 'city:view,city:create,city:update,city:delete',
      meta_title: '城市管理',
      meta_description: '城市信息管理',
      meta_show_in_menu: 1,
      remark: '城市信息管理模块'
    };
    
    await databaseService.insert('menus', cityMenu);
    console.log('✅ 城市模块菜单初始化完成');
    
    // 为拥有系统管理权限的角色分配城市菜单权限
    const rolesWithAdminPrivileges = ['admin', 'SUPER_ADMIN', 'ADMIN'];
    
    for (const roleId of rolesWithAdminPrivileges) {
      try {
        // 检查是否已有分配记录
        const existingAssignment = await databaseService.findOne('role_menus', {
          role_id: roleId,
          menu_id: cityMenu.id
        });
        
        if (!existingAssignment) {
          // 直接使用query方法插入，避免字段映射问题
          await databaseService.query(
            'INSERT INTO role_menus (role_id, menu_id, created_at) VALUES (?, ?, ?)',
            [roleId, cityMenu.id, new Date()]
          );
          console.log(`✅ 为角色 ${roleId} 分配城市菜单权限`);
        }
      } catch (error) {
        console.warn(`⚠️ 为角色 ${roleId} 分配权限时出错:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ 初始化城市模块菜单失败:', error);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  initCityMenu();
}

module.exports = initCityMenu;