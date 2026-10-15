import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../../prisma/generated/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const connectionUrl = process.env.DATABASE_URL || "file:./dev.db";
  const adapter = new PrismaBetterSqlite3({ url: connectionUrl.replace(/^file:/, "") });
  return new PrismaClient({ adapter });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

export function hasDatabaseConfig(): boolean {
  return /^file:/.test(process.env.DATABASE_URL || "file:./dev.db");
}
