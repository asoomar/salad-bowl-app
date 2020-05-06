import React, {Component} from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import PropTypes from 'prop-types';

Timer.propTypes = {
  time: PropTypes.number.isRequired,
  totalTime: PropTypes.number.isRequired,
  width: PropTypes.number // Default is 85
}

export default function Timer(props) {
  const width = props.width || 85;
  const innerWidth = getInnerWidth(props.time, props.totalTime, width);
  const outerBoxStyle = {minWidth: `${width}%`, maxWidth: `${width}%`}
  const innerBoxStyle = {minWidth: `${innerWidth}%`, maxWidth: `${innerWidth}%`}
  return (
    <View style={[styles.outerBox, outerBoxStyle]}>
      <View style={[styles.innerBox, innerBoxStyle]}>
      </View>
    </View>
  )
};

function getInnerWidth(time, totalTime, width) {
  let ratio = time/totalTime
  return ratio * 100
}

const styles = StyleSheet.create({
  outerBox: {
    height: Dimensions.get('screen').height/20,
    borderRadius: Dimensions.get('screen').height,
    borderWidth: 3,
    borderColor: '#4b42f5',
    // backgroundColor: '#fff'
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },
  innerBox: {
    backgroundColor: '#4b42f5',
    borderWidth: 2,
    borderColor: '#4b42f5',
    borderRadius: Dimensions.get('screen').height,
  }
})
