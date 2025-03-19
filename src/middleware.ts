import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * 認証が必要なパスのパターン
 */
const authRequiredPaths = [
    '/dashboard',
    '/profile',
    '/posts/create',
    '/posts/edit',
    '/chats',
    '/admin',
];

/**
 * 管理者権限が必要なパスのパターン
 */
const adminRequiredPaths = [
    '/admin',
];

/**
 * 公開ファイルパスのパターン（静的ファイル等）
 */
const publicFilePaths = [
    '/favicon.ico',
    '/_next',
    '/images',
    '/fonts',
    '/api/auth',
];

/**
 * ミドルウェア関数
 * 各リクエストに対して実行される
 */
export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 公開ファイルへのアクセスはスキップ
    if (publicFilePaths.some(path => pathname.startsWith(path))) {
        return NextResponse.next();
    }

    // 認証が必要なパスかチェック
    const isAuthRequired = authRequiredPaths.some(path => pathname.startsWith(path));

    if (isAuthRequired) {
        // JWTトークンを取得して認証チェック
        const token = await getToken({
            req: request,
            secret: process.env.NEXTAUTH_SECRET,
        });

        // 未認証の場合はログインページにリダイレクト
        if (!token) {
            const redirectUrl = new URL('/login', request.url);
            redirectUrl.searchParams.set('callbackUrl', encodeURI(request.url));
            return NextResponse.redirect(redirectUrl);
        }

        // 管理者権限が必要なパスかチェック
        const isAdminRequired = adminRequiredPaths.some(path => pathname.startsWith(path));

        if (isAdminRequired && token.role !== 'ADMIN') {
            // 管理者でない場合は403ページにリダイレクト
            return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
    }

    // レスポンスヘッダーにセキュリティ関連の設定を追加
    const response = NextResponse.next();

    // XSS対策
    response.headers.set('X-XSS-Protection', '1; mode=block');

    // クリックジャッキング対策
    response.headers.set('X-Frame-Options', 'DENY');

    // MIME型スニッフィング防止
    response.headers.set('X-Content-Type-Options', 'nosniff');

    // CSP（コンテンツセキュリティポリシー）
    response.headers.set(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;"
    );

    // Referrer-Policy
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // HSTS
    if (process.env.NODE_ENV === 'production') {
        response.headers.set(
            'Strict-Transport-Security',
            'max-age=63072000; includeSubDomains; preload'
        );
    }

    return response;
}

/**
 * matcher設定
 * 指定したパスのみにミドルウェアを適用する
 */
export const config = {
    matcher: [
        // 認証が必要なパス
        '/dashboard/:path*',
        '/profile/:path*',
        '/posts/create/:path*',
        '/posts/edit/:path*',
        '/chats/:path*',
        '/admin/:path*',

        // APIルート（/api/auth は除外）
        '/api/:path*',

        // その他のページ
        '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
    ],
}; 