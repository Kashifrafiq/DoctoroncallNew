import { Platform } from 'react-native';
import Purchases, {
  LOG_LEVEL,
  PURCHASES_ERROR_CODE,
  type CustomerInfo,
  type PurchasesPackage,
  type PurchasesStoreProduct,
} from 'react-native-purchases';

import { auth, updateUserData, updateUserVerification } from '@/services/firebase-functions';

const REVENUECAT_API_KEYS = {
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? 'REVENUECAT_',
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? 'goog_jbFgWutkCpZZtravuSNgXsclBIe',
};

const ENTITLEMENT_ID = 'Premium';
const OFFERING_ID = 'Premium';

const ANDROID_STORE_PRODUCT_IDS = [
  'annual_subscription:rc-10-qtr',
  'annual_subscription:rc-5-monthly',
] as const;

type PurchaseResult = {
  success: boolean;
  userCancelled?: boolean;
  hasEntitlement?: boolean;
  customerInfo?: CustomerInfo;
  error?: string;
};

function hasActiveEntitlement(customerInfo: CustomerInfo | null | undefined): boolean {
  if (!customerInfo) {
    return false;
  }

  if (customerInfo?.entitlements?.active?.[ENTITLEMENT_ID]) {
    return true;
  }

  const activeEntitlements = customerInfo?.entitlements?.active ?? {};
  if (Object.keys(activeEntitlements).length > 0) {
    return true;
  }

  const activeSubscriptions = customerInfo?.activeSubscriptions ?? [];
  return activeSubscriptions.length > 0;
}

export type SubscriptionPlan = {
  identifier: string;
  revenueCatPackage: PurchasesPackage | null;
  storeProduct: PurchasesStoreProduct | null;
};

function getPackageStoreProductId(pkg: PurchasesPackage): string {
  const extended = pkg as PurchasesPackage & {
    storeProduct?: { identifier?: string };
    product?: { identifier?: string };
  };
  return extended.storeProduct?.identifier ?? extended.product?.identifier ?? pkg.identifier;
}

export function getPlanProduct(
  plan: SubscriptionPlan | null | undefined,
): PurchasesStoreProduct | { priceString?: string; identifier?: string } | null {
  if (!plan) {
    return null;
  }
  if (plan.storeProduct) {
    return plan.storeProduct;
  }
  const extended = plan.revenueCatPackage as PurchasesPackage & {
    storeProduct?: PurchasesStoreProduct;
    product?: PurchasesStoreProduct;
  };
  return extended?.storeProduct ?? extended?.product ?? null;
}

class RevenueCatServiceClass {
  isInitialized = false;

  getApiKey(): string {
    return Platform.OS === 'ios' ? REVENUECAT_API_KEYS.ios : REVENUECAT_API_KEYS.android;
  }

  async initialize(userId: string | null = null): Promise<boolean> {
    try {
      if (this.isInitialized) {
        return true;
      }

      const apiKey = this.getApiKey();
      if (!apiKey || apiKey.includes('REVENUECAT_')) {
        console.warn('RevenueCat API key is not configured yet.');
        return false;
      }

      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      Purchases.configure({ apiKey });

      if (userId) {
        await Purchases.logIn(userId);
      }

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('RevenueCat initialize failed:', error);
      return false;
    }
  }

  async logIn(userId: string): Promise<void> {
    if (!this.isInitialized || !userId) {
      return;
    }

    try {
      await Purchases.logIn(userId);
    } catch (error) {
      console.error('RevenueCat login failed:', error);
    }
  }

  async logOut(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    try {
      await Purchases.logOut();
    } catch (error) {
      console.error('RevenueCat logout failed:', error);
    }
  }

  async getAvailablePlans(): Promise<SubscriptionPlan[]> {
    if (!this.isInitialized) {
      return [];
    }

    try {
      if (Platform.OS === 'android') {
        return await this.getAndroidPlans();
      }
      return await this.getIosPlans();
    } catch (error) {
      console.error('Failed to load subscription plans:', error);
      return [];
    }
  }

  private async getAndroidPlans(): Promise<SubscriptionPlan[]> {
    const storeProducts = await Purchases.getProducts([...ANDROID_STORE_PRODUCT_IDS]);
    const offerings = await Purchases.getOfferings();
    const offering = (OFFERING_ID && offerings?.all?.[OFFERING_ID]) || offerings?.current;
    const packages = offering?.availablePackages ?? [];

    const plans: SubscriptionPlan[] = [];
    for (const productId of ANDROID_STORE_PRODUCT_IDS) {
      const storeProduct = storeProducts.find((product) => product.identifier === productId) ?? null;
      const revenueCatPackage =
        packages.find((pkg) => getPackageStoreProductId(pkg) === productId) ?? null;

      if (storeProduct || revenueCatPackage) {
        plans.push({ identifier: productId, revenueCatPackage, storeProduct });
      }
    }

    return plans;
  }

  private async getIosPlans(): Promise<SubscriptionPlan[]> {
    const offerings = await Purchases.getOfferings();
    const offering = (OFFERING_ID && offerings?.all?.[OFFERING_ID]) || offerings?.current;
    const packages = offering?.availablePackages ?? [];

    return packages.map((pkg) => ({
      identifier: getPackageStoreProductId(pkg),
      revenueCatPackage: pkg,
      storeProduct: null,
    }));
  }

  getDefaultPlan(plans: SubscriptionPlan[] = []): SubscriptionPlan | null {
    if (!Array.isArray(plans) || plans.length === 0) {
      return null;
    }

    const priority = [
      'rc-10-qtr',
      'rc_10_qtr',
      'quarter',
      'qtr',
      'six_month',
      '$rc_six_month',
      'rc-5-monthly',
      'rc_5_monthly',
      'monthly',
      '$rc_monthly',
    ];

    const scored = [...plans].sort((a, b) => {
      const aId = a.identifier.toLowerCase();
      const bId = b.identifier.toLowerCase();

      const aIdx = priority.findIndex((p) => aId.includes(p));
      const bIdx = priority.findIndex((p) => bId.includes(p));

      const aScore = aIdx === -1 ? 999 : aIdx;
      const bScore = bIdx === -1 ? 999 : bIdx;
      return aScore - bScore;
    });

    return scored[0] || plans[0];
  }

  async purchasePlan(plan: SubscriptionPlan | null): Promise<PurchaseResult> {
    if (!this.isInitialized) {
      return { success: false, error: 'RevenueCat is not initialized' };
    }
    if (!plan) {
      return { success: false, error: 'No plan selected' };
    }

    try {
      const purchaseResult = plan.revenueCatPackage
        ? await Purchases.purchasePackage(plan.revenueCatPackage)
        : plan.storeProduct
          ? await Purchases.purchaseStoreProduct(plan.storeProduct)
          : null;

      if (!purchaseResult?.customerInfo) {
        return { success: false, error: 'No product available to purchase' };
      }

      // Refresh so entitlements/subscriptions are up to date after the purchase.
      const customerInfo = await Purchases.getCustomerInfo().catch(
        () => purchaseResult.customerInfo,
      );
      const hasEntitlement = hasActiveEntitlement(customerInfo);
      return { success: true, customerInfo, hasEntitlement };
    } catch (error) {
      const purchaseError = error as { code?: string; message?: string };
      const userCancelled = purchaseError?.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR;
      return {
        success: false,
        userCancelled,
        error: purchaseError?.message || 'Purchase failed',
      };
    }
  }

  async restorePurchases(): Promise<PurchaseResult> {
    if (!this.isInitialized) {
      return { success: false, error: 'RevenueCat is not initialized' };
    }

    try {
      await Purchases.restorePurchases();
      const customerInfo = await Purchases.getCustomerInfo();
      const hasEntitlement = hasActiveEntitlement(customerInfo);
      return { success: true, customerInfo, hasEntitlement };
    } catch (error) {
      const restoreError = error as { message?: string };
      return { success: false, error: restoreError?.message || 'Restore failed' };
    }
  }

  /**
   * If Firestore access looks inactive, re-check RevenueCat and sync verification.
   * Helps recover when a purchase succeeded but entitlements/Firestore were out of sync.
   */
  async ensurePremiumSynced(): Promise<boolean> {
    try {
      const userId = auth().currentUser?.uid ?? null;
      if (!this.isInitialized) {
        await this.initialize(userId);
      }
      if (!this.isInitialized) {
        return false;
      }

      const customerInfo = await Purchases.getCustomerInfo();
      if (!hasActiveEntitlement(customerInfo)) {
        return false;
      }

      return await this.syncVerificationFromCustomerInfo(customerInfo);
    } catch (error) {
      console.error('ensurePremiumSynced failed:', error);
      return false;
    }
  }

  private getFallbackExpiryDays(productId: string): number {
    const id = productId.toLowerCase();
    if (id.includes('qtr') || id.includes('quarter') || id.includes('three_month')) {
      return 90;
    }
    if (id.includes('six')) {
      return 180;
    }
    if (id.includes('annual') || id.includes('year')) {
      return 365;
    }
    return 30;
  }

  async syncVerificationFromCustomerInfo(customerInfo: CustomerInfo): Promise<boolean> {
    try {
      const user = auth().currentUser;
      if (!user || !customerInfo) {
        return false;
      }

      const entitlement =
        customerInfo?.entitlements?.active?.[ENTITLEMENT_ID] ??
        Object.values(customerInfo?.entitlements?.active ?? {})[0];

      const activeSubscriptions = customerInfo?.activeSubscriptions ?? [];
      const verifiedAt = new Date();
      let expiryDate: Date | null = null;

      if (entitlement) {
        expiryDate = entitlement.expirationDate
          ? new Date(entitlement.expirationDate)
          : new Date(verifiedAt.getTime() + 1000 * 60 * 60 * 24 * 30);
      } else if (activeSubscriptions.length > 0) {
        // Purchase can succeed with activeSubscriptions even when the Premium
        // entitlement is missing/misconfigured in RevenueCat. Do NOT mark unverified.
        const days = this.getFallbackExpiryDays(activeSubscriptions[0]);
        expiryDate = new Date(verifiedAt.getTime() + 1000 * 60 * 60 * 24 * days);
        console.warn(
          'RevenueCat has active subscription but no entitlement; unlocking with fallback expiry.',
          { subscription: activeSubscriptions[0], days },
        );
      } else {
        await updateUserData(user.uid, 'virified', false);
        return false;
      }

      const synced = await updateUserVerification(user.uid, true, verifiedAt, expiryDate);
      console.log('Synced premium verification:', {
        uid: user.uid,
        expiryDate: expiryDate.toISOString(),
        synced,
      });
      return synced;
    } catch (error) {
      console.error('Failed to sync verification from customer info:', error);
      return false;
    }
  }
}

const revenueCatService = new RevenueCatServiceClass();

export default revenueCatService;
export { revenueCatService as RevenueCatService };
