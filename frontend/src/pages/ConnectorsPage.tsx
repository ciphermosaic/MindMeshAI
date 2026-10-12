import React, { useState } from 'react';
import {
  Radio,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Lock,
  ExternalLink,
  RotateCcw,
  Sliders,
  Settings2,
  FileCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/common/Modal';
import { Connector, ConnectorSource } from '../types';

export const ConnectorsPage: React.FC = () => {
  const { connectors, syncConnectorById, syncingConnectors, showToast } = useApp();

  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedConnectorForQr, setSelectedConnectorForQr] = useState<Connector | null>(null);

  // WhatsApp must be first as primary
  const sortedConnectors = [...connectors].sort((a, b) => {
    if (a.type === 'whatsapp') return -1;
    if (b.type === 'whatsapp') return 1;
    if (a.type === 'telegram') return -1;
    return 1;
  });

  const handlePairQr = (c: Connector) => {
    setSelectedConnectorForQr(c);
    setQrModalOpen(true);
  };

  const handleSimulateOAuth = (c: Connector) => {
    showToast('OAuth Session Verified', `${c.name} OAuth credentials and token refresh valid.`);
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="p-6 md:p-8 rounded-3xl bg-card border border-border shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-1">
            <Radio className="w-3.5 h-3.5" />
            <span>Multi-Channel Ingestion Mesh</span>
          </div>
          <h2 className="text-xl font-extrabold text-foreground tracking-tight">
            Message Connectors & Sync Pipelines
          </h2>
          <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
            MindMesh connects directly to your communication accounts, enforces strict client-side PII sanitization, and extracts actionable assignments into unified storage.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-secondary/50 border border-border text-xs space-y-1">
          <div className="font-bold text-foreground flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Zero-Leakage Privacy Policy</span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Authentication codes (OTPs) and private passwords are sanitized before indexing.
          </p>
        </div>
      </div>

      {/* Connectors List (WhatsApp First!) */}
      <div className="space-y-4">
        {sortedConnectors.map((c) => {
          const isSyncing = syncingConnectors[c.id];
          const isWhatsApp = c.type === 'whatsapp';
          const isTelegram = c.type === 'telegram';
          const isGmail = c.type === 'gmail';

          const brandColor =
            isWhatsApp
              ? 'border-emerald-500/30'
              : isTelegram
              ? 'border-sky-500/30'
              : 'border-rose-500/30';

          return (
            <div
              key={c.id}
              className={`p-6 rounded-3xl bg-card border shadow-subtle transition-all space-y-5 ${
                c.isPrimary ? `ring-1 ring-emerald-500/20 ${brandColor}` : 'border-border'
              }`}
            >
              {/* Connector Card Top Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-sm ${
                      isWhatsApp
                        ? 'bg-[#25D366]'
                        : isTelegram
                        ? 'bg-[#229ED9]'
                        : 'bg-[#EA4335]'
                    }`}
                  >
                    {isWhatsApp ? 'WA' : isTelegram ? 'TG' : 'GM'}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-foreground">{c.name}</h3>
                      {c.isPrimary && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                          PRIMARY CONNECTOR
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-secondary text-foreground font-mono">
                        <span className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`} />
                        {isSyncing ? 'Syncing...' : 'Connected'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">
                      Account: {c.accountIdentifier}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  {isWhatsApp && (
                    <button
                      onClick={() => handlePairQr(c)}
                      className="px-3 py-2 rounded-xl bg-secondary hover:bg-muted text-foreground text-xs font-semibold border border-border flex items-center gap-1.5 transition-colors"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Pairing QR</span>
                    </button>
                  )}

                  {isGmail && (
                    <button
                      onClick={() => handleSimulateOAuth(c)}
                      className="px-3 py-2 rounded-xl bg-secondary hover:bg-muted text-foreground text-xs font-semibold border border-border flex items-center gap-1.5 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Re-auth Token</span>
                    </button>
                  )}

                  <button
                    onClick={() => syncConnectorById(c.id)}
                    disabled={isSyncing}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
                  </button>
                </div>
              </div>

              {/* Ingestion & Checkpoint Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-border">
                <div className="p-3 rounded-2xl bg-secondary/40 border border-border">
                  <div className="text-[10px] font-medium text-muted-foreground uppercase">
                    Last Synced
                  </div>
                  <div className="text-xs font-bold text-foreground font-mono mt-0.5">
                    {new Date(c.lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-secondary/40 border border-border">
                  <div className="text-[10px] font-medium text-muted-foreground uppercase">
                    Messages Ingested
                  </div>
                  <div className="text-xs font-bold text-foreground font-mono mt-0.5">
                    {c.messageCount.toLocaleString()}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-secondary/40 border border-border">
                  <div className="text-[10px] font-medium text-muted-foreground uppercase">
                    Extracted Items
                  </div>
                  <div className="text-xs font-bold text-primary font-mono mt-0.5">
                    {c.itemsExtracted} items
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-secondary/40 border border-border">
                  <div className="text-[10px] font-medium text-muted-foreground uppercase">
                    Sanitized Auth Codes
                  </div>
                  <div className="text-xs font-bold text-emerald-500 font-mono mt-0.5">
                    {c.redactedAuthCodesCount} purged
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Privacy Sanitizer Rule Reference Card */}
      <div className="p-6 rounded-3xl bg-card border border-border shadow-subtle space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-bold text-foreground">
              Automated Privacy & Sanitization Filters
            </h3>
          </div>
          <span className="text-xs text-emerald-500 font-mono font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Enforced by Backend Normalizer
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl border border-border bg-secondary/30 space-y-1">
            <span className="font-bold text-foreground">Authentication Codes</span>
            <p className="text-[11px] text-muted-foreground leading-normal">
              OTPs, Telegram login codes, and 2FA SMS patterns are discarded before RAG ingestion.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl border border-border bg-secondary/30 space-y-1">
            <span className="font-bold text-foreground">Contact Redaction</span>
            <p className="text-[11px] text-muted-foreground leading-normal">
              Indian phone numbers (+91...) and private email addresses are masked as [REDACTED].
            </p>
          </div>

          <div className="p-3.5 rounded-2xl border border-border bg-secondary/30 space-y-1">
            <span className="font-bold text-foreground">Checkpoint Management</span>
            <p className="text-[11px] text-muted-foreground leading-normal">
              Continuous sync stores monotonic checkpoints per chat to prevent duplicate records.
            </p>
          </div>
        </div>
      </div>

      {/* QR Code Pairing Simulation Modal */}
      <Modal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        title="WhatsApp Web Pairing"
        description="Scan this QR code with WhatsApp on your phone"
      >
        <div className="text-center py-4 space-y-4">
          <div className="w-48 h-48 mx-auto p-3 bg-white rounded-2xl shadow-md border flex items-center justify-center">
            {/* SVG QR Code Simulation */}
            <div className="w-full h-full bg-slate-900 rounded-lg p-2 flex flex-col justify-between">
              <div className="flex justify-between">
                <div className="w-10 h-10 border-4 border-white bg-slate-900" />
                <div className="w-10 h-10 border-4 border-white bg-slate-900" />
              </div>
              <div className="text-[8px] font-mono text-emerald-400 text-center uppercase tracking-widest font-bold">
                MINDMESH WA SYNC
              </div>
              <div className="flex justify-between">
                <div className="w-10 h-10 border-4 border-white bg-slate-900" />
                <div className="w-8 h-8 bg-white" />
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground max-w-xs mx-auto">
            Open WhatsApp on your phone → Settings → Linked Devices → Link a Device.
          </p>

          <button
            onClick={() => {
              setQrModalOpen(false);
              showToast('WhatsApp Re-paired', 'Session refreshed and active.');
            }}
            className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-colors"
          >
            I have scanned the QR code
          </button>
        </div>
      </Modal>
    </div>
  );
};
