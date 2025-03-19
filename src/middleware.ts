import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// 保護するパス
const protectedPaths = ['/chat', '/admin/dashboard', '/admin/table'];

// 公開パス
const publicPaths = ['/', '/auth/signin', '/auth/signup', '/auth/signout', '/api/auth', '/admin'];

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // API ルートや静的ファイルは無視
    if (
        path.startsWith('/_next') ||
        path.startsWith('/api/') ||
        path.startsWith('/static/') ||
        path.includes('.')
    ) {
        return NextResponse.next();
    }

    // 常に公開されているパスはスキップ
    if (publicPaths.some(p => path === p || path.startsWith(p + '/'))) {
        return NextResponse.next();
    }

    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET
    });

    // 保護されたパスにアクセスしようとしていて、認証されていない場合
    if (protectedPaths.some(p => path === p || path.startsWith(p + '/')) && !token) {
        // 管理者ページの場合は管理者ログインページにリダイレクト
        if (path.startsWith('/admin/')) {
            return NextResponse.redirect(new URL('/admin', request.url));
        }

        // それ以外はNextAuthのログインページにリダイレクト
        const url = new URL('/auth/signin', request.url);
        url.searchParams.set('callbackUrl', encodeURI(request.url));
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

// ミドルウェアを適用するパスを指定
export const config = {
    matcher: [
        /*
         * 以下のパスに一致しないルートにミドルウェアを適用:
         * - API ルート (/api/*)
         * - 静的アセット (/static/*)
         * - _next 関連のファイル
         * - 画像やファイル等
         */
        '/((?!api|_next|static|.*\\.).*)'
    ]
}; 