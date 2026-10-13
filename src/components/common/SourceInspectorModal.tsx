import React from 'react';
import { Modal } from './Modal';
import { Badge } from './Badge';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, MessageSquare, Clock, User, CheckCircle2 } from 'lucide-react';

export const SourceInspectorModal: React.FC = () => {
  const { inspectingSource, setInspectingSource } = useApp();

  if (!inspectingSource) return null;

  return (
    <Modal
      isOpen={!!inspectingSource}
      onClose={() => setInspectingSource(null)}
      title="Source Message Provenance"
      description="Extracted and sanitized by MindMeshAI pipeline"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5">
        {/* Platform & Confidence header */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-secondary/60 border border-border">
          <div className="flex items-center gap-3">
            <Badge variant="source" source={inspectingSource.platform} />
            <span className="text-xs text-muted-foreground font-mono">
              Account: {inspectingSource.account}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-500">
            <ShieldCheck className="w-4 h-4" />
            <span>AI Confidence: {Math.round(inspectingSource.confidenceScore * 100)}%</span>
          </div>
        </div>

        {/* Sender & Conversation Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg border border-border bg-card space-y-1">
            <div className="text-muted-foreground flex items-center gap-1.5 font-medium">
              <User className="w-3.5 h-3.5" /> Sender
            </div>
            <div className="font-semibold text-foreground truncate">{inspectingSource.sender}</div>
          </div>
          {inspectingSource.conversationName && (
            <div className="p-3 rounded-lg border border-border bg-card space-y-1">
              <div className="text-muted-foreground flex items-center gap-1.5 font-medium">
                <MessageSquare className="w-3.5 h-3.5" /> Conversation / Group
              </div>
              <div className="font-semibold text-foreground truncate">
                {inspectingSource.conversationName}
              </div>
            </div>
          )}
          <div className="p-3 rounded-lg border border-border bg-card space-y-1 sm:col-span-2">
            <div className="text-muted-foreground flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5" /> Ingested Timestamp
            </div>
            <div className="font-mono text-foreground">
              {new Date(inspectingSource.timestamp).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Raw Sanitized Message Snippet */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span>Raw Context (Sanitized by Privacy Filter)</span>
            <span className="text-[11px] text-emerald-500 font-mono flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> PII Redacted
            </span>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 text-slate-200 border border-border font-mono text-xs leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap select-text">
            {inspectingSource.rawSnippet}
          </div>
        </div>

        {/* Privacy verification notice */}
        <p className="text-[11px] text-muted-foreground leading-normal">
          MindMesh automatically verifies that passwords, login verification codes, and personal contact numbers are never stored in plain text or passed downstream without masking.
        </p>

        {/* Close Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={() => setInspectingSource(null)}
            className="px-4 py-2 bg-secondary hover:bg-muted text-foreground text-xs font-medium rounded-lg transition-colors"
          >
            Close Provenance
          </button>
        </div>
      </div>
    </Modal>
  );
};
