import React, {Component} from 'react';
import { StyleSheet, Text, View, Button, TextInput, Dimensions } from 'react-native';
import SegmentSelector from '../components/primitives/SegmentSelector';
import PrimaryButton from '../components/primitives/PrimaryButton';
import MyWords from '../components/segments/MyWords';
import Screens from '../constants/Screens';
import Fire from '../Fire';
import _ from 'lodash';

class Lobby extends Component {
  state = {
    editWords: true,
    error: '',
    host: {name: null, id: null},
    players: [['','']],
    waitingPlayerKeys: [],
    words: [{key: '', word: ''}, {key: '', word: ''}],
    wordCount: 0,
    currentSegment: 'My Words'
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

    //Listen for Host change
    this.db.getRef(`games/${this.props.gameID}/host`).on('value', (snapshot) => {
      let host = Object.entries(snapshot.val())[0];
      this.setState({host: {name: host[1], id: host[0]}});
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

  async componentWillUnmount() {
    this.db.getRef(`players/${this.props.gameID}`).off();
    this.db.getRef(`words/${this.props.gameID}`).off();
    this.db.getRef(`games/${this.props.gameID}/waiting`).off();
    this.db.getRef(`games/${this.props.gameID}/status`).off();
    this.db.getRef(`games/${this.props.gameID}/host`).off();
  }

  async goHome() {
    // Remove player from player list for game
    this.db.getRef(`players/${this.props.gameID}/${this.props.playerID}`).remove()
    .then(()=> {
      console.log(`${this.props.playerID} (${this.props.screenName}) was removed from the game`);
      this.removeUserWaiting();
      this.removeUserWords();
      this.checkIfLastToLeave();
    })
    .catch((error) => 'Remove failed: ' + error.message)
    .finally(()=> {
      this.props.changeScreen(Screens.HOME)
    });
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
    for (let i = 0; i < currentWords.length; i++) {
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
    for (let i = 0; i < this.state.words.length; i++) {
      if (this.state.words[i].word.trim() === '') {
        this.setState({error: "Cannot submit invalid words"});
        return;
      }
    }
    this.setState({error: ''});
    if (this.state.words[0].key !== '') { // Update words in database
      for (let i = 0; i < this.state.words.length; i++) {
        this.db.getRef(`words/${this.props.gameID}/${this.state.words[i].key}`)
        .update({
          word: this.state.words[i].word.trim().toUpperCase()
        })
      }
    } else { // Add words to database
      let gameWordsRef = this.db.getRef('words/' + this.props.gameID);
      for (let i = 0; i < this.state.words.length; i++) {
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
    this.setState({editWords: false, currentSegment: 'Players'});
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
    this.db.getRef(`games/${this.props.gameID}/status`).set(Screens.TEAMS)
    .then(() => {
      console.log(`Setting up teams for game ${this.props.gameID}`);
      this.db.getRef(`players/${this.props.gameID}`).once('value', (snapshot) => {
        let gamePlayers = Object.entries(snapshot.val());
        gamePlayers.sort(() => Math.random() - 0.5);
        let playersWithTeams = {};
        for (let i = 0; i < gamePlayers.length; i++) {
          let teamNumber = i % 2 === 0 ? 0 : 1;
          let playerObject = {
            name: gamePlayers[i][1],
            team: teamNumber,
            hasPlayed: false
          }
          playersWithTeams[gamePlayers[i][0]] = playerObject;
        }
        this.db.getRef(`players/${this.props.gameID}`).update(playersWithTeams);
      });
    })
    .catch((error) => console.log(`There was an error starting the game ${this.props.GameID}`))
  }

  render() {
    let playerList = this.state.players.map((player, i)=>{
      let prefix = this.state.waitingPlayerKeys.includes(player[0]) ? '*' : '';
      return(<Text key={i}>{prefix}{player[1]}</Text>);
    });

    let yourWords = this.state.editWords
      ? <MyWords 
        firstWordValue={this.state.words[0].word}
        secondWordValue={this.state.words[1].word}
        onFirstWordChange={text => this.updateWord(text, 0)}
        onSecondWordChange={text => this.updateWord(text, 1)}
        onSubmit={() => this.submitWords()}
        error={this.state.error}
        />
      : (
        <View style={styles.myWords}>
          {this.state.words.map((wordObject) => {
            return (
            <Text 
              key={wordObject.key}
              style={styles.myWord}
            >
              {wordObject.word}
            </Text>)
          })}
          <PrimaryButton 
            text='Edit Words'
            onPress={() => this.setState({editWords: true})}
            buttonStyle={styles.editButton}
            textStyle={styles.editButtonText}
          />
        </View>
      )


    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Lobby</Text> 
          <Text style={styles.subtitle}>Game ID is {this.props.gameID}</Text> 
          <Text style={styles.minititle}>
            {this.state.wordCount}/{this.state.players.length*2} words
          </Text>
          <Text style={styles.minititle}>
            {this.state.players.length} players
          </Text>
        </View>
        <SegmentSelector
          segmentOne='My Words'
          segmentTwo='Players'
          currentSegment={this.state.currentSegment}
          onChangeSegment={segment => this.setState({currentSegment: segment})}
        />
        <View style={styles.body}>
          {this.state.currentSegment === 'My Words' ? yourWords : null}
          {this.state.currentSegment === 'Players' ? playerList : null}
        </View>
        <View style={styles.footer}>
          {this.state.wordCount < this.state.players.length*2
          ? <Text style={styles.footerText}>Waiting for players to submit words...</Text>
          : this.props.playerID === this.state.host.id 
            ? <Button 
                title='Start Game!' 
                disabled={this.state.wordCount < this.state.players.length*2}
                onPress={()=>this.startGame()}
              /> 
            : <Text style={styles.footerText}>Waiting for host to continue...</Text>   
          }
          <Button title="Leave" onPress={()=>this.goHome()}/> 
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
    display: 'flex'
  },
  header: {
    flex: 2,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
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
    flex: 4
  },
  myWords: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  myWord: {
    fontSize: Dimensions.get('screen').height/30,
    fontFamily: 'poppins-semibold',
    color: '#fff',
  },
  editButton: {
    backgroundColor: '#4b42f5',
    borderWidth: 1,
    borderColor: '#ffffff',
    minWidth: '70%',
    maxWidth: '70%',
    height: Dimensions.get('screen').height/15,
    marginTop: 5
  },
  editButtonText: {
    color: '#ffffff',
  },
  footer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1
  },
  footerText: {
    fontSize: Dimensions.get('screen').height/40,
    fontFamily: 'poppins-semibold',
    color: '#fff',
    textAlign: 'center'
  }
});

  export default Lobby;