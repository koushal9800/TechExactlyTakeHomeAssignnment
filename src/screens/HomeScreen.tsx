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
  deleteTaskInFirestore
} from '../services/taskRemote';
import { requestNotificationPermission, setupNotificationChannel,scheduleTaskReminder,cancelTaskReminder,  } from '../services/notificationService';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import ThemeToggleButton from '../components/ThemeToggleButton';


const HomeScreen: React.FC = () => {
  const user = auth().currentUser;
  const mode = useSelector((state: RootState) => state.theme.mode);
  const isDark = mode === 'dark';

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
          
          setTasks(remoteTasks);
          await saveTasksToStorage(user.uid, remoteTasks);
        } else if (tasks.length > 0) {
         
          await pushTasksToFirestore(user.uid, tasks);
        }
      } catch (error) {
        console.warn('Initial sync error', error);
      } finally {
        setHasInitialRemoteSync(true);
      }
    };

    syncInitial();
  
  }, [user?.uid, isOnline, initialLocalLoaded, hasInitialRemoteSync, tasks]);


  useEffect(() => {
    (async () => {
      await requestNotificationPermission();
      await setupNotificationChannel();
    })();
  }, []);

  const handleLogout = () => {
    auth().signOut();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setEditingTaskId(null);
  };

  
  const updateTasks = async (updater: (prev: Task[]) => Task[]) => {
    setTasks(prev => {
      const updated = updater(prev);
  
      
      saveTasksToStorage(user?.uid, updated).catch(err =>
        console.warn('Error saving tasks', err),
      );
  
      
      if (user?.uid) {
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
  
   
    const defaultReminderAt = now +  5 * 60 * 1000;
  
    setTimeout(() => {
      updateTasks(prev => {
        if (editingTaskId) {
          
          const updated = prev.map(task =>
            task.id === editingTaskId
              ? {
                  ...task,
                  title: title.trim(),
                  description: description.trim() || undefined,
                  updatedAt: now,
                  
                  reminderAt: task.reminderAt ?? defaultReminderAt,
                }
              : task,
          );
  
      
          const updatedTask = updated.find(t => t.id === editingTaskId);
          if (updatedTask) {
            
            cancelTaskReminder(updatedTask.id).catch(() => {});
            scheduleTaskReminder(updatedTask).catch(() => {});
          }
  
          return updated;
        } else {
         
          const newTask: Task = {
            id: now.toString(),
            title: title.trim(),
            description: description.trim() || undefined,
            completed: false,
            createdAt: now,
            updatedAt: now,
            reminderAt: defaultReminderAt,
          };
  
          
          scheduleTaskReminder(newTask).catch(() => {});
  
          return [newTask, ...prev];
        }
      });
  
      resetForm();
      setSubmitting(false);
    }, 120);
  };
  

  const handleEditTask = (task: Task) => {
    if (task.completed) {
     
      console.warn('Completed tasks cannot be edited');
      return;
    }
  
    setEditingTaskId(task.id);
    setTitle(task.title);
    setDescription(task.description || '');
  };
  

  const handleDeleteTask = (id: string) => {
   
    updateTasks(prev => prev.filter(task => task.id !== id));
  
    
    if (editingTaskId === id) {
      resetForm();
    }
  
  
    if (user?.uid) {
      deleteTaskInFirestore(user.uid, id).catch(err =>
        console.warn('Error deleting task in Firestore', err),
      );
    }
  };
  
  

  const handleToggleComplete = (id: string) => {
    const now = Date.now();
    updateTasks(prev =>
      prev.map(task => {
        if (task.id !== id) return task;
        const nextCompleted = !task.completed;
  
        if (nextCompleted) {
          
          cancelTaskReminder(task.id).catch(() => {});
        }
  
        return {
          ...task,
          completed: nextCompleted,
          updatedAt: now,
        };
      }),
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
    style={[
      styles.root,
      { backgroundColor: isDark ? '#020617' : '#f3f4f6' },
    ]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[
              styles.helloText,
              { color: isDark ? '#9ca3af' : '#6b7280' },
            ]}>Hey,</Text>
            <Text style={[
              styles.userText,
              { color: isDark ? '#e5e7eb' : '#111827' },
            ]}>{user?.email ?? 'Guest'}</Text>
            {isOnline === false && (
              <Text style={styles.offlineText}>
                Offline mode • changes saved locally
              </Text>
            )}
          </View>
          <ThemeToggleButton />
          <PrimaryButton
            title="Logout"
            onPress={handleLogout}
            style={styles.logoutButton}
          />
        </View>

        {/* Summary */}
        <View style={[
          styles.summaryCard,
          {
            backgroundColor: isDark ? '#0b1120' : '#ffffff',
            borderColor: isDark ? '#1f2937' : '#e5e7eb',
          },
        ]}>
          <Text style={[
            styles.summaryTitle,
            { color: isDark ? '#e5e7eb' : '#111827' },
          ]}>Your tasks</Text>
          <Text style={[
            styles.summaryText,
            { color: isDark ? '#9ca3af' : '#6b7280' },
          ]}>
            {completedCount} completed • {tasks.length - completedCount} pending
          </Text>
        </View>

        {/* Task Form */}
        <View style={[
          styles.card,
          {
            backgroundColor: isDark ? '#0b1120' : '#ffffff',
            borderColor: isDark ? '#1f2937' : '#e5e7eb',
          },
        ]}>
          <Text style={[
            styles.cardTitle,
            { color: isDark ? '#e5e7eb' : '#111827' },
          ]}>
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
              <Text style={[
                styles.emptyTitle,
                { color: isDark ? '#9ca3af' : '#4b5563' },
              ]}>No tasks yet</Text>
              <Text  style={[
                styles.emptyText,
                { color: isDark ? '#6b7280' : '#9ca3af' },
              ]}>
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
   
    fontSize: 14,
  },
  userText: {

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
    
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
   
  },
  summaryTitle: {
  
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  summaryText: {
 
    fontSize: 13,
  },
  card: {
  
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  cardTitle: {
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
