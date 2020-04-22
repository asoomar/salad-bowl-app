import React, {Component} from 'react';
import { StyleSheet, Text, View, Button, TextInput, Keyboard } from 'react-native';
import rand from 'random-seed';
import Screens from '../constants/Screens';
import Fire from '../Fire';

class Create extends Component {
  state = {
    name: '',
    error: ''
  }

  componentDidMount() {
    this.db = Fire.db;
  }

  //Returns true if the game id is invalid (already exists)
  isNotValidGameID(id) {
    if (id === '') {
      return true;
    }
    this.db.getRef(`games`).orderByKey().equalTo(id).once('value')
    .then((snapshot) => {
      if (snapshot.val() == null) { // We want to make sure the game doesn't exist yet
        console.log(`Game ID (${id}) does not exist yet`)
        return false;
      } else {
        console.log(`Game id (${id}) already exists`); 
        return true;
      }
    })
    .catch(error => {
      console.log(`Failed to check if game id ${id} is valid`);
      return true;
    })
  }

  makeGameID(length) {
    let id = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let seededRandom = rand.create(Date.now());
    for (let i = 0; i < length; i++) {
      id += characters.charAt(Math.floor(seededRandom(characters.length)));
    }
    return id;
  }

  updateName(updatedName) {
    this.setState({name: updatedName});
  }

  pressSubmit() {
    Keyboard.dismiss();
    let newGameID = this.makeGameID(5);
    if (this.isNotValidGameID(newGameID)) {
      this.setState({error: `Oops, something went wrong on our end. Try creating a game again!`});
      return;
    }
    let gameRef = this.db.getRef('games');
    gameRef.child(newGameID).set({ 
      'timestamp': Date.now(),
      'round': '',
      'currentPlayer': '',
      'turnStartTimestamp': ''})
    .then(() => {
      console.log(`Game created. ID: ${newGameID}`);
      this.props.updateName(this.state.name);
      this.props.updateGameID(newGameID);
      this.props.changeScreen(Screens.LOBBY);
    })
    .catch((error) => console.log('Game creation failed: ' + error.message));
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>Create Game Screen</Text>
        <Text>{this.state.error}</Text>
        <TextInput 
        style={styles.textInput}
        autoCompleteType={"off"}
        autoCorrect={false}
        onChangeText={text=>this.updateName(text)}
        placeholder={"Enter Name"}
        value={this.state.name}
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

export default Create;