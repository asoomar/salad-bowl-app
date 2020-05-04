import React, {Component} from 'react';
import { 
  StyleSheet, 
  Text, 
  View,  
  Dimensions, 
  Keyboard} from 'react-native';
import PrimaryTextInput from '../components/primitives/PrimaryTextInput';
import PrimaryButton from '../components/primitives/PrimaryButton';
import BackButton from '../components/primitives/BackButton';
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
      'status': Screens.LOBBY,
      'currentPlayer': '',
      'turnStartTimestamp': '',
      'score': {'team1': 0, 'team2': 0},
      'turnTime': 60000
    })
    .then(() => {
      console.log(`Game created. ID: ${newGameID}`);
      // Add host to game
      this.db.getRef(`players/${newGameID}`).push(this.state.name)
      .then((value) => {
        this.props.setPlayerID(value.key)
        // Add player to 'waiting' state to indicate (to others) they haven't submitted words
        this.db.getRef(`games/${newGameID}/waiting/${value.key}`).set(this.state.name);
        this.db.getRef(`games/${newGameID}/host`).set({[value.key]: this.state.name});
        this.props.updateName(this.state.name);
        this.props.updateGameID(newGameID);
        this.props.changeScreen(Screens.LOBBY);
      });
    })
    .catch((error) => console.log('Game creation failed: ' + error.message));
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.mainView}>
          <Text style={styles.title}>Create Game</Text>
          <Text>{this.state.error}</Text>
          <PrimaryTextInput 
            autoCorrect={false}
            onChangeText={text=>this.updateName(text)}
            placeholder={'Your Name'}
            value={this.state.name}
          />
          <PrimaryButton
            text={'Create'}
            onPress={()=>this.pressSubmit()}
          />
        </View>
        <View style={styles.backButtonView}>
          <BackButton 
            onPress={()=>this.props.changeScreen(Screens.HOME)}
            margin={Dimensions.get('screen').width/15}
          />
        </View>
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
  mainView: {
    flex: 3,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  title: {
    fontSize: Dimensions.get('screen').height/20,
    fontFamily: 'poppins-semibold',
    color: '#fff',
    marginBottom: 10,
  },
  backButtonView: {
    flex: 2,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
  }
});

export default Create;