import React, {Component} from 'react';
import { StyleSheet, Text, View, Button, TextInput } from 'react-native';
import Screens from '../constants/Screens';
import Fire from '../Fire';

class Finish extends Component {
  state = {
    team1Score: null,
    team2Score: null
  }

  componentDidMount() {
    this.db = Fire.db;

    this.db.getRef(`games/${this.props.gameID}/score`).once('value', (snapshot) => {
      let scores = Object.entries(snapshot.val());
      let team1Pts = 0;
      let team2Pts = 0;
      console.log(scores);
      for (let i = 0; i < scores.length; i++) {
        if (scores[i][0] === 'team1') {
          team1Pts = scores[i][1]
        } else if (scores[i][0] === 'team2') {
          team2Pts = scores[i][1]
        }
      }
      this.setState({team1Score: team1Pts, team2Score: team2Pts});
    });

  }

  goHome() {
    this.db.getRef(`players/${this.props.gameID}/${this.props.playerID}`).remove()
    .then(()=> {
      console.log(`${this.props.playerID} (${this.props.screenName}) left game`);
    })
    .catch((error) => 'Failed to leave game: ' + error.message)
    this.props.changeScreen(Screens.HOME);
  }

  render() {
    const { team1Score, team2Score } = this.state;

    let loading = false;
    if (team1Score === null || team2Score === null) {
      loading = true;
    }

    let message = "It's a Tie!";
    if ((this.props.team === 0 && team1Score > team2Score) ||
     (this.props.team === 1 && team2Score > team1Score)) {
      message = "Your Team Won!"
    } else if ((this.props.team === 0 && team1Score < team2Score) ||
    (this.props.team === 1 && team2Score < team1Score)) {
      message = "Your Team Lost!"
    }

    return (
      <View style={styles.container}>
        {loading ? <Text> Loading... </Text> : 
          <>
            <Text style={styles.heading}>{message}</Text> 
            <Text style={[styles.heading, styles.blue]}>Team 1</Text> 
            <Text> {team1Score} </Text> 
            <Text style={[styles.heading, styles.red]}>Team 2</Text> 
            <Text> {team2Score} </Text> 
            <Button title="Go Home" onPress={()=>this.goHome()}/> 
          </>
        }
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

export default Finish;