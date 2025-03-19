'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CommentDTO } from '@/types/dto';
import { createComment, deleteComment } from '@/app/actions/post-actions';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useSession } from 'next-auth/react';

interface CommentSectionProps {
    postId: string;
    comments: CommentDTO[];
}

export default function CommentSection({ postId, comments: initialComments }: CommentSectionProps) {
    const router = useRouter();
    const { data: session } = useSession();
    const [comments, setComments] = useState<CommentDTO[]>(initialComments);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

    // ユーザーがログイン済みかを確認
    const isAuthenticated = !!session?.user;

    // コメント投稿処理
    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isAuthenticated) {
            setError('コメントするにはログインが必要です');
            return;
        }

        if (!newComment.trim()) return;

        try {
            setIsSubmitting(true);
            setError(null);
            setFieldErrors({});

            const formData = new FormData();
            formData.append('postId', postId);
            formData.append('content', newComment);

            const result = await createComment(formData);

            if (result.error) {
                setError(result.error);
                if (result.fieldErrors) {
                    setFieldErrors(result.fieldErrors);
                }
                return;
            }

            // 投稿が成功したらページを更新して最新のコメントを表示
            setNewComment('');
            router.refresh();

            // ページ全体をリロードするのではなく、必要な部分だけ更新するためのロジックを追加可能
            // 例: 新しいコメントを取得するAPIを呼び出して更新するなど

        } catch (err) {
            setError('コメントの投稿中にエラーが発生しました');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    // コメント削除処理
    const handleDeleteComment = async (commentId: string) => {
        if (!confirm('このコメントを削除しますか？この操作は取り消せません。')) {
            return;
        }

        try {
            const result = await deleteComment(commentId);

            if (result.error) {
                setError(result.error);
                return;
            }

            // 削除が成功したらページを更新
            router.refresh();

        } catch (err) {
            setError('コメントの削除中にエラーが発生しました');
            console.error(err);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">コメント {comments.length > 0 ? `(${comments.length})` : ''}</h2>

            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-4">
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            {isAuthenticated ? (
                <form onSubmit={handleSubmitComment} className="mb-6">
                    <div className="mb-3">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="コメントを入力..."
                            className={`w-full px-3 py-2 border rounded ${fieldErrors.content ? 'border-red-500' : 'border-gray-300'
                                }`}
                            rows={3}
                            disabled={isSubmitting}
                        />
                        {fieldErrors.content && (
                            <p className="text-red-500 text-sm mt-1">{fieldErrors.content[0]}</p>
                        )}
                    </div>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                        disabled={isSubmitting || !newComment.trim()}
                    >
                        {isSubmitting ? 'コメント送信中...' : 'コメントを送信'}
                    </button>
                </form>
            ) : (
                <div className="mb-6 p-4 bg-gray-50 rounded text-center">
                    <p className="text-gray-600">コメントするには<a href="/login" className="text-blue-500 hover:underline">ログイン</a>してください</p>
                </div>
            )}

            {comments.length > 0 ? (
                <ul className="space-y-4">
                    {comments.map((comment) => (
                        <li key={comment.id} className="border-b pb-4 last:border-b-0">
                            <div className="flex justify-between items-start">
                                <div className="text-sm text-gray-500 mb-1">
                                    <span>{comment.userName || '匿名ユーザー'}</span>
                                    <span className="mx-2">•</span>
                                    <time dateTime={comment.createdAt.toISOString()}>
                                        {format(new Date(comment.createdAt), 'yyyy年MM月dd日 HH:mm', { locale: ja })}
                                    </time>
                                </div>

                                {/* 自分のコメントの場合のみ削除ボタンを表示 */}
                                {comment.isOwnComment && (
                                    <button
                                        onClick={() => handleDeleteComment(comment.id)}
                                        className="text-xs text-red-500 hover:text-red-700"
                                    >
                                        削除
                                    </button>
                                )}
                            </div>

                            <div className="text-gray-800">
                                {comment.content.split('\n').map((line, index) => (
                                    <p key={index}>{line}</p>
                                ))}
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-500 text-center py-4">コメントはまだありません</p>
            )}
        </div>
    );
} 