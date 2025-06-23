import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import DiseaseInfoScreen from '../screens/main/DiseaseInfoScreen';
import ListOfDiseases from '../screens/main/ListOfDiseases';
import HomeScreen from '../screens/main/HomeScreen';

const Stack = createStackNavigator();

const HomeNavigation = () => {
  return (
    <Stack.Navigator>
        <Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="diseaseInfoScreen"
        component={DiseaseInfoScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="listOfDiseases"
        component={ListOfDiseases}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
};

export default HomeNavigation;

const styles = StyleSheet.create({});
