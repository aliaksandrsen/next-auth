'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { passwordReset } from './action';

const formSchema = z.object({
  email: z.string().email(),
});

export default function PasswordReset() {
  const searchParams = useSearchParams();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: decodeURIComponent(searchParams.get('email') || ''),
    },
  });

  const handleSubmit = async (data: { email: string }) => {
    await passwordReset(data.email);
  };

  return (
    <main className="flex justify-center items-center min-h-screen">
      {form.formState.isSubmitSuccessful ? (
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Email Sent</CardTitle>
          </CardHeader>
          <CardContent>
            If you have an accaunt with us you will receive a password reset
            email at {form.getValues('email')}.
          </CardContent>
        </Card>
      ) : (
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Password Reset</CardTitle>
            <CardDescription>
              Enter your email address to reset your password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)}>
                <fieldset
                  disabled={form.formState.isSubmitting}
                  className="flex flex-col gap-2"
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {!!form.formState.errors.root?.message && (
                    <FormMessage>
                      {form.formState.errors.root.message}
                    </FormMessage>
                  )}
                  <Button type="submit" className="w-full">
                    Submit
                  </Button>
                </fieldset>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <div className="text-sm text-muted-foreground">
              Remember your password?{' '}
              <Link className="underline" href="/login">
                Login
              </Link>
            </div>
            <div className="text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link className="underline" href="/register">
                Register
              </Link>
            </div>
          </CardFooter>
        </Card>
      )}
    </main>
  );
}
