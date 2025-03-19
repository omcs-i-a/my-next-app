'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

// メッセージの型定義
type Message = {
    role: 'user' | 'assistant' | 'system';
    content: string;
};

// チャットの型定義
type Chat = {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    messages: Message[];
};

// URLパラメータを取得するためのコンポーネント
function ChatContent() {
    // メッセージの初期状態を定数として定義
    const INITIAL_MESSAGES: Message[] = [
        {
            role: 'system',
            content: 'あなたは役立つAIアシスタントです。簡潔で丁寧な日本語で回答してください。'
        },
        {
            role: 'assistant',
            content: 'こんにちは！どのようにお手伝いできますか？'
        }
    ];

    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const chatIdParam = searchParams.get('id');

    const [loading, setLoading] = useState(false);
    const [sendingMessage, setSendingMessage] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
    const [chatId, setChatId] = useState<string | null>(chatIdParam);
    const [chats, setChats] = useState<Chat[]>([]);
    // 画面幅が狭いかどうかを判定するためのstate
    const [isMobile, setIsMobile] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // URLパラメータが変わった時に処理
    useEffect(() => {
        if (session?.user) {
            if (chatIdParam) {
                // チャットIDがある場合はそのチャットを読み込む
                loadChat(chatIdParam);
            } else {
                // チャットIDがない場合は新しいチャットを開始
                resetChat();
            }
        }
    }, [chatIdParam, session]);

    // 未認証リダイレクト
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin?callbackUrl=' + encodeURIComponent('/chat'));
        }
    }, [status, router]);

    // 画面サイズの検出
    useEffect(() => {
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth < 768); // md:breakpoint (768px)
        };

        // 初期チェック
        checkIfMobile();

        // リサイズ時に再チェック
        window.addEventListener('resize', checkIfMobile);

        return () => {
            window.removeEventListener('resize', checkIfMobile);
        };
    }, []);

    // メッセージ送信後に自動スクロール
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // テキストエリアの高さを自動調整
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
        }
    }, [input]);

    // チャットリストを取得
    useEffect(() => {
        if (session?.user) {
            fetchChatList();
        }
    }, [session]);

    // チャットリストを取得
    const fetchChatList = async () => {
        try {
            const response = await fetch('/api/chat');
            if (!response.ok) {
                throw new Error('チャットリストの取得に失敗しました');
            }
            const data = await response.json();
            setChats(data.chats);
        } catch (error) {
            console.error('Error fetching chat list:', error);
        }
    };

    // 特定のチャットを読み込む
    const loadChat = async (id: string) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/chat?chatId=${id}`);
            if (!response.ok) {
                throw new Error('チャットの読み込みに失敗しました');
            }

            const data = await response.json();
            const welcomeMessage = INITIAL_MESSAGES.find(msg => msg.role === 'assistant');
            const systemMessage = INITIAL_MESSAGES.find(msg => msg.role === 'system');

            // システムメッセージと挨拶メッセージを維持しつつ、保存されたメッセージをセット
            const chatMessages = data.chat.messages.map((msg: any) => ({
                role: msg.role,
                content: msg.content
            }));

            // 挨拶メッセージが既にDBに保存されている場合は重複を避ける
            const hasWelcomeMessage = chatMessages.some(
                (msg: Message) =>
                    msg.role === 'assistant' &&
                    msg.content === welcomeMessage?.content
            );

            setMessages([
                ...(systemMessage ? [systemMessage] : []),
                ...(welcomeMessage && !hasWelcomeMessage ? [welcomeMessage] : []),
                ...chatMessages
            ]);

            setChatId(id);
        } catch (error) {
            console.error('Error loading chat:', error);
        } finally {
            setLoading(false);
        }
    };

    // 新しいチャットを開始（メッセージをリセット）
    const resetChat = () => {
        setChatId(null);
        setMessages(INITIAL_MESSAGES);
        setInput('');
    };

    // 新しいチャットを開始
    const startNewChat = () => {
        resetChat();
        router.push('/chat', { scroll: false });
    };

    // メッセージ送信処理
    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (!input.trim() || loading || sendingMessage) return;

        // 自分のメッセージを追加
        const userMessage: Message = { role: 'user', content: input };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setLoading(true);
        setSendingMessage(true);

        try {
            // 初期の挨拶メッセージは除外してAPIに送信
            const welcomeMessage = INITIAL_MESSAGES.find(msg => msg.role === 'assistant');
            const messagesToSend = newMessages.filter(msg =>
                !(msg.role === 'assistant' && msg.content === welcomeMessage?.content)
            );

            // APIリクエスト
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: messagesToSend,
                    chatId: chatId
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('API Error:', errorData);
                throw new Error(errorData.error || 'APIリクエストに失敗しました');
            }

            const data = await response.json();

            // チャットIDを更新
            if (!chatId && data.chatId) {
                setChatId(data.chatId);
                router.push(`/chat?id=${data.chatId}`, { scroll: false });
                // チャットリストを更新
                fetchChatList();
            }

            // AIの応答を追加
            setMessages([...newMessages, data.response]);
        } catch (error) {
            console.error('Error:', error);
            // エラーメッセージを表示
            setMessages([
                ...newMessages,
                { role: 'assistant', content: 'すみません、エラーが発生しました。しばらく待ってからもう一度お試しください。' }
            ]);
        } finally {
            setLoading(false);
            setSendingMessage(false);
        }
    };

    // エンターキーで送信（Shift+Enterは改行）
    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // IME入力中（日本語などの変換中）は処理しない
        if (e.nativeEvent.isComposing || e.key === 'Process') {
            return;
        }

        if (e.key === 'Enter' && !e.shiftKey) {
            // Ctrlキーが押されている場合は改行として扱う
            if (e.ctrlKey) {
                return;
            }
            e.preventDefault();
            handleSubmit();
        }
    };

    // ローディング中表示
    if (status === 'loading') {
        return <div className="p-3 sm:p-6 h-full flex items-center justify-center bg-white text-gray-900">
            <div className="text-lg">ロード中...</div>
        </div>;
    }

    // 未認証の場合は何も表示しない（リダイレクト中）
    if (!session) {
        return null;
    }

    return (
        <div className="p-3 sm:p-6 h-full flex flex-col bg-white text-gray-900">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">AI チャット</h1>
            </div>

            {/* メッセージ表示エリア */}
            <div className="flex-1 overflow-auto space-y-3 mb-3 bg-white rounded p-4 shadow border border-gray-200">
                {messages.filter(msg => msg.role !== 'system').map((message, index) => (
                    <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                            className={`px-3 py-2 rounded max-w-sm break-words ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
                                }`}
                        >
                            {message.content}
                        </div>
                    </div>
                ))}
                {sendingMessage && (
                    <div className="flex justify-start">
                        <div className="bg-gray-200 text-gray-800 px-3 py-2 rounded">
                            入力中...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* 入力欄（テキストエリアに変更） */}
            <form onSubmit={handleSubmit} className="flex">
                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="メッセージを入力..."
                    rows={1}
                    className="border border-gray-300 rounded-l px-3 py-2 flex-1 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[40px] max-h-[150px]"
                    disabled={loading}
                />
                <button
                    type="submit"
                    disabled={loading}
                    className={`px-4 py-2 rounded-r text-white ${loading ? 'bg-blue-300' : 'bg-blue-500 hover:bg-blue-600'
                        } transition`}
                >
                    送信
                </button>
            </form>
            <div className="text-xs text-gray-500 mt-1 text-center">
                Enterキーで送信、Shift+Enterで改行
            </div>
        </div>
    );
}

// メインコンポーネント - Suspenseでラップ
export default function ChatPage() {
    return (
        <Suspense fallback={<div className="p-3 sm:p-6 h-full flex items-center justify-center bg-white text-gray-900">
            <div className="text-lg">ロード中...</div>
        </div>}>
            <ChatContent />
        </Suspense>
    );
}
