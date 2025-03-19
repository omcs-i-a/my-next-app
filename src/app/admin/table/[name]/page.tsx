'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface TableRecord {
    [key: string]: any;
}

export default function TableDetails() {
    const router = useRouter();
    const params = useParams();
    const tableName = params.name as string;

    const [records, setRecords] = useState<TableRecord[]>([]);
    const [columns, setColumns] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        // 認証チェック
        const isAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true';
        if (!isAuthenticated) {
            router.push('/admin');
            return;
        }

        // テーブルのレコードを取得
        const fetchRecords = async () => {
            try {
                const response = await fetch(`/api/admin/tables/${tableName}`);
                if (!response.ok) {
                    throw new Error(`${tableName}テーブルの取得に失敗しました`);
                }
                const data = await response.json();
                setRecords(data.records);

                // レコードからカラム名を取得
                if (data.records.length > 0) {
                    setColumns(Object.keys(data.records[0]));
                }
            } catch (err) {
                setError(`${tableName}テーブルの取得に失敗しました`);
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRecords();
    }, [router, tableName]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-xl">ロード中...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <Link
                    href="/admin/dashboard"
                    className="text-indigo-600 hover:text-indigo-900 flex items-center"
                >
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    ダッシュボードに戻る
                </Link>
            </div>

            <h1 className="text-3xl font-bold mb-6">{tableName}テーブル</h1>

            {error && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 text-red-700">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">レコード一覧</h2>

                {records.length === 0 ? (
                    <p>レコードが見つかりませんでした。</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {columns.map((column) => (
                                        <th
                                            key={column}
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            {column}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {records.map((record, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        {columns.map((column) => (
                                            <td key={`${idx}-${column}`} className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {/* オブジェクトや配列の場合はJSON文字列に変換して表示 */}
                                                    {typeof record[column] === 'object' && record[column] !== null
                                                        ? JSON.stringify(record[column])
                                                        : String(record[column] ?? '')}
                                                </div>
                                            </td>
                                        ))}
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