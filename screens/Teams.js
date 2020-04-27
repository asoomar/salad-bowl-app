import React, {Component} from 'react';
import { StyleSheet, Text, View, Button, TextInput } from 'react-native';
import Screens from '../constants/Screens';
import Fire from '../Fire';

class Teams extends Component {
  state = {
    team1: [],
    team2: []
  }

  componentDidMount() {
    this.db = Fire.db;

    // Get player list to see the teams
    this.db.getRef(`players/${this.props.gameID}`).on('value', (snapshot) => {
      let players = Object.entries(snapshot.val());
      let team1Players = [];
      let team2Players = [];
      for (let i = 0; i < players.length; i++) {
        if (players[i][1].team === 0) {
          team1Players.push(players[i]);
        } else if (players[i][1].team === 1) {
          team2Players.push(players[i]);
        }
        if (players[i][0] === this.props.playerID) {
          this.props.updateTeam(players[i][1].team);
        }
      }
      this.setState({team1: team1Players, team2: team2Players});  
    });

    // Listen for game to start
    this.db.getRef(`games/${this.props.gameID}/status`).on('value', (snapshot) => {
      if (snapshot.val() === Screens.GAME) {
        this.props.changeScreen(Screens.GAME);
      }
    });
  }

  componentWillUnmount() {
    this.db.getRef(`players/${this.props.gameID}`).off();
    this.db.getRef(`games/${this.props.gameID}/status`).off();
  }

  getTeam(teamName) {
    return this.state[teamName].map((player, i) => {
      return(<Text key={i}>{player[1].name}</Text>);
    });
  }

  startGame() {
    const { team1 } = this.state
    const playerIndex = Math.floor(Math.random(0, team1.length));
    const currentPlayerObj = {
      [team1[playerIndex][0]]: {
        name: team1[playerIndex][1].name,
        team: team1[playerIndex][1].team,
      }
    };
    this.db.getRef(`games/${this.props.gameID}`).update({
      status: Screens.GAME,
      currentPlayer: currentPlayerObj,
      round: 1
    })
    .then(() => {
      console.log(`Starting game ${this.props.gameID}`);
      // Set player hasPlayed attribute to true
      this.db.getRef(`players/${this.props.gameID}/${team1[playerIndex][0]}/hasPlayed`).set(true);
    })
  }

  render() {
    const teamOne = this.getTeam('team1');
    const teamTwo = this.getTeam('team2');

    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Teams Screen</Text> 
        <Text style={[styles.heading, styles.blue]}>Team 1</Text> 
        {teamOne}
        <Text style={[styles.heading, styles.red]}>Team 2</Text> 
        {teamTwo}
        <Button title="Start" onPress={()=>this.startGame()}/> 
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
  heading: {
    fontWeight: 'bold'
  },
  red: {
    color: 'red'
  },
  blue: {
    color: 'blue'
  },
});

export default Teams;