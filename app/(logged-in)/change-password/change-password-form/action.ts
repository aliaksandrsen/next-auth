'use server';

import { auth } from '@/auth';
import { db } from '@/db/drizzle';
import { users } from '@/db/usersSchema';
import { passwordMatchSchema } from '@/validation/passwordMatchSchema';
import { passwordSchema } from '@/validation/passwordSchema';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { compare, hash } from 'bcryptjs';

export const changePassword = async ({
  currentPassword,
  password,
  passwordConfirm,
}: {
  currentPassword: string;
  password: string;
  passwordConfirm: string;
}) => {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      error: 'You must be logged in to change your password.',
    };
  }

  const formSchema = z
    .object({
      currentPassword: passwordSchema,
    })
    .and(passwordMatchSchema);

  const passwordValidation = formSchema.safeParse({
    currentPassword,
    password,
    passwordConfirm,
  });

  if (passwordValidation.error) {
    return {
      error: passwordValidation.error.issues[0]?.message ?? 'An error occurred',
    };
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, parseInt(session.user.id)));

  if (!user) {
    return {
      error: 'User not found',
    };
  }

  const passwordMatch = await compare(currentPassword, user.password);

  if (!passwordMatch) {
    return {
      error: 'Current password is incorrect.',
    };
  }
  const hashedPassword = await hash(password, 10);

  await db
    .update(users)
    .set({ password: hashedPassword })
    .where(eq(users.id, parseInt(session.user.id)));
};
