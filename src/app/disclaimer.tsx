import { type Href, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS } from '@/constants/colors';
import { isIntroSeen, setDisclaimerAccepted } from '@/services/local-storage';

export default function DisclaimerScreen() {
  const router = useRouter();

  const navigateAfterDisclaimer = async () => {
    const introSeen = await isIntroSeen();
    router.replace((introSeen ? '/auth/login' : '/intro') as Href);
  };

  const handleAccept = async () => {
    try {
      await setDisclaimerAccepted();
      await navigateAfterDisclaimer();
    } catch (error) {
      console.error('Error saving disclaimer status:', error);
    }
  };

  const handleSkip = () => {
    navigateAfterDisclaimer();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Medical Disclaimer</Text>

          <View style={styles.disclaimerBox}>
            <Text style={styles.disclaimerText}>
              This application is intended for use by qualified medical professionals only. If you
              are not a licensed healthcare provider, please consult with a qualified doctor before
              making any medical diagnosis or treatment decisions.
            </Text>
            <Text style={styles.disclaimerText}>
              The information provided by this app is not a substitute for professional medical
              advice, diagnosis, or treatment.
            </Text>
          </View>

          <Pressable style={styles.acceptButton} onPress={handleAccept}>
            <Text style={styles.acceptButtonText}>I Understand and Accept</Text>
          </Pressable>

          <Pressable style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: 24,
  },
  disclaimerBox: {
    backgroundColor: COLORS.inputTextBg,
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  disclaimerText: {
    fontSize: 16,
    color: COLORS.textGrey,
    lineHeight: 24,
    marginBottom: 16,
  },
  acceptButton: {
    backgroundColor: COLORS.darkGrey,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  acceptButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.textGrey,
  },
  skipButtonText: {
    color: COLORS.textGrey,
    fontSize: 16,
    fontWeight: '600',
  },
});
