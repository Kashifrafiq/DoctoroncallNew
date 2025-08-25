import firestore from "@react-native-firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Device exclusivity constants
const DEVICE_ID_KEY = "current_device_id";
const DEVICE_INFO_KEY = "device_info";

// Generate a unique device identifier
const generateDeviceId = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  return `${Platform.OS}_${timestamp}_${random}`;
};

// Get device information
const getDeviceInfo = () => {
  return {
    platform: Platform.OS,
    version: Platform.Version,
    timestamp: Date.now(),
    deviceId: generateDeviceId(),
  };
};

// Check if user can login on this device
export const checkDeviceExclusivity = async (uid) => {
  try {
    const userDoc = await firestore().collection("users").doc(uid).get();

    if (!userDoc.exists) {
      return { canLogin: true, reason: "New user" };
    }

    const userData = userDoc.data();
    const deviceInfo = getDeviceInfo();
    const deviceId = deviceInfo.deviceId;

    // Ensure we have valid data
    if (!userData || typeof userData.currentDeviceId !== "string") {
      return { canLogin: true, reason: "No device registered" };
    }

    if (userData.currentDeviceId === deviceId) {
      return { canLogin: true, reason: "Same device" };
    } else {
      return {
        canLogin: false,
        reason: "Device already logged in elsewhere",
        currentDeviceId: userData.currentDeviceId,
      };
    }
  } catch (error) {
    console.error("Error checking device exclusivity:", error);
    return { canLogin: true, reason: "Error occurred, allowing login" };
  }
};

// Register current device for user
export const registerDevice = async (uid) => {
  try {
    const deviceInfo = getDeviceInfo();
    const deviceId = deviceInfo.deviceId;

    // Store device ID locally for consistency
    await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
    await AsyncStorage.setItem(DEVICE_INFO_KEY, JSON.stringify(deviceInfo));

    // Update user document with current device
    await firestore().collection("users").doc(uid).update({
      currentDeviceId: deviceId,
      lastDeviceLogin: firestore.FieldValue.serverTimestamp(),
      deviceInfo: deviceInfo,
    });

    return true;
  } catch (error) {
    console.error("Error registering device:", error);
    return false;
  }
};

// Force logout from other devices
export const forceLogoutOtherDevices = async (uid) => {
  try {
    const userDoc = await firestore().collection("users").doc(uid).get();

    if (!userDoc.exists) return false;

    const userData = userDoc.data();
    const currentDeviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);

    // If this is the same device, no need to force logout
    if (userData.currentDeviceId === currentDeviceId) {
      return true;
    }

    // Update user document to force logout other devices
    await firestore().collection("users").doc(uid).update({
      forceLogout: true,
      forceLogoutTimestamp: firestore.FieldValue.serverTimestamp(),
      previousDeviceId: userData.currentDeviceId,
      forceLogoutDeviceId: currentDeviceId, // Track which device initiated the force logout
      forceLogoutReason: "Login on new device",
    });

    return true;
  } catch (error) {
    console.error("Error forcing logout from other devices:", error);
    return false;
  }
};

// Check if current device should be logged out
export const checkForceLogout = async (uid) => {
  try {
    const userDoc = await firestore().collection("users").doc(uid).get();

    if (!userDoc.exists) return false;

    const userData = userDoc.data();
    const currentDeviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);

    // Check if this device should be force logged out
    if (userData.forceLogout && userData.currentDeviceId !== currentDeviceId) {
      // Clear local device registration
      await AsyncStorage.removeItem(DEVICE_ID_KEY);
      await AsyncStorage.removeItem(DEVICE_INFO_KEY);

      return true;
    }

    return false;
  } catch (error) {
    console.error("Error checking force logout:", error);
    return false;
  }
};

// Enhanced force logout check with real-time updates
export const setupForceLogoutListener = (uid, onForceLogout) => {
  try {
    // Set up real-time listener for force logout
    const unsubscribe = firestore()
      .collection("users")
      .doc(uid)
      .onSnapshot(
        async (doc) => {
          if (doc.exists) {
            const userData = doc.data();
            const currentDeviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);

            // Check if this device should be force logged out
            if (
              userData.forceLogout &&
              userData.currentDeviceId !== currentDeviceId
            ) {
              // Clear local device registration
              await AsyncStorage.removeItem(DEVICE_ID_KEY);
              await AsyncStorage.removeItem(DEVICE_INFO_KEY);

              // Call the callback to handle force logout
              onForceLogout();
            }
          }
        },
        (error) => {
          console.error("Error in force logout listener:", error);
        }
      );

    return unsubscribe;
  } catch (error) {
    console.error("Error setting up force logout listener:", error);
    return null;
  }
};

// Logout user and clear device registration
export const logoutAndClearDevice = async (uid) => {
  try {
    // Clear local device registration
    await AsyncStorage.removeItem(DEVICE_ID_KEY);
    await AsyncStorage.removeItem(DEVICE_INFO_KEY);

    // Update user document to remove current device
    await firestore().collection("users").doc(uid).update({
      currentDeviceId: null,
      lastDeviceLogin: null,
      deviceInfo: null,
      forceLogout: false,
      forceLogoutTimestamp: null,
      previousDeviceId: null,
      forceLogoutDeviceId: null,
      forceLogoutReason: null,
    });

    return true;
  } catch (error) {
    console.error("Error logging out and clearing device:", error);
    return false;
  }
};

export const storeUserData = async (
  user,
  verified,
  phone,
  college,
  city,
  name,
  cnic,
  expiryDate
) => {
  try {
    await firestore().collection("users").doc(user.uid).set({
      email: user.email,
      verified: verified,
      name: name,
      phone: phone,
      college: college,
      city: city,
      cnic: cnic,
      expiryDate: expiryDate,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error("Error storing user data:", error);
    return false;
  }
};

export const updateUserData = async (userId, fieldName, fieldValue) => {
  try {
    const updateData = {};
    updateData[fieldName] = fieldValue;

    await firestore().collection("users").doc(userId).update(updateData);
    return true;
  } catch (error) {
    console.error("Error updating user data:", error);
    return false;
  }
};

export const updateUserVerification = async (
  userId,
  verified,
  verifiedAt,
  expiryDate
) => {
  try {
    const updateData = {
      virified: verified,
      verifiedAt: verifiedAt,
      expiryDate: expiryDate,
    };

    await firestore().collection("users").doc(userId).update(updateData);
    return true;
  } catch (error) {
    console.error("Error updating user verification:", error);
    return false;
  }
};

export const getUserData = async (uid) => {
  try {
    const userDoc = await firestore().collection("users").doc(uid).get();

    if (!userDoc.exists) {
      console.log("No user found");
      return null;
    }

    return userDoc.data();
  } catch (error) {
    console.error("Error getting user data:", error);
    return null;
  }
};

export const isProfileComplete = async (uid) => {
  try {
    const userData = await getUserData(uid);
    return !!(
      userData &&
      userData.name &&
      userData.phone &&
      userData.college &&
      userData.city &&
      userData.cnic
    );
  } catch (error) {
    console.error("Error checking profile completion:", error);
    return false;
  }
};

// export const getUserProfile = async (uid) => {
//   try {
//     const userData = await getUserData(uid);
//     return userData;
//   } catch (error) {
//     console.error("Error getting user profile:", error);
//     return null;
//   }
// };

export const checkAndUpdateVerificationStatus = async (uid) => {
  try {
    const userData = await getUserData(uid);
    if (!userData || !userData.expiryDate) {
      console.log("No user data or expiry date found");
      return false;
    }

    const expiryDate = userData.expiryDate.toDate
      ? userData.expiryDate.toDate()
      : new Date(userData.expiryDate);
    const today = new Date();

    // Reset time to start of day for accurate comparison
    today.setHours(0, 0, 0, 0);
    expiryDate.setHours(0, 0, 0, 0);

    // Check if expiry date is today or has passed
    if (expiryDate <= today) {
      // Update verification status to unverified
      await updateUserData(uid, "verified", false);
      console.log(
        `User ${uid} verification status updated to unverified due to expired date`
      );
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error checking and updating verification status:", error);
    return false;
  }
};

export const getUserDataWithVerificationCheck = async (uid) => {
  try {
    // First check and update verification status if needed
    await checkAndUpdateVerificationStatus(uid);

    // Then return the updated user data
    return await getUserData(uid);
  } catch (error) {
    console.error("Error getting user data with verification check:", error);
    return null;
  }
};

export const isVerificationExpired = (expiryDate) => {
  try {
    if (!expiryDate) return true;

    const expiry = expiryDate.toDate
      ? expiryDate.toDate()
      : new Date(expiryDate);
    const today = new Date();

    // Reset time to start of day for accurate comparison
    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);

    return expiry <= today;
  } catch (error) {
    console.error("Error checking if verification is expired:", error);
    return true; // Assume expired if there's an error
  }
};

export const getDaysUntilExpiry = (expiryDate) => {
  try {
    if (!expiryDate) return 0;

    const expiry = expiryDate.toDate
      ? expiryDate.toDate()
      : new Date(expiryDate);
    const today = new Date();

    // Reset time to start of day for accurate comparison
    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);

    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  } catch (error) {
    console.error("Error calculating days until expiry:", error);
    return 0;
  }
};
