import { Alert } from "react-native";
import {
  checkCodeStatus,
  markCodeAsUsed,
} from "../../services/FirebaaseFunctions";

// Check code status using Firestore
export const checkCode = async (code) => {
  try {
    if (!code || code.trim() === "") {
      Alert.alert("Error", "Please enter a valid code");
      return {
        success: false,
        message: "Please enter a valid code",
        status: "invalid",
      };
    }

    // Check code status in Firestore
    const result = await checkCodeStatus(code.trim());

    // Show appropriate alert based on status
    if (result.success) {
      Alert.alert("Success", result.message);
    } else {
      Alert.alert("Error", result.message);
    }

    return result;
  } catch (error) {
    console.error("Error checking code:", error);
    Alert.alert("Error", "Failed to check code. Please try again later.");
    return {
      success: false,
      message: "Failed to check code. Please try again later.",
      status: "error",
    };
  }
};

// Mark code as used (for when user successfully verifies)
export const useCode = async (code) => {
  try {
    if (!code || code.trim() === "") {
      Alert.alert("Error", "Please enter a valid code");
      return {
        success: false,
        message: "Please enter a valid code",
      };
    }

    // Mark code as used in Firestore
    const result = await markCodeAsUsed(code.trim());

    // Show appropriate alert based on result
    if (result.success) {
      Alert.alert("Success", result.message);
    } else {
      Alert.alert("Error", result.message);
    }

    return result;
  } catch (error) {
    console.error("Error using code:", error);
    Alert.alert("Error", "Failed to use code. Please try again later.");
    return {
      success: false,
      message: "Failed to use code. Please try again later.",
    };
  }
};
