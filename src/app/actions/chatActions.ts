'use server';

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/config/auth";
import { prisma } from "@/lib/prisma";
import { SafeChatDTO, SafeMessageDTO, ChatWithMessagesDTO } from "@/lib/chatService";
import { getChatsForUser, getChatWithMessages } from "@/lib/chatService";
import { revalidatePath } from "next/cache";

/**
 * ユーザーのチャット一覧を取得するサーバーアクション
 * クライアントコンポーネントから呼び出し可能
 */
export async function getUserChats(): Promise<SafeChatDTO[]> {
    // セッションを取得してユーザー認証
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return [];
    }

    // 安全なDTO形式でチャットを取得
    return getChatsForUser(session.user.id);
}

/**
 * 特定のチャットとそのメッセージを取得するサーバーアクション
 * クライアントコンポーネントから呼び出し可能
 */
export async function getChatById(chatId: string): Promise<ChatWithMessagesDTO | null> {
    // セッションを取得してユーザー認証
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return null;
    }

    // 安全なDTO形式でチャットとメッセージを取得
    return getChatWithMessages(chatId, session.user.id);
}

/**
 * 新しいメッセージを送信するサーバーアクション
 * クライアントコンポーネントから呼び出し可能
 */
export async function sendChatMessage(chatId: string | null, content: string): Promise<{
    success: boolean;
    chatId: string | null;
    message?: SafeMessageDTO;
    error?: string;
}> {
    try {
        // セッションを取得してユーザー認証
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return { success: false, chatId: null, error: '認証されていません' };
        }

        let currentChatId = chatId;

        // チャットIDがない場合は新しいチャットを作成
        if (!currentChatId) {
            // チャットのタイトルとして最初のユーザーメッセージを使用（20文字まで）
            const chatTitle = content.slice(0, 20) + (content.length > 20 ? '...' : '');

            const newChat = await prisma.chat.create({
                data: {
                    userId: session.user.id,
                    title: chatTitle,
                }
            });

            currentChatId = newChat.id;
        }

        // ユーザーメッセージをデータベースに保存
        const userMessage = await prisma.message.create({
            data: {
                chatId: currentChatId,
                role: 'user',
                content: content,
            }
        });

        // キャッシュを更新
        revalidatePath(`/chat?id=${currentChatId}`);

        // 安全なDTO形式でメッセージを返却
        return {
            success: true,
            chatId: currentChatId,
            message: {
                id: userMessage.id,
                role: userMessage.role,
                content: userMessage.content,
                createdAt: userMessage.createdAt.toISOString(),
            }
        };
    } catch (error) {
        console.error('メッセージ送信エラー:', error);
        return {
            success: false,
            chatId,
            error: 'メッセージの送信に失敗しました'
        };
    }
} 