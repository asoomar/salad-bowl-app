#!/usr/bin/env node

const chalk = require('chalk');
const clear = require('clear');
const constants = require('./lib/constants')
const figlet = require('figlet');
const files = require('./lib/files');
const fs = require('fs');
const parser = require('./lib/parser');

// Display title and description if no args were passed
if (process.argv.length <= 2) {
  clear();
  console.log(
    chalk.yellow(
      figlet.textSync('Nyx', { horizontalLayout: 'full' })
    ) + '\n'
  );

  console.log('The Nyx CLI allows you to switch between development ' +
  'and production \nenvironments within an expo project. Some configs need to be \n' +
  'set in the app.json file itself, so instead of manually swapping credentials, ' +
  'such \nas firebase configs, you can use Nyx to do this for you.\n');

  console.log('Commands:');
  console.log('  mode : Check which mode your project is in (development/production)');
  console.log('  dev  : Switch your project to development mode');
  console.log('  prod : Switch your project to production mode');
  console.log(`  fix  : Fix your corrupted ${constants.necessaryFiles.mode} file\n\n`);

  process.exit();
}

// Ensure only one arg is passed
if (process.argv.length > 3) {
  console.log(chalk.red('You should only pass in a single argument'));
  process.exit();
}

const argument = process.argv[2];

// Ensure arg is valid
if (!constants.validArgs.includes(argument)) {
  console.log(chalk.red(`Invalid argument passed, run 'nyx' to see valid commands`));
  process.exit();
}

Object.values(constants.necessaryFiles).forEach(filepath => {
  if (!files.directoryExists(filepath)) {
    console.log(chalk.red(`Could not find ${filepath}`));
    process.exit();
  }
})

// Argument is mode
if (argument === 'mode') {
  let modeData = fs.readFileSync(constants.necessaryFiles.mode).toString();
  const mode = parser.parseMode(modeData)

  if (mode === true) {
    console.log('You are safe to start developing and testing')
    console.log('When publishing, ensure to switch to production mode')
    console.log(chalk.blue('\nYou are currently in DEVELOPMENT mode\n'))
    process.exit();

  } else if (mode === false) {
    console.log('Switch to development mode when developing')
    console.log(chalk.yellow('\nYou are currently in PRODUCTION mode\n'))
    process.exit();

  } else {
    console.log(chalk.red('Unable to determine environment mode'))
    console.log(chalk.red(`Ensure data in ${constants.necessaryFiles.mode} has not been altered\n`))
    console.log(chalk.red(`Run 'nyx fix' to possibly fix this file correctly`));
    process.exit();
  
  }
}

// Argument is dev
if (argument === 'dev') {
  let modeData = fs.readFileSync(constants.necessaryFiles.mode).toString();
  const mode = parser.parseMode(modeData)
  
  if (mode === true) {
    console.log(chalk.blue(`Already in DEVELOPMENT mode`))
    process.exit();

  } else if (mode === false) {
    console.log(`Currently in Production mode`)
    parser.switchMode(constants.necessaryFiles.devCredentials);
    parser.updateModeFile(true);
    process.exit();

  } else {
    console.log(chalk.red('Unable to determine environment mode'))
    console.log(chalk.red(`Ensure data in ${constants.necessaryFiles.mode} has not been altered\n`))
    console.log(chalk.red(`Run 'nyx fix' to possibly fix this file correctly`));
    process.exit();
  }
}

// Argument is prod
if (argument === 'prod') {
  let modeData = fs.readFileSync(constants.necessaryFiles.mode).toString();
  const mode = parser.parseMode(modeData)
  
  if (mode === false) {
    console.log(chalk.blue(`Already in PRODUCTION mode`))
    process.exit();

  } else if (mode === true) {
    console.log(`Currently in development mode`)
    parser.switchMode(constants.necessaryFiles.prodCredentials);
    parser.updateModeFile(false);
    process.exit();

  } else {
    console.log(chalk.red('Unable to determine environment mode'))
    console.log(chalk.red(`Ensure data in ${constants.necessaryFiles.mode} has not been altered\n`))
    console.log(chalk.red(`Run 'nyx fix' to possibly fix this file correctly`));
    process.exit();

  }
}

// Argument is fix
if (argument === 'fix') {
  let modeData = fs.readFileSync(constants.necessaryFiles.mode).toString();
  const mode = parser.parseMode(modeData)

  if (mode === false) {
    console.log(`You are currently in PRODUCTION mode`)
    console.log(chalk.blue(`Nothing needs to be fixed in ${constants.necessaryFiles.mode}`))
    process.exit();

  } else if (mode === true) {
    console.log(`You are currently in DEVELOPMENT mode`)
    console.log(chalk.blue(`Nothing needs to be fixed in ${constants.necessaryFiles.mode}`))
    process.exit();

  } else {
    console.log(`${constants.necessaryFiles.mode} needs to be fixed`)
    parser.fixModeFile();
    process.exit();

  }
}

