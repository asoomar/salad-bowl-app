import React, {Component} from 'react';
import { StyleSheet, Text, View, Button, TextInput, Dimensions } from 'react-native';
import PrimaryTextInput from '../primitives/PrimaryTextInput';
import PrimaryButton from '../primitives/PrimaryButton';
import PropTypes from 'prop-types';

YourWords.propTypes = {
  firstWordValue: PropTypes.string.isRequired,
  secondWordValue: PropTypes.string.isRequired,
  onFirstWordChange: PropTypes.func.isRequired,
  onSecondWordChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  error: PropTypes.string,
  style: PropTypes.object,
  placeholderTextColor: PropTypes.string
}

export default function YourWords(props) {
  return (
    <View style={styles.container}>
      <View style={styles.mainView}>
        {/* THIS ERROR HAS TO HAVE PROPER UI */}
        <View style={styles.errorBox}>
          <Text style={styles.error}>{props.error}</Text>
        </View> 
        <PrimaryTextInput 
          autoCorrect={false}
          marginBottom={10}
          onChangeText={text => props.onFirstWordChange(text)}
          placeholder={'First Word'}
          placeholderTextColor={props.placeholderTextColor}
          style={props.style}
          value={props.firstWordValue}
        />
        <PrimaryTextInput 
          autoCorrect={false}
          onChangeText={text => props.onSecondWordChange(text)}
          placeholder={'Second Word'}
          placeholderTextColor={props.placeholderTextColor}
          style={props.style}
          value={props.secondWordValue}
        />
        <PrimaryButton
          text={'Submit Words'}
          onPress={() => props.onSubmit()}
        />
      </View>
    </View>
  );
}
  
const styles = StyleSheet.create({
  mainView: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  errorBox: {
    height: Dimensions.get('screen').height/25,
    display: 'flex',
    justifyContent: 'flex-end',
    flexDirection: 'column'
  },
  error: {
    fontSize: Dimensions.get('screen').height/55,
    fontFamily: 'poppins-semibold',
  }
});