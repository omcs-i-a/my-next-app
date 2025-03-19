import { NextRequest, NextResponse } from 'next/server';

interface VerifyRequestBody {
    email: string;
    password: string;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json() as VerifyRequestBody;
        const { email, password } = body;

        // 環境変数から管理者認証情報を取得
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        // 認証情報が設定されていない場合はエラー
        if (!adminEmail || !adminPassword) {
            console.error('管理者認証情報が設定されていません。環境変数 ADMIN_EMAIL と ADMIN_PASSWORD を確認してください。');
            return NextResponse.json(
                { error: '管理者認証情報が設定されていません' },
                { status: 500 }
            );
        }

        // 認証チェック
        if (email === adminEmail && password === adminPassword) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json(
                { error: '無効な認証情報です' },
                { status: 401 }
            );
        }
    } catch (error) {
        console.error('認証処理中にエラーが発生しました:', error);
        return NextResponse.json(
            { error: '認証処理中にエラーが発生しました' },
            { status: 500 }
        );
    }
} 