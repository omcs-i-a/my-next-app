import { prisma } from '@/lib/prisma';
import { Chat, Message } from '@prisma/client';

// クライアントに安全に渡すためのDTOの型定義
export type SafeChatDTO = {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
};

export type SafeMessageDTO = {
    id: string;
    role: string;
    content: string;
    createdAt: string;
};

export type ChatWithMessagesDTO = SafeChatDTO & {
    messages: SafeMessageDTO[];
};

/**
 * データベースからチャット一覧を取得し、クライアントコンポーネントに
 * 安全に渡せる形式に変換する
 * 
 * @param userId ユーザーID
 * @returns 安全なチャットDTO配列
 */
export async function getChatsForUser(userId: string): Promise<SafeChatDTO[]> {
    // 必要最小限のデータのみを取得
    const chats = await prisma.chat.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
    });

    // 安全なDTOに変換
    return chats.map(chat => ({
        id: chat.id,
        title: chat.title,
        createdAt: chat.createdAt.toISOString(),
        updatedAt: chat.updatedAt.toISOString(),
    }));
}

/**
 * 特定のチャットとそのメッセージを取得し、クライアントコンポーネントに
 * 安全に渡せる形式に変換する
 * 
 * @param chatId チャットID
 * @param userId ユーザーID
 * @returns 安全なチャットとメッセージのDTO
 */
export async function getChatWithMessages(
    chatId: string,
    userId: string
): Promise<ChatWithMessagesDTO | null> {
    // チャットを取得
    const chat = await prisma.chat.findUnique({
        where: {
            id: chatId,
            userId, // 自分のチャットのみ取得可能
        },
    });

    if (!chat) return null;

    // チャットに関連するメッセージを取得
    const messages = await prisma.message.findMany({
        where: { chatId },
        orderBy: { createdAt: 'asc' },
    });

    // 安全なDTOに変換
    return {
        id: chat.id,
        title: chat.title,
        createdAt: chat.createdAt.toISOString(),
        updatedAt: chat.updatedAt.toISOString(),
        messages: messages.map(msg => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            createdAt: msg.createdAt.toISOString(),
        })),
    };
} 