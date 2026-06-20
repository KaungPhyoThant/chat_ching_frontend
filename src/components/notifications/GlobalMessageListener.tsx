'use client';

import { useEffect } from 'react';
import { App } from 'antd';
import { useQueryClient } from '@tanstack/react-query';
import { useNotificationSound } from '@/hooks/useNotificationSound';
import { API_BASE_URL } from '@/config/env';
import { conversationKeys } from '@/features/conversations/hooks/useConversations';

export function GlobalMessageListener() {
  const { play } = useNotificationSound();
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  useEffect(() => {
    const enableBrowserNotifications = () => {
      if ('Notification' in window && Notification.permission === 'default') {
        void Notification.requestPermission();
      }
    };

    window.addEventListener('click', enableBrowserNotifications, { once: true });
    window.addEventListener('keydown', enableBrowserNotifications, { once: true });

    const baseUrl = API_BASE_URL || '';
    const eventSource = new EventSource(`${baseUrl}/conversations/events`, {
      withCredentials: true,
    });

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'newMessage') {
          void queryClient.invalidateQueries({ queryKey: conversationKeys.list });
          play();
          message.info('New message received from a customer');

          if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification('New customer message', {
              body: 'A customer sent a new Telegram message.',
              tag: `conversation-${data.payload?.conversationId ?? 'new'}`,
            });
            notification.onclick = () => {
              window.focus();
              window.location.assign('/conversations');
              notification.close();
            };
          }
        }
      } catch {
        // Ignore parse errors silently
      }
    };

    eventSource.onerror = () => {
      // EventSource automatically attempts to reconnect on error.
    };

    return () => {
      eventSource.close();
      window.removeEventListener('click', enableBrowserNotifications);
      window.removeEventListener('keydown', enableBrowserNotifications);
    };
  }, [message, play, queryClient]);

  return null;
}
