import React, { useState } from 'react';
import {
  X,
  Bell,
  CheckCircle2,
  Clock,
  ClockAlert,
  Radio,
  Check,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NotificationItem, NotificationActionType } from '../../types';
import { Badge } from '../common/Badge';

export const NotificationDrawer: React.FC = () => {
  const {
    isNotificationDrawerOpen,
    setIsNotificationDrawerOpen,
    notifications,
    unreadCount,
    handleNotificationAction,
    markAllNotificationsRead,
    setInspectingSource,
    deadlines,
    tasks,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'deadlines' | 'sync' | 'ai'>('all');
  const [snoozeMenuForId, setSnoozeMenuForId] = useState<string | null>(null);

  if (!isNotificationDrawerOpen) return null;

  const filteredNotifs = notifications.filter((n) => {
    if (activeTab === 'deadlines') return n.type === 'deadline';
    if (activeTab === 'sync') return n.type === 'sync';
    if (activeTab === 'ai') return n.type === 'ai_insight';
    return true;
  });

  const handleAction = async (id: string, action: NotificationActionType, snoozeHours: number = 2) => {
    setSnoozeMenuForId(null);
    await handleNotificationAction(id, action, snoozeHours);
  };

  const handleInspect = (notif: NotificationItem) => {
    if (notif.deadlineId) {
      const dl = deadlines.find((d) => d.id === notif.deadlineId);
      if (dl?.sourceMetadata) {
        setInspectingSource(dl.sourceMetadata);
        return;
      }
    }
    if (notif.taskId) {
      const t = tasks.find((item) => item.id === notif.taskId);
      if (t?.sourceMetadata) {
        setInspectingSource(t.sourceMetadata);
        return;
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={() => setIsNotificationDrawerOpen(false)}
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-card border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-card">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Notification Center</h3>
                <p className="text-[11px] text-muted-foreground font-mono">
                  {unreadCount} unread alert{unreadCount === 1 ? '' : 's'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllNotificationsRead}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-primary hover:bg-primary/10 transition-colors"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsNotificationDrawerOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="px-6 py-2 border-b border-border bg-secondary/30 flex items-center gap-1 text-xs">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
                activeTab === 'all'
                  ? 'bg-card text-foreground shadow-sm font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('deadlines')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
                activeTab === 'deadlines'
                  ? 'bg-card text-foreground shadow-sm font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Deadlines
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
                activeTab === 'ai'
                  ? 'bg-card text-foreground shadow-sm font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              AI Insights
            </button>
            <button
              onClick={() => setActiveTab('sync')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
                activeTab === 'sync'
                  ? 'bg-card text-foreground shadow-sm font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sync Log
            </button>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredNotifs.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500 opacity-80" />
                <p className="text-xs font-semibold text-foreground">You are all caught up!</p>
                <p className="text-[11px] mt-0.5">No notifications matching this filter.</p>
              </div>
            ) : (
              filteredNotifs.map((notif) => {
                const isUnread = !notif.isRead;
                const isSnoozeOpen = snoozeMenuForId === notif.id;

                return (
                  <div
                    key={notif.id}
                    className={`p-4 rounded-2xl border transition-all relative ${
                      isUnread
                        ? 'bg-secondary/70 border-primary/30 shadow-sm'
                        : 'bg-card border-border opacity-85'
                    }`}
                  >
                    {/* Top Row */}
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        {notif.type === 'deadline' && (
                          <ClockAlert className="w-4 h-4 text-rose-500 flex-shrink-0" />
                        )}
                        {notif.type === 'ai_insight' && (
                          <Sparkles className="w-4 h-4 text-brand-500 flex-shrink-0" />
                        )}
                        {notif.type === 'sync' && (
                          <Radio className="w-4 h-4 text-sky-500 flex-shrink-0" />
                        )}
                        <span className="text-xs font-bold text-foreground leading-tight">
                          {notif.title}
                        </span>
                      </div>
                      {notif.source && <Badge variant="source" source={notif.source} />}
                    </div>

                    {/* Message Body */}
                    <p className="text-xs text-muted-foreground leading-relaxed pl-6 mb-2">
                      {notif.message}
                    </p>

                    {/* Timestamp & Source inspection */}
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground pl-6 mb-3">
                      <span>{new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {(notif.deadlineId || notif.taskId) && (
                        <button
                          onClick={() => handleInspect(notif)}
                          className="flex items-center gap-1 text-primary hover:underline"
                        >
                          <span>View source</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* Action Buttons with DISTINCT behavior */}
                    <div className="pt-2.5 border-t border-border flex items-center justify-end gap-1.5 pl-6">
                      {/* OK Button */}
                      <button
                        onClick={() => handleAction(notif.id, 'ok')}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-secondary hover:bg-muted text-foreground transition-colors"
                        title="Dismiss notification"
                      >
                        OK
                      </button>

                      {/* Already Done Button */}
                      {notif.actions.includes('already_done') && (
                        <button
                          onClick={() => handleAction(notif.id, 'already_done')}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1 transition-colors"
                          title="Marks the underlying assignment or task completed immediately!"
                        >
                          <Check className="w-3 h-3" />
                          <span>Already Done</span>
                        </button>
                      )}

                      {/* Remind Later Dropdown Trigger */}
                      {notif.actions.includes('remind_later') && (
                        <div className="relative">
                          <button
                            onClick={() =>
                              setSnoozeMenuForId(isSnoozeOpen ? null : notif.id)
                            }
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-secondary hover:bg-muted text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                            title="Snooze this reminder"
                          >
                            <Clock className="w-3 h-3" />
                            <span>Remind Later</span>
                            <ChevronDown className="w-3 h-3" />
                          </button>

                          {/* Snooze Options Menu */}
                          {isSnoozeOpen && (
                            <div className="absolute right-0 mt-1 w-44 rounded-xl bg-card border border-border shadow-xl p-1 z-30 animate-in fade-in text-xs">
                              <button
                                onClick={() => handleAction(notif.id, 'remind_later', 0.5)}
                                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-secondary text-foreground"
                              >
                                In 30 minutes
                              </button>
                              <button
                                onClick={() => handleAction(notif.id, 'remind_later', 2)}
                                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-secondary text-foreground font-semibold"
                              >
                                In 2 hours
                              </button>
                              <button
                                onClick={() => handleAction(notif.id, 'remind_later', 12)}
                                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-secondary text-foreground"
                              >
                                Tomorrow morning
                              </button>
                              <button
                                onClick={() => handleAction(notif.id, 'remind_later', 48)}
                                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-secondary text-foreground"
                              >
                                In 2 days
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
