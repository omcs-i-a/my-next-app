import { z } from "zod";

/**
 * ユーザー関連のバリデーションスキーマ
 */
export const loginSchema = z.object({
    email: z
        .string()
        .min(1, "メールアドレスは必須です")
        .email("有効なメールアドレスを入力してください"),
    password: z
        .string()
        .min(1, "パスワードは必須です")
        .min(8, "パスワードは8文字以上必要です"),
});

export const registerSchema = z
    .object({
        name: z.string().min(1, "名前は必須です").max(50, "名前は50文字以内で入力してください"),
        email: z
            .string()
            .min(1, "メールアドレスは必須です")
            .email("有効なメールアドレスを入力してください"),
        password: z
            .string()
            .min(1, "パスワードは必須です")
            .min(8, "パスワードは8文字以上必要です")
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                "パスワードは少なくとも1つの大文字、1つの小文字、1つの数字、1つの特殊文字を含む必要があります"
            ),
        confirmPassword: z.string().min(1, "パスワード確認は必須です"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "パスワードとパスワード確認が一致しません",
        path: ["confirmPassword"],
    });

export const profileUpdateSchema = z.object({
    name: z.string().min(1, "名前は必須です").max(50, "名前は50文字以内で入力してください"),
    bio: z
        .string()
        .max(500, "自己紹介は500文字以内で入力してください")
        .optional()
        .nullable(),
});

/**
 * 投稿関連のバリデーションスキーマ
 */
export const postCreateSchema = z.object({
    title: z
        .string()
        .min(1, "タイトルは必須です")
        .max(100, "タイトルは100文字以内で入力してください"),
    content: z
        .string()
        .min(1, "内容は必須です")
        .max(10000, "内容は10000文字以内で入力してください"),
    published: z.boolean().default(true),
});

export const postUpdateSchema = postCreateSchema;

/**
 * コメント関連のバリデーションスキーマ
 */
export const commentCreateSchema = z.object({
    content: z
        .string()
        .min(1, "コメント内容は必須です")
        .max(1000, "コメントは1000文字以内で入力してください"),
    postId: z.string().min(1, "投稿IDは必須です"),
});

/**
 * チャット関連のバリデーションスキーマ
 */
export const chatCreateSchema = z.object({
    name: z
        .string()
        .max(100, "チャット名は100文字以内で入力してください")
        .optional()
        .nullable(),
    participantIds: z.array(z.string()).min(1, "参加者を少なくとも1人選択してください"),
});

export const messageCreateSchema = z.object({
    content: z
        .string()
        .min(1, "メッセージ内容は必須です")
        .max(5000, "メッセージは5000文字以内で入力してください"),
    chatId: z.string().min(1, "チャットIDは必須です"),
});

/**
 * ファイルアップロード関連のバリデーションスキーマ
 */
export const fileUploadSchema = z.object({
    filename: z
        .string()
        .min(1, "ファイル名は必須です")
        .max(255, "ファイル名は255文字以内で入力してください"),
    contentType: z.string().min(1, "コンテンツタイプは必須です"),
    size: z
        .number()
        .min(1, "ファイルサイズは1バイト以上である必要があります")
        .max(10 * 1024 * 1024, "ファイルサイズは10MB以下である必要があります"), // 10MB max
});

/**
 * 共通入力検証
 * HTMLサニタイズやXSS対策などのユーティリティ関数
 */

/**
 * HTMLタグを除去する
 */
export function sanitizeHtml(input: string): string {
    return input.replace(/<[^>]*>?/gm, "");
}

/**
 * 入力をサニタイズして安全な文字列を返す
 */
export function sanitizeInput(input: string): string {
    // HTMLタグを除去
    const withoutHtml = sanitizeHtml(input);
    // 特殊文字をエスケープ
    return withoutHtml
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * ファイル名を安全にする
 */
export function sanitizeFilename(filename: string): string {
    // ファイルシステムで問題となる文字を除去
    return filename.replace(/[/\\?%*:|"<>]/g, "_");
} 