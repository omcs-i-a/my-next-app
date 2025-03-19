import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/config/auth';
import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';

// Prisma クライアントを初期化
const prisma = new PrismaClient();

// OpenAI クライアントは関数内で初期化するようにする
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
//   baseURL: process.env.OPENAI_API_URL,
// });

export async function POST(req: NextRequest) {
    try {
        console.log('Chat API: リクエスト受信');

        // ユーザーのセッションを取得
        const session = await getServerSession(authOptions);

        // 未認証の場合は401エラーを返す
        if (!session || !session.user) {
            console.log('Chat API: 認証エラー');
            return NextResponse.json({ error: '認証されていません' }, { status: 401 });
        }

        // ユーザーが存在するか確認してから処理を続ける
        const user = await prisma.user.findUnique({
            where: {
                id: session.user.id
            }
        });

        if (!user) {
            console.log('Chat API: ユーザーが存在しません', session.user.id);
            return NextResponse.json(
                { error: 'ユーザーが見つかりません' },
                { status: 404 }
            );
        }

        // リクエストからメッセージを取得
        const data = await req.json();
        console.log('Chat API: リクエストデータ', JSON.stringify(data));

        const { messages, chatId } = data;

        if (!messages || !Array.isArray(messages)) {
            console.log('Chat API: 無効なメッセージ形式');
            return NextResponse.json({ error: 'メッセージが無効です' }, { status: 400 });
        }

        // システムメッセージを除外した最後のメッセージ（ユーザーからの最新メッセージ）を取得
        const lastUserMessage = [...messages].reverse().find(msg => msg.role === 'user');
        if (!lastUserMessage) {
            console.log('Chat API: ユーザーメッセージが見つかりません');
            return NextResponse.json({ error: 'ユーザーメッセージが必要です' }, { status: 400 });
        }

        console.log('Chat API: 最後のユーザーメッセージ', JSON.stringify(lastUserMessage));

        try {
            // チャットIDがない場合は新しいチャットを作成
            let currentChatId = chatId;
            if (!currentChatId) {
                // チャットのタイトルとして最初のユーザーメッセージを使用（20文字まで）
                const chatTitle = lastUserMessage.content.slice(0, 20) +
                    (lastUserMessage.content.length > 20 ? '...' : '');

                console.log('Chat API: 新しいチャット作成', chatTitle);

                // 新しいチャットを作成
                const newChat = await prisma.chat.create({
                    data: {
                        userId: session.user.id,
                        title: chatTitle,
                    }
                });

                currentChatId = newChat.id;
                console.log('Chat API: 新しいチャットID', currentChatId);
            }

            // OpenAIのChat APIを呼び出す
            console.log('Chat API: OpenAI APIリクエスト送信');

            // OpenAIクライアントをここで初期化
            if (!process.env.OPENAI_API_KEY) {
                return NextResponse.json({ error: 'OpenAI APIキーが設定されていません' }, { status: 500 });
            }

            const openai = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY,
                baseURL: process.env.OPENAI_API_URL,
            });

            const completion = await openai.chat.completions.create({
                model: process.env.OPENAI_API_MODEL || 'gpt-4o',
                messages: messages,
                temperature: 0.7,
            });

            const assistantResponse = completion.choices[0].message;
            console.log('Chat API: OpenAI応答受信');

            // ユーザーメッセージとAIの応答をデータベースに保存
            console.log('Chat API: メッセージ保存処理開始');
            const userMessage = {
                chatId: currentChatId,
                role: lastUserMessage.role,
                content: lastUserMessage.content,
            };

            const assistantMessage = {
                chatId: currentChatId,
                role: assistantResponse.role,
                content: assistantResponse.content || '',
            };

            // メッセージを保存
            console.log('Chat API: メッセージをDBに保存');
            await prisma.message.createMany({
                data: [userMessage, assistantMessage]
            });

            // レスポンスを返す
            console.log('Chat API: 応答返却');
            return NextResponse.json({
                response: assistantResponse,
                usage: completion.usage,
                chatId: currentChatId,
            });
        } catch (dbError) {
            console.error('Chat API: データベースエラー', dbError);
            return NextResponse.json(
                { error: 'データベース処理中にエラーが発生しました' },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error('Chat API error:', error);
        return NextResponse.json(
            { error: 'AIとの通信中にエラーが発生しました' },
            { status: 500 }
        );
    }
}

// チャット履歴を取得するAPI
export async function GET(req: NextRequest) {
    try {
        console.log('Chat History API: リクエスト受信');

        // ユーザーのセッションを取得
        const session = await getServerSession(authOptions);

        // 未認証の場合は401エラーを返す
        if (!session || !session.user) {
            console.log('Chat History API: 認証エラー');
            return NextResponse.json({ error: '認証されていません' }, { status: 401 });
        }

        // URLからチャットIDを取得
        const url = new URL(req.url);
        const chatId = url.searchParams.get('chatId');

        try {
            if (chatId) {
                console.log('Chat History API: 特定チャット取得', chatId);
                // 特定のチャットのメッセージを取得
                const chat = await prisma.chat.findUnique({
                    where: {
                        id: chatId,
                        userId: session.user.id // ユーザー自身のチャットのみ取得
                    },
                    include: {
                        messages: {
                            orderBy: {
                                createdAt: 'asc'
                            }
                        }
                    }
                });

                if (!chat) {
                    console.log('Chat History API: チャットが見つかりません');
                    return NextResponse.json({ error: 'チャットが見つかりません' }, { status: 404 });
                }

                return NextResponse.json({ chat });
            } else {
                console.log('Chat History API: すべてのチャット取得');
                // ユーザーのすべてのチャットを取得
                const chats = await prisma.chat.findMany({
                    where: {
                        userId: session.user.id
                    },
                    orderBy: {
                        updatedAt: 'desc'
                    }
                });

                return NextResponse.json({ chats });
            }
        } catch (dbError) {
            console.error('Chat History API: データベースエラー', dbError);
            return NextResponse.json(
                { error: 'チャット履歴の取得中にデータベースエラーが発生しました' },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Chat history API error:', error);
        return NextResponse.json(
            { error: 'チャット履歴の取得中にエラーが発生しました' },
            { status: 500 }
        );
    }
} 