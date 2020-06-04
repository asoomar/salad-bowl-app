import React, {Component} from 'react';
import { StyleSheet, Dimensions, View, Text } from 'react-native';
import LottieView from 'lottie-react-native';
import PropTypes from 'prop-types';



class LoadingPage extends Component {
  componentDidMount() {
    this.initAnimation();
  }

  initAnimation(){
    if (!this.animation){
      setTimeout(() => {
        this.initAnimation();
      }, 100);
    } else {
        this.animation.play();
    }
  }

  render() {
    const renderedComponent = !this.props.isLoading
    ? this.props.children
    : 
    <View style={styles.mainView}>
      <Text style={styles.text}>{this.props.loadingText}</Text>
      <LottieView 
        ref={animation => {this.animation = animation;}}
        autoplay={true}
        loop={true}
        style={styles.loader}
        speed={2}
        source={require('../../assets/animations/whiteLoader.json')} 
      />
    </View>;
    return (renderedComponent)
  }
}

LoadingPage.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  loadingText: PropTypes.string.isRequired,
}

const styles = StyleSheet.create({
  mainView: {
    height: Dimensions.get('screen').height, 
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#ffffff',
    fontFamily: 'poppins-semibold',
    fontSize: Dimensions.get('screen').height/30,
  },
  loader: {
    width: Dimensions.get('screen').width/3,
    height: Dimensions.get('screen').width/3,
    backgroundColor: '#4b42f5',
  }
});

export default LoadingPage;
