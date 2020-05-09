import React, {Component} from 'react';
import { StyleSheet, Text, View, Button, Dimensions } from 'react-native';
import SegmentSelector from '../primitives/SegmentSelector';
import GameTab from '../segments/GameTab';
import PlayersTab from '../segments/PlayersTab';
import PropTypes from 'prop-types';

class OpponentPlaying extends Component {
  state = {
    currentSegment: 'Game'
  }

  render() {
    return (
      <View style={styles.container}>
        <SegmentSelector 
          segments={['Game', 'Players']}
          currentSegment={this.state.currentSegment}
          onChangeSegment={segment => this.setState({currentSegment: segment})}
        />
        <View style={styles.segmentView}>
          {this.state.currentSegment === 'Game' ? <GameTab /> : null}
          {this.state.currentSegment === 'Players' ? <PlayersTab /> : null}
        </View>
      </View>
    );
  }
}

OpponentPlaying.propTypes = {

}
  
const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4b42f5',
    minWidth: '100%',
    maxWidth: '100%',
  },
  segmentView: {
    flex: 1
  }
});

export default OpponentPlaying;