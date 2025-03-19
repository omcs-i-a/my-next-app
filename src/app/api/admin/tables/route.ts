import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        // PostgreSQLのシステムビューを使ってテーブル一覧を取得
        const tablesQuery = await prisma.$queryRaw`
      SELECT 
        tablename as name 
      FROM 
        pg_catalog.pg_tables 
      WHERE 
        schemaname='public'
    `;

        const tables = await Promise.all(
            (tablesQuery as { name: string }[]).map(async (table) => {
                // 各テーブルのレコード数を取得
                const countQuery = await prisma.$queryRawUnsafe(
                    `SELECT COUNT(*) as count FROM "${table.name}"`
                );
                return {
                    name: table.name,
                    count: Number((countQuery as { count: bigint }[])[0].count)
                };
            })
        );

        return NextResponse.json({ tables });
    } catch (error) {
        console.error('テーブル一覧の取得中にエラーが発生しました:', error);
        return NextResponse.json(
            { error: 'テーブル一覧の取得に失敗しました' },
            { status: 500 }
        );
    }
} 