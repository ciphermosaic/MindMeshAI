import React, { useState } from 'react';
import {
  ClockAlert,
  Plus,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Calendar,
  Clock,
  RotateCcw,
  Search,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import { DeadlineModal } from '../components/deadlines/DeadlineModal';
import { Deadline, DeadlineStatus } from '../types';

export const DeadlinesPage: React.FC = () => {
  const { deadlines, completeDeadline, setInspectingSource, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'upcoming' | 'overdue' | 'completed' | 'all'>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Time remaining calculator helper
  const getCountdownString = (dueDateStr: string, status: DeadlineStatus) => {
    if (status === 'completed') return 'Completed';
    const diff = new Date(dueDateStr).getTime() - Date.now();
    const hours = Math.round(diff / (1000 * 60 * 60));

    if (hours < 0) {
      const absHours = Math.abs(hours);
      if (absHours < 24) return `Overdue by ${absHours} hours`;
      return `Overdue by ${Math.round(absHours / 24)} days`;
    }
    if (hours === 0) return 'Due in less than 1 hour';
    if (hours < 24) return `Due in ${hours} hours`;
    return `Due in ${Math.round(hours / 24)} days`;
  };

  const filteredDeadlines = deadlines.filter((dl) => {
    const matchesSearch =
      dl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dl.courseOrProject.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab =
      activeTab === 'all' || dl.status === activeTab;

    return matchesSearch && matchesTab;
  });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-card border border-border shadow-subtle">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-foreground">Deadlines & Deliverables Tracker</h2>
          <p className="text-xs text-muted-foreground">
            Strict timeline management derived from course portals and discussion channels
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Deadline</span>
        </button>
      </div>

      {/* Tabs and Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Tabs */}
        <div className="flex items-center p-1 rounded-2xl bg-card border border-border text-xs">
          {(['upcoming', 'overdue', 'completed', 'all'] as const).map((tab) => {
            const count = deadlines.filter((d) => (tab === 'all' ? true : d.status === tab)).length;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-xl capitalize transition-all flex items-center gap-1.5 ${
                  activeTab === tab
                    ? 'bg-secondary text-foreground font-bold shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>{tab}</span>
                <span className="text-[10px] opacity-75 font-mono">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search course or title..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-card border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Deadlines List */}
      <div className="space-y-3">
        {filteredDeadlines.length === 0 ? (
          <div className="text-center py-16 p-8 border border-dashed border-border rounded-3xl bg-card/40 text-muted-foreground">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500 opacity-70" />
            <p className="text-xs font-semibold text-foreground">No deadlines in this tab</p>
            <p className="text-[11px] mt-0.5">You're on top of your deliverables!</p>
          </div>
        ) : (
          filteredDeadlines.map((dl) => {
            const isCompleted = dl.status === 'completed';
            const isOverdue = dl.status === 'overdue';
            const countdown = getCountdownString(dl.dueDate, dl.status);

            return (
              <div
                key={dl.id}
                className={`p-5 rounded-3xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isOverdue
                    ? 'bg-rose-500/5 border-rose-500/30'
                    : isCompleted
                    ? 'bg-card/60 border-border opacity-70'
                    : 'bg-card border-border hover:border-primary/40 shadow-subtle'
                }`}
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className={`text-sm font-bold text-foreground ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                      {dl.title}
                    </h3>
                    <Badge variant="priority" priority={dl.priority} />
                    <Badge variant="source" source={dl.source} />
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground/80">{dl.courseOrProject}</span>
                    <span>•</span>
                    <span className="font-mono flex items-center gap-1 text-[11px]">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(dl.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    {dl.weightage && (
                      <>
                        <span>•</span>
                        <span className="text-[11px] font-mono text-primary font-medium">
                          {dl.weightage}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Right side: Countdown & Action */}
                <div className="flex items-center gap-3 self-end md:self-center">
                  <div className="text-right">
                    <div
                      className={`text-xs font-bold font-mono ${
                        isOverdue
                          ? 'text-rose-500'
                          : isCompleted
                          ? 'text-emerald-500'
                          : 'text-amber-500'
                      }`}
                    >
                      {countdown}
                    </div>
                    {dl.sourceMetadata && (
                      <button
                        onClick={() => setInspectingSource(dl.sourceMetadata!)}
                        className="text-[10px] text-muted-foreground hover:text-primary font-mono flex items-center gap-1 justify-end ml-auto mt-0.5"
                      >
                        <span>Provenance</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>

                  {!isCompleted && (
                    <button
                      onClick={() => completeDeadline(dl.id)}
                      className="px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-colors"
                    >
                      Complete
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <DeadlineModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
