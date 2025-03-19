import { PrismaClient } from "@prisma/client";

/**
 * グローバルスコープでのPrismaインスタンス型定義
 */
const globalForPrisma = global as unknown as {
    prisma: PrismaClient | undefined;
};

/**
 * シングルトンパターンでPrismaClientをエクスポート
 * 開発環境では詳細なログを出力し、本番環境ではエラーのみ
 */
export const db =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: process.env.NODE_ENV === "development"
            ? ["query", "error", "warn"]
            : ["error"],
    });

// 開発環境時のみグローバル変数にキャッシュ
if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = db;
} 