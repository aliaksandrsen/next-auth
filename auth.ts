import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { db } from './db/drizzle';
import { users } from './db/usersSchema';
import { eq } from 'drizzle-orm';
import { compare } from 'bcryptjs';
import { authenticator } from 'otplib';

export const { handlers, signIn, signOut, auth } = NextAuth({
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      return session;
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
        token: {},
      },
      authorize: async (credentials) => {
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials?.email as string));

        if (!user) {
          throw new Error('Incorrect credentials');
        } else {
          const passwordCorrect = await compare(
            credentials?.password as string,
            user.password
          );

          if (!passwordCorrect) {
            throw new Error('Incorrect credentials');
          }

          if (user.twoFactorAuthActivated) {
            const tokenValid = authenticator.check(
              credentials?.token as string,
              user.twoFactorAuthSecret as string
            );
            if (!tokenValid) {
              throw new Error('Incorrect OTP');
            }
          }
        }

        return {
          id: user.id.toString(),
          email: user.email,
        };
      },
    }),
  ],
});
