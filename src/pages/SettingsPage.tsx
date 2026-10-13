import React, { useState, useEffect } from 'react';
import {
  User,
  Shield,
  Bell,
  Sun,
  Moon,
  Laptop,
  CheckCircle2,
  Sparkles,
  Lock,
  Save,
  Radio,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { requestNotificationPermission } from '../services/pushNotification';

export const SettingsPage: React.FC = () => {
  const { userProfile, updateProfile, setIsFirstLoginImportOpen, connectors, showToast } = useApp();
  const { theme, setTheme } = useTheme();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [pushEnabled, setPushEnabled] = useState(true);
  const [autoRedact, setAutoRedact] = useState(true);
  const [skipAuthCodes, setSkipAuthCodes] = useState(true);
  const [morningDigest, setMorningDigest] = useState('08:30 AM');

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name);
      setEmail(userProfile.email);
      setRole(userProfile.role);
      setPushEnabled(userProfile.pushNotificationsEnabled);
      setAutoRedact(userProfile.autoRedactSensitiveData);
      setSkipAuthCodes(userProfile.skipAuthCodes);
      setMorningDigest(userProfile.morningDigestTime);
    }
  }, [userProfile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      name,
      email,
      role,
      pushNotificationsEnabled: pushEnabled,
      autoRedactSensitiveData: autoRedact,
      skipAuthCodes,
      morningDigestTime: morningDigest,
    });
  };

  const handleTogglePush = async (checked: boolean) => {
    setPushEnabled(checked);
    if (checked) {
      const perm = await requestNotificationPermission();
      if (perm === 'granted') {
        showToast('Push Enabled', 'Browser push notifications active.');
      }
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-card border border-border shadow-subtle">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-foreground">Settings & Preferences</h2>
          <p className="text-xs text-muted-foreground">
            Manage your account, privacy filters, and cross-channel sync rules
          </p>
        </div>

        <button
          onClick={() => setIsFirstLoginImportOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-secondary hover:bg-muted text-foreground text-xs font-semibold border border-border transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-brand-500" />
          <span>Re-run Message Import</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Account Information Card */}
        <div className="p-6 rounded-3xl bg-card border border-border shadow-subtle space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border">
            <User className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Account Information</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-foreground block mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="font-semibold text-foreground block mb-1.5">Primary Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-foreground block mb-1.5">Role / Focus</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Privacy & Redaction Settings */}
        <div className="p-6 rounded-3xl bg-card border border-border shadow-subtle space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border">
            <Shield className="w-4 h-4 text-emerald-500" />
            <div>
              <h3 className="text-sm font-bold text-foreground">Security & Data Privacy</h3>
              <p className="text-[11px] text-muted-foreground">
                Sanitizes sensitive information before LLM entity extraction and vector storage
              </p>
            </div>
          </div>

          <div className="space-y-3.5 text-xs">
            <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-secondary/30 border border-border cursor-pointer hover:bg-secondary/60 transition-colors">
              <input
                type="checkbox"
                checked={autoRedact}
                onChange={(e) => setAutoRedact(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-primary border-border focus:ring-primary"
              />
              <div>
                <span className="font-bold text-foreground block">
                  Automatic PII Redaction
                </span>
                <span className="text-[11px] text-muted-foreground leading-normal">
                  Masks phone numbers (+91...) and private email addresses as [REDACTED_PHONE] and [REDACTED_EMAIL].
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-secondary/30 border border-border cursor-pointer hover:bg-secondary/60 transition-colors">
              <input
                type="checkbox"
                checked={skipAuthCodes}
                onChange={(e) => setSkipAuthCodes(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-primary border-border focus:ring-primary"
              />
              <div>
                <span className="font-bold text-foreground block">
                  Discard Authentication OTPs & Passwords
                </span>
                <span className="text-[11px] text-muted-foreground leading-normal">
                  Identifies Telegram login codes, Google verification SMS, and credentials, discarding them completely from the database.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="p-6 rounded-3xl bg-card border border-border shadow-subtle space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border">
            <Bell className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-bold text-foreground">Notification Preferences</h3>
          </div>

          <div className="space-y-3.5 text-xs">
            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-secondary/30 border border-border cursor-pointer">
              <div>
                <span className="font-bold text-foreground block">Browser Push Notifications</span>
                <span className="text-[11px] text-muted-foreground">
                  Receive deadline reminders via browser service worker
                </span>
              </div>
              <input
                type="checkbox"
                checked={pushEnabled}
                onChange={(e) => handleTogglePush(e.target.checked)}
                className="w-4 h-4 rounded text-primary border-border focus:ring-primary"
              />
            </label>

            <div className="p-3.5 rounded-2xl bg-secondary/30 border border-border flex items-center justify-between">
              <div>
                <span className="font-bold text-foreground block">Morning Briefing Digest</span>
                <span className="text-[11px] text-muted-foreground">
                  Time to synthesize daily priorities and overdue items
                </span>
              </div>
              <input
                type="text"
                value={morningDigest}
                onChange={(e) => setMorningDigest(e.target.value)}
                className="w-28 px-3 py-1.5 rounded-xl bg-card border border-border text-xs text-foreground font-mono text-center focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Theme Preferences */}
        <div className="p-6 rounded-3xl bg-card border border-border shadow-subtle space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border">
            <Laptop className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-foreground">Appearance & Interface Theme</h3>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs">
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                theme === 'dark'
                  ? 'bg-primary/10 border-primary text-foreground ring-1 ring-primary'
                  : 'bg-card border-border hover:bg-secondary text-muted-foreground'
              }`}
            >
              <Moon className="w-5 h-5 text-indigo-400" />
              <span className="font-bold text-xs">Dark (Linear)</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                theme === 'light'
                  ? 'bg-primary/10 border-primary text-foreground ring-1 ring-primary'
                  : 'bg-card border-border hover:bg-secondary text-muted-foreground'
              }`}
            >
              <Sun className="w-5 h-5 text-amber-500" />
              <span className="font-bold text-xs">Light (Notion)</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme('system')}
              className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                theme === 'system'
                  ? 'bg-primary/10 border-primary text-foreground ring-1 ring-primary'
                  : 'bg-card border-border hover:bg-secondary text-muted-foreground'
              }`}
            >
              <Laptop className="w-5 h-5 text-sky-400" />
              <span className="font-bold text-xs">System Default</span>
            </button>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-glow-primary transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};
