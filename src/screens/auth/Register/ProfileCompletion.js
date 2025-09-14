import { StyleSheet, Text, View, Pressable, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import CustomInput from "../../../components/input/CustomInput";
import CustomeButton from "../../../components/Buttons/CustomeButton";
import { COLORS } from "../../../assets/color/COLOR";
import auth from "@react-native-firebase/auth";
import { useNavigation } from "@react-navigation/native";
import { storeUserData } from "../../../services/FirebaaseFunctions";
import { FlatList } from "react-native-gesture-handler";

const ProfileCompletion = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [college, setCollege] = useState("");
  const [city, setCity] = useState("");
  const [CNIC, setCnic] = useState("");
  const navigation = useNavigation();

  const onPressContinue = async () => {
    try {
      storeUserData(
        auth().currentUser,
        false,
        phone,
        college,
        city,
        name,
        CNIC,
        null, // expiryDate - not set during profile completion
      ).then((res) => {
        if (res) {
          navigation.navigate("tabNavigation");
        }
        if (!res) {
          Alert.alert("Error", "User Details Not Stored");
        }
      });
    } catch (e) {
      console.log("Error Storing Data");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.mainText}>Let’s go!</Text>
        <View style={styles.innerContent}>
          <Text>Full Name</Text>
          <CustomInput
            placeholder={"Your Name"}
            icon={"user"}
            value={name}
            textchangeFunction={setName}
          />
        </View>

        <View style={styles.innerContent}>
          <Text>Phone Number</Text>
          <CustomInput
            placeholder={"Country code & mobile number"}
            icon={"phone"}
            value={phone}
            textchangeFunction={setPhone}
          />
        </View>

        <View style={styles.innerContent}>
          <Text>PMDC/CNIC</Text>
          <CustomInput
            placeholder={"PMDC/CNIC"}
            icon={"v-card"}
            value={CNIC}
            textchangeFunction={setCnic}
          />
        </View>

        <View style={styles.innerContent}>
          <Text>College/Degree</Text>
          <CustomInput
            placeholder={"College & degree"}
            icon={"graduation-cap"}
            value={college}
            textchangeFunction={setCollege}
          />
        </View>
        <View style={styles.innerContent}>
          <Text>City & Country</Text>
          <CustomInput
            placeholder={"City, Country"}
            icon={"location"}
            value={city}
            textchangeFunction={setCity}
          />
        </View>

        <CustomeButton
          text={"Continue"}
          type={"primary"}
          onPressFunction={onPressContinue}
        />
      </View>
    </View>
  );
};

export default ProfileCompletion;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    width: "90%",
    // height: '68%',
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  innerContent: {
    width: "97%",
    marginTop: 20,
    // height: '13%',
    // backgroundColor: 'yellow',
    justifyContent: "space-between",
  },
  registerButtonText: {
    fontSize: 18,
    color: COLORS.buttonPrimary,
  },
  normalText: {
    color: COLORS.textColorPrimary,
    fontSize: 17,
  },
  registerTextContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  mainText: {
    fontSize: 30,
    fontWeight: "bold",
    color: COLORS.black,
    alignSelf: "flex-start",
  },
});
