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
 * 特定のユーザーの投稿一覧を取得する
 */
export async function getUserPosts(
    userId: string,
    page: number = 1,
    perPage: number = 10,
    includePrivate: boolean = false
) {
    try {
        const session = await getAuthSession();

        // 非公開投稿を含める場合は、自分の投稿を見る場合のみ許可
        if (includePrivate && (!session || session.user.id !== userId)) {
            return {
                error: "非公開投稿の閲覧権限がありません"
            };
        }

        const skip = (page - 1) * perPage;

        // 公開投稿のみ、または自分の非公開投稿も含める
        const where = {
            authorId: userId,
            ...(includePrivate ? {} : { published: true })
        };

        const posts = await db.post.findMany({
            where,
            select: {
                id: true,
                title: true,
                content: true,
                published: true,
                createdAt: true,
                updatedAt: true,
                author: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    }
                },
                _count: {
                    select: {
                        comments: true,
                        likes: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: perPage
        });

        const totalPosts = await db.post.count({ where });

        return {
            posts: posts.map(post => toPostDTO(post)),
            pagination: {
                total: totalPosts,
                page,
                perPage,
                pageCount: Math.ceil(totalPosts / perPage)
            }
        };
    } catch (error) {
        console.error("ユーザー投稿一覧取得中にエラーが発生しました:", error);
        return { error: "投稿の取得に失敗しました" };
    }
}

/**
 * 投稿を作成する
 */
export async function createPost(formData: FormData) {
    try {
        // 認証済みセッションを取得（未認証の場合はリダイレクト）
        const session = await getAuthSession();
        const userId = getSessionUserId(session);

        // フォームデータの検証
        const validationResult = postCreateSchema.safeParse({
            title: formData.get('title'),
            content: formData.get('content'),
            published: formData.get('published') === 'true'
        });

        if (!validationResult.success) {
            return {
                error: "入力データが無効です",
                validationErrors: validationResult.error.formErrors.fieldErrors
            };
        }

        const { title, content, published } = validationResult.data;

        // 投稿の作成
        const post = await db.post.create({
            data: {
                title,
                content,
                published,
                userId,
            },
            select: {
                id: true,
                title: true,
                content: true,
                published: true,
                createdAt: true,
                updatedAt: true,
                author: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    }
                },
            }
        });

        // キャッシュの再検証
        revalidatePath('/posts');
        revalidatePath('/dashboard');

        return { post: toPostDTO(post) };
    } catch (error) {
        console.error("投稿作成中にエラーが発生しました:", error);
        return { error: "投稿の作成に失敗しました" };
    }
}

/**
 * 投稿を更新する
 */
export async function updatePost(postId: string, formData: FormData) {
    try {
        // 認証済みセッションを取得
        const session = await getAuthSession();

        // 権限チェック
        const permission = await checkPermission("post", postId);

        if (!permission.allowed) {
            return { error: permission.reason || "この投稿を更新する権限がありません" };
        }

        // フォームデータの検証
        const validationResult = postCreateSchema.safeParse({
            title: formData.get('title'),
            content: formData.get('content'),
            published: formData.get('published') === 'true'
        });

        if (!validationResult.success) {
            return {
                error: "入力データが無効です",
                validationErrors: validationResult.error.formErrors.fieldErrors
            };
        }

        const { title, content, published } = validationResult.data;

        // 投稿の更新
        const post = await db.post.update({
            where: { id: postId },
            data: {
                title,
                content,
                published
            },
            select: {
                id: true,
                title: true,
                content: true,
                published: true,
                createdAt: true,
                updatedAt: true,
                author: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    }
                },
            }
        });

        // キャッシュの再検証
        revalidatePath('/posts');
        revalidatePath(`/posts/${postId}`);
        revalidatePath('/dashboard');

        return { post: toPostDTO(post) };
    } catch (error) {
        console.error("投稿更新中にエラーが発生しました:", error);
        return { error: "投稿の更新に失敗しました" };
    }
}

/**
 * 投稿を削除する
 */
export async function deletePost(postId: string) {
    try {
        // 認証済みセッションを取得
        const session = await getAuthSession();

        // 権限チェック
        const permission = await checkPermission("post", postId);

        if (!permission.allowed) {
            return { error: permission.reason || "この投稿を削除する権限がありません" };
        }

        // 投稿の削除（コメントと「いいね」は外部キー制約により自動削除）
        await db.post.delete({
            where: { id: postId }
        });

        // キャッシュの再検証
        revalidatePath('/posts');
        revalidatePath('/dashboard');

        return { success: true };
    } catch (error) {
        console.error("投稿削除中にエラーが発生しました:", error);
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