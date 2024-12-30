import React from 'react';

const STATUS_STYLES = {
  submitted: 'bg-gray-100 text-gray-800',
  underReview: 'bg-yellow-100 text-yellow-800',
  published: 'bg-green-100 text-green-800',
  opposed: 'bg-red-100 text-red-800',
  allowed: 'bg-blue-100 text-blue-800',
  registered: 'bg-indigo-100 text-indigo-800',
  rejected: 'bg-red-100 text-red-800',
};

const STATUS_LABELS = {
  submitted: 'Submitted',
  underReview: 'Under Review',
  published: 'Published',
  opposed: 'Opposed',
  allowed: 'Allowed',
  registered: 'Registered',
  rejected: 'Rejected',
};

type ApplicationStatus = keyof typeof STATUS_STYLES;

interface Props {
  status: ApplicationStatus;
}

export default function ApplicationStatusBadge({ status }: Props) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}