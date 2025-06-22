import React from 'react';
import { useSelector } from 'react-redux';
import AuthNavigator from './AuthNavigator';
import TabNavigator from './TabNavigator';

const AppNavigator = () => {
  // Change default to false to make AuthNavigator the default on app launch
  const { isAuthenticated = false } = useSelector((state) => state.auth);
  
  return isAuthenticated ? <TabNavigator /> : <AuthNavigator />;
};

export default AppNavigator;
