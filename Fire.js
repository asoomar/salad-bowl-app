import firebase from 'firebase';
import 'firebase/firestore';
import * as Analytics from 'expo-firebase-analytics'; 
import * as app from './app.json';

class Fire {
    constructor() {
        firebase.initializeApp(app.expo.web.config.firebase);
        this.observeAuth();
    }

    observeAuth = () => {
        firebase.auth().onAuthStateChanged(this.onAuthStateChanged);
    }

    onAuthStateChanged = user => {
        if (!user) {
            try {
                firebase.auth().signInAnonymously();
            } catch ({ message }) {
                console.log(message);
            }
        }
    }

    // Used for firestore
    getCollection = (collection) => {
        return firebase.firestore().collection(collection);
    }

    // Used for realtime database
    getRef = (reference) => {
        return firebase.database().ref(reference);
    }

    off() {
        this.ref.off();
    }

    async logEvent(eventName, properties) {
        await Analytics.logEvent(eventName, properties);
    }

    async logScreen(screenName) {
        await Analytics.setCurrentScreen(screenName);
    }
}

Fire.db = new Fire();
export default Fire;