import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task } from '../types/task';

const getTasksKey = (uid?: string | null) =>
  uid ? `tasks_${uid}` : 'tasks_guest';

export const loadTasksFromStorage = async (
  uid?: string | null,
): Promise<Task[]> => {
  try {
    const json = await AsyncStorage.getItem(getTasksKey(uid));
    if (!json) return [];
    const parsed: Task[] = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Error loading tasks from storage', error);
    return [];
  }
};

export const saveTasksToStorage = async (
  uid: string | null | undefined,
  tasks: Task[],
): Promise<void> => {
  try {
    await AsyncStorage.setItem(getTasksKey(uid), JSON.stringify(tasks));
  } catch (error) {
    console.warn('Error saving tasks to storage', error);
  }
};
