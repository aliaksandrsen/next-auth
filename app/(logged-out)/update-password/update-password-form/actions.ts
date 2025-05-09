'use server';

import { auth } from '@/auth';
import { db } from '@/db/drizzle';
import { eq } from 'drizzle-orm';
import { passwordResetTokens } from '@/db/passwordResetTokensSchema';
import { passwordMatchSchema } from '@/validation/passwordMatchSchema';
import { hash } from 'bcryptjs';
import { users } from '@/db/usersSchema';

export const updatePassword = async ({
  token,
  password,
  passwordConfirm,
}: {
  token: string;
  password: string;
  passwordConfirm: string;
}) => {
  const passwordValidation = passwordMatchSchema.safeParse({
    password,
    passwordConfirm,
  });

  if (!passwordValidation.success) {
    return {
      error: passwordValidation.error.issues[0].message ?? 'An error occurred',
    };
  }

  const session = await auth();

  if (session?.user?.id) {
    return {
      error: 'Already logged in. Please log out to update your password.',
    };
  }

  let tokenIsValid = false;

  if (token) {
    const [passwordResetToken] = await db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.token, token));

    const now = new Date().getTime();
    if (
      !!passwordResetToken?.token &&
      now < passwordResetToken.tokenExpiry!.getTime()
    ) {
      tokenIsValid = true;
    }

    if (!tokenIsValid) {
      return {
        error: 'Your token is invalid or has expired.',
        tokenInvalid: true,
      };
    }

    const hashedPassword = await hash(password, 10);

    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, passwordResetToken.userId!));

    await db
      .delete(passwordResetTokens)
      .where(eq(passwordResetTokens.id, passwordResetToken.id));
  }
};
