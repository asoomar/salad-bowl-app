import React, {Component} from 'react';
import { StyleSheet, Text, View, Button, TextInput, Dimensions } from 'react-native';
import PrimaryTextInput from '../components/primitives/PrimaryTextInput';
import PrimaryButton from '../components/primitives/PrimaryButton';
import BackButton from '../components/primitives/BackButton';''
import Screens from '../constants/Screens';
import Fire from '../Fire';

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
    try {
      let snapshot = await this.db.getRef(`games`).orderByKey().equalTo(gameID).once('value');
      if (snapshot.val() == null) { 
        // Check if the game exists
        console.log(`Game ${gameID} does not exist`);
        this.setState({error: `Oops, it looks like that game doesn't exist`});
        return false;
      } else if (snapshot.val()[gameID].round !== '' 
        || snapshot.val()[gameID].status !== Screens.LOBBY) { 
        // Check to make sure game hasn't started yet
        console.log(`Game ${snapshot.val()[gameID].round} has already started`);
        this.setState({error: `Uh oh, it looks like that game has already started`});
        return false;
      }
      return true;
    } catch {
      console.log(`Could not check if game ${gameID} exists`);
      return false;
    }
  }

  async pressSubmit() {
    let gameID = this.state.joinCode.toUpperCase();
    if (await this.canUserJoinGame(gameID)) {
      this.props.updateName(this.state.name);
      this.props.updateGameID(gameID);
      this.props.changeScreen(Screens.LOBBY);
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.mainView}>
          <Text style={styles.title}>Join Game</Text>
          {/* THIS ERROR HAS TO HAVE PROPER UI */}
          <Text>{this.state.error}</Text> 
          <PrimaryTextInput 
            autoCorrect={false}
            marginBottom={10}
            onChangeText={text=>this.setState({name: text})}
            placeholder={'Your Name'}
            value={this.state.name}
          />
          <PrimaryTextInput 
            autoCapitalize={"characters"}
            autoCorrect={false}
            onChangeText={text=>this.setState({joinCode: text})}
            placeholder={"Game ID"}
            value={this.state.joinCode}
          />
          <PrimaryButton
            text={'Join'}
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
  title: {
    fontSize: Dimensions.get('screen').height/20,
    fontFamily: 'poppins-semibold',
    color: '#fff',
    marginBottom: 10,
  },
  mainView: {
    flex: 2,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  backButtonView: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
  }
});

export default Join;