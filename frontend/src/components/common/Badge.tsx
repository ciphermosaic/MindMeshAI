import React from 'react';
import { PriorityLevel, ConnectorSource, TaskStatus, DeadlineStatus } from '../../types';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'priority' | 'source' | 'status' | 'outline' | 'default';
  priority?: PriorityLevel;
  source?: ConnectorSource;
  status?: TaskStatus | DeadlineStatus;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  priority,
  source,
  status,
  className = '',
}) => {
  let baseStyle = 'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium tracking-wide transition-colors';

  if (variant === 'priority' && priority) {
    switch (priority) {
      case 'urgent':
        return (
          <span className={`${baseStyle} bg-rose-500/10 text-rose-500 dark:text-rose-400 border border-rose-500/20 ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
            Urgent
          </span>
        );
      case 'high':
        return (
          <span className={`${baseStyle} bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            High
          </span>
        );
      case 'medium':
        return (
          <span className={`${baseStyle} bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            Medium
          </span>
        );
      case 'low':
        return (
          <span className={`${baseStyle} bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20 ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            Low
          </span>
        );
    }
  }

  if (variant === 'source' && source) {
    switch (source) {
      case 'whatsapp':
        return (
          <span className={`${baseStyle} bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#25D366]"></span>
            WhatsApp
          </span>
        );
      case 'telegram':
        return (
          <span className={`${baseStyle} bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#229ED9]"></span>
            Telegram
          </span>
        );
      case 'gmail':
        return (
          <span className={`${baseStyle} bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#EA4335]"></span>
            Gmail
          </span>
        );
      case 'manual':
        return (
          <span className={`${baseStyle} bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
            Manual
          </span>
        );
    }
  }

  if (variant === 'status' && status) {
    switch (status) {
      case 'completed':
        return (
          <span className={`${baseStyle} bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 ${className}`}>
            Done
          </span>
        );
      case 'in_progress':
        return (
          <span className={`${baseStyle} bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 ${className}`}>
            In Progress
          </span>
        );
      case 'todo':
        return (
          <span className={`${baseStyle} bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-zinc-500/20 ${className}`}>
            To Do
          </span>
        );
      case 'upcoming':
        return (
          <span className={`${baseStyle} bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 ${className}`}>
            Upcoming
          </span>
        );
      case 'overdue':
        return (
          <span className={`${baseStyle} bg-rose-500/15 text-rose-600 dark:text-rose-400 font-semibold border border-rose-500/30 ${className}`}>
            Overdue
          </span>
        );
    }
  }

  return (
    <span className={`${baseStyle} bg-secondary text-secondary-foreground border border-border ${className}`}>
      {children}
    </span>
  );
};
