import {
  Task,
  Deadline,
  CalendarEvent,
  Connector,
  NotificationItem,
  ExtractedEntitySummary,
  ChatMessage,
  ChatSession,
  ImportConfig,
  SyncStepProgress,
  UserProfile,
  NotificationActionType,
  ConnectorSource,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Mock initial data based on real-world student/engineer workflows
const INITIAL_CONNECTORS: Connector[] = [
  {
    id: 'conn-whatsapp',
    type: 'whatsapp',
    name: 'WhatsApp Business / Web',
    isPrimary: true,
    status: 'connected',
    lastSyncedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(), // 12 mins ago
    messageCount: 1420,
    itemsExtracted: 38,
    accountIdentifier: '+91 98765 43210',
    syncFrequencyMinutes: 15,
    redactedAuthCodesCount: 19,
  },
  {
    id: 'conn-telegram',
    type: 'telegram',
    name: 'Telegram Desktop & Channels',
    isPrimary: false,
    status: 'connected',
    lastSyncedAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(), // 35 mins ago
    messageCount: 890,
    itemsExtracted: 24,
    accountIdentifier: '@abubakar_dev',
    syncFrequencyMinutes: 30,
    redactedAuthCodesCount: 8,
  },
  {
    id: 'conn-gmail',
    type: 'gmail',
    name: 'Gmail Academic & Work',
    isPrimary: false,
    status: 'connected',
    lastSyncedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
    messageCount: 2315,
    itemsExtracted: 62,
    accountIdentifier: 'a96711280@gmail.com',
    syncFrequencyMinutes: 15,
    redactedAuthCodesCount: 42,
  },
];

const INITIAL_DEADLINES: Deadline[] = [
  {
    id: 'dl-1',
    title: 'Distributed Systems Project Phase 2 Submission',
    courseOrProject: 'CS 451: Distributed Systems',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 36).toISOString(), // in 1.5 days
    priority: 'urgent',
    status: 'upcoming',
    source: 'gmail',
    weightage: '25% of Grade',
    remindMeBeforeHours: 24,
    sourceMetadata: {
      platform: 'gmail',
      account: 'a96711280@gmail.com',
      sender: 'Prof. Ramesh Rao <rrao@univ.edu>',
      conversationName: '[CS451] Project Phase 2 Guidelines & Submission Portal',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
      rawSnippet: 'Dear class, please ensure your Raft consensus implementation and test benchmarks are pushed to GitHub Classroom by Tuesday 11:59 PM. Late penalties apply.',
      confidenceScore: 0.98,
      messageId: 'gm_cs451_phase2',
    },
  },
  {
    id: 'dl-2',
    title: 'Machine Learning Lab 4: Transformer Attention Mechanism',
    courseOrProject: 'CS 503: Deep Learning & NLP',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 84).toISOString(), // in 3.5 days
    priority: 'high',
    status: 'upcoming',
    source: 'telegram',
    weightage: '15% of Grade',
    remindMeBeforeHours: 12,
    sourceMetadata: {
      platform: 'telegram',
      account: '@abubakar_dev',
      sender: 'TA Ananya (DL Lab Coordinator)',
      conversationName: 'CS503 Lab Group 2026',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
      rawSnippet: 'Lab 4 notebooks have been updated on Drive. Deadline for submission is Friday 5:00 PM. Include your multi-head attention ablation plots.',
      confidenceScore: 0.94,
      messageId: 'tg_dl_lab4',
    },
  },
  {
    id: 'dl-3',
    title: 'Qualcomm Interim Engineering Intern Application Form',
    courseOrProject: 'Career & Placements',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 110).toISOString(), // in ~4.5 days
    priority: 'high',
    status: 'upcoming',
    source: 'gmail',
    weightage: 'Internship 2027',
    remindMeBeforeHours: 48,
    sourceMetadata: {
      platform: 'gmail',
      account: 'a96711280@gmail.com',
      sender: 'LinkedIn Job Alerts <jobalerts-noreply@linkedin.com>',
      conversationName: 'Update: Your application for Interim Engineering Intern_2027_SW at Qualcomm',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      rawSnippet: 'Please complete your candidate background survey and coding profile details before the registration window closes this weekend.',
      confidenceScore: 0.91,
      messageId: 'gm_qualcomm_intern',
    },
  },
  {
    id: 'dl-4',
    title: 'Cloud Computing Architecture Peer Review',
    courseOrProject: 'CS 480: Cloud Infra',
    dueDate: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(), // Overdue by 10 hrs
    priority: 'urgent',
    status: 'overdue',
    source: 'whatsapp',
    weightage: '10% of Grade',
    remindMeBeforeHours: 6,
    sourceMetadata: {
      platform: 'whatsapp',
      account: '+91 98765 43210',
      sender: 'Siddharth (Project Partner)',
      conversationName: 'Cloud Arch Team 4',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
      rawSnippet: 'Bro did you review the Terraform script PR? The deadline was this morning 10 AM, prof said we can submit with a 5% grace window till tonight.',
      confidenceScore: 0.95,
      messageId: 'wa_cloud_peer_review',
    },
  },
  {
    id: 'dl-5',
    title: 'L’Oréal India Internship Profile Verification',
    courseOrProject: 'Internships',
    dueDate: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    priority: 'medium',
    status: 'completed',
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    source: 'gmail',
    sourceMetadata: {
      platform: 'gmail',
      account: 'a96711280@gmail.com',
      sender: 'Internshala <notifications@internshala.com>',
      conversationName: 'Update: Your application for L’Oréal India | Complete your details today.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      rawSnippet: 'Profile details submitted and verified successfully.',
      confidenceScore: 0.89,
    },
  },
];

const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Implement Raft log replication leader heartbeat in Go',
    description: 'Ensure leader election timeout triggers correctly and append entries handles split-brain scenario.',
    status: 'in_progress',
    priority: 'urgent',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    category: 'CS 451 Distributed Systems',
    source: 'gmail',
    tags: ['Coding', 'Go', 'Systems'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    sourceMetadata: {
      platform: 'gmail',
      account: 'a96711280@gmail.com',
      sender: 'Prof. Ramesh Rao',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
      rawSnippet: 'Make sure your heartbeat interval is <= 150ms to prevent spurious elections.',
      confidenceScore: 0.96,
    },
  },
  {
    id: 'task-2',
    title: 'Review multi-head attention weights tensor math',
    description: 'Derive scaled dot-product formula and verify QKV projection dimensions for Lab 4.',
    status: 'todo',
    priority: 'high',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
    category: 'CS 503 Deep Learning',
    source: 'telegram',
    tags: ['Math', 'PyTorch', 'NLP'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    sourceMetadata: {
      platform: 'telegram',
      account: '@abubakar_dev',
      sender: 'CS503 TA Channel',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      rawSnippet: 'Review Section 3.2 of Attention Is All You Need before attempting task 2.',
      confidenceScore: 0.92,
    },
  },
  {
    id: 'task-3',
    title: 'Update LinkedIn & Resume with Agentic AI & RAG projects',
    description: 'Add MindMeshAI system architecture, LangChain/LlamaIndex benchmarks, and Telethon connector highlights.',
    status: 'in_progress',
    priority: 'medium',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString(),
    category: 'Career & Portfolio',
    source: 'manual',
    tags: ['Career', 'Resume'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString(),
  },
  {
    id: 'task-4',
    title: 'Coordinate team meeting for Final Capstone pitch deck',
    description: 'WhatsApp group vote showed Tuesday 4:00 PM works best for all 4 team members.',
    status: 'todo',
    priority: 'medium',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 20).toISOString(),
    category: 'Capstone Project',
    source: 'whatsapp',
    tags: ['Team', 'Meeting'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    sourceMetadata: {
      platform: 'whatsapp',
      account: '+91 98765 43210',
      sender: 'Varun (Team Lead)',
      conversationName: 'Capstone Project Alpha',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
      rawSnippet: 'Let us fix 4 PM Tuesday in Library Discussion Room 3 to finish the slides.',
      confidenceScore: 0.97,
    },
  },
  {
    id: 'task-5',
    title: 'Submit L’Oréal India profile verification',
    description: 'Provide education transcripts and internship preferences on portal.',
    status: 'completed',
    priority: 'medium',
    dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    category: 'Internships',
    source: 'gmail',
    tags: ['Application'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 60).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
];

const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: 'ev-1',
    title: 'Capstone Project Slide Review & Rehearsal',
    description: 'Dry run presentation with slides before submission.',
    category: 'meeting',
    startDate: new Date(Date.now() + 1000 * 60 * 60 * 18).toISOString(),
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 19.5).toISOString(),
    location: 'Campus Library Discussion Room 3',
    isOnline: false,
    source: 'whatsapp',
    attendees: ['Varun', 'Siddharth', 'Abubakar', 'Neha'],
    sourceMetadata: {
      platform: 'whatsapp',
      account: '+91 98765 43210',
      sender: 'Varun',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      rawSnippet: 'Meet room booked for 4 PM - 5:30 PM tomorrow.',
      confidenceScore: 0.96,
    },
  },
  {
    id: 'ev-2',
    title: 'Deep Learning Mid-Semester Assessment Exam',
    description: 'Covers CNNs, RNNs, Attention, Transformers, and Self-Supervised Learning.',
    category: 'exam',
    startDate: new Date(Date.now() + 1000 * 60 * 60 * 140).toISOString(),
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 143).toISOString(),
    location: 'Exam Hall B, CS Block',
    isOnline: false,
    source: 'gmail',
    attendees: ['Class 2026 CS Batch'],
    sourceMetadata: {
      platform: 'gmail',
      account: 'a96711280@gmail.com',
      sender: 'Academic Controller Office',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
      rawSnippet: 'Mid semester examination date sheet released. CS503 scheduled next Monday 10:00 AM to 1:00 PM.',
      confidenceScore: 0.99,
    },
  },
  {
    id: 'ev-3',
    title: 'Google Cloud Student Innovators Webinar',
    description: 'Keynote on Generative AI agent deployments on Vertex AI and Cloud Run.',
    category: 'webinar',
    startDate: new Date(Date.now() + 1000 * 60 * 60 * 65).toISOString(),
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 67).toISOString(),
    location: 'Google Meet',
    isOnline: true,
    meetingLink: 'https://meet.google.com/xyz-mind-mesh',
    source: 'gmail',
    attendees: ['Registered Students'],
  },
  {
    id: 'ev-4',
    title: 'Telegram AI Paper Club Discussion: DeepSeek V3',
    description: 'Weekly breakdown of open-weight mixture-of-experts training tricks.',
    category: 'academic',
    startDate: new Date(Date.now() + 1000 * 60 * 60 * 90).toISOString(),
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 91.5).toISOString(),
    location: 'Telegram Voice Chat',
    isOnline: true,
    meetingLink: 'https://t.me/aipaperclub',
    source: 'telegram',
  },
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Urgent Deadline: Distributed Systems Phase 2',
    message: 'Due in less than 36 hours. Raft log replication guidelines extracted from Gmail.',
    type: 'deadline',
    priority: 'urgent',
    timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    isRead: false,
    deadlineId: 'dl-1',
    source: 'gmail',
    actions: ['ok', 'already_done', 'remind_later'],
  },
  {
    id: 'notif-2',
    title: 'Overdue Notice: Cloud Architecture Peer Review',
    message: 'Was due 10 hours ago according to Siddharth in WhatsApp group.',
    type: 'deadline',
    priority: 'urgent',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    isRead: false,
    deadlineId: 'dl-4',
    source: 'whatsapp',
    actions: ['ok', 'already_done', 'remind_later'],
  },
  {
    id: 'notif-3',
    title: 'New WhatsApp Meeting Extracted',
    message: 'Capstone Project Review scheduled for tomorrow 4:00 PM in Library Room 3.',
    type: 'ai_insight',
    priority: 'medium',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    isRead: false,
    source: 'whatsapp',
    actions: ['ok', 'remind_later'],
  },
  {
    id: 'notif-4',
    title: 'Sync Checkpoint Passed',
    message: 'Gmail & Telegram continuous sync checked. 3 sensitive verification codes redacted.',
    type: 'sync',
    priority: 'low',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    isRead: true,
    actions: ['ok'],
  },
];

const INITIAL_EXTRACTED: ExtractedEntitySummary[] = [
  {
    id: 'ext-1',
    type: 'assignment',
    title: 'Distributed Systems Project Phase 2',
    dateOrDeadline: new Date(Date.now() + 1000 * 60 * 60 * 36).toISOString(),
    source: 'gmail',
    sender: 'Prof. Ramesh Rao',
    confidence: 0.98,
    snippet: 'Submission portal opens tomorrow. Push implementation by Tuesday 11:59 PM.',
    approved: true,
  },
  {
    id: 'ext-2',
    type: 'meeting',
    title: 'Capstone Slide Review Rehearsal',
    dateOrDeadline: new Date(Date.now() + 1000 * 60 * 60 * 18).toISOString(),
    source: 'whatsapp',
    sender: 'Varun (Team Lead)',
    confidence: 0.96,
    snippet: 'Let us meet in Library Discussion Room 3 at 4:00 PM sharp.',
    approved: true,
  },
  {
    id: 'ext-3',
    type: 'deadline',
    title: 'Machine Learning Lab 4 Notebook',
    dateOrDeadline: new Date(Date.now() + 1000 * 60 * 60 * 84).toISOString(),
    source: 'telegram',
    sender: 'TA Ananya',
    confidence: 0.94,
    snippet: 'Lab 4 notebooks due Friday 5:00 PM with ablation charts.',
    approved: false,
  },
  {
    id: 'ext-4',
    type: 'exam',
    title: 'CS 503 Mid-Semester Exam',
    dateOrDeadline: new Date(Date.now() + 1000 * 60 * 60 * 140).toISOString(),
    source: 'gmail',
    sender: 'Academic Controller Office',
    confidence: 0.99,
    snippet: 'CS503 scheduled next Monday 10:00 AM to 1:00 PM in Exam Hall B.',
    approved: true,
  },
];

const INITIAL_USER: UserProfile = {
  name: 'Abubakar',
  email: 'a96711280@gmail.com',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  role: 'AI / Software Engineering Scholar',
  department: 'Computer Science & AI/ML',
  pushNotificationsEnabled: true,
  autoRedactSensitiveData: true,
  skipAuthCodes: true,
  morningDigestTime: '08:30 AM',
};

// Storage helper
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

// Local in-memory / local-storage state for robust fallback
class ApiService {
  private connectors: Connector[] = loadStorage('connectors', INITIAL_CONNECTORS);
  private tasks: Task[] = loadStorage('tasks', INITIAL_TASKS);
  private deadlines: Deadline[] = loadStorage('deadlines', INITIAL_DEADLINES);
  private events: CalendarEvent[] = loadStorage('events', INITIAL_EVENTS);
  private notifications: NotificationItem[] = loadStorage('notifications', INITIAL_NOTIFICATIONS);
  private extracted: ExtractedEntitySummary[] = loadStorage('extracted', INITIAL_EXTRACTED);
  private user: UserProfile = loadStorage('user', INITIAL_USER);
  private isOnlineBackend: boolean = false;

  constructor() {
    this.checkBackendHealth();
  }

  private async checkBackendHealth() {
    try {
      const res = await fetch(`${API_BASE_URL}/`, { method: 'GET', signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        this.isOnlineBackend = true;
      }
    } catch {
      this.isOnlineBackend = false;
    }
  }

  public getBackendStatus(): { isOnline: boolean; url: string } {
    return { isOnline: this.isOnlineBackend, url: API_BASE_URL };
  }

  // --- CONNECTORS ---
  public async getConnectors(): Promise<Connector[]> {
    return [...this.connectors];
  }

  public async syncConnector(id: string, onProgress?: (percent: number, message: string) => void): Promise<Connector> {
    const conn = this.connectors.find((c) => c.id === id);
    if (!conn) throw new Error('Connector not found');

    conn.status = 'syncing';
    saveStorage('connectors', this.connectors);

    // Realistic progressive sync simulation
    const steps = [
      { pct: 20, msg: `Authenticating with ${conn.name}...` },
      { pct: 45, msg: 'Fetching delta messages since last checkpoint...' },
      { pct: 70, msg: 'Executing PII & Auth Code privacy sanitizer...' },
      { pct: 90, msg: 'Running LLM entity extraction & RAG indexing...' },
      { pct: 100, msg: 'Continuous sync checkpoint saved!' },
    ];

    for (const step of steps) {
      if (onProgress) onProgress(step.pct, step.msg);
      await new Promise((resolve) => setTimeout(resolve, 350));
    }

    conn.status = 'connected';
    conn.lastSyncedAt = new Date().toISOString();
    conn.messageCount += Math.floor(Math.random() * 8) + 2;
    conn.itemsExtracted += Math.floor(Math.random() * 3) + 1;
    saveStorage('connectors', this.connectors);
    return { ...conn };
  }

  public async reconnectConnector(id: string): Promise<Connector> {
    const conn = this.connectors.find((c) => c.id === id);
    if (!conn) throw new Error('Connector not found');
    await new Promise((r) => setTimeout(r, 600));
    conn.status = 'connected';
    conn.errorMessage = undefined;
    conn.lastSyncedAt = new Date().toISOString();
    saveStorage('connectors', this.connectors);
    return { ...conn };
  }

  // --- TASKS ---
  public async getTasks(): Promise<Task[]> {
    return [...this.tasks];
  }

  public async createTask(taskInput: Omit<Task, 'id' | 'createdAt'>): Promise<Task> {
    const newTask: Task = {
      ...taskInput,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.tasks.unshift(newTask);
    saveStorage('tasks', this.tasks);
    return newTask;
  }

  public async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const index = this.tasks.findIndex((t) => t.id === id);
    if (index === -1) throw new Error('Task not found');
    if (updates.status === 'completed' && !this.tasks[index].completedAt) {
      updates.completedAt = new Date().toISOString();
    } else if (updates.status && updates.status !== 'completed') {
      updates.completedAt = undefined;
    }
    this.tasks[index] = { ...this.tasks[index], ...updates };
    saveStorage('tasks', this.tasks);
    return { ...this.tasks[index] };
  }

  public async deleteTask(id: string): Promise<boolean> {
    this.tasks = this.tasks.filter((t) => t.id !== id);
    saveStorage('tasks', this.tasks);
    return true;
  }

  // --- DEADLINES ---
  public async getDeadlines(): Promise<Deadline[]> {
    return [...this.deadlines];
  }

  public async createDeadline(deadlineInput: Omit<Deadline, 'id'>): Promise<Deadline> {
    const newDeadline: Deadline = {
      ...deadlineInput,
      id: `dl-${Date.now()}`,
    };
    this.deadlines.unshift(newDeadline);
    saveStorage('deadlines', this.deadlines);
    return newDeadline;
  }

  public async completeDeadline(id: string): Promise<Deadline> {
    const index = this.deadlines.findIndex((d) => d.id === id);
    if (index === -1) throw new Error('Deadline not found');
    this.deadlines[index] = {
      ...this.deadlines[index],
      status: 'completed',
      completedAt: new Date().toISOString(),
    };
    saveStorage('deadlines', this.deadlines);
    return { ...this.deadlines[index] };
  }

  public async extendDeadline(id: string, newDueDate: string): Promise<Deadline> {
    const index = this.deadlines.findIndex((d) => d.id === id);
    if (index === -1) throw new Error('Deadline not found');
    this.deadlines[index] = {
      ...this.deadlines[index],
      dueDate: newDueDate,
      status: 'upcoming',
    };
    saveStorage('deadlines', this.deadlines);
    return { ...this.deadlines[index] };
  }

  // --- EVENTS ---
  public async getEvents(): Promise<CalendarEvent[]> {
    return [...this.events];
  }

  public async createEvent(eventInput: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
    const newEvent: CalendarEvent = {
      ...eventInput,
      id: `ev-${Date.now()}`,
    };
    this.events.unshift(newEvent);
    saveStorage('events', this.events);
    return newEvent;
  }

  public async updateEvent(id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent> {
    const index = this.events.findIndex((e) => e.id === id);
    if (index === -1) throw new Error('Event not found');
    this.events[index] = { ...this.events[index], ...updates };
    saveStorage('events', this.events);
    return { ...this.events[index] };
  }

  public async deleteEvent(id: string): Promise<boolean> {
    this.events = this.events.filter((e) => e.id !== id);
    saveStorage('events', this.events);
    return true;
  }

  // --- RECENTLY EXTRACTED ENTITIES ---
  public async getRecentlyExtracted(): Promise<ExtractedEntitySummary[]> {
    return [...this.extracted];
  }

  public async approveExtractedEntity(id: string): Promise<ExtractedEntitySummary> {
    const entity = this.extracted.find((e) => e.id === id);
    if (!entity) throw new Error('Entity not found');
    entity.approved = true;

    // Convert to Task automatically
    await this.createTask({
      title: entity.title,
      description: `Auto-approved from ${entity.source.toUpperCase()}: ${entity.snippet}`,
      status: 'todo',
      priority: 'high',
      dueDate: entity.dateOrDeadline,
      category: 'Extracted Assignment',
      source: entity.source,
      tags: ['AI-Extracted', entity.type],
    });

    saveStorage('extracted', this.extracted);
    return { ...entity };
  }

  // --- NOTIFICATIONS & DISTINCT ACTIONS ---
  public async getNotifications(): Promise<NotificationItem[]> {
    return [...this.notifications];
  }

  public async markNotificationRead(id: string): Promise<void> {
    const notif = this.notifications.find((n) => n.id === id);
    if (notif) {
      notif.isRead = true;
      saveStorage('notifications', this.notifications);
    }
  }

  public async markAllNotificationsRead(): Promise<void> {
    this.notifications.forEach((n) => (n.isRead = true));
    saveStorage('notifications', this.notifications);
  }

  public async handleNotificationAction(
    id: string,
    action: NotificationActionType,
    snoozeHours: number = 2
  ): Promise<{ success: boolean; message: string; completedItemId?: string }> {
    const notifIndex = this.notifications.findIndex((n) => n.id === id);
    if (notifIndex === -1) throw new Error('Notification not found');
    const notif = this.notifications[notifIndex];

    if (action === 'ok') {
      // Dismiss notification
      notif.isRead = true;
      saveStorage('notifications', this.notifications);
      return { success: true, message: 'Notification acknowledged and marked as read.' };
    }

    if (action === 'already_done') {
      // Distinct action: Mark corresponding task or deadline as done!
      let completedId: string | undefined = undefined;
      if (notif.deadlineId) {
        await this.completeDeadline(notif.deadlineId);
        completedId = notif.deadlineId;
      } else if (notif.taskId) {
        await this.updateTask(notif.taskId, { status: 'completed' });
        completedId = notif.taskId;
      }
      notif.isRead = true;
      saveStorage('notifications', this.notifications);
      return {
        success: true,
        message: 'Marked as completed in your productivity system!',
        completedItemId: completedId,
      };
    }

    if (action === 'remind_later') {
      // Distinct action: Snooze notification for specified duration
      const snoozeDate = new Date(Date.now() + snoozeHours * 60 * 60 * 1000).toISOString();
      notif.snoozedUntil = snoozeDate;
      notif.isRead = true;
      saveStorage('notifications', this.notifications);
      return {
        success: true,
        message: `Reminder snoozed for ${snoozeHours >= 24 ? `${snoozeHours / 24} day(s)` : `${snoozeHours} hour(s)`}.`,
      };
    }

    return { success: false, message: 'Unknown action' };
  }

  // --- CHAT WITH RAG-POWERED AGENT ---
  public async sendChatMessage(
    userText: string,
    conversationId?: string,
    sourceFilter: ConnectorSource | 'all' = 'all'
  ): Promise<ChatMessage> {
    // Artificial latency for realism
    await new Promise((r) => setTimeout(r, 700));

    const lower = userText.toLowerCase();

    // RAG intelligent matching based on user prompt
    if (lower.includes('deadline') || lower.includes('due') || lower.includes('submission')) {
      const upcoming = this.deadlines.filter((d) => d.status === 'upcoming');
      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: `Here are your upcoming deadlines retrieved across **WhatsApp**, **Telegram**, and **Gmail**:\n\n1. **${upcoming[0]?.title}** — Due in approx 36 hours (*Prof. Ramesh Rao via Gmail*)\n2. **${upcoming[1]?.title}** — Due in approx 3 days (*TA Ananya via Telegram*)\n\nI have prepared structured actions below. Would you like me to reschedule or prioritize any of them?`,
        timestamp: new Date().toISOString(),
        structuredDeadlines: upcoming.slice(0, 2),
        citations: [
          {
            platform: 'gmail',
            sender: 'Prof. Ramesh Rao',
            conversation: '[CS451] Project Phase 2 Guidelines',
            time: 'Yesterday 11:30 AM',
            snippet: 'Dear class, please ensure your Raft consensus implementation and test benchmarks are pushed to GitHub Classroom by Tuesday 11:59 PM.',
          },
          {
            platform: 'telegram',
            sender: 'TA Ananya',
            conversation: 'CS503 Lab Group 2026',
            time: 'Yesterday 7:15 PM',
            snippet: 'Lab 4 notebooks have been updated on Drive. Deadline for submission is Friday 5:00 PM.',
          },
        ],
      };
    }

    if (lower.includes('whatsapp') || lower.includes('group') || lower.includes('chat')) {
      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: `From your active **WhatsApp** study and capstone groups:\n\n• **Capstone Project Alpha**: Varun confirmed a rehearsal tomorrow at **4:00 PM** in **Library Discussion Room 3**.\n• **Cloud Arch Team 4**: Siddharth notified that the Terraform peer review is pending submission.\n\nAll sensitive authentication codes (OTPs) and private numbers were automatically redacted by the MindMesh privacy filter.`,
        timestamp: new Date().toISOString(),
        structuredEvents: [this.events[0]],
        citations: [
          {
            platform: 'whatsapp',
            sender: 'Varun (Team Lead)',
            conversation: 'Capstone Project Alpha',
            time: 'Today 2:40 PM',
            snippet: 'Meet room booked for 4 PM - 5:30 PM tomorrow in Library Discussion Room 3.',
          },
        ],
      };
    }

    if (lower.includes('exam') || lower.includes('meeting') || lower.includes('calendar') || lower.includes('event')) {
      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: `I found **${this.events.length} upcoming events & exams** synchronized on your calendar:\n\n• **Deep Learning Mid-Semester Assessment**: Next Monday (10:00 AM – 1:00 PM in Exam Hall B)\n• **Capstone Rehearsal**: Tomorrow at 4:00 PM (Offline)\n• **Google Cloud Student Innovators Webinar**: Google Meet link extracted from Gmail.`,
        timestamp: new Date().toISOString(),
        structuredEvents: this.events.slice(0, 2),
        citations: [
          {
            platform: 'gmail',
            sender: 'Academic Controller Office',
            conversation: 'Mid Semester Examination Date Sheet 2026',
            time: '2 days ago',
            snippet: 'CS503 scheduled next Monday 10:00 AM to 1:00 PM in Exam Hall B.',
          },
        ],
      };
    }

    // Default intelligent response
    return {
      id: `msg-${Date.now()}`,
      sender: 'assistant',
      text: `I've analyzed your synced channels (**WhatsApp**, **Telegram**, and **Gmail**).\n\nYou currently have **${this.tasks.filter((t) => t.status !== 'completed').length} pending tasks** and **${this.deadlines.filter((d) => d.status === 'upcoming').length} upcoming deadlines**.\n\nYou can ask me to:\n- "Extract any homework mentioned in WhatsApp yesterday"\n- "Summarize all internship updates from Gmail"\n- "What is due before this Friday?"\n- "Add a reminder to submit Raft code tomorrow night"`,
      timestamp: new Date().toISOString(),
      structuredTasks: this.tasks.slice(0, 2),
      citations: [
        {
          platform: 'whatsapp',
          sender: 'CS 402 Group',
          conversation: 'Distributed Systems Discussion',
          time: 'Today 1:12 PM',
          snippet: 'Don\'t forget unit test coverage should be above 80% for full points.',
        },
      ],
    };
  }

  // --- FIRST-LOGIN MESSAGE IMPORT WORKFLOW ---
  public async executeInitialImport(
    config: ImportConfig,
    onProgress: (step: SyncStepProgress) => void
  ): Promise<{ totalImported: number; totalDeadlines: number; totalTasks: number }> {
    const connectorsToSync: ConnectorSource[] =
      config.connectors.length > 0
        ? config.connectors
        : ['whatsapp', 'telegram', 'gmail'];

    let totalImported = 0;
    let totalDeadlines = 0;
    let totalTasks = 0;

    for (const source of connectorsToSync) {
      // Step 1: Scanning
      onProgress({
        connector: source,
        status: 'scanning',
        messagesProcessed: 0,
        entitiesFound: 0,
        progressPercent: 20,
      });
      await new Promise((r) => setTimeout(r, 450));

      // Step 2: Extracting & Redacting
      const messagesCount = source === 'whatsapp' ? 180 : source === 'gmail' ? 320 : 140;
      onProgress({
        connector: source,
        status: 'extracting',
        messagesProcessed: Math.floor(messagesCount / 2),
        entitiesFound: 2,
        progressPercent: 65,
      });
      await new Promise((r) => setTimeout(r, 550));

      // Step 3: Complete
      const entitiesFound = source === 'whatsapp' ? 4 : source === 'gmail' ? 7 : 3;
      totalImported += messagesCount;
      totalDeadlines += Math.floor(entitiesFound / 2);
      totalTasks += entitiesFound - Math.floor(entitiesFound / 2);

      onProgress({
        connector: source,
        status: 'completed',
        messagesProcessed: messagesCount,
        entitiesFound,
        progressPercent: 100,
      });
      await new Promise((r) => setTimeout(r, 250));
    }

    // Mark onboarding completed in storage
    localStorage.setItem('mindmesh_onboarding_completed', 'true');
    localStorage.setItem('mindmesh_import_config', JSON.stringify(config));

    return { totalImported, totalDeadlines, totalTasks };
  }

  // --- USER PROFILE & PREFERENCES ---
  public async getUserProfile(): Promise<UserProfile> {
    return { ...this.user };
  }

  public async updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    this.user = { ...this.user, ...updates };
    saveStorage('user', this.user);
    return { ...this.user };
  }
}

export const api = new ApiService();
