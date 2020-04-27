import React, {useState} from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import Screens from './constants/Screens';
import Home from './screens/Home';
import Create from './screens/Create';
import Join from './screens/Join';
import Lobby from './screens/Lobby';
import Teams from './screens/Teams';
import Game from './screens/Game';

//ADD CODE SO THAT ON ANY DATABASE ACCESS ERROR, EVERYTHING IS SET TO DEFAULT
//AND THE USER IS DIRECTED BACK TO THE HOME SCREEN
export default function App() {
  //Application state
  const [currentScreen, setCurrentScreen] = useState(Screens.HOME);

  //User state
  const [name, setName] = useState('');
  const [playerID, setPlayerID] = useState('');
  const [gameID, setGameID] = useState('');
  const [team, setTeam] = useState(-1);

  //CHECK TO SEE WHAT THE PLAYERID IS TO SEE IF WE SHOULD CONTINUE WITH THE LAST GAME
  return (
    <View style={styles.container}>

      {/* HOME SCREEN */}
      {currentScreen === Screens.HOME ? 
        <Home 
          changeScreen={(screen) => setCurrentScreen(screen)}
          playerID={playerID}/> 
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
          updateGameID={(id)=>setGameID(id)}
          updateName={(joinName) => setName(joinName)}
          gameID={gameID}/> 
        : null}
      
      {/* LOBBY SCREEN */}
      {currentScreen === Screens.LOBBY ? 
        <Lobby 
          changeScreen={(screen) => setCurrentScreen(screen)}
          setPlayerID={(id) => setPlayerID(id)}
          updateGameID={(id)=>setGameID(id)}
          gameID={gameID}
          playerID={playerID}
          screenName={name}/> 
        : null}

      {/* TEAMS SCREEN */}
      {currentScreen === Screens.TEAMS ? 
        <Teams
        changeScreen={(screen) => setCurrentScreen(screen)}
        setPlayerID={(id) => setPlayerID(id)}
        updateGameID={(id) => setGameID(id)}
        updateTeam={(team) => setTeam(team)}
        gameID={gameID}
        playerID={playerID}
        screenName={name}/> 
      : null}

      {/* GAME SCREEN */}
      {currentScreen === Screens.GAME ? 
        <Game
        changeScreen={(screen) => setCurrentScreen(screen)}
        gameID={gameID}
        playerID={playerID}
        screenName={name}
        team={team}/> 
      : null}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
