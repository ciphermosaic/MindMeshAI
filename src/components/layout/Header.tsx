import React, { useState } from 'react';
import {
  Bell,
  Search,
  RefreshCw,
  Sparkles,
  Command,
  HelpCircle,
  Settings,
  ChevronDown,
  User,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';

export const Header: React.FC = () => {
  const {
    currentTab,
    unreadCount,
    setIsNotificationDrawerOpen,
    setIsCommandPaletteOpen,
    setIsFirstLoginImportOpen,
    setCurrentTab,
    syncConnectorById,
    connectors,
    syncingConnectors,
    userProfile,
    logout,
  } = useApp();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState<boolean>(false);
  const backendStatus = api.getBackendStatus();

  const titles: Record<string, { title: string; subtitle: string }> = {
    dashboard: { title: 'Dashboard', subtitle: 'Cross-platform synthesis & daily focus' },
    chat: { title: 'AI Assistant', subtitle: 'RAG-powered intelligence across your communications' },
    calendar: { title: 'Unified Calendar', subtitle: 'Integrated deadlines, meetings, and academic milestones' },
    events: { title: 'Events & Meetings', subtitle: 'Discovered gatherings from WhatsApp, Telegram, and Gmail' },
    deadlines: { title: 'Deadlines Tracker', subtitle: 'Prioritized assignments with automatic countdowns' },
    tasks: { title: 'Tasks Management', subtitle: 'Kanban & list views with provenance traceability' },
    connectors: { title: 'Message Connectors', subtitle: 'WhatsApp, Telegram, and Gmail sync pipelines' },
    notifications: { title: 'Notifications Center', subtitle: 'Interactive reminders with actionable resolutions' },
    settings: { title: 'Settings & Privacy', subtitle: 'Connector security, redaction filters, and preferences' },
  };

  const currentMeta = titles[currentTab] || { title: 'MindMeshAI', subtitle: 'Workspace' };
  const isAnySyncing = Object.values(syncingConnectors).some(Boolean);

  const handleSyncAll = async () => {
    for (const conn of connectors) {
      if (conn.status === 'connected') {
        syncConnectorById(conn.id);
      }
    }
  };

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-md px-6 flex items-center justify-between z-20">
      {/* Title & Breadcrumb */}
      <div>
        <h1 className="text-base font-bold text-foreground tracking-tight flex items-center gap-2">
          {currentMeta.title}
        </h1>
        <p className="text-xs text-muted-foreground hidden sm:block">
          {currentMeta.subtitle}
        </p>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-3">
        {/* Command Search Trigger */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-secondary/50 hover:bg-secondary text-xs text-muted-foreground hover:text-foreground transition-all shadow-subtle"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Search or ask...</span>
          <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] bg-card border border-border rounded font-mono">
            <Command className="w-2.5 h-2.5" /> K
          </kbd>
        </button>

        {/* Sync All Button */}
        <button
          onClick={handleSyncAll}
          disabled={isAnySyncing}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-xs font-medium transition-all ${
            isAnySyncing
              ? 'bg-amber-500/10 text-amber-600 border-amber-500/20 cursor-wait'
              : 'bg-card hover:bg-secondary text-foreground hover:border-muted-foreground/30'
          }`}
          title="Trigger sync on all connected channels"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isAnySyncing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">
            {isAnySyncing ? 'Syncing...' : 'Sync Channels'}
          </span>
        </button>

        {/* Notification Bell */}
        <button
          onClick={() => setIsNotificationDrawerOpen(true)}
          className="relative p-2 rounded-xl border border-border bg-card hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
          title="Notification Center"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-card animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-2 p-1 pl-2 rounded-xl border border-border bg-card hover:bg-secondary transition-all"
          >
            <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs overflow-hidden">
              {userProfile?.avatarUrl ? (
                <img src={userProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span>{(userProfile?.name?.charAt(0) || 'U').toUpperCase()}</span>
              )}
            </div>
            <span className="text-xs font-semibold text-foreground hidden sm:inline">
              {userProfile?.name || 'Account'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground mr-1" />
          </button>

          {/* Profile Dropdown */}
          {isProfileMenuOpen && (
            <div
              className="absolute right-0 mt-2 w-64 rounded-2xl bg-card border border-border shadow-xl p-2 z-50 animate-in fade-in zoom-in-95"
              onClick={() => setIsProfileMenuOpen(false)}
            >
              <div className="px-3 py-2 border-b border-border mb-1">
                <p className="text-xs font-bold text-foreground">{userProfile?.name}</p>
                <p className="text-[11px] text-muted-foreground font-mono truncate">
                  {userProfile?.email}
                </p>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                    {userProfile?.role || 'Student & Dev'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setCurrentTab('settings');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-foreground hover:bg-secondary rounded-xl transition-colors text-left"
              >
                <Settings className="w-4 h-4 text-muted-foreground" />
                <span>Account & Preferences</span>
              </button>

              <button
                onClick={() => {
                  setIsFirstLoginImportOpen(true);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-foreground hover:bg-secondary rounded-xl transition-colors text-left"
              >
                <Sparkles className="w-4 h-4 text-brand-500" />
                <span>Run Message Import Wizard</span>
              </button>

              <div className="pt-2 border-t border-border mt-1 px-3 py-1 flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  Mode:
                </span>
                <span className="font-mono text-emerald-500 font-medium">
                  {backendStatus.isOnline ? 'Live Backend' : 'Offline Engine'}
                </span>
              </div>

              <button
                onClick={logout}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors text-left font-medium mt-1"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
