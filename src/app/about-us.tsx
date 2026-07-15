import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS } from '@/constants/colors';

export default function AboutUsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>About Us</Text>
        <Text style={styles.subtitle}>Screen migration coming next.</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backLink}>Go back</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.black,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    color: COLORS.textGrey,
    textAlign: 'center',
  },
  backLink: {
    marginTop: 20,
    fontSize: 16,
    color: COLORS.buttonPrimary,
    fontWeight: '600',
  },
});
