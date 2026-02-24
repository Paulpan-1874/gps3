import prisma from '$lib/prisma.server.js'
import { json } from '@sveltejs/kit'

export async function POST({ request }) {
  try {
    // 获取前端传来的数据
    const { phone, userId, isAdded, isValid } = await request.json()

    // 每次操作都创建新记录
    const tracking = await prisma.tracking.create({
      data: {
        phone,
        userId,
        isAdded: isAdded || false,
        isValid: isValid !== undefined ? isValid : true
      }
    })

    // 返回成功结果
    return json(tracking, { status: 201 })

  } catch (error) {
    return json({ error: '操作失败' }, { status: 400 })
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
      where
    })

    // 返回结果
    return json(trackings)

  } catch (error) {
    return json({ error: '查询失败' }, { status: 500 })
  }
}