import { User, Post, Comment, Chat, Message, File } from "@prisma/client";
import { UserDTO, PostDTO, CommentDTO, ChatDTO, MessageDTO, FileDTO } from "@/types/dto";

/**
 * データベースモデルからDTOへの変換ユーティリティ
 * サーバーからクライアントに送信する前にデータを安全に変換
 */

/**
 * ユーザーデータをDTOに変換
 */
export function toUserDTO(user: User): UserDTO {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        bio: user.bio,
        role: user.role,
        createdAt: user.createdAt,
        // パスワードハッシュなどの機密情報は除外
    };
}

/**
 * 投稿データをDTOに変換
 */
type PostWithAuthorAndComments = Post & {
    user: User;
    _count?: { comments: number };
};

export function toPostDTO(post: PostWithAuthorAndComments): PostDTO {
    return {
        id: post.id,
        title: post.title,
        content: post.content,
        published: post.published,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        author: {
            id: post.user.id,
            name: post.user.name,
            image: post.user.image,
        },
        commentCount: post._count?.comments ?? 0,
    };
}

/**
 * コメントデータをDTOに変換
 */
type CommentWithAuthor = Comment & {
    user: User;
};

export function toCommentDTO(comment: CommentWithAuthor): CommentDTO {
    return {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        author: {
            id: comment.user.id,
            name: comment.user.name,
            image: comment.user.image,
        },
    };
}

/**
 * チャットデータをDTOに変換
 */
type ChatWithParticipants = Chat & {
    participants: {
        user: User;
    }[];
    messages?: Message[];
};

export function toChatDTO(chat: ChatWithParticipants): ChatDTO {
    // 最新のメッセージを取得
    const lastMessage = chat.messages && chat.messages.length > 0
        ? chat.messages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0]
        : undefined;

    return {
        id: chat.id,
        name: chat.name,
        createdAt: chat.createdAt,
        participants: chat.participants.map(p => ({
            id: p.user.id,
            name: p.user.name,
            image: p.user.image,
        })),
        lastMessage: lastMessage ? {
            content: lastMessage.content,
            createdAt: lastMessage.createdAt,
        } : undefined,
    };
}

/**
 * メッセージデータをDTOに変換
 */
export function toMessageDTO(message: Message): MessageDTO {
    return {
        id: message.id,
        content: message.content,
        createdAt: message.createdAt,
        userId: message.userId,
    };
}

/**
 * ファイルデータをDTOに変換
 */
export function toFileDTO(file: File): FileDTO {
    return {
        id: file.id,
        name: file.name,
        size: file.size,
        url: file.url,
        contentType: file.contentType,
        createdAt: file.createdAt,
    };
}

/**
 * 複数のデータをDTOに変換
 */
export function toUserDTOs(users: User[]): UserDTO[] {
    return users.map(toUserDTO);
}

export function toPostDTOs(posts: PostWithAuthorAndComments[]): PostDTO[] {
    return posts.map(toPostDTO);
}

export function toCommentDTOs(comments: CommentWithAuthor[]): CommentDTO[] {
    return comments.map(toCommentDTO);
}

export function toChatDTOs(chats: ChatWithParticipants[]): ChatDTO[] {
    return chats.map(toChatDTO);
}

export function toMessageDTOs(messages: Message[]): MessageDTO[] {
    return messages.map(toMessageDTO);
}

export function toFileDTOs(files: File[]): FileDTO[] {
    return files.map(toFileDTO);
} 