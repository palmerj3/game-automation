var getPixels = require("get-pixels");
const press = require('./util').press;
const wait = require('./util').wait;
const execSync = require('child_process').execSync;
const rimraf = require('rimraf').sync;
const mkdirp = require('mkdirp').sync;

const DEBUG = false;

// State
let state = {
  battleEngaged: false,
  lastDirection: 'RIGHT',
  tickInOperation: false,
  numBattles: 0,
  inBattle: false
};

const debugPress = (btn, times=1) => {
  if (DEBUG === true) {
    console.log(JSON.stringify(state, null, 2));
  }

  press(btn, times);
};

const normalize = (pixelArray, width, height) => {
  let start = Date.now();
  let pixelMap = {};
  let chunk = [];

  let widthCount = 1;
  let heightCount = 1;

  for (let x = 0; x < pixelArray.length; x++) {
    if (chunk.length === 4) {
      if (!pixelMap[widthCount]) {
        pixelMap[widthCount] = {};
      }

      pixelMap[widthCount][heightCount] = chunk.join(',');
      chunk = [];

      if (widthCount === width) {
        widthCount = 0;
        heightCount++;
      }

      widthCount++;
    }

    chunk.push(pixelArray[x]);
  }

  return pixelMap;
}

const roam = () => {
  state.battleEngaged = false;
  console.log('Roaming...');
  if(state.lastDirection === 'RIGHT') {
    debugPress('LEFT');
    state.lastDirection = 'LEFT';
  } else {
    debugPress('RIGHT');
    state.lastDirection = 'RIGHT';
  }
};


const battle = () => {
  console.log('Battling...');

  if (state.battleEngaged === false) {
    wait(4);
    debugPress('LEFT');
    debugPress('A');
    state.battleEngaged = true;
  }

  debugPress('A', 20);
  wait(5);
};

const fountain = () => {
  state.battleEngaged = false;

  console.log('Fountain..');
  // Wait for battle screen to clear and control to regain
  wait(3);

  press('UP');
  press('A');
  wait('6');
  press('A');
  wait(2);
  press('A');
}

const tick = () => {
  state.tickInOperation = true;

  console.log('Taking screenshot');

  try {
    execSync('adb exec-out screencap -p > screengrab.png');
  } catch (e) {
    console.log('Error capturing screenshot');
    state.tickInOperation = false;
    return;
  }

  getPixels("./screengrab.png", function(err, pixels) {
    // Copy screengrab to debug_movie
    if (DEBUG === true) {
      const now = Date.now();

      execSync(`cp screengrab.png ./debug_movie/screengrab-${now}.png`);
    }

    console.log('Analyzing screenshot');
    if(err) {
      console.log("Bad image path")
      return
    }

    const pixelData = normalize(pixels.data, pixels.shape[0], pixels.shape[1]);

    if (pixelData[194][495] === '197,181,214,255') {
      state.inBattle = true;
      // Assume we are in battle
      battle();
    } else {
      if (state.inBattle === true) {
        // Just exited a battle
        state.numBattles++;
      }

      if (state.inBattle === true && state.numBattles > 0) {
        state.numBattles = 0;
        fountain();
      } else {
        roam();
      }

      state.inBattle = false;
    }

    state.tickInOperation = false;
  });
}

// Empty debug_movie folder
if (DEBUG === true) {
  rimraf('./debug_movie');
  mkdirp('./debug_movie');
}

setInterval(() => {
  if (state.tickInOperation === false) {
    tick();
  }
}, 0);

