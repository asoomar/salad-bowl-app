import React, {useState} from 'react';
import { StyleSheet, Text, View, Button, TextInput, ShadowPropTypesIOS } from 'react-native';
import Screens from '../constants/Screens';

export default function Home(props) {
    props.setPlayerID('');
    props.updateName('');
    props.updateGameID('');
    props.updateTeam(-1);

    return (
      <View style={styles.container}>
        <Button title="Create Game" onPress={()=>props.changeScreen(Screens.CREATE)}/> 
        <Button title="Join Game" onPress={()=>props.changeScreen(Screens.JOIN)}/>
      </View>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });