import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from '../../../../components/Button';
import FormField from '../../../../components/FormField';
import { User } from '../../types';

const addUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  fullName: z.string().min(1, 'Full name is required'),
  role: z.enum(['admin', 'processor', 'user', 'public']),
  companyName: z.string().optional(),
});

type AddUserFormData = z.infer<typeof addUserSchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: AddUserFormData) => Promise<void>;
}

export default function AddUserDialog({ isOpen, onClose, onAdd }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<AddUserFormData>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      role: 'user',
    },
  });

  if (!isOpen) return null;

  const onSubmit = async (data: AddUserFormData) => {
    try {
      await onAdd(data);
      reset();
      onClose();
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg max-w-lg w-full">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-primary">Add New User</h3>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <FormField
            label="Email"
            error={errors.email?.message}
          >
            <input
              type="email"
              {...register('email')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />
          </FormField>

          <FormField
            label="Full Name"
            error={errors.fullName?.message}
          >
            <input
              type="text"
              {...register('fullName')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />
          </FormField>

          <FormField
            label="Role"
            error={errors.role?.message}
          >
            <select
              {...register('role')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            >
              <option value="user">User</option>
              <option value="processor">Processor</option>
              <option value="admin">Admin</option>
            </select>
          </FormField>

          <FormField
            label="Company Name"
            optional
            error={errors.companyName?.message}
          >
            <input
              type="text"
              {...register('companyName')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />
          </FormField>

          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={onClose}
              type="button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
            >
              Add User
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}