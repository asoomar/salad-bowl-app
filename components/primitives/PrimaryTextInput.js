import React, {Component} from 'react';
import { StyleSheet, Dimensions, TextInput } from 'react-native';
import PropTypes from 'prop-types';

PrimaryTextInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChangeText: PropTypes.func.isRequired,
  autoCorrect: PropTypes.bool.isRequired,
  autoCapitalize: PropTypes.string,
  placeholder: PropTypes.string,
  marginBottom: PropTypes.number,
  marginTop: PropTypes.number,
  style: PropTypes.object,
  placeholderTextColor: PropTypes.string,
  keyboardType: PropTypes.string,
  onFocus: PropTypes.func,
  returnKeyType: PropTypes.string,
  onSubmitEditing: PropTypes.func,
  focus: PropTypes.bool,
}

export default function PrimaryTextInput(props) {
  let viewStyling = {}
  if (props.marginBottom) viewStyling.marginBottom = props.marginBottom
  if (props.marginTop) viewStyling.marginTop = props.marginTop

  return(
    <TextInput
      style={[styles.input, viewStyling, props.style]} 
      autoCompleteType={"off"}
      autoCorrect={props.autoCorrect}
      autoCapitalize={props.autoCapitalize}
      focus={props.focus ? props.focus : undefined}
      onChangeText={text=>props.onChangeText(text)}
      onFocus={props.onFocus ? () => props.onFocus() : () => {}}
      onSubmitEditing={props.onSubmitEditing ? () => props.onSubmitEditing() : () => {}}
      placeholder={props.placeholder}
      placeholderTextColor={props.placeholderTextColor || `#342bcf`}
      keyboardType={props.keyboardType}
      returnKeyType={props.returnKeyType ? props.returnKeyType : 'default'}
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
    fontSize: Dimensions.get('screen').height/30,
    fontFamily: 'poppins-semibold',
    textAlign: 'center'
  }
});