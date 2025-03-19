import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Next.js 15.2.2の新しいルート形式を使用：URLからパラメータを抽出
export async function GET(request: Request) {
    // URLからテーブル名を抽出
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const tableName = pathParts[pathParts.length - 1]; // 最後のパスセグメントを取得

    // セキュリティ: テーブル名のバリデーション（英数字とアンダースコアのみ許可）
    if (!tableName.match(/^[a-zA-Z0-9_]+$/)) {
        return NextResponse.json(
            { error: '無効なテーブル名です' },
            { status: 400 }
        );
    }

    try {
        // テーブルのレコードを取得
        const records = await prisma.$queryRawUnsafe(
            `SELECT * FROM "${tableName}" LIMIT 100`
        );

        return NextResponse.json({ records });
    } catch (error) {
        console.error(`${tableName}テーブルの取得中にエラーが発生しました:`, error);
        return NextResponse.json(
            { error: `${tableName}テーブルの取得に失敗しました` },
            { status: 500 }
        );
    }
} 