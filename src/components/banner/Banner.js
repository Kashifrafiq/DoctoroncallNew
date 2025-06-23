import {Image, StyleSheet, Text, View, Linking, TouchableOpacity} from 'react-native';
import React from 'react';
import {COLORS} from '../../assets/color/COLOR';
import BannerImage from '../../assets/img/bannerImage.png';

const Banner = ({mainText, secondText, image}) => {
  const onPressContactUs = () => {
    const url =
      'https://api.whatsapp.com/send?phone=+9203175193394&text=Asslam%20o%20Alaikum.%20I%20have%20installed%20Doctor%20OnCall%20Book.%20I%20am%20intrested%20in%20Doctor%20Oncall%20call%20book%20for%20full%20app%20subscription.%20Can%20you%20Please%20provide%20me%20more%20information%20and%20tell%20me%20how%20to%20order%20it%20?%20';
    Linking.openURL(url).catch(() => {
      alert('Make sure WhatsApp is installed on your device');
    });
  };
  return (
    <TouchableOpacity style={styles.container} onPress={onPressContactUs}>
      <View style={styles.leftContainer}>
        <Text style={styles.mainText}>DOCTOR ON CALL</Text>
        <Text style={styles.secondaryText}>
          Compulsory treatment guide for MOs, HOs, PGRs, & GPs.
        </Text>
        <View style={styles.buttonContainer}>
          <View style={styles.insideButton}>
            <Text style={styles.buttonText}>Buy Now</Text>
          </View>
          <Text style={styles.secondaryText}>Latest Edition</Text>
        </View>
      </View>
      <View style={styles.rightContainer}>
        <Image
          source={BannerImage}
          style={styles.bannerImage}
          resizeMode="contain"
        />
      </View>
    </TouchableOpacity>
  );
};

export default Banner;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: COLORS.Banner,
    height: 129,
    borderRadius: 15,
    padding: 10,
    justifyContent: 'space-around',
    alignItems: 'center',
    flexDirection: 'row',
  },
  leftContainer: {
    width: '55%',
    height: '90%',
    justifyContent: 'space-around',
  },
  rightContainer: {
    width: '40%',
    height: '90%',
  },

  buttonContainer: {
    width: '100%',
    // backgroundColor: 'green',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  insideButton: {
    width: '46%',
    backgroundColor: '#1D1209',
    borderRadius: 10,
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainText: {
    fontSize: 20,
    color: COLORS.black,
    fontWeight: '700',
  },
  secondaryText: {
    fontSize: 11,
    color: COLORS.black,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 12,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
});
