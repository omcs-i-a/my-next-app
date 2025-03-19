'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getChatById, sendMessage, leaveChat } from '@/app/actions/chat-actions';
import { ChatDTO, MessageDTO } from '@/types/dto';

export default function ChatPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [chat, setChat] = useState<ChatDTO | null>(null);
    const [messages, setMessages] = useState<MessageDTO[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [leavingChat, setLeavingChat] = useState(false);

    useEffect(() => {
        const fetchChat = async () => {
            try {
                setLoading(true);
                const result = await getChatById(params.id);

                if (result.error) {
                    setError(result.error);
                    return;
                }

                if (result.chat) {
                    setChat(result.chat);
                }

                if (result.messages) {
                    setMessages(result.messages);
                }
            } catch (err) {
                setError('チャットの取得中にエラーが発生しました');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchChat();

        // ポーリング処理（1分ごとに更新）
        const intervalId = setInterval(fetchChat, 60000);

        return () => clearInterval(intervalId);
    }, [params.id]);

    // 新しいメッセージが来たら自動スクロール
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newMessage.trim()) return;

        try {
            setSending(true);
            setError(null);
            setFieldErrors({});

            const formData = new FormData();
            formData.append('chatId', params.id);
            formData.append('content', newMessage);

            const result = await sendMessage(formData);

            if (result.error) {
                setError(result.error);
                if (result.fieldErrors) {
                    setFieldErrors(result.fieldErrors);
                }
                return;
            }

            // 成功したらメッセージをクリアして最新のメッセージを取得
            setNewMessage('');
            const updatedResult = await getChatById(params.id);

            if (updatedResult.messages) {
                setMessages(updatedResult.messages);
            }
        } catch (err) {
            setError('メッセージの送信中にエラーが発生しました');
            console.error(err);
        } finally {
            setSending(false);
        }
    };

    const handleLeaveChat = async () => {
        if (!confirm('このチャットから退出しますか？この操作は取り消せません。')) {
            return;
        }

        try {
            setLeavingChat(true);
            const result = await leaveChat(params.id);

            if (result.error) {
                setError(result.error);
                setLeavingChat(false);
                return;
            }

            // 成功したらチャット一覧にリダイレクト
            router.push('/chats');
            router.refresh();
        } catch (err) {
            setError('チャットからの退出中にエラーが発生しました');
            console.error(err);
            setLeavingChat(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">チャットを読み込み中...</h1>
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 mb-4 rounded-md"></div>
                    <div className="h-80 bg-gray-200 rounded-md mb-4"></div>
                    <div className="h-10 bg-gray-200 rounded-md"></div>
                </div>
            </div>
        );
    }

    if (error && !chat) {
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-6">
                    <p className="text-red-700">{error}</p>
                </div>
                <button
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                    onClick={() => router.push('/chats')}
                >
                    チャット一覧に戻る
                </button>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">
                    {chat?.name || '無題のチャット'}
                </h1>

                <button
                    className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
                    onClick={handleLeaveChat}
                    disabled={leavingChat}
                >
                    {leavingChat ? '退出中...' : 'チャットから退出'}
                </button>
            </div>

            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-6">
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            <div className="bg-gray-50 rounded-lg p-4 mb-4 h-96 overflow-y-auto">
                {messages.length === 0 ? (
                    <p className="text-gray-500 text-center py-10">
                        メッセージはまだありません。最初のメッセージを送信しましょう。
                    </p>
                ) : (
                    <div className="space-y-4">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex flex-col ${message.isOwnMessage ? 'items-end' : 'items-start'
                                    }`}
                            >
                                <div className="text-xs text-gray-500 mb-1">
                                    {message.userName} - {new Date(message.createdAt).toLocaleString()}
                                </div>
                                <div
                                    className={`max-w-xs md:max-w-sm px-4 py-2 rounded-lg ${message.isOwnMessage
                                            ? 'bg-blue-100 text-blue-900'
                                            : 'bg-gray-200 text-gray-900'
                                        }`}
                                >
                                    <p className="break-words whitespace-pre-wrap">{message.content}</p>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            <div>
                <form onSubmit={handleSendMessage}>
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            className={`flex-1 px-3 py-2 border rounded ${fieldErrors.content ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="メッセージを入力..."
                            disabled={sending}
                        />
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                            disabled={sending || !newMessage.trim()}
                        >
                            {sending ? '送信中...' : '送信'}
                        </button>
                    </div>
                    {fieldErrors.content && (
                        <p className="text-red-500 text-sm mt-1">{fieldErrors.content[0]}</p>
                    )}
                </form>
            </div>

            {chat && (
                <div className="mt-8">
                    <h2 className="text-lg font-semibold mb-2">参加者一覧</h2>
                    <div className="bg-gray-50 rounded-lg p-4">
                        <ul className="list-disc pl-5">
                            {chat.participants.map((participant) => (
                                <li key={participant.id}>
                                    {participant.userName}
                                    {participant.isCurrentUser && ' (あなた)'}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
} 