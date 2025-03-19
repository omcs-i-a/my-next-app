import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { createVerificationToken } from '@/lib/token';
import { sendVerificationEmail } from '@/lib/mail';

const prisma = new PrismaClient();

type RegisterBody = {
    name: string;
    email: string;
    password: string;
};

export async function POST(req: NextRequest) {
    try {
        const { name, email, password } = await req.json() as RegisterBody;

        // バリデーション
        if (!name || !email || !password) {
            return NextResponse.json(
                { message: '必須項目が入力されていません。' },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                { message: 'パスワードは8文字以上で設定してください。' },
                { status: 400 }
            );
        }

        // メールアドレスの重複チェック
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { message: 'このメールアドレスは既に登録されています。' },
                { status: 409 }
            );
        }

        // パスワードのハッシュ化
        const hashedPassword = await hash(password, 12);

        // ユーザー作成（未認証状態）
        const user = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash: hashedPassword,
                emailVerified: null, // 未認証状態
            } as any, // 一時的にanyを使用
        });

        // メール認証用のトークンを生成
        const verificationToken = await createVerificationToken(email);

        // 認証メールを送信
        await sendVerificationEmail(email, verificationToken);

        // ユーザー情報を返す（パスワードは含めない）
        const userResponse = {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt
        };

        return NextResponse.json(
            {
                user: userResponse,
                message: 'アカウントが作成されました。メールアドレスの確認を行ってください。',
                requireVerification: true
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('ユーザー登録エラー:', error);
        return NextResponse.json(
            { message: 'アカウントの作成中にエラーが発生しました。' },
            { status: 500 }
        );
    }
} 