import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  ClockAlert,
  Sparkles,
  Radio,
  Check,
  Clock,
  ChevronDown,
  ExternalLink,
  Volume2,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import { NotificationItem, NotificationActionType } from '../types';
import { requestNotificationPermission, showBrowserNotification } from '../services/pushNotification';

export const NotificationsPage: React.FC = () => {
  const {
    notifications,
    unreadCount,
    handleNotificationAction,
    markAllNotificationsRead,
    setInspectingSource,
    deadlines,
    tasks,
    showToast,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'deadline' | 'ai_insight' | 'sync'>('all');
  const [snoozeMenuForId, setSnoozeMenuForId] = useState<string | null>(null);

  const filteredNotifs = notifications.filter((n) => {
    if (activeFilter === 'all') return true;
    return n.type === activeFilter;
  });

  const handleAction = async (id: string, action: NotificationActionType, snoozeHours: number = 2) => {
    setSnoozeMenuForId(null);
    await handleNotificationAction(id, action, snoozeHours);
  };

  const handleTestBrowserPush = async () => {
    const permission = await requestNotificationPermission();
    if (permission === 'granted') {
      await showBrowserNotification('MindMeshAI Push Alert', {
        body: 'MindMesh notification system test: Sync channels active and verified.',
      });
      showToast('Push Notification Sent', 'Check your OS / browser system notifications!');
    } else {
      showToast('Permission Needed', 'Browser push notifications were blocked or dismissed', 'info');
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-card border border-border shadow-subtle">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-foreground">Notifications & Alerts</h2>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500 text-white font-mono">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Smart reminders extracted across WhatsApp, Telegram, and Gmail
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleTestBrowserPush}
            className="px-3.5 py-2 rounded-xl bg-secondary hover:bg-muted text-foreground text-xs font-semibold border border-border flex items-center gap-1.5 transition-colors"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Test Browser Push</span>
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllNotificationsRead}
              className="px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-sm transition-colors"
            >
              Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center p-1 rounded-2xl bg-card border border-border text-xs w-fit">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
            activeFilter === 'all'
              ? 'bg-secondary text-foreground font-bold shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          All Alerts ({notifications.length})
        </button>
        <button
          onClick={() => setActiveFilter('deadline')}
          className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
            activeFilter === 'deadline'
              ? 'bg-secondary text-foreground font-bold shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Deadlines
        </button>
        <button
          onClick={() => setActiveFilter('ai_insight')}
          className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
            activeFilter === 'ai_insight'
              ? 'bg-secondary text-foreground font-bold shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          AI Highlights
        </button>
        <button
          onClick={() => setActiveFilter('sync')}
          className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
            activeFilter === 'sync'
              ? 'bg-secondary text-foreground font-bold shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Continuous Sync
        </button>
      </div>

      {/* Notifications List with Distinct Actions */}
      <div className="space-y-3">
        {filteredNotifs.length === 0 ? (
          <div className="text-center py-16 p-8 border border-dashed border-border rounded-3xl bg-card/40 text-muted-foreground">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500 opacity-70" />
            <p className="text-xs font-semibold text-foreground">All caught up!</p>
            <p className="text-[11px] mt-0.5">No notifications pending for this filter.</p>
          </div>
        ) : (
          filteredNotifs.map((notif) => {
            const isUnread = !notif.isRead;
            const isSnoozeOpen = snoozeMenuForId === notif.id;

            return (
              <div
                key={notif.id}
                className={`p-5 rounded-3xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isUnread
                    ? 'bg-secondary/60 border-primary/30 shadow-subtle'
                    : 'bg-card border-border opacity-80'
                }`}
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {notif.type === 'deadline' && (
                      <ClockAlert className="w-4 h-4 text-rose-500 flex-shrink-0" />
                    )}
                    {notif.type === 'ai_insight' && (
                      <Sparkles className="w-4 h-4 text-brand-500 flex-shrink-0" />
                    )}
                    {notif.type === 'sync' && (
                      <Radio className="w-4 h-4 text-sky-500 flex-shrink-0" />
                    )}

                    <h3 className="text-xs font-bold text-foreground leading-snug">
                      {notif.title}
                    </h3>

                    {notif.source && <Badge variant="source" source={notif.source} />}
                    <Badge variant="priority" priority={notif.priority} />
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed pl-6">
                    {notif.message}
                  </p>

                  <div className="text-[10px] text-muted-foreground font-mono pl-6">
                    Received {new Date(notif.timestamp).toLocaleString()}
                  </div>
                </div>

                {/* Distinct Action Buttons: OK, Already Done, Remind Later */}
                <div className="flex items-center gap-2 self-end md:self-center">
                  {/* OK */}
                  <button
                    onClick={() => handleAction(notif.id, 'ok')}
                    className="px-3 py-1.5 rounded-xl bg-card hover:bg-secondary text-foreground text-xs font-semibold border border-border transition-colors"
                    title="Dismiss alert"
                  >
                    OK
                  </button>

                  {/* Already Done */}
                  {notif.actions.includes('already_done') && (
                    <button
                      onClick={() => handleAction(notif.id, 'already_done')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1 transition-colors"
                      title="Marks the item complete immediately"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Already Done</span>
                    </button>
                  )}

                  {/* Remind Later */}
                  {notif.actions.includes('remind_later') && (
                    <div className="relative">
                      <button
                        onClick={() =>
                          setSnoozeMenuForId(isSnoozeOpen ? null : notif.id)
                        }
                        className="px-3 py-1.5 rounded-xl bg-card hover:bg-secondary text-muted-foreground hover:text-foreground text-xs font-semibold border border-border flex items-center gap-1 transition-colors"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Remind Later</span>
                        <ChevronDown className="w-3 h-3" />
                      </button>

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
  );
};
