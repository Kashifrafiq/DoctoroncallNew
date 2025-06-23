import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import DiseaseInfoScreen from '../screens/main/DiseaseInfoScreen';
import ListOfDiseases from '../screens/main/ListOfDiseases';
import FvrtScreen from '../screens/main/FvrtScreen';
import UserDetailScreen from '../screens/main/UserDetailScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
const Stack = createStackNavigator();

const ProfileNavigation = () => {
  return (
    <Stack.Navigator>
        <Stack.Screen
        name="ProfileScreen"
        component={UserDetailScreen}
        options={{headerShown: false}}
      />
     <Stack.Screen
        name="AboutUs"
        component={ProfileScreen}
        options={{headerShown: false}}
      />
     
    </Stack.Navigator>
  );
};

export default ProfileNavigation;

const styles = StyleSheet.create({});