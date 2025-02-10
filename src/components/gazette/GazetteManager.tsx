import React, { useState } from 'react';
import { Calendar, Bell, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { GazetteStatus, gazetteRecordSchema } from '../../utils/validation';
import type { z } from 'zod';

type GazetteRecord = z.infer<typeof gazetteRecordSchema>;

interface GazetteManagerProps {
  applicationId: string;
}

export default function GazetteManager({ applicationId }: GazetteManagerProps) {
  const [gazetteRecord, setGazetteRecord] = useState<GazetteRecord>({
    id: '',
    applicationId,
    status: 'pending_publication',
    notifications: [],
  });

  const statusColors: Record<GazetteStatus, string> = {
    pending_publication: 'bg-yellow-100 text-yellow-800',
    published: 'bg-blue-100 text-blue-800',
    opposition_period: 'bg-purple-100 text-purple-800',
    opposition_filed: 'bg-red-100 text-red-800',
    registered: 'bg-green-100 text-green-800',
  };

  const getStatusIcon = (status: GazetteStatus) => {
    switch (status) {
      case 'registered':
        return <CheckCircle className="w-5 h-5" />;
      case 'opposition_filed':
        return <AlertCircle className="w-5 h-5" />;
      case 'opposition_period':
      case 'pending_publication':
        return <Clock className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const handlePublish = () => {
    setGazetteRecord((prev) => ({
      ...prev,
      status: 'published',
      publicationDetails: {
        gazetteNumber: `GZ-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
        publicationDate: new Date().toISOString(),
        section: 'Trademarks',
        pageNumber: '1',
      },
    }));
  };

  const startOppositionPeriod = () => {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 3); // 3 months opposition period

    setGazetteRecord((prev) => ({
      ...prev,
      status: 'opposition_period',
      oppositionPeriod: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        status: 'active',
      },
    }));
  };

  const addNotification = (content: string) => {
    const notification = {
      id: crypto.randomUUID(),
      type: 'status_update',
      content,
      sentDate: new Date().toISOString(),
      status: 'pending' as const,
    };

    setGazetteRecord((prev) => ({
      ...prev,
      notifications: [...prev.notifications, notification],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Status Section */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Publication Status
          </h3>
          <div className="mt-4">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                statusColors[gazetteRecord.status]
              }`}
            >
              {getStatusIcon(gazetteRecord.status)}
              <span className="ml-2">{gazetteRecord.status.replace('_', ' ')}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Publication Details */}
      {gazetteRecord.publicationDetails && (
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Publication Details
            </h3>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Gazette Number</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {gazetteRecord.publicationDetails.gazetteNumber}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Publication Date</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(
                    gazetteRecord.publicationDetails.publicationDate
                  ).toLocaleDateString()}
                </dd>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Opposition Period */}
      {gazetteRecord.oppositionPeriod && (
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Opposition Period
            </h3>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Start Date</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(gazetteRecord.oppositionPeriod.startDate).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">End Date</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(gazetteRecord.oppositionPeriod.endDate).toLocaleDateString()}
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      gazetteRecord.oppositionPeriod.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {gazetteRecord.oppositionPeriod.status}
                  </span>
                </dd>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Actions</h3>
          <div className="mt-4 space-x-4">
            {gazetteRecord.status === 'pending_publication' && (
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={handlePublish}
              >
                <Bell className="w-4 h-4 mr-2" />
                Publish to Gazette
              </button>
            )}
            {gazetteRecord.status === 'published' && (
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={startOppositionPeriod}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Start Opposition Period
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Notifications
          </h3>
          <div className="mt-4 space-y-4">
            {gazetteRecord.notifications.map((notification) => (
              <div
                key={notification.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <Bell className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-900">{notification.content}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(notification.sentDate).toLocaleString()}
                    </p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    notification.status === 'sent'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {notification.status}
                </span>
              </div>
            ))}

            {gazetteRecord.notifications.length === 0 && (
              <div className="text-center py-6">
                <Bell className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No notifications
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Notifications will appear here when status changes occur
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 