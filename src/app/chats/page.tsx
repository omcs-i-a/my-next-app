import { Suspense } from 'react';
import { getAuthSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import ChatList from './ChatList';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

/**
 * チャット一覧ページのメインコンポーネント
 * サーバーコンポーネント内で認証チェックを行い、
 * 未認証ユーザーをログインページにリダイレクト
 */
export default async function ChatsPage() {
    // 認証チェック - 未認証ユーザーはログインページにリダイレクト
    const session = await getAuthSession();

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">チャット一覧</h1>
                <Link
                    href="/chats/create"
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    新規チャット作成
                </Link>
            </div>

            <Suspense fallback={<ChatListSkeleton />}>
                <ChatList />
            </Suspense>
        </div>
    );
}

/**
 * チャット一覧の読み込み中表示用スケルトンコンポーネント
 */
function ChatListSkeleton() {
    return (
        <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white p-4 rounded-lg shadow">
                    <div className="h-6 bg-gray-200 rounded mb-2 w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="flex justify-between">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                </div>
            ))}
        </div>
    );
} 