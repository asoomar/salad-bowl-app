import React, {useState} from 'react';
import { StyleSheet, Text, View, Image, Dimensions, TouchableOpacity } from 'react-native';
import Screens from '../constants/Screens';
import PrimaryButton from '../components/primitives/PrimaryButton';
import InstructionsModal from '../components/segments/InstructionsModal';

const isTitleImage = true

export default function Home(props) {
  const [showInstructions, setShowInstructions] = useState(false);
  props.setPlayerID('');
  props.updateName('');
  props.updateGameID('');
  props.updateTeam(-1);

  return (
    <View style={styles.container}>
      <InstructionsModal 
        onCloseModal={() => setShowInstructions(false)}
        modalVisible={showInstructions}
      />
      <View style={styles.titleView}>
        {isTitleImage 
        ? <Image style={styles.image} source={require('../assets/logo.png')} />
        : <Text style={styles.title}>SALAD BOWL</Text>
        }
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
        <TouchableOpacity 
          style={styles.instructionsTag}
          onPress={() => setShowInstructions(true)}
        > 
          <Text style={styles.instructionsText}>How To Play</Text>
        </TouchableOpacity>
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
      flex: 3,
      alignItems: 'center',
      justifyContent: 'center',
      width: Dimensions.get('screen').width
    },
    title: {
      fontSize: 80,
      fontFamily: 'poppins-extrabold',
      color: '#ffffff',
      textAlign: 'center',
      textShadowOffset: { width: 5, height: 7 },
      textShadowRadius: 1,
      textShadowColor: '#000000cc',
    },
    image: {
      resizeMode: 'contain',
      width: '90%',
      maxHeight: Dimensions.get('screen').height*0.5,
    },
    buttonView: {
      flex: 2,
      minWidth: '85%',
      display: 'flex',
      alignItems: 'center'
    },
    instructionsTag: {
      marginTop: 15,
      paddingLeft: Dimensions.get('screen').width/15,
      paddingRight: Dimensions.get('screen').width/15,
      minWidth: '85%',
      maxWidth: '85%',
    },
    instructionsText: {
      fontSize: Dimensions.get('screen').height/40,
      fontFamily: 'poppins-semibold',
      color: '#ffffff66',
      textAlign: 'center',
      // textDecorationLine: 'underline',
    },
  });