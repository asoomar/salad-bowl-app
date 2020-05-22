import React, {Component} from 'react';
import { StyleSheet, Text, View, Dimensions, ScrollView } from 'react-native';
import PrimaryButton from '../primitives/PrimaryButton';
import PropTypes from 'prop-types';

class MoreTab extends Component {

  render() {
    return (
      <View style={styles.container}>
        <PrimaryButton 
          text='How to Play'
          onPress={()=>this.props.onClickInstructions()}
          buttonStyle={styles.instructionsButton}
          textStyle={styles.instructionsButtonText}
        />
        {/* <PrimaryButton 
          text='Leave Game'
          onPress={()=>this.props.onClickLeaveGame()}
          buttonStyle={styles.leaveButton}
          textStyle={styles.leaveButtonText}
          disabled={this.state.disableLeaveGame}
        /> */}
      </View>
    );
  }
}

MoreTab.propTypes = {
  onClickInstructions: PropTypes.func.isRequired,
  // onClickLeaveGame: PropTypes.func.isRequired
}
  
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    minWidth: '100%',
    maxWidth: '100%',
    paddingLeft: 15,
    paddingRight: 15,
    display: 'flex',
    alignItems: 'center',
  },
  instructionsButton: {
    backgroundColor: '#ffffff',
    minWidth: '85%',
    maxWidth: '85%',
    height: Dimensions.get('screen').height/15,
  },
  instructionsButtonText: {
    color: '#4b42f5',
  }
});

export default MoreTab;