import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import auth from '@react-native-firebase/auth';
import PrimaryButton from '../components/PrimaryButton';

const HomeScreen: React.FC = () => {
  const user = auth().currentUser;

  const onLogout = () => {
    auth().signOut();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome 👋</Text>
      <Text style={styles.text}>You are logged in as:</Text>
      <Text style={styles.email}>{user?.email}</Text>

      <PrimaryButton
        title="Logout"
        onPress={onLogout}
        style={{ marginTop: 24 }}
      />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 16 },
  text: { fontSize: 16, marginBottom: 4 },
  email: { fontSize: 18, fontWeight: '500', marginBottom: 24 },
});
