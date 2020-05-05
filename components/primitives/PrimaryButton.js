import React, {Component} from 'react';
import { StyleSheet, TouchableOpacity, Text, Dimensions } from 'react-native';
import PropTypes from 'prop-types';

PrimaryButton.propTypes = {
  text: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
  color: PropTypes.string, // White by default
  hasOutline: PropTypes.bool, // No outline by default
  outlineColor: PropTypes.string, //White by default
  textColor: PropTypes.string, // White by default
  width: PropTypes.string, //85% by default
  buttonStyle: PropTypes.object,
  textStyle: PropTypes.object,
}

export default function PrimaryButton(props) {
  let viewStyling = {}
  let textStyling = {}
  if (props.color) viewStyling.backgroundColor = props.color
  if (props.textColor) textStyling.color = props.textColor
  if (props.hasOutline) {
    viewStyling.borderWidth = 1
    viewStyling.borderColor = `#ffffff`
  }
  if (props.borderColor) viewStyling.borderColor = props.outlineColor
  if (props.width) {
    viewStyling.minWidth = props.width
    viewStyling.maxWidth = props.width
  } 

  return(
    <TouchableOpacity 
      style={[styles.button, viewStyling, props.buttonStyle]} 
      onPress={() => props.onPress()}
    >
      <Text style={[styles.text, textStyling, props.textStyle]}>{props.text}</Text>
    </TouchableOpacity>
  )
};

const styles = StyleSheet.create({
  button: {
    minWidth: '85%',
    maxWidth: '85%',
    backgroundColor: '#ffffff',
    borderRadius: Dimensions.get('screen').height,
    margin: 10,
    height: Dimensions.get('screen').height/13,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#4b42f5',
    fontFamily: 'poppins-semibold',
    fontSize: Dimensions.get('screen').height/35,
  }
});