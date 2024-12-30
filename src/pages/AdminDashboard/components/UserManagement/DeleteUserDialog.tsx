import React, { useState } from 'react';
import { User } from '../../types';
import Button from '../../../../components/Button';

interface Props {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (userId: string) => Promise<void>;
}

export default function DeleteUserDialog({ user, isOpen, onClose, onDelete }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !user) return null;

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await onDelete(user.id);
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
            Delete User
          </h3>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-primary">
            Are you sure you want to delete the user <span className="font-medium">{user.full_name}</span>? 
            This action cannot be undone.
          </p>

          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              isLoading={isSubmitting}
            >
              Delete User
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}