import firestore from "@react-native-firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import DeviceInfo from "react-native-device-info";

// Device exclusivity constants
const DEVICE_ID_KEY = "current_device_id";
const DEVICE_INFO_KEY = "device_info";

// Generate a unique device identifier

// Get device information
const getDeviceInfo = () => {
  return {
    platform: Platform.OS,
    version: Platform.Version,
    timestamp: Date.now(),
  };
};

export const checkDeviceExclusivity = async (uid) => {
  try {
    const userDoc = await firestore().collection("users").doc(uid).get();

    if (!userDoc.exists) {
      return { canLogin: true, reason: "New user" };
    }

    const userData = userDoc.data();
    const deviceInfo = Platform.OS;

    const deviceId = await DeviceInfo.getUniqueId();

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

export const registerDevice = async (uid) => {
  try {
    const deviceId = await DeviceInfo.getUniqueId();
    const deviceInfo = Platform.OS;
    console.log("device platform =>", deviceInfo);
    console.log("device id =>", deviceId);

    const userDoc = await firestore().collection("users").doc(uid).get();
    console.log(userDoc.data(), "USer Data ");

    if (!userDoc?.exists || !userDoc.data()?.currentDeviceId) {
      const updatedData = await firestore()
        .collection("users")
        .doc(uid)
        .update({
          currentDeviceId: deviceId,
          lastDeviceLogin: firestore.FieldValue.serverTimestamp(),
          platform: deviceInfo,
        });
      console.log("updatedData =>", updatedData);
    }

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
    await firestore().collection("users").doc(uid).update({
      currentDeviceId: null,
      lastDeviceLogin: null,
      deviceInfo: null,
    });

    return true;
  } catch (error) {
    console.error("Error logging out and clearing device:", error);
    return false;
  }
};

export const storeUserData = async (
  user,
  virified,
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
      virified: virified,
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
    console.log(updateData, "updateData");
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

// Check code status in Firestore
export const checkCodeStatus = async (code) => {
  try {
    if (!code || typeof code !== "string") {
      return {
        success: false,
        message: "Invalid code provided",
        status: "invalid",
      };
    }

    // Query the codes collection for the specific code
    const codesSnapshot = await firestore()
      .collection("codes")
      .where("code", "==", code)
      .limit(1)
      .get();

    // Check if code exists
    if (codesSnapshot.empty) {
      return {
        success: false,
        message: "Code not found",
        status: "not_found",
      };
    }

    // Get the first (and should be only) document
    const codeDoc = codesSnapshot.docs[0];
    const codeData = codeDoc.data();

    // Check if code is already used
    if (codeData.used === true) {
      return {
        success: false,
        message: "Code is already used",
        status: "used",
      };
    }

    // Code exists and is not used - it's active
    return {
      success: true,
      message: "Code is active",
      status: "active",
      codeId: codeDoc.id,
      codeData: codeData,
    };
  } catch (error) {
    console.error("Error checking code status:", error);
    return {
      success: false,
      message: "Error checking code status",
      status: "error",
    };
  }
};

// Mark code as used
export const markCodeAsUsed = async (code) => {
  try {
    if (!code || typeof code !== "string") {
      return {
        success: false,
        message: "Invalid code provided",
      };
    }

    // First check if code exists and is not used
    const codeStatus = await checkCodeStatus(code);

    if (!codeStatus.success) {
      return codeStatus; // Return the error from checkCodeStatus
    }

    // Update the code document to mark it as used
    const codesSnapshot = await firestore()
      .collection("codes")
      .where("code", "==", code)
      .limit(1)
      .get();

    if (!codesSnapshot.empty) {
      const codeDoc = codesSnapshot.docs[0];
      await codeDoc.ref.update({
        used: true,
        usedAt: firestore.FieldValue.serverTimestamp(),
      });

      return {
        success: true,
        message: "Code marked as used successfully",
        codeId: codeDoc.id,
      };
    }

    return {
      success: false,
      message: "Code not found",
    };
  } catch (error) {
    console.error("Error marking code as used:", error);
    return {
      success: false,
      message: "Error marking code as used",
    };
  }
};
