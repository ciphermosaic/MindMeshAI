import React, { useState } from 'react';
import {
  Sparkles,
  Calendar,
  Radio,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ImportPeriod, ConnectorSource, SyncStepProgress } from '../../types';
import { api } from '../../services/api';

export const FirstLoginImportModal: React.FC = () => {
  const { isFirstLoginImportOpen, setIsFirstLoginImportOpen, refreshAll, showToast } = useApp();

  const [selectedPeriod, setSelectedPeriod] = useState<ImportPeriod>('7d');
  const [customStart, setCustomStart] = useState<string>('2026-10-01');
  const [customEnd, setCustomEnd] = useState<string>('2026-10-11');
  const [selectedConnectors, setSelectedConnectors] = useState<ConnectorSource[]>([
    'whatsapp',
    'telegram',
    'gmail',
  ]);

  // Stepper state: 'config' | 'syncing' | 'completed'
  const [step, setStep] = useState<'config' | 'syncing' | 'completed'>('config');

  const [progressMap, setProgressMap] = useState<Record<string, SyncStepProgress>>({
    whatsapp: { connector: 'whatsapp', status: 'pending', messagesProcessed: 0, entitiesFound: 0, progressPercent: 0 },
    telegram: { connector: 'telegram', status: 'pending', messagesProcessed: 0, entitiesFound: 0, progressPercent: 0 },
    gmail: { connector: 'gmail', status: 'pending', messagesProcessed: 0, entitiesFound: 0, progressPercent: 0 },
    manual: { connector: 'manual', status: 'pending', messagesProcessed: 0, entitiesFound: 0, progressPercent: 0 },
  });

  const [summary, setSummary] = useState<{ totalImported: number; totalDeadlines: number; totalTasks: number } | null>(null);

  if (!isFirstLoginImportOpen) return null;

  const toggleConnector = (c: ConnectorSource) => {
    setSelectedConnectors((prev) =>
      prev.includes(c) ? prev.filter((item) => item !== c) : [...prev, c]
    );
  };

  const handleStartImport = async () => {
    if (selectedConnectors.length === 0) {
      showToast('Select at least one connector', 'Please select WhatsApp, Telegram, or Gmail', 'error');
      return;
    }

    setStep('syncing');

    try {
      const res = await api.executeInitialImport(
        {
          period: selectedPeriod,
          customStartDate: selectedPeriod === 'custom' ? customStart : undefined,
          customEndDate: selectedPeriod === 'custom' ? customEnd : undefined,
          connectors: selectedConnectors,
        },
        (progress) => {
          setProgressMap((prev) => ({
            ...prev,
            [progress.connector]: progress,
          }));
        }
      );

      setSummary(res);
      setStep('completed');
      await refreshAll();
    } catch (err: any) {
      showToast('Import issue encountered', err?.message || 'Sync failed', 'error');
    }
  };

  const handleFinish = () => {
    setIsFirstLoginImportOpen(false);
    showToast('Onboarding Complete', 'MindMeshAI is continuously synchronizing your messages in the background.');
  };

  const periods: { id: ImportPeriod; title: string; desc: string }[] = [
    { id: '24h', title: 'Last 24 Hours', desc: 'Fastest — ideal for quick testing' },
    { id: '2d', title: 'Last 2 Days', desc: 'Recent catch-up on weekend discussions' },
    { id: '7d', title: 'Last 7 Days', desc: 'Recommended — full weekly syllabus & assignments' },
    { id: '30d', title: 'Last 30 Days', desc: 'Thorough — past monthly deadlines & notices' },
    { id: 'custom', title: 'Custom Date Range', desc: 'Specify exact boundary dates' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/75 backdrop-blur-md" />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-card border border-border rounded-3xl shadow-2xl z-10 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        {/* Top Gradient Ribbon */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-indigo-500 to-rose-500" />

        {/* Modal Header */}
        <div className="p-6 border-b border-border bg-card">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground tracking-tight">
                Welcome to MindMeshAI Setup
              </h2>
              <p className="text-xs text-muted-foreground">
                Intelligent extraction pipeline configuration
              </p>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-2xl bg-secondary/60 border border-border flex items-start gap-3">
            <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                How far back should MindMeshAI look through your messages?
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                We will scan your connected channels, clean and redact private credentials (OTPs), and index deadlines into your workspace.
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {step === 'config' && (
            <>
              {/* Period selection options */}
              <div className="space-y-2.5">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                  Select Lookback Timeframe
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {periods.map((p) => {
                    const isSelected = selectedPeriod === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedPeriod(p.id)}
                        className={`p-3.5 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? 'bg-primary/10 border-primary text-foreground ring-1 ring-primary'
                            : 'bg-card border-border hover:bg-secondary text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-foreground">{p.title}</span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-primary" />}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1">{p.desc}</p>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Date Inputs if selected */}
                {selectedPeriod === 'custom' && (
                  <div className="p-4 rounded-2xl border border-border bg-secondary/40 grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 animate-in fade-in">
                    <div>
                      <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={customStart}
                        onChange={(e) => setCustomStart(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-card border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={customEnd}
                        onChange={(e) => setCustomEnd(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-card border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Channels to include */}
              <div className="space-y-2.5">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                  Active Channels for Initial Import
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* WhatsApp */}
                  <button
                    type="button"
                    onClick={() => toggleConnector('whatsapp')}
                    className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                      selectedConnectors.includes('whatsapp')
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                        : 'bg-card border-border opacity-50 hover:opacity-80'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#25D366]"></span>
                      <span className="text-xs font-bold">WhatsApp (Primary)</span>
                    </div>
                    <CheckCircle2 className={`w-4 h-4 ${selectedConnectors.includes('whatsapp') ? 'opacity-100' : 'opacity-0'}`} />
                  </button>

                  {/* Telegram */}
                  <button
                    type="button"
                    onClick={() => toggleConnector('telegram')}
                    className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                      selectedConnectors.includes('telegram')
                        ? 'bg-sky-500/10 border-sky-500/30 text-sky-600 dark:text-sky-400'
                        : 'bg-card border-border opacity-50 hover:opacity-80'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#229ED9]"></span>
                      <span className="text-xs font-bold">Telegram</span>
                    </div>
                    <CheckCircle2 className={`w-4 h-4 ${selectedConnectors.includes('telegram') ? 'opacity-100' : 'opacity-0'}`} />
                  </button>

                  {/* Gmail */}
                  <button
                    type="button"
                    onClick={() => toggleConnector('gmail')}
                    className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                      selectedConnectors.includes('gmail')
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
                        : 'bg-card border-border opacity-50 hover:opacity-80'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#EA4335]"></span>
                      <span className="text-xs font-bold">Gmail</span>
                    </div>
                    <CheckCircle2 className={`w-4 h-4 ${selectedConnectors.includes('gmail') ? 'opacity-100' : 'opacity-0'}`} />
                  </button>
                </div>
              </div>

              {/* Security Banner */}
              <div className="p-3.5 rounded-2xl bg-secondary/50 border border-border flex items-center gap-3 text-xs text-muted-foreground">
                <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span>
                  Privacy-first: Telethon session and Gmail OAuth tokens remain encrypted. Passwords, OTP codes, and banking SMS are automatically purged.
                </span>
              </div>
            </>
          )}

          {step === 'syncing' && (
            <div className="space-y-5 py-4">
              <div className="text-center space-y-1">
                <h3 className="text-base font-bold text-foreground">
                  Synchronizing & Extracting Deadlines...
                </h3>
                <p className="text-xs text-muted-foreground">
                  Streaming messages through the normalizer and LLM classifier
                </p>
              </div>

              {/* Progress bars for each connector */}
              <div className="space-y-3">
                {selectedConnectors.map((c) => {
                  const item = progressMap[c] || {
                    status: 'pending',
                    progressPercent: 0,
                    messagesProcessed: 0,
                    entitiesFound: 0,
                  };
                  const name = c === 'whatsapp' ? 'WhatsApp' : c === 'telegram' ? 'Telegram' : 'Gmail';
                  const colorClass =
                    c === 'whatsapp'
                      ? 'bg-emerald-500'
                      : c === 'telegram'
                      ? 'bg-sky-500'
                      : 'bg-rose-500';

                  return (
                    <div key={c} className="p-4 rounded-2xl border border-border bg-card space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${colorClass}`}></span>
                          <span className="font-semibold text-foreground">{name}</span>
                          <span className="text-[11px] text-muted-foreground capitalize">
                            ({item.status})
                          </span>
                        </div>
                        <span className="font-mono text-muted-foreground">{item.progressPercent}%</span>
                      </div>

                      {/* Progress bar line */}
                      <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                        <div
                          className={`h-full ${colorClass} transition-all duration-300`}
                          style={{ width: `${item.progressPercent}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                        <span>Processed: {item.messagesProcessed} messages</span>
                        <span>Extracted: {item.entitiesFound} items</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {step === 'completed' && summary && (
            <div className="text-center py-6 space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-foreground">Initial Import Completed!</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  Your cross-channel intelligence mesh is fully configured and updated.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
                <div className="p-3.5 rounded-2xl bg-secondary/60 border border-border">
                  <div className="text-lg font-bold text-foreground font-mono">{summary.totalImported}</div>
                  <div className="text-[10px] text-muted-foreground uppercase font-medium">Messages Analyzed</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                  <div className="text-lg font-bold text-rose-500 font-mono">{summary.totalDeadlines}</div>
                  <div className="text-[10px] text-rose-600 dark:text-rose-400 uppercase font-medium">Deadlines Found</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                  <div className="text-lg font-bold text-indigo-500 font-mono">{summary.totalTasks}</div>
                  <div className="text-[10px] text-indigo-600 dark:text-indigo-400 uppercase font-medium">Actionable Tasks</div>
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                MindMesh will now run background scheduled synchronization to keep your workspace continuously up to date.
              </p>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="p-5 border-t border-border bg-card flex items-center justify-between">
          {step === 'config' && (
            <>
              <button
                type="button"
                onClick={() => setIsFirstLoginImportOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip For Now
              </button>
              <button
                type="button"
                onClick={handleStartImport}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Initiate Import</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {step === 'syncing' && (
            <div className="w-full flex items-center justify-center text-xs text-muted-foreground gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
              <span>Please do not close this window while connectors are synchronizing...</span>
            </div>
          )}

          {step === 'completed' && (
            <div className="w-full flex justify-end">
              <button
                type="button"
                onClick={handleFinish}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
