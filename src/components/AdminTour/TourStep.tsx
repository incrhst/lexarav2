import React from 'react';
import { X } from 'lucide-react';

interface Props {
  title: string;
  content: string;
  onNext: () => void;
  onPrev?: () => void;
  onClose: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  position: {
    top?: number | string;
    left?: number | string;
    right?: number | string;
    bottom?: number | string;
  };
}

export default function TourStep({
  title,
  content,
  onNext,
  onPrev,
  onClose,
  isFirst,
  isLast,
  position,
}: Props) {
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div
        className="fixed z-50 w-80 bg-white rounded-lg shadow-lg p-4"
        style={position}
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-primary">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="text-sm text-primary-light mb-4">{content}</p>
        <div className="flex justify-between">
          <div>
            {!isFirst && (
              <button
                onClick={onPrev}
                className="text-sm text-primary hover:text-primary-light"
              >
                Previous
              </button>
            )}
          </div>
          <div>
            {!isLast ? (
              <button
                onClick={onNext}
                className="text-sm bg-primary text-white px-4 py-1 rounded hover:bg-primary-light"
              >
                Next
              </button>
            ) : (
              <button
                onClick={onClose}
                className="text-sm bg-primary text-white px-4 py-1 rounded hover:bg-primary-light"
              >
                Finish
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}