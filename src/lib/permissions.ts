import { getSession } from "@/lib/session";
import { isAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * リソースタイプの定義
 */
export type ResourceType = "post" | "comment" | "chat" | "profile" | "file";

/**
 * 権限チェック結果の型定義
 */
export interface PermissionResult {
    allowed: boolean;
    reason?: string;
}

/**
 * 指定されたリソースに対するユーザーのアクセス権限をチェック
 * @param resourceType リソースの種類
 * @param resourceId リソースのID
 * @returns 権限チェック結果
 */
export async function checkPermission(
    resourceType: ResourceType,
    resourceId: string
): Promise<PermissionResult> {
    // セッションからユーザー情報を取得
    const session = await getSession();

    // 未認証ユーザーはアクセス不可
    if (!session?.user?.id) {
        return { allowed: false, reason: "認証が必要です" };
    }

    const userId = session.user.id;

    // 管理者は常にアクセス許可
    if (isAdmin(session)) {
        return { allowed: true };
    }

    try {
        // リソースタイプに応じた権限チェック
        switch (resourceType) {
            case "post":
                return await checkPostPermission(userId, resourceId);
            case "comment":
                return await checkCommentPermission(userId, resourceId);
            case "chat":
                return await checkChatPermission(userId, resourceId);
            case "profile":
                return await checkProfilePermission(userId, resourceId);
            case "file":
                return await checkFilePermission(userId, resourceId);
            default:
                return { allowed: false, reason: "不明なリソースタイプです" };
        }
    } catch (error) {
        console.error("権限チェックエラー:", error);
        return { allowed: false, reason: "権限チェック中にエラーが発生しました" };
    }
}

/**
 * 投稿に対する権限チェック
 */
async function checkPostPermission(
    userId: string,
    postId: string
): Promise<PermissionResult> {
    const post = await db.post.findUnique({
        where: { id: postId },
        select: { userId: true },
    });

    if (!post) {
        return { allowed: false, reason: "投稿が見つかりません" };
    }

    return {
        allowed: post.userId === userId,
        reason: post.userId !== userId ? "この投稿を操作する権限がありません" : undefined,
    };
}

/**
 * コメントに対する権限チェック
 */
async function checkCommentPermission(
    userId: string,
    commentId: string
): Promise<PermissionResult> {
    const comment = await db.comment.findUnique({
        where: { id: commentId },
        select: {
            userId: true,
            post: { select: { userId: true } }
        },
    });

    if (!comment) {
        return { allowed: false, reason: "コメントが見つかりません" };
    }

    // コメント投稿者または投稿所有者の場合はアクセス許可
    const isCommentOwner = comment.userId === userId;
    const isPostOwner = comment.post?.userId === userId;

    return {
        allowed: isCommentOwner || isPostOwner,
        reason: (!isCommentOwner && !isPostOwner) ? "このコメントを操作する権限がありません" : undefined,
    };
}

/**
 * チャットに対する権限チェック
 */
async function checkChatPermission(
    userId: string,
    chatId: string
): Promise<PermissionResult> {
    // チャット参加者を確認
    const participant = await db.chatParticipant.findUnique({
        where: {
            userId_chatId: {
                userId: userId,
                chatId: chatId
            }
        }
    });

    if (!participant) {
        return { allowed: false, reason: "このチャットにアクセスする権限がありません" };
    }

    return { allowed: true };
}

/**
 * プロフィールに対する権限チェック
 */
async function checkProfilePermission(
    userId: string,
    profileId: string
): Promise<PermissionResult> {
    // 自分自身のプロフィールのみ編集可能
    return {
        allowed: userId === profileId,
        reason: userId !== profileId ? "他のユーザーのプロフィールを操作する権限がありません" : undefined,
    };
}

/**
 * ファイルに対する権限チェック
 */
async function checkFilePermission(
    userId: string,
    fileId: string
): Promise<PermissionResult> {
    const file = await db.file.findUnique({
        where: { id: fileId },
        select: { userId: true },
    });

    if (!file) {
        return { allowed: false, reason: "ファイルが見つかりません" };
    }

    return {
        allowed: file.userId === userId,
        reason: file.userId !== userId ? "このファイルを操作する権限がありません" : undefined,
    };
} 