import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import DemoModeToggle from '../../../../components/DemoModeToggle';
import DemoPasswordForm from '../../../../components/DemoPasswordForm';

export default function Settings() {
  const [isPasswordFormOpen, setIsPasswordFormOpen] = React.useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Settings</h1>
          <p className="mt-1 text-sm text-primary-light">
            Manage system configuration and preferences
          </p>
        </div>
        <SettingsIcon className="h-8 w-8 text-primary-light" />
      </div>

      <div className="bg-background-alt shadow rounded-lg divide-y divide-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-medium text-primary mb-4">Demo Mode</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primary-light mb-2">
                Enable or disable demo mode for testing and demonstration purposes.
              </p>
              <button
                onClick={() => setIsPasswordFormOpen(true)}
                className="text-sm text-primary hover:text-primary-light"
              >
                Change demo password
              </button>
            </div>
            <DemoModeToggle />
          </div>
        </div>

        {/* Add more settings sections here */}
      </div>

      {isPasswordFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-primary mb-4">
              Update Demo Password
            </h3>
            <DemoPasswordForm onClose={() => setIsPasswordFormOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}