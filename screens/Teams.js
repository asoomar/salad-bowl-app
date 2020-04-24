import React, {Component} from 'react';
import { StyleSheet, Text, View, Button, TextInput } from 'react-native';
import Screens from '../constants/Screens';
import Fire from '../Fire';

class Teams extends Component {
  state = {

  }

  componentDidMount() {
    this.db = Fire.db;
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>Teams Screen</Text> 
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
});

export default Teams;