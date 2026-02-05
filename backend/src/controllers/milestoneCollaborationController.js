/**
 * 里程碑协作控制器
 */

const collaborationService = require('../services/milestoneCollaborationService')
const logger = require('../utils/logger')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

// 配置文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads/milestones')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: function (req, file, cb) {
    // 允许的文件类型
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|ppt|pptx|txt|zip|rar/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)
    
    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new Error('不支持的文件类型'))
    }
  }
})

/**
 * 创建讨论
 * POST /api/milestone-collaboration/discussions
 */
async function createDiscussion(req, res) {
  try {
    const { milestoneId, projectId, content, parentId, mentions, attachments } = req.body
    const userId = req.user.id

    if (!milestoneId || !projectId || !content) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      })
    }

    const discussion = await collaborationService.createDiscussion({
      milestoneId,
      projectId,
      userId,
      parentId,
      content,
      mentions: mentions || [],
      attachments: attachments || []
    })

    res.json({
      success: true,
      message: '发表成功',
      data: discussion
    })
  } catch (error) {
    logger.error('创建讨论失败:', error)
    res.status(500).json({
      success: false,
      message: '发表失败',
      error: error.message
    })
  }
}

/**
 * 获取讨论列表
 * GET /api/milestone-collaboration/discussions/:milestoneId
 */
async function getDiscussions(req, res) {
  try {
    const { milestoneId } = req.params
    const { page, pageSize, parentId } = req.query

    const result = await collaborationService.getDiscussions(milestoneId, {
      page,
      pageSize,
      parentId: parentId === 'null' ? null : parentId
    })

    res.json({
      success: true,
      data: result
    })
  } catch (error) {
    logger.error('获取讨论列表失败:', error)
    res.status(500).json({
      success: false,
      message: '获取失败',
      error: error.message
    })
  }
}

/**
 * 点赞/取消点赞
 * POST /api/milestone-collaboration/discussions/:id/like
 */
async function toggleLike(req, res) {
  try {
    const { id } = req.params
    const userId = req.user.id

    const result = await collaborationService.toggleLike(id, userId)

    res.json({
      success: true,
      message: result.liked ? '点赞成功' : '取消点赞',
      data: result
    })
  } catch (error) {
    logger.error('点赞操作失败:', error)
    res.status(500).json({
      success: false,
      message: '操作失败',
      error: error.message
    })
  }
}

/**
 * 上传附件
 * POST /api/milestone-collaboration/attachments
 */
async function uploadAttachment(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '请选择文件'
      })
    }

    const { milestoneId, projectId, description } = req.body
    const userId = req.user.id

    if (!milestoneId || !projectId) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      })
    }

    const attachment = await collaborationService.uploadAttachment({
      milestoneId,
      projectId,
      uploadedBy: userId,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
      filePath: req.file.path,
      fileUrl: `/uploads/milestones/${req.file.filename}`,
      description
    })

    res.json({
      success: true,
      message: '上传成功',
      data: attachment
    })
  } catch (error) {
    logger.error('上传附件失败:', error)
    res.status(500).json({
      success: false,
      message: '上传失败',
      error: error.message
    })
  }
}

/**
 * 获取附件列表
 * GET /api/milestone-collaboration/attachments/:milestoneId
 */
async function getAttachments(req, res) {
  try {
    const { milestoneId } = req.params
    const { page, pageSize } = req.query

    const result = await collaborationService.getAttachments(milestoneId, {
      page,
      pageSize
    })

    res.json({
      success: true,
      data: result
    })
  } catch (error) {
    logger.error('获取附件列表失败:', error)
    res.status(500).json({
      success: false,
      message: '获取失败',
      error: error.message
    })
  }
}

/**
 * 下载附件
 * GET /api/milestone-collaboration/attachments/:id/download
 */
async function downloadAttachment(req, res) {
  try {
    const { id } = req.params

    const attachment = await collaborationService.getAttachmentById(id)

    if (!attachment) {
      return res.status(404).json({
        success: false,
        message: '附件不存在'
      })
    }

    // 增加下载次数
    await collaborationService.incrementDownloadCount(id)

    // 发送文件
    res.download(attachment.file_path, attachment.file_name)
  } catch (error) {
    logger.error('下载附件失败:', error)
    res.status(500).json({
      success: false,
      message: '下载失败',
      error: error.message
    })
  }
}

/**
 * 获取活动日志
 * GET /api/milestone-collaboration/activities/:milestoneId
 */
async function getActivityLogs(req, res) {
  try {
    const { milestoneId } = req.params
    const { page, pageSize, actionType } = req.query

    const result = await collaborationService.getActivityLogs(milestoneId, {
      page,
      pageSize,
      actionType
    })

    res.json({
      success: true,
      data: result
    })
  } catch (error) {
    logger.error('获取活动日志失败:', error)
    res.status(500).json({
      success: false,
      message: '获取失败',
      error: error.message
    })
  }
}

/**
 * 关注/取消关注
 * POST /api/milestone-collaboration/follow
 */
async function toggleFollow(req, res) {
  try {
    const { milestoneId, projectId } = req.body
    const userId = req.user.id

    if (!milestoneId || !projectId) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      })
    }

    const result = await collaborationService.toggleFollow(milestoneId, projectId, userId)

    res.json({
      success: true,
      message: result.following ? '关注成功' : '取消关注',
      data: result
    })
  } catch (error) {
    logger.error('关注操作失败:', error)
    res.status(500).json({
      success: false,
      message: '操作失败',
      error: error.message
    })
  }
}

/**
 * 获取关注者列表
 * GET /api/milestone-collaboration/followers/:milestoneId
 */
async function getFollowers(req, res) {
  try {
    const { milestoneId } = req.params

    const followers = await collaborationService.getFollowers(milestoneId)

    res.json({
      success: true,
      data: followers
    })
  } catch (error) {
    logger.error('获取关注者失败:', error)
    res.status(500).json({
      success: false,
      message: '获取失败',
      error: error.message
    })
  }
}

module.exports = {
  createDiscussion,
  getDiscussions,
  toggleLike,
  uploadAttachment,
  getAttachments,
  downloadAttachment,
  getActivityLogs,
  toggleFollow,
  getFollowers,
  upload
}
