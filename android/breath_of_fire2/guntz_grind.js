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
  wait(10);
};

const visitInn = () => {
  battleEngaged = false;

  console.log('Visiting inn..');
  // Wait for battle screen to clear and control to regain
  wait(3);

  if (lastDirection === 'LEFT') {
    press('RIGHT');
    lastDirection = 'RIGHT';
  }

  press('UP');
  wait(5);
  press('UP', 4);
  press('LEFT');
  press('UP', 5);
  press('LEFT', 8);
  press('UP');
  wait(5);
  press('UP', 3);
  press('RIGHT', 2);
  press('UP');
  press('A');
  wait(3);
  press('A');
  wait(3);
  press('A');
  wait(10);
  press('LEFT', 2);
  press('DOWN', 4);
  wait(3);
  press('RIGHT', 8);
  press('DOWN', 10);
  wait(5);


  lastDirection = 'RIGHT';
}

const tick = () => {
  tickInOperation = true;

  console.log('Taking screenshot');
  execSync('adb exec-out screencap -p > screengrab.png');

  getPixels("./screengrab.png", function(err, pixels) {
    console.log('Analyzing screenshot');
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

