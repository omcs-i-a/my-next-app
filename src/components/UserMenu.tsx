'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function UserMenu() {
    const { data: session, status } = useSession();
    const isLoading = status === 'loading';

    if (isLoading) {
        return <div className="text-sm text-gray-600">ロード中...</div>;
    }

    if (!session) {
        return (
            <div className="flex space-x-2">
                <Link
                    href="/auth/signin"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition"
                >
                    ログイン
                </Link>
                <Link
                    href="/auth/signup"
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition"
                >
                    新規登録
                </Link>
            </div>
        );
    }

    return (
        <div className="relative flex items-center">
            <div className="flex items-center space-x-2">
                {session.user?.image ? (
                    <img
                        src={session.user.image}
                        alt={session.user?.name || 'ユーザー'}
                        width={32}
                        height={32}
                        className="rounded-full w-8 h-8"
                    />
                ) : (
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500">
                        {session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || 'U'}
                    </div>
                )}
                <div className="hidden md:block text-sm font-medium">
                    {session.user?.name || session.user?.email || 'ユーザー'}
                </div>
            </div>
            <div className="ml-2">
                <button
                    onClick={() => signOut({ callbackUrl: '/auth/signout' })}
                    className="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 transition"
                >
                    ログアウト
                </button>
            </div>
        </div>
    );
} 