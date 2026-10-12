import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckSquare,
  ClockAlert,
  Calendar,
  Radio,
  MessageSquare,
  Sparkles,
  Settings,
  ArrowRight,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { useApp, NavigationTab } from '../../context/AppContext';
import { Badge } from '../common/Badge';

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    setCurrentTab,
    tasks,
    deadlines,
    syncConnectorById,
    connectors,
  } = useApp();

  const [query, setQuery] = useState<string>('');

  useEffect(() => {
    if (!isCommandPaletteOpen) setQuery('');
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const filteredTasks = tasks
    .filter((t) => t.title.toLowerCase().includes(query.toLowerCase()) || t.category.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 4);

  const filteredDeadlines = deadlines
    .filter((d) => d.title.toLowerCase().includes(query.toLowerCase()) || d.courseOrProject.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 3);

  const navigateTo = (tab: NavigationTab) => {
    setCurrentTab(tab);
    setIsCommandPaletteOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
        onClick={() => setIsCommandPaletteOpen(false)}
      />

      {/* Palette Box */}
      <div
        className="relative w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search bar input */}
        <div className="flex items-center px-4 py-3.5 border-b border-border gap-3">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, task, or search across messages..."
            className="flex-1 bg-transparent border-none text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <kbd className="px-1.5 py-0.5 text-[10px] bg-secondary border border-border rounded font-mono text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Results Container */}
        <div className="p-2 max-h-96 overflow-y-auto space-y-3 text-xs">
          {/* Quick Actions */}
          <div>
            <div className="px-2 py-1 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
              Navigation & Actions
            </div>
            <div className="space-y-0.5 mt-1">
              <button
                onClick={() => navigateTo('chat')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-foreground hover:bg-secondary transition-colors text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-brand-500" />
                  <span>Ask MindMesh AI Agent</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={() => navigateTo('tasks')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-foreground hover:bg-secondary transition-colors text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <CheckSquare className="w-4 h-4 text-indigo-500" />
                  <span>Open Tasks Board</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={() => navigateTo('deadlines')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-foreground hover:bg-secondary transition-colors text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <ClockAlert className="w-4 h-4 text-rose-500" />
                  <span>View Deadlines & Countdowns</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={() => navigateTo('calendar')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-foreground hover:bg-secondary transition-colors text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-emerald-500" />
                  <span>Unified Calendar & Agenda</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={() => navigateTo('connectors')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-foreground hover:bg-secondary transition-colors text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <Radio className="w-4 h-4 text-amber-500" />
                  <span>Manage Connectors (WhatsApp, Telegram, Gmail)</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Matched Deadlines */}
          {filteredDeadlines.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                Deadlines
              </div>
              <div className="space-y-1 mt-1">
                {filteredDeadlines.map((dl) => (
                  <button
                    key={dl.id}
                    onClick={() => navigateTo('deadlines')}
                    className="w-full flex items-center justify-between p-2 rounded-xl border border-border hover:bg-secondary transition-colors text-left"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <ClockAlert className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                      <span className="font-medium text-foreground truncate">{dl.title}</span>
                    </div>
                    <Badge variant="priority" priority={dl.priority} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matched Tasks */}
          {filteredTasks.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                Tasks
              </div>
              <div className="space-y-1 mt-1">
                {filteredTasks.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => navigateTo('tasks')}
                    className="w-full flex items-center justify-between p-2 rounded-xl border border-border hover:bg-secondary transition-colors text-left"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <CheckSquare className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                      <span className="font-medium text-foreground truncate">{t.title}</span>
                    </div>
                    <Badge variant="source" source={t.source} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-secondary/40 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
          <span>MindMesh Semantic Search & Dispatcher</span>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
  );
};
