import AsyncStorage from '@react-native-async-storage/async-storage';

const DISCLAIMER_KEY = 'disclaimerAccepted';
const INTRO_SEEN_KEY = 'introSeen';

export async function setDisclaimerAccepted(): Promise<void> {
  await AsyncStorage.setItem(DISCLAIMER_KEY, 'true');
}

export async function isDisclaimerAccepted(): Promise<boolean> {
  const value = await AsyncStorage.getItem(DISCLAIMER_KEY);
  return value === 'true';
}

export async function setIntroSeen(): Promise<void> {
  await AsyncStorage.setItem(INTRO_SEEN_KEY, 'true');
}

export async function isIntroSeen(): Promise<boolean> {
  const value = await AsyncStorage.getItem(INTRO_SEEN_KEY);
  return value === 'true';
}

export async function storeData(key: string, value: unknown): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function getData<T = unknown>(key: string): Promise<T | null> {
  const json = await AsyncStorage.getItem(key);
  if (json === null) {
    return null;
  }

  return JSON.parse(json) as T;
}
