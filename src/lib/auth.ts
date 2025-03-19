import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcrypt";
import { db } from "@/lib/db";

/**
 * NextAuth設定オプション
 * セキュリティに配慮した認証設定
 */
export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(db),
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30日間
    },
    pages: {
        signIn: "/login",
        error: "/error",
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }),
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "メールアドレス", type: "email" },
                password: { label: "パスワード", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const user = await db.user.findUnique({
                    where: { email: credentials.email },
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        image: true,
                        password: true,
                        role: true,
                    },
                });

                if (!user || !user.password) {
                    return null;
                }

                const passwordMatch = await compare(credentials.password, user.password);

                if (!passwordMatch) {
                    return null;
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                    role: user.role,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            // ユーザー情報をJWTに追加
            if (user) {
                token.id = user.id;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            // JWTからセッションにユーザー情報を追加
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
            }
            return session;
        },
    },
};

/**
 * セッションからユーザーIDを取得（型安全）
 */
export function getUserId(session: any): string | null {
    return session?.user?.id || null;
}

/**
 * セッションからユーザーロールを取得（型安全）
 */
export function getUserRole(session: any): string | null {
    return session?.user?.role || null;
}

/**
 * 管理者かどうかをチェック
 */
export function isAdmin(session: any): boolean {
    return getUserRole(session) === "admin";
}

/**
 * セッションが有効かどうかをチェック
 */
export function isAuthenticated(session: any): boolean {
    return !!getUserId(session);
} 