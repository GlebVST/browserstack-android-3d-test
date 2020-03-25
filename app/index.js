const argv = require('./argv');
const path = require('path');
const ip = require('ip');
const fs = require('fs');
const { remote } = require('webdriverio');
const sync = require('@wdio/sync').default;
const Browserstack = require('browserstack-local');
require('dotenv').config();

const targetPlatform = argv.platform || process.env.TARGET_PLATFORM || 'android9';
const browserStackOpts = {
  user: process.env.BROWSERSTACK_USERNAME,
  key: process.env.BROWSERSTACK_ACCESS_KEY,
  runner: true,
  outputDir: __dirname,
  browserstackLocal: true,
  browserstackLocalForcedStop: true,
  logLevel: 'debug',
};
const capabilities = {
  android10: {
    name: 'model-render',
    build: targetPlatform,
    device: 'OnePlus 7T',
    os_version: '10.0',
    browser: 'chrome',
    'browserstack.local': true,
    'browserstack.debug': true,
    'browserstack.console': 'verbose',
    'browserstack.networkLogs': true,
    'browserstack.appium_version': '1.15.0',
    'browserstack.appStoreConfiguration': {
      "username" : process.env.GOOGLE_PLAY_USERNAME,
      "password" : process.env.GOOGLE_PLAY_PASSWORD
    }
  },
  android9: {
    name: 'model-render',
    build: targetPlatform,

    // these devices frequently fail to open Scene View due to google play issues
    // device: 'Samsung Galaxy S10',
    // device: 'Google Pixel 3',
    device: 'Google Pixel 3a XL',
    os_version: '9.0',
    browser: 'chrome',
    'browserstack.local': true,
    'browserstack.debug': true,
    'browserstack.console': 'verbose',
    'browserstack.networkLogs': true,
    'browserstack.appium_version': '1.16.0',
    // 'browserstack.appStoreConfiguration': {
    //   "username" : process.env.GOOGLE_PLAY_USERNAME,
    //   "password" : process.env.GOOGLE_PLAY_PASSWORD
    // }
  }
};

function takeModelScreenshot() {
  const url = `http://${ip.address()}:3001/android.html`;
  console.log(`Rendering model via ${url}`);
  browser.url(url);


  browser.switchContext("NATIVE_APP");
  // click "Launch" html anchor to trigger android intent for SceneView
  browser.touchAction({
    action: 'tap',
    x: 50,
    y: 280
  });

  // allow some time for model to load
  browser.pause(10000);

  const screenshot = path.resolve(__dirname, '../screenshots', `${targetPlatform}-${new Date().getTime()}.png`);
  browser.saveScreenshot(screenshot);

  //close scene view
  browser.touchPerform([
    {
      action: 'press',
      options: { x: 50, y:140 },
    },{
      action: 'wait',
      options: { ms: 1000 },
    },
    {
      action: 'release',
    }
  ]);
  browser.switchContext("CHROMIUM");
  console.log('Saved screenshot: ', screenshot);
};

let browserstackLocal;
const tunnelStart = () => {
  const opts = {
    key: browserStackOpts.key,
    forcelocal: true,
  };
  return new Promise((resolve, reject) => {
    browserstackLocal = new Browserstack.Local();
    browserstackLocal.start(opts, err => {
      if (err && err.message !== 'Either another browserstack local client is running on your machine or some server is listening on port 45691') {
        return reject(err);
      }
      resolve();
    });
  })
};

const tunnelStop = () => {
  if (!browserstackLocal || !browserstackLocal.isRunning()) {
    return Promise.resolve();
  }
  if (browserStackOpts.browserstackLocalForcedStop) {
    return Promise.resolve(process.kill(browserstackLocal.pid));
  }
  return new Promise((resolve, reject) => {
    browserstackLocal.stop(err => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
};

async function run() {
  await tunnelStart();
  global.browser = await remote({ ...browserStackOpts, capabilities: capabilities[targetPlatform] });
  console.log('Connected to Browserstack...');

  await sync(() => {
    takeModelScreenshot();
    browser.deleteSession();
    console.log('Done');
  });

  await tunnelStop();
}

run().catch((err) => {
    console.log(err);
});
