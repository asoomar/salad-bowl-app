import React, {Component} from 'react';
import { StyleSheet, Text, View, Button, Dimensions } from 'react-native';

class UserPlaying extends Component {
  state = {
  
  }

  componentDidMount() {
    
  }

  componentWillUnmount() {

  }


  render() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text>You are playing now!</Text>
        </View>
        <View style={styles.wordCard}>
            <Text style={styles.word}>{this.props.currentWord}</Text>
        </View>
        <View style={styles.footer}>
          {this.props.timerStarted ? 
          <>
            <Button title="Pass" onPress={()=>this.props.pass()}/>
            <Button title="Next Word" onPress={()=>this.props.nextWord()}/> 
          </> :
          <Button title="Start" onPress={()=>this.props.setTimer(true, Date.now())}/>
          }
        </View>
      </View>
    );
  }
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
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  footer: {
    flex: 2,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  wordCard: {
    flex: 3,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '85%',
    maxWidth: '85%',
    // borderColor: '#4b42f5',
    // borderWidth: 10,
    // borderRadius: 15
  },
  word: {
    fontSize: Dimensions.get('screen').height/20,
    fontFamily: 'poppins-semibold',
    color: '#4b42f5',
    textAlign: 'center'
  }
});

export default UserPlaying;