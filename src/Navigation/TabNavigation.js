import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {COLORS} from '../assets/color/COLOR';

// Import your navigation components
import HomeNavigation from './HomeNavigation';
import SavedNavigation from './SavedNavigation';
import RecentNavigation from './RecentNavigation';
import ProfileNavigation from './ProfileNavigation';

const Tab = createBottomTabNavigator();

const TabIcon = ({focused, iconName, label, bgColor}) => (
  <View style={styles.tabBarItem}>
    <View style={[
      styles.iconContainer,
   
    ]}>
      <Icon 
        name={iconName} 
        size={24} 
        color={focused ? COLORS.textblue : COLORS.textgrey} 
      />
    </View>
    <Text style={[
      styles.tabBarLabel,
      {color: focused ? COLORS.textblue : COLORS.textgrey}
    ]}>
      {label}
    </Text>
  </View>
);

const TabNavigation = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: COLORS.white,
          height: '7%',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: -5},
          shadowOpacity: 0.1,
          shadowRadius: 10,
          elevation: 10,
        },
        tabBarShowLabel: false,
        
      }}>
      <Tab.Screen
        name="Home"
        component={HomeNavigation}
        options={{
          headerShown: false,
          tabBarIcon: ({focused}) => (
            <TabIcon 
              focused={focused} 
              iconName="home-outline" 
              label="Home" 
              bgColor="#B9FFB2" 
            />
          ),
        }}
      />
      <Tab.Screen
        name="Saved"
        component={SavedNavigation}
        options={{
          headerShown: false,
          tabBarIcon: ({focused}) => (
            <TabIcon 
              focused={focused} 
              iconName="heart-outline" 
              label="Saved" 
              bgColor="#FFED8F" 
            />
          ),
        }}
      />
      <Tab.Screen
        name="Recent"
        component={RecentNavigation}
        options={{
          headerShown: false,
          tabBarIcon: ({focused}) => (
            <TabIcon 
              focused={focused} 
              iconName="clock-outline" 
              label="Recent" 
              bgColor="#ACE7FF" 
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileNavigation}
        options={{
          headerShown: false,
         
          tabBarIcon: ({focused}) => (
            <TabIcon 
              focused={focused} 
              iconName="account-outline" 
              label="Profile" 
              bgColor="#FBC8FF" 
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigation;

const styles = StyleSheet.create({
  tabBarItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
    bottom: 0,
    marginTop: 10,
  },
  iconContainer: {
   
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    // marginBottom: 4,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '600',
  
  },
});