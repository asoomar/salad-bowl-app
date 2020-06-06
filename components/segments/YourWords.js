import React, {Component} from 'react';
import ReactNative, { 
  StyleSheet, 
  Text, 
  View, 
  Dimensions
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scrollview-custom';
import PrimaryTextInput from '../primitives/PrimaryTextInput';
import PrimaryButton from '../primitives/PrimaryButton';
import NumberRanks from '../../constants/NumberRanks';
import Loader from '../primitives/Loader';
import PropTypes from 'prop-types';

class YourWords extends Component {
  render() {
    return (
      <KeyboardAwareScrollView>
        <View style={styles.mainView}>
          <Loader
            isLoading={this.props.wordsPerPlayer === 0}
          >
            {this.props.words.map((wordObject,i) => {
              if (i < this.props.wordsPerPlayer) {
                return (
                  <PrimaryTextInput 
                    key={NumberRanks[i]}
                    autoCorrect={true}
                    marginTop={10}
                    onChangeText={text => this.props.onWordChange(text, i)}
                    placeholder={`${NumberRanks[i]} Word`}
                    placeholderTextColor={this.props.placeholderTextColor}
                    returnKeyType='default'
                    style={this.props.style}
                    value={wordObject.word}
                  />
                )}
            })}
            {this.props.error !== '' 
            ? <View style={styles.errorBox}>
                <Text style={styles.error}>{this.props.error}</Text>
              </View>
            : null}
            <PrimaryButton
              text={'Submit Words'}
              onPress={() => this.props.onSubmit()}
              buttonStyle={styles.submitButton}
              textStyle={styles.submitButtonText}
              disabled={this.props.disabled}
            />
          </Loader>
        </View>
      </KeyboardAwareScrollView>
    );
  }
}

YourWords.propTypes = {
  wordsPerPlayer: PropTypes.number.isRequired,
  words: PropTypes.array.isRequired,
  onWordChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
  error: PropTypes.string,
  style: PropTypes.object,
  placeholderTextColor: PropTypes.string,
  footerHeight: PropTypes.number
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
    color: 'red',
  },
  submitButton: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#4b42f5',
  },
  submitButtonText: {
    color: '#4b42f5',
  },
});

export default YourWords;