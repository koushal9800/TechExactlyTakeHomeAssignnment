
import React from 'react';
import {
  TextInput,
  StyleSheet,
  TextInputProps,
  View,
  Text,
  ViewStyle,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

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
  const mode = useSelector((state: RootState) => state.theme.mode);
  const isDark = mode === 'dark';

  const inputBg = isDark ? '#020617' : '#ffffff';
  const border = isDark ? '#1f2937' : '#d1d5db';
  const textColor = isDark ? '#f9fafb' : '#111827';
  const labelColor = isDark ? '#9ca3af' : '#6b7280';
  const placeholderColor = isDark ? '#6b7280' : '#9ca3af';
  const errorColor = '#f97373';

  return (
    <View style={[styles.container, containerStyle]}>
      {!!label && <Text style={[styles.label, { color: labelColor }]}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: inputBg,
            borderColor: border,
            color: textColor,
          },
          style,
        ]}
        placeholderTextColor={placeholderColor}
        {...rest}
      />
      {!!error && <Text style={[styles.error, { color: errorColor }]}>{error}</Text>}
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
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
  },
  error: {
    marginTop: 4,
    fontSize: 12,
  },
});
