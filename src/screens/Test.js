import {StyleSheet, Text, View, Image, Button} from 'react-native';
import React, {useEffect, useState} from 'react';

const Test = () => {
  const [count, setCount] = useState(10);




  const Button2 = () => {
    console.log('THis is useEffect');
  };

  const Button3 = () => {
    console.log('THis is Not useEffect');
  };

  useEffect(() => {
    Button2();
  },[count]);


  

  return (
    <View style={styles.container}>
      <View style={styles.container2}>
        <Text style={styles.Text}>1</Text>
      </View>
      <View style={styles.container3}>
        <Text>{count}</Text>
      </View>
      <Button onPress={() => setCount(count+ 1)}  title="count" />
    </View>
  );
};

export default Test;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'green',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  container2: {
    flex: 2,
    width: '30%',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    backgroundColor: 'red',
  },
  container3: {
    flex: 1,
    backgroundColor: 'yellow',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  Text: {
    color: 'white',
  },
});
