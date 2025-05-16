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
import { passwordSchema } from '@/validation/passwordSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { loginWithCredentials, preLoginCheck } from './action';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { toast } from 'sonner';

const formSchema = z.object({
  email: z.string().email(),
  password: passwordSchema,
});

export default function Login() {
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('');
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    const preLoginCheckResponse = await preLoginCheck({
      email: data.email,
      password: data.password,
    });

    if (preLoginCheckResponse?.error) {
      form.setError('root', {
        message: preLoginCheckResponse.error,
      });
      return;
    }

    if (preLoginCheckResponse?.twoFactorAuthActivated === true) {
      setStep(2);
      // Handle two-factor authentication
    } else {
      const response = await loginWithCredentials({
        email: data.email,
        password: data.password,
      });

      if (response?.error) {
        form.setError('root', {
          message: response.error,
        });
        return;
      } else {
        router.push('/my-account');
      }
    }
  };

  const email = form.watch('email');

  const handleOTPSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const response = await loginWithCredentials({
      email: form.getValues('email'),
      password: form.getValues('password'),
      token: otp,
    });

    if (response?.error) {
      toast.error(response.error);
    } else {
      router.push('/my-account');
    }
  };

  return (
    <main className="flex justify-center items-center min-h-screen">
      {step === 1 && (
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>Login to your account.</CardDescription>
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
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" />
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
                    Login
                  </Button>
                </fieldset>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <div className="text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="underline">
                Register
              </Link>
            </div>
            <div className="text-sm text-muted-foreground">
              Forgot password?{' '}
              <Link
                href={`/password-reset${
                  email ? `?email=${encodeURIComponent(email)}` : ''
                }`}
                className="underline"
              >
                Reset my password
              </Link>
            </div>
          </CardFooter>
        </Card>
      )}
      {step === 2 && (
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>One-Time Passcode</CardTitle>
            <CardDescription>Enter one-time passcode.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-2" onSubmit={handleOTPSubmit}>
              <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              <Button disabled={otp.length !== 6} type="submit">
                Submit
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
