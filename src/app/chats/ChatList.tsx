import { getUserChats } from '@/app/actions/chat-actions';
import Link from 'next/link';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

/**
 * チャット一覧を表示するコンポーネント
 * サーバーコンポーネントとして実装
 */
export default async function ChatList() {
    // チャット一覧を取得
    const result = await getUserChats();

    if (result.error) {
        return (
            <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-6">
                <p className="text-red-700">{result.error}</p>
            </div>
        );
    }

    const chats = result.chats || [];

    if (chats.length === 0) {
        return (
            <div className="bg-white p-8 rounded-lg shadow text-center">
                <p className="text-gray-600 mb-4">チャットはまだありません</p>
                <p className="text-gray-500">右上の「新規チャット作成」から始めましょう</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {chats.map((chat) => {
                // 最新メッセージの情報取得
                const lastMessage = chat.lastMessage ? {
                    content: chat.lastMessage.content,
                    time: format(
                        new Date(chat.lastMessage.createdAt),
                        'MM/dd HH:mm',
                        { locale: ja }
                    ),
                    userName: chat.lastMessage.userName
                } : null;

                return (
                    <Link
                        key={chat.id}
                        href={`/chats/${chat.id}`}
                        className="block bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <h2 className="text-lg font-semibold">
                                {chat.name || `${chat.participants.map(p => p.userName).join(', ')}`}
                            </h2>
                            <span className="text-xs text-gray-500">
                                {lastMessage ? lastMessage.time : '新規'}
                            </span>
                        </div>

                        {lastMessage ? (
                            <p className="text-gray-600 text-sm truncate mb-2">
                                <span className="font-medium">{lastMessage.userName}:</span> {lastMessage.content}
                            </p>
                        ) : (
                            <p className="text-gray-500 text-sm italic mb-2">
                                まだメッセージはありません
                            </p>
                        )}

                        <div className="flex justify-between items-center text-xs text-gray-500">
                            <span>{chat.participants.length}人の参加者</span>
                            <span>{format(new Date(chat.updatedAt), 'yyyy年MM月dd日', { locale: ja })}</span>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
} 