import React, { useState } from 'react';
import {
  add,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isEqual,
  isSameDay,
  isSameMonth,
  isToday,
  parse,
  parseISO,
  startOfToday,
} from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

interface RenewalEvent {
  id: string;
  title: string;
  type: 'trademark' | 'patent';
  date: string;
  status: 'upcoming' | 'overdue' | 'completed';
}

interface RenewalCalendarProps {
  events: RenewalEvent[];
  onEventClick: (event: RenewalEvent) => void;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function RenewalCalendar({ events, onEventClick }: RenewalCalendarProps) {
  const today = startOfToday();
  const [selectedDay, setSelectedDay] = useState(today);
  const [currentMonth, setCurrentMonth] = useState(format(today, 'MMM-yyyy'));
  const firstDayCurrentMonth = parse(currentMonth, 'MMM-yyyy', new Date());

  const days = eachDayOfInterval({
    start: firstDayCurrentMonth,
    end: endOfMonth(firstDayCurrentMonth),
  });

  const previousMonth = () => {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: -1 });
    setCurrentMonth(format(firstDayNextMonth, 'MMM-yyyy'));
  };

  const nextMonth = () => {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 });
    setCurrentMonth(format(firstDayNextMonth, 'MMM-yyyy'));
  };

  const selectedDayEvents = events.filter((event) =>
    isSameDay(parseISO(event.date), selectedDay)
  );

  return (
    <div className="lg:flex lg:h-full lg:flex-col">
      <header className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <h1 className="text-lg font-semibold text-gray-900">
          <time dateTime={format(firstDayCurrentMonth, 'yyyy-MM')}>
            {format(firstDayCurrentMonth, 'MMMM yyyy')}
          </time>
        </h1>
        <div className="flex items-center">
          <div className="relative flex items-center rounded-md bg-white shadow-sm md:items-stretch">
            <button
              type="button"
              onClick={previousMonth}
              className="flex h-9 w-9 items-center justify-center rounded-l-md border-y border-l border-gray-300 pr-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pr-0 md:hover:bg-gray-50"
            >
              <span className="sr-only">Previous month</span>
              <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={nextMonth}
              className="flex h-9 w-9 items-center justify-center rounded-r-md border-y border-r border-gray-300 pl-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pl-0 md:hover:bg-gray-50"
            >
              <span className="sr-only">Next month</span>
              <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => setSelectedDay(today)}
            className="ml-4 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Today
          </button>
        </div>
      </header>

      <div className="shadow ring-1 ring-black ring-opacity-5 lg:flex lg:flex-auto lg:flex-col">
        <div className="grid grid-cols-7 gap-px border-b border-gray-300 bg-gray-200 text-center text-xs font-semibold leading-6 text-gray-700">
          <div className="bg-white py-2">Sun</div>
          <div className="bg-white py-2">Mon</div>
          <div className="bg-white py-2">Tue</div>
          <div className="bg-white py-2">Wed</div>
          <div className="bg-white py-2">Thu</div>
          <div className="bg-white py-2">Fri</div>
          <div className="bg-white py-2">Sat</div>
        </div>

        <div className="flex bg-gray-200 text-xs leading-6 text-gray-700 lg:flex-auto">
          <div className="w-full grid grid-cols-7 gap-px">
            {days.map((day, dayIdx) => {
              const dayEvents = events.filter((event) =>
                isSameDay(parseISO(event.date), day)
              );

              return (
                <div
                  key={day.toString()}
                  className={classNames(
                    'relative bg-white px-3 py-2 min-h-[100px]',
                    !isSameMonth(day, firstDayCurrentMonth) && 'bg-gray-50 text-gray-500'
                  )}
                >
                  <time
                    dateTime={format(day, 'yyyy-MM-dd')}
                    className={classNames(
                      'flex h-6 w-6 items-center justify-center rounded-full',
                      isEqual(day, selectedDay) && 'font-semibold',
                      isToday(day) && 'bg-indigo-600 font-semibold text-white',
                      !isEqual(day, selectedDay) && !isToday(day) && 'text-gray-900',
                      !isSameMonth(day, firstDayCurrentMonth) && 'text-gray-400'
                    )}
                    onClick={() => setSelectedDay(day)}
                  >
                    {format(day, 'd')}
                  </time>

                  {dayEvents.length > 0 && (
                    <ol className="mt-2">
                      {dayEvents.map((event) => (
                        <li key={event.id}>
                          <button
                            onClick={() => onEventClick(event)}
                            className={classNames(
                              'w-full text-left px-2 py-1 text-xs rounded-md',
                              {
                                'bg-red-50 text-red-700': event.status === 'overdue',
                                'bg-yellow-50 text-yellow-700': event.status === 'upcoming',
                                'bg-green-50 text-green-700': event.status === 'completed',
                              }
                            )}
                          >
                            <div className="font-medium truncate">{event.title}</div>
                            <div className="text-xs capitalize">{event.type}</div>
                          </button>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {selectedDayEvents.length > 0 && (
        <div className="mt-4 px-4 py-6 bg-white shadow rounded-lg">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Events for {format(selectedDay, 'MMMM d, yyyy')}
          </h2>
          <ol className="space-y-4">
            {selectedDayEvents.map((event) => (
              <li key={event.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{event.title}</p>
                  <p className="text-sm text-gray-500 capitalize">{event.type}</p>
                </div>
                <button
                  onClick={() => onEventClick(event)}
                  className="rounded-md bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-100"
                >
                  View details
                </button>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

