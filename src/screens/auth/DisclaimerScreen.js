import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import {COLORS} from '../../assets/color/COLOR';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DisclaimerScreen = ({navigation}) => {
  const handleAccept = async () => {
    try {
      await AsyncStorage.setItem('disclaimerAccepted', 'true');
      navigation.replace('loginScreen');
    } catch (error) {
      console.error('Error saving disclaimer status:', error);
    }
  };

  const handleSkip = () => {
    navigation.replace('loginScreen');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Medical Disclaimer</Text>
          
          <View style={styles.disclaimerBox}>
            <Text style={styles.disclaimerText}>
              This application is intended for use by qualified medical professionals only. If you are not a licensed healthcare provider, please consult with a qualified doctor before making any medical diagnosis or treatment decisions.
            </Text>
            <Text style={styles.disclaimerText}>
              The information provided by this app is not a substitute for professional medical advice, diagnosis, or treatment.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.acceptButton}
            onPress={handleAccept}>
            <Text style={styles.acceptButtonText}>I Understand and Accept</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

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
    backgroundColor: COLORS.inputTextBG,
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  disclaimerText: {
    fontSize: 16,
    color: COLORS.textgrey,
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
    borderColor: COLORS.textgrey,
  },
  skipButtonText: {
    color: COLORS.textgrey,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DisclaimerScreen; 