import React, { useState } from 'react';
import {
  Sparkles,
  ClockAlert,
  CheckSquare,
  CalendarDays,
  Radio,
  ArrowRight,
  Plus,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import { TaskModal } from '../components/tasks/TaskModal';
import { DeadlineModal } from '../components/deadlines/DeadlineModal';
import { EventModal } from '../components/events/EventModal';

export const DashboardPage: React.FC = () => {
  const {
    tasks,
    deadlines,
    events,
    connectors,
    extracted,
    userProfile,
    setCurrentTab,
    syncConnectorById,
    syncingConnectors,
    completeDeadline,
    updateTask,
    approveExtractedEntity,
    setInspectingSource,
    setIsFirstLoginImportOpen,
  } = useApp();

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isDeadlineModalOpen, setIsDeadlineModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  // Dynamic greeting based on current local hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const pendingTasks = tasks.filter((t) => t.status !== 'completed');
  const urgentTasks = tasks.filter((t) => t.priority === 'urgent' && t.status !== 'completed');
  const upcomingDeadlines = deadlines.filter((d) => d.status === 'upcoming').slice(0, 3);
  const overdueDeadlines = deadlines.filter((d) => d.status === 'overdue');
  const todayOrUpcomingEvents = events.slice(0, 3);

  const isAnySyncing = Object.values(syncingConnectors).some(Boolean);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* 1. Personalized Greeting Banner */}
      <div className="relative overflow-hidden p-6 md:p-8 rounded-3xl bg-gradient-to-r from-card via-card to-brand-950/20 border border-border shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5 z-10">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Cross-Platform Synthesis Active</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
            {getGreeting()}{userProfile?.name ? `, ${userProfile.name}` : ''}
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground max-w-xl leading-relaxed">
            MindMesh is actively extracting actionable items from your <b>WhatsApp</b>, <b>Telegram</b>, and <b>Gmail</b> streams. You have {urgentTasks.length + overdueDeadlines.length} urgent action items requiring attention today.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 z-10">
          <button
            onClick={() => setIsTaskModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-secondary hover:bg-muted text-foreground text-xs font-semibold border border-border transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </button>
          <button
            onClick={() => setIsDeadlineModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-secondary hover:bg-muted text-foreground text-xs font-semibold border border-border transition-all"
          >
            <ClockAlert className="w-3.5 h-3.5" />
            <span>Add Deadline</span>
          </button>
          <button
            onClick={() => setCurrentTab('chat')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-glow-primary transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask AI Agent</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Urgent Deadlines */}
        <div
          onClick={() => setCurrentTab('deadlines')}
          className="p-5 rounded-2xl bg-card border border-border shadow-subtle hover:border-rose-500/30 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-xs font-medium">Overdue / Urgent</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500 group-hover:scale-110 transition-transform">
              <ClockAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground font-mono">
            {overdueDeadlines.length + urgentTasks.length}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
            <span className="text-rose-500 font-semibold">{overdueDeadlines.length} overdue</span> milestones
          </p>
        </div>

        {/* Pending Tasks */}
        <div
          onClick={() => setCurrentTab('tasks')}
          className="p-5 rounded-2xl bg-card border border-border shadow-subtle hover:border-indigo-500/30 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-xs font-medium">Active Tasks</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 group-hover:scale-110 transition-transform">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground font-mono">{pendingTasks.length}</div>
          <p className="text-[11px] text-muted-foreground mt-1">
            {tasks.filter((t) => t.status === 'in_progress').length} currently in progress
          </p>
        </div>

        {/* Upcoming Events */}
        <div
          onClick={() => setCurrentTab('events')}
          className="p-5 rounded-2xl bg-card border border-border shadow-subtle hover:border-emerald-500/30 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-xs font-medium">Upcoming Events</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground font-mono">{events.length}</div>
          <p className="text-[11px] text-muted-foreground mt-1">Exams, meetings & lectures</p>
        </div>

        {/* Connected Channels */}
        <div
          onClick={() => setCurrentTab('connectors')}
          className="p-5 rounded-2xl bg-card border border-border shadow-subtle hover:border-sky-500/30 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-xs font-medium">Sync Streams</span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-500 group-hover:scale-110 transition-transform">
              <Radio className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground font-mono">
            {connectors.filter((c) => c.status === 'connected').length} / {connectors.length}
          </div>
          <p className="text-[11px] text-emerald-500 mt-1 font-medium flex items-center gap-1">
            {connectors.find((c) => c.type === 'whatsapp')?.status === 'connected' ? (
              <>
                <CheckCircle2 className="w-3 h-3" /> WhatsApp primary active
              </>
            ) : (
              <span className="text-muted-foreground">Channels pending sync</span>
            )}
          </p>
        </div>
      </div>

      {/* 3. Main Dashboard Grid: Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Today's Priorities & Upcoming Deadlines */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Priorities Widget */}
          <div className="p-6 rounded-3xl bg-card border border-border shadow-subtle">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                <h3 className="text-sm font-bold text-foreground">Today's Focus & Priorities</h3>
              </div>
              <button
                onClick={() => setCurrentTab('tasks')}
                className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
              >
                <span>View all tasks</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="divide-y divide-border">
              {pendingTasks.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  No pending tasks. You are all caught up!
                </div>
              ) : (
                pendingTasks.slice(0, 4).map((task) => (
                  <div key={task.id} className="py-3.5 first:pt-0 last:pb-0 flex items-start justify-between gap-3 group">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={task.status === 'completed'}
                        onChange={() =>
                          updateTask(task.id, {
                            status: task.status === 'completed' ? 'todo' : 'completed',
                          })
                        }
                        className="mt-1 w-4 h-4 rounded text-primary border-border focus:ring-primary cursor-pointer"
                      />
                      <div>
                        <h4 className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                          {task.title}
                        </h4>
                        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                          {task.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="priority" priority={task.priority} />
                          <Badge variant="source" source={task.source} />
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {task.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    {task.sourceMetadata && (
                      <button
                        onClick={() => setInspectingSource(task.sourceMetadata!)}
                        className="text-[10px] text-muted-foreground hover:text-primary flex items-center gap-1 font-mono p-1 rounded hover:bg-secondary transition-colors"
                        title="Inspect original message provenance"
                      >
                        <span>Provenance</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upcoming Deadlines with Countdown */}
          <div className="p-6 rounded-3xl bg-card border border-border shadow-subtle">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ClockAlert className="w-4 h-4 text-rose-500" />
                <h3 className="text-sm font-bold text-foreground">Upcoming Deadlines</h3>
              </div>
              <button
                onClick={() => setCurrentTab('deadlines')}
                className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3">
              {upcomingDeadlines.length === 0 ? (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  No upcoming deadlines detected across your synchronized channels.
                </div>
              ) : (
                upcomingDeadlines.map((dl) => (
                  <div
                    key={dl.id}
                    className="p-4 rounded-2xl border border-border bg-secondary/30 hover:bg-secondary/60 transition-all flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-foreground">{dl.title}</h4>
                        <Badge variant="priority" priority={dl.priority} />
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span>{dl.courseOrProject}</span>
                        <span>•</span>
                        <span className="font-mono text-rose-500 font-semibold">
                          Due {new Date(dl.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => completeDeadline(dl.id)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-colors"
                      >
                        Mark Done
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Discovered / Extracted Entities Feed */}
          <div className="p-6 rounded-3xl bg-card border border-border shadow-subtle">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-500" />
                <h3 className="text-sm font-bold text-foreground">Recently Discovered by AI Pipeline</h3>
              </div>
              <span className="text-[11px] text-muted-foreground font-mono">
                Auto-detected assignments & dates
              </span>
            </div>

            <div className="space-y-3">
              {extracted.length === 0 ? (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  No newly discovered items awaiting review. Run sync on your channels to extract new items.
                </div>
              ) : (
                extracted.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl border border-border bg-secondary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground">{item.title}</span>
                        <Badge variant="source" source={item.source} />
                        <span className="text-[10px] text-emerald-500 font-mono font-medium">
                          {Math.round(item.confidence * 100)}% match
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground italic">"{item.snippet}"</p>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        Sender: {item.sender}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {item.approved ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-xl">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                        </span>
                      ) : (
                        <button
                          onClick={() => approveExtractedEntity(item.id)}
                          className="px-3 py-1.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-sm transition-colors"
                        >
                          Approve & Add
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Connectors Health & Upcoming Events */}
        <div className="space-y-6">
          {/* Connector Synchronization Health */}
          <div className="p-6 rounded-3xl bg-card border border-border shadow-subtle space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Radio className="w-4 h-4 text-primary" />
                <span>Connected Streams</span>
              </h3>
              <button
                onClick={() => setCurrentTab('connectors')}
                className="text-xs text-primary hover:underline font-medium"
              >
                Configure
              </button>
            </div>

            <div className="space-y-3">
              {connectors.map((c) => {
                const isSyncing = syncingConnectors[c.id];
                return (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-2xl border border-border bg-secondary/40 flex items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${c.type === 'whatsapp' ? 'bg-[#25D366]' : c.type === 'telegram' ? 'bg-[#229ED9]' : 'bg-[#EA4335]'}`} />
                        <span className="text-xs font-bold text-foreground">{c.name}</span>
                        {c.isPrimary && (
                          <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.2 rounded">
                            PRIMARY
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        {c.itemsExtracted} items extracted • {c.messageCount} messages
                      </div>
                    </div>

                    <button
                      onClick={() => syncConnectorById(c.id)}
                      disabled={isSyncing}
                      className="p-2 rounded-xl bg-card hover:bg-secondary text-muted-foreground hover:text-foreground border border-border transition-colors disabled:opacity-50"
                      title="Sync this channel now"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-amber-500' : ''}`} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Continuous Sync Note */}
            <div className="p-3 rounded-2xl bg-secondary/30 border border-border text-[11px] text-muted-foreground flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              <span>
                Backend continuous sync checkpoint active. Sensitive authentication messages and OTPs are stripped.
              </span>
            </div>
          </div>

          {/* Upcoming Events / Calendar Schedule */}
          <div className="p-6 rounded-3xl bg-card border border-border shadow-subtle space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-emerald-500" />
                <span>Upcoming Events</span>
              </h3>
              <button
                onClick={() => setIsEventModalOpen(true)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary"
                title="Add Event"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {todayOrUpcomingEvents.length === 0 ? (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  No upcoming meetings or events scheduled.
                </div>
              ) : (
                todayOrUpcomingEvents.map((ev) => (
                  <div key={ev.id} className="p-3.5 rounded-2xl border border-border bg-secondary/30 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">{ev.title}</span>
                      <Badge variant="source" source={ev.source} />
                    </div>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                      <span className="font-mono">
                        {new Date(ev.startDate).toLocaleDateString([], { month: 'short', day: 'numeric' })} at{' '}
                        {new Date(ev.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-[10px] text-muted-foreground font-mono">
                      {ev.isOnline ? `Online (${ev.location || 'Meet'})` : ev.location}
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setCurrentTab('calendar')}
              className="w-full py-2.5 rounded-xl bg-secondary hover:bg-muted text-xs font-semibold text-foreground border border-border text-center transition-colors"
            >
              Open Unified Calendar
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <TaskModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} />
      <DeadlineModal isOpen={isDeadlineModalOpen} onClose={() => setIsDeadlineModalOpen(false)} />
      <EventModal isOpen={isEventModalOpen} onClose={() => setIsEventModalOpen(false)} />
    </div>
  );
};
