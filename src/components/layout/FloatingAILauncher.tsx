import React, { useState } from 'react';
import { Sparkles, X, Send, Maximize2, Bot, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { ChatMessage } from '../../types';

export const FloatingAILauncher: React.FC = () => {
  const { currentTab, setCurrentTab, isFloatingChatOpen, setIsFloatingChatOpen } = useApp();
  const [input, setInput] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: 'Hi! Ask me anything about your synchronized messages, upcoming deadlines, or active tasks.',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [isTyping, setIsTyping] = useState<boolean>(false);

  // Show floating launcher on non-chat pages
  if (currentTab === 'chat') return null;

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setIsTyping(true);

    try {
      const response = await api.sendChatMessage(currentInput);
      setMessages((prev) => [...prev, response]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: 'MindMesh AI backend is currently unreachable. Please verify your FastAPI service is running.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Floating Chat Popover Window */}
      {isFloatingChatOpen && (
        <div className="absolute bottom-14 right-0 w-80 sm:w-96 h-[460px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/80 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-brand-500 text-white flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-foreground">MindMesh AI Quick Chat</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setIsFloatingChatOpen(false);
                  setCurrentTab('chat');
                }}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                title="Open Full Chat View"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsFloatingChatOpen(false)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages list */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'assistant' && (
                  <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-3 h-3" />
                  </div>
                )}
                <div
                  className={`p-2.5 rounded-xl max-w-[85%] leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-primary text-white font-medium rounded-tr-none'
                      : 'bg-secondary text-foreground border border-border rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex items-center gap-2 text-muted-foreground text-[11px] p-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                Searching WhatsApp, Telegram, Gmail...
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div className="px-3 py-1.5 border-t border-border bg-card flex gap-1.5 overflow-x-auto text-[10px]">
            <button
              onClick={() => {
                setInput('What deadlines are upcoming?');
              }}
              className="px-2 py-1 rounded-md bg-secondary hover:bg-muted text-muted-foreground hover:text-foreground whitespace-nowrap transition-colors"
            >
              Upcoming deadlines
            </button>
            <button
              onClick={() => {
                setInput('Any WhatsApp meetings?');
              }}
              className="px-2 py-1 rounded-md bg-secondary hover:bg-muted text-muted-foreground hover:text-foreground whitespace-nowrap transition-colors"
            >
              WhatsApp meetings
            </button>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 border-t border-border bg-card flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              className="flex-1 px-3 py-1.5 rounded-xl bg-secondary border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="p-2 rounded-xl bg-primary hover:bg-primary-hover text-white disabled:opacity-50 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* Launcher Button */}
      <button
        onClick={() => setIsFloatingChatOpen(!isFloatingChatOpen)}
        className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 hover:from-brand-500 hover:to-indigo-400 text-white shadow-glow-primary flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95"
        title="MindMesh AI Assistant"
      >
        <Sparkles className="w-5 h-5" />
      </button>
    </div>
  );
};
