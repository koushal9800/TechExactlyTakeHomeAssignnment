import React from 'react';
import {
  TextInput,
  StyleSheet,
  TextInputProps,
  View,
  Text,
  ViewStyle,
} from 'react-native';

interface CommonInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

const CommonInput: React.FC<CommonInputProps> = ({
  label,
  error,
  style,
  containerStyle,
  ...rest
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {!!label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor="#6b7280"
        {...rest}
      />
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

export default CommonInput;

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 6,
    fontSize: 14,
    fontWeight: '500',
    color: '#9ca3af',
  },
  input: {
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
    backgroundColor: '#020617',
    color: '#f9fafb',
  },
  error: {
    marginTop: 4,
    color: '#f97373',
    fontSize: 12,
  },
});
