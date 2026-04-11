
import 'react-native-gesture-handler';

import React, { useEffect } from 'react';

import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  StatusBar
} from 'react-native';
import IntroScreen from './src/screens/intro/IntroScreen';
import LoginScreen from './src/screens/auth/login/LoginScreen';
import ForgotPasswordScreen from './src/screens/auth/login/ForgotPasswordScreen';
import CodeConfirmationScreen from './src/screens/auth/login/CodeConfirmationScreen';
import ResetPasswordScreen from './src/screens/auth/login/ResetPasswordScreen';
import CreateAccount from './src/screens/auth/Register/CreateAccount';
import ProfileCompletion from './src/screens/auth/Register/ProfileCompletion';
import HomeScreen from './src/screens/main/HomeScreen';
import ListOfDiseases from './src/screens/main/ListOfDiseases';
import DiseaseInfoScreen from './src/screens/main/DiseaseInfoScreen';
import MainNavigation from './src/Navigation/MainNavigation';
import Test from './src/screens/Test';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import auth from "@react-native-firebase/auth";
import RevenueCatService from "./src/services/RevenueCatService";





function App(){
  useEffect(() => {
    const init = async () => {
      const userId = auth().currentUser?.uid || null;
      await RevenueCatService.initialize(userId);
    };

    init();

    const unsubscribe = auth().onAuthStateChanged(async (user) => {
      if (!RevenueCatService.isInitialized) return;
      if (user?.uid) {
        await RevenueCatService.logIn(user.uid);
      } else {
        await RevenueCatService.logOut();
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <SafeAreaView style={styles.mainContainer} >
      <StatusBar backgroundColor={'black'} barStyle='dark-content' />
      <MainNavigation />
      {/* <Test /> */}
    </SafeAreaView> 
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    paddingTop: StatusBar.currentHeight,
    flex: 1,
    width: '100%'
  }
});

export default App;
