import React, {Component} from 'react';
import { 
  StyleSheet, 
  Text, 
  View,  
  Dimensions, 
  Keyboard,
  TouchableOpacity,
  TouchableWithoutFeedback} from 'react-native';
import PrimaryModal from '../components/primitives/PrimaryModal';  
import PrimaryTextInput from '../components/primitives/PrimaryTextInput';
import PrimaryButton from '../components/primitives/PrimaryButton';
import BackButton from '../components/primitives/BackButton';
import Screens from '../constants/Screens';
import Events from '../constants/Events';
import Fire from '../Fire';
import { feedbackValue } from '../constants/FirestoreValues';
import { validateEmail, getCurrentTimestamp } from '../global/GlobalFunctions';
import { feedbackModalTitles, feedbackModalContent } from '../constants/ModalContent';

class Feedback extends Component {
  state = {
    email: '',
    feedback: '',
    error: '',
    showModal: true,
    modalText: feedbackModalContent.FEEDBACK,
    modalTitle: feedbackModalTitles.FEEDBACK,
    modalStyle: styles.modalContentCenter
  }

  componentDidMount() {
    this.db = Fire.db;
    this.setState({
      showModal: true,
      modalText: feedbackModalContent.FEEDBACK,
      modalTitle: feedbackModalTitles.FEEDBACK,
      modalStyle: styles.modalContentCenter
    })
  }

  componentWillUnmount() {
    this.setState({
      email: '',
      feedback: '',
      error: '',
      showModal: true,
      modalText: feedbackModalContent.FEEDBACK,
      modalTitle: feedbackModalTitles.FEEDBACK,
      modalStyle: styles.modalContent
    })
  }

  closeModal() {
    this.setState({showModal: false})
    if (this.state.modalTitle === feedbackModalTitles.SUCCESS) {
      this.props.changeScreen(Screens.HOME);
    }
  }

  pressSubmit() {
    if (!validateEmail(this.state.email)) {
      this.setState({error: "Email is invalid"})
    } else if (this.state.feedback.trim().length === 0) {
      this.setState({error: "Feedback should be filled"})
    } else {
      console.log('Submission is valid');
      this.db.getCollection(feedbackValue).add({
        email: this.state.email,
        message: this.state.feedback,
        timeStamp: getCurrentTimestamp(),
      }).then(() => {
        console.log('Feedback Submitted')
        this.setState({
          showModal: true,
          modalText: feedbackModalContent.SUCCESS,
          modalTitle: feedbackModalTitles.SUCCESS,
          modalStyle: styles.modalContentCenter
        })
      })
      .catch(err => {
        console.log(err)
        this.setState({
          showModal: true,
          modalText: feedbackModalContent.FAIL,
          modalTitle: feedbackModalTitles.FAIL,
          modalStyle: styles.modalContentCenter
        })
      })
    }
  }

  render() {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
          <PrimaryModal 
            onCloseModal={() => this.closeModal()}
            modalVisible={this.state.showModal}
            title={this.state.modalTitle}
            buttonText="Okay"
            minHeight={Dimensions.get('screen').height/10}
            content={
              <Text style={this.state.modalStyle}>
                {this.state.modalText}
              </Text>
            }
          />
          <View style={styles.mainView}>
            <Text style={styles.title}>Feedback</Text>
            <View style={styles.errorBox}>
              <Text style={styles.error}>{this.state.error}</Text>
            </View>
            <PrimaryTextInput 
              autoCorrect={false}
              marginBottom={10}
              onChangeText={text=>this.setState({email: text})}
              placeholder={'Email'}
              style={styles.emailInput}
              value={this.state.email}
            />
            <PrimaryTextInput 
              autoCorrect={false}
              multiline={true}
              onChangeText={text=>this.setState({feedback: text})}
              placeholder={'Feedback'}
              style={styles.feedbackInput}
              value={this.state.feedback}
            />
            <PrimaryButton
              text={'Submit'}
              onPress={()=>this.pressSubmit()}
              disabled={this.state.disableButton}
            />
            <TouchableOpacity 
              style={styles.questionTag}
              onPress={() => this.setState({
                showModal: true,
                modalText: feedbackModalContent.HELP,
                modalTitle: feedbackModalTitles.HELP,
                modalStyle: styles.modalContent
              })}
            > 
              <Text style={styles.questionTagText}>Need Help?</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.backButtonView}>
            <BackButton 
              onPress={()=> {
                this.db.logEvent(Events.BACK_BUTTON, {
                  screen: 'feedback',
                  purpose: 'User on create page clicked to go back to lobby'
                })
                this.props.changeScreen(Screens.HOME)
              }}
              margin={Dimensions.get('screen').width/15}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  }
}
  
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainView: {
    flex: 3,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  title: {
    fontSize: Dimensions.get('screen').height/20,
    fontFamily: 'poppins-semibold',
    color: '#fff',
    marginBottom: 10,
  },
  backButtonView: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  errorBox: {
    minHeight: Dimensions.get('screen').height/15,
    maxHeight: Dimensions.get('screen').height/15,
    minWidth: '85%',
    maxWidth: '85%',
  },
  error: {
    fontSize: Dimensions.get('screen').height/50,
    fontFamily: 'poppins-semibold',
    color: '#fff',
    textAlign: 'center'
  },
  questionTag: {
    marginTop: 15,
    paddingLeft: Dimensions.get('screen').width/15,
    paddingRight: Dimensions.get('screen').width/15,
    minWidth: '85%',
    maxWidth: '85%',
  },
  questionTagText: {
    fontSize: Dimensions.get('screen').height/50,
    fontFamily: 'poppins-semibold',
    color: '#ffffff66',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  modalContent: {
    fontSize: Dimensions.get('screen').height/50,
    fontFamily: 'poppins-semibold',
    color: '#ffffffaa',
    textAlign: 'left'
  },
  emailInput: {
    height: Dimensions.get('screen').height/20,
    fontSize: Dimensions.get('screen').height/50,
    paddingLeft: Dimensions.get('screen').width/20,
    paddingRight: Dimensions.get('screen').width/20,
    textAlign: 'left'
  },
  feedbackInput: {
    height: Dimensions.get('screen').height/5,
    fontSize: Dimensions.get('screen').height/50,
    paddingLeft: Dimensions.get('screen').width/24,
    paddingRight: Dimensions.get('screen').width/24,
    paddingTop: Dimensions.get('screen').width/34,
    paddingBottom: Dimensions.get('screen').width/34,
    borderRadius: Dimensions.get('screen').width/20,
    textAlign: 'left',
    textAlignVertical: 'top',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  modalContent: {
    fontSize: Dimensions.get('screen').height/50,
    fontFamily: 'poppins-semibold',
    color: '#ffffffaa',
    textAlign: 'left'
  },
  modalContentCenter: {
    fontSize: Dimensions.get('screen').height/50,
    fontFamily: 'poppins-semibold',
    color: '#ffffffaa',
    textAlign: 'center'
  },
});

export default Feedback;