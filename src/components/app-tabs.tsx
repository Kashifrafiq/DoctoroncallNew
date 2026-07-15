import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { COLORS } from '@/constants/colors';

export default function AppTabs() {
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
          src={require('@/assets/images/tabIcons/home.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="favorites">
        <NativeTabs.Trigger.Label>Favorites</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
        sf="heart.fill"
          src={require('@/assets/images/tabIcons/fvrt.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="recent">
        <NativeTabs.Trigger.Label>Recent</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
        sf="clock.fill"
          src={require('@/assets/images/tabIcons/recent.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
        sf="person.fill"
          src={require('@/assets/images/tabIcons/user.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
