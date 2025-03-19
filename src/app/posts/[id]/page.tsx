import { Suspense } from 'react';
import { getAuthSession, getSessionUserId } from '@/lib/session';
import { getPostById } from '@/app/actions/post-actions';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import CommentSection from './CommentSection';

export const dynamic = 'force-dynamic';

/**
 * 投稿詳細ページのメインコンポーネント
 * 認証・認可チェックをサーバーコンポーネント内で行い、未認証または権限のないユーザーをリダイレクト
 */
export default async function PostPage({ params }: { params: { id: string } }) {
    // 認証チェック - 未認証ユーザーはログインページにリダイレクト
    const session = await getAuthSession();
    const userId = getSessionUserId(session);

    // 投稿データを取得
    const result = await getPostById(params.id);

    // 投稿が存在しない場合は404ページを表示
    if (!result.post) {
        notFound();
    }

    // エラーがある場合（権限がない場合など）
    if (result.error) {
        // 権限エラーの場合は403ページへリダイレクト
        if (result.error.includes('権限')) {
            redirect('/unauthorized');
        }
        // その他のエラーは404ページを表示
        notFound();
    }

    const post = result.post;
    const comments = result.comments || [];

    // 投稿が非公開で、自分の投稿でない場合はアクセス拒否
    if (!post.published && post.author.id !== userId) {
        redirect('/unauthorized');
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-4">
                <Link href="/posts" className="text-blue-500 hover:underline">
                    ← 投稿一覧に戻る
                </Link>
            </div>

            <article className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex justify-between items-start mb-4">
                    <h1 className="text-3xl font-bold">{post.title}</h1>

                    {/* 自分の投稿の場合のみ編集・削除リンクを表示 */}
                    {post.author.id === userId && (
                        <div className="flex space-x-2">
                            <Link
                                href={`/posts/${post.id}/edit`}
                                className="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                            >
                                編集
                            </Link>
                            <button
                                className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                                onClick={() => {
                                    if (confirm('この投稿を削除しますか？この操作は取り消せません。')) {
                                        // 削除処理（クライアントコンポーネントで実装）
                                    }
                                }}
                            >
                                削除
                            </button>
                        </div>
                    )}
                </div>

                <div className="text-sm text-gray-500 mb-4">
                    <span>{post.author.name || '匿名ユーザー'}</span>
                    <span className="mx-2">•</span>
                    <time dateTime={post.createdAt.toISOString()}>
                        {format(new Date(post.createdAt), 'yyyy年MM月dd日 HH:mm', { locale: ja })}
                    </time>
                    {!post.published && (
                        <span className="ml-2 inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                            非公開
                        </span>
                    )}
                </div>

                <div className="prose max-w-none mb-6">
                    {post.content.split('\n').map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                    ))}
                </div>
            </article>

            <Suspense fallback={<div className="animate-pulse h-40 bg-gray-100 rounded-lg"></div>}>
                <CommentSection postId={post.id} comments={comments} />
            </Suspense>
        </div>
    );
} 