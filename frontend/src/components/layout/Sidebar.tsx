import React, { useState } from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  Calendar,
  CalendarDays,
  ClockAlert,
  CheckSquare,
  Radio,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Laptop,
  Sparkles,
  RefreshCw,
  Bell,
  Settings,
} from 'lucide-react';
import { useApp, NavigationTab } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';

export const Sidebar: React.FC = () => {
  const { currentTab, setCurrentTab, unreadCount, connectors, syncingConnectors } = useApp();
  const { theme, setTheme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const isAnySyncing = Object.values(syncingConnectors).some(Boolean);

  const navItems: { id: NavigationTab; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'chat', label: 'AI Chat', icon: MessageSquare },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'events', label: 'Events', icon: CalendarDays },
    { id: 'deadlines', label: 'Deadlines', icon: ClockAlert },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'connectors', label: 'Connectors', icon: Radio },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={`relative flex flex-col border-r border-border bg-card/60 backdrop-blur-xl transition-all duration-300 z-30 select-none ${
        isCollapsed ? 'w-18' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-border">
        {!isCollapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center text-white shadow-glow-primary">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-foreground flex items-center gap-1.5">
                MindMesh<span className="text-brand-500 font-extrabold text-xs px-1.5 py-0.5 rounded bg-brand-500/10">AI</span>
              </span>
              <p className="text-[10px] text-muted-foreground tracking-wide font-mono">
                Cross-channel Intelligence
              </p>
            </div>
          </div>
        )}

        {isCollapsed && (
          <div className="w-8 h-8 mx-auto rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center text-white shadow-glow-primary">
            <Sparkles className="w-4 h-4" />
          </div>
        )}

        {/* Collapse toggle button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors ${
            isCollapsed ? 'hidden' : 'block'
          }`}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group relative ${
                isActive
                  ? 'bg-primary text-white shadow-sm font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/80'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'group-hover:text-foreground'}`} />

              {!isCollapsed && (
                <span className="flex-1 text-left truncate">{item.label}</span>
              )}

              {/* Unread badge count */}
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                    isActive
                      ? 'bg-white text-primary'
                      : 'bg-rose-500 text-white'
                  }`}
                >
                  {item.badge}
                </span>
              )}

              {/* Active pill dot when collapsed */}
              {isCollapsed && isActive && (
                <span className="absolute right-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* Live Continuous Sync Status Widget */}
      {!isCollapsed && (
        <div className="mx-3 mb-3 p-3 rounded-xl bg-secondary/60 border border-border">
          <div className="flex items-center justify-between text-[11px] font-medium text-foreground mb-1.5">
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isAnySyncing ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`} />
              Sync Engine
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">
              {isAnySyncing ? 'Syncing...' : 'Continuous'}
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>Active channels: {connectors.filter(c => c.status === 'connected').length}/3</span>
            <RefreshCw className={`w-3 h-3 ${isAnySyncing ? 'animate-spin text-amber-500' : ''}`} />
          </div>
        </div>
      )}

      {/* Bottom Section: Theme Toggle & Sidebar Expand (if collapsed) */}
      <div className="p-3 border-t border-border flex flex-col gap-2 bg-card">
        {isCollapsed && (
          <button
            onClick={() => setIsCollapsed(false)}
            className="w-full flex items-center justify-center p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            title="Expand Sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Theme mode switcher */}
        <div className={`flex items-center p-1 rounded-xl bg-secondary border border-border ${isCollapsed ? 'flex-col' : 'justify-between'}`}>
          <button
            onClick={() => setTheme('light')}
            className={`p-1.5 rounded-lg text-xs transition-all ${
              theme === 'light'
                ? 'bg-card text-foreground shadow-sm font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            title="Light Theme"
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`p-1.5 rounded-lg text-xs transition-all ${
              theme === 'dark'
                ? 'bg-card text-foreground shadow-sm font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            title="Dark Theme"
          >
            <Moon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setTheme('system')}
            className={`p-1.5 rounded-lg text-xs transition-all ${
              theme === 'system'
                ? 'bg-card text-foreground shadow-sm font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            title="System Theme"
          >
            <Laptop className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
