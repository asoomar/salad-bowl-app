import React, { Component } from 'react';
import { StyleSheet, Text, View, ScrollView, Dimensions } from 'react-native';
import SegmentSelector from '../components/primitives/SegmentSelector';
import PrimaryButton from '../components/primitives/PrimaryButton';
import PrimaryModal from '../components/primitives/PrimaryModal';
import InstructionsModal from '../components/segments/InstructionsModal';
import YourWords from '../components/segments/YourWords';
import Screens from '../constants/Screens';
import NumberRanks from '../constants/NumberRanks';
import { isValidSnapshot, getCurrentTimestamp } from '../global/GlobalFunctions';
import { gameStorageValue } from '../constants/FirestoreValues';
import Events from '../constants/Events';
import { DEV } from '../constants/Mode';
import { errorContent, hostLeftContent } from '../constants/Content';
import Fire from '../Fire';
import _ from 'lodash';
import Ads from '../constants/Ads';
import {
  AdMobBanner,
} from 'expo-ads-admob';

const playerMinLimit = DEV ? 2 : 4  

class Lobby extends Component {
  state = {
    editWords: true,
    error: '',
    host: {name: null, id: null},
    players: [['','']],
    waitingPlayerKeys: [],
    // Max of 10 words per player
    words: [
      {key: '', word: ''},
      {key: '', word: ''}, 
      {key: '', word: ''}, 
      {key: '', word: ''},
      {key: '', word: ''},
      {key: '', word: ''},
      {key: '', word: ''},
      {key: '', word: ''},
      {key: '', word: ''},
      {key: '', word: ''}
    ],
    wordCount: 0,
    wordsPerPlayer: 0, // Default if words per player is not set
    currentSegment: 'Your Words',
    disableSubmitWords: false,
    disableLeaveGame: false,
    disableContinue: false,
    showHostModal: true,
    showInstructions: false,
    showConfirmLeave: false,

    // Needed because the host gets reset twice if they leave game
    wasHost: false, 
  }

  componentDidMount() {
    this.db = Fire.db;

    if (this.props.playerID === '') { //If host was already added, don't add again
      // Add player to the list of players for the game
      this.db.getRef('players/' + this.props.gameID).push(this.props.screenName)
      .then((value) => {
        this.props.setPlayerID(value.key)
        // Add player to 'waiting' state to indicate (to others) they haven't submitted words
        this.db.getRef(`games/${this.props.gameID}/waiting/${value.key}`).set(this.props.screenName);
      });
    }

    // Get words per player
    this.db.getRef(`games/${this.props.gameID}/wordsPerPerson`).once('value', (snapshot) => {
      if (!isValidSnapshot(snapshot, 12)) return
      if (typeof snapshot.val() === 'number') {
        this.setState({ wordsPerPlayer: snapshot.val()})
      }
    })

    //Listen for Host change
    this.db.getRef(`games/${this.props.gameID}/host`).on('value', (snapshot) => {
      if (!isValidSnapshot(snapshot, 0)) {
        this.props.setHomeMessage(errorContent(0))
        this.props.changeScreen(Screens.HOME);
        return
      }
      if (snapshot.val() === "") {
        if (!this.state.wasHost) {
          this.props.setHomeMessage(hostLeftContent);
          this.goHome();
        }
      } else {
        let host = Object.entries(snapshot.val())[0];
        this.setState({host: {name: host[1], id: host[0]}});
        if (this.props.playerID === host[0]) {
          this.setState({wasHost: true});
        }
      }
    });

    // Listen for any players that have been added to the game  
    this.db.getRef('players/' + this.props.gameID).on('value', (snapshot) => {
      let dbPlayers = _.toPairs(snapshot.val());
      this.setState({players: [...dbPlayers]});  
    });
    
    // Listen for words submitted (used for count)
    this.db.getRef('words/' + this.props.gameID).on('value', (snapshot) => {
      let words = _(snapshot.val()).values();
      let count = [...words].length;
      this.setState({wordCount: count});
    });

    // Listen for players in 'waiting' state
    this.db.getRef(`games/${this.props.gameID}/waiting`).on('value', (snapshot) => {
      let waiting = _(snapshot.val()).keys();
      this.setState({waitingPlayerKeys: [...waiting]});
    });

    // Listen for game to start
    this.db.getRef(`games/${this.props.gameID}/status`).on('value', (snapshot) => {
      if (snapshot.val() === Screens.TEAMS) {
        this.props.changeScreen(Screens.TEAMS);
      }
    });

  }

  componentWillUnmount() {
    this.db.getRef(`players/${this.props.gameID}`).off();
    this.db.getRef(`words/${this.props.gameID}`).off();
    this.db.getRef(`games/${this.props.gameID}/waiting`).off();
    this.db.getRef(`games/${this.props.gameID}/status`).off();
    this.db.getRef(`games/${this.props.gameID}/host`).off();

    this.setState({
      disableSubmitWords: false,
      disableLeaveGame: false,
      disableContinue: false,
    })
  }

  async goHome() {
    this.setState({ disableLeaveGame: true });
    this.db.logEvent(Events.LEAVE_GAME, {
      screen: 'lobby',
      purpose: 'Leave game button was clicked',
    })

    // Remove player from player list for game
    this.db.getRef(`players/${this.props.gameID}/${this.props.playerID}`).remove()
    .then(()=> {
      console.log(`${this.props.playerID} (${this.props.screenName}) was removed from the game`);
      this.removeUserWaiting();
      this.removeUserWords();
      this.resetHost();
      this.checkIfLastToLeave();
    })
    .catch((error) => 'Remove failed: ' + error.message)
    .finally(()=> {
        this.props.changeScreen(Screens.HOME)
    });
  }

  async resetHost() {
    if (this.props.playerID === this.state.host.id) {
      try {
        await this.db.getRef(`games/${this.props.gameID}/host`).set('')
        console.log(`Host was reset by ${this.props.screenName}`)
        // this.setState({wasHost: false})
      }
      catch (err) {
        console.log("Could not reset host: " + err)
      }
    }
  }

  async removeUserWaiting() {
    this.db.getRef(`games/${this.props.gameID}/waiting/${this.props.playerID}`).remove()
    .then(()=> {
      console.log(`${this.props.playerID} (${this.props.screenName}) was removed from waiting`);
    })
    .catch((error) => 'Remove from waiting failed: ' + error.message)
  }

  // Remove the words the user submitted
  async removeUserWords() {
    let currentWords = this.state.words;
    for (let i = 0; i < this.state.wordsPerPlayer; i++) {
      this.db.getRef(`words/${this.props.gameID}/${currentWords[i].key}`).remove()
      .then(()=> {
        console.log(`Removed word (${currentWords[i].word}) from game`);
      })
      .catch((error) => 'Word remove failed: ' + error.message)
    }
  }

  // Check if we were the last person to leave the game
  async checkIfLastToLeave() {
    this.db.getRef(`players`).orderByKey().equalTo(this.props.gameID).once('value', (snapshot) => {
      if (snapshot.val() == null) {
        console.log(`${this.props.screenName} WAS the last player to leave`);
        this.deleteGame();
        this.deleteGameWords();
      }
    }); 
  }

  // Delete the game we just left
  async deleteGame() {
    this.db.getRef(`games/${this.props.gameID}`).remove()
    .then(()=> {
      console.log(`Game (${this.props.gameID}) was deleted`);
    })
    .catch((error) => 'Game deletion failed: ' + error.message);  
  }

  // Delete words that are for the current game
  async deleteGameWords() {
    this.db.getRef(`words/${this.props.gameID}`).remove()
    .then(()=> {
      console.log(`Words for game (${this.props.gameID}) were deleted`);
    })
    .catch((error) => 'Words deletion failed: ' + error.message); 
  }

  updateWord(text, index) {
    this.setState(prevState => {
      let newWords = [...prevState.words];
      newWords[index].word = text;
      return {words: newWords};
    });
  }

  submitWords() {
    for (let i = 0; i < this.state.wordsPerPlayer; i++) {
      if (this.state.words[i].word.trim() === '') {
        this.setState({error: "Ensure all words are filled"});
        this.db.logEvent(Events.SUBMIT_WORDS, {
          screen: 'lobby',
          purpose: 'Submit words button was clicked',
          status: 'invalid'
        })
        return;
      }
    }
    this.setState({disableSubmitWords: true});
    this.db.logEvent(Events.SUBMIT_WORDS, {
      screen: 'lobby',
      purpose: 'Submit words button was clicked',
      status: 'valid'
    })
    this.setState({error: ''});
    if (this.state.words[0].key !== '') { // Update words in database
      for (let i = 0; i < this.state.wordsPerPlayer; i++) {
        this.db.getRef(`words/${this.props.gameID}/${this.state.words[i].key}`)
        .update({
          word: this.state.words[i].word.trim().toUpperCase()
        })
      }
    } else { // Add words to database
      let gameWordsRef = this.db.getRef('words/' + this.props.gameID);
      for (let i = 0; i < this.state.wordsPerPlayer; i++) {
        let wordRef = gameWordsRef.push({
          word: this.state.words[i].word.trim().toUpperCase(),
          hasBeenPlayed: false
        });
        this.setState(prevState => {
          let newWords = [...prevState.words];
          newWords[i].key = wordRef.key;
          return {words: newWords};
        })
      }
      this.db.getRef(`games/${this.props.gameID}/waiting/${this.props.playerID}`).remove()
      .then(()=> 
      console.log(`No longer waiting for ${this.props.playerID} (${this.props.screenName}) to submit words`))
    }
    this.setState({
      disableSubmitWords: false, 
      editWords: false, 
      currentSegment: 'Players'
    });
    this.setState((prevState) => {
      let newWords = [...prevState.words];
      for (let i = 0; i < newWords.length; i++) {
        newWords[i].word = newWords[i].word.trim()
      }
      return {
        editWords: false,
        words: newWords
      }
    })
  }

  startGame() {
    this.db.logEvent(Events.START_GAME, {
      screen: 'lobby',
      purpose: 'Start game to proceed to team distribution',
    })
    this.setState({ disableSubmitWords: true });
    this.db.getRef(`games/${this.props.gameID}/status`).set(Screens.TEAMS)
    .then(() => {
      console.log(`Setting up teams for game ${this.props.gameID}`);
      this.db.getRef(`players/${this.props.gameID}`).once('value', (snapshot) => {
        if (!isValidSnapshot(snapshot, 1)) {
          this.props.setHomeMessage(errorContent(1))
          this.props.changeScreen(Screens.HOME);
          return
        }
        let gamePlayers = Object.entries(snapshot.val());
        gamePlayers.sort(() => Math.random() - 0.5);
        let playersWithTeams = {};
        for (let i = 0; i < gamePlayers.length; i++) {
          let teamNumber = i % 2 === 0 ? 0 : 1;
          let playerObject = {
            name: gamePlayers[i][1],
            team: teamNumber,
            hasPlayed: false,
            points: 0,
          }
          playersWithTeams[gamePlayers[i][0]] = playerObject;
        }
        this.db.getRef(`players/${this.props.gameID}`).update(playersWithTeams);
      });
      this.db.getCollection(gameStorageValue).doc(`${this.props.gameID}${this.props.playerID}`).set({
        playerCount: this.state.players.length,
        wordCount: this.state.players.length*this.state.wordsPerPlayer,
        timeStart: getCurrentTimestamp(),
        timeFinish: null,
        didFinish: false
      }).then(() => console.log('Create game in permanent logs'))
      .catch(err => console.log(err))
    })
    .catch((error) => {
      console.log(`There was an error starting the game ${this.props.GameID}`)
      console.log(error)
    })
  }

  getWaitingToJoinText() {
    if (this.state.players.length < playerMinLimit) {
      const playerPlural = (playerMinLimit - this.state.players.length) === 1 ? 'player' : 'players'
      return `Waiting for ${" " + String(playerMinLimit - this.state.players.length) + " "} more ${playerPlural} to join...`
    }
    return null
  }

  render() {
    let playerList = (
      <ScrollView style={styles.playerList}>
        {this.state.players.map((player, i) => {
          let playerState = this.state.waitingPlayerKeys.includes(player[0]) ? 'waiting...' : 'Ready';
          let suffix = player[0] === this.props.playerID ? ' (You)' : null;
          return(
            <View key={i} style={styles.playerItem}>
              <Text style={styles.playerName}>{player[1]}{suffix}</Text>
              {playerState === 'waiting...' 
                ? <Text style={styles.playerWaiting}>{playerState}</Text> : null}
              {playerState === 'Ready' 
                ? <Text style={styles.playerReady}>{playerState}</Text> : null}
            </View>
          );
        })}
      </ScrollView>
      );

    let yourWords = this.state.editWords
      ? <YourWords
        words={this.state.words}
        wordsPerPlayer={this.state.wordsPerPlayer}
        onWordChange={(text, wordNum) => this.updateWord(text, wordNum)}
        onSubmit={() => this.submitWords()}
        error={this.state.error}
        style={styles.textInput}
        placeholderTextColor='#dddddd'
        footerHeight={Dimensions.get('screen').height/7}
        disabled={this.state.disableContinue}
        />
      : (
        <ScrollView>
          <View style={styles.myWords}>
            {this.state.words.map((wordObject,i) => {
              if (i < this.state.wordsPerPlayer) {
                return (
                  <Text 
                    key={NumberRanks[i]}
                    style={styles.myWord}
                  >
                    {wordObject.word}
                  </Text>)
              }
            })}
            <PrimaryButton 
              text='Edit Words'
              onPress={() => {
                this.db.logEvent(Events.EDIT_WORDS, {
                  screen: 'lobby',
                  purpose: 'Edit words button was clicked'
                })
                this.setState({editWords: true})}}
              buttonStyle={styles.editButton}
              textStyle={styles.editButtonText}
            />
          </View>
        </ScrollView>
      )
    
    let morePane = (
      <View style={styles.moreView}>
        <PrimaryButton 
          text='How to Play'
          onPress={() => this.setState({showInstructions: true})}
          buttonStyle={styles.instructionsButton}
        />
        <PrimaryButton 
          text='Leave Game'
          onPress={() => this.setState({showConfirmLeave: true})}
          buttonStyle={styles.leaveButton}
          textStyle={styles.leaveButtonText}
          disabled={this.state.disableLeaveGame}
        />
        {Ads.showAds ? 
        <View style={styles.adView}>
          <AdMobBanner
            bannerSize="mediumRectangle"
            adUnitID={Ads.LobbyMorePane.id.ios}
          />
        </View> : null}
      </View>
    )
    
    const playerPlural = this.state.players.length === 1
      ? 'player' : 'players'

    return (
      <View style={styles.container}>
        <InstructionsModal 
          onCloseModal={() => this.setState({showInstructions: false})}
          modalVisible={this.state.showInstructions}
        />
        <PrimaryModal 
          title='Invite Players'
          modalVisible={
            this.props.playerID === this.state.host.id && 
            this.state.showHostModal}
          buttonText={'Got It!'}
          onCloseModal={() => this.setState({showHostModal: false})}
          minHeight={Dimensions.get('screen').height/5}
          content={
            <View style={styles.modalContent}>
              <View style={styles.modalCode}>
                <Text style={styles.modalCodeText} selectable>
                  {this.props.gameID}
                </Text>
              </View>
              <Text style={styles.modalText}>
                Share the code above with others so they can join this game!
              </Text>
            </View>
          }
        />
        <PrimaryModal 
          title='Are you sure?'
          modalVisible={this.state.showConfirmLeave}
          twoButtons
          buttonText={'Leave'}
          onCancel={() => this.setState({showConfirmLeave: false})}
          onCloseModal={() => this.goHome()}
          minHeight={Dimensions.get('screen').height/5}
          titleHeight={Dimensions.get('screen').height/26}
          content={
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>
                {this.props.playerID === this.state.host.id
                ? "Leaving the game as host will end the game for everyone!"
                : "Leaving the game is not what the cool kids are doing!"}
              </Text>
            </View>
          }
        />
        <View style={styles.header}>
          <Text style={styles.title}>Lobby</Text> 
          <Text style={styles.subtitle}>Game ID is {this.props.gameID}</Text> 
          <Text style={styles.minititle}>
            {this.state.wordCount}/{this.state.players.length*this.state.wordsPerPlayer} words
          </Text>
          <Text style={styles.minititle}>
            {`${this.state.players.length} ${playerPlural}`}
          </Text>
        </View>
        <SegmentSelector
            segments={['Your Words', 'Players', 'More']}
            currentSegment={this.state.currentSegment}
            onChangeSegment={segment => {
              this.db.logEvent(Events.SWITCH_TAB, {
                tab: segment,
                screen: 'lobby',
                purpose: 'Tab was switched in lobby'
              })
              this.setState({currentSegment: segment})
            }}
          />
        <View style={styles.body}>
          {this.state.currentSegment === 'Your Words' ? yourWords : null}
          {this.state.currentSegment === 'Players' ? playerList : null}
          {this.state.currentSegment === 'More' ? morePane : null}
        </View>
        <View style={styles.footer}>
          {this.state.players.length < playerMinLimit
          ? <Text style={styles.footerText}>{this.getWaitingToJoinText()}</Text>
          : this.state.wordCount < this.state.players.length*this.state.wordsPerPlayer
          ? <Text style={styles.footerText}>Waiting for players to submit words...</Text>
          : this.props.playerID === this.state.host.id 
            ? <PrimaryButton
                text='Continue'
                onPress={()=>this.startGame()}
                buttonStyle={styles.continueButton}
                textStyle={styles.continueButtonText}
                disabled={this.state.disableContinue}
              />
            : <Text style={styles.footerText}>Waiting for host to continue...</Text>   
          } 
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
    display: 'flex',
  },
  modalContent: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },
  modalCode: {
    backgroundColor: '#3c34d9',
    borderRadius: Dimensions.get('screen').height,
    paddingTop: 3,
    paddingLeft: 30,
    paddingRight: 30,
    width: '100%'
  },
  modalCodeText: {
    color: '#ffffff',
    fontSize: Dimensions.get('screen').height/25,
    fontFamily: 'poppins-semibold',
    textAlign: 'center',
    width: '100%'
  },
  modalText: {
    fontSize: Dimensions.get('screen').height/45,
    fontFamily: 'poppins-semibold',
    color: '#ffffffaa',
    textAlign: 'center',
    marginTop: 10,
  },
  header: {
    flex: 2,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#4b42f5',
    minWidth: '100%'
  },
  title: {
    fontSize: Dimensions.get('screen').height/20,
    fontFamily: 'poppins-semibold',
    color: '#fff',
    marginTop: 15,
  },
  subtitle: {
    fontSize: Dimensions.get('screen').height/35,
    fontFamily: 'poppins-semibold',
    color: '#fff',
    marginBottom: 10,
  },
  minititle: {
    fontSize: Dimensions.get('screen').height/55,
    fontFamily: 'poppins-semibold',
    color: '#ffffffaa',
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    flex: 4,
    backgroundColor: '#ffffff',
    minWidth: '100%',
  },
  myWords: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 10,
  },
  myWord: {
    fontSize: Dimensions.get('screen').height/30,
    fontFamily: 'poppins-semibold',
    color: '#000000',
  },
  moreView: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    height: '100%',
    paddingRight: 20,
    paddingLeft: 20,
    paddingTop: 10,
  },
  leaveButton: {
    backgroundColor: '#ffffff',
    minWidth: '20%',
    maxWidth: '60%',
    height: Dimensions.get('screen').height/18,
    margin: 0,
  },
  leaveButtonText: {
    color: '#ff0000',
  },
  instructionsButton: {
    backgroundColor: '#ffffff',
    minWidth: '20%',
    maxWidth: '80%',
    height: Dimensions.get('screen').height/18,
    margin: 0,
  },
  adView: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  editButton: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#4b42f5',
    minWidth: '60%',
    maxWidth: '60%',
    height: Dimensions.get('screen').height/15,
    marginTop: 5
  },
  editButtonText: {
    color: '#4b42f5',
  },
  footer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#4b42f5',
    minWidth: '100%',
    paddingLeft: 10,
    paddingRight: 10,
  },
  footerText: {
    fontSize: Dimensions.get('screen').height/40,
    fontFamily: 'poppins-semibold',
    color: '#fff',
    textAlign: 'center'
  },
  continueButton: {
    backgroundColor: '#4b42f5',
    borderWidth: 2,
    borderColor: '#ffffff',
    height: Dimensions.get('screen').height/15,
  },
  continueButtonText: {
    color: '#ffffff',
  },
  textInput: {
    color: '#4b42f5cc',
    backgroundColor: '#eeeeee',
    height: Dimensions.get('screen').height/15,
  },
  playerList: {
    padding: 15,
  },
  playerItem: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10
  },
  playerName: {
    fontSize: Dimensions.get('screen').height/35,
    fontFamily: 'poppins-semibold',
    color: '#000',
  },
  playerWaiting: {
    fontSize: Dimensions.get('screen').height/45,
    fontFamily: 'poppins-italic',
    color: '#aaa',
  },
  playerReady: {
    fontSize: Dimensions.get('screen').height/40,
    fontFamily: 'poppins-semibold',
    color: '#54ad18',
  }
});

  export default Lobby;