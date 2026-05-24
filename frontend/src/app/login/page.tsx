'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Lock, AtSign, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';

interface LoginForm {
  identifier: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/profile');
    }
  }, [isAuthenticated, router]);

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError('');

    try {
      await login(data.identifier, data.password);
      router.push('/profile');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid email/phone or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-1 mb-2">
            <span className="text-3xl font-serif tracking-[-0.02em]">
              <span className="bg-gradient-to-b from-red-500 to-red-700 bg-clip-text text-transparent">H</span>
              <span className="bg-gradient-to-b from-red-500 to-red-700 bg-clip-text text-transparent">&</span>
              <span className="bg-gradient-to-b from-green-600 to-green-800 bg-clip-text text-transparent">B</span>
            </span>
            <span className="text-base font-serif text-secondary/70 tracking-[0.15em] font-medium">TRADE</span>
          </div>
          <CardTitle>Login to Your Account</CardTitle>
          <p className="text-gray-600 text-sm">Access your orders, requests, and tracking</p>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email or Phone Number
              </label>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  type="text"
                  inputMode="email"
                  autoComplete="username"
                  {...register('identifier', {
                    required: 'Email or phone number is required',
                  })}
                  placeholder="your@email.com  or  +880 1XXX-XXXXXX"
                  className="pl-10"
                />
              </div>
              {errors.identifier && (
                <p className="text-red-500 text-sm mt-1">{errors.identifier.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  type="password"
                  {...register('password', { required: 'Password is required' })}
                  placeholder="Enter your password"
                  className="pl-10"
                />
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 animate-spin" size={20} />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-primary font-bold hover:underline text-base">
                Create Account
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
