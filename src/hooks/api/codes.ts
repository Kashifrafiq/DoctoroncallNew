import { Alert } from 'react-native';

import { checkCodeStatus, markCodeAsUsed } from '@/services/firebase-functions';

type CodeResult = {
  success: boolean;
  message: string;
  status?: string;
};

export async function checkCode(code: string): Promise<CodeResult> {
  try {
    if (!code || code.trim() === '') {
      Alert.alert('Error', 'Please enter a valid code');
      return {
        success: false,
        message: 'Please enter a valid code',
        status: 'invalid',
      };
    }

    const result = await checkCodeStatus(code.trim());

    if (result.success) {
      Alert.alert('Success', result.message);
    } else {
      Alert.alert('Error', result.message);
    }

    return result;
  } catch (error) {
    console.error('Error checking code:', error);
    Alert.alert('Error', 'Failed to check code. Please try again later.');
    return {
      success: false,
      message: 'Failed to check code. Please try again later.',
      status: 'error',
    };
  }
}

export async function useCode(code: string): Promise<CodeResult> {
  try {
    if (!code || code.trim() === '') {
      Alert.alert('Error', 'Please enter a valid code');
      return {
        success: false,
        message: 'Please enter a valid code',
      };
    }

    await markCodeAsUsed(code.trim());

    const message = 'Code marked as used successfully';
    Alert.alert('Success', message);
    return {
      success: true,
      message,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to use code. Please try again later.';
    console.error('Error using code:', error);
    Alert.alert('Error', message);
    return {
      success: false,
      message,
    };
  }
}
