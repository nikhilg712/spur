import { PrismaClient } from "@prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
}

// Create adapter
const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || "file:./dev.db",
})

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ["query", "info", "warn", "error"],
  })


export default prisma