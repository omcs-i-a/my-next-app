'use client';

import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function ChatPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        // 未認証の場合はサインインページにリダイレクト
        if (status === 'unauthenticated') {
            router.push('/auth/signin?callbackUrl=' + encodeURIComponent('/chat'));
        }
    }, [status, router]);

    // ロード中の表示
    if (status === 'loading') {
        return (
            <div className="p-3 sm:p-6 h-full flex items-center justify-center bg-white text-gray-900">
                <div className="text-lg">ロード中...</div>
            </div>
        );
    }

    // 未認証の場合は何も表示しない（リダイレクト中）
    if (!session) {
        return null;
    }

    return (
        <div className="p-3 sm:p-6 h-full flex flex-col bg-white text-gray-900">
            <h1 className="text-2xl font-bold mb-4">チャット</h1>

            {/* メッセージ表示エリア */}
            <div className="flex-1 overflow-auto space-y-3 mb-3 bg-white rounded p-4 shadow border border-gray-200">
                {/* サンプルメッセージ(受信) */}
                <div className="flex justify-start">
                    <div className="bg-gray-200 text-gray-800 px-3 py-2 rounded max-w-sm break-words">
                        こんにちは、{session.user?.name || 'ゲスト'}さん！何かお手伝いできますか？
                    </div>
                </div>

                {/* サンプルメッセージ(送信) */}
                <div className="flex justify-end">
                    <div className="bg-blue-500 text-white px-3 py-2 rounded max-w-sm break-words">
                        こちらこそ、よろしくお願いします！
                    </div>
                </div>
            </div>

            {/* 入力欄 */}
            <div className="flex">
                <input
                    type="text"
                    placeholder="メッセージを入力..."
                    className="border border-gray-300 rounded-l px-3 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 transition">
                    送信
                </button>
            </div>
        </div>
    );
}
