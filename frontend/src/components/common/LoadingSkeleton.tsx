import React from 'react';

export const CardSkeleton: React.FC<{ rows?: number }> = ({ rows = 3 }) => {
  return (
    <div className="bg-card border border-border rounded-xl p-5 animate-pulse space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-4 bg-muted rounded w-1/3"></div>
        <div className="h-4 bg-muted rounded w-16"></div>
      </div>
      <div className="space-y-2.5">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-3 bg-muted rounded w-full" style={{ width: `${95 - i * 15}%` }}></div>
        ))}
      </div>
      <div className="pt-2 flex items-center gap-2">
        <div className="h-6 bg-muted rounded-md w-20"></div>
        <div className="h-6 bg-muted rounded-md w-16"></div>
      </div>
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden animate-pulse">
      <div className="h-10 bg-muted/60 border-b border-border"></div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 flex items-center justify-between gap-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-4 bg-muted rounded w-1/6"></div>
            <div className="h-4 bg-muted rounded w-1/5"></div>
            <div className="h-6 bg-muted rounded w-16"></div>
          </div>
        ))}
      </div>
    </div>
  );
};
