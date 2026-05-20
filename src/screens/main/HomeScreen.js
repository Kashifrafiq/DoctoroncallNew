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
import {
  getDiseasesCatogery,
  searchDiseases,
} from "../../Hooks/api/diseases";
import auth from "@react-native-firebase/auth";
import { getdrugsCatogery, searchMedicines } from "../../Hooks/api/drugs";
import { MIN_SEARCH_LENGTH } from "../../Hooks/api/firestoreSearch";
import PaymentSheet from "../../components/card/PaymentSheet";
import {
  getUserData,
  isProfileComplete,
} from "../../services/FirebaaseFunctions";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import BottomSheet, {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { calculateDaysLeft } from "../../services/helper";

const isSubscriptionActive = (user) => {
  if (!user?.virified) return false;
  if (!user?.expiryDate) return false;

  const expiry =
    typeof user.expiryDate?.toDate === "function"
      ? user.expiryDate.toDate()
      : new Date(user.expiryDate);

  if (Number.isNaN(expiry?.getTime?.())) return false;
  return expiry.getTime() > Date.now();
};

const HomeScreen = () => {
  const refRBSheet = useRef();
  const navigate = useNavigation();
  const [activeTab, setActiveTab] = useState("diseases");
  const [dISEASE_DATA, setDISEASE_DATA] = useState([]);
  const [drug_DATA, setdrug_Data] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [user, setUser] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const snapPoints = useMemo(() => ["25%", "50%"], []);
  const [refresh, setRefresh] = useState(false);

  const userData = async () => {
    const isComplete = await isProfileComplete(auth().currentUser.uid);
    if (!isComplete) {
      navigate.replace("profileCompletion");
      return;
    }

    const userData = await getUserData(auth().currentUser.uid);
    // console.log("userData =>", userData);
    setUser(userData);
  };

  const hasActiveAccess = isSubscriptionActive(user);

  const getCategoryById = (categoryId, type) => {
    if (type === "disease") {
      return dISEASE_DATA.find((category) => category.id === categoryId[0]);
    } else if (type === "drug") {
      return drug_DATA.find((category) => category.id === categoryId[0]);
    }
    return null;
  };
  // return dISEASE_DATA.find(category => category.id === categoryId[0]);

  const categoryListData =
    activeTab === "diseases" ? dISEASE_DATA : drug_DATA;

  useEffect(() => {
    const loadHome = async () => {
      setIsLoading(true);
      try {
        const [diseaseCategories, drugCategories] = await Promise.all([
          getDiseasesCatogery(),
          getdrugsCatogery(),
          userData(),
        ]);
        console.log('diseaseCategories', diseaseCategories);
        console.log('drugCategories', drugCategories);
        setDISEASE_DATA(diseaseCategories);
        setdrug_Data(drugCategories);
      } catch (error) {
        console.error("Error loading home data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadHome();
  }, [refresh]);

  useEffect(() => {
    const term = searchQuery.trim();
    if (term.length < MIN_SEARCH_LENGTH) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const [diseases, medicines] = await Promise.all([
          searchDiseases(term),
          searchMedicines(term),
        ]);
        
        setSearchResults([...diseases, ...medicines]);
      } catch (error) {
        console.error("Search failed:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useFocusEffect(
    React.useCallback(() => {
      userData();
    }, [])
  );

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
            !hasActiveAccess && styles.disabledInputText, // Disable search for expired/unverified users
          ]}
          placeholder={
            hasActiveAccess
              ? "Search by any disease or drug"
              : "Search is locked for unverified users"
          }
          placeholderTextColor={COLORS.black}
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
          editable={hasActiveAccess}
        />
      </View>

      {searchQuery.trim().length >= MIN_SEARCH_LENGTH && (
        <View style={styles.searchResultsContainer}>
          {isSearching ? (
            <View style={styles.searchLoadingRow}>
              <ActivityIndicator
                size="small"
                color={COLORS.HomeinnerTabBarPrimCol}
              />
              <Text style={styles.searchLoadingText}>Searching…</Text>
            </View>
          ) : null}
          <FlatList
            data={searchResults}
            keyExtractor={(item) => `${item.type ?? "item"}-${item.id}`}
            style={styles.searchResultsList}
            contentContainerStyle={styles.searchResultsContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
            ListEmptyComponent={
              !isSearching ? (
                <Text style={styles.searchEmptyText}>No results found</Text>
              ) : null
            }
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
                  if (!cat) {
                    Alert.alert(
                      "Unavailable",
                      "Category for this item could not be loaded."
                    );
                    return;
                  }
                  navigate.navigate("diseaseInfoScreen", {
                    acf: item.acf,
                    name: item.title.rendered,
                    id: item.id,
                    sections: item.sections,
                    shortDescription: item.shortDescription,
                    htmlContent: item.htmlContent,
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
        data={categoryListData}
        numColumns={2}
        style={styles.flatListContainer}
        renderItem={({ item, index }) => (
          <PrimaryCard
            mainText={item.name}
            secondaryText={activeTab === 'diseases' ? item.count : item.count}
            img={item.imageUrl}
            paid={!hasActiveAccess && index !== 0}
            bgColor={item.color}
            id={item.id}
            type={activeTab}
            rbSheetRef={refRBSheet}
            verified={hasActiveAccess}
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
    color: COLORS.black,
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
  searchLoadingRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 8,
  },
  searchLoadingText: {
    fontSize: 14,
    color: COLORS.textgrey,
  },
  searchEmptyText: {
    padding: 16,
    fontSize: 14,
    color: COLORS.textgrey,
    textAlign: "center",
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
    maxHeight: 320,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchResultsList: {
    flexGrow: 0,
  },
  searchResultsContent: {
    paddingBottom: 8,
  },
  flatListContainer: {
    width: "100%",
    flex: 1,
    // padding: 16,
  },
});
