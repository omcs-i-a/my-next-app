import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// app/layout.tsx (Next.js 13+)
// Next.js 15.2.2 の「appディレクトリ」構造を想定
import Link from 'next/link';

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
    title: "My Next App",
    description: "This is my next app",
};


export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className="h-screen w-screen bg-gray-100 flex">
                {/* 左サイドバー */}
                <aside className="w-64 bg-gray-100 shadow flex flex-col">
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

                {/* メインコンテンツ */}
                <main className="flex-1 overflow-auto">{children}</main>
            </body>
        </html>
    );
}

