import React from 'react';

interface Props {
  title: string;
  value: number;
  description: string;
}

export default function StatsCard({ title, value, description }: Props) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
            <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="text-sm text-gray-500">{description}</div>
        </div>
      </div>
    </div>
  );
}