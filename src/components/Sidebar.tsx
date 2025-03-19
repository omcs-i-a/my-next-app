'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { MdKeyboardArrowRight, MdKeyboardArrowDown, MdChatBubbleOutline, MdAdd } from 'react-icons/md';

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [expandChats, setExpandChats] = useState(false);
    const [chatHistory, setChatHistory] = useState<any[]>([]);

    // チャット履歴を取得
    useEffect(() => {
        // チャットページが開かれているか、履歴が展開されている場合のみ取得
        if (pathname.startsWith('/chat') || expandChats) {
            fetchChatHistory();
        }
    }, [pathname, expandChats]);

    // チャット履歴を取得する関数
    const fetchChatHistory = async () => {
        try {
            const response = await fetch('/api/chat');
            if (response.ok) {
                const data = await response.json();
                setChatHistory(data.chats || []);
            }
        } catch (error) {
            console.error('チャット履歴の取得に失敗しました', error);
        }
    };

    // チャット履歴の展開/折りたたみを切り替え
    const toggleExpandChats = () => {
        setExpandChats(!expandChats);
    };

    // 新しいチャットを作成
    const createNewChat = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // 既存のチャットIDをクリアして新しいチャットページに遷移
        router.push('/chat');
    };

    return (
        <aside className="hidden sm:flex fixed top-0 left-0 w-64 h-full bg-gray-100 shadow-md flex-col overflow-y-auto z-50">
            <div className="p-4 font-bold text-xl">My Next App</div>
            <nav className="flex-1 p-4 space-y-2">
                <Link
                    href="/"
                    className={`block px-3 py-2 rounded transition ${pathname === '/' ? 'bg-gray-200' : 'hover:bg-gray-200'
                        }`}
                >
                    ホーム
                </Link>

                {/* チャットメニュー */}
                <div>
                    <div className="flex items-center px-3 py-2 rounded transition">
                        <button
                            onClick={toggleExpandChats}
                            className="mr-1 text-gray-600"
                        >
                            {expandChats ?
                                <MdKeyboardArrowDown size={18} /> :
                                <MdKeyboardArrowRight size={18} />
                            }
                        </button>
                        <Link
                            href="/chat"
                            className={`flex-grow ${pathname === '/chat' ? 'font-medium' : ''
                                }`}
                        >
                            チャット
                        </Link>
                        <button
                            onClick={createNewChat}
                            className="text-gray-600 hover:text-gray-900 ml-1"
                            title="新しいチャットを作成"
                        >
                            <MdAdd size={18} />
                        </button>
                    </div>

                    {/* チャット履歴 - 展開時のみ表示 */}
                    {expandChats && (
                        <div className="ml-6 mt-1 space-y-1">
                            {chatHistory.map(chat => (
                                <Link
                                    key={chat.id}
                                    href={`/chat?id=${chat.id}`}
                                    className={`block px-3 py-1 text-sm rounded truncate transition ${pathname.includes(`?id=${chat.id}`) ? 'bg-gray-200' : 'hover:bg-gray-200'
                                        }`}
                                >
                                    <div className="flex items-center">
                                        <MdChatBubbleOutline className="mr-1 text-xs" />
                                        <span className="truncate">{chat.title}</span>
                                    </div>
                                </Link>
                            ))}
                            {chatHistory.length === 0 && (
                                <div className="px-3 py-1 text-sm text-gray-500">
                                    履歴がありません
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </nav>
        </aside>
    );
} 