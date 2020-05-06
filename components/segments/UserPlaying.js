import React, {Component} from 'react';
import { StyleSheet, Text, View, Button, TextInput } from 'react-native';

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
        <Text>You are playing now!</Text>
        <Text style={styles.heading}>{this.props.currentWord}</Text>
        {this.props.timerStarted ? 
        <>
          <Button title="Pass" onPress={()=>this.props.pass()}/>
          <Button title="Next Word" onPress={()=>this.props.nextWord()}/> 
        </> :
        <Button title="Start" onPress={()=>this.props.setTimer(true, Date.now())}/>
        }
      </View>
    );
  }
}
  
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    fontWeight: 'bold'
  },
});

export default UserPlaying;