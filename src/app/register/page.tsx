'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const mutation = useMutation({
    mutationFn: async () => {
      await register(formData.name, formData.email, formData.password);
    },
    onSuccess: () => {
      toast.success('Account created successfully! Please login to continue.');
      router.push('/login');
    },
    onError: (err: unknown) => {
      const errorMessage =
        err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      toast.error(errorMessage);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      const errorMessage = 'Passwords do not match';
      setError(errorMessage);
      toast.error(errorMessage);
      return;
    }

    if (formData.password.length < 6) {
      const errorMessage = 'Password must be at least 6 characters';
      setError(errorMessage);
      toast.error(errorMessage);
      return;
    }

    mutation.mutate();
  };

  return (
    <div className='min-h-screen bg-white flex items-center justify-center px-4'>
      <Card className='w-full max-w-md border-0 shadow-none'>
        <CardHeader className='text-left space-y-4'>
          {/* Logo */}
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 relative'>
              <div className='w-full h-full bg-[url(/images/booky-logo.svg)] bg-[length:100%_100%] bg-no-repeat' />
            </div>
            <span className='text-3xl font-bold text-[#0a0d12] font-quicksand'>
              Booky
            </span>
          </div>

          <div className='space-y-2'>
            <CardTitle className='text-2xl font-bold text-[#0a0d12] font-quicksand'>
              Register
            </CardTitle>
            <CardDescription className='text-gray-500 font-quicksand'>
              Create your account to start borrowing books.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className='space-y-6'>
          {error && (
            <div className='p-3 bg-red-50 border border-red-200 rounded-lg'>
              <p className='text-red-600 text-sm font-quicksand'>{error}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className='space-y-4'>
            {/* Name Field */}
            <div className='space-y-2'>
              <Label
                htmlFor='name'
                className='text-sm font-medium text-[#0a0d12] font-quicksand'
              >
                Name
              </Label>
              <Input
                id='name'
                name='name'
                type='text'
                placeholder='Enter your full name'
                value={formData.name}
                onChange={handleChange}
                required
                className='w-full h-12 px-4 border-0 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-quicksand bg-gray-50'
              />
            </div>

            {/* Email Field */}
            <div className='space-y-2'>
              <Label
                htmlFor='email'
                className='text-sm font-medium text-[#0a0d12] font-quicksand'
              >
                Email
              </Label>
              <Input
                id='email'
                name='email'
                type='email'
                placeholder='Enter your email'
                value={formData.email}
                onChange={handleChange}
                required
                className='w-full h-12 px-4 border-0 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-quicksand bg-gray-50'
              />
            </div>

            {/* Phone Number Field */}
            <div className='space-y-2'>
              <Label
                htmlFor='phone'
                className='text-sm font-medium text-[#0a0d12] font-quicksand'
              >
                Nomor Handphone
              </Label>
              <Input
                id='phone'
                name='phone'
                type='tel'
                placeholder='Enter your phone number'
                value={formData.phone}
                onChange={handleChange}
                className='w-full h-12 px-4 border-0 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-quicksand bg-gray-50'
              />
            </div>

            {/* Password Field */}
            <div className='space-y-2'>
              <Label
                htmlFor='password'
                className='text-sm font-medium text-[#0a0d12] font-quicksand'
              >
                Password
              </Label>
              <div className='relative'>
                <Input
                  id='password'
                  name='password'
                  type={showPassword ? 'text' : 'password'}
                  placeholder='Enter your password'
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className='w-full h-12 px-4 pr-12 border-0 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-quicksand bg-gray-50'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700'
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className='space-y-2'>
              <Label
                htmlFor='confirmPassword'
                className='text-sm font-medium text-[#0a0d12] font-quicksand'
              >
                Confirm Password
              </Label>
              <div className='relative'>
                <Input
                  id='confirmPassword'
                  name='confirmPassword'
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder='Confirm your password'
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className='w-full h-12 px-4 pr-12 border-0 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-quicksand bg-gray-50'
                />
                <button
                  type='button'
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700'
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type='submit'
              disabled={mutation.isPending}
              className='w-full h-12 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold rounded-[100px] font-quicksand transition-colors disabled:opacity-50'
            >
              {mutation.isPending ? 'Creating Account...' : 'Submit'}
            </Button>
          </form>

          {/* Login Link */}
          <div className='text-center'>
            <span className='text-gray-600 font-quicksand'>
              Already have an account?{' '}
            </span>
            <Link
              href='/login'
              className='text-[#3b82f6] hover:text-[#2563eb] font-medium font-quicksand'
            >
              Log In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
