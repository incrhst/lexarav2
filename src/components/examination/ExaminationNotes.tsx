import React, { useState } from 'react';
import { MessageSquare, Send, User } from 'lucide-react';

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

export default function ExaminationNotes({ applicationId, examinerId }: ExaminationNotesProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");

  const handleSendNote = () => {
    if (!newNote.trim()) return;
    const note: Note = {
      id: Date.now().toString(),
      examinerId,
      content: newNote,
      timestamp: new Date().toISOString(),
      type: 'internal'
    };
    setNotes([...notes, note]);
    setNewNote("");
  };

  return (
    <div className="examination-notes p-4 border rounded">
      <h2 className="text-xl font-bold mb-4">Examination Notes</h2>
      <div className="notes-list space-y-2">
        {notes.map(note => (
          <div key={note.id} className="note flex items-center p-2 border rounded">
            <User className="h-6 w-6 text-gray-600" />
            <div className="ml-2">
              <p className="text-gray-800">{note.content}</p>
              <small className="text-gray-500">{new Date(note.timestamp).toLocaleString()}</small>
            </div>
          </div>
        ))}
        {notes.length === 0 && (
          <p className="text-gray-500">No notes yet. Add one below.</p>
        )}
      </div>
      <div className="new-note flex items-center mt-4">
        <input
          type="text"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a note"
          className="flex-1 p-2 border rounded"
        />
        <button onClick={handleSendNote} className="ml-2 p-2 border rounded flex items-center bg-primary text-white hover:bg-primary-light">
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}