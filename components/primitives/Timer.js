import React, {Component} from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import PropTypes from 'prop-types';

Timer.propTypes = {
  time: PropTypes.number.isRequired,
  totalTime: PropTypes.number.isRequired,
  color: PropTypes.string,
  textColor: PropTypes.string
}

export default function Timer(props) {
  let circleStyle = {}
  let textStyle = {}
  if (props.color) circleStyle.backgroundColor = props.color
  if (props.textColor) textStyle.color = props.textColor

  return (
    <View style={[styles.outerCircle, circleStyle]}>
      <Text style={[styles.text, textStyle]}>
        {Math.ceil(props.time)}
      </Text>
    </View>
  )
};

const styles = StyleSheet.create({
  outerCircle: {
    height: Dimensions.get('screen').width/5,
    width: Dimensions.get('screen').width/5,
    borderRadius: Dimensions.get('screen').height,
    backgroundColor: '#fff',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  text: {
    color: '#4b42f5',
    fontFamily: 'poppins-semibold',
    fontSize: Dimensions.get('screen').height/20,
    textAlign: 'center',
    marginTop: 5,
  }
})
