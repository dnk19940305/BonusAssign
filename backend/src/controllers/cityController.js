const logger = require('../utils/logger');
const databaseService = require('../services/databaseService');

class CityController {
  // 获取城市列表
  async getCities(req, res, next) {
    try {
      const {
        page = 1,
        pageSize = 20,
        search,
        tier
      } = req.query;

      let cities = await databaseService.find('cities', {});
      console.log('cities:', cities);
      // 搜索过滤
      if (search) {
        cities = cities.filter(city =>
          (city.name && city.name.toLowerCase().includes(search.toLowerCase())) ||
          (city.code && city.code.toLowerCase().includes(search.toLowerCase()))
        );
      }

      // 层级过滤
      if (tier) {
        cities = cities.filter(city => city.tier === tier);
      }

      // 分页处理
      const total = cities.length;
      const offset = (page - 1) * pageSize;
      const paginatedCities = cities.slice(offset, offset + parseInt(pageSize));

      // 将 _id 转换为 id，并移除 _id 字段
      const citiesWithId = paginatedCities.map(city => {
        const { _id, ...rest } = city;
        return { id: _id, ...rest };
      });

      res.json({
        code: 200,
        data: {
          list: citiesWithId,
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          total: total
        },
        message: '获取成功'
      });
    } catch (error) {
      logger.error('Get cities error:', error);
      next(error);
    }
  }

  // 获取所有城市（不分页）
  async getAllCities(req, res, next) {
    try {
      let cities = await databaseService.find('cities', {});
      
      // 将 _id 转换为 id，并移除 _id 字段
      const citiesWithId = cities.map(city => {
        const { _id, ...rest } = city;
        return { id: _id, ...rest };
      });
      
      res.json({
        code: 200,
        data: citiesWithId,
        message: '获取成功'
      });
    } catch (error) {
      logger.error('Get all cities error:', error);
      next(error);
    }
  }

  // 获取城市详情
  async getCity(req, res, next) {
    try {
      const { id } = req.params;

      const city = await databaseService.findOne('cities', { _id: id });

      if (!city) {
        return res.status(404).json({
          code: 404,
          message: '城市不存在',
          data: null
        });
      }

      // 将 _id 转换为 id，并移除 _id 字段
      const { _id, ...cityWithoutId } = city;
      const cityWithId = { id: _id, ...cityWithoutId };

      res.json({
        code: 200,
        data: cityWithId,
        message: '获取成功'
      });
    } catch (error) {
      logger.error('Get city error:', error);
      next(error);
    }
  }

  // 创建城市
  async createCity(req, res, next) {
    try {
      const cityData = req.body;

      // 检查城市编码是否已存在
      const existingCity = await databaseService.findOne('cities', {
        code: cityData.code
      });

      if (existingCity) {
        return res.status(400).json({
          code: 400,
          message: '城市编码已存在',
          data: null
        });
      }

      const newCity = await databaseService.create('cities', cityData);

      // 将 _id 转换为 id，并移除 _id 字段
      const { _id, ...cityWithoutId } = newCity;
      const cityWithId = { id: _id, ...cityWithoutId };

      res.status(201).json({
        code: 201,
        data: cityWithId,
        message: '创建成功'
      });
    } catch (error) {
      logger.error('Create city error:', error);
      next(error);
    }
  }

  // 更新城市
  async updateCity(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const existingCity = await databaseService.findOne('cities', { _id: id });
      if (!existingCity) {
        return res.status(404).json({
          code: 404,
          message: '城市不存在',
          data: null
        });
      }

      // 如果更新编码，检查是否与其他城市冲突
      if (updateData.code && updateData.code !== existingCity.code) {
        const codeExists = await databaseService.findOne('cities', {
          code: updateData.code,
          _id: { $ne: id }
        });

        if (codeExists) {
          return res.status(400).json({
            code: 400,
            message: '城市编码已存在',
            data: null
          });
        }
      }

      const result = await databaseService.update('cities', { _id: id }, updateData);

      if (result > 0) {
        const updatedCity = await databaseService.findOne('cities', { _id: id });
        
        // 将 _id 转换为 id，并移除 _id 字段
        const { _id, ...cityWithoutId } = updatedCity;
        const cityWithId = { id: _id, ...cityWithoutId };
        
        res.json({
          code: 200,
          data: cityWithId,
          message: '更新成功'
        });
      } else {
        res.status(400).json({
          code: 400,
          message: '更新失败',
          data: null
        });
      }
    } catch (error) {
      logger.error('Update city error:', error);
      next(error);
    }
  }

  // 删除城市
  async deleteCity(req, res, next) {
    try {
      const { id } = req.params;

      const existingCity = await databaseService.findOne('cities', { _id: id });
      if (!existingCity) {
        return res.status(404).json({
          code: 404,
          message: '城市不存在',
          data: null
        });
      }

      const result = await databaseService.manager.destroy('cities', id);

      if (result > 0) {
        res.json({
          code: 200,
          message: '删除成功',
          data: null
        });
      } else {
        res.status(400).json({
          code: 400,
          message: '删除失败',
          data: null
        });
      }
    } catch (error) {
      logger.error('Delete city error:', error);
      next(error);
    }
  }
}

module.exports = new CityController();