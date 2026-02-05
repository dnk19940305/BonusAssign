const { createModel } = require('../adapters/model-adapter')

const RoleMenu = createModel('role_menus')

// 为了向后兼容，添加静态属性
RoleMenu.attributes = {
  id: { type: 'INTEGER', primaryKey: true, autoIncrement: true },
  roleId: { type: 'STRING', allowNull: false, field: 'role_id' },
  menuId: { type: 'STRING', allowNull: false, field: 'menu_id' }
}

module.exports = RoleMenu
