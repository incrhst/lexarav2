import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from '../../../components/Button';
import FormField from '../../../components/FormField';

const addClientSchema = z.object({
  client_name: z.string().min(1, 'Client name is required'),
  company_name: z.string().min(1, 'Company name is required'),
  contact_email: z.string().email('Invalid email').optional(),
  contact_phone: z.string().optional(),
  address: z.string().optional(),
  country: z.string().min(1, 'Country is required'),
});

type AddClientFormData = z.infer<typeof addClientSchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: AddClientFormData) => Promise<void>;
}

export default function AddClientDialog({ isOpen, onClose, onAdd }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<AddClientFormData>({
    resolver: zodResolver(addClientSchema),
  });

  if (!isOpen) return null;

  const onSubmit = async (data: AddClientFormData) => {
    try {
      await onAdd(data);
      reset();
      onClose();
    } catch (error) {
      console.error('Error adding client:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg max-w-lg w-full">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-primary">Add New Client</h3>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <FormField
            label="Client Name"
            error={errors.client_name?.message}
          >
            <input
              type="text"
              {...register('client_name')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />
          </FormField>

          <FormField
            label="Company Name"
            error={errors.company_name?.message}
          >
            <input
              type="text"
              {...register('company_name')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              label="Email"
              optional
              error={errors.contact_email?.message}
            >
              <input
                type="email"
                {...register('contact_email')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              />
            </FormField>

            <FormField
              label="Phone"
              optional
              error={errors.contact_phone?.message}
            >
              <input
                type="tel"
                {...register('contact_phone')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              />
            </FormField>
          </div>

          <FormField
            label="Address"
            optional
            error={errors.address?.message}
          >
            <textarea
              {...register('address')}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />
          </FormField>

          <FormField
            label="Country"
            error={errors.country?.message}
          >
            <select
              {...register('country')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            >
              <option value="">Select a country</option>
              <option value="US">United States</option>
              <option value="GB">United Kingdom</option>
              <option value="CA">Canada</option>
              {/* Add more countries as needed */}
            </select>
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
              Add Client
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}