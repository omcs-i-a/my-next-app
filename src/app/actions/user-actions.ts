'use server';

import { getAuthSession, getAdminSession, getSessionUserId } from "@/lib/session";
import { db } from "@/lib/db";
import { toUserDTO, toUserDTOs } from "@/lib/dto-converters";
import { profileUpdateSchema } from "@/lib/validations";
import { sanitizeInput } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { UserDTO } from "@/types/dto";
import { checkPermission } from "@/lib/permissions";

/**
 * 認証済みユーザーの情報を取得
 * セッションから安全にユーザーIDを取得して自分のプロフィールのみ閲覧可能
 */
export async function getCurrentUser(): Promise<{ user?: UserDTO; error?: string }> {
    try {
        // 認証済みセッションを取得（未認証の場合はリダイレクトされる）
        const session = await getAuthSession();

        // セッションからユーザーIDを安全に取得
        const userId = getSessionUserId(session);

        const user = await db.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return { error: "ユーザー情報が見つかりません" };
        }

        // DTOに変換して安全に返す
        return { user: toUserDTO(user) };
    } catch (error) {
        console.error("ユーザー情報取得エラー:", error);
        return { error: "ユーザー情報の取得に失敗しました" };
    }
}

/**
 * ユーザープロフィールの更新
 * FormDataからの入力を検証し、セッションのユーザーIDを使用して自分のプロフィールのみ更新可能
 */
export async function updateProfile(formData: FormData): Promise<{ success?: boolean; error?: string; fieldErrors?: Record<string, string[]> }> {
    try {
        // 認証済みセッションを取得
        const session = await getAuthSession();
        const userId = getSessionUserId(session);

        // 入力データの取得と検証
        const name = formData.get("name") as string;
        const bio = formData.get("bio") as string;

        // 入力データのサニタイズ (XSS対策)
        const sanitizedName = sanitizeInput(name);
        const sanitizedBio = bio ? sanitizeInput(bio) : null;

        // Zodでバリデーション
        const validationResult = profileUpdateSchema.safeParse({
            name: sanitizedName,
            bio: sanitizedBio,
        });

        if (!validationResult.success) {
            return {
                error: "入力内容に問題があります",
                fieldErrors: validationResult.error.formErrors.fieldErrors
            };
        }

        // データベース更新
        await db.user.update({
            where: { id: userId },
            data: {
                name: sanitizedName,
                bio: sanitizedBio,
            },
        });

        // キャッシュを再検証
        revalidatePath("/profile");
        revalidatePath(`/users/${userId}`);

        return { success: true };
    } catch (error) {
        console.error("プロフィール更新エラー:", error);
        return { error: "プロフィールの更新に失敗しました" };
    }
}

/**
 * 特定のユーザー情報を取得
 * ユーザーIDは直接引数として受け取るが、適切な権限チェックを行う
 */
export async function getUserById(userId: string): Promise<{ user?: UserDTO; error?: string }> {
    try {
        // セッションから認証情報を取得
        const session = await getAuthSession();
        const currentUserId = getSessionUserId(session);

        // 自分自身以外のプロフィールを見る場合、権限チェック
        if (userId !== currentUserId) {
            const permissionResult = await checkPermission("profile", userId);

            if (!permissionResult.allowed) {
                return { error: permissionResult.reason || "この操作を実行する権限がありません" };
            }
        }

        const user = await db.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return { error: "ユーザーが見つかりません" };
        }

        return { user: toUserDTO(user) };
    } catch (error) {
        console.error("ユーザー情報取得エラー:", error);
        return { error: "ユーザー情報の取得に失敗しました" };
    }
}

/**
 * ユーザー一覧を取得（管理者専用）
 */
export async function getAllUsers(page = 1, perPage = 10): Promise<{ users?: UserDTO[]; totalPages?: number; error?: string }> {
    try {
        // 管理者権限チェック
        const session = await getAdminSession();

        const skip = (page - 1) * perPage;

        const [users, totalCount] = await Promise.all([
            db.user.findMany({
                skip,
                take: perPage,
                orderBy: {
                    createdAt: "desc",
                },
            }),
            db.user.count(),
        ]);

        return {
            users: toUserDTOs(users),
            totalPages: Math.ceil(totalCount / perPage),
        };
    } catch (error) {
        console.error("ユーザー一覧取得エラー:", error);
        return { error: "ユーザー一覧の取得に失敗しました" };
    }
} 