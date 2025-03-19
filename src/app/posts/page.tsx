import { Suspense } from 'react';
import { getAuthSession } from '@/lib/session';
import { getPosts } from '@/app/actions/post-actions';
import Link from 'next/link';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

export const dynamic = 'force-dynamic';

/**
 * 投稿一覧ページのメインコンポーネント
 * ページ内で認証チェックを行います
 */
export default async function PostsPage({
    searchParams,
}: {
    searchParams: { page?: string };
}) {
    // 認証チェック - 未認証ユーザーも閲覧可能だが、セッション情報は取得
    const session = await getAuthSession();
    const isAuthenticated = !!session;

    // ページネーション用パラメータ
    const currentPage = Number(searchParams.page) || 1;
    const perPage = 10;

    // 投稿一覧を取得
    const { posts = [], totalPages = 1, error } = await getPosts(currentPage, perPage);

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">投稿一覧</h1>

                {isAuthenticated ? (
                    <Link
                        href="/posts/create"
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        新規投稿作成
                    </Link>
                ) : (
                    <Link
                        href="/login?callbackUrl=/posts/create"
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    >
                        ログインして投稿
                    </Link>
                )}
            </div>

            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-6">
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            {posts.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow text-center">
                    <p className="text-gray-600 mb-4">投稿はまだありません</p>
                    {isAuthenticated ? (
                        <p className="text-gray-500">最初の投稿を作成しましょう！</p>
                    ) : (
                        <p className="text-gray-500">ログインして最初の投稿を作成しましょう</p>
                    )}
                </div>
            ) : (
                <div className="space-y-6">
                    {posts.map((post) => (
                        <article key={post.id} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                            <Link href={`/posts/${post.id}`}>
                                <h2 className="text-xl font-bold mb-2 hover:text-blue-600">{post.title}</h2>
                            </Link>

                            <div className="text-sm text-gray-500 mb-4">
                                <span>{post.author.name || '匿名ユーザー'}</span>
                                <span className="mx-2">•</span>
                                <time dateTime={post.createdAt.toISOString()}>
                                    {format(new Date(post.createdAt), 'yyyy年MM月dd日', { locale: ja })}
                                </time>
                                <span className="mx-2">•</span>
                                <span>コメント {post.commentCount}</span>
                            </div>

                            <p className="text-gray-700 mb-4 line-clamp-3">
                                {post.content}
                            </p>

                            <Link
                                href={`/posts/${post.id}`}
                                className="text-blue-500 hover:text-blue-700 text-sm"
                            >
                                続きを読む →
                            </Link>
                        </article>
                    ))}
                </div>
            )}

            {/* ページネーション */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                    <div className="flex space-x-2">
                        {currentPage > 1 && (
                            <Link
                                href={`/posts?page=${currentPage - 1}`}
                                className="px-4 py-2 border rounded hover:bg-gray-100"
                            >
                                前へ
                            </Link>
                        )}

                        {[...Array(totalPages)].map((_, i) => (
                            <Link
                                key={i}
                                href={`/posts?page=${i + 1}`}
                                className={`px-4 py-2 border rounded ${currentPage === i + 1
                                        ? 'bg-blue-500 text-white'
                                        : 'hover:bg-gray-100'
                                    }`}
                            >
                                {i + 1}
                            </Link>
                        ))}

                        {currentPage < totalPages && (
                            <Link
                                href={`/posts?page=${currentPage + 1}`}
                                className="px-4 py-2 border rounded hover:bg-gray-100"
                            >
                                次へ
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
} 