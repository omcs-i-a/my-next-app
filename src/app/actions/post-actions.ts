'use server';

import { getAuthSession, getSessionUserId } from "@/lib/session";
import { db } from "@/lib/db";
import { checkPermission } from "@/lib/permissions";
import { toPostDTO, toPostDTOs, toCommentDTO, toCommentDTOs } from "@/lib/dto-converters";
import { postCreateSchema, postUpdateSchema, commentCreateSchema, sanitizeInput } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { PostDTO, CommentDTO } from "@/types/dto";

/**
 * 投稿一覧を取得するアクション
 * ページネーション対応
 */
export async function getPosts(page = 1, perPage = 10): Promise<{ posts?: PostDTO[]; totalPages?: number; error?: string }> {
    try {
        // 認証済みセッションを取得
        const session = await getAuthSession();

        const skip = (page - 1) * perPage;

        const [posts, totalCount] = await Promise.all([
            db.post.findMany({
                skip,
                take: perPage,
                where: {
                    published: true,
                },
                include: {
                    user: true,
                    _count: {
                        select: {
                            comments: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
            }),
            db.post.count({
                where: {
                    published: true,
                },
            }),
        ]);

        return {
            posts: toPostDTOs(posts),
            totalPages: Math.ceil(totalCount / perPage),
        };
    } catch (error) {
        console.error("投稿一覧取得エラー:", error);
        return { error: "投稿一覧の取得に失敗しました" };
    }
}

/**
 * 自分の投稿一覧を取得
 */
export async function getMyPosts(page = 1, perPage = 10): Promise<{ posts?: PostDTO[]; totalPages?: number; error?: string }> {
    try {
        // 認証済みセッションを取得
        const session = await getAuthSession();
        const userId = getSessionUserId(session);

        const skip = (page - 1) * perPage;

        const [posts, totalCount] = await Promise.all([
            db.post.findMany({
                skip,
                take: perPage,
                where: {
                    userId,
                },
                include: {
                    user: true,
                    _count: {
                        select: {
                            comments: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
            }),
            db.post.count({
                where: {
                    userId,
                },
            }),
        ]);

        return {
            posts: toPostDTOs(posts),
            totalPages: Math.ceil(totalCount / perPage),
        };
    } catch (error) {
        console.error("自分の投稿一覧取得エラー:", error);
        return { error: "投稿一覧の取得に失敗しました" };
    }
}

/**
 * 投稿の詳細を取得するアクション
 */
export async function getPostById(
    postId: string
): Promise<{ post?: PostDTO; comments?: CommentDTO[]; error?: string }> {
    try {
        // 認証済みセッションを取得
        await getAuthSession();

        const post = await db.post.findUnique({
            where: { id: postId },
            include: {
                user: true,
                _count: {
                    select: {
                        comments: true,
                    },
                },
            },
        });

        if (!post) {
            return { error: "投稿が見つかりません" };
        }

        // 非公開投稿の場合は作成者本人のみ閲覧可能
        if (!post.published) {
            const session = await getAuthSession();
            const userId = getSessionUserId(session);

            if (post.userId !== userId) {
                return { error: "この投稿を閲覧する権限がありません" };
            }
        }

        const comments = await db.comment.findMany({
            where: { postId },
            include: {
                user: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return {
            post: toPostDTO(post),
            comments: toCommentDTOs(comments),
        };
    } catch (error) {
        console.error("投稿詳細取得エラー:", error);
        return { error: "投稿詳細の取得に失敗しました" };
    }
}

/**
 * 新規投稿作成アクション
 */
export async function createPost(
    formData: FormData
): Promise<{ success?: boolean; postId?: string; error?: string; fieldErrors?: Record<string, string[]> }> {
    try {
        // 認証済みセッションを取得し、ユーザーIDを安全に取得
        const session = await getAuthSession();
        const userId = getSessionUserId(session);

        // 入力データの取得とサニタイズ
        const title = sanitizeInput(formData.get("title") as string);
        const content = sanitizeInput(formData.get("content") as string);
        const published = formData.get("published") === "true";

        // バリデーション
        const validationResult = postCreateSchema.safeParse({
            title,
            content,
            published,
        });

        if (!validationResult.success) {
            return {
                error: "入力内容に問題があります",
                fieldErrors: validationResult.error.formErrors.fieldErrors,
            };
        }

        // セッションから取得したユーザーIDを使用して保存
        const post = await db.post.create({
            data: {
                title,
                content,
                published,
                userId,
            },
        });

        revalidatePath("/posts");
        return { success: true, postId: post.id };
    } catch (error) {
        console.error("投稿作成エラー:", error);
        return { error: "投稿の作成に失敗しました" };
    }
}

/**
 * 投稿更新アクション（権限チェック付き）
 */
export async function updatePost(
    postId: string,
    formData: FormData
): Promise<{ success?: boolean; error?: string; fieldErrors?: Record<string, string[]> }> {
    try {
        // 認証済みセッションを取得
        await getAuthSession();

        // 権限チェック
        const permission = await checkPermission("post", postId);

        if (!permission.allowed) {
            return { error: permission.reason || "この操作を実行する権限がありません" };
        }

        // 入力データの取得とサニタイズ
        const title = sanitizeInput(formData.get("title") as string);
        const content = sanitizeInput(formData.get("content") as string);
        const published = formData.get("published") === "true";

        // バリデーション
        const validationResult = postUpdateSchema.safeParse({
            title,
            content,
            published,
        });

        if (!validationResult.success) {
            return {
                error: "入力内容に問題があります",
                fieldErrors: validationResult.error.formErrors.fieldErrors,
            };
        }

        await db.post.update({
            where: { id: postId },
            data: {
                title,
                content,
                published,
            },
        });

        revalidatePath(`/posts/${postId}`);
        revalidatePath("/posts");
        return { success: true };
    } catch (error) {
        console.error("投稿更新エラー:", error);
        return { error: "投稿の更新に失敗しました" };
    }
}

/**
 * 投稿削除アクション（権限チェック付き）
 */
export async function deletePost(postId: string): Promise<{ success?: boolean; error?: string }> {
    try {
        // 認証済みセッションを取得
        await getAuthSession();

        // 権限チェック
        const permission = await checkPermission("post", postId);

        if (!permission.allowed) {
            return { error: permission.reason || "この操作を実行する権限がありません" };
        }

        await db.post.delete({
            where: { id: postId },
        });

        revalidatePath("/posts");
        return { success: true };
    } catch (error) {
        console.error("投稿削除エラー:", error);
        return { error: "投稿の削除に失敗しました" };
    }
}

/**
 * コメント作成アクション
 */
export async function createComment(
    formData: FormData
): Promise<{ success?: boolean; commentId?: string; error?: string; fieldErrors?: Record<string, string[]> }> {
    try {
        // 認証済みセッションを取得し、ユーザーIDを安全に取得
        const session = await getAuthSession();
        const userId = getSessionUserId(session);

        // 入力データの取得とサニタイズ
        const postId = formData.get("postId") as string;
        const content = sanitizeInput(formData.get("content") as string);

        // バリデーション
        const validationResult = commentCreateSchema.safeParse({
            postId,
            content,
        });

        if (!validationResult.success) {
            return {
                error: "入力内容に問題があります",
                fieldErrors: validationResult.error.formErrors.fieldErrors,
            };
        }

        // 投稿の存在確認
        const post = await db.post.findUnique({
            where: { id: postId },
            select: { id: true, published: true },
        });

        if (!post) {
            return { error: "投稿が見つかりません" };
        }

        // 非公開投稿へのコメントは許可しない
        if (!post.published) {
            return { error: "非公開の投稿にはコメントできません" };
        }

        const comment = await db.comment.create({
            data: {
                content,
                userId,
                postId,
            },
        });

        revalidatePath(`/posts/${postId}`);
        return { success: true, commentId: comment.id };
    } catch (error) {
        console.error("コメント作成エラー:", error);
        return { error: "コメントの投稿に失敗しました" };
    }
}

/**
 * コメント削除アクション（権限チェック付き）
 */
export async function deleteComment(
    commentId: string
): Promise<{ success?: boolean; error?: string }> {
    try {
        // 認証済みセッションを取得
        await getAuthSession();

        // 権限チェック
        const permission = await checkPermission("comment", commentId);

        if (!permission.allowed) {
            return { error: permission.reason || "この操作を実行する権限がありません" };
        }

        const comment = await db.comment.findUnique({
            where: { id: commentId },
            select: { postId: true },
        });

        if (!comment) {
            return { error: "コメントが見つかりません" };
        }

        await db.comment.delete({
            where: { id: commentId },
        });

        revalidatePath(`/posts/${comment.postId}`);
        return { success: true };
    } catch (error) {
        console.error("コメント削除エラー:", error);
        return { error: "コメントの削除に失敗しました" };
    }
} 