import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { COLORS } from "../../assets/color/COLOR";
import RevenueCatService from "../../services/RevenueCatService";

const PaywallScreen = ({ navigation }) => {
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  const loadPackages = async () => {
    try {
      setLoading(true);
      const availablePackages = await RevenueCatService.getAvailablePackages();
      console.log("availablePackages", availablePackages);
      setPackages(availablePackages || []);
      setSelectedPackage(RevenueCatService.getDefaultPackage(availablePackages));
    } catch (error) {
      console.error("Failed to load packages:", error);
      Alert.alert("Error", "Unable to load subscription packages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPackages();
  }, []);

  const selectedPrice = useMemo(() => {
    const product = selectedPackage?.storeProduct || selectedPackage?.product;
    return product?.priceString || "N/A";
  }, [selectedPackage]);

  const packageTitle = (pkg) => {

    const product = pkg?.storeProduct || pkg?.product;
    return (
      pkg?.packageType ||

      // product?.title ||
      // pkg?.identifier?.replaceAll("_", " ") ||
      "Premium Plan"
    );
  };

  const packagePrice = (pkg) => {
    const product = pkg?.storeProduct || pkg?.product;
    return product?.priceString || "Price not available";
  };

  const onSubscribe = async () => {
    if (!selectedPackage) return;
    setPurchasing(true);
    try {
      const result = await RevenueCatService.purchasePackage(selectedPackage);
      if (result.userCancelled) return;

      if (result.success && result.hasEntitlement) {
        await RevenueCatService.syncVerificationFromCustomerInfo(
          result.customerInfo
        );
        Alert.alert("Success", "Premium activated successfully!", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert("Purchase Failed", result.error || "Unable to subscribe.");
      }
    } catch (error) {
      Alert.alert("Error", "Subscription failed. Please try again.");
    } finally {
      setPurchasing(false);
    }
  };

  const onRestore = async () => {
    setPurchasing(true);
    try {
      const result = await RevenueCatService.restorePurchases();
      if (result.success && result.hasEntitlement) {
        await RevenueCatService.syncVerificationFromCustomerInfo(
          result.customerInfo
        );
        Alert.alert("Restored", "Your subscription has been restored.", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert("No Active Purchase", "No purchases found to restore.");
      }
    } catch (error) {
      Alert.alert("Error", "Could not restore purchases.");
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color={COLORS.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Premium</Text>
          <View style={{ width: 24 }} />
        </View>

        <Text style={styles.title}>Unlock Full Doctor On Call</Text>
        <Text style={styles.subtitle}>
          Subscribe to access all diseases and medicines with regular updates.
        </Text>

        <View style={styles.featureCard}>
          <Text style={styles.featureItem}>• Full diseases access</Text>
          <Text style={styles.featureItem}>• Full medicines access</Text>
          <Text style={styles.featureItem}>• Premium updates</Text>
          <Text style={styles.featureItem}>• Restore anytime</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} />
        ) : (
          <View style={styles.packagesWrap}>
            {packages.length === 0 ? (
              <Text style={styles.noPlansText}>
                No plans found yet. Please configure products in RevenueCat.
              </Text>
            ) : (
              packages.map((pkg) => {
                const selected =
                  selectedPackage?.identifier === pkg?.identifier;
                return (
                  <TouchableOpacity
                    key={pkg.identifier}
                    style={[styles.packageCard, selected && styles.packageActive]}
                    onPress={() => setSelectedPackage(pkg)}
                    disabled={purchasing}
                  >
                    <Text style={styles.packageTitle}>{packageTitle(pkg)}</Text>
                    <Text style={styles.packagePrice}>{packagePrice(pkg)}</Text>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.subscribeBtn,
            (!selectedPackage || purchasing) && styles.disabledBtn,
          ]}
          onPress={onSubscribe}
          disabled={!selectedPackage || purchasing}
        >
          {purchasing ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.subscribeText}>Subscribe {selectedPrice}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.restoreBtn, purchasing && styles.disabledBtn]}
          onPress={onRestore}
          disabled={purchasing}
        >
          <Text style={styles.restoreText}>Restore Purchases</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  content: { padding: 20, paddingBottom: 32 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: COLORS.black },
  title: { fontSize: 28, fontWeight: "800", color: COLORS.black, marginBottom: 8 },
  subtitle: { fontSize: 15, color: COLORS.textgrey, lineHeight: 22, marginBottom: 18 },
  featureCard: {
    backgroundColor: "#F8FFF2",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DCEBCC",
    padding: 14,
    marginBottom: 18,
  },
  featureItem: { fontSize: 14, color: COLORS.textgrey, lineHeight: 24 },
  packagesWrap: { marginBottom: 18, gap: 10 },
  noPlansText: { textAlign: "center", color: COLORS.textgrey, marginVertical: 12 },
  packageCard: {
    borderWidth: 1.5,
    borderColor: "#D8DADC",
    borderRadius: 12,
    padding: 14,
    backgroundColor: "#FAFAFA",
  },
  packageActive: {
    borderColor: COLORS.HomeinnerTabBarPrimCol,
    backgroundColor: "#FFF3E8",
  },
  packageTitle: { fontSize: 15, fontWeight: "700", color: COLORS.black, marginBottom: 4 },
  packagePrice: { fontSize: 16, fontWeight: "800", color: COLORS.HomeinnerTabBarPrimCol },
  subscribeBtn: {
    backgroundColor: "#10B981",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 10,
  },
  subscribeText: { color: COLORS.white, fontWeight: "700", fontSize: 16 },
  restoreBtn: { alignItems: "center", paddingVertical: 10 },
  restoreText: { color: COLORS.HomeinnerTabBarPrimCol, fontSize: 14, fontWeight: "600" },
  disabledBtn: { opacity: 0.55 },
});

export default PaywallScreen;
