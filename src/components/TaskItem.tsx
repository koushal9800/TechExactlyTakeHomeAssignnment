import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Task } from '../types/task';

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
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.left}
        activeOpacity={0.8}
        onPress={() => onToggleComplete(task.id)}
      >
        <View
          style={[
            styles.statusDot,
            task.completed && styles.statusDotCompleted,
          ]}
        />
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.title,
              task.completed && styles.titleCompleted,
            ]}
            numberOfLines={1}
          >
            {task.title}
          </Text>
          {!!task.description && (
            <Text
              style={[
                styles.description,
                task.completed && styles.descriptionCompleted,
              ]}
              numberOfLines={2}
            >
              {task.description}
            </Text>
          )}
        </View>
      </TouchableOpacity>

      <View style={styles.actions}>
        <TouchableOpacity onPress={() => onEdit(task)}>
          <Text style={styles.actionText}>Edit</Text>
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
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#1f2937',
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
    color: '#e5e7eb',
    fontSize: 15,
    fontWeight: '600',
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: '#6b7280',
  },
  description: {
    color: '#9ca3af',
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
  deleteText: {
    color: '#f97373',
  },
});
