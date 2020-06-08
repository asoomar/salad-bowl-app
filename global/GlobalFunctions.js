import Fire from '../Fire';
import Events from '../constants/Events';
import Errors from '../constants/Errors';
import firebase from 'firebase';

export const isValidSnapshot = (snapshot, errorCode) => {
  if (!snapshot || snapshot.val() === null || snapshot.val() === undefined) {
    console.log(`Application error -- Error Code: ${errorCode}`)

    // Log error to firebase
    Fire.db.logEvent(Events.SNAPSHOT_ERROR, {
      errorCode: errorCode,
      description: Errors[errorCode]
    })
    return false
  }
  return true
}

export const getCurrentTimestamp = () => {
  return firebase.firestore.Timestamp.now();
}

export const validateGame = (game) => {
  return (!!game.timestamp && typeof game.timestamp === "number")
}

export const validateEmail = (email) => {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}