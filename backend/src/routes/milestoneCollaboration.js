/**
 * 里程碑协作路由
 */

const express = require('express')
const router = express.Router()
const collaborationController = require('../controllers/milestoneCollaborationController')
const { authenticate } = require('../middlewares/auth')

// 所有路由都需要认证
router.use(authenticate)

/**
 * 讨论相关
 */

// 创建讨论/评论
router.post('/discussions', collaborationController.createDiscussion)

// 获取讨论列表
router.get('/discussions/:milestoneId', collaborationController.getDiscussions)

// 点赞/取消点赞
router.post('/discussions/:id/like', collaborationController.toggleLike)

/**
 * 附件相关
 */

// 上传附件
router.post(
  '/attachments',
  collaborationController.upload.single('file'),
  collaborationController.uploadAttachment
)

// 获取附件列表
router.get('/attachments/:milestoneId', collaborationController.getAttachments)

// 下载附件
router.get('/attachments/:id/download', collaborationController.downloadAttachment)

/**
 * 活动日志
 */

// 获取活动日志
router.get('/activities/:milestoneId', collaborationController.getActivityLogs)

/**
 * 关注相关
 */

// 关注/取消关注
router.post('/follow', collaborationController.toggleFollow)

// 获取关注者列表
router.get('/followers/:milestoneId', collaborationController.getFollowers)

module.exports = router
