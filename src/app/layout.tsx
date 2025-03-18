import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
    title: "My Next App",
    description: "This is my next app",
    icons: {
        icon: [
            {
                url: '/favicon.ico',
                sizes: 'any',
                type: 'image/x-icon',
            },
        ],
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ja">
            <AuthProvider>
                <body className="min-h-screen bg-white flex flex-col">
                    <Header />
                    <div className="flex flex-1 overflow-hidden">
                        {/* サイドバーコンポーネント */}
                        <Sidebar />

                        {/* メインコンテンツ */}
                        <main className="flex-1 p-3 sm:p-6 overflow-y-auto sm:ml-64 bg-white">
                            {children}
                        </main>
                    </div>
                </body>
            </AuthProvider>
        </html>
    );
}

