import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/db/drizzle';
import { passwordResetTokens } from '@/db/passwordResetTokensSchema';
import { eq } from 'drizzle-orm';
import Link from 'next/link';

export default async function UpdatePassword({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  let tokenIsValid = false;

  const { token } = searchParams;
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
  }

  return (
    <main className="flex justify-center items-center min-h-screen">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>
            {tokenIsValid
              ? 'Update Password'
              : 'Your password reset link is invalid or has expired'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tokenIsValid ? (
            <div>Update password form</div>
          ) : (
            <Link className="underline" href="/password-reset">
              Request another password reset link
            </Link>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
