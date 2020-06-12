import React, {Component} from 'react';
import { 
  StyleSheet, 
  Text, 
  View,  
  Dimensions, 
  Keyboard,
  TouchableOpacity,
  TouchableWithoutFeedback} from 'react-native';
import PrimaryTextInput from '../components/primitives/PrimaryTextInput';
import PrimaryButton from '../components/primitives/PrimaryButton';
import BackButton from '../components/primitives/BackButton';
import PrimaryModal from '../components/primitives/PrimaryModal';
import LoadingPage from '../components/primitives/LoadingPage';
import rand from 'random-seed';
import Screens from '../constants/Screens';
import { gameIDLength, gameExpirationLength } from '../constants/Structures';
import { modalStart } from '../constants/ModalContent';
import Events from '../constants/Events';
import Fire from '../Fire';
import { validateGame } from '../global/GlobalFunctions';
import { AdMobRewarded, AdMobInterstitial } from 'expo-ads-admob';
import Ads from '../constants/Ads';

class Create extends Component {
  state = {
    name: '',
    wordCount: '',
    error: '',
    disableButton: false,
    isModalVisible: false,
    isLoading: false,
  }

  componentDidMount() {
    this.db = Fire.db;
  }

  componentWillUnmount() {
    this.setState({ disableButton: false, isLoading: false })
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

  async cleanDatabase() {
    try {
      let gameExpiredTimestamp = Date.now() - gameExpirationLength;
      let gameRef = this.db.getRef('games');
      let oldGames = await gameRef.orderByChild("timestamp").endAt(gameExpiredTimestamp).once("value");
      console.log(`Games older than this will be deleted: ${(new Date(gameExpiredTimestamp).toString())}`);
      if (oldGames.val() !== null) {
        const IDs = Object.keys(oldGames.val());
        let validGameIDs = [];
        IDs.forEach((ID) => {
          if (validateGame(oldGames.val()[ID])) {
            validGameIDs.push(ID);
            console.log(`${ID}: ${(new Date(oldGames.val()[ID].timestamp)).toString()}`);
          }
        })
        validGameIDs.forEach(validID => {
          this.db.getRef(`games/${validID}`).remove();
          this.db.getRef(`players/${validID}`).remove();
          this.db.getRef(`words/${validID}`).remove();
        })
      }
    }
    catch(err) {
      console.log("Unable to properly clean database")
      console.log(err)
      return
    }
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
    this.setState({ disableButton: true, isLoading: true });

    let newGameID = this.makeGameID(gameIDLength);
    while (await this.isNotValidGameID(newGameID)) {
      newGameID = this.makeGameID(gameIDLength);
    }
    this.db.logEvent(Events.CREATE_GAME, {
      screen: 'create',
      purpose: 'Create new game'
    })
    try {
      let gameRef = this.db.getRef('games');
      await gameRef.child(newGameID).set({ 
        'timestamp': Date.now(),
        'round': '',
        'wordsPerPerson': Number(this.state.wordCount),
        'status': Screens.LOBBY,
        'currentPlayer': '',
        'turnStartTimestamp': '',
        'score': {'team1': 0, 'team2': 0},
        'turnTime': 60000
      })
      console.log(`Game created. ID: ${newGameID}`);
      // Add host to game
      let ref = await this.db.getRef(`players/${newGameID}`).push(this.state.name.trim())
      this.props.setPlayerID(ref.key)
      // Add player to 'waiting' state to indicate (to others) they haven't submitted words
      this.db.getRef(`games/${newGameID}/waiting/${ref.key}`).set(this.state.name.trim());
      this.db.getRef(`games/${newGameID}/host`).set({[ref.key]: this.state.name.trim()});
      this.props.updateName(this.state.name.trim());
      this.props.updateGameID(newGameID);
      await this.cleanDatabase();
      if (Ads.showAds) {
        // await AdMobRewarded.setAdUnitID(Ads.CreateGame.id.ios);
        // await AdMobRewarded.requestAdAsync();
        // await AdMobRewarded.showAdAsync();
        await AdMobInterstitial.setAdUnitID(Ads.CreateGameAlt.id.ios);
        await AdMobInterstitial.requestAdAsync();
        await AdMobInterstitial.showAdAsync().then(() => {
          setTimeout(() => {this.props.changeScreen(Screens.LOBBY)}, 500)
        });
      } else {
        this.props.changeScreen(Screens.LOBBY);
      }
    } 
    catch (error) {
      this.setState({ disableButton: false, isLoading: false });
      console.log('Game creation failed: ' + error.message);
    }
  }

  render() {
    return (
      <LoadingPage 
        loadingText={"Creating Game..."}
        isLoading={this.state.isLoading}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.container}>
            <PrimaryModal 
              title='Creating A Game'
              modalVisible={this.state.isModalVisible}
              buttonText='Got It!'
              onCloseModal={() => this.setState({isModalVisible: false})}
              minHeight={Dimensions.get('screen').height/5}
              content={
                <Text style={styles.modalContent}>
                  {modalStart.CREATE}
                </Text>
              }
            />
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
                disabled={this.state.disableButton}
              />
              <TouchableOpacity 
                style={styles.questionTag}
                onPress={() => this.setState({isModalVisible: true})}
              > 
                <Text style={styles.questionTagText}>Need Help?</Text>
              </TouchableOpacity>
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
        </TouchableWithoutFeedback>
      </LoadingPage>
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
    flex: 2,
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
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  errorBox: {
    minHeight: Dimensions.get('screen').height/15,
    maxHeight: Dimensions.get('screen').height/15,
    minWidth: '85%',
    maxWidth: '85%',
  },
  error: {
    fontSize: Dimensions.get('screen').height/50,
    fontFamily: 'poppins-semibold',
    color: '#fff',
    textAlign: 'center'
  },
  questionTag: {
    marginTop: 15,
    paddingLeft: Dimensions.get('screen').width/15,
    paddingRight: Dimensions.get('screen').width/15,
    minWidth: '85%',
    maxWidth: '85%',
  },
  questionTagText: {
    fontSize: Dimensions.get('screen').height/50,
    fontFamily: 'poppins-semibold',
    color: '#ffffff66',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  modalContent: {
    fontSize: Dimensions.get('screen').height/50,
    fontFamily: 'poppins-semibold',
    color: '#ffffffaa',
    textAlign: 'left'
  }
});

export default Create;