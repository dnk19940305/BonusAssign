const { createModel } = require('../adapters/model-adapter')

const Menu = createModel('menus')

// 为了向后兼容，添加静态属性
Menu.attributes = {
  id: { type: 'STRING', primaryKey: true },
  parentId: { type: 'STRING', allowNull: true, field: 'parent_id' },
  menuName: { type: 'STRING', allowNull: false, field: 'menu_name' },
  menuPath: { type: 'STRING', allowNull: true, field: 'menu_path' },
  component: { type: 'STRING', allowNull: true },
  menuType: { type: 'STRING', allowNull: false, defaultValue: 'menu', field: 'menu_type' }, // directory, menu, button
  icon: { type: 'STRING', allowNull: true },
  sortOrder: { type: 'INTEGER', allowNull: false, defaultValue: 0, field: 'sort_order' },
  visible: { type: 'BOOLEAN', allowNull: false, defaultValue: true },
  status: { type: 'BOOLEAN', allowNull: false, defaultValue: true },
  perms: { type: 'STRING', allowNull: true },
  isFrame: { type: 'BOOLEAN', allowNull: false, defaultValue: false, field: 'is_frame' },
  isCache: { type: 'BOOLEAN', allowNull: false, defaultValue: true, field: 'is_cache' },
  redirect: { type: 'STRING', allowNull: true },
  metaTitle: { type: 'STRING', allowNull: true, field: 'meta_title' },
  metaDescription: { type: 'STRING', allowNull: true, field: 'meta_description' },
  metaShowInMenu: { type: 'BOOLEAN', allowNull: false, defaultValue: true, field: 'meta_show_in_menu' },
  createdBy: { type: 'STRING', allowNull: true, field: 'created_by' },
  remark: { type: 'STRING', allowNull: true }
}

module.exports = Menu
