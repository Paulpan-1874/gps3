import prisma from '$lib/prisma.server.js'
import { json } from '@sveltejs/kit'

export async function POST({ request }) {
  try {
    // 获取前端传来的数据
    const data = await request.json()

    // 检查是否是批量创建
    if (Array.isArray(data)) {
      // 批量创建店铺
      const stores = await prisma.store.createMany({
        data: data
      })

      // 返回成功结果
      return json({ count: stores.count }, { status: 201 })
    } else {
      // 单个创建店铺
      const { name, phone, address } = data
      const store = await prisma.store.create({
        data: {
          name,
          phone,
          address
        }
      })

      // 返回成功结果
      return json(store, { status: 201 })
    }

  } catch (error) {
    return json({ error: '创建失败' }, { status: 400 })
  }
}

export async function GET() {
  try {
    // 查询最新的100个店铺（按创建时间倒序）
    const stores = await prisma.store.findMany({
      orderBy: { createdAt: 'desc' },  // 按创建时间倒序
      take: 100  // 只取前100个
    })

    // 返回结果
    return json(stores)

  } catch (error) {
    return json({ error: '查询失败' }, { status: 500 })
  }
}