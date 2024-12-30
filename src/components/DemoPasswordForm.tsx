import React, { useState } from 'react';
import { useDemoPassword } from '../hooks/useDemoPassword';
import Button from './Button';

interface Props {
  onClose: () => void;
}

export default function DemoPasswordForm({ onClose }: Props) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { updateDemoPassword, loading } = useDemoPassword();
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await updateDemoPassword(password);
      onClose();
    } catch (err) {
      setError('Failed to update demo password');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-primary">
          New Demo Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          minLength={8}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-primary">
          Confirm Password
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          minLength={8}
          required
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

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
          isLoading={loading}
        >
          Update Password
        </Button>
      </div>
    </form>
  );
}