import React, {Component} from 'react';
import { StyleSheet, Text, View, Button, Dimensions } from 'react-native';
import PrimaryButton from '../primitives/PrimaryButton';
import Events from '../../constants/Events';
import Fire from '../../Fire';
import PropTypes from 'prop-types';

const ROUND_STRINGS = {
  one: "In this round, you will need to explain the word to your team without using the word itself or using any gestures.",
  two: "In this round, you can only act out the word to your team. You're not allowed to say anything this round.",
  three: "In this round, you can only say one word to your team. You cannot use the word itself or any gestures."
}

class UserPlaying extends Component {
  getRoundText(round) {
    switch (round) {
      case 1:
        return ROUND_STRINGS.one
      case 2:
        return ROUND_STRINGS.two
      case 3: 
        return ROUND_STRINGS.three
      default:
        return ""      
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.instructions}>
            {this.getRoundText(this.props.round)}
          </Text>
        </View>
        <View style={styles.wordCard}>
            {this.props.timerStarted 
            ? <Text style={styles.word}>
                {this.props.currentWord}
              </Text>
            : <Text style={styles.callToAction}>
                Press Start once you are ready to begin the round!
              </Text>
            }
        </View>
        <View style={styles.footer}>
          {this.props.timerStarted
          ? <View style={styles.actionButtons}>
              <PrimaryButton 
                text="Pass" 
                onPress={()=>this.props.pass()}
                buttonStyle={styles.passButton}
                textStyle={styles.passButtonText}
              />
              <PrimaryButton 
                text="Next" 
                onPress={()=>this.props.nextWord()}
                buttonStyle={styles.correctButton}
                textStyle={styles.correctButtonText}
              />
            </View> 
          : <PrimaryButton 
              text="Start" 
              onPress={()=>{
                this.props.setTimer(true, Date.now())
                Fire.db.logEvent(Events.START_ROUND, {
                  screen: 'game',
                  purpose: 'User started round',
                })
              }}
              buttonStyle={styles.startButton}
              textStyle={styles.startButtonText}
            />
          }
        </View>
      </View>
    );
  }
}

UserPlaying.propTypes = {
  currentWord: PropTypes.string.isRequired,
  timerStarted: PropTypes.bool.isRequired,
  nextWord: PropTypes.func.isRequired,
  pass: PropTypes.func.isRequired,
  setTimer: PropTypes.func.isRequired,
  round: PropTypes.number.isRequired
}
  
const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  header: {
    flex: 1.5,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  startButton: {
    minWidth: '50%',
    maxWidth: '50%',
    backgroundColor: '#4b42f5'
  },
  startButtonText: {
    color: '#fff'
  },
  instructions: {
    paddingTop: 10,
    paddingLeft: 10,
    paddingRight: 10,
    fontSize: Dimensions.get('screen').height/50,
    fontFamily: 'poppins-italic',
    color: '#888888',
    textAlign: 'center',
  },
  footer: {
    flex: 2,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordCard: {
    flex: 3,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '85%',
    maxWidth: '85%',
  },
  word: {
    fontSize: Dimensions.get('screen').height/20,
    fontFamily: 'poppins-semibold',
    color: '#4b42f5',
    textAlign: 'center'
  },
  callToAction: {
    fontSize: Dimensions.get('screen').height/35,
    fontFamily: 'poppins-semibold',
    color: '#000',
    textAlign: 'center'
  },
  actionButtons: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  passButton: {
    minWidth: '40%',
    maxWidth: '40%',
    borderWidth: 2,
    borderColor: '#4b42f5',
  },
  passButtonText: {
    color: '#4b42f5'
  },
  correctButton: {
    minWidth: '40%',
    maxWidth: '40%',
    backgroundColor: '#4b42f5'
  },
  correctButtonText: {
    color: '#fff'
  },
});

export default UserPlaying;