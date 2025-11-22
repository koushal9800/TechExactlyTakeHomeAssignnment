import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { AuthStackParamList } from '../types/navigation';
import CommonInput from '../components/CommonInput';
import PrimaryButton from '../components/PrimaryButton';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

interface LoginFormValues {
  email: string;
  password: string;
}

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Enter a valid email')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Minimum 6 characters')
    .required('Password is required'),
});

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const initialValues: LoginFormValues = { email: '', password: '' };

  const handleLogin = async (
    values: LoginFormValues,
    setSubmitting: (isSubmitting: boolean) => void,
  ) => {
    try {
      await auth().signInWithEmailAndPassword(
        values.email.trim(),
        values.password,
      );
    } catch (error: any) {
      console.log(error);
      let message = 'Something went wrong';

      if (error.code === 'auth/user-not-found') {
        message = 'No user found with this email.';
      } else if (error.code === 'auth/wrong-password') {
        message = 'Incorrect password.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address.';
      }

      console.warn(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.heading}>Welcome back 👋</Text>
          <Text style={styles.subHeading}>
            Login to continue to your account
          </Text>

          <Formik
            initialValues={initialValues}
            validationSchema={LoginSchema}
            onSubmit={(values, { setSubmitting }) =>
              handleLogin(values, setSubmitting)
            }
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
              isSubmitting,
              isValid,
              dirty,
            }) => (
              <>
                <CommonInput
                  label="Email"
                  placeholder="you@example.com"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  value={values.email}
                  error={touched.email && errors.email ? errors.email : ''}
                />

                <CommonInput
                  label="Password"
                  placeholder="••••••••"
                  secureTextEntry
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  value={values.password}
                  error={
                    touched.password && errors.password ? errors.password : ''
                  }
                />

                <PrimaryButton
                  title="Login"
                  onPress={handleSubmit as any}
                  loading={isSubmitting}
                  disabled={!isValid || !dirty || isSubmitting}
                  style={{ marginTop: 8 }}
                />
              </>
            )}
          </Formik>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don’t have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.footerLink}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#020617',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#0b1120',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    color: '#e5e7eb',
    marginBottom: 6,
  },
  subHeading: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 24,
  },
  footerRow: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  footerLink: {
    marginLeft: 4,
    color: '#6366f1',
    fontWeight: '600',
    fontSize: 14,
  },
});
