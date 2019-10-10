/**
 * Data for random piece algorithms
 */
class Randomizer {
  function: Function;
  /**
   * Constructs the randomizer
   * @param {string} shortName The internal name for the generator
   * @param {string} longName The display name for the generator
   * @param {string} description A description of the generator
   * @param {Function} funct The generator function the randomizer uses
   */
  constructor(
    shortName: string,
    longName: string,
    description: string,
    funct: Function,
  ) {
    this.function = funct;
  }
}
/**
 * The currently used randomizers
 */
class CurrentRandomizer {
  pieceSet: string[];
  startingSet: string[];
  private generator: Generator;
  /**
   * Create the current randomizer
   */
  constructor() {
    this.pieceSet;
    this.startingSet;
    this.generator;
  }
  /**
   * Change to a new randomizer
   * @param {Randomizer} randomizer The randomizer to use
   */
  assignRandomizer(randomizer: Randomizer) {
    this.generator = randomizer.function();
  }
  /**
   * Run through the randomizer to the next YIELD
   * @return {string} The next piece in the sequence
   */
  next(): string {
    return this.generator.next().value;
  }
  /**
   * Creates a sequence of a select amount of pieces (or 100 by default)
   * and prints it to the console
   * @param {number} amount The amount of pieces to generate
   */
  runTest(amount: number = 100) {
    let resultString = '';
    for (let i = 0; i < amount; i++) {
      resultString += `${this.next()} `;
    }
    console.log(resultString);
  }
}
const currentRandomizer = new CurrentRandomizer();
currentRandomizer.pieceSet = PIECE_SETS.TETROMINO;
currentRandomizer.startingSet = PIECE_SETS.STARTING_TETRO;

const RANDOMIZERS = {
  MEMORYLESS: new Randomizer(
    'MEMORYLESS',
    'Memoryless',
    'Produces pieces with no regard to the previous piece history',
    function*() {
      let pieces = currentRandomizer.startingSet;
      yield pieces[Math.floor(Math.random() * pieces.length)];
      pieces = currentRandomizer.pieceSet;
      while (true) {
        yield pieces[Math.floor(Math.random() * pieces.length)];
      }
    },
  ),
  SEVEN_BAG: new Randomizer(
    'SEVEN_BAG',
    'Seven Bag',
    'Generates all the possible pieces in individual groups',
    function*() {
      let pieces = currentRandomizer.startingSet;
    },
  ),
};
