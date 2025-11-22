// src/navigation/RootNavigator.tsx
import React from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import AuthStack from './AuthStack';
import AppStack from './AppStack';
import { View, ActivityIndicator } from 'react-native';

const RootNavigator: React.FC = () => {
  const [initializing, setInitializing] = React.useState(true);
  const [user, setUser] = React.useState<FirebaseAuthTypes.User | null>(null);

  React.useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(currentUser => {
      setUser(currentUser);
      if (initializing) setInitializing(false);
    });

    return unsubscribe;
  }, [initializing]);

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return user ? <AppStack /> : <AuthStack />;
};

export default RootNavigator;
