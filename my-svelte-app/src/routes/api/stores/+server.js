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

export async function GET({ url }) {
  try {
    // 获取查询参数
    const action = url.searchParams.get('action')
    
    if (action === 'random') {
      // 1. 随机选择一个店铺获取电话号码
      const randomStore = await prisma.$queryRaw`
        SELECT * FROM Store ORDER BY RANDOM() LIMIT 1
      `
      
      if (randomStore && randomStore.length > 0) {
        const selectedStore = randomStore[0]
        const phone = selectedStore.phone
        
        // 2. 查找该电话号码对应的所有店铺
        const allStoresWithSamePhone = await prisma.store.findMany({
          where: { phone }
        })
        
        console.log('随机选择的电话号码:', phone)
        console.log('该号码对应的店铺:', allStoresWithSamePhone)
        
        return json({
          phone,
          stores: allStoresWithSamePhone
        })
      }
      
      return json({ error: '暂无店铺' }, { status: 404 })
    }
    
    // 默认查询最新的100个店铺（按创建时间倒序）
    const stores = await prisma.store.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100
    })

    // 返回结果
    return json(stores)

  } catch (error) {
    return json({ error: '查询失败' }, { status: 500 })
  }
}