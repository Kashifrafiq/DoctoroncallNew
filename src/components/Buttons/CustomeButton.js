import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { COLORS } from '../../assets/color/COLOR'

const CustomeButton = ({text, type, onPressFunction}) => {
   
  return (
  <TouchableOpacity onPress={onPressFunction} style={[styles.container, styles[`container_${type}`] ]}>
    <Text style={[styles[`${type}_text`]]}>{text}</Text>
  </TouchableOpacity>
  )
}

export default CustomeButton

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginTop: 15,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10
    },
    primary_text: {
        fontSize: 22,
        color: COLORS.white
    },
    secondary_text: {
        fontSize: 22,
        color: COLORS.buttonSecondary
    },

    container_primary : {
        backgroundColor: COLORS.buttonPrimary,
    },
    container_secondary : {
        borderColor: COLORS.buttonSecondary,
        borderWidth: 1,
    }


})