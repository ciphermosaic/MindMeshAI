export async function registerPushServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator) || !('Notification' in window)) {
    console.warn('Browser push notifications not supported on this browser.');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });
    console.log('MindMeshAI Service Worker registered successfully:', registration.scope);
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error('Failed to request notification permission:', error);
    return 'denied';
  }
}

export async function showBrowserNotification(
  title: string,
  options: {
    body: string;
    icon?: string;
    badge?: string;
    id?: string;
    tag?: string;
  }
): Promise<boolean> {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return false;
  }

  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification(title, {
        body: options.body,
        icon: options.icon || '/favicon.svg',
        tag: options.tag || 'mindmesh-alert',
      });
      return true;
    } else {
      new Notification(title, {
        body: options.body,
        icon: options.icon || '/favicon.svg',
      });
      return true;
    }
  } catch (err) {
    console.error('Failed to show browser notification:', err);
    return false;
  }
}
