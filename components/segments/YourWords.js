import React, {Component} from 'react';
import { StyleSheet, Text, View, ScrollView, Dimensions } from 'react-native';
import PrimaryTextInput from '../primitives/PrimaryTextInput';
import PrimaryButton from '../primitives/PrimaryButton';
import NumberRanks from '../../constants/NumberRanks';
import PropTypes from 'prop-types';

YourWords.propTypes = {
  wordsPerPlayer: PropTypes.number.isRequired,
  words: PropTypes.array.isRequired,
  onWordChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  error: PropTypes.string,
  style: PropTypes.object,
  placeholderTextColor: PropTypes.string
}

export default function YourWords(props) {
  return (
    <ScrollView>
      <View style={styles.mainView}>
        {props.words.map((wordObject,i) => {
          if (i < props.wordsPerPlayer) {
            return (
              <PrimaryTextInput 
                key={NumberRanks[i]}
                autoCorrect={true}
                marginBottom={10}
                onChangeText={text => props.onWordChange(text, i)}
                placeholder={`${NumberRanks[i]} Word`}
                placeholderTextColor={props.placeholderTextColor}
                style={props.style}
                value={wordObject.word}
              />
            )}
        })}
        <View style={styles.errorBox}>
          <Text style={styles.error}>{props.error}</Text>
        </View> 
        <PrimaryButton
          text={'Submit Words'}
          onPress={() => props.onSubmit()}
        />
      </View>
    </ScrollView>
  );
}
  
const styles = StyleSheet.create({
  mainView: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 10,
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
    color: 'red',
  }
});