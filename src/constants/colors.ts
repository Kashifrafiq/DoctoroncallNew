/**
 * App brand colors migrated from the legacy project.
 * Use alongside `Colors` from `@/constants/theme` for light/dark system theming.
 */

export const COLORS = {
  primary: '#1CA4DD',
  buttonPrimary: '#1CA4DD',
  white: '#FFFFFF',
  buttonSecondary: '#479D04',
  grey: '#7D7D7D',
  icon: '#27B4EF',
  textColorPrimary: '#646464',
  black: '#000000',
  textGrey: '#585858',
  textBlue: '#27B4EF',
  inputTextBg: '#F2F3F8',
  darkGrey: '#8193AB',
  paleYellow: '#EEE4B0',
  lightOrange: '#EDA35F',
  cardColor: '#FFCED3',
  greyLight: '#B7B7B7',
  nameCardBg: '#F2F3F8',
  nameCardBorder: '#CBCBCB',
  infoCardBg: '#F8FFF2',
  tabBarText: '#484C52',
  homeInnerTabBarPrimaryCol: '#F4A75F',
  homeInnerTabBarSecondaryCol: '#32DC2F',
  banner: '#EFA856',
} as const;

export type ColorKey = keyof typeof COLORS;
