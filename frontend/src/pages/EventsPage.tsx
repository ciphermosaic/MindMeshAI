import React, { useState } from 'react';
import {
  CalendarDays,
  Plus,
  Search,
  MapPin,
  Video,
  Clock,
  ExternalLink,
  Trash2,
  Users,
  Grid,
  List,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import { EventModal } from '../components/events/EventModal';
import { CalendarEvent, EventCategory } from '../types';

export const EventsPage: React.FC = () => {
  const { events, deleteEvent, setInspectingSource } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  const filteredEvents = events.filter((ev) => {
    const matchesSearch =
      ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ev.description && ev.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (ev.location && ev.location.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'all' || ev.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-card border border-border shadow-subtle">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-foreground">Discovered Events & Meetings</h2>
          <p className="text-xs text-muted-foreground">
            Extracted from study groups, faculty emails, and webinar notices
          </p>
        </div>

        <button
          onClick={() => setIsEventModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Event</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md relative">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events, locations, or agendas..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-card border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-card border border-border text-xs font-medium text-foreground focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="meeting">Meetings</option>
            <option value="exam">Exams</option>
            <option value="academic">Academic / Lectures</option>
            <option value="webinar">Webinars</option>
            <option value="social">Social</option>
          </select>

          {/* View Mode */}
          <div className="flex items-center p-1 rounded-xl bg-card border border-border text-xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-secondary text-foreground font-bold' : 'text-muted-foreground'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-secondary text-foreground font-bold' : 'text-muted-foreground'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Events Grid / List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvents.map((ev) => (
            <div
              key={ev.id}
              className="p-5 rounded-3xl bg-card border border-border shadow-subtle hover:border-primary/40 transition-all flex flex-col justify-between group space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="source" source={ev.source} />
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-secondary text-muted-foreground">
                    {ev.category}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                  {ev.title}
                </h3>

                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {ev.description}
                </p>

                <div className="space-y-1.5 pt-2 text-xs text-muted-foreground border-t border-border/60">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    <span className="font-mono text-[11px]">
                      {new Date(ev.startDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}{' '}
                      at {new Date(ev.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {ev.isOnline ? (
                    <div className="flex items-center gap-2 text-emerald-500 font-medium">
                      <Video className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="text-[11px] truncate">Online: {ev.location || 'Google Meet'}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                      <span className="text-[11px] truncate">{ev.location || 'In Person'}</span>
                    </div>
                  )}

                  {ev.attendees && ev.attendees.length > 0 && (
                    <div className="flex items-center gap-2 text-[11px]">
                      <Users className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                      <span className="truncate">{ev.attendees.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {ev.meetingLink && (
                    <a
                      href={ev.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <span>Join Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}

                  {ev.sourceMetadata && (
                    <button
                      onClick={() => setInspectingSource(ev.sourceMetadata!)}
                      className="text-xs text-muted-foreground hover:text-primary font-mono transition-colors"
                      title="Inspect Provenance"
                    >
                      Provenance
                    </button>
                  )}
                </div>

                <button
                  onClick={() => deleteEvent(ev.id)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                  title="Remove event"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="p-4 rounded-3xl bg-card border border-border shadow-subtle divide-y divide-border">
          {filteredEvents.map((ev) => (
            <div key={ev.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-foreground">{ev.title}</h4>
                  <Badge variant="source" source={ev.source} />
                  <span className="text-[10px] uppercase font-bold text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                    {ev.category}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span>{new Date(ev.startDate).toLocaleString()}</span>
                  <span>•</span>
                  <span>{ev.isOnline ? 'Online' : ev.location}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {ev.meetingLink && (
                  <a
                    href={ev.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1"
                  >
                    <span>Join</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                <button
                  onClick={() => deleteEvent(ev.id)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <EventModal isOpen={isEventModalOpen} onClose={() => setIsEventModalOpen(false)} />
    </div>
  );
};
