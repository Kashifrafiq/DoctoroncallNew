
import 'react-native-gesture-handler';

import React from 'react';

import {
  SafeAreaView,
  StyleSheet,
  Text,
  View
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





function App(){
  

  return (
    <SafeAreaView style={styles.mainContainer} >
      <MainNavigation />
      {/* <Test /> */}
    </SafeAreaView> 
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    width: '100%'
  }
});

export default App;
