import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

// 创建适配器
const adapter = new PrismaBetterSqlite3({ url: 'file:./prisma/dev.db' })

// 全局单例，避免热重载重复创建实例
const prisma = globalThis.prisma || new PrismaClient({
  adapter
})

// 开发环境下挂载到全局对象
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}

export default prisma