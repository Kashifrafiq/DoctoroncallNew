import {StyleSheet, Text, TextInput, View, TouchableOpacity} from 'react-native';
import React, {useState} from 'react';
import {COLORS} from '../../assets/color/COLOR';
import Icons from 'react-native-vector-icons/Entypo';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const CustomInput = ({
  icon,
  placeholder,
  value,
  textchangeFunction,
  password,
  editable = true,
  keyboardType = 'default',
  autoCapitalize = 'none',
  maxLength,
  multiline = false,
  numberOfLines = 1,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);
  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <View 
      style={[
        styles.container,
        isFocused && styles.focusedContainer,
        !editable && styles.disabledContainer,
      ]}>
      <View style={styles.leftContainer}>
        <Icons 
          name={icon} 
          size={20} 
          color={isFocused ? COLORS.lightOrange : COLORS.icon} 
        />
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
          onChangeText={textchangeFunction}
          secureTextEntry={password && !showPassword}
          placeholderTextColor={COLORS.textgrey}
          editable={editable}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          maxLength={maxLength}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </View>
      {password && (
        <TouchableOpacity 
          style={styles.rightContainer}
          onPress={togglePasswordVisibility}>
          <Icon
            name={showPassword ? 'eye-off' : 'eye'}
            size={20}
            color={COLORS.icon}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default CustomInput;

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
    backgroundColor: COLORS.inputTextBG,
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
    color: COLORS.textgrey,
  },
  multilineInput: {
    textAlignVertical: 'top',
    paddingTop: 12,
    paddingBottom: 12,
  },
});
