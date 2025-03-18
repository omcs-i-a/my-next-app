'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import UserMenu from './UserMenu';

export default function Header() {
    const { data: session, status } = useSession();
    const isLoading = status === 'loading';
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const router = useRouter();

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

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleNavigate = (path: string) => {
        // メニューを閉じて即座に遷移
        setIsMenuOpen(false);
        setIsMenuVisible(false);
        router.push(path);
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
                        <button
                            className="block w-full text-left px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
                            onClick={() => handleNavigate('/chat')}
                        >
                            チャット
                        </button>
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