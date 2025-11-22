import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import NetInfo from '@react-native-community/netinfo';
import CommonInput from '../components/CommonInput';
import PrimaryButton from '../components/PrimaryButton';
import TaskItem from '../components/TaskItem';
import { Task } from '../types/task';
import {
  loadTasksFromStorage,
  saveTasksToStorage,
} from '../storage/taskStorage';
import {
  fetchTasksFromFirestore,
  pushTasksToFirestore,
} from '../services/taskRemote';

const HomeScreen: React.FC = () => {
  const user = auth().currentUser;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [initialLocalLoaded, setInitialLocalLoaded] = useState(false);
  const [hasInitialRemoteSync, setHasInitialRemoteSync] = useState(false);

  // 🔌 NetInfo: track connectivity
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const online = !!state.isConnected && state.isInternetReachable !== false;
      setIsOnline(online);
    });

    return unsubscribe;
  }, []);

  // 📥 Load tasks from AsyncStorage on mount
  useEffect(() => {
    const loadLocalTasks = async () => {
      const local = await loadTasksFromStorage(user?.uid);
      setTasks(local);
      setInitialLocalLoaded(true);
    };
    loadLocalTasks();
  }, [user?.uid]);

  // 🔄 Initial sync: when online + logged in
  useEffect(() => {
    const syncInitial = async () => {
      if (
        !user?.uid ||
        !isOnline ||
        !initialLocalLoaded ||
        hasInitialRemoteSync
      )
        return;

      try {
        const remoteTasks = await fetchTasksFromFirestore(user.uid);

        if (remoteTasks.length > 0) {
          // Remote already has tasks → trust remote
          setTasks(remoteTasks);
          await saveTasksToStorage(user.uid, remoteTasks);
        } else if (tasks.length > 0) {
          // Remote empty, local has tasks → push local
          await pushTasksToFirestore(user.uid, tasks);
        }
      } catch (error) {
        console.warn('Initial sync error', error);
      } finally {
        setHasInitialRemoteSync(true);
      }
    };

    syncInitial();
    // we intentionally include "tasks" so if you had local tasks & go online,
    // they get pushed on first sync
  }, [user?.uid, isOnline, initialLocalLoaded, hasInitialRemoteSync, tasks]);

  const handleLogout = () => {
    auth().signOut();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setEditingTaskId(null);
  };

  // 🧠 Helper to update tasks state + local storage (+ remote if online)
  const updateTasks = async (updater: (prev: Task[]) => Task[]) => {
    setTasks(prev => {
      const updated = updater(prev);
      // Save to AsyncStorage (fire & forget)
      saveTasksToStorage(user?.uid, updated).catch(err =>
        console.warn('Error saving tasks', err),
      );
      // Push to Firestore if online & logged in
      if (user?.uid && isOnline) {
        pushTasksToFirestore(user.uid, updated).catch(err =>
          console.warn('Error pushing tasks to Firestore', err),
        );
      }
      return updated;
    });
  };

  const handleSubmitTask = () => {
    if (!title.trim()) {
      console.warn('Title is required');
      return;
    }

    setSubmitting(true);
    const now = Date.now();

    setTimeout(() => {
      updateTasks(prev => {
        if (editingTaskId) {
          // Update existing
          return prev.map(task =>
            task.id === editingTaskId
              ? {
                  ...task,
                  title: title.trim(),
                  description: description.trim() || undefined,
                  updatedAt: now,
                }
              : task,
          );
        } else {
          // Add new
          const newTask: Task = {
            id: now.toString(),
            title: title.trim(),
            description: description.trim() || undefined,
            completed: false,
            createdAt: now,
            updatedAt: now,
          };
          return [newTask, ...prev];
        }
      });

      resetForm();
      setSubmitting(false);
    }, 120);
  };

  const handleEditTask = (task: Task) => {
    setEditingTaskId(task.id);
    setTitle(task.title);
    setDescription(task.description || '');
  };

  const handleDeleteTask = (id: string) => {
    updateTasks(prev => prev.filter(task => task.id !== id));
    if (editingTaskId === id) {
      resetForm();
    }
  };

  const handleToggleComplete = (id: string) => {
    const now = Date.now();
    updateTasks(prev =>
      prev.map(task =>
        task.id === id
          ? { ...task, completed: !task.completed, updatedAt: now }
          : task,
      ),
    );
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  const completedCount = useMemo(
    () => tasks.filter(t => t.completed).length,
    [tasks],
  );

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.helloText}>Hey,</Text>
            <Text style={styles.userText}>{user?.email ?? 'Guest'}</Text>
            {isOnline === false && (
              <Text style={styles.offlineText}>
                Offline mode • changes saved locally
              </Text>
            )}
          </View>
          <PrimaryButton
            title="Logout"
            onPress={handleLogout}
            style={styles.logoutButton}
          />
        </View>

        {/* Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Your tasks</Text>
          <Text style={styles.summaryText}>
            {completedCount} completed • {tasks.length - completedCount} pending
          </Text>
        </View>

        {/* Task Form */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {editingTaskId ? 'Edit task' : 'Add new task'}
          </Text>
          <CommonInput
            label="Title"
            placeholder="e.g. Complete React Native screen"
            value={title}
            onChangeText={setTitle}
          />
          <CommonInput
            label="Description"
            placeholder="Optional details..."
            value={description}
            onChangeText={setDescription}
            multiline
            style={{ height: 80, textAlignVertical: 'top' }}
          />

          <View style={styles.formButtonsRow}>
            <PrimaryButton
              title={editingTaskId ? 'Save changes' : 'Add task'}
              onPress={handleSubmitTask}
              loading={submitting}
              disabled={submitting || !title.trim()}
              style={{ flex: 1 }}
            />

            {editingTaskId && (
              <PrimaryButton
                title="Cancel"
                onPress={handleCancelEdit}
                style={[styles.cancelButton, { marginLeft: 10 }]}
              />
            )}
          </View>
        </View>

        {/* Task List */}
        <View style={styles.listContainer}>
          {tasks.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No tasks yet</Text>
              <Text style={styles.emptyText}>
                Start by adding your first task above.
              </Text>
            </View>
          ) : (
            <FlatList
              data={tasks}
              keyExtractor={item => item.id}
              contentContainerStyle={{ paddingBottom: 60 }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TaskItem
                  task={item}
                  onToggleComplete={handleToggleComplete}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                />
              )}
            />
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#020617', // dark background
  },
  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  helloText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  userText: {
    color: '#e5e7eb',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 2,
  },
  offlineText: {
    marginTop: 4,
    color: '#f97373',
    fontSize: 12,
  },
  logoutButton: {
    width: 90,
    height: 40,
  },
  summaryCard: {
    backgroundColor: '#0b1120',
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  summaryTitle: {
    color: '#e5e7eb',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  summaryText: {
    color: '#9ca3af',
    fontSize: 13,
  },
  card: {
    backgroundColor: '#0b1120',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
    marginBottom: 16,
  },
  cardTitle: {
    color: '#e5e7eb',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  formButtonsRow: {
    flexDirection: 'row',
    marginTop: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#111827',
  },
  listContainer: {
    flex: 1,
    marginTop: 4,
  },
  emptyState: {
    marginTop: 24,
    alignItems: 'center',
  },
  emptyTitle: {
    color: '#9ca3af',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 13,
    textAlign: 'center',
  },
});
