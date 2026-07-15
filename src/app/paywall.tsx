import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type TextStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS } from '@/constants/colors';
import { auth } from '@/services/firebase-functions';
import RevenueCatService, {
  getPlanProduct,
  type SubscriptionPlan,
} from '@/services/revenue-cat';

const FONT = {
  serif: { fontFamily: 'Georgia', fontWeight: '400' } as TextStyle,
  serifItalic: { fontFamily: 'Georgia', fontStyle: 'italic' } as TextStyle,
  serifSemiBold: { fontFamily: 'Georgia', fontWeight: '600' } as TextStyle,
  body: { fontFamily: 'System', fontWeight: '400' } as TextStyle,
  bodyLight: { fontFamily: 'System', fontWeight: '300' } as TextStyle,
  bodyMedium: { fontFamily: 'System', fontWeight: '500' } as TextStyle,
  bodySemiBold: { fontFamily: 'System', fontWeight: '600' } as TextStyle,
};

const C = {
  black: '#0d0d0d',
  white: '#ffffff',
  blue: '#1a6b8a',
  gold: '#c8a96e',
  green: '#22c55e',
  greenBg: '#f8fdf9',
  greenBorder: '#d4f0e0',
  greenText: '#2a7a4a',
  avatarBg: '#e8f0f8',
  avatarText: '#1a6b8a',
  border: '#ebebeb',
  borderLight: '#f5f5f5',
  textMuted: '#999',
  textLight: '#bbb',
  textXLight: '#ccc',
  featureNum: '#ddd',
};

const FEATURES = [
  {
    num: '01',
    title:
      'Comprehensive stepwise management for 500+ diseases based on CMDT latest guidelines',
    desc: '',
  },
  {
    num: '02',
    title:
      'Emergency & ICU care with electrolyte correction and critical algorithms (BLS/ACLS, ECG)',
    desc: '',
  },
  {
    num: '03',
    title:
      'Specialized protocols for pediatrics, obstetrics, trauma, and surgical care (ERAS)',
    desc: '',
  },
  {
    num: '04',
    title:
      'Detailed drug guidance including infusion doses and a 4000+ drug monograph database',
    desc: '',
  },
  {
    num: '05',
    title:
      'Additional coverage of dermatology, aesthetics, and clinical procedure guidelines',
    desc: '',
  },
];

const AVATARS = ['DR', 'MS', 'AK', '+'];

function planTitle(plan: SubscriptionPlan) {
  const id = plan.identifier || '';
  if (id.includes('qtr') || id.includes('quarter') || id.includes('six')) {
    return 'Quarterly Access';
  }
  if (id.includes('month') || id.includes('monthly')) {
    return 'Monthly Access';
  }
  return 'Premium Plan';
}

function planPrice(plan: SubscriptionPlan) {
  return getPlanProduct(plan)?.priceString || '—';
}

function isBestValue(plan: SubscriptionPlan | null | undefined) {
  const id = plan?.identifier || '';
  return id.includes('qtr') || id.includes('quarter') || id.includes('six');
}

function KickerLine() {
  return (
    <View style={styles.kicker}>
      <View style={styles.kickerLine} />
      <Text style={styles.kickerText}>Premium Access</Text>
    </View>
  );
}

function TrustedRow() {
  return (
    <View style={styles.trustedRow}>
      <View style={styles.avatarGroup}>
        {AVATARS.map((avatar, index) => (
          <View key={avatar} style={[styles.avatar, index > 0 && styles.avatarOverlap]}>
            <Text style={styles.avatarText}>{avatar}</Text>
          </View>
        ))}
      </View>
      <View>
        <Text style={styles.trustedBold}>10,000+ medical professionals</Text>
        <Text style={styles.trustedSub}>already using Premium</Text>
      </View>
    </View>
  );
}

function FeatureItem({
  num,
  title,
  desc,
}: {
  num: string;
  title: string;
  desc: string;
}) {
  return (
    <View style={styles.featRow}>
      <Text style={styles.featNum}>{num}</Text>
      <View style={styles.featBody}>
        <Text style={styles.featTitle}>{title}</Text>
        {desc ? <Text style={styles.featDesc}>{desc}</Text> : null}
      </View>
      <View style={styles.featCheck}>
        <MaterialCommunityIcons name="check" size={10} color={C.green} />
      </View>
    </View>
  );
}

function PlanCard({
  plan,
  selected,
  onPress,
}: {
  plan: SubscriptionPlan;
  selected: boolean;
  onPress: () => void;
}) {
  const bestValue = isBestValue(plan);

  return (
    <Pressable
      style={[styles.planCard, selected && styles.planCardSelected]}
      onPress={onPress}>
      {bestValue ? (
        <View style={styles.bestBadge}>
          <Text style={styles.bestBadgeText}>BEST VALUE</Text>
        </View>
      ) : null}
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected ? <View style={styles.radioDot} /> : null}
      </View>
      <View style={styles.planInfo}>
        <Text style={styles.planName}>{planTitle(plan)}</Text>
        <Text style={styles.planNote}>
          {bestValue ? 'Billed quarterly · saves vs monthly' : 'Renews each month · cancel anytime'}
        </Text>
      </View>
      <View style={styles.planPriceWrap}>
        <Text style={styles.planPrice}>{planPrice(plan)}</Text>
        <Text style={styles.planPer}>{bestValue ? 'per quarter' : 'per month'}</Text>
      </View>
    </Pressable>
  );
}

function TrustRow() {
  return (
    <View style={styles.trustRow}>
      {[
        { icon: 'lock-outline' as const, label: 'Secure' },
        { icon: 'close-circle-outline' as const, label: 'Cancel anytime' },
        { icon: 'earth' as const, label: 'All devices' },
      ].map(({ icon, label }) => (
        <View key={label} style={styles.trustItem}>
          <MaterialCommunityIcons name={icon} size={16} color={C.textXLight} />
          <Text style={styles.trustLabel}>{label}</Text>
        </View>
      ))}
    </View>
  );
}

export default function PaywallScreen() {
  const router = useRouter();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  const loadPackages = async () => {
    try {
      setLoading(true);
      const userId = auth().currentUser?.uid ?? null;
      await RevenueCatService.initialize(userId);

      const availablePlans = await RevenueCatService.getAvailablePlans();
      setPlans(availablePlans);
      setSelectedPlan(RevenueCatService.getDefaultPlan(availablePlans));
    } catch {
      Alert.alert('Error', 'Unable to load subscription packages.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPackages();
  }, []);

  const selectedPrice = useMemo(() => {
    return getPlanProduct(selectedPlan)?.priceString || '';
  }, [selectedPlan]);

  const savingText = useMemo(() => {
    if (!selectedPlan) {
      return '';
    }
    return isBestValue(selectedPlan)
      ? 'Quarterly plan — best value, save vs monthly'
      : 'Monthly plan — cancel anytime from your store';
  }, [selectedPlan]);

  const onSubscribe = async () => {
    if (!selectedPlan) {
      return;
    }

    setPurchasing(true);
    try {
      const result = await RevenueCatService.purchasePlan(selectedPlan);
      if (result.userCancelled) {
        return;
      }
      if (result.success && result.hasEntitlement && result.customerInfo) {
        const synced = await RevenueCatService.syncVerificationFromCustomerInfo(result.customerInfo);
        if (!synced) {
          Alert.alert(
            'Purchase Successful',
            'Payment went through, but we could not activate Premium yet. Please tap Restore Purchases.',
          );
          return;
        }
        Alert.alert('Success', 'Premium activated successfully!', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert('Purchase Failed', result.error || 'Unable to subscribe.');
      }
    } catch {
      Alert.alert('Error', 'Subscription failed. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  const onRestore = async () => {
    setPurchasing(true);
    try {
      const result = await RevenueCatService.restorePurchases();
      if (result.success && result.hasEntitlement && result.customerInfo) {
        const synced = await RevenueCatService.syncVerificationFromCustomerInfo(result.customerInfo);
        if (!synced) {
          Alert.alert(
            'Restore Incomplete',
            'A purchase was found, but Premium could not be activated. Please try again.',
          );
          return;
        }
        Alert.alert('Restored', 'Your subscription has been restored.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert('No Active Purchase', 'No purchases found to restore.');
      }
    } catch {
      Alert.alert('Error', 'Could not restore purchases.');
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable style={styles.closeBtn} onPress={() => router.back()}>
            <MaterialCommunityIcons name="close" size={14} color="#888" />
          </Pressable>
          <Text style={styles.headerLabel}>Doctor on Call</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.hero}>
          <KickerLine />
          <Text style={styles.title}>
            Your clinical{'\n'}
            <Text style={styles.titleItalic}>library, complete</Text>
          </Text>
          <Text style={styles.subtitle}>
            Everything a doctor or medical student needs — trusted, current, and always at hand.
          </Text>
        </View>

        <TrustedRow />
        <View style={styles.divider} />

        <View style={styles.features}>
          {FEATURES.map((feature) => (
            <FeatureItem key={feature.num} {...feature} />
          ))}
        </View>

        <View style={styles.divider} />

        <View style={styles.plansWrap}>
          <Text style={styles.plansLabel}>Choose your plan</Text>

          {loading ? (
            <ActivityIndicator size="large" color={C.blue} style={styles.plansLoader} />
          ) : plans.length === 0 ? (
            <Text style={styles.noPlans}>
              No plans found. Please configure products in RevenueCat.
            </Text>
          ) : (
            plans.map((plan) => (
              <PlanCard
                key={plan.identifier}
                plan={plan}
                selected={selectedPlan?.identifier === plan.identifier}
                onPress={() => setSelectedPlan(plan)}
              />
            ))
          )}
        </View>

        {selectedPlan ? (
          <View style={styles.savingBar}>
            <View style={styles.savingDot} />
            <Text style={styles.savingText}>{savingText}</Text>
          </View>
        ) : null}

        <View style={styles.ctaWrap}>
          <Pressable
            style={[styles.ctaBtn, (!selectedPlan || purchasing) && styles.ctaDisabled]}
            onPress={onSubscribe}
            disabled={!selectedPlan || purchasing}>
            {purchasing ? (
              <ActivityIndicator color={C.white} />
            ) : (
              <View style={styles.ctaInner}>
                <MaterialCommunityIcons name="shield-check-outline" size={15} color={C.white} />
                <Text style={styles.ctaText}>Get Premium</Text>
                {selectedPrice ? <Text style={styles.ctaPrice}> {selectedPrice}</Text> : null}
              </View>
            )}
          </Pressable>

          <Pressable style={styles.restoreBtn} onPress={onRestore} disabled={purchasing}>
            <Text style={styles.restoreText}>Restore Purchases</Text>
          </Pressable>
        </View>

        <TrustRow />

        <Text style={styles.terms}>
          Subscription renews automatically until cancelled. Manage via your App Store or Play Store
          settings. By continuing you agree to our Terms of Service and Privacy Policy.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.white },
  scroll: { paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#f7f7f7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLabel: {
    ...FONT.bodyMedium,
    fontSize: 11,
    color: '#888',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  headerSpacer: { width: 34 },
  hero: { paddingHorizontal: 24, paddingTop: 32 },
  kicker: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  kickerLine: { width: 22, height: 1, backgroundColor: C.gold },
  kickerText: {
    ...FONT.bodyMedium,
    fontSize: 11,
    color: C.gold,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  title: {
    ...FONT.serif,
    fontSize: 44,
    lineHeight: 50,
    color: C.black,
    marginBottom: 14,
  },
  titleItalic: {
    ...FONT.serifItalic,
    fontSize: 44,
    color: C.gold,
  },
  subtitle: {
    ...FONT.bodyLight,
    fontSize: 14,
    color: C.textMuted,
    lineHeight: 22,
  },
  trustedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 22,
    gap: 14,
  },
  avatarGroup: { flexDirection: 'row' },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: C.avatarBg,
    borderWidth: 2,
    borderColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarOverlap: { marginLeft: -8 },
  avatarText: { ...FONT.bodySemiBold, fontSize: 9, color: C.avatarText },
  trustedBold: { ...FONT.bodySemiBold, fontSize: 13, color: '#555' },
  trustedSub: { ...FONT.body, fontSize: 12, color: '#aaa', marginTop: 1 },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 24,
    marginTop: 24,
  },
  features: { paddingHorizontal: 24, paddingTop: 4 },
  featRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.borderLight,
  },
  featNum: {
    ...FONT.serif,
    fontSize: 15,
    color: C.featureNum,
    minWidth: 22,
    paddingTop: 1,
  },
  featBody: { flex: 1 },
  featTitle: { ...FONT.bodyMedium, fontSize: 14, color: '#1a1a1a', marginBottom: 3 },
  featDesc: { ...FONT.bodyLight, fontSize: 12, color: C.textLight, lineHeight: 18 },
  featCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#f0faf5',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  plansWrap: { paddingHorizontal: 24, paddingTop: 26 },
  plansLabel: {
    ...FONT.bodyMedium,
    fontSize: 11,
    color: C.textXLight,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  plansLoader: { marginVertical: 24 },
  noPlans: {
    ...FONT.body,
    fontSize: 13,
    color: C.textMuted,
    textAlign: 'center',
    marginVertical: 16,
  },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 18,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 18,
    backgroundColor: C.white,
    marginBottom: 10,
    position: 'relative',
  },
  planCardSelected: {
    borderColor: C.green,
    backgroundColor: C.greenBg,
    shadowColor: C.blue,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 2,
  },
  bestBadge: {
    position: 'absolute',
    top: -11,
    right: 16,
    backgroundColor: C.black,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  bestBadgeText: {
    ...FONT.bodySemiBold,
    fontSize: 9,
    color: C.white,
    letterSpacing: 0.8,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: C.blue },
  radioDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: C.blue },
  planInfo: { flex: 1 },
  planName: { ...FONT.bodyMedium, fontSize: 14, color: '#111', marginBottom: 3 },
  planNote: { ...FONT.bodyLight, fontSize: 11, color: C.textLight },
  planPriceWrap: { alignItems: 'flex-end' },
  planPrice: { ...FONT.serifSemiBold, fontSize: 26, color: C.black, lineHeight: 28 },
  planPer: { ...FONT.bodyLight, fontSize: 10, color: C.textXLight, marginTop: 3 },
  savingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginTop: 10,
    backgroundColor: C.greenBg,
    borderWidth: 1,
    borderColor: C.greenBorder,
    borderRadius: 12,
    padding: 11,
    gap: 9,
  },
  savingDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.green },
  savingText: { ...FONT.body, fontSize: 12, color: C.greenText },
  ctaWrap: { paddingHorizontal: 24, paddingTop: 22 },
  ctaBtn: {
    backgroundColor: COLORS.banner,
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: 'center',
  },
  ctaDisabled: { opacity: 0.45 },
  ctaInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ctaText: {
    ...FONT.bodyMedium,
    fontSize: 15,
    color: C.white,
    letterSpacing: 0.3,
  },
  ctaPrice: {
    ...FONT.bodyLight,
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
  },
  restoreBtn: { alignItems: 'center', paddingVertical: 14 },
  restoreText: { ...FONT.body, fontSize: 13, color: '#aaa' },
  trustRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 28,
    paddingTop: 4,
  },
  trustItem: { alignItems: 'center', gap: 4 },
  trustLabel: {
    ...FONT.body,
    fontSize: 10,
    color: C.textXLight,
    letterSpacing: 0.5,
  },
  terms: {
    ...FONT.bodyLight,
    fontSize: 10,
    color: '#d0d0d0',
    lineHeight: 16,
    textAlign: 'center',
    paddingHorizontal: 32,
    paddingTop: 14,
  },
});
