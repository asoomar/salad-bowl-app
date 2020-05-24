const chalk = require('chalk');
const constants = require('./constants');
const fs = require('fs');

module.exports = {
  // Returns if Mode.js shows DEV mode or not
  parseMode: (modeData) => {
    const words = modeData.split(' ');
    if (words[words.length - 1] === 'true') return true
    else if (words[words.length - 1] === 'false') return false
    else return null
  },

  // Swaps app.json credentials (iOS google-plist, firebase configs)
  switchMode: (pathToCredentials) => {
    let keyword = 'undefined'
    if (pathToCredentials === constants.necessaryFiles.devCredentials) {
      keyword = 'development'
    } else if (pathToCredentials === constants.necessaryFiles.prodCredentials) {
      keyword = 'production'
    }
  
    console.log(`Switching to ${keyword} mode...`);
    let newCredentials = JSON.parse(fs.readFileSync(pathToCredentials));
    let appObject = JSON.parse(fs.readFileSync(constants.necessaryFiles.app));

    appObject.expo.ios.googleServicesFile = newCredentials.googleServicesFile;
    appObject.expo.web.config.firebase = newCredentials.firebase;
    let appData = JSON.stringify(appObject, null, 2);

    fs.writeFileSync(constants.necessaryFiles.app, appData);
    console.log(chalk.green(`Successfully switched to ${keyword.toUpperCase()} mode`));
  },

  // Sets the DEV boolean value in Mode.js
  updateModeFile: (updateBool) => {
    let modeData = fs.readFileSync(constants.necessaryFiles.mode).toString();
    if (updateBool) modeData = modeData.replace('false', 'true');
    else modeData = modeData.replace('true', 'false');
    fs.writeFileSync(constants.necessaryFiles.mode, modeData);
  },

  // Fixes Mode.js file
  fixModeFile: () => {
    console.log('Checking app.json to see what mode project should be in...')

    const prodCredentials = JSON.parse(fs.readFileSync(constants.necessaryFiles.prodCredentials));
    const devCredentials = JSON.parse(fs.readFileSync(constants.necessaryFiles.devCredentials));
    const appObject = JSON.parse(fs.readFileSync(constants.necessaryFiles.app));
    let isDev = null

    let modeData = constants.modeFileFalse;
    if (appObject.expo.web.config.firebase.apiKey === prodCredentials.firebase.apiKey) {
      isDev = false

    } else if (appObject.expo.web.config.firebase.apiKey === devCredentials.firebase.apiKey) {
      isDev = true
      modeData = constants.modeFileTrue;

    }

    if (isDev === true) {
      console.log(`app.json indicates project should be in DEVELOPMENT mode.`);
      console.log(chalk.green(`Successfully updated ${constants.necessaryFiles.mode} to DEVELOPMENT mode`));
    } else if (isDev === false) {
      console.log(`app.json indicates project should be in PRODUCTION mode.`);
      console.log(chalk.green(`Successfully updated ${constants.necessaryFiles.mode} to PRODUCTION mode`));
    } else {
      console.log(chalk.yellow(`Could not detect mode from app.json`));
      console.log(chalk.yellow(`${constants.necessaryFiles.mode} was set to PRODUCTION mode`));
      console.log(chalk.yellow(`Double check configs in app.json to ensure it is in sync with Mode.js`));
    }
    fs.writeFileSync(constants.necessaryFiles.mode, modeData);
  }

}