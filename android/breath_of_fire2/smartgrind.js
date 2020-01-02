var getPixels = require("get-pixels");
const press = require('./util').press;
const wait = require('./util').wait;
const execSync = require('child_process').execSync;

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

// State
let battleEngaged = false;
let lastDirection = 'RIGHT';
let tickInOperation = false;
let numBattles = 0;
let inBattle = false;

const roam = () => {
  battleEngaged = false;
  console.log('Roaming...');
  if(lastDirection === 'RIGHT') {
    press('LEFT');
    lastDirection = 'LEFT';
  } else {
    press('RIGHT');
    lastDirection = 'RIGHT';
  }
};


const battle = () => {
  console.log('Battling...');

  if (battleEngaged === false) {
    wait(4);
    press('LEFT');
    press('A');
    battleEngaged = true;
  }

  press('A', 10);
  wait(4);
};

const visitInn = () => {
  battleEngaged = false;

  console.log('Visiting inn..');
  // Wait for battle screen to clear and control to regain
  wait(3);
  press('UP');
  wait(2);
  press('UP');
  press('UP');
  press('RIGHT', lastDirection === 'LEFT' ? 2 : 1);
  press('UP');
  wait(2);
  press('UP');
  press('UP');
  press('UP');
  press('UP');
  press('A');
  wait(2);
  press('A');
  wait(2);
  press('A');
  wait(10);
  press('A');
  press('DOWN');
  press('DOWN');
  press('DOWN');
  press('DOWN');
  press('DOWN');
  wait(3);
  press('LEFT');
  press('DOWN');
  press('DOWN');
  press('DOWN');
  press('DOWN');
  press('DOWN');
  wait(5);
  lastDirection = 'RIGHT';
}

const tick = () => {
  console.log('Fucking hello');
  tickInOperation = true;

  execSync('adb exec-out screencap -p > screengrab.png');

  getPixels("./screengrab.png", function(err, pixels) {
    if(err) {
      console.log("Bad image path")
      return
    }

    const pixelData = normalize(pixels.data, pixels.shape[0], pixels.shape[1]);

    if (pixelData[194][495] === '197,181,214,255') {
      inBattle = true;
      // Assume we are in battle
      battle();
    } else {
      if (inBattle === true) {
        // Just exited a battle
        numBattles++;
      }

      if (inBattle === true && numBattles > 1) {
        numBattles = 0;
        visitInn();
      } else {
        roam();
      }

      inBattle = false;
    }

    tickInOperation = false;
  });
}

setInterval(() => {
  if (tickInOperation === false) {
    tick();
  }
}, 0);

