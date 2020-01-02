const press = require('./util.js').press;

// Setup somewhere in the field where you are safe and relatively overpowered

// Loop through moving one block then pressing A 20 times

while(true) {
  press('LEFT');
  press('A', 10);
  press('RIGHT');
  press('A', 10);
}
