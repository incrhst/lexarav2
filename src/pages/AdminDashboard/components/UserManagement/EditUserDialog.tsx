import React, { useState } from 'react';
import { User } from '../../types';
import Button from '../../../../components/Button';

interface Props {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateRole: (userId: string, role: User['role']) => Promise<void>;
}

export default function EditUserDialog({ user, isOpen, onClose, onUpdateRole }: Props) {
  const [role, setRole] = useState<User['role']>(user?.role || 'public');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onUpdateRole(user.id, role);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg max-w-lg w-full">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-primary">
            Edit User Role
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary">
              User
            </label>
            <div className="mt-1 text-sm text-primary-light">
              {user.full_name} ({user.email})
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as User['role'])}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            >
              <option value="public">Public</option>
              <option value="applicant">Applicant</option>
              <option value="processor">Processor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

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
              Update Role
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}