import Link from 'next/link';

/**
 * 権限エラーページ
 * 必要な権限がない場合や許可されていないリソースにアクセスした場合に表示
 */
export default function UnauthorizedPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
            <div className="bg-red-100 rounded-full p-6 mb-6">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                </svg>
            </div>

            <h1 className="text-3xl font-bold text-center mb-4">アクセスが拒否されました</h1>

            <p className="text-gray-600 text-center mb-8 max-w-md">
                このページにアクセスするために必要な権限がないか、
                リソースにアクセスする許可がありません。
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
                <Link
                    href="/"
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-center"
                >
                    ホームに戻る
                </Link>

                <Link
                    href="/dashboard"
                    className="px-6 py-3 bg-gray-200 rounded-lg hover:bg-gray-300 text-center"
                >
                    ダッシュボードへ
                </Link>
            </div>
        </div>
    );
} 