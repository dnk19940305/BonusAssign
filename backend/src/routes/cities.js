const express = require('express');
const cityController = require('../controllers/cityController');
const { authenticateToken, authorize, logOperation } = require('../middlewares/auth');
const { validate } = require('../utils/validation');
const { citySchemas } = require('../utils/validation');

const router = express.Router();

// 所有城市路由都需要认证
router.use(authenticateToken);

/**
 * @swagger
 * /api/cities:
 *   get:
 *     tags:
 *       - 城市管理
 *     summary: 获取城市列表
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: 每页数量
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 搜索关键词
 *       - in: query
 *         name: tier
 *         schema:
 *           type: string
 *         description: 城市层级筛选
 *     responses:
 *       200:
 *         description: 获取成功
 */
router.get('/', 
  cityController.getCities
);

/**
 * @swagger
 * /api/cities/all:
 *   get:
 *     tags:
 *       - 城市管理
 *     summary: 获取所有城市（不分页）
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 */
router.get('/all', 
  cityController.getAllCities
);

/**
 * @swagger
 * /api/cities/{id}:
 *   get:
 *     tags:
 *       - 城市管理
 *     summary: 获取城市详情
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 城市ID
 *     responses:
 *       200:
 *         description: 获取成功
 *       404:
 *         description: 城市不存在
 */
router.get('/:id', 
  cityController.getCity
);

/**
 * @swagger
 * /api/cities:
 *   post:
 *     tags:
 *       - 城市管理
 *     summary: 创建城市
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CityCreate'
 *     responses:
 *       201:
 *         description: 创建成功
 *       400:
 *         description: 请求参数错误
 */
router.post('/', 
  authorize(['city:create']),
  validate(citySchemas.create),
  cityController.createCity
);

/**
 * @swagger
 * /api/cities/{id}:
 *   put:
 *     tags:
 *       - 城市管理
 *     summary: 更新城市
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 城市ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CityUpdate'
 *     responses:
 *       200:
 *         description: 更新成功
 *       404:
 *         description: 城市不存在
 */
router.put('/:id', 
  authorize(['city:update']),
  validate(citySchemas.update),
  cityController.updateCity
);

/**
 * @swagger
 * /api/cities/{id}:
 *   delete:
 *     tags:
 *       - 城市管理
 *     summary: 删除城市
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 城市ID
 *     responses:
 *       200:
 *         description: 删除成功
 *       404:
 *         description: 城市不存在
 */
router.delete('/:id', 
  authorize(['city:delete']),
  cityController.deleteCity
);

module.exports = router;