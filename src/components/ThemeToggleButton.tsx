import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { toggleTheme } from '../redux/themeSlice';

const ThemeToggleButton = () => {
  const mode = useSelector((state: RootState) => state.theme.mode);
  const dispatch = useDispatch<AppDispatch>();

  const isDark = mode === 'dark';

  return (
    <TouchableOpacity
      onPress={() => dispatch(toggleTheme())}
      style={[
        styles.button,
        { backgroundColor: isDark ? '#ffffff' : '#111827' },
      ]}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, { color: isDark ? '#111827' : '#ffffff' }]}>
        {isDark ? 'Light Mode' : 'Dark Mode'}
      </Text>
    </TouchableOpacity>
  );
};

export default ThemeToggleButton;

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  text: {
    fontWeight: '600',
    fontSize: 14,
  },
});
