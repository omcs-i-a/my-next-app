'use server';

import { getAuthSession, getSessionUserId } from "@/lib/session";
import { db } from "@/lib/db";
import { checkPermission } from "@/lib/permissions";
import { toChatDTO, toChatDTOs, toMessageDTO, toMessageDTOs } from "@/lib/dto-converters";
import { chatCreateSchema, messageCreateSchema, sanitizeInput } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { ChatDTO, MessageDTO } from "@/types/dto";

/**
 * ユーザーのチャット一覧を取得するアクション
 */
export async function getUserChats(): Promise<{ chats?: ChatDTO[]; error?: string }> {
    try {
        // 認証済みセッションを取得
        const session = await getAuthSession();

        // セッションからユーザーIDを安全に取得
        const userId = getSessionUserId(session);

        // ユーザーが参加しているチャットのみ取得
        const chats = await db.chat.findMany({
            where: {
                participants: {
                    some: {
                        userId,
                    },
                },
            },
            include: {
                participants: {
                    include: {
                        user: true,
                    },
                },
                messages: {
                    orderBy: {
                        createdAt: "desc",
                    },
                    take: 1,
                },
            },
            orderBy: {
                updatedAt: "desc",
            },
        });

        return { chats: toChatDTOs(chats) };
    } catch (error) {
        console.error("チャット一覧取得エラー:", error);
        return { error: "チャット一覧の取得に失敗しました" };
    }
}

/**
 * チャットの詳細を取得するアクション（権限チェック付き）
 */
export async function getChatById(
    chatId: string
): Promise<{ chat?: ChatDTO; messages?: MessageDTO[]; error?: string }> {
    try {
        // 認証済みセッションを取得
        await getAuthSession();

        // 権限チェック
        const permission = await checkPermission("chat", chatId);

        if (!permission.allowed) {
            return { error: permission.reason || "このチャットにアクセスする権限がありません" };
        }

        const chat = await db.chat.findUnique({
            where: { id: chatId },
            include: {
                participants: {
                    include: {
                        user: true,
                    },
                },
                messages: {
                    orderBy: {
                        createdAt: "desc",
                    },
                    take: 1,
                },
            },
        });

        if (!chat) {
            return { error: "チャットが見つかりません" };
        }

        const messages = await db.message.findMany({
            where: { chatId },
            orderBy: {
                createdAt: "asc",
            },
        });

        return {
            chat: toChatDTO(chat),
            messages: toMessageDTOs(messages),
        };
    } catch (error) {
        console.error("チャット詳細取得エラー:", error);
        return { error: "チャット詳細の取得に失敗しました" };
    }
}

/**
 * 新規チャット作成アクション
 */
export async function createChat(
    formData: FormData
): Promise<{ success?: boolean; chatId?: string; error?: string; fieldErrors?: Record<string, string[]> }> {
    try {
        // 認証済みセッションを取得
        const session = await getAuthSession();
        const userId = getSessionUserId(session);

        // 入力データの取得とサニタイズ
        const name = sanitizeInput(formData.get("name") as string || "");
        const participantIdsStr = formData.get("participantIds") as string;

        // 参加者IDをJSONから解析
        let participantIds: string[] = [];
        try {
            participantIds = JSON.parse(participantIdsStr);
        } catch (e) {
            return { error: "参加者データの形式が不正です" };
        }

        // バリデーション
        const validationResult = chatCreateSchema.safeParse({
            name: name || null,
            participantIds,
        });

        if (!validationResult.success) {
            return {
                error: "入力内容に問題があります",
                fieldErrors: validationResult.error.formErrors.fieldErrors,
            };
        }

        // 作成者も参加者に含める
        const uniqueParticipantIds = [...new Set([userId, ...participantIds])];

        // 参加者が実在するユーザーか確認
        const existingUserCount = await db.user.count({
            where: {
                id: {
                    in: uniqueParticipantIds,
                },
            },
        });

        if (existingUserCount !== uniqueParticipantIds.length) {
            return { error: "存在しないユーザーが含まれています" };
        }

        // トランザクションでチャットと参加者を一括作成
        const chat = await db.$transaction(async (tx) => {
            // チャット作成
            const newChat = await tx.chat.create({
                data: {
                    name: name || null,
                },
            });

            // 参加者を追加
            for (const participantId of uniqueParticipantIds) {
                await tx.chatParticipant.create({
                    data: {
                        userId: participantId,
                        chatId: newChat.id,
                    },
                });
            }

            return newChat;
        });

        revalidatePath("/chats");
        return { success: true, chatId: chat.id };
    } catch (error) {
        console.error("チャット作成エラー:", error);
        return { error: "チャットの作成に失敗しました" };
    }
}

/**
 * メッセージ送信アクション（権限チェック付き）
 */
export async function sendMessage(
    formData: FormData
): Promise<{ success?: boolean; messageId?: string; error?: string; fieldErrors?: Record<string, string[]> }> {
    try {
        // 認証済みセッションを取得
        const session = await getAuthSession();
        const userId = getSessionUserId(session);

        // 入力データの取得とサニタイズ
        const chatId = formData.get("chatId") as string;
        const content = sanitizeInput(formData.get("content") as string);

        // バリデーション
        const validationResult = messageCreateSchema.safeParse({
            chatId,
            content,
        });

        if (!validationResult.success) {
            return {
                error: "入力内容に問題があります",
                fieldErrors: validationResult.error.formErrors.fieldErrors,
            };
        }

        // 権限チェック
        const permission = await checkPermission("chat", chatId);

        if (!permission.allowed) {
            return { error: permission.reason || "このチャットにメッセージを送信する権限がありません" };
        }

        // メッセージ作成と同時にチャットの更新日時も更新
        const [message, _] = await db.$transaction([
            db.message.create({
                data: {
                    content,
                    chatId,
                    userId,
                },
            }),
            db.chat.update({
                where: { id: chatId },
                data: { updatedAt: new Date() },
            }),
        ]);

        revalidatePath(`/chats/${chatId}`);
        revalidatePath(`/chats`);
        return { success: true, messageId: message.id };
    } catch (error) {
        console.error("メッセージ送信エラー:", error);
        return { error: "メッセージの送信に失敗しました" };
    }
}

/**
 * チャット退出アクション（権限チェック付き）
 */
export async function leaveChat(chatId: string): Promise<{ success?: boolean; error?: string }> {
    try {
        // 認証済みセッションを取得
        const session = await getAuthSession();
        const userId = getSessionUserId(session);

        // 権限チェック
        const permission = await checkPermission("chat", chatId);

        if (!permission.allowed) {
            return { error: permission.reason || "このチャットから退出する権限がありません" };
        }

        // 参加者から自分を削除
        await db.chatParticipant.deleteMany({
            where: {
                chatId,
                userId,
            },
        });

        // 参加者が0人になったらチャットも削除
        const remainingParticipants = await db.chatParticipant.count({
            where: { chatId },
        });

        if (remainingParticipants === 0) {
            await db.chat.delete({
                where: { id: chatId },
            });
        }

        revalidatePath("/chats");
        return { success: true };
    } catch (error) {
        console.error("チャット退出エラー:", error);
        return { error: "チャットからの退出に失敗しました" };
    }
}

/**
 * チャットに参加者を追加するアクション（権限チェック付き）
 */
export async function addChatParticipant(
    chatId: string,
    newParticipantId: string
): Promise<{ success?: boolean; error?: string }> {
    try {
        // 認証済みセッションを取得
        await getAuthSession();

        // 権限チェック
        const permission = await checkPermission("chat", chatId);

        if (!permission.allowed) {
            return { error: permission.reason || "このチャットに参加者を追加する権限がありません" };
        }

        // 追加するユーザーが存在するか確認
        const user = await db.user.findUnique({
            where: { id: newParticipantId },
            select: { id: true },
        });

        if (!user) {
            return { error: "追加するユーザーが見つかりません" };
        }

        // すでに参加者になっていないか確認
        const existingParticipant = await db.chatParticipant.findUnique({
            where: {
                userId_chatId: {
                    userId: newParticipantId,
                    chatId,
                },
            },
        });

        if (existingParticipant) {
            return { error: "このユーザーはすでにチャットに参加しています" };
        }

        // 参加者を追加
        await db.chatParticipant.create({
            data: {
                userId: newParticipantId,
                chatId,
            },
        });

        revalidatePath(`/chats/${chatId}`);
        return { success: true };
    } catch (error) {
        console.error("参加者追加エラー:", error);
        return { error: "参加者の追加に失敗しました" };
    }
} 