import React, {Component} from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Screens from '../constants/Screens';
import Events from '../constants/Events';
import Fire from '../Fire';
import PrimaryButton from '../components/primitives/PrimaryButton';
import LoadingPage from '../components/primitives/LoadingPage';
import { isValidSnapshot} from '../global/GlobalFunctions';
import { giveFeedbackContent, errorContent } from '../constants/Content';
import { messageValue } from '../constants/FirestoreValues';
import { AdMobInterstitial } from 'expo-ads-admob';
import Ads from '../constants/Ads';
import { reduce } from 'lodash';

class Finish extends Component {
  state = {
    team1Score: null,
    team2Score: null,
    isAdLoaded: false,
    bypassAd: false,
  }

  async componentDidMount() {
    this.db = Fire.db;

    this.db.getRef(`games/${this.props.gameID}/score`).once('value', (snapshot) => {
      if (!isValidSnapshot(snapshot, 9)) {
        this.props.setHomeMessage(errorContent(9))
        this.props.changeScreen(Screens.HOME);
        return
      }
      let scores = Object.entries(snapshot.val());
      let team1Pts = 0;
      let team2Pts = 0;
      for (let i = 0; i < scores.length; i++) {
        if (scores[i][0] === 'team1') {
          team1Pts = scores[i][1]
        } else if (scores[i][0] === 'team2') {
          team2Pts = scores[i][1]
        }
      }
      this.setState({team1Score: team1Pts, team2Score: team2Pts});
    });

    // Don't show ads for now
    if (false) {
      if (await AdMobInterstitial.getIsReadyAsync()) {
        this.setState({isAdLoaded: true})
      } else {
        AdMobInterstitial.setAdUnitID(Ads.FinishGoHome.id.ios)
        AdMobInterstitial.requestAdAsync();
      }
      AdMobInterstitial.addEventListener('interstitialDidLoad', () => {
        console.log('Finish Game Ad Loaded')
        this.setState({isAdLoaded: true})
      });
      AdMobInterstitial.addEventListener('interstitialDidFailToLoad', () => {
        console.log('Finish Game Ad Failed to Load')
        this.setState({bypassAd: true})
      });
      AdMobInterstitial.addEventListener('interstitialDidClose', () => {
        console.log('Finish Game Ad Closed')
        this.props.setHomeMessage(giveFeedbackContent);
        this.props.changeScreen(Screens.HOME);
      });
    }

  }

  componentWillUnmount() {
    this.setState({
      team1Score: null,
      team2Score: null,
      isAdLoaded: false,
      bypassAd: false
    }) 
    // Don't show ads for now
    if (false) {
      AdMobInterstitial.removeEventListener('interstitialDidLoad');
      AdMobInterstitial.removeEventListener('interstitialDidFailToLoad');
      AdMobInterstitial.removeEventListener('interstitialDidClose');
    }   
  }

  // Delete the game we just left
  deleteGame() {
    this.db.getRef(`games/${this.props.gameID}`).remove()
    .then(()=> {
      console.log(`Game (${this.props.gameID}) was deleted`);
    })
    .catch((error) => 'Game deletion failed: ' + error.message);  
  }

  // Delete words that are for the current game
  deleteGameWords() {
    this.db.getRef(`words/${this.props.gameID}`).remove()
    .then(()=> {
      console.log(`Words for game (${this.props.gameID}) were deleted`);
    })
    .catch((error) => 'Words deletion failed: ' + error.message); 
  }

  // Check if we were the last person to leave the game
  checkIfLastToLeave() {
    this.db.getRef(`players`).orderByKey().equalTo(this.props.gameID).once('value', (snapshot) => {
      if (snapshot.val() == null) {
        console.log(`${this.props.screenName} WAS the last player to leave`);
        this.deleteGame();
        this.deleteGameWords();
      }
    }); 
  }

  async didSignUp(promotionId) {
    try {
      // Uncomment line below to reset async storage
      // await AsyncStorage.clear()
      const value = await AsyncStorage.getItem(promotionId)
      return value === "true"
    } catch {
      return false
    }
  }

  async goHome() {
    this.db.logEvent(Events.GO_HOME, {
      screen: 'finish',
      purpose: 'Game ended and user clicked to go home',
    })
    this.db.getRef(`players/${this.props.gameID}/${this.props.playerID}`).remove()
    .then(()=> {
      console.log(`${this.props.playerID} (${this.props.screenName}) left game`);
      this.checkIfLastToLeave();
    })
    .catch((error) => 'Failed to leave game: ' + error.message)
    // Don't show ads for now
    if (false) {
      AdMobInterstitial.showAdAsync()
    } else {
      const ref = this.db.getCollection(messageValue).doc('gameFinish')
      const snapshot = await ref.get()
      const data = snapshot.data()
      if (data.promotion && data.promotion.enable && !(await this.didSignUp(data.promotion.promotionId))) {
        this.props.setHomeMessage({
          title: data.promotion.title,
          content: data.promotion.message,
          askEmail: data.promotion.askEmail,
          id: data.promotion.promotionId
        });
      } else {
        this.props.setHomeMessage(giveFeedbackContent);
      }
      this.props.changeScreen(Screens.HOME);
    }
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

    const team1Style = this.props.team === 0 ? null : styles.opposing
    const team2Style = this.props.team === 1 ? null : styles.opposing

    return (
      <LoadingPage
        loadingText={"Wrapping Up Game..."}
        isLoading={loading}>
        <View style={styles.container}>
          <View style={styles.body}>
            <Text style={styles.message}>{message}</Text> 
            <View style={styles.score}>
              <View style={styles.teamScore}>
                <Text style={[styles.points, team1Style]}>{team1Score}</Text>
                <Text style={[styles.team, team1Style]}>Team 1</Text> 
              </View>
              <View style={styles.teamScore}>
                <Text style={[styles.points, team2Style]}>{team2Score}</Text>
                <Text style={[styles.team, team2Style]}>Team 2</Text>
              </View>
            </View>
          </View>
          <View style={styles.footer}>
            <PrimaryButton 
              text="Go Home" 
              onPress={() => this.goHome()}
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
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 6,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    fontSize: Dimensions.get('screen').height/25,
    fontFamily: 'poppins-semibold',
    color: '#fff',
    textAlign: 'center'
  },
  score: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    minWidth: '100%',
    paddingTop: 20,
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
  footer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    minWidth: '100%',
  }
});

export default Finish;