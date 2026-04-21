'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, BookOpen } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export default function NotesPage() {
  const [mounted, setMounted] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newNote, setNewNote] = useState({
    title: '',
    content: ''
  });

  // Load notes from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('academic-notes');
    if (saved) {
      try {
        setNotes(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading notes:', e);
      }
    }
    setMounted(true);
  }, []);

  // Save notes to localStorage whenever they change
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('academic-notes', JSON.stringify(notes));
    }
  }, [notes, mounted]);

  const handleAddNote = () => {
    if (newNote.title.trim() || newNote.content.trim()) {
      const note: Note = {
        id: Date.now().toString(),
        title: newNote.title || 'Untitled Note',
        content: newNote.content,
        createdAt: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      };
      setNotes([note, ...notes]);
      setNewNote({ title: '', content: '' });
      setShowAddForm(false);
    }
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-32 font-sans">
      {/* Header */}
      <nav className="bg-white border-b border-slate-100 px-8 py-5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl">
              <BookOpen className="text-white h-5 w-5" />
            </div>
            <h1 className="text-xl font-black">Study Notes</h1>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-blue-700 transition-all"
          >
            <Plus size={16} className="inline mr-2" />
            New Note
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto mt-10 px-6">
        {/* Add Note Form */}
        {showAddForm && (
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-900">Create New Note</h3>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewNote({ title: '', content: '' });
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <input
                value={newNote.title}
                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                placeholder="Note title..."
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 outline-none focus:border-blue-300 focus:bg-white transition-all font-medium"
              />
              <textarea
                value={newNote.content}
                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                placeholder="Write your important notes here..."
                rows={6}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 outline-none focus:border-blue-300 focus:bg-white transition-all font-medium resize-none"
              />
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAddNote}
                  className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                >
                  Save Note
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewNote({ title: '', content: '' });
                  }}
                  className="bg-slate-100 text-slate-600 px-6 py-3 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.length === 0 ? (
            <div className="col-span-full text-center py-20">
              <BookOpen className="mx-auto h-16 w-16 text-slate-300 mb-4" />
              <p className="text-slate-400 text-lg font-medium">No notes yet. Create your first note!</p>
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-800 flex-1 break-words line-clamp-2">
                    {note.title}
                  </h3>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="ml-3 p-2 text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
                    title="Delete note"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <p className="text-slate-600 text-sm mb-4 whitespace-pre-wrap break-words line-clamp-6 leading-relaxed">
                  {note.content}
                </p>
                <p className="text-xs text-slate-400">{note.createdAt}</p>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
