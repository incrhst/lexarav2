import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from './Button';
import FormField from './FormField';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface Props {
  onSubmit: (data: LoginFormData) => Promise<void>;
  error?: string;
  isLoading?: boolean;
}

export default function LoginForm({ onSubmit, error, isLoading }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      <FormField
        label="Email"
        error={errors.email?.message}
      >
        <input
          type="email"
          {...register('email')}
          className="mt-1 block w-full h-12 px-4 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-base"
          placeholder="Enter your email"
        />
      </FormField>

      <FormField
        label="Password"
        error={errors.password?.message}
      >
        <input
          type="password"
          {...register('password')}
          className="mt-1 block w-full h-12 px-4 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-base"
          placeholder="Enter your password"
        />
      </FormField>

      <Button
        type="submit"
        isLoading={isLoading}
        className="w-full"
      >
        Sign in
      </Button>
    </form>
  );
}