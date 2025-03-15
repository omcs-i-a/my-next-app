import React from 'react';

export default function ChatPage() {
    return (
        <div className="p-6 h-full flex flex-col">
            <h1 className="text-2xl font-bold mb-4">チャット</h1>

            {/* メッセージ表示エリア */}
            <div className="flex-1 overflow-auto space-y-3 mb-3 bg-white rounded p-4 shadow">
                {/* サンプルメッセージ(受信) */}
                <div className="flex justify-start">
                    <div className="bg-gray-200 text-gray-800 px-3 py-2 rounded max-w-sm break-words">
                        こんにちは！何かお手伝いできますか？
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
