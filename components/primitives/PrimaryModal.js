import React, {Component} from 'react';
import { StyleSheet, Text, View, Dimensions, Modal } from 'react-native';
import PrimaryButton from './PrimaryButton';
import PropTypes from 'prop-types';

class PrimaryModal extends Component {

  render() {
    return (
      <Modal
        animationType='fade'
        presentationStyle='overFullScreen'
        visible={this.props.modalVisible}
        transparent={true}
      > 
        <View style={styles.background}>
          <View style={styles.modalBox}>
            <View style={styles.titleView}>
              <Text style={styles.title}>{this.props.title}</Text>
            </View>
            <View style={styles.content}>
              {this.props.content}
            </View>
            <View style={styles.buttonView}>
              <PrimaryButton 
                text={this.props.buttonText}
                onPress={() => this.props.onCloseModal()}
              />
            </View>
          </View>
        </View>
      </Modal>
    );
  }
}

PrimaryModal.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  content: PropTypes.element.isRequired,
  modalVisible: PropTypes.bool.isRequired,
  buttonText: PropTypes.string.isRequired,
  onCloseModal: PropTypes.func.isRequired,
}
  
const styles = StyleSheet.create({
  background: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '100%',
    maxWidth: '100%',
    backgroundColor: '#000000aa',
  },
  modalBox: {
    backgroundColor: '#4b42f5',
    // backgroundColor: '#fff',
    // borderColor: '#4b42f5',
    // borderWidth: 3,
    minHeight: Dimensions.get('screen').height * 0.8,
    maxHeight: Dimensions.get('screen').height * 0.8,
    minWidth: '90%',
    maxWidth: '90%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.4,
    shadowRadius: 3.84,
    elevation: 5,
    borderRadius: Dimensions.get('screen').width * 0.04,
    padding: Dimensions.get('screen').width * 0.06
  },
  titleView: {
    flex: 2,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: Dimensions.get('screen').height/20,
    fontFamily: 'poppins-semibold',
    color: '#fff',
    // color: '#4b42f5',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 5,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  buttonView: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center'
  }
});

export default PrimaryModal;