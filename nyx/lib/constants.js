const files = require('./files');

module.exports = {
  validArgs: [
    'mode',
    'dev',
    'prod',
    'fix'
  ],

  necessaryFiles: {
    mode: files.getCurrentDirectory() + '/constants/Mode.js',
    app: files.getCurrentDirectory() + '/app.json',
    prodPlist: files.getCurrentDirectory() + '/resources/GoogleService-Info.plist',
    devPlist: files.getCurrentDirectory() + '/resources/dev/GoogleService-Info.plist',
    prodCredentials: files.getCurrentDirectory() + '/credentials/prod.json',
    devCredentials: files.getCurrentDirectory() + '/credentials/dev.json',
  },

  modeFileTrue: '/*\n' +
    'This is an auto-generated file, be cautious when making changes\n' +
    'This file should only have one line of code\n' +
    '*/\n' +
    'export const DEV = true',

  modeFileFalse: '/*\n' +
    'This is an auto-generated file, be cautious when making changes\n' +
    'This file should only have one line of code\n' +
    '*/\n' +
    'export const DEV = false'
}