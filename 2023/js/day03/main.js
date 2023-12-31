import fs from "fs";

const inputPath = "./day03/example-input";

export function partOne() {
  var input = fs.readFileSync(inputPath, "utf8");
  var inputArray = input.trim().split("\n");

  const numbersToUse = [];

  for (let rowIndex = 0; rowIndex < inputArray.length; rowIndex++) {
    let line = inputArray[rowIndex];
    // Go through and find a number
    let matches = line.matchAll(/\d+/g);

    [...matches].forEach((match) => {
      let hasSymbol = false;
      let digitIndex = 0;
      // Split number to array of digits:
      let digits = match[0].split("");
      // For each digit of the number, check the surrounding coordinates for a symbol, until we have either found one, or run out of digits.
      while (!hasSymbol && digitIndex < digits.length) {
        // Get the coordinates surrounding the digit:
        const coordinates = getCoordinatesAroundPoint(
          rowIndex,
          match.index + digitIndex,
          inputArray.length,
          line.length
        );
        // Check if any of these coordinates have a symbol:
        for (const coordinate of coordinates) {
          if (inputArray[coordinate[0]][coordinate[1]].match(/[^\s\d\.\w]/)) {
            hasSymbol = true;
            break;
          }
        }
        digitIndex++;
      }
      // If we have found a symbol, add the number to the list:
      if (hasSymbol) {
        numbersToUse.push(Number(match[0]));
        return;
      }
    });
  }

  // We could sum as we go, but this helps with debugging, so reduce the array to a sum:
  console.log({ day: 3, part: 1, value: numbersToUse.reduce((a, b) => a + b, 0) });
}

export function partTwo() {
  var input = fs.readFileSync(inputPath, "utf8");
  var inputArray = input.trim().split("\n");

  const gearRatios = [];

  // We now need to find any * characters, and check if they are surrounded by numbers. If they are surrounded by MORE THAN ONE, store these numbers
  for (let rowIndex = 0; rowIndex < inputArray.length; rowIndex++) {
    let line = inputArray[rowIndex];
    // Get the *'s on this line:
    let matches = line.matchAll(/\*/g);

    [...matches].forEach((match) => {
      const numbersByFirstCoordinate = {};
      // Get the coordinates surrounding the *:
      const coordinates = getCoordinatesAroundPoint(rowIndex, match.index, inputArray.length, line.length);
      // Check if any of these coordinates have a number:
      for (const coordinate of coordinates) {
        if (inputArray[coordinate[0]][coordinate[1]].match(/\d/)) {
          // If we have a digit, we need to get the full number from it by going left and right until there is not a digit:
          let leftDigitIndex = coordinate[1] - 1;
          let number = inputArray[coordinate[0]][coordinate[1]];
          // Go left:
          while (leftDigitIndex >= 0 && inputArray[coordinate[0]][leftDigitIndex].match(/\d/)) {
            number = inputArray[coordinate[0]][leftDigitIndex].toString() + number.toString();
            leftDigitIndex--;
          }
          // Go right:
          let rightDigitIndex = coordinate[1] + 1;
          while (rightDigitIndex < line.length && inputArray[coordinate[0]][rightDigitIndex].match(/\d/)) {
            number = number.toString() + inputArray[coordinate[0]][rightDigitIndex].toString();
            rightDigitIndex++;
          }

          // If this number is not already in the list, add it:
          if (
            !numbersByFirstCoordinate.hasOwnProperty(coordinate[0].toString() + "," + (leftDigitIndex + 1).toString())
          ) {
            numbersByFirstCoordinate[coordinate[0].toString() + "," + (leftDigitIndex + 1).toString()] = Number(number);
          }
        }
      }
      // if there are exactly two numbers, add their product to the list:
      if (Object.keys(numbersByFirstCoordinate).length === 2) {
        gearRatios.push(
          numbersByFirstCoordinate[Object.keys(numbersByFirstCoordinate)[0]] *
            numbersByFirstCoordinate[Object.keys(numbersByFirstCoordinate)[1]]
        );
      }
    });
  }

  console.log({ day: 3, part: 2, value: gearRatios.reduce((a, b) => a + b, 0) });
}

/**
 *
 * @param {int} i The Row Index
 * @param {int} j The Column Index
 * @param {int} maxI The maximum row index
 * @param {int} maxJ The maximum column index
 * @returns The coordinates around the point, not as (x,y) but as (row,col)
 */
function getCoordinatesAroundPoint(i, j, maxI, maxJ) {
  const coordinates = [];
  // 8 Possible coordinates around a point, loop these and check if they are valid:
  for (let rowIndex = i - 1; rowIndex <= i + 1; rowIndex++) {
    for (let colIndex = j - 1; colIndex <= j + 1; colIndex++) {
      // If the coordinate is valid, add it to the list:
      coordinates.push([rowIndex, colIndex]);
    }
  }

  // Filter out invalid coordinates (itself, or out of bounds)
  return coordinates
    .filter((coordinate) => coordinate[0] >= 0 && coordinate[0] < maxI && coordinate[1] >= 0 && coordinate[1] < maxJ)
    .filter((coordinate) => !(coordinate[0] === i && coordinate[1] === j));
}
