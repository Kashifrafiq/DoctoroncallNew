import { StyleSheet, Text, View, Image } from 'react-native'
import React from 'react'
import LinearGradient from 'react-native-linear-gradient';
import LOGO from '../../assets/img/logo.png'
import LOGOSEC from '../../assets/img/logoSec.png'

const Header = () => {
  return (
    <LinearGradient
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        colors={[
          'rgba(255, 255, 255, 0)',
          'rgba(255, 255, 255, 0.5)',
          'rgba(197, 224, 249, 1)',
        ]}
        style={styles.headerContainer}>
            <Image source={LOGO} style={styles.image} resizeMode='contain'/>
            <Image source={LOGOSEC} style={{height: '90%', width: '40%'}} resizeMode='contain'/>
      </LinearGradient>
  )
}

export default Header

const styles = StyleSheet.create({
    headerContainer: {
        width: '100%',
        height: '5%',
       alignItems : 'center',
       borderRadius: 20,
       flexDirection: 'row',
       justifyContent: 'space-between',
       marginTop: 10,
      },
      image: {
        height: '90%',
        width: '50%',

      }
})