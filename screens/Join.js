import React, {Component} from 'react';
import { StyleSheet, Text, View, Button, TextInput } from 'react-native';
import Screens from '../constants/Screens';
import Fire from '../Fire';
import Lobby from './Lobby';

class Join extends Component {
  state = {
    name: '',
    joinCode: '',
    error: ''
  }

  componentDidMount() {
    this.db = Fire.db;
  }

  async canUserJoinGame(gameID) {
    console.log('Checking if game is valid...');
    this.db.getRef(`games`).orderByKey().equalTo(gameID).once('value')
    .then((snapshot) => {
      if (snapshot.val() == null) { // Check if the game exists
        console.log(`Game ${gameID} does not exist`);
        this.setState({error: `Oops, it looks like that game doesn't exist`});
        return false;
      } else if (snapshot.val()[gameID].round !== '') { // Check to make sure game hasn't started yet
        console.log(`Game ${snapshot.val()[gameID].round} has already started`);
        this.setState({error: `Uh oh, it looks like that game has already started`});
        return false;
      }
      return true;
    })
    .catch(error => {
      this.setState({error: `Oh no, something unexpected happened`});
      console.log("Failed to check if user can join game: " + error);
      return false;
    }) 
  }

  pressSubmit() {
    let gameID = this.state.joinCode.toUpperCase();
    if (this.canUserJoinGame(gameID)) {
      console.log('Looks like the user can join');
      this.props.updateName(this.state.name);
      this.props.updateGameID(gameID);
      this.props.changeScreen(Screens.LOBBY);
    }
    console.log('Check complete and user couldnt join game'); 
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>Join Game Screen</Text> 
        <Text>{this.state.error}</Text>
        <TextInput 
          style={styles.textInput}
          autoCompleteType={"off"}
          autoCorrect={false}
          onChangeText={text=>this.setState({name: text})}
          placeholder={"Enter Name"}
          value={this.state.name}
        />
        <TextInput 
          style={styles.textInput}
          autoCapitalize={"characters"}
          autoCompleteType={"off"}
          autoCorrect={false}
          onChangeText={text=>this.setState({joinCode: text})}
          placeholder={"Enter Game ID"}
          value={this.state.joinCode}
        />
        <Button title="Submit" onPress={()=>this.pressSubmit()}/> 
        <Button title="Back" onPress={()=>this.props.changeScreen(Screens.HOME)}/> 
      </View>
    );
  }
}
  
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    borderColor: 'gray',
    borderRadius: 10,
    borderWidth: 1,
    height: 40,
    margin: 5,
    padding: 4,
    width: 200
  }
});

export default Join;