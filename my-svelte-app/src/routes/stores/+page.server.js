import prisma from '$lib/prisma.server.js'

// 服务端load函数，只会在服务端执行
export async function load() {
  // 查询最新的100个店铺（按创建时间倒序）
  const stores = await prisma.store.findMany({
    orderBy: { createdAt: 'desc' },  // 按创建时间倒序
    take: 100  // 只取前100个
  })

  // 返回数据给前端页面
  return {
    stores
  }
}