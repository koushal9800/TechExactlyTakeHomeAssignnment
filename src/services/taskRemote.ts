import firestore from '@react-native-firebase/firestore';
import { Task } from '../types/task';

const tasksCollection = (uid: string) =>
  firestore().collection('users').doc(uid).collection('tasks');

export const fetchTasksFromFirestore = async (uid: string): Promise<Task[]> => {
  const snapshot = await tasksCollection(uid)
    .orderBy('createdAt', 'desc')
    .get();

  return snapshot.docs.map(doc => {
    const data = doc.data() as any;
    return {
      id: doc.id,
      title: data.title,
      description: data.description,
      completed: data.completed ?? false,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt ?? data.createdAt,
      reminderAt: data.reminderAt ?? null,
    } as Task;
  });
};

export const pushTasksToFirestore = async (
  uid: string,
  tasks: Task[],
): Promise<void> => {
  const batch = firestore().batch();
  const colRef = tasksCollection(uid);

  tasks.forEach(task => {
    const docRef = colRef.doc(task.id);
    batch.set(docRef, task);
  });

  await batch.commit();
};


export const deleteTaskInFirestore = async (uid: string, taskId: string) => {
    await tasksCollection(uid).doc(taskId).delete();
  };
