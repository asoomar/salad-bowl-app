import React, {Component} from 'react';
import { StyleSheet, Dimensions, TextInput } from 'react-native';
import PropTypes from 'prop-types';

PrimaryTextInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChangeText: PropTypes.func.isRequired,
  autoCorrect: PropTypes.bool.isRequired,
  autoCapitalize: PropTypes.string,
  placeholder: PropTypes.string,
  marginBottom: PropTypes.number
}

export default function PrimaryTextInput(props) {
  let viewStyling = {}
  if (props.marginBottom) viewStyling.marginBottom = props.marginBottom

  return(
    <TextInput
      style={[styles.input, viewStyling]} 
      autoCompleteType={"off"}
      autoCorrect={props.autoCorrect}
      autoCapitalize={props.autoCapitalize}
      onChangeText={text=>props.onChangeText(text)}
      placeholder={props.placeholder}
      placeholderTextColor={`#342bcf`}
      value={props.value}
    />
  )
};

const styles = StyleSheet.create({
  input: {
    paddingLeft: Dimensions.get('screen').width/15,
    paddingRight: Dimensions.get('screen').width/15,
    minWidth: '85%',
    maxWidth: '85%',
    color: "#ffffff",
    backgroundColor: '#3c34d9',
    borderRadius: Dimensions.get('screen').height,
    height: Dimensions.get('screen').height/12,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: Dimensions.get('screen').height/25,
    fontFamily: 'poppins-semibold',
    color: "#ffffff",
    textAlign: 'center'
  }
});