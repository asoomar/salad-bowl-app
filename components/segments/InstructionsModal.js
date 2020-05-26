import React, {Component} from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Dimensions, 
  Modal } from 'react-native';
import { 
  modalInstructionTitles, 
  modalInstructionContent 
} from '../../constants/ModalContent';
import PrimaryButton from '../../components/primitives/PrimaryButton';
import { AntDesign } from '@expo/vector-icons';
import PropTypes from 'prop-types';

class InstructionsModal extends Component {
  state = {
    page: 0,
    fontSize: Dimensions.get('screen').height/20
  }

  onClickPrevious() {
    this.setState({page: this.state.page - 1})
  }

  onClickNext() {
    this.setState({page: this.state.page + 1})
  }

  onClickClose() {
    this.props.onCloseModal()
    this.setState({page: 0})
  }

  render() {
    const totalPageCount = Object.values(modalInstructionContent).length
    const isLastPage = this.state.page + 1 === totalPageCount
    return (
    <Modal
      animationType='fade'
      presentationStyle='overFullScreen'
      visible={this.props.modalVisible}
      transparent={true}
     > 
      <View style={styles.background}>
          <View style={styles.modalBox}>
            <View style={styles.xBoxView}>
              <TouchableOpacity onPress={() => this.onClickClose()}>
                <AntDesign
                  name={`closecircle`}
                  size={Dimensions.get('screen').height/30}
                  color={'#ffffff'}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBoxBody}>
              <View style={styles.titleView}>
                <Text 
                  style={[styles.title, {fontSize: this.state.fontSize}]} 
                  adjustsFontSizeToFit
                  numberOfLines={1}
                  onTextLayout={e => {
                    const { lines } = e.nativeEvent;
                    if (lines.length > 1) {
                      this.setState({fontSize: this.state.fontSize - 1});
                    }
                  }}
                >How To Play</Text>
              </View>
              <View style={styles.content}>
                <Text style={styles.modalSubheading}>
                  {modalInstructionTitles[this.state.page]}
                </Text>
                <Text style={styles.modalContent}>
                  {modalInstructionContent[this.state.page]}
                </Text>
              </View>
              <View style={styles.buttonView}>
                <View style={styles.buttonFirst}>
                  {this.state.page === 0 
                  ? null 
                  : <PrimaryButton 
                      buttonStyle={styles.buttonStyleSecondary}
                      textStyle={styles.secondaryButtonText}
                      text="Back"
                      onPress={() => this.onClickPrevious()}
                    />
                  }
                </View>
                <View style={styles.buttonSecond}>
                  <PrimaryButton 
                    buttonStyle={isLastPage 
                      ? styles.buttonStyle 
                      : styles.buttonStyleSecondary
                    }
                    textStyle={isLastPage ? {} : styles.secondaryButtonText}
                    text={isLastPage ? "Got It!" : "Next"}
                    onPress={isLastPage
                      ? () => this.onClickClose()
                      : () => this.onClickNext()
                    }
                  />
                </View>
              </View>
            </View>
          </View>
        </View>
     </Modal>
    );
  }
}

InstructionsModal.propTypes = {
  onCloseModal: PropTypes.func.isRequired,
  modalVisible: PropTypes.bool.isRequired
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
    minHeight: Dimensions.get('screen').height * 0.7,
    maxHeight: Dimensions.get('screen').height * 0.7,
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
  },
  modalBoxBody: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: Dimensions.get('screen').width * 0.06,
    paddingBottom: Dimensions.get('screen').width * 0.04,
    paddingTop: 0,
    flex: 1,
  },
  titleView: {
    width: '100%',
    paddingBottom: 10,
  },
  title: {
    fontFamily: 'poppins-semibold',
    color: '#fff',
    textAlign: 'center',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingBottom: 15,
    flex: 1,
    minWidth: '100%',
    maxWidth: '100%',
  },
  buttonView: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  buttonFirst: {
    flex: 1,
    display: "flex",
    alignItems: "flex-start"
  },
  buttonSecond: {
    flex: 1,
    display: "flex",
    alignItems: "flex-end"
  },
  buttonStyle: {
    margin: 0,  
    minWidth: '90%', 
    maxWidth: '90%',
    height: Dimensions.get('screen').height/15,
  },
  buttonStyleSecondary: {
    margin: 0, 
    minWidth: '90%', 
    maxWidth: '90%',
    backgroundColor: '#4b42f5',
  },
  secondaryButtonText: {
    color: '#fff'
  },
  modalContent: {
    fontSize: Dimensions.get('screen').height/50,
    fontFamily: 'poppins-semibold',
    color: '#ffffffaa',
    textAlign: 'left'
  },
  modalSubheading: {
    fontSize: Dimensions.get('screen').height/40,
    fontFamily: 'poppins-semibold',
    color: '#ffffff',
    textAlign: 'left'
  },
  xBoxView: {
    display: "flex",
    alignItems: "flex-end",
    minWidth: "100%",
    maxWidth: "100%",
    paddingTop: 8,
    paddingRight: 8,
  }
});

export default InstructionsModal;