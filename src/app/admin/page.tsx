'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // 管理者認証情報を環境変数から取得
            const response = await fetch('/api/admin/auth/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password
                }),
            });

            if (response.ok) {
                // ログイン成功 - セッションストレージにログイン状態を保存
                sessionStorage.setItem('adminAuthenticated', 'true');
                router.push('/admin/dashboard');
            } else {
                // ログイン失敗
                setError('無効な認証情報です。正しいメールアドレスとパスワードを入力してください。');
            }
        } catch (err) {
            console.error('認証エラー:', err);
            setError('認証処理中にエラーが発生しました。');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-3 sm:py-12 bg-gray-50 sm:px-6 lg:px-8">
            <div className="w-full sm:mx-auto sm:max-w-md">
                <h2 className="mt-3 sm:mt-6 text-center text-2xl sm:text-3xl font-extrabold text-gray-900">
                    管理パネルログイン
                </h2>
            </div>

            <div className="mt-4 sm:mt-8 w-full sm:mx-auto sm:max-w-md">
                <div className="bg-white py-6 sm:py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {error && (
                        <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <form className="space-y-4 sm:space-y-6" onSubmit={handleLogin}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                メールアドレス
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                パスワード
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                {isLoading ? 'ロード中...' : 'ログイン'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
} 