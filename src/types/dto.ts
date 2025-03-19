// Data Transfer Object（DTO）の型定義
// クライアントコンポーネントに安全に渡すためのデータ構造

// ユーザー情報のDTO
export type UserDTO = {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    // パスワードハッシュやトークンなどの機密情報は含めない
};

// チャット情報のDTO
export type ChatDTO = {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    // ユーザーIDなど機密性の高い情報は含めない
};

// メッセージのDTO
export type MessageDTO = {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    createdAt: string;
    // チャットIDなど機密性の高い情報は含めない
}; 