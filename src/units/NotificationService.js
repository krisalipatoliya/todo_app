
import {Platform} from 'react-native';

import notifee, {
  AndroidImportance,
  AndroidNotificationSetting,
  AuthorizationStatus,
  TriggerType,
} from '@notifee/react-native';

const CHANNEL_ID = 'task-reminders';

export const setupNotifications = async (
  requireExactAlarm = true,
) => {
  const permission = await notifee.requestPermission();

  if (
    permission.authorizationStatus ===
    AuthorizationStatus.DENIED
  ) {
    throw new Error(
      'Notification permission denied. Enable notifications in Settings.',
    );
  }

  if (Platform.OS === 'android') {
    await notifee.createChannel({
      id: CHANNEL_ID,
      name: 'Task Reminders',
      importance: AndroidImportance.HIGH,
      sound: 'default',
    });

    const settings = await notifee.getNotificationSettings();
    const channel = await notifee.getChannel(CHANNEL_ID);

    console.log('Notification settings:', settings);
    console.log('Notification channel:', channel);

    if (
      settings.authorizationStatus ===
      AuthorizationStatus.DENIED
    ) {
      throw new Error('App notifications are disabled.');
    }

    if (channel?.blocked) {
      throw new Error(
        'Task Reminders channel is blocked in Android Settings.',
      );
    }

    if (
      requireExactAlarm &&
      settings.android?.alarm ===
        AndroidNotificationSetting.DISABLED
    ) {
      await notifee.openAlarmPermissionSettings();

      throw new Error(
        'Enable Alarms & reminders permission, then schedule again.',
      );
    }
  }

  return true;
};

const createReminder = async (
  id,
  title,
  body,
  timestamp,
) => {
  await setupNotifications(true);

  if (!Number.isFinite(timestamp) || timestamp <= Date.now()) {
    throw new Error('Reminder time must be in the future.');
  }

  await notifee.createTriggerNotification(
    {
      id: String(id),
      title,
      body,
      android: {
        channelId: CHANNEL_ID,
        importance: AndroidImportance.HIGH,
        pressAction: {id: 'default'},
      },
      ios: {
        sound: 'default',
      },
    },
    {
      type: TriggerType.TIMESTAMP,
      timestamp,
      ...(Platform.OS === 'android'
        ? {alarmManager: {allowWhileIdle: true}}
        : {}),
    },
  );

  const pending = await notifee.getTriggerNotifications();
  const registered = pending.some(
    item => item.notification?.id === String(id),
  );

  console.log('Reminder ID:', id);
  console.log('Reminder registered:', registered);
  console.log('Reminder date:', new Date(timestamp).toString());

  return registered;
};

export const scheduleTaskNotification = async (
  taskId,
  taskTitle,
  taskDate,
  taskTime,
) => {
  if (!taskTime) {
    return false;
  }

  const dateTime = new Date(
    `${taskDate}T${taskTime}:00`,
  );

  if (!Number.isFinite(dateTime.getTime())) {
    throw new Error('Invalid task reminder date or time.');
  }

  return createReminder(
    taskId,
    'Task Reminder',
    `Time to complete: ${taskTitle}`,
    dateTime.getTime(),
  );
};

// Immediate notification test
export const testNotification = async () => {
  await setupNotifications(false);

  await notifee.displayNotification({
    id: `test-now-${Date.now()}`,
    title: 'TODO APP Test',
    body: 'Immediate notification is working!',
    android: {
      channelId: CHANNEL_ID,
      importance: AndroidImportance.HIGH,
      pressAction: {id: 'default'},
    },
    ios: {
      sound: 'default',
    },
  });

  return true;
};

// Notification scheduled after 15 seconds
export const testScheduledNotification = async () => {
  const timestamp = Date.now() + 15000;

  return createReminder(
    'test-scheduled-notification',
    'Scheduled Test',
    'Your background reminder is working!',
    timestamp,
  );
};

export const getScheduledNotifications = async () => {
  const pending = await notifee.getTriggerNotifications();

  console.log('Pending reminders:', pending);

  return pending;
};

export const cancelTaskNotification = async taskId => {
  await notifee.cancelNotification(String(taskId));
};
