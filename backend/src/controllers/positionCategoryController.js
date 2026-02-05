/**
 * 岗位分类管理控制器
 */

const { databaseManager } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// 封装执行查询的方法
const executeQuery = async (sql, params = []) => {
  return await databaseManager.query(sql, params);
};

/**
 * 获取所有分类（树形结构）
 */
const getCategories = async (req, res) => {
  try {
    const { type, parentId, isActive } = req.query;
    
    let query = 'SELECT * FROM position_categories WHERE 1=1';
    const params = [];
    
    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }
    
    if (parentId !== undefined) {
      if (parentId === 'null' || parentId === '') {
        query += ' AND parent_id IS NULL';
      } else {
        query += ' AND parent_id = ?';
        params.push(parentId);
      }
    }
    
    if (isActive !== undefined) {
      query += ' AND is_active = ?';
      params.push(isActive === 'true' || isActive === '1');
    }
    
    query += ' ORDER BY level ASC, sort_order ASC';
    
    const categories = await executeQuery(query, params);
    
    // 字段映射：snake_case -> camelCase
    const mappedCategories = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      code: cat.code,
      type: cat.type,
      parentId: cat.parent_id,
      level: cat.level,
      sortOrder: cat.sort_order,
      description: cat.description,
      icon: cat.icon,
      color: cat.color,
      isActive: Boolean(cat.is_active),
      positionCount: cat.position_count || 0,
      createdAt: cat.created_at,
      updatedAt: cat.updated_at
    }));
    
    // 构建树形结构
    const categoryMap = new Map();
    const rootCategories = [];
    
    // 第一遍：创建映射
    mappedCategories.forEach(cat => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });
    
    // 第二遍：构建树形结构
    mappedCategories.forEach(cat => {
      const category = categoryMap.get(cat.id);
      if (cat.parentId && categoryMap.has(cat.parentId)) {
        categoryMap.get(cat.parentId).children.push(category);
      } else {
        rootCategories.push(category);
      }
    });
    
    res.json({
      code: 200,
      message: '获取分类成功',
      data: rootCategories
    });
  } catch (error) {
    console.error('获取分类失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取分类失败',
      error: error.message
    });
  }
};

/**
 * 获取单个分类详情
 */
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'SELECT * FROM position_categories WHERE id = ?';
    const categories = await executeQuery(query, [id]);
    
    if (categories.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '分类不存在'
      });
    }
    
    const cat = categories[0];
    
    // 字段映射：snake_case -> camelCase
    const mappedCategory = {
      id: cat.id,
      name: cat.name,
      code: cat.code,
      type: cat.type,
      parentId: cat.parent_id,
      level: cat.level,
      sortOrder: cat.sort_order,
      description: cat.description,
      icon: cat.icon,
      color: cat.color,
      isActive: Boolean(cat.is_active),
      positionCount: cat.position_count || 0,
      createdAt: cat.created_at,
      updatedAt: cat.updated_at
    };
    
    // 获取关联的岗位信息（如果有positions表）
    // const positionsQuery = 'SELECT id, name FROM positions WHERE category_id = ?';
    // const positions = await executeQuery(positionsQuery, [id]);
    // mappedCategory.positions = positions;
    
    res.json({
      code: 200,
      message: '获取分类详情成功',
      data: mappedCategory
    });
  } catch (error) {
    console.error('获取分类详情失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取分类详情失败',
      error: error.message
    });
  }
};

/**
 * 创建分类
 */
const createCategory = async (req, res) => {
  try {
    const {
      name,
      code,
      type = 'main',
      parentId,
      level,
      sortOrder = 0,
      description,
      icon,
      color = '#409eff',
      isActive = true
    } = req.body;
    
    // 验证必填字段
    if (!name || !code) {
      return res.status(400).json({
        code: 400,
        message: '分类名称和代码不能为空'
      });
    }
    
    // 检查代码是否已存在
    const checkQuery = 'SELECT id FROM position_categories WHERE code = ?';
    const existing = await executeQuery(checkQuery, [code]);
    
    if (existing.length > 0) {
      return res.status(400).json({
        code: 400,
        message: '分类代码已存在'
      });
    }
    
    // 生成ID
    const id = `cat_${uuidv4().slice(0, 8)}`;
    
    // 确定层级
    let categoryLevel = level || 1;
    if (type === 'sub' && parentId) {
      const parentQuery = 'SELECT level FROM position_categories WHERE id = ?';
      const parents = await executeQuery(parentQuery, [parentId]);
      if (parents.length > 0) {
        categoryLevel = parents[0].level + 1;
      }
    }
    
    const query = `
      INSERT INTO position_categories 
      (id, name, code, type, parent_id, level, sort_order, description, icon, color, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await executeQuery(query, [
      id,
      name,
      code,
      type,
      parentId || null,
      categoryLevel,
      sortOrder,
      description || null,
      icon || null,
      color,
      isActive
    ]);
    
    // 获取创建的分类
    const newCategory = await executeQuery(
      'SELECT * FROM position_categories WHERE id = ?',
      [id]
    );
    
    const cat = newCategory[0];
    const mappedCategory = {
      id: cat.id,
      name: cat.name,
      code: cat.code,
      type: cat.type,
      parentId: cat.parent_id,
      level: cat.level,
      sortOrder: cat.sort_order,
      description: cat.description,
      icon: cat.icon,
      color: cat.color,
      isActive: Boolean(cat.is_active),
      positionCount: cat.position_count || 0,
      createdAt: cat.created_at,
      updatedAt: cat.updated_at
    };
    
    res.status(201).json({
      code: 201,
      message: '创建分类成功',
      data: mappedCategory
    });
  } catch (error) {
    console.error('创建分类失败:', error);
    res.status(500).json({
      code: 500,
      message: '创建分类失败',
      error: error.message
    });
  }
};

/**
 * 更新分类
 */
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      code,
      type,
      parentId,
      sortOrder,
      description,
      icon,
      color,
      isActive
    } = req.body;
    
    // 检查分类是否存在
    const checkQuery = 'SELECT * FROM position_categories WHERE id = ?';
    const existing = await executeQuery(checkQuery, [id]);
    
    if (existing.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '分类不存在'
      });
    }
    
    // 如果修改了代码，检查是否重复
    if (code && code !== existing[0].code) {
      const codeCheckQuery = 'SELECT id FROM position_categories WHERE code = ? AND id != ?';
      const codeExists = await executeQuery(codeCheckQuery, [code, id]);
      
      if (codeExists.length > 0) {
        return res.status(400).json({
          code: 400,
          message: '分类代码已存在'
        });
      }
    }
    
    // 构建更新语句
    const updates = [];
    const params = [];
    
    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }
    if (code !== undefined) {
      updates.push('code = ?');
      params.push(code);
    }
    if (type !== undefined) {
      updates.push('type = ?');
      params.push(type);
    }
    if (parentId !== undefined) {
      updates.push('parent_id = ?');
      params.push(parentId || null);
    }
    if (sortOrder !== undefined) {
      updates.push('sort_order = ?');
      params.push(sortOrder);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (icon !== undefined) {
      updates.push('icon = ?');
      params.push(icon);
    }
    if (color !== undefined) {
      updates.push('color = ?');
      params.push(color);
    }
    if (isActive !== undefined) {
      updates.push('is_active = ?');
      params.push(isActive);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '没有需要更新的字段'
      });
    }
    
    params.push(id);
    const updateQuery = `
      UPDATE position_categories 
      SET ${updates.join(', ')}
      WHERE id = ?
    `;
    
    await executeQuery(updateQuery, params);
    
    // 获取更新后的分类
    const updated = await executeQuery(checkQuery, [id]);
    
    const cat = updated[0];
    const mappedCategory = {
      id: cat.id,
      name: cat.name,
      code: cat.code,
      type: cat.type,
      parentId: cat.parent_id,
      level: cat.level,
      sortOrder: cat.sort_order,
      description: cat.description,
      icon: cat.icon,
      color: cat.color,
      isActive: Boolean(cat.is_active),
      positionCount: cat.position_count || 0,
      createdAt: cat.created_at,
      updatedAt: cat.updated_at
    };
    
    res.json({
      code: 200,
      message: '更新分类成功',
      data: mappedCategory
    });
  } catch (error) {
    console.error('更新分类失败:', error);
    res.status(500).json({
      code: 500,
      message: '更新分类失败',
      error: error.message
    });
  }
};

/**
 * 删除分类
 */
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 检查分类是否存在
    const checkQuery = 'SELECT * FROM position_categories WHERE id = ?';
    const existing = await executeQuery(checkQuery, [id]);
    
    if (existing.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '分类不存在'
      });
    }
    
    // 检查是否有关联岗位（实时查询positions表）
    const positionsQuery = 'SELECT COUNT(*) as count FROM positions WHERE category_id = ?';
    const positionsResult = await executeQuery(positionsQuery, [id]);
    const positionCount = positionsResult[0]?.count || 0;
    
    if (positionCount > 0) {
      return res.status(400).json({
        code: 400,
        message: `该分类下有 ${positionCount} 个关联岗位，无法删除`
      });
    }
    
    // 检查是否有子分类
    const childrenQuery = 'SELECT id FROM position_categories WHERE parent_id = ?';
    const children = await executeQuery(childrenQuery, [id]);
    
    if (children.length > 0) {
      return res.status(400).json({
        code: 400,
        message: `该分类下有 ${children.length} 个子分类，无法删除`
      });
    }
    
    const deleteQuery = 'DELETE FROM position_categories WHERE id = ?';
    await executeQuery(deleteQuery, [id]);
    
    res.json({
      code: 200,
      message: '删除分类成功'
    });
  } catch (error) {
    console.error('删除分类失败:', error);
    res.status(500).json({
      code: 500,
      message: '删除分类失败',
      error: error.message
    });
  }
};

/**
 * 更新分类排序
 */
const updateCategoryOrder = async (req, res) => {
  try {
    const { orders } = req.body; // [{ id, sortOrder }, ...]
    
    if (!Array.isArray(orders) || orders.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '排序数据格式错误'
      });
    }
    
    // 批量更新排序
    const updatePromises = orders.map(({ id, sortOrder }) => {
      const query = 'UPDATE position_categories SET sort_order = ? WHERE id = ?';
      return executeQuery(query, [sortOrder, id]);
    });
    
    await Promise.all(updatePromises);
    
    res.json({
      code: 200,
      message: '更新排序成功'
    });
  } catch (error) {
    console.error('更新排序失败:', error);
    res.status(500).json({
      code: 500,
      message: '更新排序失败',
      error: error.message
    });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  updateCategoryOrder
};
