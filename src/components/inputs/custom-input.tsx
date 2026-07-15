import Entypo from '@expo/vector-icons/Entypo';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useState, type ComponentProps } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { COLORS } from '@/constants/colors';

type CustomInputProps = {
  icon: ComponentProps<typeof Entypo>['name'];
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  password?: boolean;
  editable?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  maxLength?: number;
  multiline?: boolean;
  numberOfLines?: number;
  style?: StyleProp<ViewStyle>;
};

export function CustomInput({
  icon,
  placeholder,
  value,
  onChangeText,
  password = false,
  editable = true,
  keyboardType = 'default',
  autoCapitalize = 'none',
  maxLength,
  multiline = false,
  numberOfLines = 1,
  style,
}: CustomInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((current) => !current);
  };

  return (
    <View
      style={[
        styles.container,
        isFocused && styles.focusedContainer,
        !editable && styles.disabledContainer,
        style,
      ]}>
      <View style={styles.leftContainer}>
        <Entypo name={icon} size={20} color={isFocused ? COLORS.lightOrange : COLORS.icon} />
      </View>

      <View style={styles.middleContainer}>
        <TextInput
          style={[
            styles.input,
            !editable && styles.disabledInput,
            multiline && styles.multilineInput,
          ]}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={password && !showPassword}
          placeholderTextColor={COLORS.textGrey}
          editable={editable}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          maxLength={maxLength}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </View>

      {password ? (
        <Pressable style={styles.rightContainer} onPress={togglePasswordVisibility}>
          <MaterialCommunityIcons
            name={showPassword ? 'eye-off' : 'eye'}
            size={20}
            color={COLORS.icon}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.grey,
    borderRadius: 12,
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    shadowColor: COLORS.darkGrey,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  focusedContainer: {
    borderColor: COLORS.lightOrange,
    shadowColor: COLORS.lightOrange,
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  disabledContainer: {
    backgroundColor: COLORS.inputTextBg,
    borderColor: COLORS.grey,
  },
  leftContainer: {
    width: '12%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  middleContainer: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
  },
  rightContainer: {
    width: '12%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    color: COLORS.black,
    fontSize: 16,
    paddingVertical: 0,
  },
  disabledInput: {
    color: COLORS.textGrey,
  },
  multilineInput: {
    textAlignVertical: 'top',
    paddingTop: 12,
    paddingBottom: 12,
  },
});
