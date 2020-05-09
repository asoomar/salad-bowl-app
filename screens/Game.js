import React, {Component} from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import Screens from '../constants/Screens';
import Timer from '../components/primitives/Timer';
import Fire from '../Fire';
import UserPlaying from '../components/segments/UserPlaying';
import OpponentPlaying from '../components/segments/OpponentPlaying';

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

    // Listen for game to finish
    this.db.getRef(`games/${this.props.gameID}/status`).on('value', (snapshot) => {
      if (snapshot.val() === Screens.FINISH) {
        this.props.changeScreen(Screens.FINISH);
      }
    });
  }

  componentWillUnmount() {
    this.db.getRef(`games/${this.props.gameID}/currentPlayer`).off();
    this.db.getRef(`games/${this.props.gameID}/score`).off();
    this.db.getRef(`games/${this.props.gameID}/round`).off();
    this.db.getRef(`games/${this.props.gameID}/turnStartTimestamp`).off();
    this.db.getRef(`games/${this.props.gameID}/turnTime`).off();
    this.db.getRef(`games/${this.props.gameID}/status`).off();
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
      this.db.getRef(`games/${this.props.gameID}/status`).set(Screens.FINISH);
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

  getRoundText(round, timerStarted) {
    if (!timerStarted)
      return "It's your turn!"
    switch (round) {
      case 1:
        return "Explain what the word is without using it!"
      case 2:
        return "Act out the word!"
      case 3:
        return "Use one word to describe the word without using it!" 
      default:
        return "It's your turn!"     
    }


  }

  render() {
    const segment = this.state.isPlaying
      ? <Text style={styles.footerText}>
          {this.getRoundText(this.state.round, this.state.isTimerGoing)}
        </Text>  
      : (this.state.isTeamPlaying 
        ? <Text style={styles.footerText}>It's your team's turn! Try and the word!</Text> 
        : <Text style={styles.footerText}>Waiting for the other team's turn to finish...</Text>)
    
    const team1Style = this.props.team === 0 ? null : styles.opposing
    const team2Style = this.props.team === 1 ? null : styles.opposing
        
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Round {this.state.round}</Text>
          <View style={styles.score}>
            <View style={styles.teamScore}>
              <Text style={[styles.points, team1Style]}>{this.state.score.team1}</Text>
              <Text style={[styles.team, team1Style]}>Team 1</Text> 
            </View>
            <Timer 
              time={this.state.timeRemaining/1000}
              totalTime={60}
            />
            <View style={styles.teamScore}>
              <Text style={[styles.points, team2Style]}>{this.state.score.team2}</Text>
              <Text style={[styles.team, team2Style]}>Team 2</Text>
            </View>
          </View>
        </View>
        <View style={styles.body}>
          {this.state.isPlaying
          ? <UserPlaying 
              currentWord={this.state.currentWord.word}
              timerStarted={this.state.isTimerGoing}
              nextWord={() => this.nextWord()}
              pass={() => this.pass()}
              setTimer={(setValue, time) => this.setTimer(setValue,time)}
              round={this.state.round}
            /> 
          : <OpponentPlaying />}
        </View>
        <View style={styles.footer}>
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
    alignItems: 'center',
    justifyContent: 'center',
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
  score: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    minWidth: '100%'
  },
  teamScore: {
    display: 'flex',
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'column'
  },
  team: {
    fontSize: Dimensions.get('screen').height/50,
    fontFamily: 'poppins-semibold',
    color: '#fff',
  },
  points: {
    fontSize: Dimensions.get('screen').height/20,
    fontFamily: 'poppins-semibold',
    color: '#fff',
  },
  opposing: {
    color: '#ffffff66'
  },
  body: {
    flex: 5,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    minWidth: '100%'
  },
  footer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#4b42f5',
    minWidth: '100%',
    paddingLeft: 15,
    paddingRight: 15
  },
  footerText: {
    fontSize: Dimensions.get('screen').height/40,
    fontFamily: 'poppins-semibold',
    color: '#fff',
    textAlign: 'center'
  },
});

export default Game;