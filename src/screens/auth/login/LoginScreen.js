import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import React, { useState } from "react";
import { COLORS } from "../../../assets/color/COLOR";
import MainImage from "../../../assets/img/mainImage.png";
import CustomInput from "../../../components/input/CustomInput";
import CustomeButton from "../../../components/Buttons/CustomeButton";
import { useNavigation } from "@react-navigation/native";
import auth from "@react-native-firebase/auth";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {
  checkDeviceExclusivity,
  logoutAndClearDevice,
} from "../../../services/FirebaaseFunctions";

const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onPressRegister = () => {
    navigation.navigate("createAccount");
  };

  const onPresslogin = async () => {
    try {
      if (email.trim() === "" || password.trim() === "") {
        Alert.alert("Incomplete Data", "Please fill in all fields");
        return;
      }

      setIsLoading(true);

      const userCredential = await auth().signInWithEmailAndPassword(
        email,
        password
      );
      const user = userCredential.user;

      const res = await checkDeviceExclusivity(user.uid);
      // Alert.alert("res", res.reason);

      if (!res.canLogin) {
        Alert.alert("Can't Login", res.reason);
        await auth().signOut(); // Sign out if device check fails
        return;
      }

      navigation.reset({
        index: 0,
        routes: [{ name: "tabNavigation" }],
      });
    } catch (error) {
      console.error("Login error:", error);

      let errorMessage = "An error occurred. Please try again.";
      if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address.";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect password.";
      } else if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email.";
      }

      Alert.alert("Login Failed", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const onPressForgetPassword = () => {
    navigation.navigate("forgetPassword");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.contentContainer}>
        <View style={styles.upperContainer}>
          <Image
            source={MainImage}
            resizeMode="contain"
            style={styles.mainImage}
          />
        </View>

        <View style={styles.middleContainer}>
          <Text style={styles.mainText}>Welcome Back! 👋</Text>
          <Text style={styles.subText}>Sign in to continue</Text>

          <View style={styles.inputContainer}>
            <CustomInput
              icon={"email"}
              placeholder={"Email address"}
              value={email}
              textchangeFunction={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <CustomInput
              icon={"lock"}
              placeholder={"Password"}
              value={password}
              textchangeFunction={setPassword}
              password={true}
            />
          </View>

          <TouchableOpacity
            style={styles.forgotPasswordButton}
            onPress={onPressForgetPassword}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.lowerContainer}>
          <CustomeButton
            text={"Sign In"}
            type={"primary"}
            onPressFunction={onPresslogin}
            loading={isLoading}
          />

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account?</Text>
            <TouchableOpacity onPress={onPressRegister}>
              <Text style={styles.registerButtonText}> Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  contentContainer: {
    flex: 1,
    width: "100%",
    padding: 20,
  },
  upperContainer: {
    width: "100%",
    height: "30%",
    justifyContent: "center",
    alignItems: "center",
  },
  mainImage: {
    width: "100%",
    height: "100%",
  },
  middleContainer: {
    width: "100%",
    marginTop: 20,
  },
  mainText: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.black,
    marginBottom: 8,
  },
  subText: {
    fontSize: 16,
    color: COLORS.textgrey,
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  forgotPasswordButton: {
    alignSelf: "flex-end",
    marginTop: 8,
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: COLORS.lightOrange,
    fontWeight: "500",
  },
  lowerContainer: {
    width: "100%",
    marginTop: 20,
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  registerText: {
    color: COLORS.textgrey,
    fontSize: 14,
  },
  registerButtonText: {
    fontSize: 14,
    color: COLORS.lightOrange,
    fontWeight: "600",
  },
});
