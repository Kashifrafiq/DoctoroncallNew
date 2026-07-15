import { type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
  type Edge,
} from 'react-native-safe-area-context';

type KeyboardAwareScrollViewProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  safeAreaEdges?: Edge[];
  keyboardVerticalOffset?: number;
  enableSafeArea?: boolean;
};

function KeyboardAwareScrollContent({
  children,
  contentContainerStyle,
  keyboardVerticalOffset,
}: Pick<
  KeyboardAwareScrollViewProps,
  'children' | 'contentContainerStyle' | 'keyboardVerticalOffset'
>) {
  const insets = useSafeAreaInsets();
  const offset = keyboardVerticalOffset ?? (Platform.OS === 'ios' ? insets.top : 0);

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={offset}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, contentContainerStyle]}>
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export function KeyboardAwareScrollView({
  children,
  style,
  contentContainerStyle,
  safeAreaEdges = ['top', 'left', 'right'],
  keyboardVerticalOffset,
  enableSafeArea = true,
}: KeyboardAwareScrollViewProps) {
  if (!enableSafeArea) {
    return (
      <KeyboardAwareScrollContent
        contentContainerStyle={contentContainerStyle}
        keyboardVerticalOffset={keyboardVerticalOffset}>
        {children}
      </KeyboardAwareScrollContent>
    );
  }

  return (
    <SafeAreaView style={[styles.container, style]} edges={safeAreaEdges}>
      <KeyboardAwareScrollContent
        contentContainerStyle={contentContainerStyle}
        keyboardVerticalOffset={keyboardVerticalOffset}>
        {children}
      </KeyboardAwareScrollContent>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
});
