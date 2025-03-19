import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/token';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    try {
        // URLからトークンを取得
        const { searchParams } = new URL(req.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json(
                { success: false, message: '無効なトークンです。' },
                { status: 400 }
            );
        }

        // トークンを検証
        const email = await verifyToken(token);

        if (!email) {
            return NextResponse.json(
                { success: false, message: 'トークンが無効か期限切れです。' },
                { status: 400 }
            );
        }

        // ユーザーのemailVerifiedを更新
        await prisma.user.update({
            where: { email },
            data: { emailVerified: new Date() }
        });

        // 成功レスポンス
        return NextResponse.json({
            success: true,
            message: 'メールアドレスが確認されました。'
        });
    } catch (error) {
        console.error('メール認証エラー:', error);
        return NextResponse.json(
            { success: false, message: '認証処理中にエラーが発生しました。' },
            { status: 500 }
        );
    }
} 