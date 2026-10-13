import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Plus,
  Trash2,
  Bot,
  User,
  ClockAlert,
  CheckSquare,
  CalendarDays,
  ExternalLink,
  RotateCcw,
  ShieldCheck,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { ChatMessage, ChatSession, ConnectorSource, Task, Deadline, CalendarEvent } from '../types';
import { Badge } from '../components/common/Badge';

export const ChatPage: React.FC = () => {
  const { createTask, createDeadline, createEvent, setInspectingSource, showToast } = useApp();
  const backendStatus = api.getBackendStatus();

  const [sessions, setSessions] = useState<ChatSession[]>([
    {
      id: 'session-1',
      title: 'MindMesh AI Assistant',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: 'welcome-1',
          sender: 'assistant',
          text: `Welcome to **MindMeshAI**!\n\nI connect to your **FastAPI / RAG** backend to answer questions about your synchronized **WhatsApp**, **Telegram**, and **Gmail** messages.\n\nAsk me about your assignments, deadlines, scheduled meetings, or group project discussions.`,
          timestamp: new Date().toISOString(),
        },
      ],
    },
  ]);

  const [activeSessionId, setActiveSessionId] = useState<string>('session-1');
  const [input, setInput] = useState<string>('');
  const [sourceFilter, setSourceFilter] = useState<ConnectorSource | 'all'>('all');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
    };

    // Append user message
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? { ...s, messages: [...s.messages, userMessage], updatedAt: new Date().toISOString() }
          : s
      )
    );

    setInput('');
    setIsLoading(true);

    try {
      const response = await api.sendChatMessage(text, activeSessionId, sourceFilter);

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? { ...s, messages: [...s.messages, response], updatedAt: new Date().toISOString() }
            : s
        )
      );
    } catch {
      showToast('AI response error', 'Unable to retrieve answer from RAG pipeline', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: 'New Conversation',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: `welcome-${Date.now()}`,
          sender: 'assistant',
          text: 'Starting a new conversation. Ask me about your WhatsApp chats, college emails, or upcoming tasks.',
          timestamp: new  Date().toISOString(),
        },
      ],
    };

    setSessions([newSession, ...sessions]);
    setActiveSessionId(newSession.id);
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (sessions.length === 1) return;
    const remaining = sessions.filter((s) => s.id !== id);
    setSessions(remaining);
    if (activeSessionId === id) {
      setActiveSessionId(remaining[0].id);
    }
  };

  const handleAddStructuredTask = async (task: Partial<Task>) => {
    await createTask({
      title: task.title || 'Untitled Task',
      description: task.description || 'Extracted via MindMesh AI Chat',
      status: 'todo',
      priority: task.priority || 'high',
      dueDate: task.dueDate || new Date(Date.now() + 86400000 * 2).toISOString(),
      category: task.category || 'Extracted Task',
      source: task.source || 'manual',
      tags: ['AI-Chat-Extracted'],
    });
  };

  const handleAddStructuredDeadline = async (dl: Partial<Deadline>) => {
    await createDeadline({
      title: dl.title || 'Untitled Deadline',
      courseOrProject: dl.courseOrProject || 'General',
      dueDate: dl.dueDate || new Date(Date.now() + 86400000 * 3).toISOString(),
      priority: dl.priority || 'urgent',
      status: 'upcoming',
      weightage: dl.weightage || 'Important',
      source: dl.source || 'manual',
    });
  };

  const handleAddStructuredEvent = async (ev: Partial<CalendarEvent>) => {
    await createEvent({
      title: ev.title || 'Untitled Event',
      description: ev.description || 'Extracted via MindMesh AI Chat',
      category: ev.category || 'meeting',
      startDate: ev.startDate || new Date(Date.now() + 86400000).toISOString(),
      endDate: ev.endDate || new Date(Date.now() + 86400000 + 3600000).toISOString(),
      location: ev.location,
      isOnline: !!ev.isOnline,
      meetingLink: ev.meetingLink,
      source: ev.source || 'manual',
    });
  };

  const promptSuggestions = [
    'What deadlines are due this week across all channels?',
    'Summarize recent announcements from my synchronized chats',
    'Find upcoming exam or submission dates in my messages',
    'Extract any actionable tasks mentioned today',
  ];

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Left Chat History Sidebar */}
      <div className="w-64 border-r border-border bg-card/40 hidden md:flex flex-col">
        <div className="p-3 border-b border-border">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Conversations
          </div>
          {sessions.map((session) => {
            const isActive = session.id === activeSessionId;
            return (
              <div
                key={session.id}
                onClick={() => setActiveSessionId(session.id)}
                className={`flex items-center justify-between p-2.5 rounded-xl text-xs cursor-pointer group transition-all ${
                  isActive
                    ? 'bg-secondary text-foreground font-semibold border border-border shadow-subtle'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                }`}
              >
                <span className="truncate flex-1 pr-2">{session.title}</span>
                {sessions.length > 1 && (
                  <button
                    onClick={(e) => handleDeleteSession(session.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-rose-500 rounded transition-all"
                    title="Delete chat"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Sync security badge */}
        <div className="p-3 border-t border-border bg-card text-[10px] text-muted-foreground flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <span>Local RAG context verified & privacy-filtered</span>
        </div>
      </div>

      {/* Main Centered Conversational Container */}
      <div className="flex-1 flex flex-col bg-background relative overflow-hidden">
        {/* Top Chat Info bar */}
        <div className="h-12 border-b border-border px-6 flex items-center justify-between bg-card/40 text-xs">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-primary" />
            <span className="font-semibold text-foreground">{activeSession.title}</span>
          </div>

          {/* Filter connector channel dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground hidden sm:inline text-[11px]">Source focus:</span>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value as any)}
              className="px-2.5 py-1 rounded-lg bg-secondary border border-border text-[11px] font-medium text-foreground focus:outline-none"
            >
              <option value="all">All Channels (WhatsApp, Telegram, Gmail)</option>
              <option value="whatsapp">WhatsApp Only</option>
              <option value="telegram">Telegram Only</option>
              <option value="gmail">Gmail Only</option>
            </select>
          </div>
        </div>

        {/* Backend Connectivity Status Bar */}
        {!backendStatus.isOnline && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-2 flex items-center justify-between text-[11px] text-amber-600 dark:text-amber-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>
                FastAPI / RAG backend ({backendStatus.url}) is offline. Queries will report connectivity status until the service is started.
              </span>
            </div>
            <button
              onClick={() => api.checkBackendHealth()}
              className="text-primary hover:underline font-semibold"
            >
              Check Health
            </button>
          </div>
        )}

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 max-w-3xl w-full mx-auto">
          {activeSession.messages.map((message) => {
            const isUser = message.sender === 'user';

            return (
              <div
                key={message.id}
                className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div className={`space-y-3 max-w-[85%] sm:max-w-[78%]`}>
                  {/* Message Bubble Text */}
                  <div
                    className={`p-4 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                      isUser
                        ? 'bg-primary text-white font-medium rounded-tr-none shadow-sm'
                        : 'bg-card text-foreground border border-border rounded-tl-none shadow-card'
                    }`}
                  >
                    {message.text}
                  </div>

                  {/* Structured Deadlines Pills / Cards */}
                  {message.structuredDeadlines && message.structuredDeadlines.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <ClockAlert className="w-3.5 h-3.5 text-rose-500" />
                        <span>Structured Deadlines</span>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {message.structuredDeadlines.map((dl, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl border border-border bg-card flex items-center justify-between gap-3 text-xs"
                          >
                            <div>
                              <div className="font-bold text-foreground">{dl.title}</div>
                              <div className="text-[11px] text-muted-foreground">
                                Due: {new Date(dl.dueDate || Date.now()).toLocaleDateString()}
                              </div>
                            </div>
                            <button
                              onClick={() => handleAddStructuredDeadline(dl)}
                              className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-[11px] font-semibold transition-colors flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add to Deadlines</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Structured Tasks Pills / Cards */}
                  {message.structuredTasks && message.structuredTasks.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <CheckSquare className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Actionable Tasks</span>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {message.structuredTasks.map((t, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl border border-border bg-card flex items-center justify-between gap-3 text-xs"
                          >
                            <div>
                              <div className="font-bold text-foreground">{t.title}</div>
                              <div className="text-[11px] text-muted-foreground line-clamp-1">
                                {t.description}
                              </div>
                            </div>
                            <button
                              onClick={() => handleAddStructuredTask(t)}
                              className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-[11px] font-semibold transition-colors flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add to Tasks</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Structured Events Pills */}
                  {message.structuredEvents && message.structuredEvents.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <CalendarDays className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Calendar Events</span>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {message.structuredEvents.map((ev, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl border border-border bg-card flex items-center justify-between gap-3 text-xs"
                          >
                            <div>
                              <div className="font-bold text-foreground">{ev.title}</div>
                              <div className="text-[11px] text-muted-foreground">
                                {new Date(ev.startDate || Date.now()).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                            <button
                              onClick={() => handleAddStructuredEvent(ev)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-semibold transition-colors flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add to Calendar</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Citations & Provenance */}
                  {message.citations && message.citations.length > 0 && (
                    <div className="p-3 rounded-xl bg-secondary/50 border border-border text-[11px] space-y-1.5">
                      <div className="font-bold text-muted-foreground flex items-center gap-1.5">
                        <ExternalLink className="w-3 h-3 text-primary" />
                        <span>Source Message Citations</span>
                      </div>
                      <div className="space-y-1.5">
                        {message.citations.map((cite, cIdx) => (
                          <div key={cIdx} className="p-2 rounded-lg bg-card border border-border">
                            <div className="flex items-center justify-between mb-1">
                              <Badge variant="source" source={cite.platform} />
                              <span className="text-[10px] text-muted-foreground font-mono">
                                {cite.time}
                              </span>
                            </div>
                            <p className="text-muted-foreground italic">"{cite.snippet}"</p>
                            <span className="text-[10px] text-foreground font-medium block mt-1">
                              From: {cite.sender} ({cite.conversation})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-xl bg-secondary text-foreground flex items-center justify-center flex-shrink-0 mt-0.5 border border-border font-bold text-xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3 rounded-2xl bg-card border border-border text-xs text-muted-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                <span>RAG Retrieval: scanning message embeddings and vector store...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts pills */}
        <div className="p-2 border-t border-border bg-card/60 backdrop-blur-md">
          <div className="max-w-3xl mx-auto flex items-center gap-2 overflow-x-auto py-1 text-[11px]">
            {promptSuggestions.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="px-3 py-1.5 rounded-xl bg-secondary hover:bg-muted text-muted-foreground hover:text-foreground whitespace-nowrap transition-colors border border-border"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Message Composer */}
        <div className="p-4 border-t border-border bg-card">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="max-w-3xl mx-auto relative flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask MindMesh about assignments, WhatsApp chats, or deadlines..."
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-2xl bg-secondary border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 pr-12 shadow-inner"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 p-2 rounded-xl bg-primary hover:bg-primary-hover text-white disabled:opacity-40 transition-colors shadow-sm"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
