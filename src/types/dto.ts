/**
 * Data Transfer Objects (DTOs)
 * サーバーからクライアントに安全に渡すためのデータ構造を定義
 */

// ユーザー情報DTO
export type UserDTO = {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    bio: string | null;
    role: string;
    createdAt: Date;
};

// 投稿DTO
export type PostDTO = {
    id: string;
    title: string;
    content: string;
    published: boolean;
    createdAt: Date;
    updatedAt: Date;
    author: {
        id: string;
        name: string | null;
        image: string | null;
    };
    commentCount: number;
};

// コメントDTO
export type CommentDTO = {
    id: string;
    content: string;
    createdAt: Date;
    author: {
        id: string;
        name: string | null;
        image: string | null;
    };
};

// チャットDTO
export type ChatDTO = {
    id: string;
    name: string | null;
    createdAt: Date;
    participants: {
        id: string;
        name: string | null;
        image: string | null;
    }[];
    lastMessage?: {
        content: string;
        createdAt: Date;
    };
};

// メッセージDTO
export type MessageDTO = {
    id: string;
    content: string;
    createdAt: Date;
    userId: string;
};

// ファイルDTO
export type FileDTO = {
    id: string;
    name: string;
    size: number;
    url: string;
    contentType: string;
    createdAt: Date;
};

// API共通レスポンス型
export type ApiResponse<T = any> = {
    success: boolean;
    data?: T;
    error?: string;
    validationErrors?: Record<string, string[]>;
};

// ページネーション型
export type PaginatedResponse<T> = {
    items: T[];
    totalCount: number;
    pageCount: number;
    currentPage: number;
}; 