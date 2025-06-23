import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import Header from '../../components/header/Header';
import DiseaseHeader from '../../components/header/DiseaseHeader';
import Icon from 'react-native-vector-icons/AntDesign';
import { COLORS } from '../../assets/color/COLOR';
import { useNavigation, useRoute } from '@react-navigation/native';
// import HTMLView from 'react-native-htmlview';
import { ScrollView } from 'react-native-gesture-handler';
import HTML from 'react-native-render-html';

const DATA = [
  {
    name: 'Definition',
    desc: 'A heart attack, also called a myocardial infarction, happens when a part of the heart muscle doesnt get enough blood. The more time that passes without treatment to restore blood flow, the greater the damage to the heart muscle. Coronary artery disease (CAD) is the main cause of heart attack.',
  },
  {
    name: 'Definition',
    desc: 'A heart attack, also called a myocardial infarction, happens when a part of the heart muscle doesnt get enough blood. The more time that passes without treatment to restore blood flow, the greater the damage to the heart muscle. Coronary artery disease (CAD) is the main cause of heart attack.',
  },
  {
    name: 'Definition',
    desc: 'A heart attack, also called a myocardial infarction, happens when a part of the heart muscle doesnt get enough blood. The more time that passes without treatment to restore blood flow, the greater the damage to the heart muscle. Coronary artery disease (CAD) is the main cause of heart attack.',
  },
  {
    name: 'Definition',
    desc: 'A heart attack, also called a myocardial infarction, happens when a part of the heart muscle doesnt get enough blood. The more time that passes without treatment to restore blood flow, the greater the damage to the heart muscle. Coronary artery disease (CAD) is the main cause of heart attack.',
  },
  {
    name: 'Definition',
    desc: 'A heart attack, also called a myocardial infarction, happens when a part of the heart muscle doesnt get enough blood. The more time that passes without treatment to restore blood flow, the greater the damage to the heart muscle. Coronary artery disease (CAD) is the main cause of heart attack.',
  },
];

const html = StyleSheet.create({
  a: {
    color: '#FF3366',
  },
  p: {
    color: COLORS.black,
  },
  div: {
    color: COLORS.black,
  },
  span: {
    color: '#993300',
  },
  h1: {
    color: COLORS.black,
  },
  h2: {
    color: COLORS.black,
  },
  h3: {
    color: COLORS.black,
  },
  ul: {
    color: COLORS.black,
  },
  li: {
    color: COLORS.black,
  },
  b: {
    color: COLORS.black,
  },
  i: {
    color: COLORS.black,
  },
  strong: {
    color: '#993300',
    fontWeight: 'bold',
  },
  table: {
    borderWidth: 1,
    borderColor: '#993300',
    marginVertical: 10,
  },
  tr: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#993300',
  },
  th: {
    flex: 1,
    padding: 8,
    fontWeight: 'bold',
    backgroundColor: '#f5f5f5',
  },
  td: {
    flex: 1,
    padding: 8,
  },
  'td:first-child': {
    fontWeight: 'bold',
  },
  p: {
    color: COLORS.black,
    fontSize: 14,
    marginBottom: 10,
    lineHeight: 20,
  },

});

const cleanText = text => text.replace(/\n+/g, '\n').trim();

const InfoCard = ({ property, desc }) => {
  const { width } = useWindowDimensions();
  const [showInfo, setShowInfo] = useState(false);
  console.log('Desc:', desc);

  return (
    <View style={styles.inforcardContainer}>
      <TouchableOpacity
        onPress={() => setShowInfo(!showInfo)}
        style={styles.inforcardinnerContainer}>
        <Text style={styles.inforcardText}>{property}</Text>
        <View>
          <Icon
            name={showInfo ? 'up' : 'down'}
            size={16}
            color={COLORS.textgrey}
          />
        </View>
      </TouchableOpacity>

      {showInfo ? (
        <View style={styles.inforcardTextArea}>
          <HTML
            contentWidth={width}
            source={{ html: desc }}
            tagsStyles={html}
           
            ignoredDomTags={['iframe', 'script']}
            imagesMaxWidth={width - 40} // Account for padding
            baseFontStyle={{ color: COLORS.black, fontSize: 14 }}
          />
        </View>
      ) : null}
    </View>
  );
};

const DiseaseInfoScreen = () => {
  const [showInfo, setShowInfo] = useState(true);
  const navigation = useNavigation();

  const route = useRoute();
  const data = route.params;



  useEffect(() => {
    console.log('Data from route: ', data)
  }, [])

  const onPressback = () => {
    navigation.goBack();
  };
  return (
    <View style={styles.mainContainer} showsVerticalScrollIndicator={false}>
      <Header />
      <DiseaseHeader
        img={data?.catData?.image}
        mainText={data?.catData?.heading}
        secText={data?.catData?.count}
        id={data?.catData?.diseaseId}
        diseaseID={data?.id}
        disable={false}
      />
      <TouchableOpacity style={styles.header} onPress={onPressback}>
        <Icon name={'arrowleft'} size={30} color={COLORS.textgrey} />
        <Text style={styles.HeadingText}>{data.name}</Text>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* <View
          style={styles.inforcardContainer}
          showsVerticalScrollIndicator={false}>
          <View style={styles.inforcardinnerContainer}>
            <Text style={styles.inforcardText}>Description</Text>
            <TouchableOpacity onPress={() => setShowInfo(!showInfo)}>
              <Icon
                name={showInfo ? 'up' : 'down'}
                size={16}
                color={COLORS.textgrey}
              />
            </TouchableOpacity>
          </View>

          {showInfo ? (
            <View style={styles.inforcardTextArea}>
              <HTML 
           source={data.catData}
                stylesheet={html}
              />
            
            </View>
          ) : null}


        </View> */}

        <FlatList
          scrollEnabled={false}
          data={data.acf[`questions_&_answers`]}
          renderItem={({ item }) => (
            <InfoCard desc={item.answer} property={item.question} />
          )}
        />
      </ScrollView>
    </View>
  );
};

export default DiseaseInfoScreen;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
  },
  header: {
    width: '90%',
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    
  },
  HeadingText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textgrey,
    marginLeft: 5,
  },
  inforcardContainer: {
    width: '100%',
    backgroundColor: COLORS.infocardBG,
    marginTop: 10,
    borderWidth: 1,
    borderColor: COLORS.nameCardBorder,
    borderRadius: 10,
    // Shadow properties for iOS
    ...Platform.select({
      ios: {
        shadowColor: '#000', // Shadow color
        shadowOffset: { width: 0, height: 2 }, // Shadow offset
        shadowOpacity: 0.1, // Shadow opacity (lower value for subtle shadow)
        shadowRadius: 4, // Shadow blur radius
      },
      android: {
        elevation: 4, // Shadow depth (higher value for more prominent shadow)
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
    color: COLORS.textgrey,
  },
  inforcardTextArea: {
    width: '90%',
    height: 'auto',
    // justifyContent: 'center',
    // alignItems: 'flex-start',
    alignSelf: 'center',
    // backgroundColor: 'green'
    //  flexWrap: 'wrap'
  },
  infordescText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textgrey,
  },
});
