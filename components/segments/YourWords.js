import React, {Component} from 'react';
import ReactNative, { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  Dimensions, 
  Keyboard
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import PrimaryTextInput from '../primitives/PrimaryTextInput';
import PrimaryButton from '../primitives/PrimaryButton';
import NumberRanks from '../../constants/NumberRanks';
import PropTypes from 'prop-types';

class YourWords extends Component {
  state = {
    currentFocus: null
  }

  onInputFocus(i) {
    if (this.state.currentFocus === null) {
      this.setState({ currentFocus: i })
    } else if (this.state.currentFocus !== i) {
      Keyboard.dismiss()
      this.setState({ currentFocus: null })
    }
  }

  // onSubmitInput(i) {
  //   if (i < this.props.wordsPerPlayer - 1) {
  //     this.setState({ currentFocus: i + 1 })
  //   }
  // }

  render() {
    return (
      <KeyboardAwareScrollView 
        // keyboardOpeningTime={0}
        enableResetScrollToCoords={true}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.mainView}>
          {this.props.words.map((wordObject,i) => {
            if (i < this.props.wordsPerPlayer) {
              return (
                <PrimaryTextInput 
                  key={NumberRanks[i]}
                  autoCorrect={true}
                  marginTop={10}
                  onFocus={()=>this.onInputFocus(i)}
                  onChangeText={text => this.props.onWordChange(text, i)}
                  onSubmitEditing={() => this.setState({ currentFocus: null })}
                  placeholder={`${NumberRanks[i]} Word`}
                  placeholderTextColor={this.props.placeholderTextColor}
                  // returnKeyType={i < this.props.wordsPerPlayer - 1 ? 'next' : 'default'}
                  returnKeyType='default'
                  style={this.props.style}
                  value={wordObject.word}
                />
              )}
          })}
          <View style={styles.errorBox}>
            <Text style={styles.error}>{this.props.error}</Text>
          </View> 
          <PrimaryButton
            text={'Submit Words'}
            onPress={() => this.props.onSubmit()}
            buttonStyle={styles.submitButton}
            textStyle={styles.submitButtonText}
            disabled={this.props.disabled}
          />
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