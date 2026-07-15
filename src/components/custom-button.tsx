import { ActivityIndicator, Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { COLORS } from '@/constants/colors';

type ButtonType = 'primary' | 'secondary';

type CustomButtonProps = {
  text: string;
  type: ButtonType;
  onPress: () => void;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function CustomButton({ text, type, onPress, loading = false, style }: CustomButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={[
        styles.container,
        type === 'primary' ? styles.containerPrimary : styles.containerSecondary,
        loading && styles.containerDisabled,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={type === 'primary' ? COLORS.white : COLORS.buttonSecondary} />
      ) : (
        <Text style={type === 'primary' ? styles.primaryText : styles.secondaryText}>{text}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 15,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  primaryText: {
    fontSize: 22,
    color: COLORS.white,
  },
  secondaryText: {
    fontSize: 22,
    color: COLORS.buttonSecondary,
  },
  containerPrimary: {
    backgroundColor: COLORS.buttonPrimary,
  },
  containerSecondary: {
    borderColor: COLORS.buttonSecondary,
    borderWidth: 1,
  },
  containerDisabled: {
    opacity: 0.7,
  },
});
