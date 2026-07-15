import AntDesign from '@expo/vector-icons/AntDesign';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { HtmlWebViewContent } from '@/components/disease/html-web-view-content';
import { COLORS } from '@/constants/colors';

type InfoCardProps = {
  property: string;
  desc?: string;
  onImagePress?: (uri: string) => void;
};

export function InfoCard({ property, desc, onImagePress }: InfoCardProps) {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <View style={styles.inforcardContainer}>
      <Pressable
        onPress={() => setShowInfo((current) => !current)}
        style={styles.inforcardinnerContainer}>
        <Text style={styles.inforcardText}>{property}</Text>
        <AntDesign name={showInfo ? 'up' : 'down'} size={16} color={COLORS.textGrey} />
      </Pressable>

      {showInfo ? (
        <View style={styles.inforcardTextArea}>
          <HtmlWebViewContent html={desc} onImagePress={onImagePress} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  inforcardContainer: {
    width: '100%',
    backgroundColor: COLORS.infoCardBg,
    marginTop: 10,
    borderWidth: 1,
    borderColor: COLORS.nameCardBorder,
    borderRadius: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  inforcardinnerContainer: {
    width: '98%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  inforcardText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textGrey,
    flex: 1,
    marginRight: 8,
  },
  inforcardTextArea: {
    width: '90%',
    alignSelf: 'center',
    marginBottom: 8,
  },
});
