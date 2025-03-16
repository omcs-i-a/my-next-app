'use client';

import Link from 'next/link';

export default function Sidebar() {
    return (
        <aside className="w-64 bg-gray-100 shadow-md flex flex-col overflow-y-auto">
            <div className="p-4 font-bold text-xl">My Next App</div>
            <nav className="flex-1 p-4 space-y-2">
                <Link
                    href="/"
                    className="block px-3 py-2 rounded hover:bg-gray-200 transition"
                >
                    ホーム
                </Link>
                <Link
                    href="/chat"
                    className="block px-3 py-2 rounded hover:bg-gray-200 transition"
                >
                    チャット
                </Link>
            </nav>
        </aside>
    );
} 