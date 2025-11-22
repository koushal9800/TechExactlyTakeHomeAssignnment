import notifee, {
    AndroidImportance,
    TimestampTrigger,
    TriggerType,
  } from '@notifee/react-native';
  import { Task } from '../types/task';
  
  export const requestNotificationPermission = async () => {
    await notifee.requestPermission(); 
  };
  
  export const setupNotificationChannel = async () => {
    await notifee.createChannel({
      id: 'tasks',
      name: 'Task Reminders',
      importance: AndroidImportance.HIGH,
    });
  };
  
  
  export const scheduleTaskReminder = async (task: Task) => {
    if (!task.reminderAt) return;
    if (task.reminderAt <= Date.now()) return; 
  
    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: task.reminderAt,
      alarmManager: {
        allowWhileIdle: true,
      },
    };
  
    await notifee.createTriggerNotification(
      {
        id: task.id,
        title: task.title,
        body: task.description || 'Task reminder',
        android: {
          channelId: 'tasks',
          pressAction: {
            id: 'default',
          },
        },
      },
      trigger,
    );
  };
  
  export const cancelTaskReminder = async (taskId: string) => {
    await notifee.cancelTriggerNotification(taskId);
  };
  