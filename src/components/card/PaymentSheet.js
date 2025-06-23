import {
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  View,
  Linking,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import React, {useState} from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {COLORS} from '../../assets/color/COLOR';
import {checkCode} from '../../Hooks/api/code';
import {updateUserData, isProfileComplete} from '../../services/FirebaaseFunctions';
import auth from '@react-native-firebase/auth';
import {useNavigation} from '@react-navigation/native';
import {BottomSheetTextInput, BottomSheetView} from '@gorhom/bottom-sheet';

const PaymentSheet = ({rbSheetRef, setrefresh}) => {
  const [isCodeCorrect, setIsCodeCorrect] = useState(false);
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();

  const checkUserProfile = async () => {
    try {
      const isComplete = await isProfileComplete(auth().currentUser.uid);
      if (!isComplete) {
        Alert.alert(
          'Complete Profile Required',
          'Please complete your profile details before making a payment.',
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => rbSheetRef.current.close(),
            },
            {
              text: 'Complete Profile',
              onPress: () => {
                rbSheetRef.current.close();
                navigation.navigate('ProfileScreen');
              },
            },
          ],
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error checking user profile:', error);
      return false;
    }
  };

  const onPressContactUs = async () => {
    const isProfileComplete = await checkUserProfile();
    if (!isProfileComplete) return;

    const url =
      'https://api.whatsapp.com/send?phone=+9203175193394&text=Hello.%20I%20have%20installed%20Doctor%20Oncall%20App.%20How%20I%20can%20get%20premium%20access%20to%20all%20drugs%20and%20diseases%20?%20';
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Make sure WhatsApp is installed on your device');
    });
  };

  const onPressVerify = async () => {
    const isProfileComplete = await checkUserProfile();
    if (!isProfileComplete) return;

    if (!code.trim()) {
      Alert.alert('Error', 'Please enter a verification code');
      return;
    }

    setIsLoading(true);
    try {
      const response = await checkCode(code);
      if (response === 400) {
        setIsCodeCorrect(true);
      } else if (response === 200) {
        await updateUserData(auth().currentUser.uid, 'virified', true);
        setrefresh(prev => !prev);
        rbSheetRef.current.close();
        Alert.alert('Success', 'Your account has been verified successfully for 4 months!');
      }
    } catch (error) {
      console.error('Error verifying code:', error);
      Alert.alert('Error', 'Failed to verify your account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BottomSheetView style={styles.container}>
      {/* Overlay Loader - appears on top of content when loading */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Verifying your code...</Text>
          </View>
        </View>
      )}

      {/* Main Content - always visible */}
      <View style={isLoading && styles.contentBlurred}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Unlock Full Access!</Text>
          <TouchableOpacity 
            onPress={() => rbSheetRef.current.close()}
            disabled={isLoading}
          >
            <Icon name="close" color={isLoading ? COLORS.textgrey : COLORS.black} size={24} />
          </TouchableOpacity>
        </View>

        <Text style={styles.paraText}>
          Unlock all categories and diseases with premium access. Get exclusive
          updates and features. Pay now or use your code for free. App linked to
          your email.
        </Text>

        <View style={styles.contactContainer}>
          <View style={styles.contactRight}>
            <Text style={styles.contactMainText}>Upgrade to Premium</Text>
            <Text style={styles.contactNormText}>
              Unlock a vast knowledge base for endless access.
            </Text>
          </View>
          <View style={styles.contactLeft}>
            <TouchableOpacity 
              style={[styles.contactButton, isLoading && styles.buttonDisabled]} 
              onPress={onPressContactUs}
              disabled={isLoading}
            >
              <Text style={styles.contactButtonText}>Contact Us</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.codeSection}>
          <Text style={styles.haveCodeText}>Have a code?</Text>
          <View style={styles.textinputContainer}>
            <Icon name="form-textbox-password" color={COLORS.primary} size={20} />
            <BottomSheetTextInput
              placeholder="Enter code here"
              style={styles.textinput}
              placeholderTextColor={COLORS.textgrey}
              value={code}
              onChangeText={setCode}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={[
                styles.verifyButton, 
                isLoading && styles.verifyButtonDisabled
              ]}
              onPress={onPressVerify}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Text style={styles.verifyButtonText}>Verify</Text>
              )}
            </TouchableOpacity>
          </View>
          {isCodeCorrect && (
            <Text style={styles.wrongCodeText}>Invalid code. Please try again.</Text>
          )}
        </View>
      </View>
    </BottomSheetView>
  );
};

export default PaymentSheet;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.black,
  },
  paraText: {
    fontSize: 16,
    color: COLORS.textgrey,
    lineHeight: 24,
    marginBottom: 20,
  },
  contactContainer: {
    width: '100%',
    backgroundColor: '#EBFFE8',
    borderWidth: 1,
    borderColor: '#A7D3FE',
    padding: 16,
    flexDirection: 'row',
    borderRadius: 12,
    marginBottom: 24,
  },
  contactRight: {
    flex: 1,
    marginRight: 16,
  },
  contactLeft: {
    justifyContent: 'center',
  },
  contactMainText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EF9327',
    marginBottom: 4,
  },
  contactNormText: {
    fontSize: 14,
    color: COLORS.textgrey,
    lineHeight: 20,
  },
  contactButton: {
    backgroundColor: '#27EF9B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 100,
  },
  contactButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
    textAlign: 'center',
  },
  codeSection: {
    width: '100%',
  },
  haveCodeText: {
    color: COLORS.black,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textinputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#D8DADC',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  textinput: {
    flex: 1,
    color: COLORS.black,
    fontSize: 16,
    marginHorizontal: 8,
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
  },
  verifyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  verifyButtonDisabled: {
    opacity: 0.7,
  },
  verifyButtonText: {
    color: COLORS.black,
    fontSize: 14,
    fontWeight: '600',
  },
  wrongCodeText: {
    color: '#EA452F',
    fontSize: 14,
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.textgrey,
    textAlign: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  contentBlurred: {
    opacity: 0.6,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});