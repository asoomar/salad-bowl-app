import React, {useState} from 'react';
import { StyleSheet, Text, View, Button, Dimensions } from 'react-native';
import Screens from '../constants/Screens';
import PrimaryButton from '../components/primitives/PrimaryButton';

export default function Home(props) {
    props.setPlayerID('');
    props.updateName('');
    props.updateGameID('');
    props.updateTeam(-1);

    return (
      <View style={styles.container}>
        <View style={styles.titleView}>
          <Text style={styles.title}>SALAD BOWL</Text>
        </View>
        <View style={styles.buttonView}>
          <PrimaryButton 
            text={"Create Game"}
            onPress={() => props.changeScreen(Screens.CREATE)}
          />
          <PrimaryButton 
            text={"Join Game"}
            onPress={() => props.changeScreen(Screens.JOIN)}
          />
        </View>
      </View>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    titleView: {
      flex: 5,
      justifyContent: 'center',
      width: Dimensions.get('screen').width
    },
    title: {
      fontSize: 60,
      fontFamily: 'poppins-semibold',
      color: '#515151',
      fontWeight: 'bold',
      textAlign: 'center'
    },
    buttonView: {
      flex: 2
    }
  });