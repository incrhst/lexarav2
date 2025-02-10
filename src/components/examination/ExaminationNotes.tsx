import React, { useState } from 'react';
import { MessageSquare, Send, User } from 'lucide-react';
import { addNote } from '../../utils/validation';

interface ExaminationNotesProps {
  applicationId: string;
  examinerId: string;
}

interface Note {
  id: string;
  examinerId: string;
  content: string;
  timestamp: string;
  type: 'internal' | 'official';
}

export default function ExaminationNotes({
  applicationId,
  examinerId,
}: ExaminationNotesProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState<'internal' | 'official'>('internal');

  const handleAddNote = () => {
    if (!newNote.trim()) return;

    const updatedNotes = addNote(notes, newNote, examinerId, noteType);
    setNotes(updatedNotes);
    setNewNote('');
  };

  return (
    <div className="space-y-4">
      {/* Note Type Toggle */}
      <div className="flex space-x-2">
        <button
          className={`px-4 py-2 text-sm font-medium rounded-md ${
            noteType === 'internal'
              ? 'bg-indigo-100 text-indigo-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => setNoteType('internal')}
        >
          Internal Notes
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium rounded-md ${
            noteType === 'official'
              ? 'bg-indigo-100 text-indigo-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => setNoteType('official')}
        >
          Official Comments
        </button>
      </div>

      {/* Notes List */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {notes.map((note) => (
          <div
            key={note.id}
            className={`p-4 rounded-lg ${
              note.type === 'internal' ? 'bg-gray-50' : 'bg-yellow-50'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <User className="h-6 w-6 text-gray-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-gray-900">
                  Examiner {note.examinerId}
                </div>
                <div className="mt-1 text-sm text-gray-700">{note.content}</div>
                <div className="mt-2 text-xs text-gray-500">
                  {new Date(note.timestamp).toLocaleString()}
                </div>
              </div>
              <div className="flex-shrink-0">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    note.type === 'internal'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {note.type}
                </span>
              </div>
            </div>
          </div>
        ))}

        {notes.length === 0 && (
          <div className="text-center py-6">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No notes</h3>
            <p className="mt-1 text-sm text-gray-500">
              Start the conversation by adding a note
            </p>
          </div>
        )}
      </div>

      {/* Add Note Form */}
      <div className="mt-4">
        <div className="flex space-x-3">
          <div className="flex-grow">
            <textarea
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder={`Add ${noteType} note...`}
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
            />
          </div>
          <div className="flex-shrink-0">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={handleAddNote}
            >
              <Send className="h-4 w-4 mr-2" />
              Add Note
            </button>
          </div>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          {noteType === 'official'
            ? 'This note will be visible to the applicant'
            : 'This note is for internal use only'}
        </p>
      </div>
    </div>
  );
}