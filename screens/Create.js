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
import { gameIDLength } from '../constants/Structures';
import Events from '../constants/Events';
import Fire from '../Fire';

class Create extends Component {
  state = {
    name: '',
    wordCount: '',
    error: ''
  }

  componentDidMount() {
    this.db = Fire.db;
  }

  //Returns true if the game id is invalid (already exists)
  async isNotValidGameID(id) {
    if (id === '') {
      return true;
    }
    try {
      let snapshot = await this.db.getRef(`games`).orderByKey().equalTo(id).once('value');
      if (snapshot.val() == null) { // We want to make sure the game doesn't exist yet
        console.log(`Game ID (${id}) is valid`)
        return false;
      } else {
        console.log(`Game id (${id}) is not valid`); 
        return true;
      }
    } catch {
      console.log(`Failed to check if game id ${id} is valid`);
      return true;
    }
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

  updateWordCount(updateWordCount) {
    this.setState({wordCount: updateWordCount});
  }

  async pressSubmit() {
    Keyboard.dismiss();
    if (this.state.name.trim() < 1) {
      this.setState({error: `You must enter a name`});
      return
    } else if (isNaN(Number(this.state.wordCount))) {
      this.setState({error: `Words per person must be a number`});
      return
    } else if (Number(this.state.wordCount) < 1) {
      this.setState({error: `Words per person must be at least 1`});
      return
    } else if (Number(this.state.wordCount) > 10) {
      this.setState({error: `Words per person can't be more than 10`});
      return
    }

    let newGameID = this.makeGameID(gameIDLength);
    while (await this.isNotValidGameID(newGameID)) {
      newGameID = this.makeGameID(gameIDLength);
    }
    this.db.logEvent(Events.CREATE_GAME, {
      screen: 'create',
      purpose: 'Create new game'
    })
    let gameRef = this.db.getRef('games');
    gameRef.child(newGameID).set({ 
      'timestamp': Date.now(),
      'round': '',
      'wordsPerPerson': Number(this.state.wordCount),
      'status': Screens.LOBBY,
      'currentPlayer': '',
      'turnStartTimestamp': '',
      'score': {'team1': 0, 'team2': 0},
      'turnTime': 60000
    })
    .then(() => {
      console.log(`Game created. ID: ${newGameID}`);
      // Add host to game
      this.db.getRef(`players/${newGameID}`).push(this.state.name.trim())
      .then((value) => {
        this.props.setPlayerID(value.key)
        // Add player to 'waiting' state to indicate (to others) they haven't submitted words
        this.db.getRef(`games/${newGameID}/waiting/${value.key}`).set(this.state.name.trim());
        this.db.getRef(`games/${newGameID}/host`).set({[value.key]: this.state.name.trim()});
        this.props.updateName(this.state.name.trim());
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
          <View style={styles.errorBox}>
            <Text style={styles.error}>{this.state.error}</Text>
          </View>
          <PrimaryTextInput 
            autoCorrect={false}
            marginBottom={10}
            onChangeText={text=>this.updateName(text)}
            placeholder={'Your Name'}
            value={this.state.name}
          />
          <PrimaryTextInput 
            autoCorrect={false}
            keyboardType={'number-pad'}
            onChangeText={text=>this.updateWordCount(text)}
            placeholder={'Words Per Person'}
            value={this.state.wordCount}
          />
          <PrimaryButton
            text={'Create'}
            onPress={()=>this.pressSubmit()}
          />
        </View>
        <View style={styles.backButtonView}>
          <BackButton 
            onPress={()=> {
              this.db.logEvent(Events.BACK_BUTTON, {
                screen: 'create',
                purpose: 'User on create page clicked to go back to lobby'
              })
              this.props.changeScreen(Screens.HOME)
            }}
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
  },
  errorBox: {
    minHeight: Dimensions.get('screen').height/25,
    maxHeight: Dimensions.get('screen').height/25,
  },
  error: {
    fontSize: Dimensions.get('screen').height/40,
    fontFamily: 'poppins-semibold',
    color: '#fff',
  }
});

export default Create;