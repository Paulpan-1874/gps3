import prisma from '$lib/prisma.server.js'
import { json } from '@sveltejs/kit'

export async function POST({ request }) {
  try {
    // 1. 获取前端传来的数据
    const { username } = await request.json()

    // 2. 创建用户
    const user = await prisma.user.create({
      data: {
        username
      }
    })

    // 3. 返回成功结果
    return json({
      id: user.id,
      username: user.username
    }, { status: 201 })

  } catch (error) {
    // 如果用户名重复，Prisma 会报错
    return json({ error: '创建失败，用户名可能已存在' }, { status: 400 })
  }
}