'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

// クライアントコンポーネントをSuspenseでラップするために分離
function VerifyEmailContent({ token }: { token: string | null }) {
    const router = useRouter();
    const [isVerifying, setIsVerifying] = useState(true);
    const [verificationSuccess, setVerificationSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setIsVerifying(false);
            setErrorMessage('無効なトークンです。');
            return;
        }

        async function verifyEmail() {
            try {
                const response = await fetch(`/api/auth/verify?token=${token}`);
                const data = await response.json();

                setIsVerifying(false);

                if (response.ok && data.success) {
                    setVerificationSuccess(true);
                } else {
                    setErrorMessage(data.message || 'メール認証に失敗しました。');
                }
            } catch (error) {
                console.error('認証エラー:', error);
                setIsVerifying(false);
                setErrorMessage('メール認証中にエラーが発生しました。');
            }
        }

        verifyEmail();
    }, [token]);

    // 認証完了後、3秒後にログインページへリダイレクト
    useEffect(() => {
        if (verificationSuccess) {
            const redirectTimer = setTimeout(() => {
                router.push('/auth/signin?verified=true');
            }, 3000);

            return () => clearTimeout(redirectTimer);
        }
    }, [verificationSuccess, router]);

    return (
        <div className="p-3 sm:py-12 bg-gray-50 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-screen">
            <div className="w-full sm:mx-auto sm:max-w-md">
                <h2 className="mt-3 sm:mt-6 text-center text-2xl sm:text-3xl font-extrabold text-gray-900">
                    メールアドレスの確認
                </h2>
            </div>

            <div className="mt-4 sm:mt-8 w-full sm:mx-auto sm:max-w-md">
                <div className="bg-white py-6 sm:py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {isVerifying ? (
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600">メールアドレスを確認中...</p>
                        </div>
                    ) : verificationSuccess ? (
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="mt-3 text-lg font-medium text-gray-900">認証完了</h3>
                            <p className="mt-2 text-sm text-gray-600">
                                メールアドレスの認証が完了しました。
                            </p>
                            <p className="mt-1 text-sm text-gray-600">
                                自動的にログインページへ移動します...
                            </p>
                            <div className="mt-5">
                                <Link
                                    href="/auth/signin"
                                    className="text-indigo-600 hover:text-indigo-500 font-medium"
                                >
                                    ログインページへ移動
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <h3 className="mt-3 text-lg font-medium text-gray-900">認証失敗</h3>
                            <p className="mt-2 text-sm text-gray-600">{errorMessage}</p>
                            <div className="mt-5">
                                <Link
                                    href="/auth/signin"
                                    className="text-indigo-600 hover:text-indigo-500 font-medium"
                                >
                                    ログインページへ戻る
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// searchParamsを使用するコンポーネント
function VerifyEmailWithParams() {
    const searchParams = useSearchParams();
    const token = searchParams?.get('token');

    return <VerifyEmailContent token={token} />;
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="p-3 sm:py-12 bg-gray-50 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-screen">
                <div className="w-full sm:mx-auto sm:max-w-md">
                    <h2 className="mt-3 sm:mt-6 text-center text-2xl sm:text-3xl font-extrabold text-gray-900">
                        メールアドレスの確認
                    </h2>
                    <div className="mt-4 sm:mt-8 w-full sm:mx-auto sm:max-w-md">
                        <div className="bg-white py-6 sm:py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600">読み込み中...</p>
                        </div>
                    </div>
                </div>
            </div>
        }>
            <VerifyEmailWithParams />
        </Suspense>
    );
} 