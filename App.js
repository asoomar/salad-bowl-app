import React, {useState, useEffect} from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import * as Font from 'expo-font';
import { AppLoading } from 'expo';
import { useKeepAwake } from 'expo-keep-awake';
import { setTestDeviceIDAsync } from 'expo-ads-admob';
import Screens from './constants/Screens';
import Home from './screens/Home';
import Create from './screens/Create';
import Join from './screens/Join';
import Lobby from './screens/Lobby';
import Teams from './screens/Teams';
import Game from './screens/Game';
import Finish from './screens/Finish';
import Feedback from './screens/Feedback';
import Fire from './Fire';

const fetchFonts = async () => {
  await Font.loadAsync({
    'poppins-regular': require('./assets/fonts/poppins/Poppins-Regular.ttf'),
    'poppins-semibold': require('./assets/fonts/poppins/Poppins-SemiBold.ttf'),
    'poppins-extrabold': require('./assets/fonts/poppins/Poppins-ExtraBold.ttf'),
    'poppins-italic': require('./assets/fonts/poppins/Poppins-Italic.ttf'),
  });
}

export default function App() {
  useKeepAwake();
  //Application state
  const [currentScreen, setCurrentScreen] = useState(Screens.HOME);

  useEffect(() => {
    Fire.db.logScreen(currentScreen);
  }, [currentScreen]);

  //User state
  const [name, setName] = useState('');
  const [playerID, setPlayerID] = useState('');
  const [gameID, setGameID] = useState('');
  const [team, setTeam] = useState(-1);
  const [forceHomeMessage, setForceHomeMessage] = useState(null);

  const [dataLoaded, setDataLoaded] = useState(false);
  //Fetch fonts
  if (!dataLoaded) {
    return (
      <AppLoading 
        startAsync={fetchFonts} 
        onFinish={() => setDataLoaded(true)}
        onFail={() => console.log('Failed to load app assets...')}/>
    )
  }

  //CHECK TO SEE WHAT THE PLAYERID IS TO SEE IF WE SHOULD CONTINUE WITH THE LAST GAME
  return (
    <SafeAreaView style={styles.container}>

      {/* HOME SCREEN */}
      {currentScreen === Screens.HOME ? 
        <Home 
          changeScreen={(screen) => setCurrentScreen(screen)}
          setHomeMessage={(message) => setForceHomeMessage(message)}
          setPlayerID={(id) => setPlayerID(id)}
          updateName={(joinName) => setName(joinName)}
          updateGameID={(id)=>setGameID(id)}
          updateTeam={(team) => setTeam(team)}
          homeMessage={forceHomeMessage}
        /> 
        : null}
      
      {/* JOIN SCREEN */}
      {currentScreen === Screens.JOIN ? 
        <Join 
          changeScreen={(screen) => setCurrentScreen(screen)}
          updateGameID={(id)=>setGameID(id)}
          updateName={(joinName) => setName(joinName)}/> 
        : null}

      {/* CREATE SCREEN */}
      {currentScreen === Screens.CREATE ? 
        <Create 
          changeScreen={(screen) => setCurrentScreen(screen)}
          setPlayerID={(id) => setPlayerID(id)}
          updateGameID={(id)=>setGameID(id)}
          updateName={(joinName) => setName(joinName)}
          gameID={gameID}/> 
        : null}
      
      {/* LOBBY SCREEN */}
      {currentScreen === Screens.LOBBY ? 
        <Lobby 
          changeScreen={(screen) => setCurrentScreen(screen)}
          setHomeMessage={(message) => setForceHomeMessage(message)}
          setPlayerID={(id) => setPlayerID(id)}
          gameID={gameID}
          playerID={playerID}
          screenName={name}/> 
        : null}

      {/* TEAMS SCREEN */}
      {currentScreen === Screens.TEAMS ? 
        <Teams
          changeScreen={(screen) => setCurrentScreen(screen)}
          setHomeMessage={(message) => setForceHomeMessage(message)}
          updateTeam={(team) => setTeam(team)}
          currentScreen={currentScreen}
          gameID={gameID}
          playerID={playerID}
          screenName={name}/> 
        : null}

      {/* GAME SCREEN */}
      {currentScreen === Screens.GAME ? 
        <Game
          changeScreen={(screen) => setCurrentScreen(screen)}
          setHomeMessage={(message) => setForceHomeMessage(message)}
          updateTeam={(team) => setTeam(team)}
          gameID={gameID}
          playerID={playerID}
          screenName={name}
          team={team}/> 
        : null}

      {/* FINISH SCREEN */}
      {currentScreen === Screens.FINISH ? 
        <Finish
          changeScreen={(screen) => setCurrentScreen(screen)}
          setHomeMessage={(message) => setForceHomeMessage(message)}
          gameID={gameID}
          playerID={playerID}
          screenName={name}
          team={team}/> 
        : null}

      {/* FEEDBACK SCREEN */}
      {currentScreen === Screens.FEEDBACK ? 
        <Feedback
          changeScreen={(screen) => setCurrentScreen(screen)}
          homeMessage={forceHomeMessage}
        /> 
        : null}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4b42f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
