import { getUserPosts } from '@/app/actions/post-actions';
import { PostCard } from '@/components/PostCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface MyPostsListProps {
    userId: string;
    isOwnProfile: boolean;
}

export async function MyPostsList({ userId, isOwnProfile }: MyPostsListProps) {
    // ユーザーの投稿を取得（自分のプロファイルの場合は非公開投稿も含める）
    const { posts = [], error } = await getUserPosts(userId, 1, 10, isOwnProfile);

    if (error) {
        return (
            <div className="p-4 bg-red-50 text-red-500 rounded-md mb-4">
                エラーが発生しました: {error}
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
                <p className="text-muted-foreground mb-4">まだ投稿がありません</p>
                {isOwnProfile && (
                    <Button asChild>
                        <Link href="/posts/create">最初の投稿を作成する</Link>
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {posts.map((post) => (
                <PostCard
                    key={post.id}
                    post={post}
                    showAuthor={false}
                    showEditButton={isOwnProfile}
                />
            ))}

            {posts.length >= 10 && (
                <div className="text-center mt-6">
                    <Button asChild variant="outline">
                        <Link href={`/posts?authorId=${userId}`}>すべての投稿を見る</Link>
                    </Button>
                </div>
            )}
        </div>
    );
} 