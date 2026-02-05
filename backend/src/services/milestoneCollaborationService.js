/**
 * 里程碑协作服务
 * 提供讨论、附件、活动日志等协作功能
 */

const databaseService = require('./databaseService')
const { v4: uuidv4 } = require('uuid')
const logger = require('../utils/logger')

/**
 * 创建讨论/评论
 */
async function createDiscussion(data) {
  try {
    const {
      milestoneId,
      projectId,
      userId,
      parentId = null,
      content,
      mentions = [],
      attachments = []
    } = data

    const discussionId = uuidv4()

    await databaseService.query(
      `INSERT INTO milestone_discussions 
       (id, milestone_id, project_id, user_id, parent_id, content, mentions, attachments)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        discussionId,
        milestoneId,
        projectId,
        userId,
        parentId,
        content,
        JSON.stringify(mentions),
        JSON.stringify(attachments)
      ]
    )

    // 如果是回复,更新父评论的回复数
    if (parentId) {
      await databaseService.query(
        'UPDATE milestone_discussions SET reply_count = reply_count + 1 WHERE id = ?',
        [parentId]
      )
    }

    // 记录活动日志
    await logActivity({
      milestoneId,
      projectId,
      userId,
      actionType: parentId ? 'reply' : 'comment',
      actionDescription: parentId ? '回复了评论' : '发表了评论',
      metadata: { discussionId, content: content.substring(0, 100) }
    })

    // 发送@提醒通知
    if (mentions.length > 0) {
      await sendMentionNotifications(milestoneId, userId, mentions, content)
    }

    // 通知关注者
    await notifyFollowers(milestoneId, userId, 'new_comment', { discussionId })

    logger.info(`创建讨论成功: ${discussionId}`)

    return await getDiscussionById(discussionId)
  } catch (error) {
    logger.error('创建讨论失败:', error)
    throw error
  }
}

/**
 * 获取讨论详情
 */
async function getDiscussionById(discussionId) {
  const [discussion] = await databaseService.query(
    `SELECT d.*, u.username, u.real_name
     FROM milestone_discussions d
     LEFT JOIN users u ON d.user_id = u.id
     WHERE d.id = ? AND d.is_deleted = 0`,
    [discussionId]
  )

  if (discussion) {
    discussion.mentions = JSON.parse(discussion.mentions || '[]')
    discussion.attachments = JSON.parse(discussion.attachments || '[]')
  }

  return discussion
}

/**
 * 获取里程碑讨论列表
 */
async function getDiscussions(milestoneId, options = {}) {
  const { page = 1, pageSize = 20, parentId = null } = options

  // 处理分页参数
  const pageNum = parseInt(page) || 1
  const pageSizeNum = parseInt(pageSize) || 20
  const offset = (pageNum - 1) * pageSizeNum

  let query = `
    SELECT d.*, u.username, u.real_name
    FROM milestone_discussions d
    LEFT JOIN users u ON d.user_id = u.id
    WHERE d.milestone_id = ? AND d.is_deleted = 0
  `
  const params = [milestoneId]

  if (parentId === null) {
    query += ' AND d.parent_id IS NULL'
  } else {
    query += ' AND d.parent_id = ?'
    params.push(parentId)
  }

  // 置顶优先,然后按时间倒序
  query += ' ORDER BY d.is_pinned DESC, d.created_at DESC LIMIT ? OFFSET ?'
  params.push(pageSizeNum, offset)

  const discussions = await databaseService.query(query, params)

  // 解析JSON字段
  discussions.forEach(d => {
    d.mentions = JSON.parse(d.mentions || '[]')
    d.attachments = JSON.parse(d.attachments || '[]')
  })

  // 获取总数
  let countQuery = 'SELECT COUNT(*) as total FROM milestone_discussions WHERE milestone_id = ? AND is_deleted = 0'
  const countParams = [milestoneId]

  if (parentId === null) {
    countQuery += ' AND parent_id IS NULL'
  } else {
    countQuery += ' AND parent_id = ?'
    countParams.push(parentId)
  }

  const [{ total }] = await databaseService.query(countQuery, countParams)

  return {
    list: discussions,
    total,
    page: pageNum,
    pageSize: pageSizeNum,
    totalPages: Math.ceil(total / pageSizeNum)
  }
}

/**
 * 点赞/取消点赞讨论
 */
async function toggleLike(discussionId, userId) {
  try {
    // 检查是否已点赞
    const [existing] = await databaseService.query(
      'SELECT id FROM discussion_likes WHERE discussion_id = ? AND user_id = ?',
      [discussionId, userId]
    )

    if (existing) {
      // 取消点赞
      await databaseService.query(
        'DELETE FROM discussion_likes WHERE discussion_id = ? AND user_id = ?',
        [discussionId, userId]
      )
      await databaseService.query(
        'UPDATE milestone_discussions SET like_count = like_count - 1 WHERE id = ?',
        [discussionId]
      )
      return { liked: false }
    } else {
      // 点赞
      const likeId = uuidv4()
      await databaseService.query(
        'INSERT INTO discussion_likes (id, discussion_id, user_id) VALUES (?, ?, ?)',
        [likeId, discussionId, userId]
      )
      await databaseService.query(
        'UPDATE milestone_discussions SET like_count = like_count + 1 WHERE id = ?',
        [discussionId]
      )
      return { liked: true }
    }
  } catch (error) {
    logger.error('点赞操作失败:', error)
    throw error
  }
}

/**
 * 上传附件
 */
async function uploadAttachment(data) {
  try {
    const {
      milestoneId,
      projectId,
      uploadedBy,
      fileName,
      fileSize,
      fileType,
      filePath,
      fileUrl,
      description = ''
    } = data

    const attachmentId = uuidv4()

    await databaseService.query(
      `INSERT INTO milestone_attachments 
       (id, milestone_id, project_id, uploaded_by, file_name, file_size, 
        file_type, file_path, file_url, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        attachmentId,
        milestoneId,
        projectId,
        uploadedBy,
        fileName,
        fileSize,
        fileType,
        filePath,
        fileUrl,
        description
      ]
    )

    // 记录活动日志
    await logActivity({
      milestoneId,
      projectId,
      userId: uploadedBy,
      actionType: 'attach',
      actionDescription: `上传了附件: ${fileName}`,
      metadata: { attachmentId, fileName, fileSize }
    })

    // 通知关注者
    await notifyFollowers(milestoneId, uploadedBy, 'new_attachment', { attachmentId, fileName })

    logger.info(`上传附件成功: ${attachmentId}`)

    return await getAttachmentById(attachmentId)
  } catch (error) {
    logger.error('上传附件失败:', error)
    throw error
  }
}

/**
 * 获取附件详情
 */
async function getAttachmentById(attachmentId) {
  const [attachment] = await databaseService.query(
    `SELECT a.*, u.username, u.real_name
     FROM milestone_attachments a
     LEFT JOIN users u ON a.uploaded_by = u.id
     WHERE a.id = ? AND a.is_deleted = 0`,
    [attachmentId]
  )

  return attachment
}

/**
 * 获取里程碑附件列表
 */
async function getAttachments(milestoneId, options = {}) {
  const { page = 1, pageSize = 20 } = options

  // 处理分页参数
  const pageNum = parseInt(page) || 1
  const pageSizeNum = parseInt(pageSize) || 20
  const offset = (pageNum - 1) * pageSizeNum

  const attachments = await databaseService.query(
    `SELECT a.*, u.username, u.real_name
     FROM milestone_attachments a
     LEFT JOIN users u ON a.uploaded_by = u.id
     WHERE a.milestone_id = ? AND a.is_deleted = 0
     ORDER BY a.created_at DESC
     LIMIT ? OFFSET ?`,
    [milestoneId, pageSizeNum, offset]
  )

  const [{ total }] = await databaseService.query(
    'SELECT COUNT(*) as total FROM milestone_attachments WHERE milestone_id = ? AND is_deleted = 0',
    [milestoneId]
  )

  return {
    list: attachments,
    total,
    page: pageNum,
    pageSize: pageSizeNum,
    totalPages: Math.ceil(total / pageSizeNum)
  }
}

/**
 * 增加附件下载次数
 */
async function incrementDownloadCount(attachmentId) {
  await databaseService.query(
    'UPDATE milestone_attachments SET download_count = download_count + 1 WHERE id = ?',
    [attachmentId]
  )
}

/**
 * 记录活动日志
 */
async function logActivity(data) {
  try {
    const {
      milestoneId,
      projectId,
      userId,
      actionType,
      actionDescription,
      oldValue = null,
      newValue = null,
      metadata = {},
      ipAddress = null,
      userAgent = null
    } = data

    const logId = uuidv4()

    await databaseService.query(
      `INSERT INTO milestone_activity_logs 
       (id, milestone_id, project_id, user_id, action_type, action_description,
        old_value, new_value, metadata, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        logId,
        milestoneId,
        projectId,
        userId,
        actionType,
        actionDescription,
        oldValue ? JSON.stringify(oldValue) : null,
        newValue ? JSON.stringify(newValue) : null,
        JSON.stringify(metadata),
        ipAddress,
        userAgent
      ]
    )

    return logId
  } catch (error) {
    logger.error('记录活动日志失败:', error)
    // 不抛出错误,避免影响主流程
  }
}

/**
 * 获取活动日志
 */
async function getActivityLogs(milestoneId, options = {}) {
  const { page = 1, pageSize = 50, actionType = null } = options

  // 处理分页参数
  const pageNum = parseInt(page) || 1
  const pageSizeNum = parseInt(pageSize) || 50
  const offset = (pageNum - 1) * pageSizeNum

  let query = `
    SELECT l.*, u.username, u.real_name
    FROM milestone_activity_logs l
    LEFT JOIN users u ON l.user_id = u.id
    WHERE l.milestone_id = ?
  `
  const params = [milestoneId]

  if (actionType) {
    query += ' AND l.action_type = ?'
    params.push(actionType)
  }

  query += ' ORDER BY l.created_at DESC LIMIT ? OFFSET ?'
  params.push(pageSizeNum, offset)

  const logs = await databaseService.query(query, params)

  // 解析JSON字段
  logs.forEach(log => {
    log.metadata = JSON.parse(log.metadata || '{}')
    if (log.old_value) log.old_value = JSON.parse(log.old_value)
    if (log.new_value) log.new_value = JSON.parse(log.new_value)
  })

  let countQuery = 'SELECT COUNT(*) as total FROM milestone_activity_logs WHERE milestone_id = ?'
  const countParams = [milestoneId]

  if (actionType) {
    countQuery += ' AND action_type = ?'
    countParams.push(actionType)
  }

  const [{ total }] = await databaseService.query(countQuery, countParams)

  return {
    list: logs,
    total,
    page: pageNum,
    pageSize: pageSizeNum,
    totalPages: Math.ceil(total / pageSizeNum)
  }
}

/**
 * 关注/取消关注里程碑
 */
async function toggleFollow(milestoneId, projectId, userId) {
  try {
    const [existing] = await databaseService.query(
      'SELECT id FROM milestone_followers WHERE milestone_id = ? AND user_id = ?',
      [milestoneId, userId]
    )

    if (existing) {
      // 取消关注
      await databaseService.query(
        'DELETE FROM milestone_followers WHERE milestone_id = ? AND user_id = ?',
        [milestoneId, userId]
      )
      return { following: false }
    } else {
      // 关注
      const followId = uuidv4()
      await databaseService.query(
        'INSERT INTO milestone_followers (id, milestone_id, project_id, user_id) VALUES (?, ?, ?, ?)',
        [followId, milestoneId, projectId, userId]
      )
      return { following: true }
    }
  } catch (error) {
    logger.error('关注操作失败:', error)
    throw error
  }
}

/**
 * 获取里程碑关注者
 */
async function getFollowers(milestoneId) {
  const followers = await databaseService.query(
    `SELECT f.*, u.username, u.real_name, u.email
     FROM milestone_followers f
     LEFT JOIN users u ON f.user_id = u.id
     WHERE f.milestone_id = ?`,
    [milestoneId]
  )

  return followers
}

/**
 * 发送@提醒通知
 */
async function sendMentionNotifications(milestoneId, fromUserId, mentionedUserIds, content) {
  try {
    for (const userId of mentionedUserIds) {
      if (userId === fromUserId) continue // 不通知自己

      await databaseService.query(
        `INSERT INTO system_notifications 
         (id, user_id, type, title, content, related_id, related_type)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          uuidv4(),
          userId,
          'mention',
          '有人@了你',
          content.substring(0, 200),
          milestoneId,
          'milestone'
        ]
      )
    }
  } catch (error) {
    logger.error('发送@提醒通知失败:', error)
  }
}

/**
 * 通知关注者
 */
async function notifyFollowers(milestoneId, fromUserId, eventType, metadata = {}) {
  try {
    const followers = await databaseService.query(
      'SELECT user_id FROM milestone_followers WHERE milestone_id = ? AND notification_enabled = 1',
      [milestoneId]
    )

    const titles = {
      new_comment: '里程碑有新评论',
      new_attachment: '里程碑有新附件',
      status_change: '里程碑状态变更'
    }

    for (const follower of followers) {
      if (follower.user_id === fromUserId) continue // 不通知操作者自己

      await databaseService.query(
        `INSERT INTO system_notifications 
         (id, user_id, type, title, content, related_id, related_type)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          uuidv4(),
          follower.user_id,
          eventType,
          titles[eventType] || '里程碑更新',
          JSON.stringify(metadata),
          milestoneId,
          'milestone'
        ]
      )
    }
  } catch (error) {
    logger.error('通知关注者失败:', error)
  }
}

module.exports = {
  createDiscussion,
  getDiscussionById,
  getDiscussions,
  toggleLike,
  uploadAttachment,
  getAttachmentById,
  getAttachments,
  incrementDownloadCount,
  logActivity,
  getActivityLogs,
  toggleFollow,
  getFollowers
}
