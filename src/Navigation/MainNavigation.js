import { StyleSheet, Text, View } from 'react-native';
import React, { useState, useEffect } from 'react';
import auth from '@react-native-firebase/auth';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/auth/login/LoginScreen';
import ForgotPasswordScreen from '../screens/auth/login/ForgotPasswordScreen';
import CodeConfirmationScreen from '../screens/auth/login/CodeConfirmationScreen';
import ResetPasswordScreen from '../screens/auth/login/ResetPasswordScreen';
import CreateAccount from '../screens/auth/Register/CreateAccount';
import ProfileCompletion from '../screens/auth/Register/ProfileCompletion';
import IntroScreen from '../screens/intro/IntroScreen';
import TabNavigation from './TabNavigation';
import DiseaseInfoScreen from '../screens/main/DiseaseInfoScreen';
import ListOfDiseases from '../screens/main/ListOfDiseases';
import ProfileScreen from '../screens/main/ProfileScreen';
import UserDetailScreen from '../screens/main/UserDetailScreen';
import SplashScreen from '../screens/auth/SplashScreen';
import DisclaimerScreen from '../screens/auth/DisclaimerScreen';

const Stack = createStackNavigator();

const MainNavigation = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();

  // Handle user state changes
  function onAuthStateChanged(user) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  if (initializing) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator>
      <Stack.Screen name="SplashScreen" component={SplashScreen} options={{
        headerShown: false
      }} />
      <Stack.Screen name="DisclaimerScreen" component={DisclaimerScreen} />
        {user ? (
          <Stack.Group>
            <Stack.Screen
              name="tabNavigation"
              component={TabNavigation}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ProfileScreen"
              component={UserDetailScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="codeConfirmationScreen"
              component={CodeConfirmationScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="diseaseInfoScreen"
              component={DiseaseInfoScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="listOfDiseases"
              component={ListOfDiseases}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="profileCompletion"
              component={ProfileCompletion}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="IntroScreen"
              component={IntroScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="AboutUs"
              component={ProfileScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="loginScreen"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
          </Stack.Group>
        ) : (
          <>
            <Stack.Screen
              name="IntroScreen"
              component={IntroScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="loginScreen"
              component={LoginScreen}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="forgetPassword"
              component={ForgotPasswordScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="resetPasswordScreen"
              component={ResetPasswordScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="profileCompletion"
              component={ProfileCompletion}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="createAccount"
              component={CreateAccount}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="codeConfirmationScreen"
              component={CodeConfirmationScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="tabNavigation"
              component={TabNavigation}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default MainNavigation;

const styles = StyleSheet.create({});
