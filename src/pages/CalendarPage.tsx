import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  ClockAlert,
  CalendarDays,
  CheckSquare,
  Clock,
  MapPin,
  ExternalLink,
  Filter,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import { EventModal } from '../components/events/EventModal';
import { DeadlineModal } from '../components/deadlines/DeadlineModal';
import { CalendarEvent, Deadline, Task } from '../types';

type CalendarViewMode = 'month' | 'week' | 'day' | 'agenda';

export const CalendarPage: React.FC = () => {
  const { events, deadlines, tasks, setInspectingSource } = useApp();

  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isDeadlineModalOpen, setIsDeadlineModalOpen] = useState(false);

  // Month navigation helpers
  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else if (viewMode === 'week') {
      setCurrentDate(new Date(currentDate.getTime() - 7 * 86400000));
    } else {
      setCurrentDate(new Date(currentDate.getTime() - 86400000));
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else if (viewMode === 'week') {
      setCurrentDate(new Date(currentDate.getTime() + 7 * 86400000));
    } else {
      setCurrentDate(new Date(currentDate.getTime() + 86400000));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Compile unified calendar items across events, deadlines, and tasks
  const unifiedItems: Array<{
    id: string;
    title: string;
    type: 'event' | 'deadline' | 'task';
    date: Date;
    category: string;
    source: any;
    priority?: any;
    rawItem: any;
  }> = [
    ...events.map((e) => ({
      id: e.id,
      title: e.title,
      type: 'event' as const,
      date: new Date(e.startDate),
      category: e.category,
      source: e.source,
      rawItem: e,
    })),
    ...deadlines.map((d) => ({
      id: d.id,
      title: d.title,
      type: 'deadline' as const,
      date: new Date(d.dueDate),
      category: 'deadline',
      priority: d.priority,
      source: d.source,
      rawItem: d,
    })),
    ...tasks.map((t) => ({
      id: t.id,
      title: t.title,
      type: 'task' as const,
      date: new Date(t.dueDate),
      category: 'task',
      priority: t.priority,
      source: t.source,
      rawItem: t,
    })),
  ].filter((item) => {
    if (categoryFilter === 'all') return true;
    if (categoryFilter === 'deadlines') return item.type === 'deadline';
    if (categoryFilter === 'events') return item.type === 'event';
    if (categoryFilter === 'tasks') return item.type === 'task';
    return item.category === categoryFilter;
  });

  // Month grid generator
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d);
  }

  const getItemsForDay = (day: number) => {
    return unifiedItems.filter(
      (item) =>
        item.date.getFullYear() === year &&
        item.date.getMonth() === month &&
        item.date.getDate() === day
    );
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-card border border-border shadow-subtle">
        {/* Navigation & Month display */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              className="p-2 rounded-xl bg-secondary hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-2 rounded-xl bg-secondary hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-base font-bold text-foreground">
            {currentDate.toLocaleDateString([], { month: 'long', year: 'numeric' })}
          </h2>

          <button
            onClick={handleToday}
            className="px-3 py-1 rounded-xl bg-secondary hover:bg-muted text-xs font-semibold text-foreground border border-border transition-colors"
          >
            Today
          </button>
        </div>

        {/* View Switcher & Action buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {/* View mode toggle */}
          <div className="flex items-center p-1 rounded-2xl bg-secondary border border-border text-xs">
            {(['month', 'week', 'day', 'agenda'] as CalendarViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded-xl capitalize transition-all ${
                  viewMode === mode
                    ? 'bg-card text-foreground shadow-sm font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Filter dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-secondary border border-border text-xs font-medium text-foreground focus:outline-none"
          >
            <option value="all">All Items</option>
            <option value="deadlines">Deadlines Only</option>
            <option value="events">Events & Meetings</option>
            <option value="tasks">Scheduled Tasks</option>
          </select>

          {/* Add buttons */}
          <button
            onClick={() => setIsEventModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Event</span>
          </button>
        </div>
      </div>

      {/* Main View: Month or Agenda */}
      {viewMode === 'month' && (
        <div className="rounded-3xl border border-border bg-card shadow-subtle overflow-hidden">
          {/* Days of week header */}
          <div className="grid grid-cols-7 border-b border-border bg-secondary/50 text-center py-2.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Month Grid */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-border">
            {calendarDays.map((day, idx) => {
              if (day === null) {
                return (
                  <div key={`empty-${idx}`} className="min-h-[110px] p-2 bg-secondary/20" />
                );
              }

              const isToday =
                day === 11 &&
                month === 9 &&
                year === 2026;

              const dayItems = getItemsForDay(day);

              return (
                <div
                  key={`day-${day}`}
                  className={`min-h-[110px] p-2 flex flex-col transition-colors ${
                    isToday ? 'bg-primary/5 ring-1 ring-primary/30' : 'hover:bg-secondary/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday ? 'bg-primary text-white' : 'text-foreground'
                      }`}
                    >
                      {day}
                    </span>
                    {dayItems.length > 0 && (
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {dayItems.length}
                      </span>
                    )}
                  </div>

                  {/* Day Items Badges */}
                  <div className="flex-1 space-y-1 overflow-y-auto max-h-24">
                    {dayItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setSelectedItem(item.rawItem)}
                        className={`p-1 px-1.5 rounded-lg text-[10px] font-medium truncate cursor-pointer transition-transform hover:scale-[1.02] border ${
                          item.type === 'deadline'
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                            : item.type === 'event'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                            : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'
                        }`}
                        title={item.title}
                      >
                        {item.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Agenda & Day/Week View */}
      {(viewMode === 'agenda' || viewMode === 'week' || viewMode === 'day') && (
        <div className="p-6 rounded-3xl bg-card border border-border shadow-subtle space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-foreground">
              Agenda Stream ({unifiedItems.length} total items)
            </h3>
            <span className="text-xs text-muted-foreground font-mono">
              Chronologically synchronized
            </span>
          </div>

          <div className="divide-y divide-border">
            {unifiedItems
              .sort((a, b) => a.date.getTime() - b.date.getTime())
              .map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item.rawItem)}
                  className="py-3.5 first:pt-0 last:pb-0 flex items-start justify-between gap-4 cursor-pointer hover:bg-secondary/30 p-2 rounded-2xl transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground">{item.title}</span>
                      <Badge variant="source" source={item.source} />
                      <span
                        className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                          item.type === 'deadline'
                            ? 'bg-rose-500/10 text-rose-500'
                            : item.type === 'event'
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : 'bg-indigo-500/10 text-indigo-500'
                        }`}
                      >
                        {item.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{item.date.toLocaleString()}</span>
                    </div>
                  </div>

                  {item.rawItem.sourceMetadata && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setInspectingSource(item.rawItem.sourceMetadata);
                      }}
                      className="text-xs text-primary hover:underline flex items-center gap-1 font-mono p-1 rounded"
                    >
                      <span>Provenance</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Selected Item Drawer / Quick inspection */}
      {selectedItem && (
        <div className="p-6 rounded-3xl bg-secondary/50 border border-border shadow-subtle flex items-start justify-between gap-4 animate-in fade-in">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-foreground">{selectedItem.title}</h4>
              {selectedItem.source && <Badge variant="source" source={selectedItem.source} />}
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedItem.description || selectedItem.courseOrProject || 'Synchronized item'}
            </p>
            {selectedItem.sourceMetadata && (
              <button
                onClick={() => setInspectingSource(selectedItem.sourceMetadata)}
                className="inline-flex items-center gap-1 text-xs text-primary font-semibold hover:underline mt-1"
              >
                <span>View original message snippet</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>
          <button
            onClick={() => setSelectedItem(null)}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-xl bg-card border border-border"
          >
            Close Details
          </button>
        </div>
      )}

      <EventModal isOpen={isEventModalOpen} onClose={() => setIsEventModalOpen(false)} />
      <DeadlineModal isOpen={isDeadlineModalOpen} onClose={() => setIsDeadlineModalOpen(false)} />
    </div>
  );
};
