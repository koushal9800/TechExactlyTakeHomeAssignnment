import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Task } from '../types/task';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
}) => {
  const mode = useSelector((state: RootState) => state.theme.mode);
  const isDark = mode === 'dark';

  const isCompleted = task.completed;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#020617' : '#ffffff',
          borderColor: isDark ? '#1f2937' : '#e5e7eb',
        },
      ]}
    >
      <TouchableOpacity
        style={styles.left}
        activeOpacity={0.8}
        onPress={() => onToggleComplete(task.id)}
      >
        <View
          style={[
            styles.statusDot,
            isCompleted && styles.statusDotCompleted,
          ]}
        />
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.title,
              {
                color: isDark ? '#e5e7eb' : '#111827',
              },
              isCompleted && styles.titleCompleted,
            ]}
            numberOfLines={1}
          >
            {task.title}
          </Text>

          {!!task.description && (
            <Text
              style={[
                styles.description,
                {
                  color: isDark ? '#9ca3af' : '#6b7280',
                },
                isCompleted && styles.descriptionCompleted,
              ]}
              numberOfLines={2}
            >
              {task.description}
            </Text>
          )}
        </View>
      </TouchableOpacity>

      <View style={styles.actions}>
        <TouchableOpacity
          disabled={isCompleted}
          onPress={() => onEdit(task)}
        >
          <Text
            style={[
              styles.actionText,
              isCompleted && styles.actionTextDisabled,
            ]}
          >
            Edit
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => onDelete(task.id)}>
          <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TaskItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    alignItems: 'center',
  },
  left: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },
  statusDot: {
    width: 20,
    height: 20,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#4b5563',
    marginRight: 10,
  },
  statusDotCompleted: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: '#6b7280',
  },
  description: {
    fontSize: 13,
    marginTop: 2,
  },
  descriptionCompleted: {
    color: '#6b7280',
  },
  actions: {
    marginLeft: 12,
    alignItems: 'flex-end',
  },
  actionText: {
    color: '#38bdf8',
    fontSize: 12,
    marginBottom: 4,
    fontWeight: '500',
  },
  actionTextDisabled: {
    color: '#4b5563',
  },
  deleteText: {
    color: '#f97373',
  },
});
