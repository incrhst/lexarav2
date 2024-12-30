import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { register as registerUser } from '../../../lib/auth';
import Button from '../../../components/Button';
import FormField from '../../../components/FormField';
import { useToast } from '../../../contexts/ToastContext';

const registerSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface Props {
  onSuccess: () => void;
}

export default function RegisterForm({ onSuccess }: Props) {
  const { showToast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser(data);
      onSuccess();
    } catch (error) {
      if (error instanceof Error) {
        showToast(error.message, 'error');
      } else {
        showToast('An unexpected error occurred', 'error');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormField
        label="Full Name"
        error={errors.fullName?.message}
      >
        <input
          type="text"
          {...register('fullName')}
          className="mt-1 block w-full h-12 px-4 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-base"
          placeholder="Enter your full name"
        />
      </FormField>

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
          placeholder="Choose a password"
        />
      </FormField>

      <Button
        type="submit"
        isLoading={isSubmitting}
        className="w-full"
      >
        Create account
      </Button>
    </form>
  );
}