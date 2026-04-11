import { Platform } from "react-native";
import Purchases, { LOG_LEVEL, PURCHASES_ERROR_CODE } from "react-native-purchases";
import auth from "@react-native-firebase/auth";
import { updateUserVerification } from "./FirebaaseFunctions";

// TODO: Replace with your RevenueCat public SDK keys.
const REVENUECAT_API_KEYS = {
  ios: "REVENUECAT_",
  android: "goog_jbFgWutkCpZZtravuSNgXsclBIe",
};

// TODO: Replace with your entitlement identifier from RevenueCat dashboard.
const ENTITLEMENT_ID = "Premium";

// RevenueCat offering identifier from your dashboard.
// Current setup is one offering: "Premium"
const OFFERING_ID = "Premium";

class RevenueCatService {
  isInitialized = false;

  getApiKey() {
    return Platform.OS === "ios" ? REVENUECAT_API_KEYS.ios : REVENUECAT_API_KEYS.android;
  }

  async initialize(userId = null) {
    try {
      if (this.isInitialized) return true;

      const apiKey = this.getApiKey();
      if (!apiKey || apiKey.includes("REVENUECAT_")) {
        console.warn("RevenueCat API key is not configured yet.");
        return false;
      }

      await Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      await Purchases.configure({ apiKey });

      if (userId) {
        await Purchases.logIn(userId);
      }

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error("RevenueCat initialize failed:", error);
      return false;
    }
  }

  async logIn(userId) {
    if (!this.isInitialized || !userId) return;
    try {
      await Purchases.logIn(userId);
    } catch (error) {
      console.error("RevenueCat login failed:", error);
    }
  }

  async logOut() {
    if (!this.isInitialized) return;
    try {
      await Purchases.logOut();
    } catch (error) {
      console.error("RevenueCat logout failed:", error);
    }
  }

  async getAvailablePackages() {
    if (!this.isInitialized) return [];
    try {
      const offerings = await Purchases.getOfferings();
      console.log("offerings", offerings);
      const targetedOffering =
        (OFFERING_ID && offerings?.all?.[OFFERING_ID]) || offerings?.current;
      return targetedOffering?.availablePackages || [];
    } catch (error) {
      console.error("Failed to load offerings:", error);
      return [];
    }
  }

  getDefaultPackage(packages = []) {
    if (!Array.isArray(packages) || packages.length === 0) return null;

    // Future-ready priority for when 6-month product is added.
    const priority = [
      "quarter",
      "qtr",
      "three_month",
      "3month",
      "3_month",
      "six_month",
      "6month",
      "6_month",
      "semi_annual",
      "$rc_six_month",
      "$rc_monthly",
      "$rc_annual",
    ];

    const scored = [...packages].sort((a, b) => {
      const aId = `${a?.identifier || ""}-${a?.packageType || ""}`.toLowerCase();
      const bId = `${b?.identifier || ""}-${b?.packageType || ""}`.toLowerCase();

      const aIdx = priority.findIndex((p) => aId.includes(p));
      const bIdx = priority.findIndex((p) => bId.includes(p));

      const aScore = aIdx === -1 ? 999 : aIdx;
      const bScore = bIdx === -1 ? 999 : bIdx;
      return aScore - bScore;
    });

    return scored[0] || packages[0];
  }

  async purchasePackage(pkg) {
    if (!this.isInitialized) {
      return { success: false, error: "RevenueCat is not initialized" };
    }
    if (!pkg) return { success: false, error: "No package selected" };

    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      const hasEntitlement = !!customerInfo?.entitlements?.active?.[ENTITLEMENT_ID];
      return { success: true, customerInfo, hasEntitlement };
    } catch (error) {
      const userCancelled = error?.code === PURCHASES_ERROR_CODE?.PURCHASE_CANCELLED;
      return { success: false, userCancelled, error: error?.message || "Purchase failed" };
    }
  }

  async restorePurchases() {
    if (!this.isInitialized) {
      return { success: false, error: "RevenueCat is not initialized" };
    }
    try {
      const customerInfo = await Purchases.restorePurchases();
      const hasEntitlement = !!customerInfo?.entitlements?.active?.[ENTITLEMENT_ID];
      return { success: true, customerInfo, hasEntitlement };
    } catch (error) {
      return { success: false, error: error?.message || "Restore failed" };
    }
  }

  async syncVerificationFromCustomerInfo(customerInfo) {
    try {
      const user = auth().currentUser;
      if (!user || !customerInfo) return false;

      const entitlement = customerInfo?.entitlements?.active?.[ENTITLEMENT_ID];
      if (!entitlement) {
        await updateUserVerification(user.uid, false, null, null);
        return true;
      }

      const verifiedAt = new Date();
      const expiryDate = entitlement.expirationDate
        ? new Date(entitlement.expirationDate)
        : new Date(verifiedAt.getTime() + 1000 * 60 * 60 * 24 * 30);

      await updateUserVerification(user.uid, true, verifiedAt, expiryDate);
      return true;
    } catch (error) {
      console.error("Failed to sync verification from customer info:", error);
      return false;
    }
  }
}

export default new RevenueCatService();
