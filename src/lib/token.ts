import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// ランダムトークンを生成
export function generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
}

// メール認証用トークンを作成して保存
export async function createVerificationToken(email: string): Promise<string> {
    // 既存のトークンをクリーンアップ
    await prisma.verificationToken.deleteMany({
        where: {
            identifier: email,
            type: 'verification',
        },
    });

    // 新しいトークンを作成（24時間有効）
    const token = generateToken();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24時間後

    await prisma.verificationToken.create({
        data: {
            identifier: email,
            token,
            expires,
            type: 'verification',
        },
    });

    return token;
}

// 認証トークンを検証
export async function verifyToken(token: string, type: string = 'verification'): Promise<string | null> {
    // トークンを検索
    const verificationToken = await prisma.verificationToken.findFirst({
        where: {
            token,
            type,
            expires: {
                gt: new Date(),
            },
        },
    });

    // トークンが見つからないか、期限切れの場合
    if (!verificationToken) {
        return null;
    }

    // 検証に成功した場合、そのトークンを使用したメールアドレスを返す
    const { identifier } = verificationToken;

    // 使用済みトークンを削除（ワンタイムトークン）
    await prisma.verificationToken.delete({
        where: {
            identifier_token: {
                identifier: verificationToken.identifier,
                token: verificationToken.token,
            },
        },
    });

    return identifier;
} 