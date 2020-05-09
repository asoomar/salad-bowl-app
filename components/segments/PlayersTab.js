import React, {Component} from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import PropTypes from 'prop-types';

class PlayersTab extends Component {

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Player info is coming soon!</Text>
      </View>
    );
  }
}

PlayersTab.propTypes = {

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
    color: '#4b42f5',
    textAlign: 'center'
  }
});

export default PlayersTab;