import { getAuthSession, getSessionUserId } from '@/lib/session';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getMyPosts } from '@/app/actions/post-actions';
import { getUserChats } from '@/app/actions/chat-actions';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

export const dynamic = 'force-dynamic';

/**
 * ダッシュボードページのメインコンポーネント
 * サーバーコンポーネント内で認証チェックを行い、
 * 未認証ユーザーをログインページにリダイレクト
 */
export default async function DashboardPage() {
    // 認証チェック - 未認証ユーザーはログインページにリダイレクト
    const session = await getAuthSession();
    const userId = getSessionUserId(session);

    // 自分の投稿を取得（最新5件）
    const { posts = [] } = await getMyPosts(1, 5);

    // 自分のチャットを取得
    const { chats = [] } = await getUserChats();

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8">ダッシュボード</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* 最近の投稿セクション */}
                <section className="bg-white p-6 rounded-lg shadow">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">最近の投稿</h2>
                        <Link href="/posts/create" className="text-blue-500 hover:text-blue-700 text-sm">
                            新規投稿作成
                        </Link>
                    </div>

                    {posts.length === 0 ? (
                        <p className="text-gray-500 py-4 text-center">
                            まだ投稿がありません。最初の投稿を作成しましょう！
                        </p>
                    ) : (
                        <ul className="space-y-4">
                            {posts.map((post) => (
                                <li key={post.id} className="border-b pb-4 last:border-b-0">
                                    <Link href={`/posts/${post.id}`} className="block">
                                        <h3 className="font-medium hover:text-blue-600">{post.title}</h3>
                                        <div className="text-xs text-gray-500 flex justify-between mt-1">
                                            <span>
                                                {format(new Date(post.createdAt), 'yyyy年MM月dd日', { locale: ja })}
                                            </span>
                                            <span className="flex items-center">
                                                {post.published ?
                                                    <span className="text-green-600">公開中</span> :
                                                    <span className="text-yellow-600">非公開</span>
                                                }
                                            </span>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}

                    <div className="mt-4 text-right">
                        <Link href="/posts?my=true" className="text-blue-500 hover:text-blue-700 text-sm">
                            すべての投稿を見る →
                        </Link>
                    </div>
                </section>

                {/* 最近のチャットセクション */}
                <section className="bg-white p-6 rounded-lg shadow">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">チャット</h2>
                        <Link href="/chats/create" className="text-blue-500 hover:text-blue-700 text-sm">
                            新規チャット作成
                        </Link>
                    </div>

                    {chats.length === 0 ? (
                        <p className="text-gray-500 py-4 text-center">
                            チャットはまだありません。新しいチャットを始めましょう！
                        </p>
                    ) : (
                        <ul className="space-y-4">
                            {chats.slice(0, 5).map((chat) => (
                                <li key={chat.id} className="border-b pb-4 last:border-b-0">
                                    <Link href={`/chats/${chat.id}`} className="block">
                                        <h3 className="font-medium hover:text-blue-600">
                                            {chat.name || `${chat.participants.map(p => p.userName).join(', ')}`}
                                        </h3>
                                        <div className="text-xs text-gray-500 flex justify-between mt-1">
                                            <span>{chat.participants.length}人の参加者</span>
                                            <span>
                                                {format(new Date(chat.updatedAt), 'yyyy年MM月dd日', { locale: ja })}
                                            </span>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}

                    <div className="mt-4 text-right">
                        <Link href="/chats" className="text-blue-500 hover:text-blue-700 text-sm">
                            すべてのチャットを見る →
                        </Link>
                    </div>
                </section>

                {/* プロフィールセクション */}
                <section className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">プロフィール</h2>

                    <div className="flex items-center mb-4">
                        {session.user.image ? (
                            <img
                                src={session.user.image}
                                alt={session.user.name || 'プロフィール画像'}
                                className="w-16 h-16 rounded-full mr-4"
                            />
                        ) : (
                            <div className="w-16 h-16 bg-gray-200 rounded-full mr-4 flex items-center justify-center">
                                <span className="text-2xl text-gray-500">
                                    {(session.user.name || 'U').charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}

                        <div>
                            <h3 className="font-medium">{session.user.name || 'ユーザー'}</h3>
                            <p className="text-sm text-gray-500">{session.user.email}</p>
                        </div>
                    </div>

                    <div className="text-right">
                        <Link href="/profile" className="text-blue-500 hover:text-blue-700 text-sm">
                            プロフィールを編集 →
                        </Link>
                    </div>
                </section>

                {/* 設定セクション */}
                <section className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">クイックアクセス</h2>

                    <div className="grid grid-cols-2 gap-4">
                        <Link
                            href="/posts"
                            className="p-4 border rounded-lg hover:bg-gray-50 flex flex-col items-center text-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                            </svg>
                            <span>投稿一覧</span>
                        </Link>

                        <Link
                            href="/chats"
                            className="p-4 border rounded-lg hover:bg-gray-50 flex flex-col items-center text-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span>チャット</span>
                        </Link>

                        <Link
                            href="/profile"
                            className="p-4 border rounded-lg hover:bg-gray-50 flex flex-col items-center text-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>プロフィール</span>
                        </Link>

                        <Link
                            href="/settings"
                            className="p-4 border rounded-lg hover:bg-gray-50 flex flex-col items-center text-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>設定</span>
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
} 