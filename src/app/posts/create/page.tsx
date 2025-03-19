'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPost } from '@/app/actions/post-actions';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function CreatePostPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [published, setPublished] = useState(true);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

    // クライアントサイドでの認証チェック
    if (status === 'loading') {
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">認証状態を確認中...</h1>
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 mb-4 rounded-md"></div>
                    <div className="h-40 bg-gray-200 rounded-md"></div>
                </div>
            </div>
        );
    }

    // 未認証の場合はログインページにリダイレクト
    if (status === 'unauthenticated') {
        router.push('/login?callbackUrl=/posts/create');
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setCreating(true);
            setError(null);
            setFieldErrors({});

            const formData = new FormData();
            formData.append('title', title);
            formData.append('content', content);
            formData.append('published', published.toString());

            const result = await createPost(formData);

            if (result.error) {
                setError(result.error);
                if (result.fieldErrors) {
                    setFieldErrors(result.fieldErrors);
                }
                return;
            }

            // 成功したら投稿詳細ページにリダイレクト
            if (result.postId) {
                router.push(`/posts/${result.postId}`);
                router.refresh();
            } else {
                router.push('/posts');
                router.refresh();
            }
        } catch (err) {
            setError('投稿の作成中にエラーが発生しました');
            console.error(err);
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-4">
                <Link href="/posts" className="text-blue-500 hover:underline">
                    ← 投稿一覧に戻る
                </Link>
            </div>

            <h1 className="text-2xl font-bold mb-6">新規投稿作成</h1>

            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-6">
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="title" className="block text-sm font-medium mb-1">
                        タイトル
                    </label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className={`w-full px-3 py-2 border rounded ${fieldErrors.title ? 'border-red-500' : 'border-gray-300'
                            }`}
                        disabled={creating}
                    />
                    {fieldErrors.title && (
                        <p className="text-red-500 text-sm mt-1">{fieldErrors.title[0]}</p>
                    )}
                </div>

                <div className="mb-4">
                    <label htmlFor="content" className="block text-sm font-medium mb-1">
                        内容
                    </label>
                    <textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className={`w-full px-3 py-2 border rounded ${fieldErrors.content ? 'border-red-500' : 'border-gray-300'
                            }`}
                        rows={10}
                        disabled={creating}
                    />
                    {fieldErrors.content && (
                        <p className="text-red-500 text-sm mt-1">{fieldErrors.content[0]}</p>
                    )}
                </div>

                <div className="mb-6">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={published}
                            onChange={(e) => setPublished(e.target.checked)}
                            className="mr-2"
                            disabled={creating}
                        />
                        <span className="text-sm">公開する</span>
                    </label>
                </div>

                <div className="flex space-x-4">
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                        disabled={creating}
                    >
                        {creating ? '作成中...' : '投稿する'}
                    </button>

                    <button
                        type="button"
                        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                        onClick={() => router.back()}
                        disabled={creating}
                    >
                        キャンセル
                    </button>
                </div>
            </form>
        </div>
    );
} 