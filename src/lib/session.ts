import { getServerSession } from "next-auth";
import { authOptions, isAuthenticated, isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";

/**
 * サーバー側で認証済みセッションを取得
 * 未認証の場合はnullを返す
 */
export async function getSession() {
    return await getServerSession(authOptions);
}

/**
 * 認証済みユーザーのセッションを取得
 * 未認証の場合はログインページにリダイレクト
 */
export async function getAuthSession() {
    const session = await getServerSession(authOptions);

    if (!isAuthenticated(session)) {
        redirect("/login");
    }

    return session;
}

/**
 * 管理者ユーザーのセッションを取得
 * 管理者でない場合は権限エラーページにリダイレクト
 */
export async function getAdminSession() {
    const session = await getServerSession(authOptions);

    if (!isAuthenticated(session)) {
        redirect("/login");
    }

    if (!isAdmin(session)) {
        redirect("/unauthorized");
    }

    return session;
}

/**
 * 認証セッションから安全にユーザーIDを取得
 * 認証済みであることが確認されている場合のみ使用
 */
export function getSessionUserId(session: any): string {
    if (!session?.user?.id) {
        throw new Error("認証されていないユーザーからのアクセスです");
    }
    return session.user.id;
} 