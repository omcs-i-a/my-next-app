'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import UserMenu from './UserMenu';
import { MdAdd, MdKeyboardArrowRight, MdKeyboardArrowDown, MdChatBubbleOutline } from 'react-icons/md';

export default function Header() {
    const { data: session, status } = useSession();
    const isLoading = status === 'loading';
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [expandChats, setExpandChats] = useState(false);
    const [chatHistory, setChatHistory] = useState<any[]>([]);
    const router = useRouter();
    const pathname = usePathname();

    const isChat = pathname.startsWith('/chat');

    useEffect(() => {
        if (isMenuOpen) {
            setIsMenuVisible(true);
        } else {
            // メニューが閉じられたら、少し待ってから完全に非表示にする
            const timeout = setTimeout(() => {
                setIsMenuVisible(false);
            }, 200);
            return () => clearTimeout(timeout);
        }
    }, [isMenuOpen]);

    // チャット履歴を取得
    useEffect(() => {
        if (isMenuOpen && expandChats) {
            fetchChatHistory();
        }
    }, [isMenuOpen, expandChats]);

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

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const toggleExpandChats = () => {
        setExpandChats(!expandChats);
    };

    const createNewChat = () => {
        router.push('/chat');
        setIsMenuOpen(false);
    };

    const handleNavigate = (path: string) => {
        // メニューを閉じて即座に遷移
        setIsMenuOpen(false);
        setIsMenuVisible(false);
        router.push(path);
    };

    const openChat = (chatId: string) => {
        router.push(`/chat?id=${chatId}`);
        setIsMenuOpen(false);
    };

    return (
        <header className="bg-white shadow-md z-20 border-b border-gray-200">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">

                    {/* 左側のコンテンツ */}
                    <div className="flex items-center">
                        <div className="text-xl font-bold text-gray-900">My Next App</div>
                    </div>

                    {/* 右側のコンテンツ */}
                    <div className="flex items-center space-x-4">
                        {/* デスクトップ表示のUserMenu */}
                        <div className="hidden sm:block">
                            <UserMenu />
                        </div>

                        {/* モバイル用メニューボタン */}
                        <div className="sm:hidden">
                            <button
                                onClick={toggleMenu}
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                            >
                                <span className="sr-only">メニューを開く</span>
                                {isMenuOpen ? (
                                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                ) : (
                                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* モバイルメニュー */}
            {isMenuVisible && (
                <div
                    className={`sm:hidden fixed inset-0 z-50 bg-white transition-opacity duration-300 ease-in-out ${isMenuOpen ? 'opacity-100' : 'opacity-0'
                        }`}
                >
                    <div className="pt-2 pb-3 space-y-1">
                        <div className="flex justify-between items-center px-4 py-2 border-b border-gray-200">
                            <div className="text-xl font-bold text-gray-900">メニュー</div>
                            <button
                                onClick={toggleMenu}
                                className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                            >
                                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <button
                            className="block w-full text-left px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
                            onClick={() => handleNavigate('/')}
                        >
                            ホーム
                        </button>

                        {/* チャットメニュー */}
                        <div>
                            <div className="flex items-center justify-between px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50">
                                <div className="flex items-center flex-1">
                                    <button
                                        onClick={toggleExpandChats}
                                        className="mr-2 text-gray-600"
                                        aria-label="チャット履歴を表示"
                                    >
                                        {expandChats ?
                                            <MdKeyboardArrowDown size={20} /> :
                                            <MdKeyboardArrowRight size={20} />
                                        }
                                    </button>
                                    <button
                                        className="flex-1 text-left"
                                        onClick={() => handleNavigate('/chat')}
                                    >
                                        チャット
                                    </button>
                                </div>
                                <button
                                    onClick={createNewChat}
                                    className="text-gray-600 hover:text-gray-900 p-1"
                                    title="新しいチャットを作成"
                                >
                                    <MdAdd size={20} />
                                </button>
                            </div>

                            {/* チャット履歴 - 展開時のみ表示 */}
                            {expandChats && (
                                <div className="ml-8 space-y-1">
                                    {chatHistory.length > 0 ? (
                                        chatHistory.map(chat => (
                                            <button
                                                key={chat.id}
                                                className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                onClick={() => openChat(chat.id)}
                                            >
                                                <MdChatBubbleOutline className="mr-2 text-gray-500" size={16} />
                                                <span className="truncate">{chat.title}</span>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="px-3 py-2 text-sm text-gray-500">
                                            履歴がありません
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="pt-4 pb-3 border-t border-gray-200">
                        <div className="px-4">
                            <UserMenu onLinkClick={toggleMenu} />
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
} 