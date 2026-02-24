import prisma from '$lib/prisma.server.js'

// 服务端load函数，只会在服务端执行
export async function load() {
  // 查询所有用户
  const users = await prisma.user.findMany()

  // 返回数据给前端页面
  return {
    users
  }
}