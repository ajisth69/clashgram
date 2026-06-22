import { Capacitor } from '@capacitor/core';
import type { PluginListenerHandle } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import type {
  ActionPerformed as LocalActionPerformed,
  LocalNotificationSchema,
} from '@capacitor/local-notifications';
import { PushNotifications } from '@capacitor/push-notifications';
import type {
  ActionPerformed as PushActionPerformed,
  PushNotificationSchema,
  Token,
} from '@capacitor/push-notifications';

export const CLASHGRAM_NOTIFICATION_CHANNEL_ID = 'clashgram_messages_high';
export const CLASHGRAM_NOTIFICATION_ACTION_TYPE_ID = 'clashgram_message_actions';

export type NotificationPermissionResult = {
  local: boolean;
  push: boolean;
};

export type NotificationHandlers = {
  onPushToken?: (token: string) => void;
  onRegistrationError?: (error: string) => void;
  onForegroundLocalNotification?: (notification: LocalNotificationSchema) => void;
  onForegroundPushNotification?: (notification: PushNotificationSchema) => void;
  onLocalAction?: (action: LocalActionPerformed) => void;
  onPushAction?: (action: PushActionPerformed) => void;
};

class NotificationService {
  private listeners: PluginListenerHandle[] = [];

  private isInitialized = false;

  async init(handlers: NotificationHandlers = {}): Promise<NotificationPermissionResult> {
    if (!Capacitor.isNativePlatform()) {
      return { local: false, push: false };
    }

    const permissions = await this.requestPermissions();

    if (Capacitor.getPlatform() === 'android') {
      await this.createAndroidChannels();
    }

    await LocalNotifications.registerActionTypes({
      types: [{
        id: CLASHGRAM_NOTIFICATION_ACTION_TYPE_ID,
        actions: [
          { id: 'open', title: 'Open', foreground: true },
          { id: 'mark_read', title: 'Mark read' },
          { id: 'reply', title: 'Reply', foreground: true, input: true, inputButtonTitle: 'Send' },
        ],
      }],
    });

    if (!this.isInitialized) {
      await this.attachListeners(handlers);
      this.isInitialized = true;
    }

    if (permissions.push) {
      await PushNotifications.register();
    }

    return permissions;
  }

  async requestPermissions(): Promise<NotificationPermissionResult> {
    if (!Capacitor.isNativePlatform()) {
      return { local: false, push: false };
    }

    const localStatus = await LocalNotifications.checkPermissions();
    const localPermission = localStatus.display === 'prompt' || localStatus.display === 'prompt-with-rationale'
      ? await LocalNotifications.requestPermissions()
      : localStatus;

    const pushStatus = await PushNotifications.checkPermissions();
    const pushPermission = pushStatus.receive === 'prompt' || pushStatus.receive === 'prompt-with-rationale'
      ? await PushNotifications.requestPermissions()
      : pushStatus;

    return {
      local: localPermission.display === 'granted',
      push: pushPermission.receive === 'granted',
    };
  }

  async scheduleLocalNotification(options: {
    id?: number;
    title: string;
    body: string;
    largeBody?: string;
    at?: Date;
    badge?: number;
    threadIdentifier?: string;
    data?: Record<string, unknown>;
  }): Promise<number> {
    const id = options.id ?? this.createNotificationId();

    await LocalNotifications.schedule({
      notifications: [{
        id,
        title: options.title,
        body: options.body,
        largeBody: options.largeBody,
        channelId: CLASHGRAM_NOTIFICATION_CHANNEL_ID,
        sound: 'clashgram_notification.wav',
        actionTypeId: CLASHGRAM_NOTIFICATION_ACTION_TYPE_ID,
        autoCancel: true,
        schedule: options.at ? { at: options.at, allowWhileIdle: true } : undefined,
        threadIdentifier: options.threadIdentifier,
        extra: {
          badge: options.badge,
          ...options.data,
        },
      }],
    });

    return id;
  }

  async clearDelivered(): Promise<void> {
    await Promise.all([
      LocalNotifications.removeAllDeliveredNotifications(),
      PushNotifications.removeAllDeliveredNotifications(),
    ]);
  }

  async destroy(): Promise<void> {
    await Promise.all(this.listeners.map((listener) => listener.remove()));
    this.listeners = [];
    this.isInitialized = false;
  }

  private async createAndroidChannels(): Promise<void> {
    const channel = {
      id: CLASHGRAM_NOTIFICATION_CHANNEL_ID,
      name: 'Messages',
      description: 'Incoming Clashgram messages and mentions',
      importance: 4 as const,
      visibility: 1 as const,
      sound: 'clashgram_notification.wav',
      vibration: true,
      lights: true,
      lightColor: '#8774E1',
    };

    await Promise.all([
      LocalNotifications.createChannel(channel),
      PushNotifications.createChannel(channel),
    ]);
  }

  private async attachListeners(handlers: NotificationHandlers): Promise<void> {
    const nextListeners = await Promise.all([
      PushNotifications.addListener('registration', (token: Token) => {
        handlers.onPushToken?.(token.value);
      }),
      PushNotifications.addListener('registrationError', (error) => {
        handlers.onRegistrationError?.(error.error);
      }),
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        handlers.onForegroundPushNotification?.(notification);
      }),
      PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
        handlers.onPushAction?.(action);
      }),
      LocalNotifications.addListener('localNotificationReceived', (notification) => {
        handlers.onForegroundLocalNotification?.(notification);
      }),
      LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
        handlers.onLocalAction?.(action);
      }),
    ]);

    this.listeners.push(...nextListeners);
  }

  private createNotificationId(): number {
    return Math.floor(Date.now() % 2147483647);
  }
}

export default new NotificationService();
