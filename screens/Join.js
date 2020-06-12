import React, {Component} from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Dimensions } from 'react-native';
import LoadingPage from '../components/primitives/LoadingPage';  
import PrimaryTextInput from '../components/primitives/PrimaryTextInput';
import PrimaryButton from '../components/primitives/PrimaryButton';
import BackButton from '../components/primitives/BackButton';
import PrimaryModal from '../components/primitives/PrimaryModal';
import Screens from '../constants/Screens';
import { gameIDLength } from '../constants/Structures';
import { modalStart } from '../constants/ModalContent';
import Events from '../constants/Events';
import Fire from '../Fire';
import { AdMobRewarded, AdMobInterstitial } from 'expo-ads-admob';
import Ads from '../constants/Ads';

class Join extends Component {
  state = {
    name: '',
    joinCode: '',
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

  async canUserJoinGame(gameID) { 
    console.log('Checking if game is valid...');
    try {
      let snapshot = await this.db.getRef(`games`).orderByKey().equalTo(gameID).once('value');
      if (snapshot.val() == null) { 
        // Check if the game exists
        console.log(`Game ${gameID} does not exist`);
        this.setState({
          disableButton: false,
          isLoading: false,
          error: `It doesn't look like that game exists`
        });
        return false;
      } else if (snapshot.val()[gameID].round !== '' 
        || snapshot.val()[gameID].status !== Screens.LOBBY) { 
        // Check to make sure game hasn't started yet
        console.log(`Game ${snapshot.val()[gameID].round} has already started`);
        this.setState({
          disableButton: false,
          isLoading: false,
          error: `Uh oh, it looks like that game has already started`
        });
        return false;
      }
      this.setState({ isLoading: true }); 
      return true;
    } catch {
      console.log(`Could not check if game ${gameID} exists`);
      this.setState({ disableButton: false, isLoading: false })
      return false;
    }
  }

  async pressSubmit() {
    let gameID = this.state.joinCode.toUpperCase();
    if (this.state.name.trim() < 1) {
      this.setState({error: `You must enter a name`});
      return
    }
    if (gameID.length !== gameIDLength) {
      this.setState({error: `Game ID should be ${gameIDLength} characters`});
      return
    }
    this.setState({ disableButton: true })
    this.db.logEvent(Events.JOIN_GAME, {
      screen: 'join',
      purpose: 'User entered details and clicked "Join"'
    })
    if (await this.canUserJoinGame(gameID)) {
      if (Ads.showAds) {
        // await AdMobRewarded.setAdUnitID(Ads.JoinGame.id.ios);
        // await AdMobRewarded.requestAdAsync();
        // await AdMobRewarded.showAdAsync();
        await AdMobInterstitial.setAdUnitID(Ads.JoinGameAlt.id.ios);
        await AdMobInterstitial.requestAdAsync();
        await AdMobInterstitial.showAdAsync();
      }
      this.props.updateName(this.state.name.trim());
      this.props.updateGameID(gameID);
      this.props.changeScreen(Screens.LOBBY);
    }
  }

  render() {
    return (
      <LoadingPage 
        loadingText={"Joining Game..."}
        isLoading={this.state.isLoading}>
        <View style={styles.container}>
          <PrimaryModal 
            title='Joining A Game'
            modalVisible={this.state.isModalVisible}
            buttonText='Got It!'
            onCloseModal={() => this.setState({isModalVisible: false})}
            minHeight={Dimensions.get('screen').height/5}
            content={
              <Text style={styles.modalContent}>
                {modalStart.JOIN}
              </Text>
            }
          />
          <View style={styles.mainView}>
            <Text style={styles.title}>Join Game</Text>
            <View style={styles.errorBox}>
              <Text style={styles.error}>{this.state.error}</Text> 
            </View>
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
                  screen: 'join',
                  purpose: 'User on join page clicked to go back to lobby'
                })
                this.props.changeScreen(Screens.HOME)
              }}
              margin={Dimensions.get('screen').width/15}
            />
          </View>
        </View>
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
    textAlign: 'center',
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

export default Join;