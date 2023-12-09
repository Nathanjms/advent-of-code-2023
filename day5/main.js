import fs from "fs";
import Almanac from "./Almanac.js";

const inputPath = "./day5/example-input";

export function partOne() {
  var input = fs.readFileSync(inputPath, "utf8");

  const almanac = new Almanac(input);

  console.log(almanac.getSeedNumbers());
  console.log(almanac.getValuesInMap("seed-to-soil map:"));
  console.log(almanac.getValueOfCategory('seed', 50, 'soil'));

  let sum = 0;

  console.log("sum :", sum);
}

export function partTwo() {
  var input = fs.readFileSync(inputPath, "utf8");

  console.log("sum :", 0);
}

function getSeedNumbers(lineZero) {
  return [...lineZero.matchAll(/\d+/g)].map((match) => Number(match[0]));
}