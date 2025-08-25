import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from "react-native";
import React, { useEffect, useState, useRef, useMemo } from "react";
import { COLORS } from "../../assets/color/COLOR";
import Icons from "react-native-vector-icons/Entypo";
import Icons1 from "react-native-vector-icons/MaterialCommunityIcons";
import Banner from "../../components/banner/Banner";
import PrimaryCard from "../../components/card/PrimaryCard";
import { getdiseases, getDiseasesCatogery } from "../../Hooks/api/diseases";
import auth from "@react-native-firebase/auth";
import { getDrugs, getdrugsCatogery } from "../../Hooks/api/drugs";
import PaymentSheet from "../../components/card/PaymentSheet";
import {
  getUserData,
  isProfileComplete,
} from "../../services/FirebaaseFunctions";
import { useNavigation } from "@react-navigation/native";
import BottomSheet, {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { calculateDaysLeft } from "../../services/helper";

const DRUGS_DATA = [
  {
    name: "Drug A",
    details: "Details about Drug A",
    img: require("../../assets/img/bannerImage.png"),
  },
  {
    name: "Drug A",
    details: "Details about Drug A",
    img: require("../../assets/img/bannerImage.png"),
  },
  {
    name: "Drug A",
    details: "Details about Drug A",
    img: require("../../assets/img/bannerImage.png"),
  },
  {
    name: "Drug A",
    details: "Details about Drug A",
    img: require("../../assets/img/bannerImage.png"),
  },
  {
    name: "Drug A",
    details: "Details about Drug A",
    img: require("../../assets/img/bannerImage.png"),
  },
  {
    name: "Drug A",
    details: "Details about Drug A",
    img: require("../../assets/img/bannerImage.png"),
  },
  {
    name: "Drug A",
    details: "Details about Drug A",
    img: require("../../assets/img/bannerImage.png"),
  },
  // Repeat this object for other entries
];

const HomeScreen = () => {
  const refRBSheet = useRef();
  const navigate = useNavigation();
  const [activeTab, setActiveTab] = useState("diseases");
  const [dISEASE_DATA, setDISEASE_DATA] = useState([]);
  const [drug_DATA, setdrug_Data] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState();
  const [combinedData, setCombinedData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const snapPoints = useMemo(() => ["25%", "50%"], []);
  const [refresh, setRefresh] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [diseases, drugs] = await Promise.all([getdiseases(), getDrugs()]);
      const mergedData = [...diseases, ...drugs];
      setCombinedData(mergedData);
      // console.log('Merged Data:', mergedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
      console.log("Done!!!");
    }
  };

  const handleGetDiseases = async () => {
    try {
      setIsLoading(true);
      const data = await getDiseasesCatogery();
      setDISEASE_DATA(data);
      // console.log('Diseases:', data);
    } catch (error) {
      console.error("Error getting diseases:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetdrugs = async () => {
    try {
      const data = await getdrugsCatogery();
      setdrug_Data(data);
    } catch (error) {
      console.error("Error getting diseases:", error);
    }
  };

  const userData = async () => {
    if (!auth().currentUser?.uid) {
      const res = await checkDeviceExclusivity(auth().currentUser.uid);
      if (!res.canLogin) {
        Alert.alert("Can't Login", res.reason);
        await auth().signOut();
        navigate.reset({
          index: 0,
          routes: [{ name: "loginScreen" }],
        });
        return;
      }

      Alert.alert(
        "Authentication Required",
        "Please sign in to access the app.",
        [
          {
            text: "OK",
            onPress: () => navigate.navigate("Login"),
          },
        ]
      );
      return;
    }

    const isComplete = await isProfileComplete(auth().currentUser.uid);
    if (!isComplete) {
      navigate.replace("profileCompletion");
      return;
    }

    const userData = await getUserData(auth().currentUser.uid);
    setUser(userData);
  };

  const getDiseaseCategory = (diseaseId, type) => {
    // Find the disease with the given ID

    const disease = dISEASE_DATA.find((d) => d.id === diseaseId);

    if (!disease) {
      return `Disease with ID ${diseaseId} not found.`;
    }

    // Extract the category IDs from the disease
    const categoryIds = disease["disease-category"];

    // Find the categories that match these IDs
    const matchingCategories = categories.filter((category) =>
      categoryIds.includes(category.id)
    );

    return matchingCategories.length > 0
      ? matchingCategories
      : `No categories found for disease with ID ${diseaseId}.`;
  };

  const getCategoryById = (categoryId, type) => {
    if (type === "disease") {
      return dISEASE_DATA.find((category) => category.id === categoryId[0]);
    } else if (type === "drug") {
      return drug_DATA.find((category) => category.id === categoryId[0]);
    }
    return null;
  };
  // return dISEASE_DATA.find(category => category.id === categoryId[0]);

  const filterData = () => {
    if (searchQuery === "") {
      return combinedData;
    }
    return combinedData.filter(
      (item) => item?.slug?.toLowerCase().includes(searchQuery.toLowerCase()) // Adjust based on your data structure
    );
  };

  const filteredData = (
    activeTab === "diseases" ? dISEASE_DATA : drug_DATA
  ).filter((item) =>
    item?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePress = async (item) => {
    try {
      const category = await getDiseaseCategory(item.id);
      navigate.navigate("diseaseInfoScreen", {
        acf: item.acf,
        name: item.title.rendered,
        id: item.id,
        category: category, // Pass the category to the next screen
      });
    } catch (error) {
      console.error("Error fetching disease category:", error);
    }
  };

  useEffect(() => {
    handleGetDiseases();
    handleGetdrugs();
    fetchData();
    userData();
  }, [refresh]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.HomeinnerTabBarPrimCol} />
        <Text style={styles.loadingText}>Loading data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Heading Text */}
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={styles.text1}>Welcome, </Text>
          <Text style={styles.text2}> {user?.name}</Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={styles.text3}>
            {calculateDaysLeft(user?.expiryDate)}
          </Text>
        </View>
      </View>
      {/* Search Bar */}
      <View style={styles.textInputContainer}>
        <Icons name={"magnifying-glass"} size={18} color={COLORS.darkGrey} />
        <TextInput
          style={[
            styles.inputText,
            !user?.virified && styles.disabledInputText, // Add a style for the disabled state
          ]}
          placeholder={
            user?.virified
              ? "Search by any disease or drug"
              : "Search is locked for unverified users"
          }
          placeholderTextColor={COLORS.darkGrey}
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
          editable={user?.virified || false}
        />
      </View>

      {searchQuery !== "" && (
        <View style={styles.searchResultsContainer}>
          <FlatList
            data={filterData()}
            keyExtractor={(item) => item.id} // Ensure each item has a unique ID
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.resultItem}
                onPress={() => {
                  const cat = getCategoryById(
                    item.type === "disease"
                      ? item[`disease-category`]
                      : item[`drug_category`],
                    item.type
                  );
                  console.log("cat:", item.type);
                  navigate.navigate("diseaseInfoScreen", {
                    acf: item.acf,
                    name: item.title.rendered,
                    id: item.id,
                    catData: {
                      diseaseId: cat.id,
                      image: cat.acf.category_image,
                      heading: cat.name,
                      count: cat.count,
                      type: item.type,
                      fvrtScreen: false,
                      rcntScreen: false,
                    }, // Pass the category to the next screen
                  });
                }}
              >
                <Icons1
                  name={item.type === "disease" ? "virus-outline" : "pill"}
                  size={20}
                  color={COLORS.black}
                />
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "500",
                    color: COLORS.black,
                    marginLeft: 10,
                  }}
                >
                  {item.title.rendered}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      <Banner />

      {/* Navigation Container */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[
            styles.navigationTab,
            {
              backgroundColor:
                activeTab === "diseases"
                  ? COLORS.HomeinnerTabBarPrimCol
                  : COLORS.white,
            },
          ]}
          onPress={() => setActiveTab("diseases")}
        >
          <Icons1
            name={"virus-outline"}
            size={20}
            color={activeTab === "diseases" ? COLORS.white : COLORS.black}
          />
          <Text
            style={[
              styles.navigationTabText,
              {
                color: activeTab === "diseases" ? COLORS.white : COLORS.black,
              },
            ]}
          >
            {" "}
            Diseases
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.navigationTab,
            {
              backgroundColor:
                activeTab === "drugs"
                  ? COLORS.HomeinnerTabBarSecCol
                  : COLORS.white,
            },
          ]}
          onPress={() => setActiveTab("drugs")}
        >
          <Icons1
            name={"pill"}
            size={20}
            color={activeTab === "drugs" ? COLORS.white : COLORS.black}
          />
          <Text
            style={[
              styles.navigationTabText,
              {
                color: activeTab === "drugs" ? COLORS.white : COLORS.black,
              },
            ]}
          >
            {" "}
            Drugs
          </Text>
        </TouchableOpacity>
      </View>

      {/* <View style={styles.mainContainer}> */}
      <FlatList
        showsVerticalScrollIndicator={false}
        // data={activeTab === 'diseases' ? dISEASE_DATA : drug_DATA}
        data={filteredData}
        numColumns={2}
        style={styles.flatListContainer}
        renderItem={({ item, index }) => (
          <PrimaryCard
            mainText={item.name}
            secondaryText={item.count}
            img={item.acf.category_image}
            paid={!user?.virified && index !== 0}
            bgColor={item.acf.color}
            id={item.id}
            type={activeTab}
            rbSheetRef={refRBSheet}
            verified={user?.virified}
          />
        )}
      />
      <BottomSheetModalProvider>
        <BottomSheetModal enableDynamicSizing={true} ref={refRBSheet}>
          <PaymentSheet rbSheetRef={refRBSheet} setrefresh={setRefresh} />
        </BottomSheetModal>
      </BottomSheetModalProvider>

      {/*       
      <RBSheet
        ref={refRBSheet}
        useNativeDriver={true}
        customStyles={{
          container: {
            borderTopRightRadius: 15,
            borderTopLeftRadius: 15,
            height: 400,
          },
        
          wrapper: {
            backgroundColor: 'transparent',
          },
          draggableIcon: {
            backgroundColor: '#000',
          },
        }}
        customModalProps={{
          animationType: 'slide',
          statusBarTranslucent: true,
        }}
        customAvoidingViewProps={{
          enabled: true,
        }}>
        <PaymentSheet rbSheetRef={refRBSheet} setrefresh={setRefresh} />
      </RBSheet> */}
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,

    // padding: '7%',
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  text1: {
    color: COLORS.textgrey,
    fontSize: 18,
    fontWeight: "600",
  },
  text2: {
    color: COLORS.textblue,
    fontSize: 18,
    fontWeight: "600",
  },
  text3: {
    color: "red",
    fontSize: 18,
    fontWeight: "600",
  },
  textInputContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputTextBG,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  inputText: {
    flex: 1,
    color: COLORS.darkGrey,
    fontSize: 16,
    marginLeft: 12,
  },
  disabledInputText: {
    opacity: 0.5,
  },
  navigationContainer: {
    width: "100%",
    flexDirection: "row",
    marginVertical: 16,
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.inputTextBG,
    borderRadius: 12,
  },
  navigationTab: {
    flex: 1,
    flexDirection: "row",
    marginHorizontal: 4,
    paddingVertical: 10,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  navigationTabText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
  resultItem: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#E0E0E0",
    alignItems: "center",
    backgroundColor: COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.white,
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.textgrey,
    fontSize: 16,
    fontWeight: "500",
  },
  searchResultsContainer: {
    position: "absolute",
    width: "100%",
    top: "12%",
    left: 0,
    zIndex: 1000,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  flatListContainer: {
    width: "100%",
    flex: 1,
    // padding: 16,
  },
});
