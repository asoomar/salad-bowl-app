import React, {Component} from 'react';
import { StyleSheet, Text, View, Button, TextInput } from 'react-native';
import Screens from '../constants/Screens';
import Fire from '../Fire';
import UserPlaying from '../components/segments/UserPlaying';

class Game extends Component {
  state = {
    isPlaying: false,
    isTeamPlaying: false,
    currentPlayer: {},
    score: {team1: 0, team2: 0},
    words: [{id: '', word: ''}],
    currentWord: {id: '', word: ''},
    round: 0,
    isTimerGoing: false,
    turnStartTimestamp: '',
    turnTime: 60000, //60 seconds by default
    timeRemaining: 60000 
  }

  componentDidMount() {
    this.db = Fire.db;

    // Listen for who is currently playing
    this.db.getRef(`games/${this.props.gameID}/currentPlayer`).on('value', (snapshot) => {
      // Assumes there is only 1 object and the first one is the current player
      let currentPlayer = Object.entries(snapshot.val())[0];
      let currentPlayerStateObj = {
        id: currentPlayer[0],
        name: currentPlayer[1].name, 
        team: currentPlayer[1].team,
      }
      const isPlayingState = currentPlayerStateObj.id === this.props.playerID;
      const isTeamPlayingState = currentPlayerStateObj.team === this.props.team;
      this.setState({
        isPlaying: isPlayingState,
        isTeamPlaying: isTeamPlayingState,
        currentPlayer: currentPlayerStateObj
      })
      if (isPlayingState) {
        this.getAvailableWords();
      }
    });

    // Listen for score changes
    this.db.getRef(`games/${this.props.gameID}/score`).on('value', (snapshot) => {
      let scores = Object.entries(snapshot.val());
      let team1Score = 0;
      let team2Score = 0;
      for (let i = 0; i < scores.length; i++) {
        if (scores[i][0] === 'team1') {
          team1Score = scores[i][1]
        } else if (scores[i][0] === 'team2') {
          team2Score = scores[i][1]
        }
      }
      this.setState({score: {team1: team1Score, team2: team2Score}});
    });

    // Listen for round change
    this.db.getRef(`games/${this.props.gameID}/round`).on('value', (snapshot) => {
      let roundState = snapshot.val();
      this.setState({round: roundState});
    });

    // Listen for turn timestamp
    this.db.getRef(`games/${this.props.gameID}/turnStartTimestamp`).on('value', (snapshot) => {
      let turnStart = snapshot.val();
      let timerStarted = turnStart === '' ? false : true;
      this.setState({
        turnStartTimestamp: turnStart, 
        isTimerGoing: timerStarted}, () => {
          if (timerStarted) {
            this.myInterval = setInterval(() => this.countdown(), 100)
          } 
        });
    });

    // Listen for turn time
    this.db.getRef(`games/${this.props.gameID}/turnTime`).on('value', (snapshot) => {
      clearInterval(this.myInterval);
      let turnTimeState = snapshot.val();
      this.setState({turnTime: turnTimeState});
    });
  }

  componentWillUnmount() {
    this.db.getRef(`games/${this.props.gameID}/currentPlayer`).off();
    this.db.getRef(`games/${this.props.gameID}/score`).off();
    this.db.getRef(`games/${this.props.gameID}/round`).off();
    this.db.getRef(`games/${this.props.gameID}/turnStartTimestamp`).off();
    this.db.getRef(`games/${this.props.gameID}/turnTime`).off();
    clearInterval(this.myInterval);
  }

  getAvailableWords() {
    this.db.getRef(`words/${this.props.gameID}`).once('value', (snapshot) => {
      const allWords = Object.entries(snapshot.val());
      let availableWords = [];
      for (let i = 0; i < allWords.length; i++) {
        if (!allWords[i][1].hasBeenPlayed) {
          availableWords.push({
            id: allWords[i][0],
            word: allWords[i][1].word
          });
        }
      }
      availableWords.sort(() => Math.random() - 0.5);
      this.setState({words: availableWords, currentWord: availableWords[0]});
    })
  }

  getTeam(team) {
    return team === 0 ? "team1" : "team2";
  }

  wordHasBeenPlayed() {
    this.db.getRef(`words/${this.props.gameID}/${this.state.currentWord.id}`)
    .update({hasBeenPlayed: true});
    let availableWords = [...this.state.words];
    availableWords.shift();
    if (availableWords.length === 0) {
      this.nextRound();
    } else {
      this.setState({words: availableWords, currentWord: availableWords[0]});
    }
  }

  nextRound() {
    this.setState({isTimerGoing: false});
    this.db.getRef(`games/${this.props.gameID}`).update({
      turnTime: this.state.timeRemaining,
      turnStartTimestamp: ''
    })
    if (this.state.round === 3) {
      this.db.getRef(`games/${this.props.gameID}/status`).set(Screens.FINISH)
    } else {
      // Get all words and set hasBeenPlayed to false
      this.db.getRef(`games/${this.props.gameID}/round`).set(this.state.round+1);
      this.db.getRef(`words/${this.props.gameID}`).once('value', (snapshot) => {
        let allWords = Object.entries(snapshot.val());
        let updatedWords = {};
        for (let i = 0; i < allWords.length; i++) {
          updatedWords[allWords[i][0]]= {
            hasBeenPlayed: false,
            word: allWords[i][1].word
          }
        }
        this.db.getRef(`words/${this.props.gameID}`).update(updatedWords)
        .then(() => {this.getAvailableWords()})
      })
    }
  }

  nextWord() {
    // Increment user team's score
    let team = this.getTeam(this.props.team);
    let newScore = this.state.score[team] + 1;
    this.db.getRef(`games/${this.props.gameID}/score/${team}`).set(newScore);
    this.wordHasBeenPlayed();
  }

  pass() {
    // Increment opposing team's score
    let team = this.getTeam(this.props.team) === "team1" ? "team2" : "team1";
    let newScore = this.state.score[team] + 1;
    this.db.getRef(`games/${this.props.gameID}/score/${team}`).set(newScore);
    this.wordHasBeenPlayed();
  }

  setTimer(setValue, time) {
    if (setValue) {
      this.setState({isTimerGoing: setValue, turnStartTimestamp: time})
      this.db.getRef(`games/${this.props.gameID}/turnStartTimestamp`).set(time);
    } else {
      this.setState({isTimerGoing: setValue, turnStartTimestamp: ''})
    }
  }

  countdown() {
    let timeLeft = (this.state.turnStartTimestamp + this.state.turnTime) - Date.now();
    timeLeft = timeLeft < 0 ? 0 : timeLeft;
    this.setState({timeRemaining: timeLeft})
    if (timeLeft === 0) {
      clearInterval(this.myInterval);
      this.setState({isTimerGoing: false, turnTime: 60000});
      // Pass turn to next player
      if (this.state.isPlaying) {
        this.db.getRef(`games/${this.props.gameID}`).update({
          turnStartTimestamp: '',
          turnTime: 60000
        });
        this.db.getRef(`players/${this.props.gameID}`).once('value', (snapshot) => {
          let players = Object.entries(snapshot.val());
          const opposingTeam = this.props.team === 0 ? 1 : 0;
          let possibleNextPlayers = [];
          let opposingTeamPlayers = {};

          for (let i =0; i < players.length; i++) {
            if (players[i][1].team === opposingTeam) {
              opposingTeamPlayers[players[i][0]] =
               {name: players[i][1].name, team: players[i][1].team};

              if (players[i][1].hasPlayed === false) {
                possibleNextPlayers.push({
                  [players[i][0]]: {name: players[i][1].name, team: players[i][1].team}
                })
              }
            }
          }
          
          let nextPlayer = {}
          if (possibleNextPlayers.length === 0) {
            let keys = Object.keys(opposingTeamPlayers);
            for(let i = 0; i < keys.length; i++) {
              opposingTeamPlayers[keys[i]].hasPlayed = false;
            }
            let randVal = Math.floor(Math.random(0, keys.length));
            nextPlayer = {[keys[randVal]]: {
              name: opposingTeamPlayers[keys[randVal]].name,
              team: opposingTeamPlayers[keys[randVal]].team
            }}
            opposingTeamPlayers[keys[randVal]].hasPlayed = true;
            console.log('Resetting opposing teams hasPlayed...');
            this.db.getRef(`players/${this.props.gameID}`).update(opposingTeamPlayers);
          } else {
            possibleNextPlayers.sort(()=>Math.random() < 0.5);
            nextPlayer = possibleNextPlayers[0];
            const nextPlayerID = Object.keys(nextPlayer)[0];
            this.db.getRef(`players/${this.props.gameID}/${nextPlayerID}`)
              .update({hasPlayed: true});  
          }
          console.log('Setting next player');
          this.db.getRef(`games/${this.props.gameID}/currentPlayer`).set(nextPlayer);
        })
      }
    }
  }

  render() {
    const segment = this.state.isPlaying ? 
      <UserPlaying 
        currentWord={this.state.currentWord.word}
        timerStarted={this.state.isTimerGoing}
        nextWord={() => this.nextWord()}
        pass={() => this.pass()}
        setTimer={(setValue, time) => this.setTimer(setValue,time)}
      /> : 
      (this.state.isTeamPlaying ? 
        <Text>Guess the word</Text> : 
        <Text>Stay quiet while the other team guesses</Text>);
    return (
      <View style={styles.container}>
        <View style={styles.div}>
          <Text style={styles.heading}>Game Screen</Text>
          <Text style={styles.heading}>Round {this.state.round}</Text>
          <Text style={styles.heading}>Team 1: {this.state.score.team1}</Text> 
          <Text style={styles.heading}>Team 2: {this.state.score.team2}</Text>
          <Text>{Math.ceil(this.state.timeRemaining/1000)}</Text>
        </View>
        <View style={styles.div}>
          {segment} 
        </View>
      </View>
    );
  }
}
  
const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  div: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    justifyContent: 'center'
  },
  heading: {
    fontWeight: 'bold'
  },
});

export default Game;