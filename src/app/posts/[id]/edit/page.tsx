'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { updatePost, getPostById } from '@/app/actions/post-actions';
import { PostDTO } from '@/types/dto';

export default function EditPostPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [post, setPost] = useState<PostDTO | null>(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [published, setPublished] = useState(false);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

    useEffect(() => {
        const fetchPost = async () => {
            try {
                setLoading(true);
                const result = await getPostById(params.id);

                if (result.error) {
                    setError(result.error);
                    return;
                }

                if (result.post) {
                    setPost(result.post);
                    setTitle(result.post.title);
                    setContent(result.post.content);
                    setPublished(result.post.published);
                }
            } catch (err) {
                setError('投稿の取得中にエラーが発生しました');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [params.id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setUpdating(true);
            setError(null);
            setFieldErrors({});

            const formData = new FormData();
            formData.append('title', title);
            formData.append('content', content);
            formData.append('published', published.toString());

            const result = await updatePost(params.id, formData);

            if (result.error) {
                setError(result.error);
                if (result.fieldErrors) {
                    setFieldErrors(result.fieldErrors);
                }
                return;
            }

            // 成功したら投稿詳細ページにリダイレクト
            router.push(`/posts/${params.id}`);
            router.refresh();
        } catch (err) {
            setError('投稿の更新中にエラーが発生しました');
            console.error(err);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">投稿を編集中...</h1>
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 mb-4 rounded-md"></div>
                    <div className="h-40 bg-gray-200 rounded-md"></div>
                </div>
            </div>
        );
    }

    if (error && !post) {
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-6">
                    <p className="text-red-700">{error}</p>
                </div>
                <button
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                    onClick={() => router.back()}
                >
                    戻る
                </button>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">投稿を編集</h1>

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
                        disabled={updating}
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
                        disabled={updating}
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
                            disabled={updating}
                        />
                        <span className="text-sm">公開する</span>
                    </label>
                </div>

                <div className="flex space-x-4">
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                        disabled={updating}
                    >
                        {updating ? '更新中...' : '更新する'}
                    </button>

                    <button
                        type="button"
                        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                        onClick={() => router.back()}
                        disabled={updating}
                    >
                        キャンセル
                    </button>
                </div>
            </form>
        </div>
    );
} 