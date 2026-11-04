import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { Tabs } from 'expo-router/js-tabs';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS } from '@/constants/colors';

const TAB_ICONS = {
  index: require('@/assets/images/tabIcons/home.png'),
  favorites: require('@/assets/images/tabIcons/fvrt.png'),
  recent: require('@/assets/images/tabIcons/recent.png'),
  profile: require('@/assets/images/tabIcons/user.png'),
} as const;

function TabIcon({
  name,
  color,
  size,
}: {
  name: keyof typeof TAB_ICONS;
  color: string;
  size: number;
}) {
  if (name === 'index') {
    return <MaterialIcons name="home" size={size} color={color} />;
  }

  return (
    <Image
      source={TAB_ICONS[name]}
      style={{ width: size, height: size, tintColor: color }}
      contentFit="contain"
    />
  );
}

function AndroidFloatingTabs() {
  const insets = useSafeAreaInsets();
  const bottomOffset = Math.max(insets.bottom, 12);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textGrey,
        tabBarShowLabel: true,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          position: 'absolute',
          left: 24,
          right: 24,
          bottom: bottomOffset,
          height: 64,
          marginHorizontal: 24,
          borderRadius: 32,
          backgroundColor: 'rgba(255, 255, 255, 0.96)',
          borderTopWidth: 0,
          elevation: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.16,
          shadowRadius: 16,
          paddingTop: 6,
          paddingBottom: 6,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: 2,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <TabIcon name="index" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          tabBarIcon: ({ color, size }) => <TabIcon name="favorites" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="recent"
        options={{
          title: 'Recent',
          tabBarIcon: ({ color, size }) => <TabIcon name="recent" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <TabIcon name="profile" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}

function IOSNativeTabs() {
  return (
    <NativeTabs
      backgroundColor={COLORS.white}
      indicatorColor={COLORS.inputTextBg}
      labelStyle={{
        default: { color: COLORS.textGrey },
        selected: { color: COLORS.primary },
      }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf="house.fill"
          src={TAB_ICONS.index}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="favorites">
        <NativeTabs.Trigger.Label>Favorites</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf="heart.fill"
          src={TAB_ICONS.favorites}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="recent">
        <NativeTabs.Trigger.Label>Recent</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf="clock.fill"
          src={TAB_ICONS.recent}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf="person.fill"
          src={TAB_ICONS.profile}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

export default function AppTabs() {
  if (Platform.OS === 'android') {
    return <AndroidFloatingTabs />;
  }

  return <IOSNativeTabs />;
}
