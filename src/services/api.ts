import {
  Task,
  Deadline,
  CalendarEvent,
  Connector,
  NotificationItem,
  ExtractedEntitySummary,
  ChatMessage,
  ImportConfig,
  SyncStepProgress,
  UserProfile,
  NotificationActionType,
  ConnectorSource,
} from '../types';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Default clean connector schema (status disconnected, 0 counts)
const DEFAULT_CONNECTORS: Connector[] = [
  {
    id: 'conn-whatsapp',
    type: 'whatsapp',
    name: 'WhatsApp Business / Web',
    isPrimary: true,
    status: 'disconnected',
    lastSyncedAt: '',
    messageCount: 0,
    itemsExtracted: 0,
    accountIdentifier: '',
    syncFrequencyMinutes: 15,
    redactedAuthCodesCount: 0,
  },
  {
    id: 'conn-telegram',
    type: 'telegram',
    name: 'Telegram Desktop & Channels',
    isPrimary: false,
    status: 'disconnected',
    lastSyncedAt: '',
    messageCount: 0,
    itemsExtracted: 0,
    accountIdentifier: '',
    syncFrequencyMinutes: 30,
    redactedAuthCodesCount: 0,
  },
  {
    id: 'conn-gmail',
    type: 'gmail',
    name: 'Gmail Academic & Work',
    isPrimary: false,
    status: 'disconnected',
    lastSyncedAt: '',
    messageCount: 0,
    itemsExtracted: 0,
    accountIdentifier: '',
    syncFrequencyMinutes: 15,
    redactedAuthCodesCount: 0,
  },
];

/**
 * Safely purge legacy fabricated sample data from browser localStorage.
 * Preserves legitimate user preferences (theme, auth state).
 */
export function purgeLegacyMockData(): void {
  try {
    const keysToCheck = [
      'mindmesh_connectors',
      'mindmesh_tasks',
      'mindmesh_deadlines',
      'mindmesh_events',
      'mindmesh_notifications',
      'mindmesh_extracted',
      'mindmesh_user',
    ];

    for (const key of keysToCheck) {
      const stored = localStorage.getItem(key);
      if (stored) {
        // Identify signatures of legacy mock data
        if (
          stored.includes('dl-1') ||
          stored.includes('conn-whatsapp') ||
          stored.includes('Abubakar') ||
          stored.includes('a96711280') ||
          stored.includes('CS 451') ||
          stored.includes('Ramesh Rao')
        ) {
          localStorage.removeItem(key);
        }
      }
    }
  } catch (err) {
    console.warn('Could not inspect localStorage for legacy mock data:', err);
  }
}

// Run legacy purge on module initialization
purgeLegacyMockData();

// Storage helper for user-created local session data
const loadStorage = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(`mindmesh_${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
};

const saveStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(`mindmesh_${key}`, JSON.stringify(data));
  } catch (err) {
    console.error(`Failed to save ${key} to storage:`, err);
  }
};

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('mindmesh_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

class ApiService {
  private isOnlineBackend: boolean = false;
  private localTasks: Task[] = loadStorage('tasks', []);
  private localDeadlines: Deadline[] = loadStorage('deadlines', []);
  private localEvents: CalendarEvent[] = loadStorage('events', []);
  private localNotifications: NotificationItem[] = loadStorage('notifications', []);
  private localExtracted: ExtractedEntitySummary[] = loadStorage('extracted', []);
  private localUserProfile: UserProfile | null = loadStorage('user', null);

  constructor() {
    this.checkBackendHealth();
  }

  public async checkBackendHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(1800),
      });
      this.isOnlineBackend = res.ok;
      return res.ok;
    } catch {
      // Try root if /health is not implemented
      try {
        const rootRes = await fetch(`${API_BASE_URL}/`, {
          method: 'GET',
          signal: AbortSignal.timeout(1500),
        });
        this.isOnlineBackend = rootRes.ok;
        return rootRes.ok;
      } catch {
        this.isOnlineBackend = false;
        return false;
      }
    }
  }

  public getBackendStatus(): { isOnline: boolean; url: string } {
    return { isOnline: this.isOnlineBackend, url: API_BASE_URL };
  }

  // --- CONNECTORS ---
  public async getConnectors(): Promise<Connector[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/connectors`, {
        headers: getAuthHeaders(),
        signal: AbortSignal.timeout(3000),
      });
      if (res.ok) {
        this.isOnlineBackend = true;
        const data = await res.json();
        return Array.isArray(data) ? data : DEFAULT_CONNECTORS;
      }
    } catch {
      // Backend not reached
    }
    return [...DEFAULT_CONNECTORS];
  }

  public async syncConnector(
    id: string,
    onProgress?: (percent: number, message: string) => void
  ): Promise<Connector> {
    if (onProgress) onProgress(10, 'Requesting backend sync...');

    try {
      const res = await fetch(`${API_BASE_URL}/api/connectors/${id}/sync`, {
        method: 'POST',
        headers: getAuthHeaders(),
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `Backend sync failed with HTTP ${res.status}`);
      }

      const updated = await res.json();
      if (onProgress) onProgress(100, 'Sync completed.');
      return updated;
    } catch (err: any) {
      if (onProgress) onProgress(0, 'Sync failed: backend offline.');
      throw new Error(
        err.message || `Backend sync service unreachable at ${API_BASE_URL}`
      );
    }
  }

  public async reconnectConnector(id: string): Promise<Connector> {
    const res = await fetch(`${API_BASE_URL}/api/connectors/${id}/reconnect`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      throw new Error(`Failed to reconnect: backend returned status ${res.status}`);
    }
    return await res.json();
  }

  // --- TASKS ---
  public async getTasks(): Promise<Task[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/tasks`, {
        headers: getAuthHeaders(),
        signal: AbortSignal.timeout(3000),
      });
      if (res.ok) {
        this.isOnlineBackend = true;
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      }
    } catch {
      // Fallback to user-created local session tasks
    }
    return [...this.localTasks];
  }

  public async createTask(taskInput: Omit<Task, 'id' | 'createdAt'>): Promise<Task> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/tasks`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(taskInput),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Local session fallback
    }

    const newTask: Task = {
      ...taskInput,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.localTasks.unshift(newTask);
    saveStorage('tasks', this.localTasks);
    return newTask;
  }

  public async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Local session fallback
    }

    const idx = this.localTasks.findIndex((t) => t.id === id);
    if (idx !== -1) {
      if (updates.status === 'completed' && !this.localTasks[idx].completedAt) {
        updates.completedAt = new Date().toISOString();
      }
      this.localTasks[idx] = { ...this.localTasks[idx], ...updates };
      saveStorage('tasks', this.localTasks);
      return { ...this.localTasks[idx] };
    }
    throw new Error('Task not found');
  }

  public async deleteTask(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) return true;
    } catch {
      // Local session fallback
    }

    this.localTasks = this.localTasks.filter((t) => t.id !== id);
    saveStorage('tasks', this.localTasks);
    return true;
  }

  // --- DEADLINES ---
  public async getDeadlines(): Promise<Deadline[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/deadlines`, {
        headers: getAuthHeaders(),
        signal: AbortSignal.timeout(3000),
      });
      if (res.ok) {
        this.isOnlineBackend = true;
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      }
    } catch {
      // Fallback to local session
    }
    return [...this.localDeadlines];
  }

  public async createDeadline(deadlineInput: Omit<Deadline, 'id'>): Promise<Deadline> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/deadlines`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(deadlineInput),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Local session fallback
    }

    const newDeadline: Deadline = {
      ...deadlineInput,
      id: `dl-${Date.now()}`,
    };
    this.localDeadlines.unshift(newDeadline);
    saveStorage('deadlines', this.localDeadlines);
    return newDeadline;
  }

  public async completeDeadline(id: string): Promise<Deadline> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/deadlines/${id}/complete`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Local session fallback
    }

    const idx = this.localDeadlines.findIndex((d) => d.id === id);
    if (idx !== -1) {
      this.localDeadlines[idx] = {
        ...this.localDeadlines[idx],
        status: 'completed',
        completedAt: new Date().toISOString(),
      };
      saveStorage('deadlines', this.localDeadlines);
      return { ...this.localDeadlines[idx] };
    }
    throw new Error('Deadline not found');
  }

  public async extendDeadline(id: string, newDueDate: string): Promise<Deadline> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/deadlines/${id}/extend`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ due_date: newDueDate }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Local session fallback
    }

    const idx = this.localDeadlines.findIndex((d) => d.id === id);
    if (idx !== -1) {
      this.localDeadlines[idx] = {
        ...this.localDeadlines[idx],
        dueDate: newDueDate,
        status: 'upcoming',
      };
      saveStorage('deadlines', this.localDeadlines);
      return { ...this.localDeadlines[idx] };
    }
    throw new Error('Deadline not found');
  }

  // --- EVENTS ---
  public async getEvents(): Promise<CalendarEvent[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/events`, {
        headers: getAuthHeaders(),
        signal: AbortSignal.timeout(3000),
      });
      if (res.ok) {
        this.isOnlineBackend = true;
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      }
    } catch {
      // Local session fallback
    }
    return [...this.localEvents];
  }

  public async createEvent(eventInput: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/events`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(eventInput),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Local session fallback
    }

    const newEvent: CalendarEvent = {
      ...eventInput,
      id: `ev-${Date.now()}`,
    };
    this.localEvents.unshift(newEvent);
    saveStorage('events', this.localEvents);
    return newEvent;
  }

  public async updateEvent(id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/events/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Local session fallback
    }

    const idx = this.localEvents.findIndex((e) => e.id === id);
    if (idx !== -1) {
      this.localEvents[idx] = { ...this.localEvents[idx], ...updates };
      saveStorage('events', this.localEvents);
      return { ...this.localEvents[idx] };
    }
    throw new Error('Event not found');
  }

  public async deleteEvent(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/events/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) return true;
    } catch {
      // Local session fallback
    }

    this.localEvents = this.localEvents.filter((e) => e.id !== id);
    saveStorage('events', this.localEvents);
    return true;
  }

  // --- RECENTLY EXTRACTED ENTITIES ---
  public async getRecentlyExtracted(): Promise<ExtractedEntitySummary[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/extracted`, {
        headers: getAuthHeaders(),
        signal: AbortSignal.timeout(3000),
      });
      if (res.ok) {
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      }
    } catch {
      // Local session fallback
    }
    return [...this.localExtracted];
  }

  public async approveExtractedEntity(id: string): Promise<ExtractedEntitySummary> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/extracted/${id}/approve`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Local session fallback
    }

    const entity = this.localExtracted.find((e) => e.id === id);
    if (!entity) throw new Error('Entity not found');
    entity.approved = true;
    saveStorage('extracted', this.localExtracted);
    return { ...entity };
  }

  // --- NOTIFICATIONS ---
  public async getNotifications(): Promise<NotificationItem[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications`, {
        headers: getAuthHeaders(),
        signal: AbortSignal.timeout(3000),
      });
      if (res.ok) {
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      }
    } catch {
      // Local session fallback
    }
    return [...this.localNotifications];
  }

  public async markNotificationRead(id: string): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
    } catch {
      // Local session fallback
    }

    const notif = this.localNotifications.find((n) => n.id === id);
    if (notif) {
      notif.isRead = true;
      saveStorage('notifications', this.localNotifications);
    }
  }

  public async markAllNotificationsRead(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/api/notifications/read-all`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
    } catch {
      // Local session fallback
    }

    this.localNotifications.forEach((n) => (n.isRead = true));
    saveStorage('notifications', this.localNotifications);
  }

  public async handleNotificationAction(
    id: string,
    action: NotificationActionType,
    snoozeHours: number = 2
  ): Promise<{ success: boolean; message: string; completedItemId?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications/${id}/action`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action, snooze_hours: snoozeHours }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Local session fallback
    }

    const notifIndex = this.localNotifications.findIndex((n) => n.id === id);
    if (notifIndex === -1) {
      return { success: true, message: `Action "${action}" processed.` };
    }
    const notif = this.localNotifications[notifIndex];

    if (action === 'ok') {
      notif.isRead = true;
      saveStorage('notifications', this.localNotifications);
      return { success: true, message: 'Notification acknowledged.' };
    }

    if (action === 'already_done') {
      let completedId: string | undefined = undefined;
      if (notif.deadlineId) {
        await this.completeDeadline(notif.deadlineId);
        completedId = notif.deadlineId;
      } else if (notif.taskId) {
        await this.updateTask(notif.taskId, { status: 'completed' });
        completedId = notif.taskId;
      }
      notif.isRead = true;
      saveStorage('notifications', this.localNotifications);
      return {
        success: true,
        message: 'Marked as completed.',
        completedItemId: completedId,
      };
    }

    if (action === 'remind_later') {
      const snoozeDate = new Date(Date.now() + snoozeHours * 60 * 60 * 1000).toISOString();
      notif.snoozedUntil = snoozeDate;
      notif.isRead = true;
      saveStorage('notifications', this.localNotifications);
      return {
        success: true,
        message: `Reminder snoozed for ${snoozeHours} hour(s).`,
      };
    }

    return { success: false, message: 'Unknown action' };
  }

  // --- CHAT WITH BACKEND RAG AGENT ---
  /**
   * Real backend RAG chatbot integration.
   * Sends user query, conversation ID, and connector filter to FastAPI / RAG backend.
   * If backend is not connected, does NOT return fake canned answers.
   */
  public async sendChatMessage(
    userText: string,
    conversationId?: string,
    sourceFilter: ConnectorSource | 'all' = 'all'
  ): Promise<ChatMessage> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          message: userText,
          conversation_id: conversationId,
          source_filter: sourceFilter,
        }),
        signal: AbortSignal.timeout(20000),
      });

      if (res.ok) {
        this.isOnlineBackend = true;
        const data = await res.json();
        return {
          id: data.id || `msg-${Date.now()}`,
          sender: 'assistant',
          text: data.text || data.message || data.response || '',
          timestamp: data.timestamp || new Date().toISOString(),
          structuredTasks: data.structuredTasks || data.tasks,
          structuredDeadlines: data.structuredDeadlines || data.deadlines,
          structuredEvents: data.structuredEvents || data.events,
          citations: data.citations,
        };
      } else {
        const errorDetail = await res.json().catch(() => ({}));
        throw new Error(
          errorDetail.detail || `Backend returned status ${res.status} (${res.statusText})`
        );
      }
    } catch (err: any) {
      // Backend is not connected or endpoint failed
      this.isOnlineBackend = false;
      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: `⚠️ **AI Backend Disconnected**\n\nUnable to reach the MindMeshAI FastAPI/RAG service at \`${API_BASE_URL}\`.\n\n*Error:* ${
          err.message || 'Connection refused'
        }\n\nPlease start your backend server or set \`VITE_API_URL\` to connect your live message index and RAG pipeline.`,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // --- INITIAL MESSAGE IMPORT WORKFLOW ---
  public async executeInitialImport(
    config: ImportConfig,
    onProgress: (step: SyncStepProgress) => void
  ): Promise<{ totalImported: number; totalDeadlines: number; totalTasks: number }> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/import/initial`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          period: config.period,
          custom_start_date: config.customStartDate,
          custom_end_date: config.customEndDate,
          connectors: config.connectors,
        }),
        signal: AbortSignal.timeout(30000),
      });

      if (res.ok) {
        this.isOnlineBackend = true;
        const result = await res.json();
        localStorage.setItem('mindmesh_onboarding_completed', 'true');
        return {
          totalImported: result.total_imported ?? 0,
          totalDeadlines: result.total_deadlines ?? 0,
          totalTasks: result.total_tasks ?? 0,
        };
      } else {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || `Import failed with status ${res.status}`);
      }
    } catch (err: any) {
      this.isOnlineBackend = false;
      throw new Error(
        `Backend import service is offline at ${API_BASE_URL}. Start your FastAPI backend to initiate message ingestion.`
      );
    }
  }

  // --- USER PROFILE & PREFERENCES ---
  public async getUserProfile(): Promise<UserProfile | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/profile`, {
        headers: getAuthHeaders(),
        signal: AbortSignal.timeout(3000),
      });
      if (res.ok) {
        this.isOnlineBackend = true;
        const profile = await res.json();
        this.localUserProfile = profile;
        saveStorage('user', profile);
        return profile;
      }
    } catch {
      // Local session fallback
    }
    return this.localUserProfile;
  }

  public async updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/profile`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const updated = await res.json();
        this.localUserProfile = updated;
        saveStorage('user', updated);
        return updated;
      }
    } catch {
      // Local session fallback
    }

    this.localUserProfile = {
      name: updates.name || this.localUserProfile?.name || 'User',
      email: updates.email || this.localUserProfile?.email || '',
      avatarUrl: updates.avatarUrl || this.localUserProfile?.avatarUrl || '',
      role: updates.role || this.localUserProfile?.role || 'Productivity User',
      department: updates.department || this.localUserProfile?.department || 'Workspace',
      pushNotificationsEnabled: updates.pushNotificationsEnabled ?? true,
      autoRedactSensitiveData: updates.autoRedactSensitiveData ?? true,
      skipAuthCodes: updates.skipAuthCodes ?? true,
      morningDigestTime: updates.morningDigestTime || '08:30 AM',
    };
    saveStorage('user', this.localUserProfile);
    return { ...this.localUserProfile };
  }
}

export const api = new ApiService();
