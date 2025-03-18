'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
    const pathname = usePathname();

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
                <Link
                    href="/chat"
                    className={`block px-3 py-2 rounded transition ${pathname === '/chat' ? 'bg-gray-200' : 'hover:bg-gray-200'
                        }`}
                >
                    チャット
                </Link>
            </nav>
        </aside>
    );
} 