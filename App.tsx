import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { Provider, useSelector } from 'react-redux';
import { store, RootState } from './src/redux/store';
import RootNavigator from './src/navigation/RootNavigator';


const AppInner = () => {
  const mode = useSelector((state: RootState) => state.theme.mode);
  const navigationTheme = mode === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <NavigationContainer theme={navigationTheme}>
      <RootNavigator />
    </NavigationContainer>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <AppInner />
    </Provider>
  );
};

export default App;
