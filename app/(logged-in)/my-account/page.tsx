import { auth } from '@/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@radix-ui/react-label';
import TwoFactorAuthForm from './two-factor-auth-form';
import { db } from '@/db/drizzle';
import { users } from '@/db/usersSchema';
import { eq } from 'drizzle-orm';

export default async function MyAccountPage() {
  const session = await auth();

  const [user] = await db
    .select({
      twoFactorActivated: users.twoFactorAuthActivated,
    })
    .from(users)
    .where(eq(users.id, parseInt(session?.user?.id as string)));

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>My Account</CardTitle>
      </CardHeader>
      <CardContent>
        <Label>Email Address</Label>
        <div className="text-muted-foreground">{session?.user?.email}</div>
        <TwoFactorAuthForm
          twoFactorActivated={user?.twoFactorActivated ?? false}
        />
      </CardContent>
    </Card>
  );
}
