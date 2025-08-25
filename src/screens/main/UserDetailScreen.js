import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Alert,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import CustomInput from "../../components/input/CustomInput";
import CustomeButton from "../../components/Buttons/CustomeButton";
import { COLORS } from "../../assets/color/COLOR";
import auth from "@react-native-firebase/auth";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {
  getUserData,
  storeUserData,
  logoutAndClearDevice,
} from "../../services/FirebaaseFunctions";

const UserDetailScreen = () => {
  const [name, setName] = useState();
  const [phone, setPhone] = useState("");
  const [cnic, setcnic] = useState("");
  const [college, setCollege] = useState("");
  const [city, setCity] = useState("");
  const navigation = useNavigation();
  const [virified, setVirified] = useState();

  const onPressSave = async () => {
    try {
      storeUserData(
        auth().currentUser,
        virified,
        phone,
        college,
        city,
        name,
        cnic
      ).then((res) => {
        if (res) {
          Alert.alert("Success", "User Data stored Success");
        }
        if (!res) {
          Alert.alert("Error", "User Details Not Update");
        }
      });
    } catch (e) {
      console.log("Error Storing Data");
    }
  };

  const userData = async () => {
    getUserData(auth().currentUser.uid).then((res) => {
      setCity(res.city);
      setName(res.name);
      setPhone(res.phone);
      setCollege(res.college);
      setVirified(res.virified);
      setcnic(res.cnic);
    });
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const user = auth().currentUser;
              if (!user) {
                Alert.alert("Error", "No user found. Please sign in again.");
                return;
              }

              // Prompt for password re-authentication
              Alert.prompt(
                "Confirm Password",
                "Please enter your password to confirm account deletion",
                [
                  {
                    text: "Cancel",
                    style: "cancel",
                  },
                  {
                    text: "Confirm",
                    onPress: async (password) => {
                      if (!password) {
                        Alert.alert("Error", "Password is required");
                        return;
                      }

                      try {
                        // Re-authenticate user
                        const credential = auth.EmailAuthProvider.credential(
                          user.email,
                          password
                        );
                        await user.reauthenticateWithCredential(credential);

                        // Now delete the account
                        await user.delete();
                        navigation.reset({
                          index: 0,
                          routes: [{ name: "loginScreen" }],
                        });
                      } catch (error) {
                        console.error("Error during re-authentication:", error);
                        if (error.code === "auth/wrong-password") {
                          Alert.alert(
                            "Error",
                            "Incorrect password. Please try again."
                          );
                        } else {
                          Alert.alert(
                            "Error",
                            "Failed to delete account. Please try again later."
                          );
                        }
                      }
                    },
                  },
                ],
                "secure-text"
              );
            } catch (error) {
              console.error("Error deleting account:", error);
              Alert.alert(
                "Error",
                "Failed to delete account. Please try again later."
              );
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    userData();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.mainText}>My Profile</Text>
            <TouchableOpacity
              style={styles.aboutButton}
              onPress={() => navigation.navigate("AboutUs")}
            >
              <Text style={styles.aboutButtonText}>About Us</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name</Text>
              <CustomInput
                placeholder={"Your Name"}
                icon={"user"}
                value={name}
                textchangeFunction={setName}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email Address</Text>
              <CustomInput
                placeholder={"Email address"}
                icon={"email"}
                value={auth().currentUser?.email || ""}
                editable={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone Number</Text>
              <CustomInput
                placeholder={"Country code & mobile number"}
                icon={"phone"}
                value={phone}
                textchangeFunction={setPhone}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>PMDC/Medical Licensing Number</Text>
              <CustomInput
                placeholder={"PMDC/Medical Licensing Number"}
                icon={"v-card"}
                value={cnic}
                textchangeFunction={setcnic}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>College/Degree</Text>
              <CustomInput
                placeholder={"College & degree"}
                icon={"graduation-cap"}
                value={college}
                textchangeFunction={setCollege}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>City & Country</Text>
              <CustomInput
                placeholder={"City, Country"}
                icon={"location"}
                value={city}
                textchangeFunction={setCity}
              />
            </View>

            <Pressable
              style={styles.signOutButton}
              onPress={async () => {
                try {
                  // Clear device registration before signing out
                  await logoutAndClearDevice(auth().currentUser.uid);

                  // Then sign out
                  await auth().signOut();
                  navigation.reset({
                    index: 0,
                    routes: [{ name: "loginScreen" }],
                  });
                } catch (error) {
                  console.error("Error signing out:", error);
                  Alert.alert("Error", "Failed to sign out. Please try again.");
                }
              }}
            >
              <Icon name={"power"} size={20} color={COLORS.white} />
              <Text style={styles.signOutText}>Sign Out</Text>
            </Pressable>

            <Pressable
              style={styles.deleteAccountButton}
              onPress={handleDeleteAccount}
            >
              <Icon name={"delete"} size={20} color={COLORS.white} />
              <Text style={styles.deleteAccountText}>Delete Account</Text>
            </Pressable>

            <CustomeButton
              text={virified ? "Update Profile" : "Save Profile"}
              type={"primary"}
              onPressFunction={onPressSave}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default UserDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  contentContainer: {
    width: "90%",
    alignSelf: "center",
    paddingTop: 24,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  mainText: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.black,
  },
  aboutButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: COLORS.inputTextBG,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.darkGrey,
  },
  aboutButtonText: {
    color: COLORS.textgrey,
    fontSize: 14,
    fontWeight: "500",
  },
  formContainer: {
    width: "100%",
  },
  inputContainer: {
    width: "100%",
    marginBottom: 20,
  },
  label: {
    color: COLORS.textgrey,
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "500",
  },
  signOutButton: {
    width: "100%",
    marginTop: 20,
    marginBottom: 24,
    backgroundColor: COLORS.lightOrange,
    flexDirection: "row",
    padding: 12,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  signOutText: {
    color: COLORS.white,
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
  },
  deleteAccountButton: {
    width: "100%",
    marginBottom: 24,
    backgroundColor: "#FF3B30",
    flexDirection: "row",
    padding: 12,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteAccountText: {
    color: COLORS.white,
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
  },
});
