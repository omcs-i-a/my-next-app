import NextAuth from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import { compare } from 'bcrypt';
import { JWT } from 'next-auth/jwt';
import { Session } from 'next-auth';
import { NextAuthOptions } from 'next-auth';

// 環境変数に基づいてデバッグモードを設定
const isDevelopment = process.env.NODE_ENV === 'development';

// デバッグログ用のユーティリティ関数
const debugLog = (message: string, data?: any) => {
    if (isDevelopment) {
        console.log(message, data);
    }
};

const errorLog = (message: string, error?: any) => {
    // エラーログは本番環境でも出力（機密情報は除く）
    if (isDevelopment) {
        console.error(message, error);
    } else {
        console.error(message);
    }
};

// Prismaクライアントの初期化
const prisma = new PrismaClient({
    log: isDevelopment ? ['query', 'info', 'warn', 'error'] : ['error'],
});

// データベース接続テスト（開発環境のみ）
if (isDevelopment) {
    async function testConnection() {
        try {
            await prisma.$connect();
            debugLog('Database connection successful');
            const userCount = await prisma.user.count();
            debugLog(`Current user count: ${userCount}`);
        } catch (error) {
            errorLog('Database connection failed:', error);
        }
    }
    testConnection();
}

// パスワードハッシュを含むユーザータイプを定義
type UserWithPassword = {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    passwordHash: string | null;
};

// Prismaアダプターをラップしてデバッグログを追加
const debugPrismaAdapter = {
    ...PrismaAdapter(prisma),
    createUser: async (data: any) => {
        debugLog('DEBUG_ADAPTER_CREATE_USER_START', { data });
        try {
            const result = await (PrismaAdapter(prisma) as any).createUser(data);
            debugLog('DEBUG_ADAPTER_CREATE_USER_SUCCESS', { result });
            return result;
        } catch (error) {
            errorLog('DEBUG_ADAPTER_CREATE_USER_ERROR', error);
            throw error;
        }
    },
    linkAccount: async (data: any) => {
        debugLog('DEBUG_ADAPTER_LINK_ACCOUNT_START', { data });
        try {
            const result = await (PrismaAdapter(prisma) as any).linkAccount(data);
            debugLog('DEBUG_ADAPTER_LINK_ACCOUNT_SUCCESS', { result });
            return result;
        } catch (error) {
            errorLog('DEBUG_ADAPTER_LINK_ACCOUNT_ERROR', error);
            throw error;
        }
    },
    getUserByEmail: async (email: string) => {
        debugLog('DEBUG_ADAPTER_GET_USER_BY_EMAIL_START', { email });
        try {
            const result = await (PrismaAdapter(prisma) as any).getUserByEmail(email);
            debugLog('DEBUG_ADAPTER_GET_USER_BY_EMAIL_RESULT', { result });
            return result;
        } catch (error) {
            errorLog('DEBUG_ADAPTER_GET_USER_BY_EMAIL_ERROR', error);
            throw error;
        }
    },
    getUserByAccount: async (data: any) => {
        debugLog('DEBUG_ADAPTER_GET_USER_BY_ACCOUNT_START', { data });
        try {
            const result = await (PrismaAdapter(prisma) as any).getUserByAccount(data);
            debugLog('DEBUG_ADAPTER_GET_USER_BY_ACCOUNT_RESULT', { result });
            return result;
        } catch (error) {
            errorLog('DEBUG_ADAPTER_GET_USER_BY_ACCOUNT_ERROR', error);
            throw error;
        }
    }
} as any;

const options: NextAuthOptions = {
    adapter: debugPrismaAdapter,
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_ID || "",
            clientSecret: process.env.GITHUB_SECRET || "",
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        CredentialsProvider({
            name: 'メールアドレス',
            credentials: {
                email: { label: 'メールアドレス', type: 'email' },
                password: { label: 'パスワード', type: 'password' }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email
                    }
                }) as unknown as UserWithPassword;

                if (!user || !user.passwordHash) {
                    return null;
                }

                const isPasswordValid = await compare(credentials.password, user.passwordHash);

                if (!isPasswordValid) {
                    return null;
                }

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    image: user.image
                };
            }
        })
    ],
    session: {
        strategy: 'jwt' as const,
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            debugLog('SIGNIN_CALLBACK', { user, account, profile });
            if (account?.provider === 'google' || account?.provider === 'github') {
                try {
                    // 既存のユーザーを検索
                    const existingUser = await prisma.user.findUnique({
                        where: { email: user.email! },
                        include: { accounts: true }
                    });

                    if (existingUser) {
                        // 既存のユーザーにプロバイダーアカウントをリンク
                        if (!existingUser.accounts.some(acc => acc.provider === account.provider)) {
                            await prisma.account.create({
                                data: {
                                    userId: existingUser.id,
                                    type: account.type,
                                    provider: account.provider,
                                    providerAccountId: account.providerAccountId,
                                    access_token: account.access_token,
                                    token_type: account.token_type,
                                    scope: account.scope,
                                    id_token: account.id_token,
                                    expires_at: account.expires_at
                                }
                            });
                            debugLog(`Linked ${account.provider} account to existing user`);
                        }
                        return true;
                    }
                } catch (error) {
                    errorLog('Error in signIn callback:', error);
                    return false;
                }
            }
            return true;
        },
        async jwt({ token, user, account, profile }) {
            debugLog('JWT_CALLBACK', { token, user, account, profile });
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            debugLog('SESSION_CALLBACK', { session, token });
            if (session.user) {
                session.user.id = token.id as string;
            }
            return session;
        },
        async redirect({ url, baseUrl }) {
            debugLog('REDIRECT_CALLBACK', { url, baseUrl });
            if (url.startsWith('/auth/signin')) {
                return baseUrl;
            }
            if (url.startsWith(baseUrl)) return url;
            if (url.startsWith('/')) return `${baseUrl}${url}`;
            return baseUrl;
        }
    },
    events: {
        async signIn(message) { debugLog('EVENT_SIGNIN', message) },
        async signOut(message) { debugLog('EVENT_SIGNOUT', message) },
        async createUser(message) { debugLog('EVENT_CREATE_USER', message) },
        async linkAccount(message) { debugLog('EVENT_LINK_ACCOUNT', message) },
        async session(message) { debugLog('EVENT_SESSION', message) }
    },
    pages: {
        signIn: '/auth/signin',
        signOut: '/auth/signout',
        error: '/auth/error',
        newUser: '/auth/signup'
    },
    debug: isDevelopment,
    logger: {
        error: (code, ...message) => errorLog(code, ...message),
        warn: (code, ...message) => isDevelopment && console.warn(code, ...message),
        debug: (code, ...message) => debugLog(code, ...message),
    },
};

const handler = NextAuth(options);

export { handler as GET, handler as POST };