'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { AlertCircle, Loader2 } from 'lucide-react';
import { updateProfile } from '@/app/actions/user-actions';

export default function ProfileEditPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        location: '',
        website: '',
    });

    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // 認証チェック - 未認証ユーザーはログインページにリダイレクト
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login?callbackUrl=/profile/edit');
        } else if (status === 'authenticated' && session.user) {
            // セッション情報からプロフィール情報を初期化
            setFormData({
                name: session.user.name || '',
                bio: session.user.bio || '',
                location: session.user.location || '',
                website: session.user.website || '',
            });
        }
    }, [status, session, router]);

    // 入力値の変更を処理
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // 入力時にエラーをクリア
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    // プロフィール更新を処理
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // プロフィール更新の実行
            const formDataObj = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                formDataObj.append(key, value);
            });

            const result = await updateProfile(formDataObj);

            if (result.error) {
                toast({
                    title: 'エラーが発生しました',
                    description: result.error,
                    variant: 'destructive',
                });

                // バリデーションエラーの設定
                if (result.validationErrors) {
                    const fieldErrors: Record<string, string> = {};
                    Object.entries(result.validationErrors).forEach(([field, errors]) => {
                        fieldErrors[field] = errors[0];
                    });
                    setErrors(fieldErrors);
                }
            } else {
                toast({
                    title: '更新完了',
                    description: 'プロフィール情報が更新されました',
                });

                // プロフィールページにリダイレクト
                router.push(`/profile/${session?.user.id}`);
            }
        } catch (error) {
            toast({
                title: 'エラーが発生しました',
                description: '予期しないエラーが発生しました。もう一度お試しください。',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    // ローディング状態の表示
    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // 未認証状態（リダイレクト中）
    if (status === 'unauthenticated') {
        return null;
    }

    return (
        <div className="container py-8 max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">プロフィール編集</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">名前</Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="あなたの名前"
                                required
                            />
                            {errors.name && (
                                <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                                    <AlertCircle className="h-4 w-4" />
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="bio">自己紹介</Label>
                            <Textarea
                                id="bio"
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                placeholder="あなたについて簡単に教えてください"
                                rows={4}
                            />
                            {errors.bio && (
                                <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                                    <AlertCircle className="h-4 w-4" />
                                    {errors.bio}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="location">場所</Label>
                            <Input
                                id="location"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="東京都、大阪府など"
                            />
                            {errors.location && (
                                <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                                    <AlertCircle className="h-4 w-4" />
                                    {errors.location}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="website">ウェブサイト</Label>
                            <Input
                                id="website"
                                name="website"
                                value={formData.website}
                                onChange={handleChange}
                                placeholder="https://example.com"
                                type="url"
                            />
                            {errors.website && (
                                <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                                    <AlertCircle className="h-4 w-4" />
                                    {errors.website}
                                </p>
                            )}
                        </div>

                        <div className="flex justify-end gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push(`/profile/${session?.user.id}`)}
                                disabled={isLoading}
                            >
                                キャンセル
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                保存する
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
} 