import {
  Image,
  StyleSheet,
  Text,
  View,
  Dimensions,
  Pressable,
} from 'react-native';
import React from 'react';
import { COLORS } from '../../assets/color/COLOR';
import { FlatList } from 'react-native-gesture-handler';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';

const { height } = Dimensions.get('screen');
const DATA = [
  {
    heading: null,
    img: require('../../assets/img/profileScreen/1.png'),
    color: '#E8F5FF',
    desc: 'Welcome to the STANDARD TREATMENT PROTOCOLS platform, co-founded by esteemed medical professionals Dr. Aali Farooq and Dr. M Sufyan Akhtar. Our mission is to revolutionize medical practice by empowering Medical Officers and General Practitioners with precise standard guidelines for medical diagnosis and treatment.',
  },
  {
    heading: 'Why should you have our book?',
    img: require('../../assets/img/profileScreen/2.png'),
    color: '#FEFBD8',
    desc: 'Our book, based on the latest edition of Current Medical Diagnosis & Treatment 2024 and standard medical guidelines in Pakistan, is an indispensable resource for healthcare professionals. It encompasses commonly encountered medical conditions, offering comprehensive coverage of presentation scenarios, signs & symptoms, clinical examination findings, and required investigations.',
  },
  {
    heading: null,
    img: require('../../assets/img/profileScreen/5.png'),
    color: '#E5FFE4',
    desc: 'What sets us apart is our stepwise management approach to diseases, tailored according to comorbidities. Our precise guidelines are meticulously designed in a prescription format, facilitating efficient decision-making in clinical settings. Additionally, we provide information on commonly available drugs, formulations, drug calculations, and methods of introduction to patients.',
  },
  {
    heading: 'Who should use our book?',
    img: require('../../assets/img/profileScreen/3.png'),
    color: '#DDF5FF',
    desc: 'Our book is essential for House Officers, Medical Officers, General Practitioners, and Postgraduate Residents seeking a reliable and standardized resource for patient care. Whether you re a seasoned professional or a trainee, our platform equips you with the knowledge and tools necessary to deliver optimal medical care.',
  },

  {
    heading: null,
    img: require('../../assets/img/profileScreen/4.png'),
    color: '#FFCCD0',
    desc: 'Join us in elevating medical practice standards and improving patient outcomes with STANDARD TREATMENT PROTOCOLS.',
  },
];

const Card = ({ desc, img, color, heading, isLastCard }) => {
  return (
    <View style={[styles.cardContainer, { height: isLastCard ? 200 : 310, backgroundColor: color }]}>
      <Image source={img} resizeMode="contain" style={styles.cardImage} />
      {heading !== null ? (
        <Text style={styles.cardHeading}>{heading}</Text>
      ) : null}
      <Text style={styles.cardText}>{desc}</Text>
    </View>
  );
};

const ProfileScreen = () => {
  const navigation = useNavigation();

  const renderItem = ({ item, index }) => {
    const isLastCard = index === DATA.length - 1;

    return (
      <Card
        desc={item.desc}
        img={item.img}
        color={item.color}
        heading={item.heading}
        isLastCard={isLastCard}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.heading}>
        <Text style={styles.headingText}> About us!</Text>
        {/* Uncomment and configure this if needed */}
        {/* <Pressable
          onPress={() => auth().signOut().then(() => navigation.navigate('IntroScreen'))}
          style={styles.signOutButton}
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable> */}
      </View>

      <View style={{ flex: 1 }}>
        <FlatList
          showsVerticalScrollIndicator={false}
          data={DATA}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  heading: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headingText: {
    margin: 10,
    fontSize: 28,
    fontWeight: '600',
    color: COLORS.black,
  },
  cardContainer: {
    marginTop: 12,
    width: '90%',
    borderRadius: 10,
    alignSelf: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  cardImage: {
    width: 100,
    height: 100,
    margin: 10,
  },
  cardText: {
    width: '90%',
    alignSelf: 'center',
    fontSize: 14,
    color: COLORS.black,
  },
  cardHeading: {
    width: '90%',
    alignSelf: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  // signOutButton: {
  //   width: '20%',
  //   backgroundColor: COLORS.cardColor,
  //   padding: 10,
  //   borderRadius: 10,
  // },
  // signOutText: {
  //   color: 'red',
  // },
});
