'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface TableInfo {
    name: string;
    count: number;
}

export default function AdminDashboard() {
    const router = useRouter();
    const [tables, setTables] = useState<TableInfo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        // 認証チェック
        const isAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true';
        if (!isAuthenticated) {
            router.push('/admin');
            return;
        }

        // テーブル情報を取得
        const fetchTables = async () => {
            try {
                const response = await fetch('/api/admin/tables');
                if (!response.ok) {
                    throw new Error('テーブル情報の取得に失敗しました');
                }
                const data = await response.json();
                setTables(data.tables);
            } catch (err) {
                setError('テーブル情報の取得に失敗しました');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTables();
    }, [router]);

    const handleLogout = () => {
        sessionStorage.removeItem('adminAuthenticated');
        router.push('/admin');
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-xl">ロード中...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">管理パネル - ダッシュボード</h1>
                <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
                >
                    ログアウト
                </button>
            </div>

            {error && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 text-red-700">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">データベーステーブル</h2>

                {tables.length === 0 ? (
                    <p>テーブルが見つかりませんでした。</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        テーブル名
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        レコード数
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        操作
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {tables.map((table) => (
                                    <tr key={table.name} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{table.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">{table.count}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <Link
                                                href={`/admin/table/${table.name}`}
                                                className="text-indigo-600 hover:text-indigo-900"
                                            >
                                                詳細を表示
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
} 