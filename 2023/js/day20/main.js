import fs from "fs";

const inputPath = "./day20/example-input";

const MODULE_TYPES = {
  BROADCASTER: "b",
  FLIP_FLOP: "%",
  CONJUNCTION: "&",
};

const PULSES = {
  HIGH: 1,
  LOW: 0,
};

export function partOne(input = null) {
  var input = input || inputPath + "2";
  input = fs.readFileSync(input, "utf8");
  const modulesByKey = parseInput(input);

  let pulses = { [PULSES.HIGH]: 0, [PULSES.LOW]: 0 };

  const queue = [];

  let presses = 0;
  while (presses < 1000) {
    // This is cyclic, so we don't need to do this 1000 times. Instead, find when it repeats and look at the modulo again
    // Start the queue with a button press each cycle
    presses++;
    queue.push({ type: PULSES.LOW, destinationKey: "broadcaster", fromKey: null });
    while (queue.length) {
      let next = queue.shift();
      sendPulse(next.type, next.destinationKey, next.fromKey);
    }

    if (isBackToOriginal()) {
      break;
    }
  }

  // Divide and modulo
  let cycles = Math.floor(1000 / presses);
  let remainder = 1000 % presses;
  // We were back to the beginning early, so we can simply multiple the counts and then add
  pulses[PULSES.HIGH] = pulses[PULSES.HIGH] * cycles;
  pulses[PULSES.LOW] = pulses[PULSES.LOW] * cycles;

  // Then finish off with any manual button presses
  while (remainder > 0) {
    queue.push({ type: PULSES.LOW, destinationKey: "broadcaster", fromKey: null });
    while (queue.length) {
      let next = queue.shift();
      sendPulse(next.type, next.destinationKey, next.fromKey);
    }
    remainder--;
  }

  let result = Object.values(pulses).reduce((a, b) => a * b, 1);

  console.log({ day: 20, part: 1, value: result });

  // Now start the cycle by pressing the button, which sends a LOW PULSE to broadcast

  function isBackToOriginal() {
    // Back to original if all '%' modules have state 1 AND if all '&' type modules have each of their memory states as 0
    for (const key in modulesByKey) {
      let mod = modulesByKey[key];
      if (mod.type === MODULE_TYPES.FLIP_FLOP && mod.state) {
        return false;
      }
      if (mod.type === MODULE_TYPES.CONJUNCTION && Object.values(mod.memory).some((v) => v === 1)) {
        return false;
      }
    }
    return true;
  }

  function sendPulse(pulseType, destinationKey, inputKey) {
    pulses[pulseType]++;
    // Bunch of if statements to handle each one.
    const module = modulesByKey[destinationKey];

    if (!module) {
      return; // Untyped module, skip?
    }

    if (module.type === MODULE_TYPES.BROADCASTER) {
      // Send to all children by adding them to the queue in order
      addToQueue(pulseType, module.outputs, destinationKey);
    } else if (module.type === MODULE_TYPES.FLIP_FLOP) {
      // Flip-flop modules we only really care about low pulse being recieved
      if (pulseType === PULSES.LOW) {
        // If currently on, turn off and send low pulse
        if (module.state) {
          module.state = 0;
          addToQueue(PULSES.LOW, module.outputs, destinationKey);
        } else {
          // If off, turn on and send high pulse
          module.state = 1;
          addToQueue(PULSES.HIGH, module.outputs, destinationKey);
        }
      }
    } else if (module.type === MODULE_TYPES.CONJUNCTION) {
      // Conjunction modules (prefix &) remember the type of the most recent pulse received from each of their connected input modules;
      // they initially default to remembering a low pulse for each input. When a pulse is received, the conjunction module first updates
      // its memory for that input. Then, if it remembers high pulses for all inputs, it sends a low pulse; otherwise, it sends a high
      // pulse.

      // If null, then we use defaults of low for each input.
      // First time we see this node, determine inputs and set up the memory
      if (module.memory === null) {
        module.memory = {};
        // First build input module if doesnt exist
        for (const key in modulesByKey) {
          if (key === destinationKey) {
            continue;
          }
          const element = modulesByKey[key];
          if (element.outputs.includes(destinationKey)) {
            module.memory[key] = PULSES.LOW;
          }
        }
      }
      if (inputKey) {
        module.memory[inputKey] = pulseType;
      }

      // If ALL are high, send low, else send high
      addToQueue(
        Object.values(module.memory).some((el) => el === PULSES.LOW) ? PULSES.HIGH : PULSES.LOW,
        module.outputs,
        destinationKey
      );
    } else {
      throw Error("Module type not implemented?");
    }
  }

  function addToQueue(type, destinationKeys, fromKey) {
    destinationKeys.forEach((destinationKey) => {
      queue.push({ type, destinationKey, fromKey });
    });
  }
}

export function partTwo(input = null) {
  var input = input || inputPath + "2";
  input = fs.readFileSync(input, "utf8");
  const modulesByKey = parseInput(input);

  const queue = [];

  /**
   * The input into rx is zr.
   * zr has 4 inputs, which suggests 4 cyclic loops, and then look for LCM of these.
   * So for each of gc, sz, cm and xf, find the number of times until it is 0.
   */

  let cycles = {
    gc: null,
    sz: null,
    cm: null,
    xf: null,
  };

  let cyclesFoundCount = {
    gc: 0,
    sz: 0,
    cm: 0,
    xf: 0,
  };

  let presses = 0;
  while (Object.values(cyclesFoundCount).some((v) => v < 5)) {
    // Start the queue with a button press each cycle
    presses++;
    queue.push({ type: PULSES.LOW, destinationKey: "broadcaster", fromKey: null });
    while (queue.length) {
      let next = queue.shift();
      sendPulse(next.type, next.destinationKey, next.fromKey);
    }
  }

  console.log({ day: 20, part: 2, value: lcmOfArray(Object.values(cycles)) });

  function sendPulse(pulseType, destinationKey, inputKey) {
    // Bunch of if statements to handle each one.
    const module = modulesByKey[destinationKey];

    if (!module) {
      return; // Untyped module, skip?
    }

    if (module.type === MODULE_TYPES.BROADCASTER) {
      // Send to all children by adding them to the queue in order
      addToQueue(pulseType, module.outputs, destinationKey);
    } else if (module.type === MODULE_TYPES.FLIP_FLOP) {
      // Flip-flop modules we only really care about low pulse being recieved
      if (pulseType === PULSES.LOW) {
        // If currently on, turn off and send low pulse
        if (module.state) {
          module.state = 0;
          addToQueue(PULSES.LOW, module.outputs, destinationKey);
        } else {
          // If off, turn on and send high pulse
          module.state = 1;
          addToQueue(PULSES.HIGH, module.outputs, destinationKey);
        }
      }
    } else if (module.type === MODULE_TYPES.CONJUNCTION) {
      // Conjunction modules (prefix &) remember the type of the most recent pulse received from each of their connected input modules;
      // they initially default to remembering a low pulse for each input. When a pulse is received, the conjunction module first updates
      // its memory for that input. Then, if it remembers high pulses for all inputs, it sends a low pulse; otherwise, it sends a high
      // pulse.

      // If null, then we use defaults of low for each input.
      // First time we see this node, determine inputs and set up the memory
      if (module.memory === null) {
        module.memory = {};
        // First build input module if doesnt exist
        for (const key in modulesByKey) {
          if (key === destinationKey) {
            continue;
          }
          const element = modulesByKey[key];
          if (element.outputs.includes(destinationKey)) {
            module.memory[key] = PULSES.LOW;
          }
        }
      }
      if (inputKey) {
        module.memory[inputKey] = pulseType;
      }

      let pulse = Object.values(module.memory).some((el) => el === PULSES.LOW) ? PULSES.HIGH : PULSES.LOW;

      // Make some assumptions that these are all cycles 🥴
      if (destinationKey in cycles && pulse === PULSES.HIGH) {
        cyclesFoundCount[destinationKey]++;
        if (cyclesFoundCount[destinationKey] > 1) {
          // Check that this is cyclic. We'll check the first 5 just to at least not pluck the assumption out of thin air!
          console.assert(presses === cyclesFoundCount[destinationKey] * cycles[destinationKey]);
        } else {
          cycles[destinationKey] = presses;
        }
      }

      // If ALL are high, send low, else send high
      addToQueue(pulse, module.outputs, destinationKey);
    } else {
      throw Error("Module type not implemented?");
    }
  }

  function addToQueue(type, destinationKeys, fromKey) {
    destinationKeys.forEach((destinationKey) => {
      queue.push({ type, destinationKey, fromKey });
    });
  }
}

function parseInput(input) {
  return input
    .trim()
    .split("\n")
    .reduce((accum, line) => {
      let [module, destModules] = line.split(" -> ");
      if (module === "broadcaster") {
        accum[module] = {
          type: MODULE_TYPES.BROADCASTER,
          outputs: destModules.split(", "),
          state: null,
        };
      } else {
        accum[module.slice(1)] = {
          type: module.slice(0, 1),
          outputs: destModules.split(", "),
          state: null,
          memory: null,
        };
      }
      return accum;
    }, {});
}

function gcd(num1, num2) {
  //if num2 is 0 return num1;
  if (num2 === 0) {
    return num1;
  }

  //call the same function recursively
  return gcd(num2, num1 % num2);
}

function lcm(num1, num2) {
  return (num1 * num2) / gcd(num1, num2);
}

function lcmOfArray(arr) {
  let result = arr[0];

  for (let i = 1; i < arr.length; i++) {
    result = lcm(result, arr[i]);
  }

  return result;
}
