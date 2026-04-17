import type { NotificationItem } from '@vben/layouts';

import { computed, ref } from 'vue';

import { useAppConfig } from '@vben/hooks';
import { useAccessStore } from '@vben/stores';

import { notification } from 'ant-design-vue';
import { defineStore } from 'pinia';

import { sseConnectionClose } from '#/api/core/auth';

const { apiURL, clientId, sseEnable, websocketEnable } = useAppConfig(
  import.meta.env,
  import.meta.env.PROD,
);

export const useNotifyStore = defineStore('notify', () => {
  const notifications = ref<NotificationItem[]>([]);
  const connected = ref(false);

  const unreadCount = computed(
    () => notifications.value.filter((n) => !n.isRead).length,
  );

  // SSE state
  let sseInstance: EventSource | null = null;
  let sseHandleMessage: ((event: MessageEvent) => void) | null = null;
  let sseHandleError: (() => void) | null = null;
  let sseReconnectAttempts = 0;
  const SSE_MAX_RECONNECT = 5;
  const SSE_BASE_DELAY = 1000;

  // WebSocket state
  let wsInstance: null | WebSocket = null;
  let wsReconnectAttempts = 0;
  let wsHeartbeatTimer: null | ReturnType<typeof setInterval> = null;
  const WS_MAX_RECONNECT = 5;
  const WS_BASE_DELAY = 1000;
  const WS_HEARTBEAT_INTERVAL = 30_000;

  function addNotification(message: string) {
    const item = parseMessageToNotification(message);
    notifications.value.unshift(item);
    if (notifications.value.length > 50) {
      notifications.value.length = 50;
    }
    notification.info({
      description: item.message,
      duration: 3,
      message: item.title,
    });
  }

  function parseMessageToNotification(raw: string): NotificationItem {
    const match = raw.match(/^\[(.+?)\]\s*(.*)/);
    if (match) {
      return {
        id: Date.now() + Math.random(),
        avatar: '',
        date: new Date().toLocaleString(),
        isRead: false,
        message: match[2] || raw,
        title: match[1],
      };
    }
    return {
      id: Date.now() + Math.random(),
      avatar: '',
      date: new Date().toLocaleString(),
      isRead: false,
      message: raw,
      title: '系统消息',
    };
  }

  // --- SSE ---

  function buildSseUrl(): null | string {
    const token = useAccessStore().accessToken;
    if (!token) return null;
    const base = apiURL.replace(/\/$/, '');
    return `${base}/resource/sse?Authorization=Bearer ${token}&clientid=${clientId}`;
  }

  function connectSSE() {
    if (!sseEnable || sseInstance) return;

    try {
      const url = buildSseUrl();
      if (!url) return;

      sseInstance = new EventSource(url);
      connected.value = true;

      sseHandleMessage = (event: MessageEvent) => {
        sseReconnectAttempts = 0;
        if (event.data) {
          addNotification(event.data);
        }
      };

      sseHandleError = () => {
        sseInstance?.close();
        cleanupSseListeners();
        sseInstance = null;
        connected.value = false;
        reconnectSSE();
      };

      sseInstance.addEventListener('message', sseHandleMessage);
      sseInstance.addEventListener('error', sseHandleError);
    } catch {
      sseInstance = null;
      connected.value = false;
    }
  }

  function reconnectSSE() {
    if (sseReconnectAttempts >= SSE_MAX_RECONNECT) return;
    if (!isLoggedIn()) return;

    const delay = SSE_BASE_DELAY * 2 ** sseReconnectAttempts;
    sseReconnectAttempts++;
    setTimeout(() => {
      if (isLoggedIn()) connectSSE();
    }, delay);
  }

  function disconnectSSE() {
    if (sseInstance) {
      cleanupSseListeners();
      sseInstance.close();
      sseInstance = null;
    }
    sseReconnectAttempts = SSE_MAX_RECONNECT;
    connected.value = false;
  }

  function cleanupSseListeners() {
    if (sseInstance && sseHandleMessage && sseHandleError) {
      sseInstance.removeEventListener('message', sseHandleMessage);
      sseInstance.removeEventListener('error', sseHandleError);
      sseHandleMessage = null;
      sseHandleError = null;
    }
  }

  // --- WebSocket ---

  function buildWsUrl(): null | string {
    const token = useAccessStore().accessToken;
    if (!token) return null;
    const base = apiURL.replace(/^http/, 'ws').replace(/\/$/, '');
    return `${base}/resource/websocket?Authorization=Bearer ${token}&clientid=${clientId}`;
  }

  function connectWebSocket() {
    if (!websocketEnable || wsInstance) return;

    try {
      const url = buildWsUrl();
      if (!url) return;

      wsInstance = new WebSocket(url);
      connected.value = true;

      const handleOpen = () => {
        wsReconnectAttempts = 0;
        startWsHeartbeat();
      };

      const handleMessage = (event: MessageEvent) => {
        if (event.data === 'pong') return;
        addNotification(event.data);
      };

      const handleClose = () => {
        if (wsInstance) {
          wsInstance.removeEventListener('open', handleOpen);
          wsInstance.removeEventListener('message', handleMessage);
          wsInstance.removeEventListener('close', handleClose);
          wsInstance.removeEventListener('error', handleError);
        }
        wsInstance = null;
        stopWsHeartbeat();
        connected.value = false;
        reconnectWebSocket();
      };

      const handleError = () => {
        wsInstance?.close();
      };

      wsInstance.addEventListener('open', handleOpen);
      wsInstance.addEventListener('message', handleMessage);
      wsInstance.addEventListener('close', handleClose);
      wsInstance.addEventListener('error', handleError);
    } catch {
      wsInstance = null;
      connected.value = false;
    }
  }

  function reconnectWebSocket() {
    if (wsReconnectAttempts >= WS_MAX_RECONNECT) return;
    if (!isLoggedIn()) return;

    const delay = WS_BASE_DELAY * 2 ** wsReconnectAttempts;
    wsReconnectAttempts++;
    setTimeout(() => {
      if (isLoggedIn()) connectWebSocket();
    }, delay);
  }

  function startWsHeartbeat() {
    stopWsHeartbeat();
    wsHeartbeatTimer = setInterval(() => {
      if (wsInstance?.readyState === WebSocket.OPEN) {
        wsInstance.send('ping');
      }
    }, WS_HEARTBEAT_INTERVAL);
  }

  function stopWsHeartbeat() {
    if (wsHeartbeatTimer) {
      clearInterval(wsHeartbeatTimer);
      wsHeartbeatTimer = null;
    }
  }

  function disconnectWebSocket() {
    stopWsHeartbeat();
    if (wsInstance) {
      wsInstance.close();
      wsInstance = null;
    }
    wsReconnectAttempts = WS_MAX_RECONNECT;
    connected.value = false;
  }

  // --- Common ---

  function isLoggedIn(): boolean {
    return !!useAccessStore().accessToken;
  }

  function init() {
    try {
      if (sseEnable) {
        connectSSE();
      } else if (websocketEnable) {
        connectWebSocket();
      }
    } catch {
      // Connection failure should not affect page rendering
    }
  }

  async function destroy() {
    disconnectSSE();
    disconnectWebSocket();
    notifications.value = [];
    try {
      await sseConnectionClose();
    } catch {
      // ignore
    }
  }

  function markRead(id: number | string) {
    const item = notifications.value.find((n) => n.id === id);
    if (item) item.isRead = true;
  }

  function remove(id: number | string) {
    notifications.value = notifications.value.filter((n) => n.id !== id);
  }

  function clearAll() {
    notifications.value = [];
  }

  function markAllRead() {
    notifications.value.forEach((n) => (n.isRead = true));
  }

  function setNotifications(list: NotificationItem[]) {
    notifications.value = list;
  }

  function $reset() {
    destroy();
  }

  return {
    $reset,
    clearAll,
    connected,
    destroy,
    init,
    markAllRead,
    markRead,
    notifications,
    remove,
    setNotifications,
    unreadCount,
  };
});
