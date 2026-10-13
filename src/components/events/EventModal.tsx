import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { CalendarEvent, EventCategory, ConnectorSource } from '../../types';
import { useApp } from '../../context/AppContext';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose }) => {
  const { createEvent } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<EventCategory>('meeting');
  const [startDate, setStartDate] = useState(
    new Date(Date.now() + 86400000).toISOString().slice(0, 16)
  );
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 86400000 + 3600000 * 2).toISOString().slice(0, 16)
  );
  const [location, setLocation] = useState('Google Meet');
  const [isOnline, setIsOnline] = useState(true);
  const [meetingLink, setMeetingLink] = useState('https://meet.google.com/new');
  const [attendeesInput, setAttendeesInput] = useState('');
  const [source, setSource] = useState<ConnectorSource>('manual');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const attendees = attendeesInput
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);

    await createEvent({
      title,
      description,
      category,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      location,
      isOnline,
      meetingLink: isOnline ? meetingLink : undefined,
      attendees,
      source,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Event or Meeting"
      description="Add exam dates, project syncs, or lectures"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="font-semibold text-foreground block mb-1">Event Title *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Capstone Rehearsal & Deck Review"
            className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label className="font-semibold text-foreground block mb-1">Description / Notes</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Agenda items or discussion outline..."
            className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="font-semibold text-foreground block mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as EventCategory)}
              className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="meeting">Meeting</option>
              <option value="exam">Exam</option>
              <option value="academic">Academic / Lecture</option>
              <option value="webinar">Webinar / Workshop</option>
              <option value="social">Social</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-foreground block mb-1">Format</label>
            <div className="flex items-center gap-4 mt-2">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  checked={isOnline}
                  onChange={() => setIsOnline(true)}
                  className="text-primary"
                />
                <span>Online</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  checked={!isOnline}
                  onChange={() => setIsOnline(false)}
                  className="text-primary"
                />
                <span>In-person</span>
              </label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="font-semibold text-foreground block mb-1">Start Time *</label>
            <input
              type="datetime-local"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="font-semibold text-foreground block mb-1">End Time *</label>
            <input
              type="datetime-local"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="font-semibold text-foreground block mb-1">
              {isOnline ? 'Platform / URL' : 'Room / Location'}
            </label>
            <input
              type="text"
              value={isOnline ? meetingLink : location}
              onChange={(e) =>
                isOnline ? setMeetingLink(e.target.value) : setLocation(e.target.value)
              }
              placeholder={isOnline ? 'https://meet.google.com/...' : 'Room 304, CS Dept'}
              className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="font-semibold text-foreground block mb-1">Attendees (comma-separated)</label>
            <input
              type="text"
              value={attendeesInput}
              onChange={(e) => setAttendeesInput(e.target.value)}
              placeholder="Varun, Siddharth, Neha"
              className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-secondary hover:bg-muted text-muted-foreground hover:text-foreground font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold transition-colors"
          >
            Save Event
          </button>
        </div>
      </form>
    </Modal>
  );
};
