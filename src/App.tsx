import React from 'react';
import { useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { FloatingAILauncher } from './components/layout/FloatingAILauncher';
import { CommandPalette } from './components/layout/CommandPalette';
import { ToastContainer } from './components/common/Toast';
import { SourceInspectorModal } from './components/common/SourceInspectorModal';
import { NotificationDrawer } from './components/notifications/NotificationDrawer';
import { FirstLoginImportModal } from './components/onboarding/FirstLoginImportModal';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { ChatPage } from './pages/ChatPage';
import { CalendarPage } from './pages/CalendarPage';
import { EventsPage } from './pages/EventsPage';
import { DeadlinesPage } from './pages/DeadlinesPage';
import { TasksPage } from './pages/TasksPage';
import { ConnectorsPage } from './pages/ConnectorsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';

export const App: React.FC = () => {
  const { currentTab, isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return (
      <>
        <LoginPage />
        <ToastContainer />
      </>
    );
  }

  const renderActivePage = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'chat':
        return <ChatPage />;
      case 'calendar':
        return <CalendarPage />;
      case 'events':
        return <EventsPage />;
      case 'deadlines':
        return <DeadlinesPage />;
      case 'tasks':
        return <TasksPage />;
      case 'connectors':
        return <ConnectorsPage />;
      case 'notifications':
        return <NotificationsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground select-none">
      {/* Collapsible Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {renderActivePage()}
        </main>
      </div>

      {/* Global Overlays & Modals */}
      <FloatingAILauncher />
      <CommandPalette />
      <NotificationDrawer />
      <SourceInspectorModal />
      <FirstLoginImportModal />
      <ToastContainer />
    </div>
  );
};

export default App;
