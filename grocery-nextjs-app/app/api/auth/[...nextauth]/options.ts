import { DefaultSession, getServerSession, NextAuthOptions } from "next-auth";
import Auth0Provider from "next-auth/providers/auth0";
import GithubProvider from "next-auth/providers/github";

declare module 'next-auth' {
    interface Session extends DefaultSession {
        accessToken?: string;
        user: {
            id: string;
            name: string;
            email: string;
            image?: string;
        } & DefaultSession['user'];
    }
    
    interface User {
        id: string;
        name: string;
        email: string;
        image?: string;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        accessToken?: string;
        id: string;
    }
}

export const options: NextAuthOptions = {
    providers: [
        Auth0Provider({
            clientId: process.env.AUTH0_CLIENT_ID as string,
            clientSecret: process.env.AUTH0_CLIENT_SECRET as string,
            issuer: process.env.AUTH0_ISSUER as string,
        }),
        GithubProvider({
            clientId: process.env.GITHUB_ID as string,
            clientSecret: process.env.GITHUB_SECRET as string,
            authorization: {
                params: {
                    scope: 'read:user,user:email',
                },
            },
        })
    ],
    callbacks: {
        async jwt({ token, user, account }) {
            // Initial sign in
            if (account && user) {
                token.accessToken = account.access_token;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                console.log('Setting session accessToken:', token.accessToken);
                session.accessToken = token.accessToken;
                session.user.id = token.sub || token.id;
            }
            return session;
        },
    },
    debug: process.env.NODE_ENV === 'development',
    secret: process.env.NEXTAUTH_SECRET,
}

// Helper function to get the current session
export async function getCurrentUser() {
    const session = await getServerSession(options);
    return session?.user || null;
}