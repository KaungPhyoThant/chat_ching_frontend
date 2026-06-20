'use client';

import { useEffect } from 'react';
import { message } from 'antd';
import { useNotificationSound } from '@/hooks/useNotificationSound';
import { API_BASE_URL } from '@/config/env';

export function GlobalMessageListener() {
  const { play } = useNotificationSound();

  useEffect(() => {
    const baseUrl = API_BASE_URL || '';
    
    // Connect to SSE stream
    const eventSource = new EventSource(`${baseUrl}/conversations/events`, {
      withCredentials: true, // Needed to send the httpOnly session cookie
    });

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'newMessage') {
          play();
          message.info('New message received from a customer');
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
    };
  }, [play]);

  return null;
}
