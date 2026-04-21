'use client';

import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { Plus, Clock, MapPin, Users, BookOpen, Trash2, X, Calendar as CalendarIcon } from 'lucide-react';
import 'react-calendar/dist/Calendar.css';

// --- Custom Styles to override react-calendar defaults ---
const calendarStyles = `
  .react-calendar { 
    border: none !important; 
    font-family: inherit !important; 
    width: 100% !important;
    background: transparent !important;
  }
  .react-calendar__tile--active {
    background: #2563eb !important;
    border-radius: 0.5rem !important;
  }
  .react-calendar__tile--now {
    background: #dbeafe !important;
    border-radius: 0.5rem !important;
    color: #1e40af !important;
  }
  .react-calendar__tile:hover {
    border-radius: 0.5rem !important;
  }
  .react-calendar__navigation button:enabled:hover,
  .react-calendar__navigation button:enabled:focus {
    background-color: #f3f4f6 !important;
    border-radius: 0.5rem !important;
  }
`;

interface Event {
  id: string;
  title: string;
  date: string; // Stored as ISO string for easier localStorage handling
  time: string;
  type: 'study' | 'exam' | 'assignment' | 'meeting';
  description?: string;
  location?: string;
}

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);

  const [newEvent, setNewEvent] = useState({
    title: '',
    time: '',
    type: 'study' as Event['type'],
    description: '',
    location: ''
  });

  // Load data from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('academic-events');
    if (saved) setEvents(JSON.parse(saved));
    setMounted(true);
  }, []);

  // Save data to localStorage when events change
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('academic-events', JSON.stringify(events));
    }
  }, [events, mounted]);

  const getEventTypeColor = (type: string) => {
    const colors = {
      exam: 'bg-rose-50 text-rose-700 border-rose-200',
      assignment: 'bg-amber-50 text-amber-700 border-amber-200',
      meeting: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      study: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };
    return colors[type as keyof typeof colors] || 'bg-slate-50 text-slate-700 border-slate-200';
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'exam': return <BookOpen className="h-4 w-4" />;
      case 'assignment': return <Clock className="h-4 w-4" />;
      case 'meeting': return <Users className="h-4 w-4" />;
      default: return <CalendarIcon className="h-4 w-4" />;
    }
  };

  const handleAddEvent = () => {
    if (newEvent.title && newEvent.time) {
      const event: Event = {
        id: crypto.randomUUID(),
        title: newEvent.title,
        date: selectedDate.toISOString(),
        time: newEvent.time,
        type: newEvent.type,
        description: newEvent.description,
        location: newEvent.location
      };
      setEvents([...events, event]);
      setNewEvent({ title: '', time: '', type: 'study', description: '', location: '' });
      setShowAddEvent(false);
    }
  };

  const deleteEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id));
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      new Date(event.date).toDateString() === date.toDateString()
    );
  };

  if (!mounted) return null;

  const selectedDateEvents = getEventsForDate(selectedDate);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-12">
      <style>{calendarStyles}</style>
      
      <div className="max-w-6xl mx-auto py-10 px-4">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Study Planner</h1>
            <p className="text-slate-500 mt-1">Organize your academic life with precision.</p>
          </div>
          <button
            onClick={() => setShowAddEvent(true)}
            className="inline-flex items-center justify-center bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Event
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Calendar Card */}
          <div className="lg:col-span-7">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <Calendar
                onChange={(val) => setSelectedDate(val as Date)}
                value={selectedDate}
                tileContent={({ date }) => {
                  const hasEvent = getEventsForDate(date).length > 0;
                  return hasEvent ? (
                    <div className="flex justify-center mt-1">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    </div>
                  ) : null;
                }}
              />
            </div>
          </div>

          {/* Sidebar: Details & Upcoming */}
          <div className="lg:col-span-5 space-y-6">
            {/* Selected Date Events */}
            <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold mb-4 flex items-center text-slate-800">
                <CalendarIcon className="mr-2 h-5 w-5 text-blue-500" />
                {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })}
              </h2>
              
              <div className="space-y-4">
                {selectedDateEvents.length > 0 ? (
                  selectedDateEvents.map((event) => (
                    <div key={event.id} className={`group relative p-4 rounded-2xl border transition-all ${getEventTypeColor(event.type)}`}>
                      <button 
                        onClick={() => deleteEvent(event.id)}
                        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <div className="flex items-start gap-3">
                        <div className="mt-1">{getEventTypeIcon(event.type)}</div>
                        <div>
                          <h3 className="font-bold leading-none mb-1">{event.title}</h3>
                          <p className="text-sm font-medium opacity-80">{event.time}</p>
                          {event.description && <p className="text-sm mt-2 opacity-70 line-clamp-2">{event.description}</p>}
                          {event.location && (
                            <div className="flex items-center mt-2 text-xs opacity-70">
                              <MapPin className="h-3 w-3 mr-1" /> {event.location}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                    <p className="text-slate-400 text-sm">No plans for today.</p>
                  </div>
                )}
              </div>
            </section>

            {/* Quick Summary / Upcoming */}
            <section className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl">
              <h2 className="text-lg font-bold mb-4">Focus List</h2>
              <div className="space-y-4">
                {events
                  .filter(e => new Date(e.date) >= new Date())
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .slice(0, 3)
                  .map(event => (
                    <div key={event.id} className="flex items-center gap-3">
                      <div className="w-2 h-8 rounded-full bg-blue-500"></div>
                      <div>
                        <p className="text-sm font-bold truncate w-40">{event.title}</p>
                        <p className="text-xs text-slate-400">{new Date(event.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                {events.length === 0 && <p className="text-slate-500 text-xs text-center italic">Your schedule is clear!</p>}
              </div>
            </section>
          </div>
        </div>

        {/* Modal */}
        {showAddEvent && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-md w-full relative animate-in fade-in zoom-in duration-200">
              <button 
                onClick={() => setShowAddEvent(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"
              >
                <X className="h-6 w-6" />
              </button>
              
              <h2 className="text-2xl font-bold mb-6">Create New Event</h2>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Event Name</label>
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="e.g., Organic Chemistry Quiz"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Time</label>
                    <input
                      type="time"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Category</label>
                    <select
                      value={newEvent.type}
                      onChange={(e) => setNewEvent({...newEvent, type: e.target.value as Event['type']})}
                      className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="study">Study</option>
                      <option value="exam">Exam</option>
                      <option value="assignment">Assignment</option>
                      <option value="meeting">Meeting</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Location</label>
                  <input
                    type="text"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500"
                    placeholder="Room 402 or Zoom"
                  />
                </div>
              </div>
              
              <button
                onClick={handleAddEvent}
                className="w-full mt-8 bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
              >
                Confirm Schedule
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}