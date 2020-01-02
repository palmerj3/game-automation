const execSync = require('child_process').execSync;

// adb shell sendevent /dev/input/event8 1 301 1

// Map strings to adb commands for easier readability
const MAPPING = {
  'UP': [
    '292',
    '292'
  ],
  'DOWN': [
    '294',
    '294'
  ],
  'RIGHT': [
    '293',
    '293'
  ],
  'LEFT': [
    '295',
    '295'
  ],
  'A': [
    '301',
    '301'
  ],
  'B': [
    '302',
    '302'
  ],
  'X': [
    '300',
    '300'
  ],
  'SELECT': [
    '288',
    '288'
  ],
  'TESTING': [
    '302',
    '302'
  ]
};

// Unknown 289, 290, 291, 296, 297, 298, 299

// Command decorators - run these after every command
const DECORATORS = [
  'SYN_MT_REPORT 0',
  'SYN_REPORT 0'
];

const press = (btn, times=1) => {
  const command = MAPPING[btn];

  // Each button press we will call a command block
  // Needs to press down, report, press up, report then delay next input

  const commands = [
    `adb shell sendevent /dev/input/event8 1 ${command} 1`,  // Press down
    `adb shell sendevent /dev/input/event8 1 SYN_MT_REPORT 0`, // Report
    `adb shell sendevent /dev/input/event8 1 SYN_REPORT 0`, // Report
    `adb shell sendevent /dev/input/event8 1 ${command} 0`,  // Press up
    `adb shell sendevent /dev/input/event8 1 SYN_MT_REPORT 0`, // Report
    `adb shell sendevent /dev/input/event8 1 SYN_REPORT 0`, // Report
    'sleep 0.3'
  ];

  for (let x = 0; x < times; x++) {
    const c = commands.join(';');
    console.log(`Pressing ${btn}`);

    try {
      execSync(c);
    } catch (e) {
      console.log('Error pressing ', btn);
    }
  };
};

const wait = (s) => {
  console.log(`Waiting ${s} seconds`);
  execSync(`sleep ${s}`);
}

module.exports = {
  press,
  wait
}
