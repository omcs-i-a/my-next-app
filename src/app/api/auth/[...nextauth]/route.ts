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

const prisma = new PrismaClient();

// パスワードハッシュを含むユーザータイプを定義
type UserWithPassword = {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    passwordHash: string | null;
};

const options: NextAuthOptions = {
    adapter: PrismaAdapter(prisma) as any,
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
        strategy: 'jwt' as const
    },
    callbacks: {
        async jwt({ token, user }: { token: JWT; user: any }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }: { session: Session; token: JWT }) {
            if (session.user && token) {
                session.user.id = token.id as string;
            }
            return session;
        }
    },
    pages: {
        signIn: '/auth/signin',
        signOut: '/auth/signout',
        newUser: '/auth/signup'
    },
    debug: process.env.NODE_ENV === 'development'
};

const handler = NextAuth(options);

export { handler as GET, handler as POST };