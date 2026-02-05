/**
 * 技能标签管理控制器
 */

const { databaseManager } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// 封装执行查询的方法
const executeQuery = async (sql, params = []) => {
  return await databaseManager.query(sql, params);
};

// 字段映射辅助函数
const mapSkillCategoryFields = (cat) => ({
  id: cat.id,
  name: cat.name,
  description: cat.description,
  color: cat.color,
  sortOrder: cat.sort_order,
  skillCount: cat.skill_count || 0,
  createdAt: cat.created_at,
  updatedAt: cat.updated_at
});

const mapSkillTagFields = (tag) => ({
  id: tag.id,
  name: tag.name,
  code: tag.code,
  categoryId: tag.category_id,
  level: tag.level,
  description: tag.description,
  synonyms: typeof tag.synonyms === 'string' ? JSON.parse(tag.synonyms) : (tag.synonyms || []),
  relatedSkills: typeof tag.related_skills === 'string' ? JSON.parse(tag.related_skills) : (tag.related_skills || []),
  usageCount: tag.usage_count || 0,
  isActive: Boolean(tag.is_active),
  isSystem: Boolean(tag.is_system),
  createdAt: tag.created_at,
  updatedAt: tag.updated_at
});

/**
 * 获取所有技能分类
 */
const getSkillCategories = async (req, res) => {
  try {
    const query = 'SELECT * FROM skill_categories ORDER BY sort_order ASC';
    const categories = await executeQuery(query);
    
    res.json({
      code: 200,
      message: '获取技能分类成功',
      data: categories.map(mapSkillCategoryFields)
    });
  } catch (error) {
    console.error('获取技能分类失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取技能分类失败',
      error: error.message
    });
  }
};

/**
 * 创建技能分类
 */
const createSkillCategory = async (req, res) => {
  try {
    const { name, description, color = '#409eff', sortOrder = 0 } = req.body;
    
    if (!name) {
      return res.status(400).json({
        code: 400,
        message: '分类名称不能为空'
      });
    }
    
    const id = `skillcat_${uuidv4().slice(0, 8)}`;
    
    const query = `
      INSERT INTO skill_categories (id, name, description, color, sort_order)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    await executeQuery(query, [id, name, description || null, color, sortOrder]);
    
    const newCategory = await executeQuery(
      'SELECT * FROM skill_categories WHERE id = ?',
      [id]
    );
    
    res.status(201).json({
      code: 201,
      message: '创建技能分类成功',
      data: mapSkillCategoryFields(newCategory[0])
    });
  } catch (error) {
    console.error('创建技能分类失败:', error);
    res.status(500).json({
      code: 500,
      message: '创建技能分类失败',
      error: error.message
    });
  }
};

/**
 * 更新技能分类
 */
const updateSkillCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, color, sortOrder } = req.body;
    
    const checkQuery = 'SELECT * FROM skill_categories WHERE id = ?';
    const existing = await executeQuery(checkQuery, [id]);
    
    if (existing.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '技能分类不存在'
      });
    }
    
    const updates = [];
    const params = [];
    
    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (color !== undefined) {
      updates.push('color = ?');
      params.push(color);
    }
    if (sortOrder !== undefined) {
      updates.push('sort_order = ?');
      params.push(sortOrder);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '没有需要更新的字段'
      });
    }
    
    params.push(id);
    const updateQuery = `
      UPDATE skill_categories 
      SET ${updates.join(', ')}
      WHERE id = ?
    `;
    
    await executeQuery(updateQuery, params);
    
    const updated = await executeQuery(checkQuery, [id]);
    
    res.json({
      code: 200,
      message: '更新技能分类成功',
      data: mapSkillCategoryFields(updated[0])
    });
  } catch (error) {
    console.error('更新技能分类失败:', error);
    res.status(500).json({
      code: 500,
      message: '更新技能分类失败',
      error: error.message
    });
  }
};

/**
 * 删除技能分类
 */
const deleteSkillCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const checkQuery = 'SELECT * FROM skill_categories WHERE id = ?';
    const existing = await executeQuery(checkQuery, [id]);
    
    if (existing.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '技能分类不存在'
      });
    }
    
    if (existing[0].skill_count > 0) {
      return res.status(400).json({
        code: 400,
        message: '该分类下有关联标签，无法删除'
      });
    }
    
    const deleteQuery = 'DELETE FROM skill_categories WHERE id = ?';
    await executeQuery(deleteQuery, [id]);
    
    res.json({
      code: 200,
      message: '删除技能分类成功'
    });
  } catch (error) {
    console.error('删除技能分类失败:', error);
    res.status(500).json({
      code: 500,
      message: '删除技能分类失败',
      error: error.message
    });
  }
};

/**
 * 获取技能标签列表
 */
const getSkillTags = async (req, res) => {
  try {
    const { categoryId, level, isActive, keyword, page = 1, pageSize = 20 } = req.query;
    
    let query = 'SELECT * FROM skill_tags';
    let whereClauses = [];
    const params = [];
    
    if (categoryId) {
      whereClauses.push('category_id = ?');
      params.push(categoryId);
    }
    
    if (level) {
      whereClauses.push('level = ?');
      params.push(level);
    }
    
    if (isActive !== undefined) {
      whereClauses.push('is_active = ?');
      params.push(isActive === 'true' || isActive === '1' ? 1 : 0);
    }
    
    if (keyword) {
      whereClauses.push('(name LIKE ? OR code LIKE ? OR description LIKE ?)');
      const likeKeyword = `%${keyword}%`;
      params.push(likeKeyword, likeKeyword, likeKeyword);
    }
    
    if (whereClauses.length > 0) {
      query += ' WHERE ' + whereClauses.join(' AND ');
    }
    
    // 获取总数
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const countResult = await executeQuery(countQuery, [...params]);
    const total = countResult[0].total;
    
    // 分页
    const offset = (parseInt(page, 10) - 1) * parseInt(pageSize, 10);
    query += ` ORDER BY usage_count DESC, created_at DESC LIMIT ${parseInt(pageSize, 10)} OFFSET ${offset}`;
    
    const tags = await executeQuery(query, params);
    
    res.json({
      code: 200,
      message: '获取技能标签成功',
      data: {
        tags: tags.map(mapSkillTagFields),
        pagination: {
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          total,
          totalPages: Math.ceil(total / parseInt(pageSize))
        }
      }
    });
  } catch (error) {
    console.error('获取技能标签失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取技能标签失败',
      error: error.message
    });
  }
};

/**
 * 获取单个技能标签
 */
const getSkillTagById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'SELECT * FROM skill_tags WHERE id = ?';
    const tags = await executeQuery(query, [id]);
    
    if (tags.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '技能标签不存在'
      });
    }
    
    res.json({
      code: 200,
      message: '获取技能标签详情成功',
      data: mapSkillTagFields(tags[0])
    });
  } catch (error) {
    console.error('获取技能标签详情失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取技能标签详情失败',
      error: error.message
    });
  }
};

/**
 * 创建技能标签
 */
const createSkillTag = async (req, res) => {
  try {
    const {
      name,
      code,
      categoryId,
      level = 'basic',
      description,
      synonyms = [],
      relatedSkills = [],
      isActive = true,
      isSystem = false
    } = req.body;
    
    if (!name || !code || !categoryId) {
      return res.status(400).json({
        code: 400,
        message: '标签名称、代码和分类不能为空'
      });
    }
    
    // 检查代码是否已存在
    const checkQuery = 'SELECT id FROM skill_tags WHERE code = ?';
    const existing = await executeQuery(checkQuery, [code]);
    
    if (existing.length > 0) {
      return res.status(400).json({
        code: 400,
        message: '标签代码已存在'
      });
    }
    
    const id = `skill_${uuidv4().slice(0, 8)}`;
    
    const query = `
      INSERT INTO skill_tags 
      (id, name, code, category_id, level, description, synonyms, related_skills, is_active, is_system)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await executeQuery(query, [
      id,
      name,
      code,
      categoryId,
      level,
      description || null,
      JSON.stringify(synonyms),
      JSON.stringify(relatedSkills),
      isActive,
      isSystem
    ]);
    
    // 更新分类的技能数量
    await executeQuery(
      'UPDATE skill_categories SET skill_count = skill_count + 1 WHERE id = ?',
      [categoryId]
    );
    
    const newTag = await executeQuery('SELECT * FROM skill_tags WHERE id = ?', [id]);
    
    res.status(201).json({
      code: 201,
      message: '创建技能标签成功',
      data: mapSkillTagFields(newTag[0])
    });
  } catch (error) {
    console.error('创建技能标签失败:', error);
    res.status(500).json({
      code: 500,
      message: '创建技能标签失败',
      error: error.message
    });
  }
};

/**
 * 更新技能标签
 */
const updateSkillTag = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      code,
      categoryId,
      level,
      description,
      synonyms,
      relatedSkills,
      isActive
    } = req.body;
    
    const checkQuery = 'SELECT * FROM skill_tags WHERE id = ?';
    const existing = await executeQuery(checkQuery, [id]);
    
    if (existing.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '技能标签不存在'
      });
    }
    
    // 如果修改了代码，检查是否重复
    if (code && code !== existing[0].code) {
      const codeCheckQuery = 'SELECT id FROM skill_tags WHERE code = ? AND id != ?';
      const codeExists = await executeQuery(codeCheckQuery, [code, id]);
      
      if (codeExists.length > 0) {
        return res.status(400).json({
          code: 400,
          message: '标签代码已存在'
        });
      }
    }
    
    const updates = [];
    const params = [];
    const oldCategoryId = existing[0].category_id;
    let newCategoryId = oldCategoryId;
    
    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }
    if (code !== undefined) {
      updates.push('code = ?');
      params.push(code);
    }
    if (categoryId !== undefined) {
      updates.push('category_id = ?');
      params.push(categoryId);
      newCategoryId = categoryId;
    }
    if (level !== undefined) {
      updates.push('level = ?');
      params.push(level);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (synonyms !== undefined) {
      updates.push('synonyms = ?');
      params.push(JSON.stringify(synonyms));
    }
    if (relatedSkills !== undefined) {
      updates.push('related_skills = ?');
      params.push(JSON.stringify(relatedSkills));
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
      UPDATE skill_tags 
      SET ${updates.join(', ')}
      WHERE id = ?
    `;
    
    await executeQuery(updateQuery, params);
    
    // 如果分类变更，更新分类计数
    if (newCategoryId !== oldCategoryId) {
      await executeQuery(
        'UPDATE skill_categories SET skill_count = skill_count - 1 WHERE id = ?',
        [oldCategoryId]
      );
      await executeQuery(
        'UPDATE skill_categories SET skill_count = skill_count + 1 WHERE id = ?',
        [newCategoryId]
      );
    }
    
    const updated = await executeQuery(checkQuery, [id]);
    
    res.json({
      code: 200,
      message: '更新技能标签成功',
      data: mapSkillTagFields(updated[0])
    });
  } catch (error) {
    console.error('更新技能标签失败:', error);
    res.status(500).json({
      code: 500,
      message: '更新技能标签失败',
      error: error.message
    });
  }
};

/**
 * 删除技能标签
 */
const deleteSkillTag = async (req, res) => {
  try {
    const { id } = req.params;
    
    const checkQuery = 'SELECT * FROM skill_tags WHERE id = ?';
    const existing = await executeQuery(checkQuery, [id]);
    
    if (existing.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '技能标签不存在'
      });
    }
    
    const categoryId = existing[0].category_id;
    
    const deleteQuery = 'DELETE FROM skill_tags WHERE id = ?';
    await executeQuery(deleteQuery, [id]);
    
    // 更新分类的技能数量
    await executeQuery(
      'UPDATE skill_categories SET skill_count = skill_count - 1 WHERE id = ?',
      [categoryId]
    );
    
    res.json({
      code: 200,
      message: '删除技能标签成功'
    });
  } catch (error) {
    console.error('删除技能标签失败:', error);
    res.status(500).json({
      code: 500,
      message: '删除技能标签失败',
      error: error.message
    });
  }
};

/**
 * 批量操作技能标签
 */
const batchOperateSkillTags = async (req, res) => {
  try {
    const { ids, operation } = req.body; // operation: 'enable', 'disable', 'delete'
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '请选择要操作的标签'
      });
    }
    
    const placeholders = ids.map(() => '?').join(',');
    
    switch (operation) {
      case 'enable':
        await executeQuery(
          `UPDATE skill_tags SET is_active = TRUE WHERE id IN (${placeholders})`,
          ids
        );
        break;
        
      case 'disable':
        await executeQuery(
          `UPDATE skill_tags SET is_active = FALSE WHERE id IN (${placeholders})`,
          ids
        );
        break;
        
      case 'delete':
        // 获取要删除标签的分类ID
        const tagsQuery = `SELECT category_id FROM skill_tags WHERE id IN (${placeholders})`;
        const tags = await executeQuery(tagsQuery, ids);
        const categoryIds = [...new Set(tags.map(t => t.category_id))];
        
        await executeQuery(
          `DELETE FROM skill_tags WHERE id IN (${placeholders})`,
          ids
        );
        
        // 更新各分类的技能数量
        for (const catId of categoryIds) {
          await executeQuery(
            'UPDATE skill_categories SET skill_count = (SELECT COUNT(*) FROM skill_tags WHERE category_id = ?) WHERE id = ?',
            [catId, catId]
          );
        }
        break;
        
      default:
        return res.status(400).json({
          code: 400,
          message: '不支持的操作类型'
        });
    }
    
    res.json({
      code: 200,
      message: '批量操作成功'
    });
  } catch (error) {
    console.error('批量操作失败:', error);
    res.status(500).json({
      code: 500,
      message: '批量操作失败',
      error: error.message
    });
  }
};

/**
 * 合并技能标签
 */
const mergeSkillTags = async (req, res) => {
  try {
    const { primaryTagId, secondaryTagId, description } = req.body;
    
    if (!primaryTagId || !secondaryTagId) {
      return res.status(400).json({
        code: 400,
        message: '请指定要合并的标签'
      });
    }
    
    // 检查两个标签是否存在
    const checkQuery = 'SELECT * FROM skill_tags WHERE id IN (?, ?)';
    const tags = await executeQuery(checkQuery, [primaryTagId, secondaryTagId]);
    
    if (tags.length !== 2) {
      return res.status(404).json({
        code: 404,
        message: '标签不存在'
      });
    }
    
    const secondaryTag = tags.find(t => t.id === secondaryTagId);
    const categoryId = secondaryTag.category_id;
    
    // 更新主标签的使用次数
    await executeQuery(
      'UPDATE skill_tags SET usage_count = usage_count + ? WHERE id = ?',
      [secondaryTag.usage_count, primaryTagId]
    );
    
    // 删除次要标签
    await executeQuery('DELETE FROM skill_tags WHERE id = ?', [secondaryTagId]);
    
    // 更新分类的技能数量
    await executeQuery(
      'UPDATE skill_categories SET skill_count = skill_count - 1 WHERE id = ?',
      [categoryId]
    );
    
    res.json({
      code: 200,
      message: '合并标签成功'
    });
  } catch (error) {
    console.error('合并标签失败:', error);
    res.status(500).json({
      code: 500,
      message: '合并标签失败',
      error: error.message
    });
  }
};

module.exports = {
  // 技能分类
  getSkillCategories,
  createSkillCategory,
  updateSkillCategory,
  deleteSkillCategory,
  
  // 技能标签
  getSkillTags,
  getSkillTagById,
  createSkillTag,
  updateSkillTag,
  deleteSkillTag,
  batchOperateSkillTags,
  mergeSkillTags
};
