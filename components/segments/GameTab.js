import React, {Component} from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import PropTypes from 'prop-types';

class GameTab extends Component {

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>
          <Text style={styles.colored}>{` ${this.props.currentPlayer} `}</Text>
          {` from `} 
          <Text style={styles.colored}>{` ${this.props.currentTeam} `}</Text>
          {` is playing!`} 
        </Text>
      </View>
    );
  }
}

GameTab.propTypes = {
  currentPlayer: PropTypes.string,
  currentTeam: PropTypes.string
}
  
const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    minWidth: '100%',
    maxWidth: '100%',
    padding: 15,
  },
  text: {
    fontSize: Dimensions.get('screen').height/30,
    fontFamily: 'poppins-semibold',
    color: '#000',
    textAlign: 'center'
  },
  colored: {
    color: '#4b42f5'
  }
});

export default GameTab;