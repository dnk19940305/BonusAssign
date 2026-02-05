/**
 * 职业路径模板管理控制器
 */

const { databaseManager } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// 封装执行查询的方法
const executeQuery = async (sql, params = []) => {
  return await databaseManager.query(sql, params);
};

// 字段映射辅助函数
const mapTemplateFields = (tpl) => ({
  id: tpl.id,
  name: tpl.name,
  code: tpl.code,
  level: tpl.level,
  category: tpl.category,
  description: tpl.description,
  version: tpl.version,
  isActive: Boolean(tpl.is_active),
  isDefault: Boolean(tpl.is_default),
  status: tpl.status,
  nextLevel: tpl.next_level,
  estimatedTime: tpl.estimated_time,
  lateralMoves: typeof tpl.lateral_moves === 'string' ? JSON.parse(tpl.lateral_moves) : (tpl.lateral_moves || []),
  specializations: typeof tpl.specializations === 'string' ? JSON.parse(tpl.specializations) : (tpl.specializations || []),
  growthAreas: typeof tpl.growth_areas === 'string' ? JSON.parse(tpl.growth_areas) : (tpl.growth_areas || []),
  minExperience: tpl.min_experience,
  skillAssessment: tpl.skill_assessment,
  projectContribution: tpl.project_contribution,
  performanceLevel: tpl.performance_level,
  coreSkills: typeof tpl.core_skills === 'string' ? JSON.parse(tpl.core_skills) : (tpl.core_skills || []),
  advancedSkills: typeof tpl.advanced_skills === 'string' ? JSON.parse(tpl.advanced_skills) : (tpl.advanced_skills || []),
  leadershipSkills: typeof tpl.leadership_skills === 'string' ? JSON.parse(tpl.leadership_skills) : (tpl.leadership_skills || []),
  courses: typeof tpl.courses === 'string' ? JSON.parse(tpl.courses) : (tpl.courses || []),
  certifications: typeof tpl.certifications === 'string' ? JSON.parse(tpl.certifications) : (tpl.certifications || []),
  projects: typeof tpl.projects === 'string' ? JSON.parse(tpl.projects) : (tpl.projects || []),
  usageCount: tpl.usage_count || 0,
  createdAt: tpl.created_at,
  updatedAt: tpl.updated_at
});

/**
 * 获取职业路径模板列表
 */
const getCareerPathTemplates = async (req, res) => {
  try {
    const { level, category, status, isActive, page = 1, pageSize = 20 } = req.query;
    
    let query = 'SELECT * FROM career_path_templates';
    let whereClauses = [];
    const params = [];
    
    if (level) {
      whereClauses.push('level = ?');
      params.push(level);
    }
    
    if (category) {
      whereClauses.push('category = ?');
      params.push(category);
    }
    
    if (status) {
      whereClauses.push('status = ?');
      params.push(status);
    }
    
    if (isActive !== undefined) {
      whereClauses.push('is_active = ?');
      params.push(isActive === 'true' || isActive === '1' ? 1 : 0);
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
    query += ` ORDER BY is_default DESC, usage_count DESC, created_at DESC LIMIT ${parseInt(pageSize, 10)} OFFSET ${offset}`;
    
    const templates = await executeQuery(query, params);
    
    res.json({
      code: 200,
      message: '获取职业路径模板成功',
      data: {
        templates: templates.map(mapTemplateFields),
        pagination: {
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          total,
          totalPages: Math.ceil(total / parseInt(pageSize))
        }
      }
    });
  } catch (error) {
    console.error('获取职业路径模板失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取职业路径模板失败',
      error: error.message
    });
  }
};

/**
 * 获取单个职业路径模板
 */
const getCareerPathTemplateById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'SELECT * FROM career_path_templates WHERE id = ?';
    const templates = await executeQuery(query, [id]);
    
    if (templates.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '职业路径模板不存在'
      });
    }
    
    res.json({
      code: 200,
      message: '获取职业路径模板详情成功',
      data: mapTemplateFields(templates[0])
    });
  } catch (error) {
    console.error('获取职业路径模板详情失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取职业路径模板详情失败',
      error: error.message
    });
  }
};

/**
 * 创建职业路径模板
 */
const createCareerPathTemplate = async (req, res) => {
  try {
    const {
      name,
      code,
      level,
      category,
      description,
      version = '1.0.0',
      isActive = true,
      isDefault = false,
      status = 'draft',
      careerPath = {},
      skillDevelopment = {}
    } = req.body;
    
    // 验证必填字段
    if (!name || !code || !level || !category) {
      return res.status(400).json({
        code: 400,
        message: '模板名称、代码、职级和分类不能为空'
      });
    }
    
    // 检查代码是否已存在
    const checkQuery = 'SELECT id FROM career_path_templates WHERE code = ?';
    const existing = await executeQuery(checkQuery, [code]);
    
    if (existing.length > 0) {
      return res.status(400).json({
        code: 400,
        message: '模板代码已存在'
      });
    }
    
    // 如果设置为默认模板，取消其他同职级同分类的默认模板
    if (isDefault) {
      await executeQuery(
        'UPDATE career_path_templates SET is_default = FALSE WHERE level = ? AND category = ?',
        [level, category]
      );
    }
    
    const id = `template_${uuidv4().slice(0, 8)}`;
    
    const query = `
      INSERT INTO career_path_templates (
        id, name, code, level, category, description, version, is_active, is_default, status,
        next_level, estimated_time, lateral_moves, specializations, growth_areas,
        min_experience, skill_assessment, project_contribution, performance_level,
        core_skills, advanced_skills, leadership_skills,
        courses, certifications, projects
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await executeQuery(query, [
      id,
      name,
      code,
      level,
      category,
      description || null,
      version,
      isActive,
      isDefault,
      status,
      careerPath.nextLevel || null,
      careerPath.estimatedTime || null,
      JSON.stringify(careerPath.lateralMoves || []),
      JSON.stringify(careerPath.specializations || []),
      JSON.stringify(careerPath.growthAreas || []),
      careerPath.requirements?.minExperience || null,
      careerPath.requirements?.skillAssessment || null,
      careerPath.requirements?.projectContribution || null,
      careerPath.requirements?.performanceLevel || null,
      JSON.stringify(skillDevelopment.coreSkills || []),
      JSON.stringify(skillDevelopment.advancedSkills || []),
      JSON.stringify(skillDevelopment.leadershipSkills || []),
      JSON.stringify(skillDevelopment.learningPath?.courses || []),
      JSON.stringify(skillDevelopment.learningPath?.certifications || []),
      JSON.stringify(skillDevelopment.learningPath?.projects || [])
    ]);
    
    const newTemplate = await executeQuery(
      'SELECT * FROM career_path_templates WHERE id = ?',
      [id]
    );
    
    res.status(201).json({
      code: 201,
      message: '创建职业路径模板成功',
      data: mapTemplateFields(newTemplate[0])
    });
  } catch (error) {
    console.error('创建职业路径模板失败:', error);
    res.status(500).json({
      code: 500,
      message: '创建职业路径模板失败',
      error: error.message
    });
  }
};

/**
 * 更新职业路径模板
 */
const updateCareerPathTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const checkQuery = 'SELECT * FROM career_path_templates WHERE id = ?';
    const existing = await executeQuery(checkQuery, [id]);
    
    if (existing.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '职业路径模板不存在'
      });
    }
    
    // 如果修改了代码，检查是否重复
    if (updates.code && updates.code !== existing[0].code) {
      const codeCheckQuery = 'SELECT id FROM career_path_templates WHERE code = ? AND id != ?';
      const codeExists = await executeQuery(codeCheckQuery, [updates.code, id]);
      
      if (codeExists.length > 0) {
        return res.status(400).json({
          code: 400,
          message: '模板代码已存在'
        });
      }
    }
    
    // 如果设置为默认模板，取消其他同职级同分类的默认模板
    if (updates.isDefault) {
      const level = updates.level || existing[0].level;
      const category = updates.category || existing[0].category;
      await executeQuery(
        'UPDATE career_path_templates SET is_default = FALSE WHERE level = ? AND category = ? AND id != ?',
        [level, category, id]
      );
    }
    
    // 构建更新语句
    const updateFields = [];
    const params = [];
    
    // 基本字段
    const basicFields = ['name', 'code', 'level', 'category', 'description', 'version', 'is_active', 'is_default', 'status'];
    basicFields.forEach(field => {
      if (updates[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        params.push(updates[field]);
      }
    });
    
    // 职业路径字段
    if (updates.careerPath) {
      const cp = updates.careerPath;
      if (cp.nextLevel !== undefined) {
        updateFields.push('next_level = ?');
        params.push(cp.nextLevel);
      }
      if (cp.estimatedTime !== undefined) {
        updateFields.push('estimated_time = ?');
        params.push(cp.estimatedTime);
      }
      if (cp.lateralMoves !== undefined) {
        updateFields.push('lateral_moves = ?');
        params.push(JSON.stringify(cp.lateralMoves));
      }
      if (cp.specializations !== undefined) {
        updateFields.push('specializations = ?');
        params.push(JSON.stringify(cp.specializations));
      }
      if (cp.growthAreas !== undefined) {
        updateFields.push('growth_areas = ?');
        params.push(JSON.stringify(cp.growthAreas));
      }
      if (cp.requirements) {
        const req = cp.requirements;
        if (req.minExperience !== undefined) {
          updateFields.push('min_experience = ?');
          params.push(req.minExperience);
        }
        if (req.skillAssessment !== undefined) {
          updateFields.push('skill_assessment = ?');
          params.push(req.skillAssessment);
        }
        if (req.projectContribution !== undefined) {
          updateFields.push('project_contribution = ?');
          params.push(req.projectContribution);
        }
        if (req.performanceLevel !== undefined) {
          updateFields.push('performance_level = ?');
          params.push(req.performanceLevel);
        }
      }
    }
    
    // 技能发展字段
    if (updates.skillDevelopment) {
      const sd = updates.skillDevelopment;
      if (sd.coreSkills !== undefined) {
        updateFields.push('core_skills = ?');
        params.push(JSON.stringify(sd.coreSkills));
      }
      if (sd.advancedSkills !== undefined) {
        updateFields.push('advanced_skills = ?');
        params.push(JSON.stringify(sd.advancedSkills));
      }
      if (sd.leadershipSkills !== undefined) {
        updateFields.push('leadership_skills = ?');
        params.push(JSON.stringify(sd.leadershipSkills));
      }
      if (sd.learningPath) {
        const lp = sd.learningPath;
        if (lp.courses !== undefined) {
          updateFields.push('courses = ?');
          params.push(JSON.stringify(lp.courses));
        }
        if (lp.certifications !== undefined) {
          updateFields.push('certifications = ?');
          params.push(JSON.stringify(lp.certifications));
        }
        if (lp.projects !== undefined) {
          updateFields.push('projects = ?');
          params.push(JSON.stringify(lp.projects));
        }
      }
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '没有需要更新的字段'
      });
    }
    
    params.push(id);
    const updateQuery = `
      UPDATE career_path_templates 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `;
    
    await executeQuery(updateQuery, params);
    
    const updated = await executeQuery(checkQuery, [id]);
    
    res.json({
      code: 200,
      message: '更新职业路径模板成功',
      data: mapTemplateFields(updated[0])
    });
  } catch (error) {
    console.error('更新职业路径模板失败:', error);
    res.status(500).json({
      code: 500,
      message: '更新职业路径模板失败',
      error: error.message
    });
  }
};

/**
 * 删除职业路径模板
 */
const deleteCareerPathTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    
    const checkQuery = 'SELECT * FROM career_path_templates WHERE id = ?';
    const existing = await executeQuery(checkQuery, [id]);
    
    if (existing.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '职业路径模板不存在'
      });
    }
    
    const deleteQuery = 'DELETE FROM career_path_templates WHERE id = ?';
    await executeQuery(deleteQuery, [id]);
    
    res.json({
      code: 200,
      message: '删除职业路径模板成功'
    });
  } catch (error) {
    console.error('删除职业路径模板失败:', error);
    res.status(500).json({
      code: 500,
      message: '删除职业路径模板失败',
      error: error.message
    });
  }
};

/**
 * 复制职业路径模板
 */
const copyCareerPathTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'SELECT * FROM career_path_templates WHERE id = ?';
    const templates = await executeQuery(query, [id]);
    
    if (templates.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '职业路径模板不存在'
      });
    }
    
    const original = templates[0];
    const newId = `template_${uuidv4().slice(0, 8)}`;
    const newCode = `${original.code}_COPY_${Date.now()}`;
    const newName = `${original.name} - 副本`;
    
    const insertQuery = `
      INSERT INTO career_path_templates (
        id, name, code, level, category, description, version, is_active, is_default, status,
        next_level, estimated_time, lateral_moves, specializations, growth_areas,
        min_experience, skill_assessment, project_contribution, performance_level,
        core_skills, advanced_skills, leadership_skills,
        courses, certifications, projects
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await executeQuery(insertQuery, [
      newId,
      newName,
      newCode,
      original.level,
      original.category,
      original.description,
      original.version,
      false, // 复制的模板默认不启用
      false, // 复制的模板默认不是默认模板
      'draft', // 复制的模板默认为草稿
      original.next_level,
      original.estimated_time,
      original.lateral_moves,
      original.specializations,
      original.growth_areas,
      original.min_experience,
      original.skill_assessment,
      original.project_contribution,
      original.performance_level,
      original.core_skills,
      original.advanced_skills,
      original.leadership_skills,
      original.courses,
      original.certifications,
      original.projects
    ]);
    
    const newTemplate = await executeQuery(
      'SELECT * FROM career_path_templates WHERE id = ?',
      [newId]
    );
    
    res.status(201).json({
      code: 201,
      message: '复制职业路径模板成功',
      data: mapTemplateFields(newTemplate[0])
    });
  } catch (error) {
    console.error('复制职业路径模板失败:', error);
    res.status(500).json({
      code: 500,
      message: '复制职业路径模板失败',
      error: error.message
    });
  }
};

/**
 * 增加模板使用次数
 */
const incrementTemplateUsage = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'UPDATE career_path_templates SET usage_count = usage_count + 1 WHERE id = ?';
    await executeQuery(query, [id]);
    
    res.json({
      code: 200,
      message: '更新使用次数成功'
    });
  } catch (error) {
    console.error('更新使用次数失败:', error);
    res.status(500).json({
      code: 500,
      message: '更新使用次数失败',
      error: error.message
    });
  }
};

module.exports = {
  getCareerPathTemplates,
  getCareerPathTemplateById,
  createCareerPathTemplate,
  updateCareerPathTemplate,
  deleteCareerPathTemplate,
  copyCareerPathTemplate,
  incrementTemplateUsage
};
