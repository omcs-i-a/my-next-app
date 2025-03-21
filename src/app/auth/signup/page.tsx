'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';

function SignUpForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [error, setError] = useState('');
    const [isRegistered, setIsRegistered] = useState(false);
    const searchParams = useSearchParams();
    const callbackUrl = searchParams?.get('callbackUrl') || '/';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // パスワードの一致確認
        if (password !== passwordConfirm) {
            setError('パスワードが一致しません。');
            setIsLoading(false);
            return;
        }

        // パスワードの長さチェック
        if (password.length < 8) {
            setError('パスワードは8文字以上で設定してください。');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'アカウント作成に失敗しました。');
            }

            // アカウント作成成功、メール認証画面を表示
            setIsRegistered(true);
        } catch (error: any) {
            console.error('登録エラー:', error);
            setError(error.message || 'アカウント作成中にエラーが発生しました。');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGitHubSignUp = async () => {
        setIsLoading(true);
        try {
            await signIn('github', { callbackUrl });
        } catch (error) {
            console.error('GitHubサインアップエラー:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignUp = async () => {
        setIsLoading(true);
        try {
            await signIn('google', { callbackUrl });
        } catch (error) {
            console.error('Googleサインアップエラー:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // メール認証待ち画面
    if (isRegistered) {
        return (
            <div className="p-3 sm:py-12 bg-gray-50 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-screen">
                <div className="w-full sm:mx-auto sm:max-w-md">
                    <h2 className="mt-3 sm:mt-6 text-center text-2xl sm:text-3xl font-extrabold text-gray-900">
                        メール確認のお願い
                    </h2>
                </div>

                <div className="mt-4 sm:mt-8 w-full sm:mx-auto sm:max-w-md">
                    <div className="bg-white py-6 sm:py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="mt-3 text-lg font-medium text-gray-900">メールをご確認ください</h3>
                            <p className="mt-2 text-sm text-gray-600">
                                {email} に確認メールを送信しました。
                            </p>
                            <p className="mt-1 text-sm text-gray-600">
                                メール内のリンクをクリックして、アカウントの認証を完了してください。
                            </p>
                            <div className="mt-5">
                                <Link
                                    href="/auth/signin"
                                    className="text-indigo-600 hover:text-indigo-500 font-medium"
                                >
                                    ログインページへ戻る
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-3 sm:py-12 bg-gray-50 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-screen">
            <div className="w-full sm:mx-auto sm:max-w-md">
                <h2 className="mt-3 sm:mt-6 text-center text-2xl sm:text-3xl font-extrabold text-gray-900">
                    アカウント作成
                </h2>
                {callbackUrl && callbackUrl !== '/' && (
                    <p className="mt-2 text-center text-sm text-gray-600">
                        登録後に <span className="font-medium">{callbackUrl}</span> へリダイレクトします
                    </p>
                )}
            </div>

            <div className="mt-4 sm:mt-8 w-full sm:mx-auto sm:max-w-md">
                <div className="bg-white py-6 sm:py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {error && (
                        <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                お名前
                            </label>
                            <div className="mt-1">
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    autoComplete="name"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>

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
                            <p className="mt-1 text-xs text-gray-500">
                                認証メールをお送りします
                            </p>
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
                                    autoComplete="new-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                                8文字以上の英数字を設定してください
                            </p>
                        </div>

                        <div>
                            <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-700">
                                パスワード（確認）
                            </label>
                            <div className="mt-1">
                                <input
                                    id="passwordConfirm"
                                    name="passwordConfirm"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    value={passwordConfirm}
                                    onChange={(e) => setPasswordConfirm(e.target.value)}
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
                                {isLoading ? 'アカウント作成中...' : 'アカウントを作成'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-5 sm:mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">または</span>
                            </div>
                        </div>

                        <div className="mt-5 sm:mt-6 grid grid-cols-2 gap-3">
                            <div>
                                <button
                                    onClick={handleGitHubSignUp}
                                    disabled={isLoading}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                                >
                                    <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            fillRule="evenodd"
                                            d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.07 2.91.82.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V19c0 .27.16.59.67.5C17.14 18.16 20 14.42 20 10A10 10 0 0 0 10 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    GitHubで登録
                                </button>
                            </div>

                            <div>
                                <button
                                    onClick={handleGoogleSignUp}
                                    disabled={isLoading}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                        <path
                                            d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z"
                                        />
                                    </svg>
                                    Googleで登録
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 sm:mt-6 text-center">
                        <Link
                            href={`/auth/signin${callbackUrl !== '/' ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`}
                            className="font-medium text-indigo-600 hover:text-indigo-500"
                        >
                            すでにアカウントをお持ちの方はこちら
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function SignUpPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SignUpForm />
        </Suspense>
    );
}