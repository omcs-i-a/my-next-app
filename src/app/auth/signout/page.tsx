'use client';

import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SignOut() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSignOut = async () => {
        setIsLoading(true);
        try {
            await signOut({ callbackUrl: '/' });
        } catch (error) {
            console.error('サインアウトエラー:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        router.push('/');
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-12 bg-gray-50 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    ログアウト
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <div className="space-y-6">
                        <p className="text-center text-gray-700">
                            本当にログアウトしますか？
                        </p>
                        <div className="flex space-x-4">
                            <button
                                onClick={handleCancel}
                                className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                キャンセル
                            </button>
                            <button
                                onClick={handleSignOut}
                                disabled={isLoading}
                                className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                {isLoading ? 'ロード中...' : 'ログアウト'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 