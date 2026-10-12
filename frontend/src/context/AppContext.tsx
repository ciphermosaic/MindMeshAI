import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  Task,
  Deadline,
  CalendarEvent,
  Connector,
  NotificationItem,
  ExtractedEntitySummary,
  UserProfile,
  SourceMetadata,
  NotificationActionType,
} from '../types';
import { api } from '../services/api';
import { registerPushServiceWorker } from '../services/pushNotification';

export type NavigationTab =
  | 'dashboard'
  | 'chat'
  | 'calendar'
  | 'events'
  | 'deadlines'
  | 'tasks'
  | 'connectors'
  | 'notifications'
  | 'settings';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
}

interface AppContextType {
  currentTab: NavigationTab;
  setCurrentTab: (tab: NavigationTab) => void;

  tasks: Task[];
  deadlines: Deadline[];
  events: CalendarEvent[];
  connectors: Connector[];
  notifications: NotificationItem[];
  extracted: ExtractedEntitySummary[];
  userProfile: UserProfile | null;

  loading: boolean;
  unreadCount: number;
  syncingConnectors: Record<string, boolean>;

  // Modals & Panels
  isFirstLoginImportOpen: boolean;
  setIsFirstLoginImportOpen: (open: boolean) => void;
  isFloatingChatOpen: boolean;
  setIsFloatingChatOpen: (open: boolean) => void;
  isNotificationDrawerOpen: boolean;
  setIsNotificationDrawerOpen: (open: boolean) => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;

  // Source inspection
  inspectingSource: SourceMetadata | null;
  setInspectingSource: (source: SourceMetadata | null) => void;

  // Toasts
  toasts: ToastItem[];
  showToast: (title: string, description?: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  // Actions
  refreshAll: () => Promise<void>;
  syncConnectorById: (id: string) => Promise<void>;
  handleNotificationAction: (id: string, action: NotificationActionType, snoozeHours?: number) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  createTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  createDeadline: (deadline: Omit<Deadline, 'id'>) => Promise<Deadline>;
  completeDeadline: (id: string) => Promise<void>;
  createEvent: (event: Omit<CalendarEvent, 'id'>) => Promise<CalendarEvent>;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => Promise<CalendarEvent>;
  deleteEvent: (id: string) => Promise<void>;
  approveExtractedEntity: (id: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');

  const [tasks, setTasks] = useState<Task[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [extracted, setExtracted] = useState<ExtractedEntitySummary[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [syncingConnectors, setSyncingConnectors] = useState<Record<string, boolean>>({});

  // UI States
  const [isFirstLoginImportOpen, setIsFirstLoginImportOpen] = useState<boolean>(false);
  const [isFloatingChatOpen, setIsFloatingChatOpen] = useState<boolean>(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [inspectingSource, setInspectingSource] = useState<SourceMetadata | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((title: string, description?: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const refreshAll = useCallback(async () => {
    try {
      const [allTasks, allDeadlines, allEvents, allConnectors, allNotifs, allExtracted, profile] =
        await Promise.all([
          api.getTasks(),
          api.getDeadlines(),
          api.getEvents(),
          api.getConnectors(),
          api.getNotifications(),
          api.getRecentlyExtracted(),
          api.getUserProfile(),
        ]);

      setTasks(allTasks);
      setDeadlines(allDeadlines);
      setEvents(allEvents);
      setConnectors(allConnectors);
      setNotifications(allNotifs);
      setExtracted(allExtracted);
      setUserProfile(profile);
    } catch (err) {
      console.error('Failed to load MindMesh data:', err);
      showToast('Error loading data', 'Could not refresh MindMesh platform data', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Initial Boot
  useEffect(() => {
    refreshAll();
    registerPushServiceWorker();

    // Check if first-login onboarding modal is needed
    const onboardingDone = localStorage.getItem('mindmesh_onboarding_completed');
    if (!onboardingDone) {
      setIsFirstLoginImportOpen(true);
    }

    // Keyboard shortcuts (Cmd+K / Ctrl+K)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [refreshAll]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const syncConnectorById = async (id: string) => {
    setSyncingConnectors((prev) => ({ ...prev, [id]: true }));
    try {
      const updated = await api.syncConnector(id);
      setConnectors((prev) => prev.map((c) => (c.id === id ? updated : c)));
      showToast(`${updated.name} Synced`, 'Latest messages and delta checkpoints synchronized successfully.');
      await refreshAll();
    } catch (err: any) {
      showToast('Sync Failed', err?.message || 'Error syncing connector', 'error');
    } finally {
      setSyncingConnectors((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleNotificationAction = async (
    id: string,
    action: NotificationActionType,
    snoozeHours: number = 2
  ) => {
    try {
      const result = await api.handleNotificationAction(id, action, snoozeHours);
      if (result.success) {
        showToast(
          action === 'already_done'
            ? 'Completed!'
            : action === 'remind_later'
            ? 'Reminder Snoozed'
            : 'Dismissed',
          result.message,
          'success'
        );
        await refreshAll();
      }
    } catch (err: any) {
      showToast('Action Failed', err?.message || 'Could not process notification action', 'error');
    }
  };

  const markAllNotificationsRead = async () => {
    await api.markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    showToast('All notifications marked read');
  };

  const createTask = async (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const created = await api.createTask(taskData);
    setTasks((prev) => [created, ...prev]);
    showToast('Task Created', created.title);
    return created;
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const updated = await api.updateTask(id, updates);
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    showToast('Task Updated', updated.title);
    return updated;
  };

  const deleteTask = async (id: string) => {
    await api.deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    showToast('Task Deleted');
  };

  const createDeadline = async (deadlineData: Omit<Deadline, 'id'>) => {
    const created = await api.createDeadline(deadlineData);
    setDeadlines((prev) => [created, ...prev]);
    showToast('Deadline Added', created.title);
    return created;
  };

  const completeDeadline = async (id: string) => {
    const completed = await api.completeDeadline(id);
    setDeadlines((prev) => prev.map((d) => (d.id === id ? completed : d)));
    showToast('Deadline Completed!', completed.title);
  };

  const createEvent = async (eventData: Omit<CalendarEvent, 'id'>) => {
    const created = await api.createEvent(eventData);
    setEvents((prev) => [created, ...prev]);
    showToast('Event Added', created.title);
    return created;
  };

  const updateEvent = async (id: string, updates: Partial<CalendarEvent>) => {
    const updated = await api.updateEvent(id, updates);
    setEvents((prev) => prev.map((e) => (e.id === id ? updated : e)));
    showToast('Event Updated', updated.title);
    return updated;
  };

  const deleteEvent = async (id: string) => {
    await api.deleteEvent(id);
    setEvents((prev) => prev.filter((e) => e.id !== id));
    showToast('Event Removed');
  };

  const approveExtractedEntity = async (id: string) => {
    const approved = await api.approveExtractedEntity(id);
    setExtracted((prev) => prev.map((e) => (e.id === id ? approved : e)));
    showToast('Assignment Approved', 'Added automatically to your active Tasks & Deadlines.');
    await refreshAll();
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    const updated = await api.updateUserProfile(updates);
    setUserProfile(updated);
    showToast('Settings Saved', 'Profile preferences updated successfully.');
  };

  return (
    <AppContext.Provider
      value={{
        currentTab,
        setCurrentTab,
        tasks,
        deadlines,
        events,
        connectors,
        notifications,
        extracted,
        userProfile,
        loading,
        unreadCount,
        syncingConnectors,
        isFirstLoginImportOpen,
        setIsFirstLoginImportOpen,
        isFloatingChatOpen,
        setIsFloatingChatOpen,
        isNotificationDrawerOpen,
        setIsNotificationDrawerOpen,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        inspectingSource,
        setInspectingSource,
        toasts,
        showToast,
        removeToast,
        refreshAll,
        syncConnectorById,
        handleNotificationAction,
        markAllNotificationsRead,
        createTask,
        updateTask,
        deleteTask,
        createDeadline,
        completeDeadline,
        createEvent,
        updateEvent,
        deleteEvent,
        approveExtractedEntity,
        updateProfile,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
