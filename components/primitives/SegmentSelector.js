import React, {Component} from 'react';
import { StyleSheet, Dimensions, TouchableOpacity, Text, View } from 'react-native';
import PropTypes from 'prop-types';

SegmentSelector.propTypes = {
  segmentOne: PropTypes.string.isRequired,
  segmentTwo: PropTypes.string.isRequired,
  currentSegment: PropTypes.string.isRequired,
  onChangeSegment: PropTypes.func.isRequired,
}

export default function SegmentSelector(props) {
  const segmentOneStyle = props.segmentOne === props.currentSegment 
    ? styles.active
    : styles.disabled

  const segmentTwoStyle = props.segmentTwo === props.currentSegment 
  ? styles.active
  : styles.disabled
  
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => props.onChangeSegment(props.segmentOne)}>
        <Text style={segmentOneStyle}>{props.segmentOne}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => props.onChangeSegment(props.segmentTwo)}>
        <Text style={segmentTwoStyle}>{props.segmentTwo}</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
  },
  button: {
    marginLeft: 12,
    marginRight: 12,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabled: {
    color: '#ffffff55',
    fontFamily: 'poppins-semibold',
    fontSize: Dimensions.get('screen').height/40,
  },
  active: {
    color: '#ffffff',
    fontFamily: 'poppins-semibold',
    fontSize: Dimensions.get('screen').height/40,
  }

});