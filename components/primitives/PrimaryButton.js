import React, {Component} from 'react';
import { StyleSheet, TouchableOpacity, Text, Dimensions } from 'react-native';
import PropTypes from 'prop-types';

PrimaryButton.PropTypes = {
  text: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
  color: PropTypes.string, // Blue by default
  hasOutline: PropTypes.bool, // No outline by default
  outlineColor: PropTypes.string, //White by default
  textColor: PropTypes.string // White by default
}

export default function PrimaryButton(props) {
  let viewStyling = {}
  let textStyling = {}
  if (props.color) viewStyling.backgroundColor = props.color
  if (props.textColor) textStyling.color = props.textColor
  if (props.hasOutline) viewStyling.borderWidth = 1
  if (props.borderColor) viewStyling.borderColor = props.outlineColor

  return(
    <TouchableOpacity 
      style={[styles.button, viewStyling]} 
      onPress={() => props.onPress()}
    >
      <Text style={[styles.text, textStyling]}>{props.text}</Text>
    </TouchableOpacity>
  )
};

const styles = StyleSheet.create({
  button: {
    paddingLeft: Dimensions.get('screen').width/15,
    paddingRight: Dimensions.get('screen').width/15,
    color: "#FFFFFF",
    backgroundColor: "#107EEB",
    borderRadius: Dimensions.get('screen').height,
    margin: 10,
    height: Dimensions.get('screen').height/15,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: "#FFFFFF",
    fontFamily: 'poppins-semibold',
    fontSize: Dimensions.get('screen').height/45,
  }
});