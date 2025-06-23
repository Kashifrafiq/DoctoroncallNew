import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import DiseaseInfoScreen from '../screens/main/DiseaseInfoScreen';
import ListOfDiseases from '../screens/main/ListOfDiseases';
import RecentScreem from '../screens/main/RecentScreem';

const Stack = createStackNavigator();

const RecentNavigation = () => {
  return (
    <Stack.Navigator>
        <Stack.Screen
        name="RecentScreem"
        component={RecentScreem}
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

export default RecentNavigation;

const styles = StyleSheet.create({});