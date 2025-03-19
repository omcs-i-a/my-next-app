import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getUserById } from '@/app/actions/user-actions';
import { getSession } from '@/lib/session';
import { MyPostsList } from '@/app/profile/[id]/MyPostsList';
import { formatDate } from '@/lib/utils';

export default async function ProfilePage({ params }: { params: { id: string } }) {
    // セッション情報を取得（未認証でも閲覧可能なので強制リダイレクトはしない）
    const session = await getSession();
    const isOwnProfile = session?.user?.id === params.id;

    // プロファイル情報を取得
    const result = await getUserById(params.id);

    // ユーザーが存在しない場合は404ページを表示
    if (!result.user) {
        notFound();
    }

    // エラーがある場合（権限がない場合など）
    if (result.error) {
        if (result.error.includes('権限')) {
            redirect('/unauthorized');
        }
        notFound();
    }

    const user = result.user;

    return (
        <div className="container py-8 max-w-5xl mx-auto">
            <Card className="mb-8">
                <CardHeader className="flex flex-row items-center gap-4">
                    <Avatar className="h-20 w-20">
                        <AvatarImage src={user.image || undefined} alt={user.name} />
                        <AvatarFallback>{user.name?.substring(0, 2) || 'ユ'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <CardTitle className="text-2xl mb-2">{user.name}</CardTitle>
                        {user.bio && <p className="text-muted-foreground">{user.bio}</p>}
                        <div className="text-sm text-muted-foreground mt-1">
                            登録日: {formatDate(user.createdAt)}
                        </div>
                    </div>
                    {isOwnProfile && (
                        <Button asChild>
                            <Link href="/profile/edit">プロフィール編集</Link>
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                    {user.email && (
                        <div className="mb-4">
                            <h3 className="font-medium mb-1">メールアドレス</h3>
                            <p>{isOwnProfile ? user.email : '******@****.com'}</p>
                        </div>
                    )}

                    {user.location && (
                        <div className="mb-4">
                            <h3 className="font-medium mb-1">場所</h3>
                            <p>{user.location}</p>
                        </div>
                    )}

                    {user.website && (
                        <div className="mb-4">
                            <h3 className="font-medium mb-1">ウェブサイト</h3>
                            <a href={user.website} target="_blank" rel="noopener noreferrer"
                                className="text-primary hover:underline">
                                {user.website}
                            </a>
                        </div>
                    )}
                </CardContent>
            </Card>

            <h2 className="text-2xl font-bold mb-4">投稿一覧</h2>
            <MyPostsList userId={params.id} isOwnProfile={isOwnProfile} />
        </div>
    );
} 