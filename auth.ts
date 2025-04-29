import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { db } from './db/drizzle';
import { users } from './db/usersSchema';
import { eq } from 'drizzle-orm';
import { compare } from 'bcryptjs';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials?.email as string));

        console.log(' authorize: user:', user);

        if (!user) {
          throw new Error('Iccorrect credentials');
        } else {
          const passwordCorrect = await compare(
            credentials?.password as string,
            user.password
          );
          if (!passwordCorrect) {
            throw new Error('Incorrect credentials');
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
