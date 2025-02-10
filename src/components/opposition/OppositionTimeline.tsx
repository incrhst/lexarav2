import React from 'react';
import { Calendar, Clock, CheckCircle, AlertCircle, Gavel } from 'lucide-react';
import { oppositionRecordSchema } from '../../utils/validation';
import type { z } from 'zod';

type OppositionRecord = z.infer<typeof oppositionRecordSchema>;

interface OppositionTimelineProps {
  opposition: OppositionRecord;
}

export default function OppositionTimeline({ opposition }: OppositionTimelineProps) {
  const statusColors: Record<OppositionRecord['status'], string> = {
    draft: 'bg-gray-100 text-gray-800',
    filed: 'bg-blue-100 text-blue-800',
    under_review: 'bg-yellow-100 text-yellow-800',
    response_required: 'bg-orange-100 text-orange-800',
    hearing_scheduled: 'bg-purple-100 text-purple-800',
    decided: 'bg-green-100 text-green-800',
    appealed: 'bg-red-100 text-red-800',
  };

  const getStatusIcon = (status: OppositionRecord['status']) => {
    switch (status) {
      case 'decided':
        return <CheckCircle className="w-5 h-5" />;
      case 'appealed':
        return <AlertCircle className="w-5 h-5" />;
      case 'hearing_scheduled':
        return <Calendar className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  // Combine timeline events, hearings, and decisions for chronological display
  const getAllEvents = () => {
    const events = [
      ...opposition.timeline.map((event) => ({
        type: 'event',
        date: event.date,
        content: event,
      })),
      ...opposition.hearings.map((hearing) => ({
        type: 'hearing',
        date: hearing.scheduledDate,
        content: hearing,
      })),
      ...opposition.decisions.map((decision) => ({
        type: 'decision',
        date: decision.date,
        content: decision,
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return events;
  };

  return (
    <div className="space-y-6">
      {/* Status Section */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Opposition Status
          </h3>
          <div className="mt-4">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                statusColors[opposition.status]
              }`}
            >
              {getStatusIcon(opposition.status)}
              <span className="ml-2">{opposition.status.replace('_', ' ')}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Timeline</h3>
          <div className="mt-4 flow-root">
            <ul className="-mb-8">
              {getAllEvents().map((event, eventIdx) => (
                <li key={eventIdx}>
                  <div className="relative pb-8">
                    {eventIdx !== getAllEvents().length - 1 ? (
                      <span
                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span
                          className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                            event.type === 'hearing'
                              ? 'bg-purple-500'
                              : event.type === 'decision'
                              ? 'bg-green-500'
                              : 'bg-gray-500'
                          }`}
                        >
                          {event.type === 'hearing' ? (
                            <Calendar className="h-5 w-5 text-white" />
                          ) : event.type === 'decision' ? (
                            <Gavel className="h-5 w-5 text-white" />
                          ) : (
                            <Clock className="h-5 w-5 text-white" />
                          )}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-500">
                            {event.type === 'hearing' && (
                              <>
                                <span className="font-medium text-gray-900">
                                  Hearing Scheduled
                                </span>{' '}
                                - {event.content.type} hearing{' '}
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    event.content.status === 'completed'
                                      ? 'bg-green-100 text-green-800'
                                      : event.content.status === 'cancelled'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}
                                >
                                  {event.content.status}
                                </span>
                              </>
                            )}
                            {event.type === 'decision' && (
                              <>
                                <span className="font-medium text-gray-900">
                                  {event.content.type} Decision
                                </span>{' '}
                                - {event.content.reason}{' '}
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    event.content.outcome === 'upheld'
                                      ? 'bg-green-100 text-green-800'
                                      : event.content.outcome === 'rejected'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}
                                >
                                  {event.content.outcome}
                                </span>
                              </>
                            )}
                            {event.type === 'event' && (
                              <span className="font-medium text-gray-900">
                                {event.content.event}
                              </span>
                            )}
                          </p>
                          {event.content.notes && (
                            <p className="mt-1 text-sm text-gray-500">
                              {event.content.notes}
                            </p>
                          )}
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                          {new Date(event.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Latest Decision Section */}
      {opposition.decisions.length > 0 && (
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Latest Decision
            </h3>
            <div className="mt-4">
              {opposition.decisions[opposition.decisions.length - 1] && (
                <div className="rounded-md bg-gray-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Gavel
                        className={`h-5 w-5 ${
                          opposition.decisions[opposition.decisions.length - 1]
                            .outcome === 'upheld'
                            ? 'text-green-400'
                            : opposition.decisions[opposition.decisions.length - 1]
                                .outcome === 'rejected'
                            ? 'text-red-400'
                            : 'text-yellow-400'
                        }`}
                        aria-hidden="true"
                      />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-900">
                        {opposition.decisions[opposition.decisions.length - 1].type}{' '}
                        Decision -{' '}
                        {opposition.decisions[
                          opposition.decisions.length - 1
                        ].outcome.toUpperCase()}
                      </h3>
                      <div className="mt-2 text-sm text-gray-500">
                        <p>
                          {
                            opposition.decisions[opposition.decisions.length - 1]
                              .reason
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 