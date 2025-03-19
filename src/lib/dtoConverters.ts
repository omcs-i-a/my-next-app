import { User, Chat, Message } from '@prisma/client';
import { UserDTO, ChatDTO, MessageDTO } from '@/types/dto';

/**
 * Prismaのユーザーモデルから安全なDTOに変換する
 * 機密情報を除外して必要な情報のみを返す
 */
export function toUserDTO(user: User): UserDTO {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        // パスワードやその他の機密情報は除外
    };
}

/**
 * Prismaのチャットモデルから安全なDTOに変換する
 */
export function toChatDTO(chat: Chat): ChatDTO {
    return {
        id: chat.id,
        title: chat.title,
        createdAt: chat.createdAt.toISOString(),
        updatedAt: chat.updatedAt.toISOString(),
        // ユーザーIDなどの機密情報は除外
    };
}

/**
 * チャットリストをDTOの配列に変換する
 */
export function toChatsDTO(chats: Chat[]): ChatDTO[] {
    return chats.map(chat => toChatDTO(chat));
}

/**
 * Prismaのメッセージモデルから安全なDTOに変換する
 */
export function toMessageDTO(message: Message): MessageDTO {
    return {
        id: message.id,
        role: message.role as 'user' | 'assistant' | 'system',
        content: message.content,
        createdAt: message.createdAt.toISOString(),
        // チャットIDなどの機密情報は除外
    };
}

/**
 * メッセージリストをDTOの配列に変換する
 */
export function toMessagesDTO(messages: Message[]): MessageDTO[] {
    return messages.map(message => toMessageDTO(message));
} 