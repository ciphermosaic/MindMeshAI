export type ConnectorSource = 'whatsapp' | 'telegram' | 'gmail' | 'manual';

export type TaskStatus = 'todo' | 'in_progress' | 'completed';
export type PriorityLevel = 'urgent' | 'high' | 'medium' | 'low';
export type DeadlineStatus = 'upcoming' | 'overdue' | 'completed';
export type EventCategory = 'academic' | 'exam' | 'meeting' | 'social' | 'webinar' | 'deadline';

export interface SourceMetadata {
  platform: ConnectorSource;
  account: string;
  sender: string;
  conversationName?: string;
  timestamp: string;
  rawSnippet: string;
  confidenceScore: number; // 0 to 1.0
  messageId?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: PriorityLevel;
  dueDate: string; // ISO date
  category: string; // e.g. "Computer Networks", "Internship Application"
  source: ConnectorSource;
  sourceMetadata?: SourceMetadata;
  tags: string[];
  createdAt: string;
  completedAt?: string;
}

export interface Deadline {
  id: string;
  title: string;
  courseOrProject: string;
  dueDate: string; // ISO date
  priority: PriorityLevel;
  status: DeadlineStatus;
  source: ConnectorSource;
  sourceMetadata?: SourceMetadata;
  completedAt?: string;
  weightage?: string; // e.g. "30% of Final Grade"
  remindMeBeforeHours?: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  startDate: string; // ISO
  endDate: string; // ISO
  location?: string;
  isOnline: boolean;
  meetingLink?: string;
  source: ConnectorSource;
  sourceMetadata?: SourceMetadata;
  attendees?: string[];
  isAllDay?: boolean;
}

export interface Connector {
  id: string;
  type: ConnectorSource;
  name: string;
  isPrimary: boolean;
  status: 'connected' | 'syncing' | 'error' | 'disconnected';
  lastSyncedAt: string;
  messageCount: number;
  itemsExtracted: number;
  errorMessage?: string;
  accountIdentifier: string; // e.g. "+91 98765 43210" or "user@gmail.com"
  syncFrequencyMinutes: number;
  redactedAuthCodesCount: number;
}

export type NotificationActionType = 'ok' | 'already_done' | 'remind_later';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'deadline' | 'sync' | 'task' | 'ai_insight';
  priority: PriorityLevel;
  timestamp: string;
  isRead: boolean;
  deadlineId?: string;
  taskId?: string;
  source?: ConnectorSource;
  actions: NotificationActionType[];
  snoozedUntil?: string;
}

export interface ExtractedEntitySummary {
  id: string;
  type: 'assignment' | 'exam' | 'deadline' | 'meeting' | 'announcement';
  title: string;
  dateOrDeadline: string;
  source: ConnectorSource;
  sender: string;
  confidence: number;
  snippet: string;
  approved: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  structuredTasks?: Partial<Task>[];
  structuredDeadlines?: Partial<Deadline>[];
  structuredEvents?: Partial<CalendarEvent>[];
  citations?: {
    platform: ConnectorSource;
    sender: string;
    conversation: string;
    time: string;
    snippet: string;
  }[];
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export type ImportPeriod = '24h' | '2d' | '7d' | '30d' | 'custom';

export interface ImportConfig {
  period: ImportPeriod;
  customStartDate?: string;
  customEndDate?: string;
  connectors: ConnectorSource[];
}

export interface SyncStepProgress {
  connector: ConnectorSource;
  status: 'pending' | 'scanning' | 'extracting' | 'completed' | 'failed';
  messagesProcessed: number;
  entitiesFound: number;
  progressPercent: number;
  error?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl: string;
  role: string;
  department: string;
  pushNotificationsEnabled: boolean;
  autoRedactSensitiveData: boolean;
  skipAuthCodes: boolean;
  morningDigestTime: string;
}
