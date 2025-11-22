import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import CommonInput from '../components/CommonInput';
import PrimaryButton from '../components/PrimaryButton';
import TaskItem from '../components/TaskItem';
import {Task} from '../types/task'

const HomeScreen: React.FC = () => {
  const user = auth().currentUser;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleLogout = () => {
    auth().signOut();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setEditingTaskId(null);
  };

  const handleSubmitTask = () => {
    if (!title.trim()) {
     
      console.warn('Title is required');
      return;
    }

    setSubmitting(true);

    setTimeout(() => {
      if (editingTaskId) {
        
        setTasks(prev =>
          prev.map(task =>
            task.id === editingTaskId
              ? { ...task, title: title.trim(), description: description.trim() }
              : task,
          ),
        );
      } else {
        
        const newTask: Task = {
          id: Date.now().toString(),
          title: title.trim(),
          description: description.trim() || undefined,
          completed: false,
          createdAt: Date.now(),
        };
        setTasks(prev => [newTask, ...prev]);
      }

      resetForm();
      setSubmitting(false);
    }, 150); 
  };

  const handleEditTask = (task: Task) => {
    setEditingTaskId(task.id);
    setTitle(task.title);
    setDescription(task.description || '');
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
    if (editingTaskId === id) {
      resetForm();
    }
  };

  const handleToggleComplete = (id: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task,
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
