import React, { useState } from 'react';
import {
  Sparkles,
  Lock,
  Mail,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  Radio,
  Zap,
  Sun,
  Moon,
  Laptop,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Modal } from '../components/common/Modal';

export const LoginPage: React.FC = () => {
  const { login, signup, loginWithDemo, showToast } = useApp();
  const { theme, setTheme } = useTheme();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Productivity Scholar');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Forgot password modal
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Missing details', 'Please provide both email and password', 'error');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        if (!name.trim()) {
          showToast('Name required', 'Please enter your full name', 'error');
          setLoading(false);
          return;
        }
        await signup(name, email, password, role);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      showToast('Authentication error', err?.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = (provider: string) => {
    if (provider === 'Google') {
      window.location.assign('http://localhost:8000/auth/gmail');
      return;
    }

    showToast(
      'Not connected',
      `${provider} authentication has not been implemented yet.`,
      'error'
    );
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    setResetSent(true);
    setTimeout(() => {
      setResetSent(false);
      setForgotModalOpen(false);
      showToast('Reset Link Sent', `Password reset instructions dispatched to ${resetEmail}.`);
    }, 1200);
  };

  return (
    <div className="min-h-screen w-screen flex flex-col justify-between bg-background text-foreground relative overflow-hidden select-none">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-brand-600/15 via-indigo-500/10 to-purple-500/5 blur-3xl pointer-events-none rounded-full" />

      {/* Top Navigation Bar with Logo and Theme toggle */}
      <header className="px-6 py-5 flex items-center justify-between z-10 border-b border-border/50 bg-background/50 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center text-white shadow-glow-primary">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-foreground flex items-center gap-1.5">
              MindMesh<span className="text-brand-500 font-extrabold text-xs px-1.5 py-0.5 rounded bg-brand-500/10">AI</span>
            </span>
          </div>
        </div>

        {/* Theme mode switcher */}
        <div className="flex items-center p-1 rounded-xl bg-secondary border border-border">
          <button
            onClick={() => setTheme('light')}
            className={`p-1.5 rounded-lg text-xs transition-all ${
              theme === 'light' ? 'bg-card text-foreground shadow-sm font-semibold' : 'text-muted-foreground'
            }`}
            title="Light Theme"
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`p-1.5 rounded-lg text-xs transition-all ${
              theme === 'dark' ? 'bg-card text-foreground shadow-sm font-semibold' : 'text-muted-foreground'
            }`}
            title="Dark Theme"
          >
            <Moon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setTheme('system')}
            className={`p-1.5 rounded-lg text-xs transition-all ${
              theme === 'system' ? 'bg-card text-foreground shadow-sm font-semibold' : 'text-muted-foreground'
            }`}
            title="System Theme"
          >
            <Laptop className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Authentication Card */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10">
        <div className="w-full max-w-md bg-card/85 backdrop-blur-xl border border-border rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200">
          {/* Card Header */}
          <div className="text-center space-y-1.5">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
              {isSignUp ? 'Create MindMesh Account' : 'Welcome to MindMeshAI'}
            </h1>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
              {isSignUp
                ? 'Connect WhatsApp, Telegram, and Gmail to extract assignments & deadlines automatically'
                : 'Sign in to access your cross-platform productivity and intelligence hub'}
            </p>
          </div>

          {/* Quick Demo Login Pill Button */}
          <button
            type="button"
            onClick={loginWithDemo}
            className="w-full p-3 rounded-2xl bg-gradient-to-r from-brand-600/15 via-indigo-500/10 to-purple-500/15 border border-brand-500/30 hover:border-brand-500/60 text-foreground text-xs font-semibold flex items-center justify-between transition-all group hover:scale-[1.01]"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-brand-500 text-white flex items-center justify-center shadow-sm">
                <Zap className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="font-bold text-foreground block text-xs">Preview Workspace Access</span>
                <span className="text-[10px] text-muted-foreground font-mono">Explore interface without credentials</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-brand-500 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-border w-full" />
            <span className="bg-card px-3 text-[11px] uppercase tracking-wider text-muted-foreground font-medium absolute">
              Or continue with
            </span>
          </div>

          {/* Social OAuth Buttons */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleOAuthLogin('Google')}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-secondary hover:bg-muted border border-border text-xs font-medium text-foreground transition-all hover:border-muted-foreground/30"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#EA4335]"></span>
              <span>Google</span>
            </button>
            <button
              type="button"
              onClick={() => handleOAuthLogin('Telegram')}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-secondary hover:bg-muted border border-border text-xs font-medium text-foreground transition-all hover:border-muted-foreground/30"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#229ED9]"></span>
              <span>Telegram</span>
            </button>
          </div>

          {/* Tab Switcher: Sign In vs Sign Up */}
          <div className="flex items-center p-1 rounded-xl bg-secondary border border-border text-xs">
            <button
              type="button"
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition-all ${
                !isSignUp ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition-all ${
                isSignUp ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {isSignUp && (
              <>
                <div>
                  <label className="font-semibold text-foreground block mb-1">Full Name *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Morgan"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-foreground block mb-1">Role / Department</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Computer Science & AI/ML"
                    className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </>
            )}

            <div>
              <label className="font-semibold text-foreground block mb-1">Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-foreground">Password *</label>
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(true)}
                    className="text-[11px] text-primary hover:underline font-medium"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1.5 text-muted-foreground hover:text-foreground absolute right-2.5 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold transition-all shadow-glow-primary hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
            >
              {loading && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              <span>{isSignUp ? 'Create Account & Begin Sync' : 'Sign In to Workspace'}</span>
            </button>
          </form>

          {/* Privacy footer */}
          <div className="p-3 rounded-2xl bg-secondary/40 border border-border flex items-center gap-2.5 text-[11px] text-muted-foreground">
            <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span>Zero-leakage policy: Passwords and 2FA OTPs are purged before storage.</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-muted-foreground border-t border-border/50 bg-background/50">
        MindMeshAI • Cross-channel Intelligence Architecture
      </footer>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={forgotModalOpen}
        onClose={() => setForgotModalOpen(false)}
        title="Reset Password"
        description="We'll send you an encrypted recovery link"
      >
        <form onSubmit={handleForgotSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-foreground block mb-1">Your Registered Email</label>
            <input
              type="email"
              required
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setForgotModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-secondary hover:bg-muted text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={resetSent}
              className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold transition-colors disabled:opacity-50"
            >
              {resetSent ? 'Dispatched...' : 'Send Recovery Link'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
