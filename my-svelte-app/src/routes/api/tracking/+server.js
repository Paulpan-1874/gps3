import prisma from '$lib/prisma.server.js'
import { json } from '@sveltejs/kit'

export async function POST({ request }) {
  try {
    // 获取前端传来的数据
    const data = await request.json()
    console.log('收到追踪请求数据:', data)
    
    const { phone, userId, isAdded, isValid, trackingResult } = data

    // 验证必要参数
    if (!phone || !userId) {
      console.error('缺少必要参数:', { phone, userId })
      return json({ error: '缺少必要参数' }, { status: 400 })
    }

    // 确保数据类型正确
    const parsedUserId = parseInt(userId)
    const parsedTrackingResult = trackingResult ? parseInt(trackingResult) : null

    // 每次操作都创建新记录
    console.log('准备创建追踪记录:', { phone, userId: parsedUserId, isAdded, isValid, trackingResult: parsedTrackingResult })
    const tracking = await prisma.tracking.create({
      data: {
        phone,
        userId: parsedUserId,
        isAdded: isAdded || false,
        isValid: isValid !== undefined ? isValid : true,
        trackingResult: parsedTrackingResult
      }
    })

    console.log('追踪记录创建成功:', tracking)
    // 返回成功结果
    return json(tracking, { status: 201 })

  } catch (error) {
    console.error('创建追踪记录失败:', error)
    return json({ error: '操作失败', details: error.message }, { status: 400 })
  }
}

export async function GET({ url }) {
  try {
    // 获取查询参数
    const phone = url.searchParams.get('phone')
    const userId = url.searchParams.get('userId')

    // 构建查询条件
    const where = {}
    if (phone) where.phone = phone
    if (userId) where.userId = parseInt(userId)

    // 查询跟踪记录
    const trackings = await prisma.tracking.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    console.log('获取追踪记录成功:', trackings)
    // 返回结果
    return json(trackings)

  } catch (error) {
    console.error('获取追踪记录失败:', error)
    return json({ error: '查询失败' }, { status: 500 })
  }
}
